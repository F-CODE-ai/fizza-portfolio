// Builds the low-poly "Pink Travel Kitchen" diorama from three.js primitives.
// Returns { root, hotspots: Map<id, Object3D>, animate(t) }.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const C = {
  pink: 0xff8fc1, hot: 0xff4fa3, blush: 0xffd6e8, white: 0xfffafc, plum: 0x7a2456,
  gold: 0xe0b04a, sky: 0xbfe6ff, mint: 0xa8e6cf, grass: 0xffb3d1, rock: 0xc98aa8, dark: 0x3a1430,
};
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...extra });

function mesh(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function floorTexture() {
  const t = canvasTexture(256, 256, (g, w) => {
    const s = w / 8;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      g.fillStyle = (i + j) % 2 ? '#ffe3ef' : '#ffffff';
      g.fillRect(i * s, j * s, s, s);
    }
  });
  return t;
}

function mapTexture() {
  return canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = '#e8f6ff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ff8fc1';
    const blobs = [[110, 80, 70, 45], [150, 175, 35, 55], [255, 75, 45, 35], [275, 160, 40, 55], [370, 90, 85, 45], [420, 190, 35, 22]];
    for (const [x, y, rx, ry] of blobs) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = '#c2185b'; g.setLineDash([8, 8]); g.lineWidth = 4;
    g.beginPath(); g.moveTo(275, 120); g.quadraticCurveTo(330, 40, 400, 90); g.quadraticCurveTo(250, 220, 130, 90); g.stroke();
    for (const [x, y] of [[275, 120], [400, 90], [130, 90]]) { g.fillStyle = '#c2185b'; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); }
  });
}

function globeTexture() {
  return canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = '#7fc8ff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffb3d1';
    for (const [x, y, rx, ry] of [[90, 90, 60, 40], [130, 170, 30, 50], [250, 80, 40, 30], [270, 160, 35, 50], [380, 90, 80, 40], [430, 190, 30, 20]]) {
      g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    }
  });
}

function skyTexture() {
  return canvasTexture(16, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#ffb6d5'); grd.addColorStop(0.55, '#ffd9c7'); grd.addColorStop(1, '#fff1f7');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });
}

export function buildScene(scene) {
  const root = new THREE.Group();
  const hotspots = new Map();
  scene.background = skyTexture();
  scene.fog = new THREE.Fog(0xffd9e6, 22, 48);

  // Lights
  scene.add(new THREE.HemisphereLight(0xfff0f6, 0xd36b9a, 1.6));
  const sun = new THREE.DirectionalLight(0xffd6a5, 2.4);
  sun.position.set(7, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  // Floating island
  const island = new THREE.Group();
  island.add(mesh(new THREE.CylinderGeometry(6.4, 6.2, 0.5, 40), mat(C.grass), 0, -0.25, 0));
  const rock = mesh(new THREE.ConeGeometry(6.2, 4.5, 9), mat(C.rock, { flatShading: true }), 0, -2.75, 0);
  rock.rotation.x = Math.PI;
  island.add(rock);
  root.add(island);

  // Floor + cutaway walls
  const floorTex = floorTexture();
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  root.add(mesh(new THREE.BoxGeometry(8, 0.2, 8), mat(C.white, { map: floorTex }), 0, 0.1, 0));
  const wallMat = mat(C.blush);
  root.add(mesh(new THREE.BoxGeometry(8, 4.6, 0.25), wallMat, 0, 2.5, -4));
  root.add(mesh(new THREE.BoxGeometry(0.25, 4.6, 8), wallMat, -4, 2.5, 0));
  // wall trim
  root.add(mesh(new THREE.BoxGeometry(8, 0.25, 0.3), mat(C.hot), 0, 4.8, -4));
  root.add(mesh(new THREE.BoxGeometry(0.3, 0.25, 8), mat(C.hot), -4, 4.8, 0));

  // Window with sky
  root.add(mesh(new THREE.BoxGeometry(2.0, 1.5, 0.1), mat(C.white), 2.3, 3.0, -3.86));
  root.add(mesh(new THREE.PlaneGeometry(1.75, 1.25), mat(C.sky, { emissive: 0x88ccff, emissiveIntensity: 0.4 }), 2.3, 3.0, -3.8));

  // World map on the left wall
  const map = mesh(new THREE.PlaneGeometry(3.0, 1.5), mat(C.white, { map: mapTexture() }), -3.86, 3.0, -0.8);
  map.rotation.y = Math.PI / 2;
  root.add(map);

  // Counter + oven along back wall
  const counter = new THREE.Group();
  counter.add(mesh(new THREE.BoxGeometry(4.6, 1.1, 1.2), mat(C.white), 0.6, 0.75, -3.25));
  counter.add(mesh(new THREE.BoxGeometry(4.8, 0.12, 1.35), mat(C.hot), 0.6, 1.36, -3.2));
  counter.add(mesh(new THREE.BoxGeometry(1.2, 0.8, 0.05), mat(C.dark, { roughness: 0.3 }), -0.6, 0.75, -2.63));
  counter.add(mesh(new THREE.BoxGeometry(0.9, 0.06, 0.08), mat(C.gold, { metalness: 0.6 }), -0.6, 1.08, -2.58));
  root.add(counter);

  // Mini Eiffel-style tower souvenir
  const tower = new THREE.Group();
  tower.add(mesh(new THREE.ConeGeometry(0.22, 0.5, 4), mat(C.gold, { metalness: 0.5 }), 0, 0.25, 0));
  tower.add(mesh(new THREE.ConeGeometry(0.1, 0.45, 4), mat(C.gold, { metalness: 0.5 }), 0, 0.68, 0));
  tower.position.set(0.4, 1.42, -3.3);
  root.add(tower);

  // HOTSPOT: recipe book (About)
  const book = new THREE.Group();
  const pageL = mesh(new THREE.BoxGeometry(0.55, 0.05, 0.75), mat(C.white), -0.28, 0.05, 0);
  const pageR = pageL.clone(); pageR.position.x = 0.28;
  pageL.rotation.z = 0.12; pageR.rotation.z = -0.12;
  book.add(mesh(new THREE.BoxGeometry(1.2, 0.06, 0.82), mat(C.hot), 0, 0, 0), pageL, pageR);
  book.position.set(1.7, 1.45, -3.0);
  book.rotation.y = -0.3;
  root.add(book); hotspots.set('about', book);

  // HOTSPOT: spice rack (Skills)
  const rack = new THREE.Group();
  rack.add(mesh(new THREE.BoxGeometry(1.9, 0.1, 0.35), mat(C.white), 0, 0, 0));
  [C.hot, C.gold, C.mint, C.pink, 0xffa94d].forEach((col, i) => {
    rack.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.38, 14), mat(col, { transparent: true, opacity: 0.9 }), -0.72 + i * 0.36, 0.24, 0));
    rack.add(mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.07, 14), mat(C.plum), -0.72 + i * 0.36, 0.46, 0));
  });
  rack.position.set(-0.3, 2.6, -3.7);
  root.add(rack); hotspots.set('skills', rack);

  // HOTSPOT: retro fridge with postcards (Projects)
  const fridge = new THREE.Group();
  fridge.add(mesh(new RoundedBoxGeometry(1.4, 2.7, 1.2, 4, 0.2), mat(C.pink, { roughness: 0.35 }), 0, 1.35, 0));
  fridge.add(mesh(new THREE.BoxGeometry(1.38, 0.04, 0.02), mat(C.plum), 0, 1.9, 0.61));
  fridge.add(mesh(new THREE.BoxGeometry(0.07, 0.6, 0.08), mat(C.white, { metalness: 0.6 }), 0.5, 2.25, 0.65));
  fridge.add(mesh(new THREE.BoxGeometry(0.07, 0.6, 0.08), mat(C.white, { metalness: 0.6 }), 0.5, 1.4, 0.65));
  [[-0.3, 1.45, 0x7fc8ff, 0.1], [0.12, 1.2, 0xfff1a8, -0.15], [-0.25, 0.9, C.mint, 0.08], [0.15, 0.75, 0xffffff, -0.05]].forEach(([x, y, col, r]) => {
    const card = mesh(new THREE.PlaneGeometry(0.42, 0.3), mat(col), x, y, 0.61);
    card.rotation.z = r; fridge.add(card);
  });
  fridge.position.set(-3.0, 0.2, -3.0);
  root.add(fridge); hotspots.set('projects', fridge);

  // HOTSPOT: globe (Experience)
  const globe = new THREE.Group();
  globe.add(mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.12, 20), mat(C.gold, { metalness: 0.6 }), 0, 0.06, 0));
  globe.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8), mat(C.gold, { metalness: 0.6 }), 0, 0.5, 0));
  const ball = mesh(new THREE.SphereGeometry(0.55, 32, 20), mat(0xffffff, { map: globeTexture(), roughness: 0.4 }), 0, 1.3, 0);
  ball.rotation.z = 0.4;
  globe.add(ball);
  const ring = mesh(new THREE.TorusGeometry(0.62, 0.025, 8, 40), mat(C.gold, { metalness: 0.6 }), 0, 1.3, 0);
  ring.rotation.y = Math.PI / 2;
  globe.add(ring);
  globe.position.set(2.9, 0.2, 0.6);
  root.add(globe); hotspots.set('experience', globe);

  // HOTSPOT: frames on left wall (Education)
  const frames = new THREE.Group();
  [[0, 0.35, 0.9, 0.7, 0xfff1a8], [0, -0.55, 0.7, 0.55, 0xffffff]].forEach(([y, z, w, h, col]) => {
    frames.add(mesh(new THREE.BoxGeometry(0.06, h + 0.12, w + 0.12), mat(C.gold, { metalness: 0.5 }), 0, y, z));
    const inner = mesh(new THREE.PlaneGeometry(w, h), mat(col), 0.04, y, z);
    inner.rotation.y = Math.PI / 2; frames.add(inner);
  });
  frames.position.set(-3.85, 2.9, 1.9);
  root.add(frames); hotspots.set('education', frames);

  // HOTSPOT: suitcase (Contact)
  const suitcase = new THREE.Group();
  suitcase.add(mesh(new RoundedBoxGeometry(1.3, 0.95, 0.5, 3, 0.1), mat(C.hot, { roughness: 0.45 }), 0, 0.58, 0));
  suitcase.add(mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 20, Math.PI), mat(C.plum), 0, 1.07, 0));
  [[-0.35, 0.7, 0xfff1a8], [0.3, 0.45, 0x7fc8ff], [0.05, 0.75, C.mint]].forEach(([x, y, col]) => {
    suitcase.add(mesh(new THREE.CircleGeometry(0.12, 16), mat(col), x, y, 0.26));
  });
  suitcase.position.set(-2.0, 0.2, 2.2);
  suitcase.rotation.y = 0.5;
  root.add(suitcase); hotspots.set('contact', suitcase);

  // Decoration: badminton racket leaning on wall
  const racket = new THREE.Group();
  racket.add(mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 24), mat(C.white), 0, 1.1, 0));
  racket.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), mat(C.plum), 0, 0.42, 0));
  racket.position.set(3.6, 0.2, -3.7);
  racket.rotation.z = -0.25;
  root.add(racket);

  // Little round table (avatar stands near it in P3)
  root.add(mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 28), mat(C.white), 0.9, 1.05, 0.4));
  root.add(mesh(new THREE.CylinderGeometry(0.08, 0.25, 0.95, 12), mat(C.hot), 0.9, 0.6, 0.4));

  // Clouds
  const clouds = new THREE.Group();
  const cloudMat = mat(0xffffff, { roughness: 1 });
  for (let i = 0; i < 7; i++) {
    const c = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.7 + Math.random() * 0.6, 12, 10), cloudMat);
      s.position.set(k * 0.9 - 1.3, Math.random() * 0.4, Math.random() * 0.5);
      c.add(s);
    }
    const a = (i / 7) * Math.PI * 2;
    c.position.set(Math.cos(a) * 14, -2 + Math.random() * 6, Math.sin(a) * 14);
    c.userData.phase = Math.random() * 6;
    clouds.add(c);
  }
  root.add(clouds);

  scene.add(root);

  function animate(t) {
    ball.rotation.y = t * 0.25;
    root.position.y = Math.sin(t * 0.6) * 0.08;
    clouds.children.forEach((c) => { c.position.y += Math.sin(t * 0.5 + c.userData.phase) * 0.002; });
    clouds.rotation.y = t * 0.01;
  }

  return { root, hotspots, animate, avatarSpot: new THREE.Vector3(0.9, 0.2, 1.6) };
}
