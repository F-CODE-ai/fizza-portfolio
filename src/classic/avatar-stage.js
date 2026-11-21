// Hero 3D Avatar stage (Module 2): loads public/models/chef-fizz.glb into #avatar-canvas,
// plays idle/wave/talk/nod animations, supports drag-to-rotate + mouse-follow (extra credit).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { speakAvatarText, speakNextAvatarSentence, AVATAR_SENTENCES } from './voice.js';

let currentPlay = null;

export function triggerAvatarPose(name) {
  currentPlay?.(name);
}

export async function initAvatarStage() {
  const canvas = document.getElementById('avatar-canvas');
  if (!canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return;
  }
  const w = canvas.clientWidth || 260;
  const h = canvas.clientHeight || 280;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 20);
  camera.position.set(0, 1.02, 3.22);
  camera.lookAt(0, 0.86, 0);

  // Soft 3-point flattering studio lighting
  scene.add(new THREE.HemisphereLight(0xfff5f9, 0xe295b5, 1.85));
  const key = new THREE.DirectionalLight(0xfff4ea, 2.0);
  key.position.set(1.8, 3.2, 3.8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xfff0f5, 0.9);
  fill.position.set(-1.5, 1.5, 3.0);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xff8fc1, 1.05);
  rim.position.set(-2.5, 2.4, -2.0);
  scene.add(rim);

  // Cute pink pedestal plate whose top sits cleanly at y = 0.0
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.52, 0.06, 36),
    new THREE.MeshStandardMaterial({ color: 0xff8fc1, roughness: 0.38, metalness: 0.05 })
  );
  plate.position.y = -0.03;
  scene.add(plate);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.47, 0.012, 10, 40),
    new THREE.MeshStandardMaterial({ color: 0xfffafc, roughness: 0.25, metalness: 0.1 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.002;
  scene.add(ring);

  let model = null;
  let mixer = null;
  const actions = {};
  let active = null;

  try {
    const gltf = await new GLTFLoader().loadAsync('/models/chef-fizz.glb');
    model = gltf.scene;
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    for (const clip of gltf.animations) {
      actions[clip.name.toLowerCase()] = mixer.clipAction(clip);
    }
    active = actions.idle;
    active?.play();
  } catch (err) {
    console.warn('Chef Fizz GLB load skipped:', err);
  }

  let nodTimer = 0;
  function play(name) {
    if (name === 'nod') {
      nodTimer = 0.85;
      return;
    }
    const next = actions[name];
    if (!next || !mixer) return;
    next.reset().setLoop(name === 'idle' ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    next.clampWhenFinished = true;
    if (active && active !== next) next.crossFadeFrom(active, 0.22, false);
    next.play();
    active = next;
    if (name !== 'idle' && actions.idle) {
      const onFinish = (e) => {
        if (e.action !== next) return;
        mixer.removeEventListener('finished', onFinish);
        actions.idle.reset().play();
        actions.idle.crossFadeFrom(next, 0.25, false);
        active = actions.idle;
      };
      mixer.addEventListener('finished', onFinish);
    }
  }
  currentPlay = play;

  document.querySelectorAll('[data-avatar-pose]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pose = btn.getAttribute('data-avatar-pose');
      play(pose);
      if (pose === 'wave') {
        speakAvatarText(AVATAR_SENTENCES[0], { pose: 'wave' });
      } else if (pose === 'talk') {
        speakNextAvatarSentence('talk');
      } else if (pose === 'nod') {
        speakAvatarText("Yes! Let's build something amazing together in AI and 3D — check out my recipes or send a postcard!", { pose: 'nod' });
      }
    });
  });
  window.addEventListener('fizza:avatar-pose', (e) => {
    if (e.detail) play(String(e.detail));
  });

  // Extra credit: Interactive 3D response to mouse movement + drag-to-spin + tap-to-speak on canvas
  let targetRotY = 0;
  let targetRotX = 0;
  let dragOffset = 0;
  let dragging = false;
  let downX = 0;
  let lastX = 0;

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    downX = e.clientX;
    lastX = e.clientX;
    canvas.style.cursor = 'grabbing';
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dragOffset += (e.clientX - lastX) * 0.015;
    lastX = e.clientX;
  });
  const endDrag = (e) => {
    if (dragging && e && Math.abs((e.clientX || downX) - downX) < 5) {
      play('talk');
      speakNextAvatarSentence('talk');
    }
    dragging = false;
    canvas.style.cursor = 'grab';
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  window.addEventListener('pointermove', (e) => {
    if (dragging) return;
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotY = nx * 0.38;
    targetRotX = ny * 0.08;
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();
  function animate() {
    const dt = clock.getDelta();
    if (!reduced) {
      mixer?.update(dt);
      if (model) {
        const goalY = dragOffset + targetRotY;
        model.rotation.y += (goalY - model.rotation.y) * 0.1;
        model.rotation.x += (targetRotX - model.rotation.x) * 0.08;
        if (nodTimer > 0) {
          nodTimer = Math.max(0, nodTimer - dt);
          model.rotation.x = Math.sin(nodTimer * Math.PI * 5) * 0.18;
        }
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
