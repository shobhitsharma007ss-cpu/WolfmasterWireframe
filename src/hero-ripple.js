/* Hero ripple: the hero photo bends around the cursor like disturbed water.
   OGL renders the image through a flowmap (a decaying map of pointer velocity).
   Bundled to assets/js/hero-ripple.js with esbuild (see README). */
import { Renderer } from "ogl/src/core/Renderer.js";
import { Program } from "ogl/src/core/Program.js";
import { Mesh } from "ogl/src/core/Mesh.js";
import { Texture } from "ogl/src/core/Texture.js";
import { Triangle } from "ogl/src/extras/Triangle.js";
import { Flowmap } from "ogl/src/extras/Flowmap.js";
import { Vec2 } from "ogl/src/math/Vec2.js";

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform sampler2D tFlow;
  uniform vec2 uScale;
  uniform vec2 uOffset;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    vec3 flow = texture2D(tFlow, vUv).rgb;
    vec2 uv = vUv * uScale + uOffset;            // object-fit: cover
    vec2 d = flow.xy * flow.z * uStrength;
    // slight chromatic split along the disturbance
    float r = texture2D(tMap, uv - d * 1.1).r;
    float g = texture2D(tMap, uv - d).g;
    float b = texture2D(tMap, uv - d * 0.9).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

export function initHeroRipple(img, { focusX = 0.68, focusY = 0.5 } = {}) {
  const host = img.parentElement;
  let renderer;
  try {
    renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: false, antialias: false });
  } catch (e) {
    return null; // no WebGL: keep the plain <img>
  }
  const gl = renderer.gl;
  if (!gl) return null;
  const canvas = gl.canvas;
  canvas.className = "hero__canvas";
  canvas.setAttribute("aria-hidden", "true");

  const flowmap = new Flowmap(gl, { falloff: 0.22, dissipation: 0.94, alpha: 0.6 });
  const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR });
  const program = new Program(gl, {
    vertex, fragment,
    uniforms: {
      tMap: { value: texture },
      tFlow: flowmap.uniform,
      uScale: { value: new Vec2(1, 1) },
      uOffset: { value: new Vec2(0, 0) },
      uStrength: { value: 0.085 },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  let imgAspect = 1;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h);
    flowmap.aspect = w / h;
    const canvasAspect = w / h;
    const s = program.uniforms.uScale.value;
    if (canvasAspect > imgAspect) s.set(1, imgAspect / canvasAspect);
    else s.set(canvasAspect / imgAspect, 1);
    program.uniforms.uOffset.value.set((1 - s.x) * focusX, (1 - s.y) * focusY);
  }

  // Pointer → normalised position + smoothed velocity
  const mouse = new Vec2(-1), velocity = new Vec2();
  let last = null, moved = false;
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const now = performance.now();
    if (last) {
      // pixels per millisecond, as OGL's flowmap expects
      const dt = Math.max(14, now - last.t);
      velocity.set((e.clientX - last.x) / dt, (last.y - e.clientY) / dt);
      const len = velocity.len();
      if (len > 1.6) velocity.multiply(1.6 / len); // keep fast flicks from tearing the image
    }
    mouse.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    last = { x: e.clientX, y: e.clientY, t: now };
    moved = true;
  }

  let visible = true, raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    if (!moved) velocity.multiply(0.9);
    moved = false;
    flowmap.mouse.copy(mouse);
    flowmap.velocity.lerp(velocity, velocity.len() ? 0.5 : 0.1);
    flowmap.update();
    renderer.render({ scene: mesh });
  }

  function start() {
    imgAspect = (img.naturalWidth || 21) / (img.naturalHeight || 9);
    texture.image = img;
    host.appendChild(canvas);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(host);
    frame();
    // swap only once the first frame has rendered, so there is never a blank flash
    requestAnimationFrame(() => host.classList.add("has-gl"));
  }

  // WebGL needs a CORS-clean image. A same-origin copy always works; a CDN copy
  // works only if it sends CORS headers. If it doesn't, we quietly keep the <img>.
  const src = img.currentSrc || img.src;
  const tex = new Image();
  tex.crossOrigin = "anonymous";
  tex.decoding = "async";
  tex.onload = () => { img = tex; try { start(); } catch (e) { canvas.remove(); } };
  tex.src = src;
  return { canvas };
}

window.initHeroRipple = initHeroRipple;
