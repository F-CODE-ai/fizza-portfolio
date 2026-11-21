// Explore mode: a lazy-loaded 3D "Pink Travel Kitchen" with a walking, speaking 3D Fizza avatar.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { buildScene } from './scene.js';
import { SPOTS } from './spots.js';
import { loadAvatar, SPOT_WAYPOINTS } from './avatar.js';
import { speakAvatarText, speakNextAvatarSentence, SPOT_SPEECH } from '../classic/voice.js';

const HOME = { pos: new THREE.Vector3(9, 7.5, 11), target: new THREE.Vector3(0, 1.4, -0.5) };

function el(tag, attrs = {}, text) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text !== undefined) n.textContent = text;
  return n;
}

export function openExplore(trigger) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- DOM overlay ----------
  const overlay = el('div', { class: 'explore', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Explore 3D kitchen' });
  const canvas = el('canvas', { class: 'explore-canvas', 'aria-hidden': 'true' });
  const top = el('div', { class: 'explore-top' });
  top.append(el('p', { class: 'explore-title' }, "Fizza's Travel Kitchen"));
  const topBtns = el('div', { class: 'flex items-center gap-2 flex-wrap' });
  const speakBtn = el('button', { class: 'btn btn-small btn-ghost', type: 'button' }, '💬 Speak to Fizza');
  const walkBtn = el('button', { class: 'btn btn-small btn-ghost', type: 'button' }, '🚶‍♀️ Walk Tour');
  const closeBtn = el('button', { class: 'btn btn-small', type: 'button' }, 'Back to classic ✕');
  topBtns.append(speakBtn, walkBtn, closeBtn);
  top.append(topBtns);

  const hint = el(
    'p',
    { class: 'explore-hint' },
    'Click any object or floor tile to walk Fizza there · Arrow/WASD keys to move · Drag to orbit · Esc to exit'
  );
  const labels = el('div', { class: 'explore-labels' });
  const avatarBubble = el('div', { class: 'explore-avatar-bubble', role: 'status', 'aria-live': 'polite' }, "Hello! Hi! I'm Fizza — what are you searching about me?");
  labels.append(avatarBubble);

  const panel = el('aside', { class: 'explore-panel', hidden: '', 'aria-live': 'polite' });
  const pTitle = el('h2');
  const pText = el('p');
  const pRow = el('div', { class: 'explore-panel-row' });
  const pOpen = el('button', { class: 'btn btn-small', type: 'button' }, 'Read full section');
  const pBack = el('button', { class: 'btn btn-small btn-ghost', type: 'button' }, 'Back to kitchen');
  pRow.append(pOpen, pBack);
  panel.append(pTitle, pText, pRow);
  overlay.append(canvas, top, labels, panel, hint);
  document.body.append(overlay);
  document.body.classList.add('explore-open');

  // ---------- three.js ----------
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    overlay.remove();
    document.body.classList.remove('explore-open');
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.copy(HOME.pos);
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.minDistance = 4;
  controls.maxDistance = 22;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.minAzimuthAngle = -0.35;
  controls.maxAzimuthAngle = Math.PI * 0.75;
  controls.enablePan = false;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.4;

  const world = buildScene(scene);
  let avatar = null;
  let bubbleTimeout = null;

  function show3DBubble(line) {
    avatarBubble.textContent = line;
    avatarBubble.hidden = false;
    clearTimeout(bubbleTimeout);
    bubbleTimeout = setTimeout(() => {
      avatarBubble.hidden = true;
    }, Math.max(5500, line.length * 70));
  }

  loadAvatar(scene, world.avatarSpot)
    .then((a) => {
      avatar = a;
      speakAvatarText(
        "Hello! Hi! I'm Fizza Aman. What are you searching about me today? Click any spot or floor tile and I'll walk right over!",
        { pose: 'wave', onBubble: show3DBubble }
      );
    })
    .catch(() => {});

  // ---------- top bar buttons ----------
  speakBtn.addEventListener('click', () => {
    avatar?.play('talk');
    speakNextAvatarSentence('talk', show3DBubble);
  });

  let tourIdx = 0;
  walkBtn.addEventListener('click', () => {
    const spot = SPOTS[tourIdx % SPOTS.length];
    tourIdx++;
    focusSpot(spot.id);
  });

  // ---------- hotspot labels (keyboard-accessible alternative to clicking 3D) ----------
  const labelBtns = new Map();
  for (const s of SPOTS) {
    const b = el('button', { class: 'spot-label', type: 'button' }, `${s.icon} ${s.label}`);
    b.addEventListener('click', () => focusSpot(s.id));
    labels.append(b);
    labelBtns.set(s.id, b);
  }

  // ---------- picking (hotspots + kitchen floor walking) ----------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pickables = [...world.hotspots.entries()];
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.2);
  const floorHit = new THREE.Vector3();
  let hovered = null;
  let down = null;
  let pointerNdcX = 0;

  function spotAt(ev) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    pointerNdcX = ndc.x;
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(pickables.map(([, o]) => o), true);
    if (!hits.length) return null;
    let o = hits[0].object;
    while (o && ![...world.hotspots.values()].includes(o)) o = o.parent;
    return o ? pickables.find(([, g]) => g === o)[0] : null;
  }

  function setGlow(id, on) {
    const g = world.hotspots.get(id);
    if (!g) return;
    g.traverse((m) => {
      if (m.isMesh) {
        m.material = m.material.clone();
        m.material.emissive = new THREE.Color(on ? 0x66223f : 0x000000);
      }
    });
  }

  canvas.addEventListener('pointermove', (ev) => {
    const id = spotAt(ev);
    avatar?.nudgeByCamera(camera.position, pointerNdcX);
    if (id !== hovered) {
      if (hovered) setGlow(hovered, false);
      if (id) setGlow(id, true);
      hovered = id;
      canvas.style.cursor = id ? 'pointer' : 'grab';
    }
  });
  controls.addEventListener('change', () => {
    avatar?.nudgeByCamera(camera.position, pointerNdcX);
  });

  canvas.addEventListener('pointerdown', (ev) => {
    down = [ev.clientX, ev.clientY];
    controls.autoRotate = false;
  });
  canvas.addEventListener('pointerup', (ev) => {
    if (!down || Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) > 6) return;
    const id = spotAt(ev);
    if (id) {
      focusSpot(id);
      return;
    }
    // If the visitor clicked on the kitchen floor, walk Fizza to that point!
    if (ray.ray.intersectPlane(floorPlane, floorHit)) {
      if (Math.abs(floorHit.x) < 3.6 && Math.abs(floorHit.z) < 3.6) {
        avatar?.walkTo(floorHit, {
          onArrive: () => {
            speakNextAvatarSentence('talk', show3DBubble);
          },
        });
      }
    }
  });

  // ---------- WASD / Arrow keys to walk Fizza directly ----------
  const keys = new Set();
  function onKeyDown(e) {
    if (e.key === 'Escape') {
      close();
      return;
    }
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
      keys.add(k);
    }
  }
  function onKeyUp(e) {
    keys.delete(e.key.toLowerCase());
  }
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // ---------- camera moves + panel + avatar walk ----------
  let current = null;
  function moveCamera(pos, target, dur = 1.2) {
    if (reduced) {
      camera.position.copy(pos);
      controls.target.copy(target);
      return;
    }
    gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: dur, ease: 'power2.inOut' });
    gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, duration: dur, ease: 'power2.inOut' });
  }
  function focusSpot(id) {
    const spot = SPOTS.find((s) => s.id === id);
    const obj = world.hotspots.get(id);
    if (!spot || !obj) return;
    current = spot;
    controls.autoRotate = false;
    const target = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
    const dir = new THREE.Vector3().subVectors(camera.position, target).setY(0).normalize();
    const pos = target.clone().addScaledVector(dir, 4.6).add(new THREE.Vector3(0, 1.5, 0));
    moveCamera(pos, target);

    pTitle.textContent = `${spot.icon} ${spot.title}`;
    pText.textContent = spot.text;
    panel.hidden = false;

    const wp = SPOT_WAYPOINTS[id];
    const line = SPOT_SPEECH[id] || spot.text;
    if (avatar && wp) {
      show3DBubble(`Walking to ${spot.label.toLowerCase()}…`);
      avatar.walkTo(wp, {
        onArrive: () => {
          avatar.play('talk');
          speakAvatarText(line, { pose: 'talk', onBubble: show3DBubble });
        },
      });
    } else {
      speakAvatarText(line, { pose: 'talk', onBubble: show3DBubble });
    }
    pOpen.focus({ preventScroll: true });
  }
  pBack.addEventListener('click', () => {
    panel.hidden = true;
    current = null;
    moveCamera(HOME.pos, HOME.target);
    avatar?.walkTo(world.avatarSpot);
    labelBtns.values().next().value?.focus();
  });
  pOpen.addEventListener('click', () => {
    const sec = current?.section;
    close();
    if (sec) document.getElementById(sec)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  // ---------- loop ----------
  const v = new THREE.Vector3();
  const headV = new THREE.Vector3();
  const clock = new THREE.Clock();
  let running = true;
  function resize() {
    const w = overlay.clientWidth,
      h = overlay.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 700 ? 55 : 40;
    camera.updateProjectionMatrix();
  }
  function frame() {
    if (!running) return;
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    if (!reduced) world.animate(t);

    // Keyboard movement for Fizza
    if (avatar && keys.size) {
      const dx = (keys.has('arrowright') || keys.has('d') ? 1 : 0) - (keys.has('arrowleft') || keys.has('a') ? 1 : 0);
      const dz = (keys.has('arrowdown') || keys.has('s') ? 1 : 0) - (keys.has('arrowup') || keys.has('w') ? 1 : 0);
      avatar.stepKeyboard(dx, dz, dt);
    }

    avatar?.update(dt, camera.position);
    controls.update();
    renderer.render(scene, camera);

    // Position 2D hotspot pills & avatar floating speech bubble
    const w = overlay.clientWidth,
      h = overlay.clientHeight;
    for (const [id, obj] of world.hotspots) {
      new THREE.Box3().setFromObject(obj).getCenter(v);
      v.y += 0.9;
      v.project(camera);
      const b = labelBtns.get(id);
      const visible = v.z < 1;
      b.style.visibility = visible ? 'visible' : 'hidden';
      b.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
    }

    if (avatar && !avatarBubble.hidden) {
      avatar.getHeadWorldPos(headV);
      headV.y += world.root.position.y;
      headV.project(camera);
      const vis = headV.z < 1;
      avatarBubble.style.visibility = vis ? 'visible' : 'hidden';
      const bx = Math.max(140, Math.min(w - 140, ((headV.x + 1) / 2) * w));
      const by = Math.max(75, Math.min(h - 90, ((1 - headV.y) / 2) * h));
      avatarBubble.style.transform = `translate(-50%, -100%) translate(${bx}px, ${by}px)`;
    }
    requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    close();
  });

  // ---------- close / cleanup ----------
  closeBtn.addEventListener('click', close);
  closeBtn.focus();

  function close() {
    if (!running) return;
    running = false;
    clearTimeout(bubbleTimeout);
    window.removeEventListener('resize', resize);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);
    controls.dispose();
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.dispose(); });
    });
    renderer.dispose();
    overlay.remove();
    document.body.classList.remove('explore-open');
    trigger?.focus();
  }
  return true;
}
