(() => {
  'use strict';
  let resolveReady;
  window.portfolioIntroReady = new Promise(resolve => { resolveReady = resolve; });
  const state = window.portfolioIntro || {};
  const loader = document.getElementById('site-loader');
  if (!state.enabled || !loader || !document.documentElement.classList.contains('intro-pending')) {
    clearTimeout(state.watchdog); loader?.remove(); resolveReady(); return;
  }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const skip = document.getElementById('intro-skip');
  const count = document.getElementById('intro-count');
  const counter = { value: 0 };
  const timers = new Set(), resourceCleanup = [];
  const inertElements = [...document.body.children].filter(element => element !== loader && !['SCRIPT','NOSCRIPT'].includes(element.tagName)).map(element => ({ element, inert: element.inert }));
  let finished = false, exiting = false, nameAnimation, exitAnimation;
  let stopObject = () => {};
  inertElements.forEach(({element}) => { element.inert = true; });
  const wait = milliseconds => new Promise(resolve => {
    const timer = setTimeout(() => { timers.delete(timer); resolve(); }, milliseconds);
    timers.add(timer);
  });
  const drawProgress = () => {
    count.textContent = String(Math.round(counter.value));
    loader.style.setProperty('--intro-progress',counter.value / 100);
  };
  const progress = (value,duration=.8) => {
    if (finished) return;
    if (window.gsap) gsap.to(counter,{value,duration,ease:'power2.out',overwrite:true,onUpdate:drawProgress});
    else { counter.value = value; drawProgress(); }
  };
  function finish() {
    if (finished) return;
    finished = true;
    const restoreFocus = loader.contains(document.activeElement);
    clearTimeout(state.watchdog); timers.forEach(clearTimeout); timers.clear();
    stopObject();
    resourceCleanup.forEach(cleanup => cleanup());
    nameAnimation?.kill(); exitAnimation?.kill(); window.gsap?.killTweensOf(counter);
    motion.removeEventListener('change',onMotionChange);
    window.removeEventListener('pagehide',finish);
    document.documentElement.classList.remove('intro-pending');
    inertElements.forEach(({element,inert}) => { element.inert = inert; });
    try { sessionStorage.setItem('vikram-intro-seen-v1','1'); } catch {}
    loader.remove(); resolveReady();
    if (restoreFocus) document.querySelector('.header .wordmark')?.focus({preventScroll:true});
    window.dispatchEvent(new Event('portfolio:intro-complete'));
    delete window.finishPortfolioIntro;
  }
  window.finishPortfolioIntro = finish;
  function onMotionChange() { if (motion.matches) finish(); }
  motion.addEventListener('change',onMotionChange);
  skip.addEventListener('click',finish);
  window.addEventListener('pagehide',finish,{once:true});
  if (motion.matches) { finish(); return; }

  // Ignore a renderer that loads after skip or the hard timeout.
  const objectReady = import('./loader-object.js').then(({createLoaderObject}) => {
    if (finished) return;
    stopObject = createLoaderObject(document.getElementById('intro-object'));
  }).catch(() => {});
  if (window.gsap) {
    nameAnimation = gsap.timeline()
      .from(loader.querySelector('.intro-orb'), {opacity:0,scale:.9,duration:1.2,ease:'power2.out'}, 0)
      .from(loader.querySelector('.intro-signature'), {opacity:0,y:8,duration:.8,ease:'power2.out'}, .45);
  }

  function imageReady(image) {
    if (image.complete) return Promise.resolve();
    return new Promise(resolve => {
      const cleanup = () => { image.removeEventListener('load',settle); image.removeEventListener('error',settle); };
      const settle = () => { cleanup(); resolve(); };
      resourceCleanup.push(cleanup);
      image.addEventListener('load',settle,{once:true}); image.addEventListener('error',settle,{once:true});
    });
  }
  const resources = [document.fonts?.ready || Promise.resolve(), objectReady];
  const hero = document.getElementById('hero-image');
  if (hero) resources.push(imageReady(hero));
  else {
    const poster = document.querySelector('video[poster]')?.getAttribute('poster') || document.querySelector('main img')?.getAttribute('src');
    if (poster) { const image = new Image(); image.src = poster; resources.push(imageReady(image)); }
  }
  let settled = 0;
  const criticalReady = Promise.all(resources.map(resource => Promise.resolve(resource).catch(() => {}).then(() => { settled++; progress(settled / resources.length * 92, 1.9); })));
  const resourcesOrDeadline = Promise.race([criticalReady,wait(3000)]);
  (async () => {
    await Promise.all([resourcesOrDeadline,wait(2600)]);
    if (finished || exiting) return;
    progress(100,.24);
    await wait(260);
    if (finished) return;
    exiting = true;
    // Reveal the page as the chrome sculpture fades into the black backdrop.
    resolveReady();
    if (window.gsap) {
      exitAnimation = gsap.timeline({onComplete:finish})
        .to(loader.querySelector('.intro-orb'),{opacity:0,scale:1.08,duration:.55,ease:'power2.in'},0)
        .to(loader.querySelector('.intro-signature'),{opacity:0,duration:.3},0)
        .to(loader,{opacity:0,duration:.65,ease:'power2.inOut'},.2);
    } else { loader.classList.add('intro-fallback-exit'); await wait(520); finish(); }
  })().catch(finish);
})();
