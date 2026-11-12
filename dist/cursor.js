(() => {
  'use strict';
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('motion-toggle');
  const cursor = document.createElement('div');
  cursor.className = 'theme-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span class="cursor-target"><i class="cursor-corner corner-tl"></i><i class="cursor-corner corner-tr"></i><i class="cursor-corner corner-bl"></i><i class="cursor-corner corner-br"></i></span><span class="cursor-ring"><svg class="scope-geometry" viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle class="scope-dial" cx="50" cy="50" r="44"/><circle class="scope-lens" cx="50" cy="50" r="36"/><circle class="scope-inner" cx="50" cy="50" r="27"/><path class="scope-cross" d="M0 50H43M57 50H100M50 0V43M50 57V100"/><path class="scope-ticks" d="M19 47V53M27 47V53M35 47V53M65 47V53M73 47V53M81 47V53M47 19H53M47 27H53M47 35H53M47 65H53M47 73H53M47 81H53"/><path class="scope-aim" d="M46 50H54M50 46V54"/></svg><span class="cursor-symbol"></span></span><span class="cursor-dot"></span>';
  const ring = cursor.querySelector('.cursor-ring');
  const dot = cursor.querySelector('.cursor-dot');
  const symbol = cursor.querySelector('.cursor-symbol');
  const box = cursor.querySelector('.cursor-target');
  document.body.append(cursor);
  let x = 0, y = 0, ringX = 0, ringY = 0, frame = 0, lastFrame = 0;
  let aimX = 0, aimY = 0;
  let boxX = 0, boxY = 0, boxAimX = 0, boxAimY = 0;
  let visible = false, inside = false, mouse = false, target;

  const enabled = () => fine.matches && !reduced.matches && toggle?.getAttribute('aria-pressed') !== 'false' && !document.hidden && !document.fullscreenElement;
  const nativeTarget = element => element?.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),video,audio,iframe,canvas,#scene-container,[disabled],[aria-disabled="true"]');
  function hide() {
    visible = false;
    cursor.classList.remove('is-visible', 'is-pressed');
    document.documentElement.classList.remove('cursor-active');
    cancelAnimationFrame(frame); frame = 0; lastFrame = 0;
  }
  function draw(now) {
    frame = 0;
    if (!visible) return;
    // Time-based damping feels the same on 60Hz and high-refresh displays.
    const dt = lastFrame ? Math.min(50, now - lastFrame) : 16.67;
    const ease = 1 - Math.exp(-dt / 70);
    lastFrame = now;
    ringX = aimX; ringY = aimY;
    boxX += (boxAimX - boxX) * ease; boxY += (boxAimY - boxY) * ease;
    ring.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`;
    box.style.transform = `translate3d(${boxX}px,${boxY}px,0) translate(-50%,-50%)`;
    if (Math.abs(aimX - ringX) + Math.abs(aimY - ringY) + Math.abs(boxAimX - boxX) + Math.abs(boxAimY - boxY) > .1) frame = requestAnimationFrame(draw);
    else lastFrame = 0;
  }
  function refresh() {
    if (!enabled() || !inside || !mouse || !target || nativeTarget(target)) { hide(); return; }
    // A native modal is in the top layer; keep the decoration in that layer too.
    const modal = document.querySelector('dialog[open]');
    if (modal) {
      const bounds = modal.getBoundingClientRect();
      if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) { hide(); return; }
    }
    const host = modal || document.body;
    if (cursor.parentElement !== host) host.append(cursor);
    if (!visible) {
      ringX = x; ringY = y;
      boxX = x; boxY = y;
      ring.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      box.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    }
    visible = true;
    const link = target.closest('a,button,summary,[role="button"],[role="link"]');
    const drag = !link && target.closest('.depth-stage');
    const bounds = link?.getBoundingClientRect();
    boxAimX = bounds ? bounds.left + bounds.width / 2 : x;
    boxAimY = bounds ? bounds.top + bounds.height / 2 : y;
    box.style.setProperty('--target-width', (bounds ? Math.max(28,bounds.width + 12) : 30) + 'px');
    box.style.setProperty('--target-height', (bounds ? Math.max(28,bounds.height + 12) : 30) + 'px');
    // Keep the scope centered on the pointer; the separate frame locks to links.
    aimX = x;
    aimY = y;
    // Position the reticle with the dot immediately; only its size animates.
    ringX = x; ringY = y;
    ring.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    cursor.classList.toggle('is-link', !!link);
    cursor.classList.toggle('is-drag', !!drag);
    symbol.textContent = drag ? 'DRAG' : link ? 'LOCK' : '';
    dot.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    cursor.classList.add('is-visible');
    document.documentElement.classList.add('cursor-active');
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function pointer(event) {
    mouse = event.pointerType === 'mouse';
    if (!mouse) { inside = false; hide(); return; }
    inside = true; x = event.clientX; y = event.clientY; target = event.target;
    refresh();
  }
  function hitTest() {
    if (!inside || !mouse) return;
    target = document.elementFromPoint(x, y);
    refresh();
  }
  document.addEventListener('pointermove', pointer, {passive:true});
  document.addEventListener('pointerover', pointer, {passive:true});
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') { mouse = false; hide(); return; }
    if (visible) cursor.classList.add('is-pressed');
  }, {passive:true});
  document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'), {passive:true});
  document.addEventListener('pointercancel', hide, {passive:true});
  document.documentElement.addEventListener('pointerleave', () => { inside = false; hide(); });
  document.addEventListener('scroll', hitTest, {passive:true,capture:true});
  document.addEventListener('keydown', event => { if (event.key === 'Tab') { inside = false; hide(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { inside = false; hide(); } });
  document.addEventListener('fullscreenchange', hitTest);
  window.addEventListener('blur', () => { inside = false; hide(); });
  window.addEventListener('pagehide', () => { inside = false; hide(); });
  window.addEventListener('pageshow', () => { inside = false; hide(); });
  fine.addEventListener('change', refresh);
  reduced.addEventListener('change', refresh);
  const preferences = new MutationObserver(hitTest);
  if (toggle) preferences.observe(toggle, {attributes:true,attributeFilter:['aria-pressed']});
  const modals = new MutationObserver(() => {
    if (!document.querySelector('dialog[open]') && cursor.parentElement !== document.body) document.body.append(cursor);
    hitTest();
  });
  document.querySelectorAll('dialog').forEach(dialog => modals.observe(dialog, {attributes:true,attributeFilter:['open']}));
})();
