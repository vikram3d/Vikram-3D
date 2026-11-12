(() => {
  const header = document.querySelector('.header');
  if (!header) return;
  const menu = header.querySelector('.mobile-nav');
  let frame = 0;
  let lastY = Math.max(0, scrollY);
  let direction = 0;
  let distance = 0;

  function reveal() {
    header.classList.remove('is-hidden');
    direction = 0;
    distance = 0;
  }

  function sync() {
    frame = 0;
    const y = Math.max(0, Math.min(scrollY, document.documentElement.scrollHeight - innerHeight));
    const delta = y - lastY;
    lastY = y;
    header.classList.toggle('is-scrolled', y > 40);

    if (y <= header.offsetHeight + 32 || menu?.open || header.contains(document.activeElement)) {
      reveal();
      return;
    }

    const nextDirection = Math.sign(delta);
    if (!nextDirection) return;
    if (nextDirection !== direction) {
      direction = nextDirection;
      distance = 0;
    }
    distance += Math.abs(delta);
    if (distance >= 12) {
      header.classList.toggle('is-hidden', direction > 0);
      distance = 0;
    }
  }
  function onScroll() { if (!frame) frame = requestAnimationFrame(sync); }
  function reset() {
    cancelAnimationFrame(frame);
    lastY = Math.max(0, scrollY);
    reveal();
    sync();
  }
  sync();
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('pageshow', reset);
  window.addEventListener('resize', reset);
  header.addEventListener('focusin', reveal);
  header.addEventListener('focusout', onScroll);
  menu?.addEventListener('toggle', () => { if (menu.open) reveal(); });
  window.addEventListener('pagehide', () => {cancelAnimationFrame(frame);frame=0;});
})();
