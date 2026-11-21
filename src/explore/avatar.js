// Loads the sculpted 3D avatar "Fizza (Chef Fizz)" (public/models/chef-fizz.glb) into Explore 3D.
// Supports articulated walking across the kitchen floor ("walk"), lively "idle", "wave", "talk",
// reactive camera/cursor tracking, autonomous kitchen strolls, and WASD / Arrow / floor-click movement.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const URL = '/models/chef-fizz.glb';

// Standing waypoints on the kitchen floor in front of each 3D hotspot
export const SPOT_WAYPOINTS = {
  about:      new THREE.Vector3(1.45, 0.2, -1.75),
  skills:     new THREE.Vector3(-0.30, 0.2, -1.95),
  projects:   new THREE.Vector3(-1.95, 0.2, -1.65),
  experience: new THREE.Vector3(1.85, 0.2, 0.65),
  education:  new THREE.Vector3(-2.25, 0.2, 1.55),
  contact:    new THREE.Vector3(-1.15, 0.2, 1.95),
};

const PATROL_KEYS = ['about', 'projects', 'contact', 'experience', 'skills', 'education'];

function clampFloor(v) {
  v.x = Math.max(-2.35, Math.min(2.35, v.x));
  v.z = Math.max(-2.10, Math.min(2.45, v.z));
  v.y = 0.2;
  return v;
}

function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

export async function loadAvatar(scene, startSpot) {
  const gltf = await new GLTFLoader().loadAsync(URL);
  const model = gltf.scene;
  model.scale.setScalar(1.12);
  model.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  // Start slightly back near the counter and walk forward on entry!
  model.position.set(0.35, 0.2, -0.65);
  model.rotation.y = 0.15;
  scene.add(model);

  // Cute glowing pink floor step indicator ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.22, 0.30, 28),
    new THREE.MeshBasicMaterial({ color: 0xff4fa3, side: THREE.DoubleSide, transparent: true, opacity: 0.0 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(startSpot.x, 0.215, startSpot.z);
  scene.add(ring);

  const mixer = new THREE.AnimationMixer(model);
  const actions = {};
  for (const clip of gltf.animations) {
    actions[clip.name.toLowerCase()] = mixer.clipAction(clip);
  }
  let activeName = 'idle';
  let active = actions.idle;
  active?.play();

  function play(name, { loop = name === 'idle' || name === 'walk' } = {}) {
    const key = String(name || 'idle').toLowerCase();
    const next = actions[key];
    if (!next) return;
    if (active === next && loop) return;

    next.reset();
    next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    next.clampWhenFinished = !loop;
    if (active && active !== next) {
      next.crossFadeFrom(active, 0.22, false);
    }
    next.play();
    active = next;
    activeName = key;

    if (!loop && actions.idle) {
      const onDone = (e) => {
        if (e.action !== next) return;
        mixer.removeEventListener('finished', onDone);
        if (activeName !== 'walk') {
          actions.idle.reset().play();
          actions.idle.crossFadeFrom(next, 0.25, false);
          active = actions.idle;
          activeName = 'idle';
        }
      };
      mixer.addEventListener('finished', onDone);
    }
  }

  let targetPos = null;
  let onArriveCb = null;
  let faceAngle = 0.25;
  let idleTime = 0;
  let patrolIdx = 0;

  function walkTo(dest, { onArrive, faceYaw } = {}) {
    targetPos = clampFloor(dest.clone());
    onArriveCb = onArrive || null;
    if (typeof faceYaw === 'number') faceAngle = faceYaw;
    ring.position.set(targetPos.x, 0.215, targetPos.z);
    ring.material.opacity = 0.78;
    idleTime = 0;
    play('walk', { loop: true });
  }

  function nudgeByCamera(cameraPos, pointerNdcX = 0) {
    // When the visitor orbits/moves the camera, Fizza turns toward them & stays responsive
    const dx = cameraPos.x - model.position.x;
    const dz = cameraPos.z - model.position.z;
    faceAngle = Math.atan2(dx, dz) + pointerNdcX * 0.35;
  }

  function stepKeyboard(dx, dz, dt) {
    if (!dx && !dz) return;
    targetPos = null;
    ring.material.opacity = 0;
    idleTime = 0;
    const next = model.position.clone();
    next.x += dx * 2.2 * dt;
    next.z += dz * 2.2 * dt;
    clampFloor(next);
    model.position.copy(next);
    faceAngle = Math.atan2(dx, dz);
    model.rotation.y = lerpAngle(model.rotation.y, faceAngle, 0.25);
    play('walk', { loop: true });
  }

  function update(dt, cameraPos) {
    mixer.update(dt);

    if (targetPos) {
      const dx = targetPos.x - model.position.x;
      const dz = targetPos.z - model.position.z;
      const dist = Math.hypot(dx, dz);
      ring.scale.setScalar(1 + Math.sin(performance.now() * 0.008) * 0.12);

      if (dist > 0.08) {
        const speed = 2.05;
        const step = Math.min(dist, speed * dt);
        model.position.x += (dx / dist) * step;
        model.position.z += (dz / dist) * step;
        const walkYaw = Math.atan2(dx, dz);
        model.rotation.y = lerpAngle(model.rotation.y, walkYaw, Math.min(1, dt * 10));
        if (activeName !== 'walk') play('walk', { loop: true });
      } else {
        model.position.copy(targetPos);
        targetPos = null;
        ring.material.opacity = 0;
        if (cameraPos) {
          faceAngle = Math.atan2(cameraPos.x - model.position.x, cameraPos.z - model.position.z);
        }
        play('wave', { loop: false });
        const cb = onArriveCb;
        onArriveCb = null;
        cb?.();
      }
    } else {
      // Smoothly turn toward visitor's camera / cursor when standing
      model.rotation.y = lerpAngle(model.rotation.y, faceAngle, Math.min(1, dt * 5));
      idleTime += dt;
      // Autonomous kitchen stroll every 8 seconds so she never looks like a dead statue!
      if (idleTime > 8.0) {
        idleTime = 0;
        const spotKey = PATROL_KEYS[patrolIdx % PATROL_KEYS.length];
        patrolIdx++;
        const wp = SPOT_WAYPOINTS[spotKey];
        if (wp) walkTo(wp);
      }
    }
  }

  // Initial welcome walk from counter to center table!
  walkTo(startSpot.clone());

  return {
    model,
    play,
    walkTo,
    nudgeByCamera,
    stepKeyboard,
    update,
    getHeadWorldPos(out = new THREE.Vector3()) {
      return out.set(model.position.x, model.position.y + 1.95, model.position.z);
    },
  };
}
