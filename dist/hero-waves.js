/* Gradient Waves shader adapted from React Bits, Copyright (c) 2026 David Haz.
 * Source: https://reactbits.dev/r/GradientWaves-JS-CSS.json
 * License: vendor/react-bits-LICENSE.md (MIT + Commons Clause).
 * Portfolio integration and lifecycle are implemented for this static website.
 */
(() => {
'use strict';
const VERTEX = "#version 300 es\nin vec2 aPosition;\nvoid main() {\n  gl_Position = vec4(aPosition, 0.0, 1.0);\n}";
const FRAGMENT = "#version 300 es\nprecision highp float;\nuniform vec2 uResolution;\nuniform float uTime;\nuniform float uClock;\nuniform float uAmplitude;\nuniform float uWaveScale;\nuniform float uWaveRatio;\nuniform float uSwell;\nuniform float uTurbulence;\nuniform float uHeight;\nuniform float uTilt;\nuniform float uZoom;\nuniform vec2 uLook;\nuniform float uFogDepth;\nuniform float uBrightness;\nuniform float uOpacity;\nuniform float uGrain;\nuniform vec3 uHorizon;\nuniform vec3 uWave;\nuniform vec3 uCrest;\nuniform vec3 uBackground;\nuniform float uOpaque;\nuniform float uLight;\nuniform vec3 uSun;\nuniform float uRelief;\nuniform float uSheen;\nuniform float uSteps;\nuniform float uStride;\nuniform vec3 uIntro;\nuniform vec3 uSwells[4];\nuniform float uSwellWidth;\nout vec4 outColor;\n\nconst float FAR = 4000.0;\n\nfloat hash(vec2 p) {\n  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\n  p3 += dot(p3, p3.yzx + 33.33);\n  return fract((p3.x + p3.y) * p3.z);\n}\n\nvec3 surface(vec2 xy) {\n  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);\n  vec4 tc = vec4(uTime / 0.130, uTime / 0.810, uTime / 0.200, uTime / 0.710);\n  float a = xy.x + tc.x;\n  float swellPhase = (xy.y + a) / 20.0 + tc.y;\n  float bend = uSwell * cos(swellPhase) / 20.0;\n  float mx = a + uSwell * sin(swellPhase);\n  float crossPhase = xy.x / 23.0 + tc.w;\n  float my = xy.y - tc.z + uTurbulence * cos(crossPhase);\n  float twist = -uTurbulence * sin(crossPhase) / 23.0;\n  float cx = cos(mx * freq.x);\n  float cy = cos(my * freq.y);\n  float rise = 1.0;\n  if (uIntro.z > 0.0) rise = mix(1.0, smoothstep(uIntro.y * 0.45, uIntro.y * 1.6, xy.x), uIntro.z);\n  float amp = uAmplitude * rise;\n  float h = (sin(mx * freq.x) + sin(my * freq.y)) * amp + uHeight;\n  float dx = amp * (freq.x * cx * (1.0 + bend) + freq.y * cy * twist);\n  float dy = amp * (freq.x * cx * bend + freq.y * cy);\n  for (int k = 0; k < 4; k++) {\n    vec3 sw = uSwells[k];\n    if (sw.z <= 0.0) continue;\n    float u = (xy.x - sw.x) / uSwellWidth;\n    float v = (xy.y - sw.y) / (uSwellWidth * 3.5);\n    float bump = sw.z * exp(-u * u - v * v);\n    h += bump;\n    dx += bump * (-2.0 * u / uSwellWidth);\n    dy += bump * (-2.0 * v / (uSwellWidth * 3.5));\n  }\n  return vec3(h, dx, dy);\n}\n\nfloat march(vec3 origin, vec3 dir) {\n  float dist = 0.0;\n  for (int i = 0; i < 128; i++) {\n    if (float(i) >= uSteps) break;\n    float gap = origin.z + dist * dir.z - surface(origin.xy + dist * dir.xy).x;\n    if (abs(gap) < 0.002 * dist + 0.01) break;\n    dist += uStride * gap;\n    if (!(abs(dist) < FAR)) return FAR;\n  }\n  return dist;\n}\n\nvoid main() {\n  float c;\n  float s;\n  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);\n  vec3 cam = vec3(0.0, 0.0, 30.0);\n  vec2 uv = gl_FragCoord.xy / uResolution - 0.5;\n  uv.x *= uResolution.x / uResolution.y;\n  uv.y *= -1.0;\n\n  vec3 dir = vec3(0.0, 0.0, -1.0);\n  float ulen = length(uv);\n  float xrot = vfov * ulen;\n  c = cos(xrot);\n  s = sin(xrot);\n  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;\n  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);\n  dir = mat3(nuv.x, -nuv.y, 0.0, nuv.y, nuv.x, 0.0, 0.0, 0.0, 1.0) * dir;\n  c = cos(uTilt + uLook.y);\n  s = sin(uTilt + uLook.y);\n  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;\n  c = cos(uLook.x);\n  s = sin(uLook.x);\n  dir = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * dir;\n\n  float dist = march(cam, dir);\n  vec3 pos = cam + dist * dir;\n  vec3 field = surface(pos.xy);\n  vec3 view = -dir;\n\n  float crest = clamp((field.x - uHeight) / max(2.0 * uAmplitude, 0.001) * 0.5 + 0.5, 0.0, 1.0);\n  vec3 body = mix(uWave, uCrest, smoothstep(0.45, 1.0, crest) * 0.5);\n  vec3 normal = normalize(vec3(-field.yz * (1.0 + 1.5 * uRelief), 1.0));\n  float diffuse = clamp(dot(normal, uSun) * 0.5 + 0.5, 0.0, 1.0);\n  float lightness = mix(1.0, diffuse * diffuse * (3.0 - 2.0 * diffuse), uRelief);\n  float sheen = pow(clamp(dot(normal, normalize(uSun + view)), 0.0, 1.0), 14.0) * uSheen * (0.4 + 0.6 * uRelief);\n  float rim = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 3.0);\n\n  vec3 col;\n  float alpha;\n  float haze = 1.0 - exp(-dist / (uFogDepth * 5.0));\n  float fade = 1.0 - smoothstep(0.35, 1.0, haze);\n  if (uLight < 0.5) {\n    vec3 lit = mix(uHorizon * 0.18, body, lightness) + uCrest * sheen;\n    lit = mix(lit, uHorizon, rim * 0.15 * uRelief);\n    col = mix(lit, uHorizon, smoothstep(0.0, 1.0, haze)) * 0.85 * uBrightness;\n    alpha = fade;\n  } else {\n    vec3 hue = mix(uHorizon, body, 0.35 + 0.65 * lightness);\n    float density = mix(0.16, 0.9, 1.0 - lightness);\n    density *= 1.0 - clamp(sheen, 0.0, 1.0) * 0.85;\n    density *= 1.0 - 0.5 * smoothstep(0.0, 1.0, haze);\n    col = hue;\n    alpha = fade * clamp(density * uBrightness, 0.0, 1.0);\n  }\n\n  float reveal = uIntro.x;\n  col = clamp(col, 0.0, 1.0);\n  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 64.0) - 0.5) * uGrain;\n  alpha = clamp(alpha * (1.0 + grain), 0.0, 1.0) * reveal * uOpacity;\n  if (uOpaque > 0.5) {\n    outColor = vec4(mix(uBackground, col, alpha), 1.0);\n  } else {\n    outColor = vec4(col * alpha, alpha);\n  }\n}";
const host = document.querySelector('.hero-waves');
const canvas = document.getElementById('hero-waves-canvas');
if (!host || !canvas) return;
const hero = host.closest('.hero');
const motionButton = document.getElementById('motion-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const mobile = matchMedia('(max-width: 600px)');
let gl, program, buffer, vao, resizeObserver, visibilityObserver, preferenceObserver;
let frame = 0, last = 0, rendered = 0, time = 12, inView = true, ready = false, lost = false;
let pointerX = 0, pointerY = 0, lookX = 0, lookY = 0;
const uniform = {};
const still = () => reduced.matches || motionButton?.getAttribute('aria-pressed') === 'false';
function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; rendered = 0; }
function compile(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('Hero shader unavailable'); }
  return shader;
}
function fit() {
  const ratio = Math.min(devicePixelRatio || 1, mobile.matches ? .85 : 1.2, 1600 / Math.max(1,host.clientWidth));
  const width = Math.max(1, Math.round(host.clientWidth * ratio));
  const height = Math.max(1, Math.round(host.clientHeight * ratio));
  if (canvas.width !== width || canvas.height !== height) {canvas.width = width; canvas.height = height;}
}
function paint() {
  if (!gl || lost) return;
  gl.viewport(0,0,canvas.width,canvas.height);
  gl.uniform2f(uniform.uResolution,canvas.width,canvas.height);
  gl.uniform1f(uniform.uTime,time * .25);
  gl.uniform1f(uniform.uClock,time);
  gl.uniform2f(uniform.uLook,lookX,lookY);
  const angle = 130 * Math.PI / 180 + lookX * 3;
  const altitude = .52 - lookY;
  gl.uniform3f(uniform.uSun,Math.cos(altitude)*Math.cos(angle),Math.cos(altitude)*Math.sin(angle),Math.sin(altitude));
  gl.uniform1f(uniform.uSteps,mobile.matches ? 48 : 72);
  gl.drawArrays(gl.TRIANGLES,0,3);
}
function tick(now) {
  frame = 0;
  if (!ready || !inView || document.hidden || lost || still()) return;
  if (rendered && now - rendered < 1000 / (mobile.matches ? 24 : 30)) {frame=requestAnimationFrame(tick);return;}
  const dt = last ? Math.min((now-last)/1000,.1) : 0;
  last = now; rendered = now; time += dt;
  const ease = 1 - Math.exp(-dt / .6);
  lookX += (pointerX-lookX)*ease; lookY += (pointerY-lookY)*ease;
  paint();
  frame=requestAnimationFrame(tick);
}
function sync() {
  stop();
  if (!ready || !gl || lost) return;
  if (!inView || document.hidden) {canvas.dataset.state='paused';return;}
  if (still()) {lookX=0;lookY=0;paint();canvas.dataset.state='static';return;}
  canvas.dataset.state='animated';
  frame=requestAnimationFrame(tick);
}
function measure() {if (!gl || lost) return;fit();paint();sync();}
function init() {
  try {
    gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
    if (!gl) {canvas.dataset.state='fallback';return;}
    const vertex=compile(gl.VERTEX_SHADER,VERTEX), fragment=compile(gl.FRAGMENT_SHADER,FRAGMENT);
    program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.bindAttribLocation(program,0,'aPosition');gl.linkProgram(program);
    gl.deleteShader(vertex);gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Hero program unavailable');
    gl.useProgram(program);
    vao=gl.createVertexArray();gl.bindVertexArray(vao);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    for(const name of ['uResolution','uTime','uClock','uAmplitude','uWaveScale','uWaveRatio','uSwell','uTurbulence','uHeight','uTilt','uZoom','uLook','uFogDepth','uBrightness','uOpacity','uGrain','uHorizon','uWave','uCrest','uBackground','uOpaque','uLight','uSun','uRelief','uSheen','uSteps','uStride','uIntro','uSwells','uSwellWidth']) uniform[name]=gl.getUniformLocation(program,name);
    const floats={uAmplitude:2.2,uWaveScale:.6,uWaveRatio:.9,uSwell:30,uTurbulence:20,uHeight:5.5,uTilt:40*Math.PI/180,uZoom:1,uFogDepth:15,uBrightness:.85,uOpacity:1,uGrain:.04,uOpaque:1,uLight:0,uRelief:1,uSheen:.18,uStride:.9,uSwellWidth:8};
    for(const [name,value] of Object.entries(floats)) gl.uniform1f(uniform[name],value);
    gl.uniform3f(uniform.uHorizon,.035,.035,.039);gl.uniform3f(uniform.uWave,.49,.47,.45);gl.uniform3f(uniform.uCrest,.93,.82,.73);gl.uniform3f(uniform.uBackground,8/255,8/255,8/255);gl.uniform3f(uniform.uIntro,1,3,0);gl.uniform3fv(uniform.uSwells,new Float32Array(12));
    ready=true;fit();paint();
    resizeObserver=new ResizeObserver(measure);resizeObserver.observe(host);
    visibilityObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();});visibilityObserver.observe(hero);
    preferenceObserver=new MutationObserver(sync);if(motionButton) preferenceObserver.observe(motionButton,{attributes:true,attributeFilter:['aria-pressed']});
    sync();
  } catch {
    ready=false;canvas.dataset.state='fallback';canvas.style.display='none';
    if(gl&&program)gl.deleteProgram(program);
    if(gl&&buffer)gl.deleteBuffer(buffer);
    if(gl&&vao)gl.deleteVertexArray(vao);
  }
}
hero.addEventListener('pointermove',event=>{
  if (!fine.matches || still() || event.pointerType!=='mouse') return;
  const bounds=hero.getBoundingClientRect();
  pointerX=(event.clientX-bounds.left)/bounds.width*.06-.03;
  pointerY=(event.clientY-bounds.top)/bounds.height*.035-.0175;
},{passive:true});
hero.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
document.addEventListener('visibilitychange',sync);
reduced.addEventListener('change',sync);
mobile.addEventListener('change',measure);
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;stop();canvas.dataset.state='fallback';canvas.style.opacity='0';});
window.addEventListener('pagehide',stop);
window.addEventListener('pageshow',sync);
Promise.resolve(window.portfolioIntroReady).then(init);
})();
