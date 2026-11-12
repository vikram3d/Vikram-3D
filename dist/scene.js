import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

export function createRoom(container, status) {
  const accent = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x080808);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'Interactive sculpture room. Drag to orbit, scroll to zoom, or use WASD and arrow keys.');
  renderer.domElement.tabIndex = 0;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080808, .035);
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 80);
  camera.position.set(0, 2.8, 7);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.45, 0);
  controls.enableDamping = true; controls.dampingFactor = .065;
  controls.minDistance = 2.2; controls.maxDistance = 16;
  controls.maxPolarAngle = Math.PI * .49;
  controls.enablePan = true;
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x35302b, 2));
  const key = new THREE.DirectionalLight(0xffffff, 5); key.position.set(-3, 7, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(accent, 4); rim.position.set(5, 3, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xb9d2ff, 3); fill.position.set(-4, 1, -3); scene.add(fill);
  // Six simple studio surfaces produce original reflections without external HDR assets.
  const envScene = new THREE.Scene(); envScene.background = new THREE.Color(0x151515);
  const panelGeometry = new THREE.PlaneGeometry(8, 5);
  const panelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  [[-6, 4, 0, 0, Math.PI / 2], [4, 6, -4, Math.PI / 4, 0], [1, 2, 6, 0, Math.PI]].forEach(([x,y,z,rx,ry]) => { const panel = new THREE.Mesh(panelGeometry, panelMaterial); panel.position.set(x,y,z); panel.rotation.set(rx,ry,0); envScene.add(panel); });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(envScene, .04);
  scene.environment = environment.texture;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x101010, roughness: .7, metalness: .3 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.03; scene.add(floor);
  const grid = new THREE.GridHelper(50, 50, 0x37302a, 0x1a1a1a); grid.position.y = -.02; scene.add(grid);
  const stations = [0, 5.5, -5.5];
  const objects = [];
  const chrome = new THREE.Mesh(new THREE.TorusKnotGeometry(.87, .28, 160, 24, 2, 3), new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: .17, metalness: 1 }));
  const ember = new THREE.Mesh(new THREE.TorusKnotGeometry(.8, .23, 160, 20, 2, 5), new THREE.MeshPhysicalMaterial({ color: accent, metalness: .2, roughness: .15, clearcoat: 1, emissive: accent, emissiveIntensity: .17 }));
  const structure = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), new THREE.MeshStandardMaterial({ color: 0xc2c0b6, roughness: .4, metalness: .8, wireframe: true }));
  [chrome, ember, structure].forEach((object, i) => {
    object.position.set(stations[i], 1.75, 0); scene.add(object); objects.push(object);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.38, .3, 64), new THREE.MeshStandardMaterial({ color: 0x292929, roughness: .35, metalness: .65 })); pedestal.position.set(stations[i], .15, 0); scene.add(pedestal);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.38, .012, 8, 80), new THREE.MeshBasicMaterial({ color: i === 1 ? accent : 0x777772 })); ring.rotation.x = Math.PI / 2; ring.position.set(stations[i], .3, 0); scene.add(ring);
  });
  let active = 0, disposed = false, frame = 0, visible = true, traveling = false, lastTime = 0;
  const cameraGoal = new THREE.Vector3(0, 2.8, 7), targetGoal = new THREE.Vector3(0, 1.45, 0);
  const keys = new Set();
  const stationButtons = [...document.querySelectorAll('[data-station]')];
  const selectStation = index => {
    active = index; traveling = true;
    cameraGoal.set(stations[index], 2.8, 7); targetGoal.set(stations[index], 1.45, 0);
    stationButtons.forEach((button, i) => { button.classList.toggle('active', i === index); button.setAttribute('aria-pressed', String(i === index)); });
    status.hidden = true;
  };
  const stationHandlers = stationButtons.map(button => { const handler = () => selectStation(Number(button.dataset.station)); button.addEventListener('click', handler); return handler; });
  selectStation(0);
  const resetButton = document.querySelector('#scene-reset'); const reset = () => selectStation(active); resetButton.addEventListener('click', reset);
  const onKeyDown = event => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(event.key) && !['INPUT','TEXTAREA'].includes(event.target.tagName)) { event.preventDefault(); keys.add(event.key.toLowerCase()); traveling = false; }
  };
  const onKeyUp = event => keys.delete(event.key.toLowerCase());
  const clearKeys = () => keys.clear();
  document.addEventListener('keydown', onKeyDown); document.addEventListener('keyup', onKeyUp); window.addEventListener('blur', clearKeys);
  const onControlStart = () => { traveling = false; }; controls.addEventListener('start', onControlStart);
  const resize = () => { if (disposed) return; const width = container.clientWidth, height = container.clientHeight; renderer.setSize(width, height); camera.aspect = width / Math.max(1,height); camera.updateProjectionMatrix(); };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
  const direction = new THREE.Vector3(), side = new THREE.Vector3();
  function render(time) {
    frame = 0; if (disposed || document.hidden || !visible) return;
    const dt = Math.min((time - lastTime) / 1000 || .016, .05); lastTime = time;
    if (traveling) { camera.position.lerp(cameraGoal, .07); controls.target.lerp(targetGoal, .07); if (camera.position.distanceToSquared(cameraGoal) < .0001) traveling = false; }
    if (keys.size) {
      camera.getWorldDirection(direction); direction.y = 0; direction.normalize(); side.crossVectors(direction, camera.up).normalize();
      let forward = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
      let horizontal = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
      camera.position.addScaledVector(direction, forward * dt * 2.5).addScaledVector(side, horizontal * dt * 2.5);
      controls.target.addScaledVector(direction, forward * dt * 2.5).addScaledVector(side, horizontal * dt * 2.5);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -12,12); camera.position.z = THREE.MathUtils.clamp(camera.position.z,-12,16);
    }
    objects.forEach((object, i) => { object.rotation.y += dt * (.14 + i * .035); object.rotation.z = Math.sin(time * .00025 + i) * .1; });
    controls.update(); renderer.render(scene, camera); frame = requestAnimationFrame(render);
  }
  const restart = () => { if (!disposed && !document.hidden && visible && !frame) { lastTime = 0; frame = requestAnimationFrame(render); } };
  const visibility = () => { clearKeys(); if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else restart(); };
  document.addEventListener('visibilitychange', visibility);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) { cancelAnimationFrame(frame); frame = 0; } else restart(); }); intersection.observe(container);
  const lost = event => { event.preventDefault(); status.hidden = false; status.textContent = '3D rendering paused. Close and reopen the room to retry, or browse the project gallery.'; cleanup(); };
  renderer.domElement.addEventListener('webglcontextlost', lost);
  restart();
  function cleanup() {
    if (disposed) return; disposed = true; cancelAnimationFrame(frame); clearKeys();
    resizeObserver.disconnect(); intersection.disconnect();
    stationButtons.forEach((button,i) => button.removeEventListener('click', stationHandlers[i])); resetButton.removeEventListener('click',reset);
    controls.removeEventListener('start',onControlStart); controls.dispose();
    document.removeEventListener('keydown',onKeyDown); document.removeEventListener('keyup',onKeyUp); document.removeEventListener('visibilitychange',visibility); window.removeEventListener('blur',clearKeys);
    renderer.domElement.removeEventListener('webglcontextlost',lost);
    scene.traverse(object => { object.geometry?.dispose(); if (Array.isArray(object.material)) object.material.forEach(m => m.dispose()); else object.material?.dispose(); });
    environment.dispose(); pmrem.dispose(); panelGeometry.dispose(); panelMaterial.dispose(); renderer.dispose(); renderer.domElement.remove();
  }
  return cleanup;
}
