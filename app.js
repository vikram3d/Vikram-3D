(() => {
  'use strict';
  const legacy = location.hash.slice(1);
  if (location.pathname === '/Vikram-3D/' && ['work','about','contact'].includes(legacy)) {
    location.replace('/Vikram-3D/' + legacy + '/Vikram-3D/');
    return;
  }
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff = false;
  try { motionOff = localStorage.getItem('vikram-motion') === 'off'; } catch {}
  const reduced = { get matches() { return systemMotion.matches || motionOff; } };
  let motionContext;
  const heroStage = $('.hero-stage'), heroImage = $('#hero-image');
  const workCarousel = $('[data-depth-carousel]');
  const workStage = workCarousel?.querySelector('.depth-stage');
  const toggle = $('#motion-toggle');

  function refresh() { if (motionContext) window.ScrollTrigger?.refresh(); }
  function setupMotion() {
    if (reduced.matches || !window.gsap || !window.ScrollTrigger || motionContext) return;
    gsap.registerPlugin(ScrollTrigger);
    motionContext = gsap.context(() => {
      if (heroStage) {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.hero-top', { y: 12, opacity: 0, duration: .6 })
          .from('.form-line', { y: 45, opacity: 0, duration: 1 }, '-=.4')
          .from('.motion-line', { y: 40, opacity: 0, duration: .9 }, '-=.9')
          .from('.hero-intro,.hero-bottom', { y: 16, opacity: 0, duration: .7, stagger: .1 }, '-=.6');
      }
      if (workStage) {
        // Animate the stage as a whole; the carousel controls each card's transform.
        gsap.fromTo(workStage, { y: 48, scale: .95, opacity: .52 }, {
          y: 0, scale: 1, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: workCarousel, start: 'top 92%', end: 'top 28%', scrub: .4 }
        });
      }
      $$('[data-reveal]').forEach(heading => {
        const original = heading.innerHTML;
        heading.dataset.originalHtml = original;
        heading.setAttribute('aria-label', original.replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
        heading.innerHTML = original.split(/(<br\s*\/?\s*>)/i).map(part => /<br/i.test(part) ? part : part.replace(/([^<>\s]+)(?![^<]*>)/g, '<span class="reveal-word" aria-hidden="true" style="display:inline-block">$1</span>')).join('');
        gsap.from(heading.querySelectorAll('.reveal-word'), { y: 25, opacity: 0, duration: .8, stagger: .04, ease: 'power3.out', scrollTrigger: { trigger: heading, start: 'top 96%', once: true } });
      });
      $$('.project,.about-copy,.disciplines>div').forEach(element => {
        gsap.from(element, { y: 22, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 98%', once: true } });
      });
    });
    document.fonts?.ready.then(refresh);
  }
  function teardownMotion() {
    motionContext?.revert(); motionContext = undefined;
    $$('[data-original-html]').forEach(h => { h.innerHTML = h.dataset.originalHtml; h.removeAttribute('aria-label'); delete h.dataset.originalHtml; });
    if (heroImage) window.gsap?.set(heroImage, { clearProps: 'transform' });
  }
  Promise.resolve(window.portfolioIntroReady).then(() => { setupMotion(); refresh(); });
  $$('img').forEach(img => img.addEventListener('load', refresh, { once: true }));
  const resetPointer = () => { if (heroImage) window.gsap?.to(heroImage, { x: 0, y: 0, duration: .8, overwrite: true }); };
  heroStage?.addEventListener('pointermove', event => {
    if (!heroImage || reduced.matches || !window.gsap || !matchMedia('(pointer:fine)').matches) return;
    const bounds = heroStage.getBoundingClientRect();
    gsap.to(heroImage, { x: (event.clientX - bounds.left - bounds.width / 2) * .017, y: (event.clientY - bounds.top - bounds.height / 2) * .012, duration: 1.3, ease: 'power2.out', overwrite: true });
  });
  heroStage?.addEventListener('pointerleave', resetPointer);
  window.addEventListener('blur', resetPointer);

  $$('[data-filter]').filter(button => !button.closest('[data-depth-work]')).forEach(button => button.addEventListener('click', () => {
    $$('[data-filter]').forEach(b => { const active = b === button; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    $$('.project').forEach(project => {
      project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
      if (project.hidden) project.querySelector('video')?.pause();
    });
    $('.project-grid')?.classList.toggle('filtered', button.dataset.filter !== 'all');
    refresh();
  }));
  const videos = $$('video');
  videos.forEach(video => video.addEventListener('play', () => { if (!video.paused) videos.forEach(other => { if (other !== video) other.pause(); }); }));
  const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
  let activePreview;
  const hoverPreviews = $$('[data-hover-preview],[data-hover-player]').map(video => ({
    video, inline: video.hasAttribute('data-hover-player'),
    host: video.hasAttribute('data-hover-player') ? video : video.closest('.project-open'),
    frame: video.closest('.project-image'), muted: video.muted, loop: video.loop,
    previewing: false, hovered: false, manual: false, token: 0
  }));
  function stopPreview(record) {
    if (!record) return;
    const wasPreviewing = record.previewing;
    record.previewing = false; record.hovered = false; record.token++;
    record.frame?.classList.remove('is-previewing');
    if (activePreview === record) activePreview = undefined;
    if (!wasPreviewing) return;
    record.video.pause();
    try { record.video.currentTime = 0; } catch {}
    record.video.muted = record.muted; record.video.loop = record.loop;
    if (record.inline) record.video.load();
  }
  const stopHoverPreviews = () => hoverPreviews.forEach(stopPreview);
  hoverPreviews.forEach(record => {
    const {video,host,frame} = record;
    host.addEventListener('pointerenter', event => {
      if (!hoverPointer.matches || reduced.matches || document.hidden || !['mouse','pen'].includes(event.pointerType)) return;
      if (record.inline && !video.paused && !record.previewing) return;
      stopPreview(activePreview);
      videos.forEach(other => { if (other !== video) other.pause(); });
      record.previewing = true; record.hovered = true; record.manual = false;
      activePreview = record;
      const token = ++record.token;
      video.muted = true; video.loop = true;
      if (video.dataset.previewSrc && !video.getAttribute('src')) video.src = video.dataset.previewSrc;
      try { video.currentTime = 0; } catch {}
      video.play().then(() => {
        if (record.token === token && record.hovered && record.previewing) frame?.classList.add('is-previewing');
        else if (!record.previewing && !record.manual) video.pause();
      }).catch(() => { if (record.token === token) stopPreview(record); });
    });
    host.addEventListener('pointerleave', () => stopPreview(record));
    host.addEventListener('pointercancel', () => stopPreview(record));
    video.addEventListener('pause', () => { if (record.previewing && video.paused) stopPreview(record); });
    video.addEventListener('error', () => stopPreview(record));
    if (record.inline) {
      // A deliberate click hands the featured film back to its native controls.
      video.addEventListener('pointerdown', () => {
        if (!record.previewing) return;
        record.previewing = false; record.hovered = false; record.manual = true; record.token++;
        video.muted = record.muted; video.loop = record.loop;
        if (activePreview === record) activePreview = undefined;
      });
    }
  });
  const previewObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) stopPreview(hoverPreviews.find(record => record.host === entry.target)); });
  });
  hoverPreviews.forEach(record => previewObserver.observe(record.host));
  hoverPointer.addEventListener('change', stopHoverPreviews);
  window.addEventListener('blur', stopHoverPreviews);
  $$('[data-play-film]').forEach(button => {
    const video = document.getElementById(button.dataset.playFilm);
    const name = button.getAttribute('aria-label').replace(/^Play /,'');
    button.addEventListener('click', () => { if (video.paused) { videos.forEach(other => { if (other !== video) other.pause(); }); video.play().catch(() => { button.textContent = 'Use player controls'; }); } else video.pause(); });
    const sync = () => { button.textContent = video.paused ? 'Play film ↗' : 'Pause film II'; button.setAttribute('aria-label',(video.paused ? 'Play ' : 'Pause ') + name); };
    video.addEventListener('play',sync); video.addEventListener('pause',sync); video.addEventListener('ended',sync);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopHoverPreviews(); videos.forEach(video => video.pause()); } });

  const updateToggle = () => {
    document.documentElement.classList.toggle('motion-off', reduced.matches);
    toggle.textContent = reduced.matches ? 'MOTION: OFF' : 'MOTION: ON';
    toggle.setAttribute('aria-pressed', String(!reduced.matches));
    toggle.disabled = systemMotion.matches;
    toggle.title = systemMotion.matches ? 'Respects your system reduced motion preference' : 'Toggle motion effects';
  };
  const motionChange = () => { stopHoverPreviews(); teardownMotion(); setupMotion(); updateToggle(); };
  toggle.addEventListener('click', () => { motionOff = !motionOff; try { localStorage.setItem('vikram-motion', motionOff ? 'off' : 'on'); } catch {} motionChange(); });
  updateToggle(); systemMotion.addEventListener('change', motionChange);

  const menu = $('.mobile-nav');
  document.addEventListener('click', event => { if (menu?.open && !menu.contains(event.target)) menu.open = false; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.open) { menu.open = false; menu.querySelector('summary').focus(); } });
  window.addEventListener('pagehide', () => { stopHoverPreviews(); previewObserver.disconnect(); videos.forEach(video => video.pause()); teardownMotion(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { try { motionOff = localStorage.getItem('vikram-motion') === 'off'; } catch {} hoverPreviews.forEach(record => previewObserver.observe(record.host)); setupMotion(); updateToggle(); } });
})();
