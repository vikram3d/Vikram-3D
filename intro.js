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
  let stopParticles = () => {};
  inertElements.forEach(({element}) => { element.inert = true; });
  const wait = milliseconds => new Promise(resolve => {
    const timer = setTimeout(() => { timers.delete(timer); resolve(); }, milliseconds);
    timers.add(timer);
  });
  const drawProgress = () => {
    count.textContent = String(Math.round(counter.value));
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
    stopParticles();
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

  // Original procedural animation inspired by the reference's white filament sphere.
  // Canvas 2D keeps the intro independent of WebGL and additional downloads.
  function startParticles() {
    const canvas = document.getElementById('intro-particles');
    const context = canvas?.getContext('2d', { alpha: false });
    if (!context) return () => {};
    const tau = Math.PI * 2;
    const smallScreen = matchMedia('(max-width: 600px)').matches;
    const number = smallScreen ? 44 : 56;
    const nodes = Array.from({ length: number }, (_, i) => ({
      theta: i * 2.399963229728653,
      phi: Math.acos(1 - 2 * (i + .5) / number),
      phase: ((i * 127.1) % 97) / 97 * tau,
      speed: .24 + (i % 7) * .025,
      bright: i % 3 !== 0
    }));
    let width = 0, height = 0, frame = 0, previous = 0, stopped = false;
    const started = performance.now();

    function position(node, time, strand = 0) {
      const p = node.phase;
      const angle = node.theta + time * node.speed + .2 * Math.sin(time * 1.7 + p) + .065 * Math.sin(time * 6.3 + p * 3);
      const latitude = node.phi + .18 * Math.sin(time * 1.9 + p * 2) + .05 * Math.sin(time * 7 + p) + strand * .013;
      const radius = 1 + .08 * Math.sin(time * 2.1 + p) + .035 * Math.cos(time * 4 + p * 3);
      const x = radius * Math.sin(latitude) * Math.cos(angle);
      const y = radius * Math.cos(latitude);
      const z = radius * Math.sin(latitude) * Math.sin(angle);
      // A slow tilt makes the surface read as a volume rather than a flat ring.
      const tilt = .28 + Math.sin(time * .17) * .12;
      const rotatedY = y * Math.cos(tilt) - z * Math.sin(tilt);
      const rotatedZ = y * Math.sin(tilt) + z * Math.cos(tilt);
      const perspective = 3.8 / (3.8 - rotatedZ);
      const scale = Math.min(width, height) * .318;
      return {
        x: width / 2 + x * scale * perspective,
        y: height / 2 + rotatedY * scale * perspective,
        z: rotatedZ,
        worldX: x, worldY: rotatedY,
        depth: (rotatedZ + 1.2) / 2.4
      };
    }

    function draw(time) {
      context.fillStyle = '#000';
      context.fillRect(0, 0, width, height);
      const points = nodes.map(node => position(node, time));
      // Each path samples the particle's recent orbit. Several close strands
      // produce the delicate, flowing filaments without accumulating frames.
      nodes.forEach((node, index) => {
        const point = points[index];
        for (let strand = 0; strand < 3; strand++) {
          context.beginPath();
          const samples = smallScreen ? 26 : 36;
          for (let step = 0; step <= samples; step++) {
            const past = time - (step / samples) * (2.2 + strand * .35);
            const trail = position(node, past, strand);
            if (step === 0) context.moveTo(trail.x, trail.y);
            else context.lineTo(trail.x, trail.y);
          }
          context.lineWidth = strand === 0 ? .5 : .3;
          context.strokeStyle = 'rgba(235,241,245,' + ((strand === 0 ? .42 : .13) * (.3 + point.depth * .7)) + ')';
          context.stroke();
        }
      });
      // Local connections move with their particles and gently fade as they part.
      points.forEach((point, index) => {
        let connections = 0;
        for (let j = index + 1; j < points.length && connections < 3; j++) {
          const other = points[j];
          const distance = Math.hypot(point.worldX - other.worldX, point.worldY - other.worldY, point.z - other.z);
          if (distance > .62) continue;
          connections++;
          const opacity = (1 - distance / .62) * .65 * (.35 + point.depth * .65);
          context.strokeStyle = 'rgba(240,244,248,' + opacity + ')';
          context.lineWidth = .55;
          context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(other.x, other.y); context.stroke();
          for (let echo = 1; echo <= 3; echo++) {
            const before = position(nodes[index], time - echo * .16);
            const after = position(nodes[j], time - echo * .16);
            context.strokeStyle = 'rgba(235,241,245,' + opacity * .14 + ')';
            context.lineWidth = .35;
            context.beginPath(); context.moveTo(before.x, before.y); context.lineTo(after.x, after.y); context.stroke();
          }
        }
        if (!nodes[index].bright) return;
        const radius = .4 + point.depth * .45;
        const halo = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 4);
        halo.addColorStop(0, 'rgba(245,250,255,' + (.28 + point.depth * .3) + ')');
        halo.addColorStop(1, 'rgba(245,250,255,0)');
        context.fillStyle = halo;
        context.beginPath(); context.arc(point.x, point.y, radius * 4, 0, tau); context.fill();
        context.fillStyle = 'rgba(250,252,255,' + (.36 + point.depth * .6) + ')';
        context.beginPath(); context.arc(point.x, point.y, radius, 0, tau); context.fill();
      });
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw((performance.now() - started) / 1000 + 8);
    }
    function animate(now) {
      if (stopped) return;
      if (now - previous >= 1000 / 30) {
        draw((now - started) / 1000 + 8); previous = now;
      }
      frame = requestAnimationFrame(animate);
    }
    function visibility() {
      cancelAnimationFrame(frame);
      if (!document.hidden && !stopped) frame = requestAnimationFrame(animate);
    }
    resize();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);
    if (!observer) window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    if (!document.hidden) frame = requestAnimationFrame(animate);
    return () => {
      stopped = true; cancelAnimationFrame(frame); observer?.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('resize', resize);
    };
  }
  try { stopParticles = startParticles(); } catch { /* The text and skip control still work without canvas. */ }

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
  const resources = [document.fonts?.ready || Promise.resolve()];
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
    // Reveal the page as the particle sphere dissolves into the black backdrop.
    resolveReady();
    if (window.gsap) {
      exitAnimation = gsap.timeline({onComplete:finish})
        .to(loader.querySelector('.intro-orb'),{opacity:0,scale:1.08,duration:.55,ease:'power2.in'},0)
        .to(loader.querySelector('.intro-signature'),{opacity:0,duration:.3},0)
        .to(loader,{opacity:0,duration:.65,ease:'power2.inOut'},.2);
    } else { loader.classList.add('intro-fallback-exit'); await wait(520); finish(); }
  })().catch(finish);
})();
