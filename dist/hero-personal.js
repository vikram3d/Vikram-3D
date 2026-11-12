(() => {
  'use strict';
  const role = document.querySelector('[data-hero-role]');
  if (!role || typeof role.animate !== 'function') return;
  const roles = ['3D ARTIST', 'MOTION DESIGNER', 'BLENDER ARTIST'];
  function renderRole(index) {
    const split = roles[index].lastIndexOf(' ');
    const word = document.createElement('span');
    word.className = 'hero-role-accent';
    word.textContent = roles[index].slice(split + 1);
    role.replaceChildren(document.createTextNode(roles[index].slice(0, split + 1)), word);
  }
  const toggle = document.getElementById('motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true, ready = false, timer, animation, index = 0, generation = 0;
  const enabled = () => ready && visible && !document.hidden && !reduced.matches && toggle?.getAttribute('aria-pressed') !== 'false';
  function stop() { clearTimeout(timer); generation++; animation?.cancel(); animation = undefined; }
  function schedule() {
    stop();
    if (!enabled()) {
      if (reduced.matches || toggle?.getAttribute('aria-pressed') === 'false') {index = 0;renderRole(index);}
      return;
    }
    const current = generation;
    timer = setTimeout(async () => {
      if (!enabled()) return;
      try {
        animation = role.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:240,easing:'ease-in',fill:'forwards'});
        await animation.finished;
        if (generation !== current || !enabled()) return;
        animation.cancel();
        index = (index + 1) % roles.length;renderRole(index);
        animation = role.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:440,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
        await animation.finished;
        if (generation !== current) return;
        animation.cancel();animation = undefined;schedule();
      } catch { /* A preference or visibility change cancels the transition. */ }
    },4200);
  }
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting;schedule();}).observe(role.closest('.hero'));
  const preference = new MutationObserver(schedule);
  if(toggle)preference.observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
  reduced.addEventListener('change',schedule);
  document.addEventListener('visibilitychange',schedule);
  window.addEventListener('pagehide',stop);
  window.addEventListener('pageshow',schedule);
  Promise.resolve(window.portfolioIntroReady).then(() => {ready = true;schedule();});
})();
