/**
 * LPG hero — a soft cluster of floating toys built entirely from procedural
 * geometry. No models, no texture files: everything here ships as code, so the
 * only network cost is three.js itself.
 *
 * Entry point is init({ tier }). Tier 1 = low-end mobile, Tier 2 = desktop/GPU.
 * Tier 0 never gets this far — the loader in index.html doesn't import it.
 */
import * as THREE from '../vendor/three.module.min.js';

const YELLOW = 0xF5C81F;
const ORANGE = 0xF2742D;
const CREAM  = 0xFFF4D6;
const WHITE  = 0xFFFFFF;
const INK    = 0x2E2A22;

/** Draws a letter into a canvas so the LPG blocks need no font download. */
function letterTexture(ch) {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = '#F5C81F';
  g.fillRect(0, 0, s, s);
  g.fillStyle = '#1E1B16';
  g.font = '700 168px "Baloo 2", Trebuchet MS, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(ch, s / 2, s / 2 + 10);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 1;
  return t;
}

/** Five-pointed star as an extruded shape — procedural, no asset. */
function starGeometry(outer = 0.5, inner = 0.22, depth = 0.16) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1,
  });
}

/** Little bus: body + roof + two wheels, parented so it moves as one. */
function makeBus(seg) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.5, 0.5),
    new THREE.MeshLambertMaterial({ color: YELLOW })
  );
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.26, 0.46),
    new THREE.MeshLambertMaterial({ color: CREAM })
  );
  roof.position.set(-0.1, 0.36, 0);
  g.add(body, roof);
  const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.14, seg);
  const wheelMat = new THREE.MeshLambertMaterial({ color: INK });
  for (const x of [-0.32, 0.32]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.x = Math.PI / 2;
    w.position.set(x, -0.3, 0);
    g.add(w);
  }
  return g;
}

/** Bee: body, a stripe, and two wings. */
function makeBee(seg) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, seg, seg),
    new THREE.MeshLambertMaterial({ color: YELLOW })
  );
  const stripe = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.075, Math.max(6, seg / 2), seg),
    new THREE.MeshLambertMaterial({ color: INK })
  );
  stripe.rotation.y = Math.PI / 2;
  g.add(body, stripe);
  const wingGeo = new THREE.SphereGeometry(0.19, seg, seg);
  const wingMat = new THREE.MeshLambertMaterial({
    color: WHITE, transparent: true, opacity: 0.62,
  });
  for (const z of [-0.24, 0.24]) {
    const w = new THREE.Mesh(wingGeo, wingMat);
    w.scale.set(1, 0.42, 0.62);
    w.position.set(-0.04, 0.24, z);
    g.add(w);
  }
  return g;
}

/** Parachute: canopy hemisphere over a small crate. */
function makeParachute(seg) {
  const g = new THREE.Group();
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, seg, Math.max(5, seg / 2), 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: ORANGE, side: THREE.DoubleSide })
  );
  const crate = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.28, 0.28),
    new THREE.MeshLambertMaterial({ color: CREAM })
  );
  crate.position.y = -0.44;
  g.add(canopy, crate);
  return g;
}

export function init({ tier = 2 } = {}) {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return null;

  const LOW = tier === 1;
  const seg = LOW ? 10 : 20;          // sphere/cylinder segments
  const maxDpr = LOW ? 1 : 2;
  const frameMs = LOW ? 1000 / 30 : 1000 / 60;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 6.9);

  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: !LOW, powerPreference: 'low-power',
  });
  renderer.setClearColor(0x000000, 0);

  scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xE8D9AE, 1.05));
  const key = new THREE.DirectionalLight(0xFFFFFF, 0.85);
  key.position.set(3, 5, 6);
  scene.add(key);

  const world = new THREE.Group();
  scene.add(world);

  const toys = [];
  const add = (obj, pos, scale, spin) => {
    obj.position.set(...pos);
    obj.scale.setScalar(scale);
    obj.userData = {
      home: obj.position.clone(),
      phase: Math.random() * Math.PI * 2,
      bob: 0.1 + Math.random() * 0.12,
      spin,
      vel: new THREE.Vector3(),
      wobble: 0,
    };
    world.add(obj);
    toys.push(obj);
    return obj;
  };

  // --- the three LPG blocks: the interactive heart of the scene ---
  const blocks = [];
  const blockGeo = new THREE.BoxGeometry(1, 1, 1);
  'LPG'.split('').forEach((ch, i) => {
    const face = new THREE.MeshLambertMaterial({ map: letterTexture(ch) });
    const side = new THREE.MeshLambertMaterial({ color: i === 1 ? 0xD9611F : 0xD9AE12 });
    const mesh = new THREE.Mesh(blockGeo, [side, side, side, side, face, side]);
    add(mesh, [-1.5 + i * 1.5, 0.45 - i * 0.18, 0], 0.9, 0.0016);
    blocks.push(mesh);
  });

  // --- the supporting toys, sparser on low-end devices ---
  add(makeBee(seg),        [2.15, 1.85, -1.2], 1.15, 0.004);
  add(makeBus(seg),        [-2.15, -1.75, -1.2], 0.9, 0.0022);
  add(new THREE.Mesh(starGeometry(), new THREE.MeshLambertMaterial({ color: ORANGE })),
                            [2.35, -1.55, -1.0], 0.9, 0.006);
  if (!LOW) {
    add(makeParachute(seg), [-2.25, 1.85, -1.9], 0.85, 0.0018);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.36, seg, seg),
        new THREE.MeshLambertMaterial({ color: CREAM })), [0.45, 2.55, -2.3], 0.85, 0.003);
    add(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.13, 8, seg),
        new THREE.MeshLambertMaterial({ color: YELLOW })), [-0.7, -2.45, -2.1], 0.85, 0.005);
  }

  // --- parallax, drag, and device tilt ---
  const pointer = new THREE.Vector2();
  const target  = new THREE.Vector2();
  const ray     = new THREE.Raycaster();

  // Drag state. dragPlane faces the camera through the grabbed block, so the
  // block tracks the finger exactly rather than drifting with perspective.
  let dragging = null;
  const dragPlane = new THREE.Plane();
  const hitPoint  = new THREE.Vector3();
  const grabOffset = new THREE.Vector3();
  const lastDrag = new THREE.Vector3();
  const camDir = new THREE.Vector3();

  function toNdc(e, out) {
    const r = canvas.getBoundingClientRect();
    out.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    out.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }

  function planePoint(out) {
    ray.setFromCamera(pointer, camera);
    if (!ray.ray.intersectPlane(dragPlane, out)) return false;
    world.worldToLocal(out);            // scene is parallax-rotated; go local
    return true;
  }

  const onMove = e => {
    toNdc(e, target);
    if (!dragging) return;
    pointer.copy(target);
    if (!planePoint(hitPoint)) return;
    const d = dragging.userData;
    const nx = hitPoint.x + grabOffset.x, ny = hitPoint.y + grabOffset.y;
    d.vel.set(nx - dragging.position.x, ny - dragging.position.y, 0).multiplyScalar(0.5);
    dragging.position.x = nx;
    dragging.position.y = ny;
  };

  const onDown = e => {
    toNdc(e, pointer);
    target.copy(pointer);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(blocks, false)[0];
    if (!hit) return;

    dragging = hit.object;
    dragging.userData.wobble = 1;
    camera.getWorldDirection(camDir);
    dragPlane.setFromNormalAndCoplanarPoint(camDir, hit.point);
    if (planePoint(hitPoint)) {
      grabOffset.set(dragging.position.x - hitPoint.x, dragging.position.y - hitPoint.y, 0);
    } else {
      grabOffset.set(0, 0, 0);
    }
    lastDrag.copy(dragging.position);
    // only claim the gesture once a block is actually grabbed, so a plain
    // swipe over the canvas still scrolls the page
    canvas.style.touchAction = 'none';
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  };

  const onUp = e => {
    if (!dragging) return;
    dragging.userData.wobble = Math.max(dragging.userData.wobble, 0.6);
    dragging = null;
    canvas.style.touchAction = 'pan-y';
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  canvas.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });
  window.addEventListener('pointercancel', onUp, { passive: true });

  // --- device tilt: on a phone the whole scene leans as you lean ---
  let tilting = false;
  function onTilt(ev) {
    if (ev.gamma == null || ev.beta == null || dragging) return;
    tilting = true;
    target.x = Math.max(-1, Math.min(1, ev.gamma / 26));
    target.y = Math.max(-1, Math.min(1, (ev.beta - 46) / 26));
  }
  function enableTilt() {
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return;
    if (typeof DOE.requestPermission === 'function') {
      // iOS: only allowed from a user gesture, and silence a refusal
      DOE.requestPermission().then(s => {
        if (s === 'granted') window.addEventListener('deviceorientation', onTilt);
      }).catch(() => {});
    } else {
      window.addEventListener('deviceorientation', onTilt);
    }
  }
  if (matchMedia('(pointer: coarse)').matches) {
    window.addEventListener('touchstart', function once() {
      window.removeEventListener('touchstart', once);
      enableTilt();
    }, { passive: true, once: true });
    enableTilt();   // non-iOS needs no gesture
  }


  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    // pull the camera back on narrow screens so nothing clips off-frame
    camera.position.z = r.width < 700 ? 9.0 : 6.9;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let running = true, raf = 0, last = 0, t = 0, revealed = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < frameMs) return;
    last = now;
    t += 0.016;

    pointer.lerp(target, tilting ? 0.08 : 0.045);
    world.rotation.y = pointer.x * 0.16;
    world.rotation.x = -pointer.y * 0.1;

    for (const o of toys) {
      const d = o.userData;
      if (o === dragging) {                                // held: no physics
        o.rotation.z = Math.sin(t * 14) * 0.08;
        continue;
      }
      d.vel.y -= 0.0042;                                   // gravity toward home
      o.position.y += d.vel.y;
      const rest = d.home.y + Math.sin(t + d.phase) * d.bob;
      o.position.y += (rest - o.position.y) * 0.06;        // spring back to float
      o.position.x += d.vel.x;
      o.position.x += (d.home.x - o.position.x) * 0.045;   // drift back to place
      d.vel.multiplyScalar(0.9);
      o.rotation.y += d.spin;
      if (d.wobble > 0.001) {
        d.wobble *= 0.92;
        o.rotation.z = Math.sin(t * 18) * d.wobble * 0.34;
      }
    }
    renderer.render(scene, camera);
    if (!revealed) {                       // reveal only once pixels exist
      revealed = true;
      canvas.style.opacity = '1';
      canvas.classList.add('is-ready');
      var st = document.querySelector('.hero-static');
      if (st) st.style.display = 'none';
    }
  }

  // Stop entirely when the hero is off-screen — costs nothing while reading on.
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  }, { threshold: 0.01 });
  io.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); running = false; }
    else if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
  });

  raf = requestAnimationFrame(frame);
  return { destroy() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); } };
}
