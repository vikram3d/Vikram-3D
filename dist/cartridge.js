(() => {
  'use strict';
  const root = document.querySelector('[data-cartridge-gallery]');
  if (!root) return;
  let projects;
  try { projects = JSON.parse(document.getElementById('cartridge-data').textContent); } catch { return; }
  const cards = [...root.querySelectorAll('[data-cartridge]')];
  const video = root.querySelector('#console-film');
  const slot = root.querySelector('.console-slot');
  const loading = root.querySelector('.console-loading');
  const announcer = root.querySelector('#cartridge-status');
  const play = root.querySelector('.console-play');
  const sound = root.querySelector('.console-sound');
  const toggle = document.getElementById('motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => preference.matches || toggle?.getAttribute('aria-pressed') === 'false';
  let active = 0, clipIndex = 0, generation = 0, flight, animation, visible = true;
  root.classList.add('is-ready');
  root.querySelector('.console-actions').hidden = false;
  const stopFlight = () => { animation?.cancel(); animation = undefined; flight?.remove(); flight = undefined; };
  function updatePlayback() {
    const paused = video.paused;
    play.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
    play.querySelector('small').textContent = paused ? 'PLAY' : 'PAUSE';
    play.setAttribute('aria-label', (paused ? 'Play ' : 'Pause ') + projects[active].title + ' film');
  }
  function playFilm() {
    if (!visible || document.hidden) return;
    video.play().catch(() => { announcer.textContent = 'Press Play or use the film controls to start playback.'; updatePlayback(); });
  }
  function setClip(index, autoplay = false) {
    const project = projects[active], clip = project.clips[index];
    clipIndex = index;
    video.pause(); video.poster = '/' + clip.poster;
    video.src = '/' + clip.src; video.loop = true;
    video.setAttribute('aria-label', project.title + ' — ' + clip.label);
    root.querySelectorAll('[data-console-clip]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    if (autoplay) playFilm();
    updatePlayback();
  }
  function commit(autoplay) {
    const project = projects[active];
    root.querySelector('#console-index').textContent = `${String(active + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')} — ${project.label}`;
    root.querySelector('#console-project-title').textContent = project.title;
    root.querySelector('#console-project-summary').textContent = project.summary;
    root.querySelector('#console-project-link').href = '/projects/' + project.id + '/';
    root.querySelector('.loaded-cartridge img').src = '/' + project.poster;
    root.querySelector('.loaded-cartridge span').textContent = 'VIKRAM R / ' + String(active + 1).padStart(2, '0');
    const clips = root.querySelector('#console-clips'); clips.replaceChildren();
    if (project.clips.length > 1) project.clips.forEach((clip, i) => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.consoleClip = String(i);
      button.textContent = clip.label; button.setAttribute('aria-pressed', String(i === 0));
      button.addEventListener('click', () => setClip(i, true)); clips.appendChild(button);
    });
    setClip(0, autoplay);
    loading.hidden = true; root.removeAttribute('aria-busy');
    announcer.textContent = project.title + ' loaded. Use Play to watch, or open the full project.';
  }
  async function select(index, animate = true) {
    const target = (index + projects.length) % projects.length;
    if (target === active && !root.hasAttribute('aria-busy') && animate) { playFilm(); return; }
    const token = ++generation;
    stopFlight(); video.pause(); active = target;
    cards.forEach((card, i) => { card.classList.toggle('is-selected', i === active); card.setAttribute('aria-current', String(i === active)); });
    root.setAttribute('aria-busy', 'true'); loading.hidden = false;
    announcer.textContent = 'Loading ' + projects[active].title;
    if (animate && !reduced() && typeof cards[active].animate === 'function') {
      const start = cards[active].getBoundingClientRect(), destination = slot.getBoundingClientRect();
      flight = cards[active].cloneNode(true); flight.classList.add('cartridge-flight'); flight.classList.remove('is-selected');
      flight.removeAttribute('href'); flight.removeAttribute('aria-current'); flight.removeAttribute('data-cartridge'); flight.removeAttribute('aria-label'); flight.setAttribute('aria-hidden', 'true'); flight.tabIndex = -1;
      flight.style.width = start.width + 'px'; flight.style.minHeight = start.height + 'px';
      document.body.appendChild(flight);
      const x = destination.left + destination.width / 2 - start.width / 2;
      const y = destination.top - start.height * .7;
      const scale = destination.width / start.width * .82;
      animation = flight.animate([
        { transform: `translate(${start.left}px,${start.top}px) rotate(-8deg) scale(1)`, opacity: 1 },
        { offset: .55, transform: `translate(${x}px,${y - 55}px) rotate(0deg) scale(${scale})`, opacity: 1 },
        { offset: .78, transform: `translate(${x}px,${y}px) rotate(0deg) scale(${scale})`, opacity: 1 },
        { transform: `translate(${x}px,${destination.top + 25}px) rotate(0deg) scale(${scale})`, opacity: 0 }
      ], { duration: 1000, easing: 'cubic-bezier(.2,.65,.25,1)', fill: 'forwards' });
      try { await animation.finished; } catch { if (token !== generation) return; }
    }
    if (token !== generation) return;
    stopFlight(); commit(animate);
  }
  cards.forEach((card, index) => {
    card.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault(); select(index);
    });
    card.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? projects.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + projects.length) % projects.length;
      cards[target].focus({ preventScroll: true }); select(target);
    });
  });
  root.querySelector('[data-console-prev]').addEventListener('click', () => select(active - 1));
  root.querySelector('[data-console-next]').addEventListener('click', () => select(active + 1));
  play.addEventListener('click', () => { if (root.hasAttribute('aria-busy')) return; if (video.paused) playFilm(); else video.pause(); });
  sound.addEventListener('click', () => { video.muted = !video.muted; sound.setAttribute('aria-pressed', String(!video.muted)); sound.setAttribute('aria-label', video.muted ? 'Enable film sound' : 'Mute film sound'); });
  ['play', 'pause', 'ended'].forEach(event => video.addEventListener(event, updatePlayback));
  video.addEventListener('error', () => { announcer.textContent = 'The film could not load. Open the full project to try its other player.'; });
  const finishMotion = () => { if (reduced() && root.hasAttribute('aria-busy')) { generation++; stopFlight(); commit(false); } };
  const observer = new MutationObserver(finishMotion); if (toggle) observer.observe(toggle, { attributes: true, attributeFilter: ['aria-pressed'] });
  preference.addEventListener('change', finishMotion);
  const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) video.pause(); }); visibility.observe(root.querySelector('.console-screen'));
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  window.addEventListener('pagehide', () => { generation++; stopFlight(); video.pause(); loading.hidden = true; root.removeAttribute('aria-busy'); });
  window.addEventListener('pageshow', event => { if (event.persisted) { commit(false); } });
  select(0, false);
})();
