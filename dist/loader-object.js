import * as THREE from './vendor/three.module.js';

// Original procedural meshes and shading, inspired by OriginKit's Coin Loader.
// https://www.originkit.dev/components/coin-loader — no external model or texture.
export function createLoaderObject(canvas) {
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.75));
  renderer.setClearColor(0x080808,0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36,1,.1,20);
  camera.position.set(0,0,7.3);
  const sculpture = new THREE.Group();
  sculpture.rotation.set(.43,-.32,-.24); scene.add(sculpture);
  const material = new THREE.ShaderMaterial({
    vertexShader:`varying vec3 vNormal; varying vec3 vPosition;
      void main(){vec4 p=modelViewMatrix*vec4(position,1.0);vNormal=normalize(normalMatrix*normal);vPosition=p.xyz;gl_Position=projectionMatrix*p;}`,
    fragmentShader:`varying vec3 vNormal; varying vec3 vPosition;
      void main(){vec3 n=normalize(vNormal);vec3 r=reflect(normalize(vPosition),n);
        float band=pow(.5+.5*sin(r.y*9.0+r.x*2.5),14.0);
        float panel=pow(max(0.0,dot(r,normalize(vec3(-.5,.7,1.0)))),22.0);
        float rim=pow(1.0-abs(dot(n,normalize(-vPosition))),3.0);
        float shade=.035+.18*max(n.y,0.0)+band*.75+panel*1.4;
        vec3 chrome=vec3(.79,.84,.86)*shade;
        chrome+=vec3(.20,.80,.95)*(rim*.52+pow(max(r.x,0.0),12.0)*.36);
        gl_FragColor=vec4(chrome,1.0);}`
  });
  const profile=[[0,-.12],[.30,-.12],[.35,-.10],[.37,-.06],[.37,.06],[.35,.10],[.30,.12],[0,.12]].map(([x,y])=>new THREE.Vector2(x,y));
  const geometry=new THREE.LatheGeometry(profile,48);
  const coins=Array.from({length:8},(_,i)=>{
    const pivot=new THREE.Group(),mesh=new THREE.Mesh(geometry,material);
    const angle=i*Math.PI/4;
    pivot.position.set(Math.cos(angle)*1.36,Math.sin(angle)*1.36,0);
    mesh.rotation.set(i*.46,0,i*.64);pivot.add(mesh);sculpture.add(pivot);
    return mesh;
  });
  const coreGeometry=new THREE.IcosahedronGeometry(.24,0);
  const coreMaterial=new THREE.MeshBasicMaterial({color:0x83e8f9,wireframe:true,transparent:true,opacity:.65});
  const core=new THREE.Mesh(coreGeometry,coreMaterial);scene.add(core);
  let frame=0,stopped=false,elapsed=0,last=0;
  const resize=()=>{const bounds=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,bounds.width),Math.max(1,bounds.height),false);};
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  const draw=now=>{
    if(stopped)return;
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;elapsed+=dt;
    sculpture.rotation.z=-.24-elapsed*.18;
    sculpture.rotation.y=-.32+Math.sin(elapsed*.4)*.2;
    coins.forEach((coin,i)=>{coin.rotation.x=i*.46+elapsed*.65;coin.rotation.y=elapsed*.45;coin.rotation.z=i*.64+elapsed*.35;});
    core.rotation.set(elapsed*.4,elapsed*.5,0);
    renderer.render(scene,camera);
    canvas.parentElement.classList.add('is-rendered');
    frame=requestAnimationFrame(draw);
  };
  const visibility=()=>{cancelAnimationFrame(frame);last=0;if(!document.hidden&&!stopped)frame=requestAnimationFrame(draw);};
  const lost=event=>{event.preventDefault();canvas.parentElement?.classList.remove('is-rendered');stop();};
  function stop(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',lost);geometry.dispose();material.dispose();coreGeometry.dispose();coreMaterial.dispose();renderer.dispose();}
  document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',lost);
  visibility();return stop;
}
