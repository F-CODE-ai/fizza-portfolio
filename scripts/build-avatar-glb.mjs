// Generates public/models/chef-fizz.glb (GLB 2.0 binary) — sculpted, non-blocky 3D avatar
// modeled after Fizza's reference photo:
//   - Warm sculpted face (almond eyes, dark irises + catchlights, lashes, brows, nose, smiling lips, soft blush)
//   - Long flowing layered dark-brown hair (sculpted crown + side part + curved curtain bangs + shoulder/back cascades)
//   - Woven tan/cream/slate plaid collared button-up shirt with rolled 3/4 sleeves + subtle pink-gold heart pin
//   - Relaxed washed blue denim jeans with rolled cuffs + brown double-buckle slide sandals
//   - Gold wristwatch + iced coffee latte cup with green lid and white straw
//   - Smooth animations: "idle", "wave", "talk"
import * as THREE from 'three';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

// ---------------------------------------------------------------------------
// 1. Procedural PBR PNG Textures (embedded directly inside GLB)
// Sampled directly from Fizza's reference photo:
//   - Rich caramel-tan base (#9e7347) with chocolate (#3d2617), hazelnut (#654327),
//     slate-olive (#505a49), and warm ochre (#b58539) woven plaid checks (NO washed-out white/cream!)
//   - Authentic medium-dark vintage indigo blue denim (#2c4566) with twill lines & gold stitching
//   - Rich dark espresso / chestnut brown hair (#2a150c)
// ---------------------------------------------------------------------------
async function createPlaidTexturePNG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <!-- Rich warm golden-tan flannel base from photo -->
    <rect width="512" height="512" fill="#9e7347"/>

    <!-- Broad chocolate brown check bands (vertical & horizontal) -->
    <g opacity="0.65" fill="#3d2617">
      <rect x="0" y="0" width="48" height="512"/><rect x="128" y="0" width="48" height="512"/>
      <rect x="256" y="0" width="48" height="512"/><rect x="384" y="0" width="48" height="512"/>
      <rect x="0" y="0" width="512" height="48"/><rect x="0" y="128" width="512" height="48"/>
      <rect x="0" y="256" width="512" height="48"/><rect x="0" y="384" width="512" height="48"/>
    </g>

    <!-- Olive-slate secondary plaid bands matching reference shirt -->
    <g opacity="0.55" fill="#4d5948">
      <rect x="76" y="0" width="36" height="512"/><rect x="204" y="0" width="36" height="512"/>
      <rect x="332" y="0" width="36" height="512"/><rect x="460" y="0" width="36" height="512"/>
      <rect x="0" y="76" width="512" height="36"/><rect x="0" y="204" width="512" height="36"/>
      <rect x="0" y="332" width="512" height="36"/><rect x="0" y="460" width="512" height="36"/>
    </g>

    <!-- Dark espresso intersecting crossing squares -->
    <g opacity="0.80" fill="#24140b">
      <rect x="0" y="0" width="48" height="48"/><rect x="128" y="0" width="48" height="48"/>
      <rect x="256" y="0" width="48" height="48"/><rect x="384" y="0" width="48" height="48"/>
      <rect x="0" y="128" width="48" height="48"/><rect x="128" y="128" width="48" height="48"/>
      <rect x="256" y="128" width="48" height="48"/><rect x="384" y="128" width="48" height="48"/>
      <rect x="0" y="256" width="48" height="48"/><rect x="128" y="256" width="48" height="48"/>
      <rect x="256" y="256" width="48" height="48"/><rect x="384" y="256" width="48" height="48"/>
      <rect x="0" y="384" width="48" height="48"/><rect x="128" y="384" width="48" height="48"/>
      <rect x="256" y="384" width="48" height="48"/><rect x="384" y="384" width="48" height="48"/>
    </g>

    <!-- Warm ochre/amber accent pin-stripes -->
    <g opacity="0.75" fill="#ba8c42">
      <rect x="22" y="0" width="4" height="512"/><rect x="150" y="0" width="4" height="512"/>
      <rect x="278" y="0" width="4" height="512"/><rect x="406" y="0" width="4" height="512"/>
      <rect x="0" y="22" width="512" height="4"/><rect x="0" y="150" width="512" height="4"/>
      <rect x="0" y="278" width="512" height="4"/><rect x="0" y="406" width="512" height="4"/>
    </g>

    <!-- Muted warm beige fine thread (subtle, non-white) -->
    <g opacity="0.35" fill="#cbb79f">
      <rect x="92" y="0" width="3" height="512"/><rect x="220" y="0" width="3" height="512"/>
      <rect x="348" y="0" width="3" height="512"/><rect x="476" y="0" width="3" height="512"/>
      <rect x="0" y="92" width="512" height="3"/><rect x="0" y="220" width="512" height="3"/>
      <rect x="0" y="348" width="512" height="3"/><rect x="0" y="476" width="512" height="3"/>
    </g>
  </svg>`;
  return sharp(Buffer.from(svg)).resize(256, 256).png({ compressionLevel: 9 }).toBuffer();
}

async function createDenimTexturePNG() {
  let stripes = '';
  for (let i = 0; i < 512; i += 6) {
    stripes += `<line x1="${i}" y1="0" x2="${i + 14}" y2="512" stroke="#1c2e47" stroke-width="2" opacity="0.32"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="wash" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#2c4465"/>
        <stop offset="45%" stop-color="#3c5b82"/>
        <stop offset="55%" stop-color="#3e5f87"/>
        <stop offset="100%" stop-color="#283e5c"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#wash)"/>
    ${stripes}
    <line x1="256" y1="0" x2="256" y2="512" stroke="#b88842" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.75"/>
  </svg>`;
  return sharp(Buffer.from(svg)).resize(256, 256).png({ compressionLevel: 9 }).toBuffer();
}

async function createHairTexturePNG() {
  let strands = '';
  for (let i = 0; i < 256; i += 4) {
    const col = i % 12 === 0 ? '#5b3928' : i % 8 === 0 ? '#2b170f' : '#43271b';
    strands += `<rect x="${i}" y="0" width="2.5" height="256" fill="${col}" opacity="0.55"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#3a2117"/>
    ${strands}
  </svg>`;
  return sharp(Buffer.from(svg)).resize(256, 256).png({ palette: true, compressionLevel: 9 }).toBuffer();
}

async function createLatteTexturePNG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs>
      <linearGradient id="coffee" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f7efe6"/>
        <stop offset="28%" stop-color="#ebd5bc"/>
        <stop offset="65%" stop-color="#c99b6d"/>
        <stop offset="100%" stop-color="#a87649"/>
      </linearGradient>
    </defs>
    <rect width="256" height="256" fill="url(#coffee)"/>
    <circle cx="128" cy="135" r="24" fill="#1b7a58" opacity="0.72"/>
  </svg>`;
  return sharp(Buffer.from(svg)).resize(256, 256).png({ palette: true, compressionLevel: 9 }).toBuffer();
}

// ---------------------------------------------------------------------------
// 2. Smooth Geometry Sculpting Helpers
// ---------------------------------------------------------------------------
function ensureUVAndIndex(geom) {
  let g = geom;
  if (!g.index) {
    // Keep non-indexed if needed or index cleanly; Three.js primitive geometries are indexed
    const count = g.attributes.position.count;
    const idx = new Uint32Array(count);
    for (let i = 0; i < count; i++) idx[i] = i;
    g.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) {
    const count = g.attributes.position.count;
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
  }
  return g;
}

function transformGeom(geom, { sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, tx = 0, ty = 0, tz = 0 } = {}) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
  m.compose(new THREE.Vector3(tx, ty, tz), q, new THREE.Vector3(sx, sy, sz));
  geom.applyMatrix4(m);
  geom.computeVertexNormals();
  return ensureUVAndIndex(geom);
}

// Sculpted smooth oval head matching natural feminine cheek/jaw/chin silhouette
function createSculptedHead() {
  const g = new THREE.SphereGeometry(0.148, 40, 32);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Slightly elongated oval height
    y *= 1.15;

    // Taper smoothly toward lower jaw & soft chin
    if (y < 0.0) {
      const t = Math.min(1, -y / 0.17);
      const jawNarrow = 1.0 - 0.34 * t * t;
      x *= jawNarrow;
      z *= 1.0 - 0.14 * t;
      if (z > 0.03) z += 0.016 * Math.sin(t * Math.PI * 0.85); // soft chin projection
    }

    // Subtle soft cheek fullness around y = -0.02, z > 0
    if (z > 0.02 && y > -0.08 && y < 0.03) {
      const cheek = Math.exp(-Math.pow((y + 0.025) / 0.04, 2)) * 0.012;
      z += cheek * Math.max(0, 1 - Math.abs(x) / 0.13);
    }

    // Subtle forehead slope
    if (y > 0.05 && z > 0.03) {
      z -= (y - 0.05) * 0.12;
    }

    pos.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return ensureUVAndIndex(g);
}

// Smooth tapered elliptical ribbon along a CatmullRomCurve3 (for silky hair strands, eyebrows, lips)
function createTaperedRibbon(points, { segs = 24, radialSegs = 12, rx0 = 0.04, rx1 = 0.012, ry0 = 0.018, ry1 = 0.006, twist = 0 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  const frames = curve.computeFrenetFrames(segs, false);
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const center = curve.getPointAt(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    // Smooth mid-belly profile so hair strands start softly, flare slightly, and taper nicely at ends
    const taper = Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.5) * (1 - Math.pow(t, 2.4) * 0.72) + (1 - t) * 0.25;
    const rx = (rx0 * (1 - t) + rx1 * t) * Math.max(0.22, taper);
    const ry = (ry0 * (1 - t) + ry1 * t) * Math.max(0.25, taper);
    const angOffset = twist * t;

    for (let j = 0; j <= radialSegs; j++) {
      const theta = (j / radialSegs) * Math.PI * 2 + angOffset;
      const cx = Math.cos(theta) * rx;
      const cy = Math.sin(theta) * ry;
      const vx = center.x + cx * N.x + cy * B.x;
      const vy = center.y + cx * N.y + cy * B.y;
      const vz = center.z + cx * N.z + cy * B.z;
      positions.push(vx, vy, vz);
      uvs.push(j / radialSegs, t * 2);
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + j + 1;
      const d = i * stride + j + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

// Sculpted relaxed button-up shirt torso using LatheGeometry + gentle natural front/back depth scaling
function createShirtTorso() {
  const pts = [
    new THREE.Vector2(0.01, -0.05),
    new THREE.Vector2(0.145, -0.045), // relaxed hem
    new THREE.Vector2(0.148, 0.02),
    new THREE.Vector2(0.132, 0.12),  // waist
    new THREE.Vector2(0.148, 0.24),  // bust/ribcage
    new THREE.Vector2(0.160, 0.34),  // upper chest/shoulders
    new THREE.Vector2(0.110, 0.40),  // collarbone slope
    new THREE.Vector2(0.055, 0.42),  // collar opening
  ];
  const g = new THREE.LatheGeometry(pts, 32);
  // Make chest/waist naturally elliptical (wider side-to-side, slimmer front-to-back)
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i) * 0.72;
    // Gentle bust fullness around y = 0.24, z > 0
    if (z > 0.01 && y > 0.15 && y < 0.34) {
      const bust = Math.exp(-Math.pow((y - 0.245) / 0.06, 2)) * 0.026 * Math.max(0, 1 - Math.abs(x) / 0.15);
      z += bust;
    }
    pos.setXYZ(i, x * 1.05, y, z);
  }
  g.computeVertexNormals();
  return ensureUVAndIndex(g);
}

// Sculpted relaxed denim hips/pelvis
function createDenimPelvis() {
  const pts = [
    new THREE.Vector2(0.01, -0.10),
    new THREE.Vector2(0.142, -0.08),
    new THREE.Vector2(0.155, -0.01),
    new THREE.Vector2(0.145, 0.055),
    new THREE.Vector2(0.128, 0.085),
    new THREE.Vector2(0.01, 0.085),
  ];
  const g = new THREE.LatheGeometry(pts, 28);
  return transformGeom(g, { sx: 1.04, sz: 0.76 });
}

// Relaxed straight-leg jeans leg (y from 0 at ankle cuff to 0.74 at hip)
function createDenimLeg() {
  const pts = [
    new THREE.Vector2(0.001, 0.0),
    new THREE.Vector2(0.068, 0.005), // cuff bottom
    new THREE.Vector2(0.072, 0.04),  // rolled cuff rim
    new THREE.Vector2(0.066, 0.05),
    new THREE.Vector2(0.072, 0.22),  // shin
    new THREE.Vector2(0.076, 0.40),  // knee
    new THREE.Vector2(0.086, 0.62),  // thigh
    new THREE.Vector2(0.090, 0.74),  // hip join
  ];
  const g = new THREE.LatheGeometry(pts, 24);
  return transformGeom(g, { sx: 0.96, sz: 1.02 });
}

// Smooth tapered human limb (arm or ankle)
function createTaperedCylinder(rTop, rBot, h, segs = 20) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, segs, 4);
  return ensureUVAndIndex(g);
}

// Smooth sculpted hand with thumb
function createHand(isLeft) {
  const g = new THREE.SphereGeometry(0.036, 18, 14);
  return transformGeom(g, { sx: 0.85, sy: 1.25, sz: 0.55, rz: isLeft ? -0.08 : 0.08 });
}

// ---------------------------------------------------------------------------
// 3. GLB 2.0 Serializer supporting embedded PNG textures & Three.js BufferGeometries
// ---------------------------------------------------------------------------
async function buildAvatarGLB() {
  const [plaidPNG, denimPNG, hairPNG, lattePNG] = await Promise.all([
    createPlaidTexturePNG(),
    createDenimTexturePNG(),
    createHairTexturePNG(),
    createLatteTexturePNG(),
  ]);

  const chunks = [];
  const bufferViews = [];
  const accessors = [];
  const images = [];
  const textures = [];
  const samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
  let byteOffset = 0;

  function pushBytes(u8, target) {
    const pad = (4 - (u8.byteLength % 4)) % 4;
    const bvIndex = bufferViews.length;
    const bv = { buffer: 0, byteOffset, byteLength: u8.byteLength };
    if (target) bv.target = target;
    bufferViews.push(bv);
    chunks.push(u8);
    if (pad) chunks.push(new Uint8Array(pad));
    byteOffset += u8.byteLength + pad;
    return bvIndex;
  }

  function addImageTexture(pngBuffer, name) {
    const bv = pushBytes(new Uint8Array(pngBuffer));
    const imgIdx = images.length;
    images.push({ name, bufferView: bv, mimeType: 'image/png' });
    const texIdx = textures.length;
    textures.push({ sampler: 0, source: imgIdx });
    return texIdx;
  }

  const plaidTex = addImageTexture(plaidPNG, 'PlaidShirt');
  const denimTex = addImageTexture(denimPNG, 'DenimJeans');
  const hairTex = addImageTexture(hairPNG, 'BrownHair');
  const latteTex = addImageTexture(lattePNG, 'IcedLatte');

  const materials = [
    // 0: Warm South Asian skin
    { name: 'Skin', pbrMetallicRoughness: { baseColorFactor: [0.85, 0.64, 0.51, 1], metallicFactor: 0.01, roughnessFactor: 0.62 } },
    // 1: Rosy cheek blush
    { name: 'Blush', pbrMetallicRoughness: { baseColorFactor: [0.89, 0.50, 0.48, 1], metallicFactor: 0.0, roughnessFactor: 0.68 } },
    // 2: Soft rose lips
    { name: 'Lips', pbrMetallicRoughness: { baseColorFactor: [0.74, 0.30, 0.38, 1], metallicFactor: 0.02, roughnessFactor: 0.40 } },
    // 3: Long glossy dark-brown hair
    { name: 'Hair', pbrMetallicRoughness: { baseColorTexture: { index: hairTex }, baseColorFactor: [0.55, 0.32, 0.20, 1], metallicFactor: 0.05, roughnessFactor: 0.42 } },
    // 4: Eye sclera white
    { name: 'Sclera', pbrMetallicRoughness: { baseColorFactor: [0.99, 0.98, 0.98, 1], metallicFactor: 0.0, roughnessFactor: 0.18 } },
    // 5: Dark lash / pupil
    { name: 'DarkEye', pbrMetallicRoughness: { baseColorFactor: [0.09, 0.04, 0.03, 1], metallicFactor: 0.05, roughnessFactor: 0.12 } },
    // 6: Glossy white catchlight
    { name: 'Catchlight', emissiveFactor: [0.95, 0.95, 0.95], pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], roughnessFactor: 0.1 } },
    // 7: Woven Plaid Shirt - tinted with rich warm caramel tan so it NEVER blows out to white under lights
    { name: 'PlaidShirt', pbrMetallicRoughness: { baseColorTexture: { index: plaidTex }, baseColorFactor: [0.82, 0.64, 0.45, 1], metallicFactor: 0.0, roughnessFactor: 0.88 } },
    // 8: Washed Blue Denim Jeans - authentic medium indigo blue denim wash
    { name: 'DenimJeans', pbrMetallicRoughness: { baseColorTexture: { index: denimTex }, baseColorFactor: [0.48, 0.62, 0.82, 1], metallicFactor: 0.0, roughnessFactor: 0.82 } },
    // 9: Lighter rolled denim cuff
    { name: 'DenimCuff', pbrMetallicRoughness: { baseColorFactor: [0.46, 0.58, 0.74, 1], metallicFactor: 0.0, roughnessFactor: 0.8 } },
    // 10: Brown sandal strap leather
    { name: 'SandalLeather', pbrMetallicRoughness: { baseColorFactor: [0.36, 0.21, 0.14, 1], metallicFactor: 0.05, roughnessFactor: 0.55 } },
    // 11: Sandal cork footbed
    { name: 'CorkSole', pbrMetallicRoughness: { baseColorFactor: [0.72, 0.54, 0.39, 1], metallicFactor: 0.0, roughnessFactor: 0.8 } },
    // 12: Gold watch & heart pin
    { name: 'Gold', pbrMetallicRoughness: { baseColorFactor: [0.92, 0.74, 0.30, 1], metallicFactor: 0.78, roughnessFactor: 0.24 } },
    // 13: Barbie pink accent (heart pin / subtle touch)
    { name: 'BarbiePink', pbrMetallicRoughness: { baseColorFactor: [0.90, 0.22, 0.52, 1], metallicFactor: 0.05, roughnessFactor: 0.38 } },
    // 14: Iced Latte Cup
    { name: 'LatteCup', pbrMetallicRoughness: { baseColorTexture: { index: latteTex }, baseColorFactor: [1, 1, 1, 1], metallicFactor: 0.02, roughnessFactor: 0.25 } },
    // 15: Green Cup Lid
    { name: 'CupLidGreen', pbrMetallicRoughness: { baseColorFactor: [0.11, 0.47, 0.34, 1], metallicFactor: 0.05, roughnessFactor: 0.35 } },
    // 16: Pearl white shirt buttons & straw
    { name: 'CreamWhite', pbrMetallicRoughness: { baseColorFactor: [0.98, 0.96, 0.94, 1], metallicFactor: 0.05, roughnessFactor: 0.3 } },
    // 17: Warm chestnut-brown iris
    { name: 'IrisBrown', pbrMetallicRoughness: { baseColorFactor: [0.28, 0.14, 0.08, 1], metallicFactor: 0.04, roughnessFactor: 0.18 } },
  ];

  const meshes = [];
  function buildMeshFromParts(name, parts) {
    const primitives = [];
    for (const [geom, matIndex] of parts) {
      ensureUVAndIndex(geom);
      const posArr = new Float32Array(geom.attributes.position.array);
      const normArr = new Float32Array(geom.attributes.normal.array);
      const uvArr = new Float32Array(geom.attributes.uv.array);
      const rawIdx = geom.index.array;
      const idxArr = posArr.length / 3 > 65535 ? new Uint32Array(rawIdx) : new Uint16Array(rawIdx);
      const idxCompType = idxArr instanceof Uint32Array ? 5125 : 5123;

      const min = [Infinity, Infinity, Infinity];
      const max = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < posArr.length; i += 3) {
        for (let k = 0; k < 3; k++) {
          if (posArr[i + k] < min[k]) min[k] = posArr[i + k];
          if (posArr[i + k] > max[k]) max[k] = posArr[i + k];
        }
      }

      const posBV = pushBytes(new Uint8Array(posArr.buffer), 34962);
      const normBV = pushBytes(new Uint8Array(normArr.buffer), 34962);
      const uvBV = pushBytes(new Uint8Array(uvArr.buffer), 34962);
      const idxBV = pushBytes(new Uint8Array(idxArr.buffer), 34963);

      const posAcc = accessors.length;
      accessors.push({ bufferView: posBV, componentType: 5126, count: posArr.length / 3, type: 'VEC3', min, max });
      const normAcc = accessors.length;
      accessors.push({ bufferView: normBV, componentType: 5126, count: normArr.length / 3, type: 'VEC3' });
      const uvAcc = accessors.length;
      accessors.push({ bufferView: uvBV, componentType: 5126, count: uvArr.length / 2, type: 'VEC2' });
      const idxAcc = accessors.length;
      accessors.push({ bufferView: idxBV, componentType: idxCompType, count: idxArr.length, type: 'SCALAR' });

      primitives.push({
        attributes: { POSITION: posAcc, NORMAL: normAcc, TEXCOORD_0: uvAcc },
        indices: idxAcc,
        material: matIndex,
      });
    }
    const idx = meshes.length;
    meshes.push({ name, primitives });
    return idx;
  }

  // --- Lower Body: Articulated Hips + Separate LegRight & LegLeft (for walking!) ---
  const hipsMesh = buildMeshFromParts('Hips', [
    [transformGeom(createDenimPelvis(), { ty: 0.85 }), 8],
  ]);

  function buildLegMesh(name, side) {
    const legParts = [
      // Denim leg (local hip pivot is at y = 0.85, so bottom cuff is at -0.74)
      [transformGeom(createDenimLeg(), { ty: -0.74 }), 8],
      // Rolled lighter cuff at ankle
      [transformGeom(new THREE.TorusGeometry(0.068, 0.015, 12, 24), { rx: Math.PI / 2, ty: -0.725 }), 9],
      // Ankle skin
      [transformGeom(createTaperedCylinder(0.040, 0.036, 0.10, 18), { ty: -0.77 }), 0],
      // Sculpted bare foot + toes
      [transformGeom(new THREE.SphereGeometry(0.044, 18, 14), { sx: 0.92, sy: 0.55, sz: 1.72, ty: -0.814, tz: 0.04 }), 0],
      // Cork & dark outsole sandal base (sole bottom sits right at world y = 0.0!)
      [transformGeom(new THREE.CylinderGeometry(0.052, 0.048, 0.024, 20), { sx: 0.98, sz: 1.92, ty: -0.836, tz: 0.042 }), 11],
      // Brown leather double straps
      [transformGeom(new THREE.TorusGeometry(0.046, 0.011, 10, 20, Math.PI), { ty: -0.816, tz: 0.068 }), 10],
      [transformGeom(new THREE.TorusGeometry(0.048, 0.011, 10, 20, Math.PI), { ty: -0.808, tz: 0.015 }), 10],
      // Gold sandal buckles
      [transformGeom(new THREE.SphereGeometry(0.009, 10, 8), { tx: side * 0.044, ty: -0.806, tz: 0.068 }), 12],
      [transformGeom(new THREE.SphereGeometry(0.009, 10, 8), { tx: side * 0.046, ty: -0.800, tz: 0.015 }), 12],
    ];
    return buildMeshFromParts(name, legParts);
  }
  const legRightMesh = buildLegMesh('LegRight', -1);
  const legLeftMesh = buildLegMesh('LegLeft', 1);

  // --- Upper Torso (Plaid Button-Up Shirt, Collar, Buttons, Pink Heart Pin) ---
  const torsoParts = [
    [createShirtTorso(), 7],
    // Smooth V-neck skin chest area
    [transformGeom(new THREE.SphereGeometry(0.062, 20, 14), { sx: 1.05, sy: 0.85, sz: 0.72, ty: 0.375, tz: 0.048 }), 0],
    // Smooth rounded folded shirt collar lapels
    [createTaperedRibbon([[0.0, 0.415, 0.045], [-0.048, 0.395, 0.078], [-0.068, 0.345, 0.095], [-0.020, 0.305, 0.115]], { segs: 14, radialSegs: 10, rx0: 0.022, rx1: 0.012, ry0: 0.008, ry1: 0.006 }), 7],
    [createTaperedRibbon([[0.0, 0.415, 0.045], [0.048, 0.395, 0.078], [0.068, 0.345, 0.095], [0.020, 0.305, 0.115]], { segs: 14, radialSegs: 10, rx0: 0.022, rx1: 0.012, ry0: 0.008, ry1: 0.006 }), 7],
    // Shirt collar back rim
    [transformGeom(new THREE.TorusGeometry(0.066, 0.014, 10, 24, Math.PI * 1.15), { rx: Math.PI / 2, ry: Math.PI, tz: -0.008, ty: 0.415 }), 7],
    // Front placket strip
    [transformGeom(new THREE.CylinderGeometry(0.013, 0.013, 0.33, 12), { sx: 1.2, sz: 0.4, ty: 0.145, tz: 0.11 }), 7],
  ];
  // Pearl shirt buttons
  for (let b = 0; b < 4; b++) {
    const by = 0.03 + b * 0.078;
    const bz = b === 2 ? 0.128 : b === 1 ? 0.114 : 0.112;
    torsoParts.push([transformGeom(new THREE.SphereGeometry(0.008, 12, 10), { sz: 0.5, ty: by, tz: bz }), 16]);
  }
  // Tiny tasteful pink & gold pin on left chest
  torsoParts.push([transformGeom(new THREE.SphereGeometry(0.015, 14, 12), { sz: 0.45, tx: 0.075, ty: 0.275, tz: 0.116 }), 13]);
  torsoParts.push([transformGeom(new THREE.TorusGeometry(0.017, 0.004, 8, 18), { tx: 0.075, ty: 0.275, tz: 0.116 }), 12]);
  const torsoMesh = buildMeshFromParts('PlaidTorso', torsoParts);

  // --- Head + Face + Long Flowing Dark-Brown Hair ---
  const headParts = [
    // Neck
    [transformGeom(createTaperedCylinder(0.047, 0.057, 0.14, 22), { ty: -0.145 }), 0],
    // Sculpted face/head
    [createSculptedHead(), 0],
    // Left & right ears
    [transformGeom(new THREE.SphereGeometry(0.026, 16, 12), { sx: 0.48, sy: 1.12, sz: 0.78, tx: -0.136, ty: -0.018, tz: -0.008 }), 0],
    [transformGeom(new THREE.SphereGeometry(0.026, 16, 12), { sx: 0.48, sy: 1.12, sz: 0.78, tx: 0.136, ty: -0.018, tz: -0.008 }), 0],
    // Delicate sculpted nose bridge & rounded tip
    [transformGeom(new THREE.SphereGeometry(0.015, 16, 12), { sx: 0.88, sy: 0.78, sz: 1.1, ty: -0.024, tz: 0.162 }), 0],
    [transformGeom(createTaperedCylinder(0.008, 0.012, 0.042, 14), { rx: -0.22, ty: 0.0, tz: 0.155 }), 0],
    // Soft cheek blush (warm subtle rose glow on cheekbones)
    [transformGeom(new THREE.SphereGeometry(0.030, 16, 12), { sx: 1.15, sy: 0.72, sz: 0.25, ry: -0.35, tx: -0.072, ty: -0.036, tz: 0.138 }), 1],
    [transformGeom(new THREE.SphereGeometry(0.030, 16, 12), { sx: 1.15, sy: 0.72, sz: 0.25, ry: 0.35, tx: 0.072, ty: -0.036, tz: 0.138 }), 1],
    // Sculpted warm smiling lips (upper bow + soft fuller lower lip seated clearly on front face)
    [createTaperedRibbon([[-0.032, -0.064, 0.142], [-0.014, -0.062, 0.155], [0, -0.064, 0.158], [0.014, -0.062, 0.155], [0.032, -0.064, 0.142]], { segs: 16, radialSegs: 10, rx0: 0.0068, rx1: 0.0068, ry0: 0.0062, ry1: 0.0062 }), 2],
    [createTaperedRibbon([[-0.028, -0.070, 0.142], [0, -0.078, 0.157], [0.028, -0.070, 0.142]], { segs: 14, radialSegs: 10, rx0: 0.0085, rx1: 0.0085, ry0: 0.0075, ry1: 0.0075 }), 2],
  ];

  // Expressive Almond Eyes + Warm Brown Irises + Pupils + Catchlights + Upper Lashes + Arched Eyebrows
  for (const s of [-1, 1]) {
    const ex = s * 0.050;
    const ey = 0.012;
    const ez = 0.136;
    // White sclera almond
    headParts.push([transformGeom(new THREE.SphereGeometry(0.0285, 22, 16), { sx: 1.18, sy: 0.88, sz: 0.70, ry: s * 0.12, tx: ex, ty: ey, tz: ez }), 4]);
    // Warm chestnut-brown iris dome
    headParts.push([transformGeom(new THREE.SphereGeometry(0.019, 20, 16), { sx: 1.0, sy: 1.0, sz: 0.65, tx: ex, ty: ey, tz: ez + 0.011 }), 17]);
    // Deep pupil center
    headParts.push([transformGeom(new THREE.SphereGeometry(0.0105, 14, 12), { sx: 1.0, sy: 1.0, sz: 0.58, tx: ex, ty: ey, tz: ez + 0.017 }), 5]);
    // Crisp white specular catchlight
    headParts.push([transformGeom(new THREE.SphereGeometry(0.0055, 10, 8), { tx: ex + 0.006, ty: ey + 0.006, tz: ez + 0.022 }), 6]);
    // Upper curved eyelash line
    headParts.push([createTaperedRibbon(
      [[ex - 0.031, ey + 0.003, ez + 0.008], [ex, ey + 0.025, ez + 0.018], [ex + 0.031, ey + 0.003, ez + 0.008]],
      { segs: 14, radialSegs: 8, rx0: 0.0052, rx1: 0.0046, ry0: 0.0042, ry1: 0.0042 }
    ), 5]);
    // Soft arched dark-brown eyebrow
    headParts.push([createTaperedRibbon(
      [[ex - s * 0.028, ey + 0.040, ez + 0.014], [ex + s * 0.004, ey + 0.052, ez + 0.019], [ex + s * 0.034, ey + 0.042, ez + 0.008]],
      { segs: 14, radialSegs: 8, rx0: 0.0056, rx1: 0.0032, ry0: 0.0044, ry1: 0.0028 }
    ), 3]);
  }

  // Fitted Smooth Hair Cap (natural center-part hairline framing forehead)
  headParts.push([transformGeom(new THREE.SphereGeometry(0.157, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.62), { sx: 1.04, sy: 1.14, sz: 1.04, rx: -0.28, ty: 0.015, tz: -0.022 }), 3]);
  headParts.push([transformGeom(new THREE.SphereGeometry(0.152, 30, 22), { sx: 1.02, sy: 1.06, sz: 1.04, ty: 0.026, tz: -0.028 }), 3]);

  // Smooth Swept Face-Framing Curtain Layers & Front Shoulder Cascades (left & right, starting flush at center part)
  for (const s of [-1, 1]) {
    // Upper parted sweep curving smoothly across top-front hairline & temple
    headParts.push([createTaperedRibbon([
      [s * 0.008, 0.132, 0.105],
      [s * 0.068, 0.112, 0.112],
      [s * 0.128, 0.050, 0.092],
      [s * 0.146, -0.06, 0.075],
      [s * 0.132, -0.22, 0.095],
      [s * 0.105, -0.37, 0.112],
    ], { segs: 26, radialSegs: 12, rx0: 0.036, rx1: 0.013, ry0: 0.020, ry1: 0.008 }), 3]);

    // Outer voluminous shoulder-framing long hair tress
    headParts.push([createTaperedRibbon([
      [s * 0.028, 0.145, 0.035],
      [s * 0.115, 0.105, 0.042],
      [s * 0.162, -0.01, 0.025],
      [s * 0.172, -0.17, 0.045],
      [s * 0.148, -0.33, 0.088],
      [s * 0.128, -0.44, 0.100],
    ], { segs: 28, radialSegs: 12, rx0: 0.044, rx1: 0.016, ry0: 0.022, ry1: 0.009 }), 3]);
  }

  // Lush Back Hair Waterfall (7 smooth curved ribbons cascading down her back)
  for (let i = -3; i <= 3; i++) {
    const xOff = i * 0.042;
    const zCurve = -0.112 - (1 - Math.abs(i) / 4) * 0.035;
    headParts.push([createTaperedRibbon([
      [xOff * 0.65, 0.135, -0.055],
      [xOff * 1.12, 0.03, zCurve],
      [xOff * 1.22, -0.14, zCurve - 0.018],
      [xOff * 1.12, -0.32, zCurve - 0.005],
      [xOff * 0.92, -0.47 + Math.abs(i) * 0.02, zCurve + 0.015],
    ], { segs: 24, radialSegs: 10, rx0: 0.048, rx1: 0.018, ry0: 0.022, ry1: 0.009 }), 3]);
  }
  const headMesh = buildMeshFromParts('HeadAndHair', headParts);

  // --- Right Arm (at -X from viewer's perspective; FREE for waving + Gold Wristwatch!) ---
  const armRightParts = [
    // Shoulder blend in plaid
    [transformGeom(new THREE.SphereGeometry(0.052, 18, 14), { sx: 1.0, sy: 0.95, sz: 0.92, tx: 0.015, ty: 0.0 }), 7],
    // Rolled 3/4 plaid upper sleeve
    [transformGeom(createTaperedCylinder(0.049, 0.045, 0.21, 20), { ty: -0.11 }), 7],
    // Rolled sleeve cuff
    [transformGeom(new THREE.TorusGeometry(0.046, 0.010, 10, 20), { rx: Math.PI / 2, ty: -0.215 }), 7],
    // Bare forearm
    [transformGeom(createTaperedCylinder(0.037, 0.029, 0.23, 18), { ty: -0.32 }), 0],
    // Gold wristwatch band & round watch face
    [transformGeom(new THREE.TorusGeometry(0.031, 0.005, 8, 18), { rx: Math.PI / 2, ty: -0.39 }), 12],
    [transformGeom(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 16), { rz: Math.PI / 2, tx: -0.031, ty: -0.39 }), 12],
    // Sculpted hand
    [transformGeom(createHand(false), { ty: -0.46 }), 0],
  ];
  const armRightMesh = buildMeshFromParts('ArmRight', armRightParts);

  // --- Left Arm (at +X; comfortably bent holding Iced Latte Cup with Green Lid & Straw!) ---
  const armLeftParts = [
    // Shoulder blend in plaid
    [transformGeom(new THREE.SphereGeometry(0.052, 18, 14), { sx: 1.0, sy: 0.95, sz: 0.92, tx: -0.015, ty: 0.0 }), 7],
    // Rolled 3/4 plaid upper sleeve (angled slightly outward & forward)
    [transformGeom(createTaperedCylinder(0.049, 0.045, 0.21, 20), { rz: 0.22, rx: -0.22, tx: 0.025, ty: -0.105, tz: 0.025 }), 7],
    // Rolled sleeve cuff near elbow
    [transformGeom(new THREE.TorusGeometry(0.046, 0.010, 10, 20), { rx: Math.PI / 2 - 0.22, rz: 0.22, tx: 0.048, ty: -0.205, tz: 0.048 }), 7],
    // Forearm bent softly inward & forward to hold iced coffee cup clearly out in front
    [transformGeom(createTaperedCylinder(0.036, 0.029, 0.22, 18), { rx: -1.18, rz: -0.38, tx: 0.012, ty: -0.242, tz: 0.135 }), 0],
    // Left hand cradling cup
    [transformGeom(createHand(true), { rx: -1.0, tx: -0.035, ty: -0.282, tz: 0.225 }), 0],
    // Iced Latte Cup (clearly visible!)
    [transformGeom(createTaperedCylinder(0.042, 0.031, 0.125, 22), { tx: -0.042, ty: -0.258, tz: 0.245 }), 14],
    // Signature teal-green lid
    [transformGeom(new THREE.CylinderGeometry(0.044, 0.044, 0.016, 22), { tx: -0.042, ty: -0.191, tz: 0.245 }), 15],
    // White straw
    [transformGeom(new THREE.CylinderGeometry(0.004, 0.004, 0.095, 10), { rz: 0.14, rx: -0.12, tx: -0.048, ty: -0.148, tz: 0.250 }), 16],
  ];
  const armLeftMesh = buildMeshFromParts('ArmLeftWithLatte', armLeftParts);

  // ---------------------------------------------------------------------------
  // 4. Node Hierarchy & Smooth Keyframed Animations (idle, walk, wave, talk)
  // ---------------------------------------------------------------------------
  // Nodes:
  // 0: ChefFizzRoot (y = 0 at sandals bottom!)
  // 1: Hips (mesh 0)
  // 2: PlaidTorso (mesh 3, child of Hips at y = 0.89)
  // 3: HeadAndHair (mesh 4, child of Torso at y = 0.59)
  // 4: ArmRight (mesh 5, child of Torso at (-0.164, 0.355, 0))
  // 5: ArmLeftWithLatte (mesh 6, child of Torso at (+0.164, 0.355, 0))
  // 6: LegRight (mesh 1, child of Hips at (-0.095, 0.85, 0))
  // 7: LegLeft (mesh 2, child of Hips at (+0.095, 0.85, 0))
  const nodes = [
    { name: 'ChefFizzRoot', children: [1], translation: [0, 0, 0] },
    { name: 'Hips', mesh: hipsMesh, translation: [0, 0, 0], rotation: [0, 0, 0, 1], children: [2, 6, 7] },
    { name: 'PlaidTorso', mesh: torsoMesh, translation: [0, 0.89, 0], rotation: [0, 0, 0, 1], children: [3, 4, 5] },
    { name: 'HeadAndHair', mesh: headMesh, translation: [0, 0.59, 0], rotation: [0, 0, 0, 1] },
    { name: 'ArmRight', mesh: armRightMesh, translation: [-0.164, 0.355, 0], rotation: [0, 0, -0.12, 0.9928] },
    { name: 'ArmLeftWithLatte', mesh: armLeftMesh, translation: [0.164, 0.355, 0], rotation: [0, 0, 0.06, 0.9982] },
    { name: 'LegRight', mesh: legRightMesh, translation: [-0.095, 0.85, 0], rotation: [0, 0, 0, 1] },
    { name: 'LegLeft', mesh: legLeftMesh, translation: [0.095, 0.85, 0], rotation: [0, 0, 0, 1] },
  ];

  function addScalarAcc(arr) {
    const f = new Float32Array(arr);
    const bv = pushBytes(new Uint8Array(f.buffer));
    const idx = accessors.length;
    accessors.push({ bufferView: bv, componentType: 5126, count: f.length, type: 'SCALAR', min: [Math.min(...arr)], max: [Math.max(...arr)] });
    return idx;
  }
  function addVec3Acc(arr) {
    const f = new Float32Array(arr);
    const bv = pushBytes(new Uint8Array(f.buffer));
    const idx = accessors.length;
    accessors.push({ bufferView: bv, componentType: 5126, count: f.length / 3, type: 'VEC3' });
    return idx;
  }
  function addQuatAcc(arr) {
    const f = new Float32Array(arr);
    const bv = pushBytes(new Uint8Array(f.buffer));
    const idx = accessors.length;
    accessors.push({ bufferView: bv, componentType: 5126, count: f.length / 4, type: 'VEC4' });
    return idx;
  }
  function qEuler(rx, ry, rz) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
    return [q.x, q.y, q.z, q.w];
  }

  // Animation 1: "idle" (lively breathing, natural weight sway, curious head look, soft arm motion)
  const tIdle = addScalarAcc([0, 0.9, 1.8, 2.7, 3.6]);
  const vIdleTorso = addVec3Acc([0, 0.89, 0,  0, 0.905, 0,  0, 0.892, 0,  0, 0.906, 0,  0, 0.89, 0]);
  const qIdleTorso = addQuatAcc([
    ...qEuler(0, -0.05, -0.02),
    ...qEuler(0.02, 0.04, 0.02),
    ...qEuler(0, 0.07, 0.01),
    ...qEuler(0.02, -0.04, -0.02),
    ...qEuler(0, -0.05, -0.02),
  ]);
  const qIdleHead = addQuatAcc([
    ...qEuler(0.02, -0.14, 0.03),
    ...qEuler(-0.03, 0.08, -0.04),
    ...qEuler(0.04, 0.16, 0.03),
    ...qEuler(-0.02, -0.08, -0.03),
    ...qEuler(0.02, -0.14, 0.03),
  ]);
  const qIdleArmR = addQuatAcc([
    ...qEuler(-0.06, 0, -0.12),
    ...qEuler(0.08, 0, -0.16),
    ...qEuler(-0.04, 0, -0.11),
    ...qEuler(0.06, 0, -0.15),
    ...qEuler(-0.06, 0, -0.12),
  ]);

  // Animation 2: "walk" (full articulated walking stride cycle!)
  const tWalk = addScalarAcc([0, 0.2, 0.4, 0.6, 0.8]);
  const vWalkHips = addVec3Acc([0, 0, 0,  0, 0.026, 0,  0, 0, 0,  0, 0.026, 0,  0, 0, 0]);
  const qWalkLegR = addQuatAcc([
    ...qEuler(0, 0, 0),
    ...qEuler(0.46, 0, 0),
    ...qEuler(0, 0, 0),
    ...qEuler(-0.46, 0, 0),
    ...qEuler(0, 0, 0),
  ]);
  const qWalkLegL = addQuatAcc([
    ...qEuler(0, 0, 0),
    ...qEuler(-0.46, 0, 0),
    ...qEuler(0, 0, 0),
    ...qEuler(0.46, 0, 0),
    ...qEuler(0, 0, 0),
  ]);
  const qWalkArmR = addQuatAcc([
    ...qEuler(0, 0, -0.14),
    ...qEuler(-0.38, 0, -0.14),
    ...qEuler(0, 0, -0.14),
    ...qEuler(0.38, 0, -0.14),
    ...qEuler(0, 0, -0.14),
  ]);
  const qWalkTorso = addQuatAcc([
    ...qEuler(0.03, 0, 0),
    ...qEuler(0.04, -0.10, 0.02),
    ...qEuler(0.03, 0, 0),
    ...qEuler(0.04, 0.10, -0.02),
    ...qEuler(0.03, 0, 0),
  ]);

  // Animation 3: "wave" (right arm raises gracefully & waves side to side, head tilts warmly)
  const tWave = addScalarAcc([0, 0.35, 0.65, 0.95, 1.25, 1.6]);
  const qWaveArm = addQuatAcc([
    ...qEuler(0, 0, -0.14),
    ...qEuler(0.15, 0, -2.30),
    ...qEuler(0.15, 0, -1.82),
    ...qEuler(0.15, 0, -2.32),
    ...qEuler(0.15, 0, -1.82),
    ...qEuler(0, 0, -0.14),
  ]);
  const qWaveHead = addQuatAcc([
    ...qEuler(0, 0, 0),
    ...qEuler(-0.04, -0.10, -0.09),
    ...qEuler(-0.04, 0.06, -0.04),
    ...qEuler(-0.04, -0.10, -0.09),
    ...qEuler(-0.04, 0.06, -0.04),
    ...qEuler(0, 0, 0),
  ]);

  // Animation 4: "talk" (expressive head turns/nods + right hand conversational gesture + torso lean)
  const tTalk = addScalarAcc([0, 0.3, 0.6, 0.9, 1.2]);
  const qTalkHead = addQuatAcc([
    ...qEuler(0, 0, 0),
    ...qEuler(0.10, -0.16, 0.05),
    ...qEuler(-0.06, 0.14, -0.05),
    ...qEuler(0.09, -0.10, 0.04),
    ...qEuler(0, 0, 0),
  ]);
  const qTalkArm = addQuatAcc([
    ...qEuler(0, 0, -0.14),
    ...qEuler(-0.62, 0.25, -0.45),
    ...qEuler(-0.38, 0.12, -0.28),
    ...qEuler(-0.65, 0.25, -0.48),
    ...qEuler(0, 0, -0.14),
  ]);

  const animations = [
    {
      name: 'idle',
      samplers: [
        { input: tIdle, output: vIdleTorso, interpolation: 'LINEAR' },
        { input: tIdle, output: qIdleTorso, interpolation: 'LINEAR' },
        { input: tIdle, output: qIdleHead, interpolation: 'LINEAR' },
        { input: tIdle, output: qIdleArmR, interpolation: 'LINEAR' },
      ],
      channels: [
        { sampler: 0, target: { node: 2, path: 'translation' } },
        { sampler: 1, target: { node: 2, path: 'rotation' } },
        { sampler: 2, target: { node: 3, path: 'rotation' } },
        { sampler: 3, target: { node: 4, path: 'rotation' } },
      ],
    },
    {
      name: 'walk',
      samplers: [
        { input: tWalk, output: vWalkHips, interpolation: 'LINEAR' },
        { input: tWalk, output: qWalkLegR, interpolation: 'LINEAR' },
        { input: tWalk, output: qWalkLegL, interpolation: 'LINEAR' },
        { input: tWalk, output: qWalkArmR, interpolation: 'LINEAR' },
        { input: tWalk, output: qWalkTorso, interpolation: 'LINEAR' },
      ],
      channels: [
        { sampler: 0, target: { node: 1, path: 'translation' } },
        { sampler: 1, target: { node: 6, path: 'rotation' } },
        { sampler: 2, target: { node: 7, path: 'rotation' } },
        { sampler: 3, target: { node: 4, path: 'rotation' } },
        { sampler: 4, target: { node: 2, path: 'rotation' } },
      ],
    },
    {
      name: 'wave',
      samplers: [
        { input: tWave, output: qWaveArm, interpolation: 'LINEAR' },
        { input: tWave, output: qWaveHead, interpolation: 'LINEAR' },
      ],
      channels: [
        { sampler: 0, target: { node: 4, path: 'rotation' } },
        { sampler: 1, target: { node: 3, path: 'rotation' } },
      ],
    },
    {
      name: 'talk',
      samplers: [
        { input: tTalk, output: qTalkHead, interpolation: 'LINEAR' },
        { input: tTalk, output: qTalkArm, interpolation: 'LINEAR' },
      ],
      channels: [
        { sampler: 0, target: { node: 3, path: 'rotation' } },
        { sampler: 1, target: { node: 4, path: 'rotation' } },
      ],
    },
  ];

  const gltf = {
    asset: { version: '2.0', generator: 'Fizza-Sculpted-Avatar-Pipeline' },
    scene: 0,
    scenes: [{ name: 'FizzaAvatarScene', nodes: [0] }],
    nodes,
    meshes,
    materials,
    textures,
    images,
    samplers,
    accessors,
    bufferViews,
    buffers: [{ byteLength: byteOffset }],
    animations,
  };

  const jsonBytes = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPad = (4 - (jsonBytes.length % 4)) % 4;
  const jsonChunk = Buffer.concat([jsonBytes, Buffer.alloc(jsonPad, 0x20)]);
  const binChunk = Buffer.concat(chunks.map((c) => Buffer.from(c)));

  const totalLen = 12 + 8 + jsonChunk.length + 8 + binChunk.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const c0 = Buffer.alloc(8);
  c0.writeUInt32LE(jsonChunk.length, 0);
  c0.writeUInt32LE(0x4E4F534A, 4);

  const c1 = Buffer.alloc(8);
  c1.writeUInt32LE(binChunk.length, 0);
  c1.writeUInt32LE(0x004E4942, 4);

  mkdirSync('public/models', { recursive: true });
  const out = 'public/models/chef-fizz.glb';
  writeFileSync(out, Buffer.concat([header, c0, jsonChunk, c1, binChunk]));
  console.log(`Generated sculpted ${out} (${(totalLen / 1024).toFixed(1)} KB) with embedded plaid/denim/hair textures and animations: idle, wave, talk`);
}

await buildAvatarGLB();
