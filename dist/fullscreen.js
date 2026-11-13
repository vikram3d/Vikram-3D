(() => {
  const consoleBox=document.querySelector('.project-console');
  const slot=document.querySelector('.console-slot');
  const lab=document.querySelector('.cartridge-lab');
  if(consoleBox && slot && lab){
    const placeSlot=()=>{
      if(innerWidth<=700){slot.style.removeProperty('top');slot.style.removeProperty('left');slot.style.removeProperty('transform');return;}
      const box=consoleBox.getBoundingClientRect(),area=lab.getBoundingClientRect();
      slot.style.left=(box.left-area.left+(box.width-slot.offsetWidth)/2)+'px';
      slot.style.top=(box.top-area.top-slot.offsetHeight+4)+'px';slot.style.transform='none';
    };
    const consoleObserver=new ResizeObserver(placeSlot);consoleObserver.observe(consoleBox);consoleObserver.observe(lab);
    window.addEventListener('resize',placeSlot);document.fonts?.ready.then(placeSlot);
    window.addEventListener('pagehide',()=>consoleObserver.disconnect());
    window.addEventListener('pageshow',()=>{consoleObserver.observe(consoleBox);consoleObserver.observe(lab);placeSlot();});
    placeSlot();
  }
  const stage=document.querySelector('.depth-stage');
  if(!stage)return;
  const root=stage.closest('[data-depth-carousel]');
  const cards=[...stage.querySelectorAll('[data-depth-card]')];
  let frame=0,lastWidth=0,lastMinHeight=0;
  function fit(){
    frame=0;
    if(!root.classList.contains('is-ready'))return;
    const stageWidth=stage.clientWidth;
    const limit=Math.max(180,Math.min(760,stageWidth*(innerWidth>850?.74:.9)));
    const minimum=Math.min(limit,240);
    let width=limit;
    root.style.setProperty('--fit-card-width',width+'px');
    // Keep readable text sizes; let the panel grow if the narrowest card is taller.
    stage.style.minHeight='0px';
    const available=stage.clientHeight;
    let height=Math.max(...cards.map(card=>card.offsetHeight));
    while(height>available-28 && width>minimum+1){
      width=Math.max(minimum,width-12);
      root.style.setProperty('--fit-card-width',width+'px');
      height=Math.max(...cards.map(card=>card.offsetHeight));
    }
    const minHeight=Math.max(available,Math.ceil(height+28));
    stage.style.minHeight=minHeight+'px';
    if(Math.abs(width-lastWidth)>1 || Math.abs(minHeight-lastMinHeight)>1){
      lastWidth=width;lastMinHeight=minHeight;
      window.ScrollTrigger?.refresh();
    }
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(fit);};
  const observer=new ResizeObserver(schedule);observer.observe(stage);
  cards.forEach(card=>observer.observe(card.querySelector('.depth-card-copy')));
  document.fonts?.ready.then(schedule);
  stage.querySelectorAll('img').forEach(img=>img.addEventListener('load',schedule,{once:true}));
  window.addEventListener('resize',schedule);
  window.addEventListener('pageshow',()=>{observer.observe(stage);cards.forEach(card=>observer.observe(card.querySelector('.depth-card-copy')));schedule();});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;observer.disconnect();});
  schedule();
})();
