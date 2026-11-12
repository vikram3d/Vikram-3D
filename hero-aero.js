const host = document.querySelector('.hero-aero');
if (host) {
  const hero = host.closest('.hero');
  const motion = document.getElementById('motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:600px)');
  const still = () => reduced.matches || motion?.getAttribute('aria-pressed') === 'false';
  let cleanup, fallback, inView = true;

  // A lightweight glass-ribbon fallback also covers WebGPU initialization.
  function createFallback() {
    const canvas = document.createElement('canvas');
    canvas.className = 'aero-fallback';host.prepend(canvas);
    const ctx = canvas.getContext('2d', {alpha:false});
    if (!ctx) return {start(){},stop(){}};
    let frame = 0, last = 0, rendered = 0, time = 2, width = 1, height = 1;
    const seeds = Array.from({length:230},(_,i)=>({
      u:(i*.61803398875)%1, phase:i*2.39996, layer:i%5,
      size:4+(i*7.31)%13, skew:((i*3.67)%1-.5)*.6
    }));
    function paint() {
      ctx.fillStyle='#080808';ctx.fillRect(0,0,width,height);
      for(let layer=4;layer>=0;layer--) {
        ctx.lineWidth=.65;
        for(const shard of seeds) {
          if(shard.layer!==layer)continue;
          const u=(shard.u+time*.012/(1+layer*.2))%1;
          const phase=u*Math.PI*2;
          const px=(u*1.35-.175)*width;
          const bend=Math.sin(phase*.68+layer*1.35+time*.12);
          const py=height*(.46+bend*.18+Math.sin(phase*1.4+layer)*.075)+(Math.sin(shard.phase+time*.4)*18)/(1+layer*.3);
          const size=shard.size/(1+layer*.23)*(mobile.matches?.8:1);
          const angle=Math.cos(phase*.68+layer*1.35+time*.12)*.38+Math.sin(shard.phase+time*.32)*1.1;
          ctx.save();ctx.translate(px,py);ctx.rotate(angle);
          const fade=1/(1+layer*.55);
          const gradient=ctx.createLinearGradient(-size,-size,size,size);
          gradient.addColorStop(0,`rgba(182,245,255,${.05*fade})`);
          gradient.addColorStop(.48,`rgba(84,201,230,${.12*fade})`);
          gradient.addColorStop(1,`rgba(169,139,255,${.1*fade})`);
          ctx.beginPath();ctx.moveTo(-size,-size*.32);ctx.lineTo(size*.65,-size*.42);ctx.lineTo(size,size*.27);ctx.lineTo(-size*.7,size*(.32+shard.skew));ctx.closePath();
          ctx.fillStyle=gradient;ctx.fill();ctx.strokeStyle=`rgba(144,234,255,${.5*fade})`;ctx.stroke();
          ctx.beginPath();ctx.moveTo(-size,-size*.32);ctx.lineTo(-size*.94,-size*.14);ctx.lineTo(-size*.64,size*(.32+shard.skew)+2);ctx.lineTo(size+1,size*.27+1);
          ctx.strokeStyle=`rgba(169,139,255,${.35*fade})`;ctx.stroke();ctx.restore();
        }
      }
      for(let i=0;i<52;i++) {
        const px=((i*.75487766)%1)*width,py=((i*.56984029)%1)*height;
        ctx.strokeStyle=i%7===0?'#a98bff45':'#83e8f925';ctx.lineWidth=.7;
        ctx.beginPath();ctx.moveTo(px-2.3,py);ctx.lineTo(px+2.3,py);ctx.moveTo(px,py-2.3);ctx.lineTo(px,py+2.3);ctx.stroke();
      }
    }
    function fit() {
      width=host.clientWidth;height=host.clientHeight;
      const ratio=Math.min(devicePixelRatio||1,1.25,1400/Math.max(width,1));
      canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));ctx.setTransform(ratio,0,0,ratio,0,0);paint();
    }
    function stop() {cancelAnimationFrame(frame);frame=0;last=0;rendered=0;}
    function tick(now) {
      frame=0;if(!inView||document.hidden||still()||host.dataset.renderer==='webgpu')return;
      if(!rendered||now-rendered>=1000/30){time+=last?Math.min((now-last)/1000,.1):0;last=now;rendered=now;paint();}
      frame=requestAnimationFrame(tick);
    }
    function start() {
      stop();
      if(host.dataset.renderer==='webgpu'){canvas.style.opacity='0';return;}
      canvas.style.opacity='1';fit();
      host.dataset.state=!inView||document.hidden?'paused':still()?'static':'animated';
      if(inView&&!document.hidden&&!still())frame=requestAnimationFrame(tick);
    }
    const sizes=new ResizeObserver(()=>{if(host.dataset.renderer!=='webgpu')start();});sizes.observe(host);
    return {start,stop};
  }
  const sync = () => {fallback?.start();};
  const visibility = new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();});visibility.observe(hero);
  const preferences = new MutationObserver(sync);
  if(motion)preferences.observe(motion,{attributes:true,attributeFilter:['aria-pressed']});
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  const renderer = new MutationObserver(()=>{if(host.dataset.renderer==='webgpu')fallback?.start();});
  renderer.observe(host,{attributes:true,attributeFilter:['data-renderer']});
  Promise.resolve(window.portfolioIntroReady).then(async()=>{
    host.dataset.renderer='canvas';fallback=createFallback();fallback.start();
    if(!('gpu' in navigator))return;
    try {
      const {mountAeroShards}=await import('./aero-shards.js');
      cleanup=mountAeroShards(host,{
        shardColor:'#67ddef',accentColor:'#ae8aff',backgroundColor:'#080808',
        placement:'full',material:'glass',count:mobile.matches?360:720,
        shardSize:1,spread:1,twist:1,billow:1,speed:.65,scale:1,
        depthOfField:.55,glow:0,grain:.04,vignette:.3,
        intro:true,mouseInteraction:true,mouseStrength:.45,parallax:.4,
        markers:'plus',pulseOnClick:true,holdToGather:true,dpr:1,
        onError:()=>{host.dataset.renderer='canvas';fallback.start();}
      });
    } catch {host.dataset.renderer='canvas';fallback.start();}
  });
  window.addEventListener('pagehide',event=>{fallback?.stop();if(!event.persisted)cleanup?.();});
  window.addEventListener('pageshow',sync);
}
