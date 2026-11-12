import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

export function createRoom(container, status) {
  const accent = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35)); renderer.setClearColor(0x080b0d);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement); renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', 'Interactive Corvette. Drag to orbit, scroll to zoom, or focus this view and use WASD to move.');
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x080b0d, 15, 38);
  const camera = new THREE.PerspectiveCamera(42, 1, .05, 60); camera.position.set(4, 2.5, 6);
  const controls = new OrbitControls(camera, renderer.domElement); controls.target.set(0, .85, 0);
  controls.enableDamping = true; controls.dampingFactor = .08; controls.minDistance = 2.4; controls.maxDistance = 18; controls.maxPolarAngle = Math.PI * .485; controls.update();
  scene.add(new THREE.HemisphereLight(0xd7e7f1, 0x17232c, 1.5));
  for (const [color, power, position] of [[0xffffff, 3.5, [-3,6,5]], [accent,2.2,[5,3,-4]], [0xe0edff,2,[-5,2,-3]]]) { const light = new THREE.DirectionalLight(color,power); light.position.set(...position); scene.add(light); }
  const studio = new THREE.Scene(); studio.background = new THREE.Color(0x252b2e);
  const panelGeometry = new THREE.PlaneGeometry(10,5), panelMaterial = new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide});
  for (const [x,y,z,rx,ry] of [[-6,4,0,0,Math.PI/2],[3,6,-4,Math.PI/4,0],[1,2,6,0,Math.PI]]) { const panel=new THREE.Mesh(panelGeometry,panelMaterial);panel.position.set(x,y,z);panel.rotation.set(rx,ry,0);studio.add(panel); }
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.025);scene.environment=environment.texture;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(70,70),new THREE.MeshStandardMaterial({color:0x10191d,roughness:.65,metalness:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-.015;scene.add(floor);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const context=shadowCanvas.getContext('2d');
  const gradient=context.createRadialGradient(64,64,16,64,64,64);gradient.addColorStop(0,'#000d');gradient.addColorStop(1,'#0000');context.fillStyle=gradient;context.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas),shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.6,8),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.002;scene.add(shadow);
  const grid=new THREE.GridHelper(34,34,0x29434d,0x18262d);grid.position.y=-.009;grid.material.transparent=true;grid.material.opacity=.25;scene.add(grid);
  const abort=new AbortController(),keys=new Set();
  let model,disposed=false,frame=0,visible=true,traveling=false,previousTime=0,wireframe=false,viewIndex=0;
  const cameraGoal=camera.position.clone(),targetGoal=controls.target.clone(),views=[[4,2.5,6],[6,1.8,0],[0,1.6,7]];
  const buttons=[...document.querySelectorAll('[data-station]')],resetButton=document.getElementById('scene-reset'),wireButton=document.getElementById('scene-wireframe');
  const requestFrame=()=>{if(!disposed&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);};
  const positionForView=index=>new THREE.Vector3(...views[index]).sub(targetGoal).multiplyScalar(Math.max(1,1.35/Math.max(.65,camera.aspect))).add(targetGoal);
  const chooseView=index=>{viewIndex=index;targetGoal.set(0,.85,0);cameraGoal.copy(positionForView(index));traveling=true;buttons.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});requestFrame();};
  const handlers=buttons.map((button,index)=>{const handler=()=>chooseView(index);button.addEventListener('click',handler);return handler;});
  const reset=()=>chooseView(0);resetButton.addEventListener('click',reset);
  const toggleWireframe=()=>{if(!model)return;wireframe=!wireframe;model.traverse(object=>{if(object.isMesh)for(const material of Array.isArray(object.material)?object.material:[object.material])material.wireframe=wireframe;});wireButton.setAttribute('aria-pressed',String(wireframe));requestFrame();};
  wireButton?.addEventListener('click',toggleWireframe);
  const startControl=()=>{traveling=false;requestFrame();};controls.addEventListener('start',startControl);controls.addEventListener('change',requestFrame);
  const keyDown=event=>{if(document.activeElement!==renderer.domElement||!['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();keys.add(event.key.toLowerCase());traveling=false;requestFrame();};
  const keyUp=event=>keys.delete(event.key.toLowerCase()),clearKeys=()=>keys.clear();renderer.domElement.addEventListener('keydown',keyDown);document.addEventListener('keyup',keyUp);window.addEventListener('blur',clearKeys);
  const direction=new THREE.Vector3(),side=new THREE.Vector3();
  function render(time){
    frame=0;if(disposed||document.hidden||!visible)return;
    const dt=Math.min((time-previousTime)/1000||.016,.05);previousTime=time;
    if(traveling){camera.position.lerp(cameraGoal,.13);controls.target.lerp(targetGoal,.13);if(camera.position.distanceToSquared(cameraGoal)<.0002){camera.position.copy(cameraGoal);controls.target.copy(targetGoal);traveling=false;}}
    if(keys.size){camera.getWorldDirection(direction);direction.y=0;direction.normalize();side.crossVectors(direction,camera.up).normalize();const forward=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'));const lateral=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));direction.multiplyScalar(forward*dt*2);side.multiplyScalar(lateral*dt*2);camera.position.add(direction).add(side);controls.target.add(direction).add(side);}
    const changed=controls.update();renderer.render(scene,camera);if(traveling||changed||keys.size)requestFrame();
  }
  const resize=()=>{if(disposed)return;const width=container.clientWidth,height=Math.max(1,container.clientHeight);renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();camera.position.copy(positionForView(viewIndex));cameraGoal.copy(camera.position);traveling=false;controls.update();requestFrame();};
  const size=new ResizeObserver(resize);size.observe(container);resize();
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else requestFrame();});intersection.observe(container);
  const onVisibility=()=>{clearKeys();if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestFrame();};document.addEventListener('visibilitychange',onVisibility);
  const disposeTree=tree=>tree.traverse(object=>{object.geometry?.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material]){if(!material)continue;for(const value of Object.values(material))if(value?.isTexture)value.dispose();material.dispose();}});
  const lost=event=>{event.preventDefault();cleanup();status.hidden=false;status.textContent='The 3D view was interrupted. Close and reopen the Playground to retry.';};renderer.domElement.addEventListener('webglcontextlost',lost);
  status.hidden=false;status.textContent='Loading the Corvette studio…';
  fetch(new URL('./assets/car/car.glb',import.meta.url),{signal:abort.signal})
    .then(response=>{if(!response.ok)throw Error('Car model request failed');return response.arrayBuffer();})
    .then(buffer=>new GLTFLoader().parseAsync(buffer,new URL('./assets/car/',import.meta.url).href))
    .then(gltf=>{if(disposed){disposeTree(gltf.scene);return;}model=gltf.scene;const extent=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());model.scale.setScalar(6/Math.max(extent.x,extent.y,extent.z));const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3());model.position.x-=center.x;model.position.z-=center.z;model.position.y-=box.min.y;scene.add(model);status.hidden=true;if(wireButton)wireButton.disabled=false;requestFrame();})
    .catch(error=>{if(disposed||error.name==='AbortError')return;cleanup();status.hidden=false;status.textContent='The interactive model could not load. This is a static preview of the car scene.';console.warn('Car Playground:',error.message);});
  requestFrame();
  function cleanup(){
    if(disposed)return;disposed=true;abort.abort();cancelAnimationFrame(frame);clearKeys();size.disconnect();intersection.disconnect();controls.removeEventListener('start',startControl);controls.removeEventListener('change',requestFrame);controls.dispose();
    buttons.forEach((button,i)=>button.removeEventListener('click',handlers[i]));resetButton.removeEventListener('click',reset);wireButton?.removeEventListener('click',toggleWireframe);renderer.domElement.removeEventListener('keydown',keyDown);renderer.domElement.removeEventListener('webglcontextlost',lost);document.removeEventListener('keyup',keyUp);document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('blur',clearKeys);
    disposeTree(scene);environment.dispose();pmrem.dispose();panelGeometry.dispose();panelMaterial.dispose();renderer.dispose();renderer.domElement.remove();
  }
  return cleanup;
}
