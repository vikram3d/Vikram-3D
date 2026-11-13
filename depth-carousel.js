(() => {
  'use strict';
  const root = document.querySelector('[data-depth-carousel]');
  if (!root) return;
  const stage = root.querySelector('.depth-stage');
  const cards = [...root.querySelectorAll('[data-depth-card]')];
  const work = root.closest('[data-depth-work]');
  const runway = root.closest('[data-depth-runway]');
  const screenGallery = work.hasAttribute('data-screen-gallery');
  const hint = work.querySelector('[data-depth-hint]');
  const hintArrow = hint?.nextElementSibling;
  const filters = [...work.querySelectorAll('[data-filter]')];
  const dots = [...root.querySelectorAll('[data-depth-dot]')];
  const status = root.querySelector('.depth-status');
  const previous = root.querySelector('[data-depth-prev]');
  const next = root.querySelector('[data-depth-next]');
  const play = root.querySelector('.depth-autoplay');
  const motionButton = document.getElementById('motion-toggle');
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let shown = [...cards], active = 0, autoplay = false, timer, drag, suppressClick = false;
  let hovered = false, focused = false, inView = true;
  const stepDistance = 190;
  let scrollBrowsing = false, pinTop = 0, lastScrollIndex = 0, scrollFrame = 0;
  const reduced = () => systemMotion.matches || motionButton?.getAttribute('aria-pressed') === 'false';

  const scrollOffset = () => pinTop - runway.getBoundingClientRect().top;
  const scrollIndex = offset => Math.max(0, Math.min(shown.length - 1, Math.floor(offset / stepDistance)));
  function configureScroll() {
    scrollBrowsing = !screenGallery && !!runway && !reduced() && shown.length > 1 && innerHeight >= 680 && innerWidth >= 760;
    runway?.classList.toggle('is-scroll-browsing', scrollBrowsing);
    if (hint) hint.textContent = scrollBrowsing ? 'SCROLL OR DRAG TO EXPLORE' : 'DRAG TO EXPLORE';
    if (hintArrow) hintArrow.textContent = scrollBrowsing ? '↕' : '↔';
    if (!scrollBrowsing) return;
    runway.style.setProperty('--depth-scroll-distance', `${(shown.length - 1) * stepDistance}px`);
    pinTop = parseFloat(getComputedStyle(root).top) || 0;
    lastScrollIndex = scrollIndex(scrollOffset());
  }
  function trackScroll() {
    if (!scrollBrowsing || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (!scrollBrowsing) return;
      const index = scrollIndex(scrollOffset());
      if (index === lastScrollIndex) return;
      lastScrollIndex = index;
      if (index !== active) select(index, true, false);
    });
  }

  function stopVideos() {
    cards.forEach(card => {
      const video = card.querySelector('video');
      video?.pause();
      card.querySelector('.project-image')?.classList.remove('is-previewing');
    });
  }
  function schedule() {
    clearTimeout(timer);
    if (!autoplay || reduced() || document.hidden || !inView || hovered || focused || shown.length < 2) return;
    timer = setTimeout(() => { select(active + 1, false); }, 5500);
  }
  function render() {
    const simple = reduced();
    root.classList.toggle('is-reduced', simple);
    const compact = stage.clientWidth < 600;
    cards.forEach(card => {
      const index = shown.indexOf(card);
      card.hidden = index < 0;
      if (index < 0) { card.classList.remove('is-active', 'is-past'); return; }
      const offset = scrollBrowsing ? index - active : (index - active + shown.length) % shown.length;
      const depth = Math.abs(offset);
      const selected = offset === 0;
      card.classList.toggle('is-active', selected);
      card.classList.toggle('is-past', offset < 0);
      card.setAttribute('aria-hidden', String(!selected));
      card.style.zIndex = String(shown.length - depth);
      card.style.opacity = offset < 0 || offset > 4 ? '0' : String(1 - offset * .17);
      card.style.visibility = offset < -1 || offset > 4 || (simple && !selected) ? 'hidden' : 'visible';
      const x = offset * (compact ? 34 : 69);
      const z = depth * (compact ? -115 : -135);
      card.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${selected || simple ? 0 : -7}deg)`;
      card.style.filter = selected || simple ? 'none' : `brightness(${1 - depth * .12}) blur(${depth * .7}px)`;
      card.querySelector('.depth-project-link').tabIndex = selected ? 0 : -1;
      const choose = card.querySelector('.depth-card-select');
      choose.hidden = selected || offset < 0;
      choose.disabled = choose.hidden;
      // Fetch visible stack covers even if their initial markup was lazy.
      if (depth <= 4) card.querySelector('img').loading = 'eager';
    });
    dots.forEach((dot, index) => {
      dot.hidden = !shown.includes(cards[index]);
      dot.setAttribute('aria-pressed', String(cards[index] === shown[active]));
    });
    const selected = shown[active];
    status.textContent = `${String(active + 1).padStart(2,'0')} / ${String(shown.length).padStart(2,'0')} — ${selected.dataset.title}`;
    previous.disabled = next.disabled = shown.length < 2;
    play.disabled = simple || shown.length < 2;
    if (simple) autoplay = false;
    play.setAttribute('aria-pressed', String(autoplay));
    play.setAttribute('aria-label', autoplay ? 'Pause slideshow' : 'Play slideshow');
    play.innerHTML = autoplay ? '<span aria-hidden="true">Ⅱ</span>' : '<span aria-hidden="true">▷</span>';
    schedule();
  }
  function select(index, user = true, syncScroll = user) {
    if (shown.length < 1) return;
    const hadCardFocus = !!document.activeElement?.closest('.depth-card');
    stopVideos();
    active = (index + shown.length) % shown.length;
    if (user) autoplay = false;
    render();
    if (hadCardFocus) stage.focus({preventScroll:true});
    if (syncScroll && scrollBrowsing) {
      const offset = scrollOffset();
      if (offset >= 0 && offset < shown.length * stepDistance) {
        lastScrollIndex = active;
        window.scrollTo({ top: scrollY - offset + (active + .12) * stepDistance, behavior: 'instant' });
      }
    }
  }
  previous.addEventListener('click', () => select(active - 1));
  next.addEventListener('click', () => select(active + 1));
  play.addEventListener('click', () => { autoplay = !autoplay; render(); });
  dots.forEach((dot, index) => dot.addEventListener('click', () => select(shown.indexOf(cards[index]))));
  cards.forEach(card => card.querySelector('.depth-card-select').addEventListener('click', () => select(shown.indexOf(card))));
  filters.forEach(button => button.addEventListener('click', () => {
    stopVideos();
    filters.forEach(filter => { const selected = filter === button; filter.classList.toggle('active',selected); filter.setAttribute('aria-pressed',String(selected)); });
    shown = cards.filter(card => button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter);
    active = 0; autoplay = false; configureScroll(); render();
  }));
  stage.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const keys = {ArrowLeft:active - 1, ArrowRight:active + 1, Home:0, End:shown.length - 1};
    if (!(event.key in keys)) return;
    event.preventDefault(); select(keys[event.key]);
  });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = {id:event.pointerId, x:event.clientX, y:event.clientY, moved:false};
    suppressClick = false;
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) { drag = undefined; return; }
    if (Math.abs(dx) > 12) {
      drag.moved = true; suppressClick = true;
      root.classList.add('is-dragging');
      stage.setPointerCapture(event.pointerId);
    }
  });
  const endDrag = event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const moved = drag.moved;
    drag = undefined;
    root.classList.remove('is-dragging');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (moved && Math.abs(dx) > 35) select(active + (dx < 0 ? 1 : -1));
    if (moved) setTimeout(() => { suppressClick = false; }, 0);
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', () => { drag = undefined; suppressClick = false; root.classList.remove('is-dragging'); });
  stage.addEventListener('click', event => { if (suppressClick) {event.preventDefault();event.stopPropagation();} }, true);
  stage.addEventListener('dragstart', event => event.preventDefault());
  root.addEventListener('pointerenter', () => { hovered = true; schedule(); });
  root.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  root.addEventListener('focusin', () => { focused = true; schedule(); });
  root.addEventListener('focusout', event => { focused = root.contains(event.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopVideos(); schedule(); });
  const updateLayout = () => { configureScroll(); render(); };
  const updatePreference = () => { stopVideos(); updateLayout(); };
  systemMotion.addEventListener('change', updatePreference);
  const preference = new MutationObserver(updatePreference);
  if (motionButton) preference.observe(motionButton, {attributes:true,attributeFilter:['aria-pressed']});
  const size = new ResizeObserver(render); size.observe(stage);
  const visibility = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }); visibility.observe(root);
  window.addEventListener('scroll', trackScroll, { passive: true });
  window.addEventListener('resize', updateLayout);
  window.addEventListener('pagehide', () => {clearTimeout(timer);cancelAnimationFrame(scrollFrame);scrollFrame=0;stopVideos();preference.disconnect();size.disconnect();visibility.disconnect();});
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    if (motionButton) preference.observe(motionButton, {attributes:true,attributeFilter:['aria-pressed']});
    size.observe(stage); visibility.observe(root); updateLayout();
  });
  root.classList.add('is-ready');
  root.setAttribute('aria-roledescription','carousel');
  root.querySelector('.depth-controls').hidden = false;
  updateLayout();
})();
