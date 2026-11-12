(() => {
  const header = document.querySelector('.header');
  if (!header) return;
  let frame = 0;
  function sync() {
    frame = 0;
    header.classList.toggle('is-scrolled', scrollY > 40);
  }
  function onScroll() { if (!frame) frame = requestAnimationFrame(sync); }
  sync();
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('pageshow', sync);
  window.addEventListener('pagehide', () => {cancelAnimationFrame(frame);frame=0;});
})();
