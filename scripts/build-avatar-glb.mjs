// Generates public/models/chef-fizz.glb (GLB 2.0 binary) — sculpted, high-fidelity 3D avatar
// modeled faithfully after Fizza Aman's reference photograph:
//   - Natural feminine facial features: gentle jawline, delicate chin, almond hazel-brown eyes,
//     natural eyeliner & lashes, arched dark eyebrows, delicate nose, smiling rose lips
//   - Voluminous dark-brown layered hair with natural middle-part, face-framing curtain bangs,
//     and lush thick locks cascading forward over both shoulders and down her chest
//   - Genuine woven caramel-tan / chocolate / olive plaid collared button-up shirt (tiled UVs so
//     checks and stripes are crisp and vibrant across chest, shoulders, collar, and sleeves)
//   - Straight-leg vintage medium-blue denim jeans with seamless hip join and rolled ankle cuffs
//   - Brown double-buckle Birkenstock-style slide sandals with cork footbed and gold buckles
//   - Gold wristwatch on left wrist + iced coffee latte cup with green lid & straw in left hand
//   - Smooth keyframed animations: "idle" (gentle breathing & head tilt), "walk" (stride), "wave", "talk"
import * as THREE from 'three';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

// ---------------------------------------------------------------------------
// 1. Procedural High-Contrast PBR PNG Textures (embedded inside GLB)
// ---------------------------------------------------------------------------
async function createPlaidTexturePNG() {
  // 256x256 texture with 2x2 repeating Scottish/autumn plaid blocks
  // Sampled directly from Fizza's photo: warm golden-tan flannel, rich dark chocolate,
  // slate-olive checks, deep espresso crossing blocks, and ochre gold threads.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <!-- Rich warm golden-tan flannel base -->
    <rect width="256" height="256" fill="#a47a4f"/>

    <!-- Broad dark chocolate check bands -->
    <rect x="0" y="0" width="36" height="256" fill="#382114" opacity="0.88"/>
    <rect x="128" y="0" width="36" height="256" fill="#382114" opacity="0.88"/>
    <rect x="0" y="0" width="256" height="36" fill="#382114" opacity="0.88"/>
    <rect x="0" y="128" width="256" height="36" fill="#382114" opacity="0.88"/>

    <!-- Secondary olive-slate bands -->
    <rect x="68" y="0" width="24" height="256" fill="#4d5c49" opacity="0.80"/>
    <rect x="196" y="0" width="24" height="256" fill="#4d5c49" opacity="0.80"/>
    <rect x="0" y="68" width="256" height="24" fill="#4d5c49" opacity="0.80"/>
    <rect x="0" y="196" width="256" height="24" fill="#4d5c49" opacity="0.80"/>

    <!-- Crossing deep espresso intersection squares -->
    <rect x="0" y="0" width="36" height="36" fill="#1f120a"/>
    <rect x="128" y="0" width="36" height="36" fill="#1f120a"/>
    <rect x="0" y="128" width="36" height="36" fill="#1f120a"/>
    <rect x="128" y="128" width="36" height="36" fill="#1f120a"/>

    <rect x="68" y="68" width="24" height="24" fill="#2d372a"/>
    <rect x="196" y="68" width="24" height="24" fill="#2d372a"/>
    <rect x="68" y="196" width="24" height="24" fill="#2d372a"/>
    <rect x="196" y="196" width="24" height="24" fill="#2d372a"/>

    <!-- Fine ochre-amber accent threads -->
    <rect x="18" y="0" width="3.5" height="256" fill="#d99f3b"/>
    <rect x="146" y="0" width="3.5" height="256" fill="#d99f3b"/>
    <rect x="0" y="18" width="256" height="3.5" fill="#d99f3b"/>
    <rect x="0" y="146" width="256" height="3.5" fill="#d99f3b"/>

    <!-- Soft muted cream thread (very fine 2px, subtle accent only) -->
    <rect x="80" y="0" width="2" height="256" fill="#e8dacb" opacity="0.6"/>
    <rect x="208" y="0" width="2" height="256" fill="#e8dacb" opacity="0.6"/>
    <rect x="0" y="80" width="256" height="2" fill="#e8dacb" opacity="0.6"/>
    <rect x="0" y="208" width="256" height="2" fill="#e8dacb" opacity="0.6"/>
  </svg>`;
  return sharp(Buffer.from(svg)).resize(256, 256).png({ compressionLevel: 9 }).toBuffer();
}

async function createDenimTexturePNG() {
  let twill = '';
  for (let i = 0; i < 256; i += 4) {
    twill += `<line x1="${i}" y1="0" x2="${i + 12}" y2="256" stroke="#1c2f4a" stroke-width="1.8" opacity="0.4"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs>
      <linearGradient id="denimGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#2c466c"/>
        <stop offset="48%" stop-color="#3c5e8c"/>
        <stop offset="52%" stop-color="#3e6191"/>
        <stop offset="100%" stop-color="#284063"/>
      </linearGradient>
    </defs>
    <rect width="256" height="256" fill="url(#denimGrad)"/>
    ${twill}
    <!-- Outer gold jeans seam -->
    <line x1="128" y1="0" x2="128" y2="256" stroke="#c89642" stroke-width="2.5" stroke-dasharray="5 4" opacity="0.85"/>
  </svg>`;
  return sharp(Buffer.from(svg)).resize(256, 256).png({ compressionLevel: 9 }).toBuffer();
}

async function createHairTexturePNG() {
  let strands = '';
  for (let i = 0; i < 256; i += 3) {
    const col = i % 9 === 0 ? '#4a2c1b' : i % 6 === 0 ? '#1b0e08' : '#321c11';
    strands += `<rect x="${i}" y="0" width="2" height="256" fill="${col}" opacity="0.6"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#25140b"/>
    ${strands}
  </svg>`;
  return sharp(Buffer.from(svg)).resize(256, 256).png({ compressionLevel: 9 }).toBuffer();
}

async function createLatteTexturePNG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs>
      <linearGradient id="coffee" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fdfbf7"/>
        <stop offset="25%" stop-color="#edd9c2"/>
        <stop offset="65%" stop-color="#bd8f61"/>
        <stop offset="100%" stop-color="#8c582f"/>
      </linearGradient>
    </defs>
    <rect width="256" height="256" fill="url(#coffee)"/>
    <!-- Iconic green circular logo on cup -->
    <circle cx="128" cy="135" r="26" fill="#146b48"/>
    <circle cx="128" cy="135" r="21" fill="#ffffff" opacity="0.2"/>
  </svg>`;
  return sharp(Buffer.from(svg)).resize(256, 256).png({ compressionLevel: 9 }).toBuffer();
}

// ---------------------------------------------------------------------------
// 2. Geometry Helpers with Tileable UV Support
// ---------------------------------------------------------------------------
function ensureUVAndIndex(geom, uTile = 1.0, vTile = 1.0) {
  let g = geom;
  if (!g.index) {
    const count = g.attributes.position.count;
    const idx = new Uint32Array(count);
    for (let i = 0; i < count; i++) idx[i] = i;
    g.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) {
    const count = g.attributes.position.count;
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
  } else if (uTile !== 1.0 || vTile !== 1.0) {
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) * uTile, uv.getY(i) * vTile);
    }
  }
  return g;
}

function transformGeom(geom, { sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, tx = 0, ty = 0, tz = 0, uTile = 1, vTile = 1 } = {}) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
  m.compose(new THREE.Vector3(tx, ty, tz), q, new THREE.Vector3(sx, sy, sz));
  geom.applyMatrix4(m);
  geom.computeVertexNormals();
  return ensureUVAndIndex(geom, uTile, vTile);
}

// Smooth oval feminine head matching Fizza's facial structure (NO clown blush spheres!)
function createSculptedHead() {
  const g = new THREE.SphereGeometry(0.145, 42, 34);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Natural feminine head height
    y *= 1.14;

    // Graceful jaw taper toward chin (narrowing smoothly)
    if (y < 0.0) {
      const t = Math.min(1, -y / 0.165);
      const jawNarrow = 1.0 - 0.32 * t * t;
      x *= jawNarrow;
      z *= 1.0 - 0.12 * t;
      if (z > 0.02) z += 0.015 * Math.sin(t * Math.PI * 0.85); // soft rounded chin
    }

    // Natural smooth cheekbones (subtle, flush with face, NO separate spheres!)
    if (z > 0.02 && y > -0.07 && y < 0.04) {
      const cheek = Math.exp(-Math.pow((y + 0.015) / 0.045, 2)) * 0.008;
      z += cheek * Math.max(0, 1 - Math.abs(x) / 0.13);
    }

    // Forehead slope
    if (y > 0.05 && z > 0.03) {
      z -= (y - 0.05) * 0.10;
    }

    pos.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return ensureUVAndIndex(g);
}

// Ribbon along a curve for lush hair strands, eyebrows, lips
function createTaperedRibbon(points, { segs = 24, radialSegs = 10, rx0 = 0.035, rx1 = 0.012, ry0 = 0.016, ry1 = 0.006, twist = 0, uTile = 1, vTile = 1 } = {}) {
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
    const taper = Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.5) * (1 - Math.pow(t, 2.2) * 0.65) + (1 - t) * 0.28;
    const rx = (rx0 * (1 - t) + rx1 * t) * Math.max(0.25, taper);
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
      uvs.push((j / radialSegs) * uTile, t * vTile);
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

// Sculpted button-up shirt torso with TILED UVs (4.5 horizontal tiles, 3.5 vertical tiles)
function createShirtTorso() {
  const pts = [
    new THREE.Vector2(0.01, -0.05),
    new THREE.Vector2(0.146, -0.045),
    new THREE.Vector2(0.148, 0.03),
    new THREE.Vector2(0.134, 0.13),  // waist
    new THREE.Vector2(0.148, 0.24),  // ribcage
    new THREE.Vector2(0.160, 0.34),  // chest/shoulders
    new THREE.Vector2(0.110, 0.40),  // collarbone slope
    new THREE.Vector2(0.055, 0.42),  // collar opening
  ];
  const g = new THREE.LatheGeometry(pts, 34);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i) * 0.72;
    if (z > 0.01 && y > 0.15 && y < 0.34) {
      const bust = Math.exp(-Math.pow((y - 0.245) / 0.065, 2)) * 0.024 * Math.max(0, 1 - Math.abs(x) / 0.15);
      z += bust;
    }
    pos.setXYZ(i, x * 1.05, y, z);
  }
  g.computeVertexNormals();
  // TILE UVs 4.5x3.5 so the plaid pattern is crisp and clearly visible across the chest & back!
  return ensureUVAndIndex(g, 4.5, 3.5);
}

// Sculpted relaxed denim hips/pelvis seamlessly connecting to thighs
function createDenimPelvis() {
  const pts = [
    new THREE.Vector2(0.01, -0.11),
    new THREE.Vector2(0.148, -0.09),
    new THREE.Vector2(0.158, -0.01),
    new THREE.Vector2(0.146, 0.06),
    new THREE.Vector2(0.130, 0.088),
    new THREE.Vector2(0.01, 0.088),
  ];
  const g = new THREE.LatheGeometry(pts, 30);
  return transformGeom(g, { sx: 1.05, sz: 0.78, uTile: 2.5, vTile: 2.0 });
}

// Straight-leg denim jeans with tiled denim texture (2x around, 5x down the leg)
function createDenimLeg() {
  const pts = [
    new THREE.Vector2(0.001, 0.0),
    new THREE.Vector2(0.068, 0.005),
    new THREE.Vector2(0.072, 0.04),
    new THREE.Vector2(0.068, 0.055),
    new THREE.Vector2(0.073, 0.22),
    new THREE.Vector2(0.078, 0.40),
    new THREE.Vector2(0.088, 0.62),
    new THREE.Vector2(0.092, 0.74),
  ];
  const g = new THREE.LatheGeometry(pts, 26);
  return transformGeom(g, { sx: 0.98, sz: 1.02, uTile: 2.0, vTile: 5.0 });
}

function createTaperedCylinder(rTop, rBot, h, segs = 20, uTile = 1.0, vTile = 1.0) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, segs, 4);
  return ensureUVAndIndex(g, uTile, vTile);
}

function createHand(isLeft) {
  const g = new THREE.SphereGeometry(0.035, 18, 14);
  return transformGeom(g, { sx: 0.85, sy: 1.25, sz: 0.55, rz: isLeft ? -0.08 : 0.08 });
}

// ---------------------------------------------------------------------------
// 3. GLB 2.0 Serializer
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
    // 0: Warm South Asian skin tone (natural olive-golden tan, velvety smooth)
    { name: 'Skin', pbrMetallicRoughness: { baseColorFactor: [0.82, 0.62, 0.50, 1], metallicFactor: 0.0, roughnessFactor: 0.62 } },
    // 1: Subtle warm cheek tint (soft natural tone, flush with face)
    { name: 'Blush', pbrMetallicRoughness: { baseColorFactor: [0.84, 0.56, 0.48, 1], metallicFactor: 0.0, roughnessFactor: 0.65 } },
    // 2: Soft natural smiling rose lips
    { name: 'Lips', pbrMetallicRoughness: { baseColorFactor: [0.70, 0.32, 0.38, 1], metallicFactor: 0.02, roughnessFactor: 0.35 } },
    // 3: Long glossy dark-brown / chestnut hair
    { name: 'Hair', pbrMetallicRoughness: { baseColorTexture: { index: hairTex }, baseColorFactor: [0.75, 0.55, 0.42, 1], metallicFactor: 0.04, roughnessFactor: 0.40 } },
    // 4: Eye sclera soft white
    { name: 'Sclera', pbrMetallicRoughness: { baseColorFactor: [0.96, 0.95, 0.94, 1], metallicFactor: 0.0, roughnessFactor: 0.20 } },
    // 5: Dark eyeliner / pupil
    { name: 'DarkEye', pbrMetallicRoughness: { baseColorFactor: [0.08, 0.04, 0.03, 1], metallicFactor: 0.02, roughnessFactor: 0.15 } },
    // 6: Specular eye catchlight
    { name: 'Catchlight', emissiveFactor: [0.98, 0.98, 0.98], pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], roughnessFactor: 0.05 } },
    // 7: Woven Plaid Flannel Shirt (rich caramel tan with chocolate & olive checks)
    { name: 'PlaidShirt', pbrMetallicRoughness: { baseColorTexture: { index: plaidTex }, baseColorFactor: [1, 1, 1, 1], metallicFactor: 0.0, roughnessFactor: 0.86 } },
    // 8: Vintage Blue Denim Jeans
    { name: 'DenimJeans', pbrMetallicRoughness: { baseColorTexture: { index: denimTex }, baseColorFactor: [1, 1, 1, 1], metallicFactor: 0.0, roughnessFactor: 0.82 } },
    // 9: Lighter rolled denim cuff turn-up
    { name: 'DenimCuff', pbrMetallicRoughness: { baseColorFactor: [0.50, 0.63, 0.78, 1], metallicFactor: 0.0, roughnessFactor: 0.8 } },
    // 10: Brown Birkenstock slide sandal leather straps
    { name: 'SandalLeather', pbrMetallicRoughness: { baseColorFactor: [0.32, 0.18, 0.11, 1], metallicFactor: 0.04, roughnessFactor: 0.55 } },
    // 11: Sandal cork footbed
    { name: 'CorkSole', pbrMetallicRoughness: { baseColorFactor: [0.68, 0.50, 0.35, 1], metallicFactor: 0.0, roughnessFactor: 0.82 } },
    // 12: Gold watch & buckles
    { name: 'Gold', pbrMetallicRoughness: { baseColorFactor: [0.94, 0.76, 0.30, 1], metallicFactor: 0.85, roughnessFactor: 0.22 } },
    // 13: Barbie pink heart pin accent
    { name: 'BarbiePink', pbrMetallicRoughness: { baseColorFactor: [0.92, 0.22, 0.54, 1], metallicFactor: 0.05, roughnessFactor: 0.38 } },
    // 14: Iced Latte Cup with coffee swirl
    { name: 'LatteCup', pbrMetallicRoughness: { baseColorTexture: { index: latteTex }, baseColorFactor: [1, 1, 1, 1], metallicFactor: 0.02, roughnessFactor: 0.25 } },
    // 15: Signature Green Cup Lid
    { name: 'CupLidGreen', pbrMetallicRoughness: { baseColorFactor: [0.10, 0.46, 0.32, 1], metallicFactor: 0.05, roughnessFactor: 0.35 } },
    // 16: Pearl white shirt buttons & straw
    { name: 'CreamWhite', pbrMetallicRoughness: { baseColorFactor: [0.96, 0.94, 0.92, 1], metallicFactor: 0.04, roughnessFactor: 0.3 } },
    // 17: Rich hazel-brown iris
    { name: 'IrisBrown', pbrMetallicRoughness: { baseColorFactor: [0.34, 0.18, 0.10, 1], metallicFactor: 0.04, roughnessFactor: 0.18 } },
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

  // --- Lower Body: Articulated Hips + Separate Legs ---
  const hipsMesh = buildMeshFromParts('Hips', [
    [transformGeom(createDenimPelvis(), { ty: 0.85 }), 8],
  ]);

  function buildLegMesh(name, side) {
    const legParts = [
      // Denim leg with tiled denim texture
      [transformGeom(createDenimLeg(), { ty: -0.74 }), 8],
      // Rolled lighter cuff at ankle
      [transformGeom(new THREE.TorusGeometry(0.068, 0.015, 12, 24), { rx: Math.PI / 2, ty: -0.725 }), 9],
      // Ankle skin
      [transformGeom(createTaperedCylinder(0.040, 0.036, 0.10, 18), { ty: -0.77 }), 0],
      // Sculpted bare foot + toes
      [transformGeom(new THREE.SphereGeometry(0.044, 18, 14), { sx: 0.92, sy: 0.55, sz: 1.72, ty: -0.814, tz: 0.04 }), 0],
      // Birkenstock cork sole footbed
      [transformGeom(new THREE.CylinderGeometry(0.052, 0.048, 0.024, 20), { sx: 0.98, sz: 1.92, ty: -0.836, tz: 0.042 }), 11],
      // Double brown leather straps
      [transformGeom(new THREE.TorusGeometry(0.046, 0.011, 10, 20, Math.PI), { ty: -0.816, tz: 0.068 }), 10],
      [transformGeom(new THREE.TorusGeometry(0.048, 0.011, 10, 20, Math.PI), { ty: -0.808, tz: 0.015 }), 10],
      // Gold buckles
      [transformGeom(new THREE.SphereGeometry(0.009, 10, 8), { tx: side * 0.044, ty: -0.806, tz: 0.068 }), 12],
      [transformGeom(new THREE.SphereGeometry(0.009, 10, 8), { tx: side * 0.046, ty: -0.800, tz: 0.015 }), 12],
    ];
    return buildMeshFromParts(name, legParts);
  }
  const legRightMesh = buildLegMesh('LegRight', -1);
  const legLeftMesh = buildLegMesh('LegLeft', 1);

  // --- Upper Torso: Caramel Tan Plaid Flannel Shirt ---
  const torsoParts = [
    // Torso with 4.5x3.5 tiled plaid flannel pattern
    [createShirtTorso(), 7],
    // V-neck skin chest
    [transformGeom(new THREE.SphereGeometry(0.062, 20, 14), { sx: 1.05, sy: 0.85, sz: 0.72, ty: 0.375, tz: 0.048 }), 0],
    // Folded shirt collar lapels with plaid texture
    [createTaperedRibbon([[0.0, 0.415, 0.045], [-0.048, 0.395, 0.078], [-0.068, 0.345, 0.095], [-0.020, 0.305, 0.115]], { segs: 14, radialSegs: 10, rx0: 0.022, rx1: 0.012, ry0: 0.008, ry1: 0.006, uTile: 2, vTile: 2 }), 7],
    [createTaperedRibbon([[0.0, 0.415, 0.045], [0.048, 0.395, 0.078], [0.068, 0.345, 0.095], [0.020, 0.305, 0.115]], { segs: 14, radialSegs: 10, rx0: 0.022, rx1: 0.012, ry0: 0.008, ry1: 0.006, uTile: 2, vTile: 2 }), 7],
    // Collar back rim
    [transformGeom(new THREE.TorusGeometry(0.066, 0.014, 10, 24, Math.PI * 1.15), { rx: Math.PI / 2, ry: Math.PI, tz: -0.008, ty: 0.415 }), 7],
    // Front placket strip
    [transformGeom(new THREE.CylinderGeometry(0.014, 0.014, 0.33, 12), { sx: 1.2, sz: 0.4, ty: 0.145, tz: 0.11, uTile: 1, vTile: 3 }), 7],
  ];
  // Pearl shirt buttons down front
  for (let b = 0; b < 4; b++) {
    const by = 0.03 + b * 0.078;
    const bz = b === 2 ? 0.128 : b === 1 ? 0.114 : 0.112;
    torsoParts.push([transformGeom(new THREE.SphereGeometry(0.008, 12, 10), { sz: 0.5, ty: by, tz: bz }), 16]);
  }
  // Pink & gold pin on left chest
  torsoParts.push([transformGeom(new THREE.SphereGeometry(0.015, 14, 12), { sz: 0.45, tx: 0.075, ty: 0.275, tz: 0.116 }), 13]);
  torsoParts.push([transformGeom(new THREE.TorusGeometry(0.017, 0.004, 8, 18), { tx: 0.075, ty: 0.275, tz: 0.116 }), 12]);
  const torsoMesh = buildMeshFromParts('PlaidTorso', torsoParts);

  // --- Head, Natural Face & Voluminous Layered Hair ---
  const headParts = [
    // Neck
    [transformGeom(createTaperedCylinder(0.047, 0.057, 0.14, 22), { ty: -0.145 }), 0],
    // Sculpted feminine head (NO clown blush spheres!)
    [createSculptedHead(), 0],
    // Delicate sculpted ears
    [transformGeom(new THREE.SphereGeometry(0.026, 16, 12), { sx: 0.48, sy: 1.12, sz: 0.78, tx: -0.136, ty: -0.018, tz: -0.008 }), 0],
    [transformGeom(new THREE.SphereGeometry(0.026, 16, 12), { sx: 0.48, sy: 1.12, sz: 0.78, tx: 0.136, ty: -0.018, tz: -0.008 }), 0],
    // Natural delicate nose bridge and soft tip
    [transformGeom(new THREE.SphereGeometry(0.015, 16, 12), { sx: 0.82, sy: 0.75, sz: 1.05, ty: -0.022, tz: 0.160 }), 0],
    [transformGeom(createTaperedCylinder(0.007, 0.011, 0.040, 14), { rx: -0.22, ty: 0.002, tz: 0.154 }), 0],
    // Natural smiling rose lips with Cupid's bow
    [createTaperedRibbon([[-0.030, -0.062, 0.142], [-0.013, -0.060, 0.154], [0, -0.062, 0.156], [0.013, -0.060, 0.154], [0.030, -0.062, 0.142]], { segs: 16, radialSegs: 8, rx0: 0.0065, rx1: 0.0065, ry0: 0.006, ry1: 0.006 }), 2],
    [createTaperedRibbon([[-0.026, -0.068, 0.142], [0, -0.076, 0.155], [0.026, -0.068, 0.142]], { segs: 14, radialSegs: 8, rx0: 0.008, rx1: 0.008, ry0: 0.007, ry1: 0.007 }), 2],
  ];

  // Natural Almond Eyes + Hazel-Brown Irises + Dark Pupils + Eyeliner + Arched Brows
  for (const s of [-1, 1]) {
    const ex = s * 0.048;
    const ey = 0.014;
    const ez = 0.138;
    // Almond sclera white
    headParts.push([transformGeom(new THREE.SphereGeometry(0.024, 20, 14), { sx: 1.15, sy: 0.82, sz: 0.65, ry: s * 0.10, tx: ex, ty: ey, tz: ez }), 4]);
    // Hazel-brown iris
    headParts.push([transformGeom(new THREE.SphereGeometry(0.015, 18, 12), { sx: 0.95, sy: 0.95, sz: 0.35, tx: ex + s * 0.002, ty: ey, tz: ez + 0.013 }), 17]);
    // Dark pupil
    headParts.push([transformGeom(new THREE.SphereGeometry(0.0075, 12, 10), { sx: 1.0, sy: 1.0, sz: 0.3, tx: ex + s * 0.002, ty: ey, tz: ez + 0.0155 }), 5]);
    // Catchlight twinkle
    headParts.push([transformGeom(new THREE.SphereGeometry(0.0035, 8, 8), { tx: ex + s * 0.004, ty: ey + 0.005, tz: ez + 0.0165 }), 6]);
    // Upper eyelid / eyeliner curve
    headParts.push([createTaperedRibbon([
      [ex - s * 0.022, ey - 0.002, ez + 0.010],
      [ex, ey + 0.013, ez + 0.014],
      [ex + s * 0.024, ey + 0.001, ez + 0.010],
    ], { segs: 10, radialSegs: 6, rx0: 0.0035, rx1: 0.0035, ry0: 0.003, ry1: 0.003 }), 5]);
    // Gracefully arched dark brown eyebrow
    headParts.push([createTaperedRibbon([
      [ex - s * 0.022, ey + 0.028, ez + 0.006],
      [ex, ey + 0.038, ez + 0.012],
      [ex + s * 0.024, ey + 0.028, ez + 0.005],
    ], { segs: 12, radialSegs: 8, rx0: 0.0055, rx1: 0.003, ry0: 0.004, ry1: 0.003 }), 3]);
  }

  // --- Voluminous Layered Hair (True to Fizza's Photo) ---
  // Base hair cap covering crown, temples, and back
  headParts.push([transformGeom(new THREE.SphereGeometry(0.158, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.65), { sx: 1.05, sy: 1.15, sz: 1.05, rx: -0.26, ty: 0.020, tz: -0.020, uTile: 2, vTile: 2 }), 3]);
  headParts.push([transformGeom(new THREE.SphereGeometry(0.154, 30, 22), { sx: 1.03, sy: 1.08, sz: 1.05, ty: 0.028, tz: -0.025, uTile: 2, vTile: 2 }), 3]);

  // Center-parted sweeping curtain bangs (framing forehead and temples)
  for (const s of [-1, 1]) {
    // Upper front wave sweeping gracefully across the hairline
    headParts.push([createTaperedRibbon([
      [s * 0.006, 0.135, 0.108],
      [s * 0.065, 0.118, 0.116],
      [s * 0.125, 0.055, 0.098],
      [s * 0.148, -0.055, 0.082],
      [s * 0.136, -0.21, 0.100],
      [s * 0.110, -0.38, 0.118],
    ], { segs: 26, radialSegs: 10, rx0: 0.040, rx1: 0.014, ry0: 0.022, ry1: 0.009, uTile: 1, vTile: 3 }), 3]);

    // Front shoulder cascade: lush thick lock cascading forward over her chest (prominent in photo!)
    headParts.push([createTaperedRibbon([
      [s * 0.030, 0.148, 0.040],
      [s * 0.115, 0.110, 0.048],
      [s * 0.165, 0.00, 0.030],
      [s * 0.175, -0.16, 0.050],
      [s * 0.155, -0.32, 0.095],
      [s * 0.130, -0.46, 0.112],
    ], { segs: 28, radialSegs: 12, rx0: 0.048, rx1: 0.018, ry0: 0.025, ry1: 0.010, uTile: 1, vTile: 4 }), 3]);
  }

  // Lush Back Hair Waterfall (thick ribbons cascading down upper back)
  for (let i = -3; i <= 3; i++) {
    const xOff = i * 0.042;
    const zCurve = -0.115 - (1 - Math.abs(i) / 4) * 0.038;
    headParts.push([createTaperedRibbon([
      [xOff * 0.65, 0.138, -0.055],
      [xOff * 1.12, 0.03, zCurve],
      [xOff * 1.22, -0.14, zCurve - 0.020],
      [xOff * 1.12, -0.32, zCurve - 0.008],
      [xOff * 0.92, -0.48 + Math.abs(i) * 0.02, zCurve + 0.018],
    ], { segs: 24, radialSegs: 10, rx0: 0.050, rx1: 0.018, ry0: 0.024, ry1: 0.010, uTile: 1, vTile: 3 }), 3]);
  }
  const headMesh = buildMeshFromParts('HeadAndHair', headParts);

  // --- Right Arm (Waving arm with rolled 3/4 plaid sleeve) ---
  const armRightParts = [
    // Shoulder in plaid
    [transformGeom(new THREE.SphereGeometry(0.052, 18, 14), { sx: 1.0, sy: 0.95, sz: 0.92, tx: 0.015, ty: 0.0, uTile: 2, vTile: 2 }), 7],
    // Rolled 3/4 plaid upper sleeve
    [transformGeom(createTaperedCylinder(0.049, 0.045, 0.21, 20, 3.0, 2.5), { ty: -0.11 }), 7],
    // Rolled sleeve cuff
    [transformGeom(new THREE.TorusGeometry(0.046, 0.010, 10, 20), { rx: Math.PI / 2, ty: -0.215, uTile: 2, vTile: 1 }), 7],
    // Bare forearm skin
    [transformGeom(createTaperedCylinder(0.037, 0.029, 0.23, 18), { ty: -0.32 }), 0],
    // Wrist & hand
    [transformGeom(createHand(false), { ty: -0.46 }), 0],
  ];
  const armRightMesh = buildMeshFromParts('ArmRight', armRightParts);

  // --- Left Arm (Bent holding Iced Latte Cup with Green Lid & Gold Watch!) ---
  const armLeftParts = [
    // Shoulder in plaid
    [transformGeom(new THREE.SphereGeometry(0.052, 18, 14), { sx: 1.0, sy: 0.95, sz: 0.92, tx: -0.015, ty: 0.0, uTile: 2, vTile: 2 }), 7],
    // Rolled 3/4 plaid upper sleeve
    [transformGeom(createTaperedCylinder(0.049, 0.045, 0.21, 20, 3.0, 2.5), { rz: 0.22, rx: -0.22, tx: 0.025, ty: -0.105, tz: 0.025 }), 7],
    // Rolled sleeve cuff near elbow
    [transformGeom(new THREE.TorusGeometry(0.046, 0.010, 10, 20), { rx: Math.PI / 2 - 0.22, rz: 0.22, tx: 0.048, ty: -0.205, tz: 0.048, uTile: 2, vTile: 1 }), 7],
    // Forearm bent forward holding cup
    [transformGeom(createTaperedCylinder(0.036, 0.029, 0.22, 18), { rx: -1.18, rz: -0.38, tx: 0.012, ty: -0.242, tz: 0.135 }), 0],
    // Gold wristwatch on left wrist (from photo!)
    [transformGeom(new THREE.TorusGeometry(0.031, 0.005, 8, 18), { rx: -1.18, rz: -0.38, tx: -0.018, ty: -0.268, tz: 0.195 }), 12],
    [transformGeom(new THREE.CylinderGeometry(0.015, 0.015, 0.007, 16), { rx: -1.18, rz: -0.38, tx: -0.032, ty: -0.272, tz: 0.200 }), 12],
    // Left hand cradling cup
    [transformGeom(createHand(true), { rx: -1.0, tx: -0.035, ty: -0.282, tz: 0.225 }), 0],
    // Iced Latte Cup (with coffee gradient texture & green logo)
    [transformGeom(createTaperedCylinder(0.042, 0.031, 0.125, 22), { tx: -0.042, ty: -0.258, tz: 0.245 }), 14],
    // Signature green cup lid
    [transformGeom(new THREE.CylinderGeometry(0.044, 0.044, 0.016, 22), { tx: -0.042, ty: -0.191, tz: 0.245 }), 15],
    // White straw
    [transformGeom(new THREE.CylinderGeometry(0.004, 0.004, 0.095, 10), { rz: 0.14, rx: -0.12, tx: -0.048, ty: -0.148, tz: 0.250 }), 16],
  ];
  const armLeftMesh = buildMeshFromParts('ArmLeftWithLatte', armLeftParts);

  // ---------------------------------------------------------------------------
  // 4. Node Hierarchy & Animations
  // ---------------------------------------------------------------------------
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

  // Helper to add animation clips
  function makeClip(name, duration, tracks) {
    const samplersList = [];
    const channelsList = [];
    for (const trk of tracks) {
      const timesArr = new Float32Array(trk.times);
      const valsArr = new Float32Array(trk.values);

      const timeBV = pushBytes(new Uint8Array(timesArr.buffer));
      const valBV = pushBytes(new Uint8Array(valsArr.buffer));

      const timeAcc = accessors.length;
      accessors.push({ bufferView: timeBV, componentType: 5126, count: timesArr.length, type: 'SCALAR', min: [trk.times[0]], max: [trk.times[trk.times.length - 1]] });

      const valAcc = accessors.length;
      accessors.push({ bufferView: valBV, componentType: 5126, count: valsArr.length / (trk.path === 'rotation' ? 4 : 3), type: trk.path === 'rotation' ? 'VEC4' : 'VEC3' });

      const samplerIdx = samplersList.length;
      samplersList.push({ input: timeAcc, output: valAcc, interpolation: 'LINEAR' });
      channelsList.push({ sampler: samplerIdx, target: { node: trk.node, path: trk.path } });
    }
    return { name, channels: channelsList, samplers: samplersList };
  }

  const eulerToQuat = (x, y, z) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
    return [q.x, q.y, q.z, q.w];
  };

  // 1) Idle: gentle breathing, subtle head tilt, natural wrist pulse
  const idleClip = makeClip('idle', 3.0, [
    {
      node: 2, path: 'translation', // Torso breathing
      times: [0.0, 1.5, 3.0],
      values: [0, 0.89, 0,  0, 0.898, 0.003,  0, 0.89, 0],
    },
    {
      node: 3, path: 'rotation', // Head subtle gentle tilt
      times: [0.0, 1.5, 3.0],
      values: [...eulerToQuat(0, 0, 0.02), ...eulerToQuat(-0.02, 0.04, -0.015), ...eulerToQuat(0, 0, 0.02)],
    },
    {
      node: 4, path: 'rotation', // Right arm subtle sway
      times: [0.0, 1.5, 3.0],
      values: [...eulerToQuat(0, 0, -0.12), ...eulerToQuat(0.03, 0, -0.16), ...eulerToQuat(0, 0, -0.12)],
    },
  ]);

  // 2) Walk: natural rhythmic stride across the floor!
  const walkClip = makeClip('walk', 1.0, [
    {
      node: 6, path: 'rotation', // LegRight swing
      times: [0.0, 0.25, 0.5, 0.75, 1.0],
      values: [
        ...eulerToQuat(0.35, 0, 0),
        ...eulerToQuat(0.0, 0, 0),
        ...eulerToQuat(-0.35, 0, 0),
        ...eulerToQuat(0.0, 0, 0),
        ...eulerToQuat(0.35, 0, 0),
      ],
    },
    {
      node: 7, path: 'rotation', // LegLeft swing (opposite phase)
      times: [0.0, 0.25, 0.5, 0.75, 1.0],
      values: [
        ...eulerToQuat(-0.35, 0, 0),
        ...eulerToQuat(0.0, 0, 0),
        ...eulerToQuat(0.35, 0, 0),
        ...eulerToQuat(0.0, 0, 0),
        ...eulerToQuat(-0.35, 0, 0),
      ],
    },
    {
      node: 4, path: 'rotation', // ArmRight swing counter-balancing left leg
      times: [0.0, 0.5, 1.0],
      values: [
        ...eulerToQuat(-0.25, 0, -0.12),
        ...eulerToQuat(0.25, 0, -0.12),
        ...eulerToQuat(-0.25, 0, -0.12),
      ],
    },
    {
      node: 1, path: 'translation', // Gentle hip bounce
      times: [0.0, 0.25, 0.5, 0.75, 1.0],
      values: [0, 0, 0,  0, 0.02, 0,  0, 0, 0,  0, 0.02, 0,  0, 0, 0],
    },
  ]);

  // 3) Wave: enthusiastic friendly greeting
  const waveClip = makeClip('wave', 2.0, [
    {
      node: 4, path: 'rotation', // ArmRight lifts & waves forearm
      times: [0.0, 0.35, 0.65, 0.95, 1.25, 1.6, 2.0],
      values: [
        ...eulerToQuat(0, 0, -0.12),
        ...eulerToQuat(0, 0, 2.15),
        ...eulerToQuat(0, 0.35, 2.45),
        ...eulerToQuat(0, -0.35, 2.05),
        ...eulerToQuat(0, 0.35, 2.45),
        ...eulerToQuat(0, 0, 1.8),
        ...eulerToQuat(0, 0, -0.12),
      ],
    },
    {
      node: 3, path: 'rotation', // Head tilts enthusiastically
      times: [0.0, 0.5, 1.2, 2.0],
      values: [
        ...eulerToQuat(0, 0, 0),
        ...eulerToQuat(-0.06, 0.12, -0.08),
        ...eulerToQuat(-0.04, -0.06, 0.04),
        ...eulerToQuat(0, 0, 0),
      ],
    },
  ]);

  // 4) Talk: conversational gestures
  const talkClip = makeClip('talk', 2.0, [
    {
      node: 3, path: 'rotation',
      times: [0.0, 0.35, 0.75, 1.15, 1.55, 2.0],
      values: [
        ...eulerToQuat(0, 0, 0),
        ...eulerToQuat(0.08, 0.04, 0.02),
        ...eulerToQuat(-0.04, -0.06, -0.02),
        ...eulerToQuat(0.06, 0.02, 0.03),
        ...eulerToQuat(-0.02, 0.05, -0.01),
        ...eulerToQuat(0, 0, 0),
      ],
    },
    {
      node: 4, path: 'rotation',
      times: [0.0, 0.5, 1.0, 1.5, 2.0],
      values: [
        ...eulerToQuat(0, 0, -0.12),
        ...eulerToQuat(0.35, 0, -0.28),
        ...eulerToQuat(0.15, 0.2, -0.22),
        ...eulerToQuat(0.38, -0.1, -0.30),
        ...eulerToQuat(0, 0, -0.12),
      ],
    },
  ]);

  const animations = [idleClip, walkClip, waveClip, talkClip];

  // glTF JSON root
  const gltf = {
    asset: { version: '2.0', generator: 'Antigravity Avatar Generator - Fizza Aman Edition' },
    scene: 0,
    scenes: [{ name: 'Scene', nodes: [0] }],
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

  const jsonText = JSON.stringify(gltf);
  const jsonBuffer = Buffer.from(jsonText, 'utf8');
  const jsonPad = (4 - (jsonBuffer.length % 4)) % 4;
  const jsonChunkLength = jsonBuffer.length + jsonPad;

  let binByteLength = 0;
  for (const c of chunks) binByteLength += c.byteLength;
  const binPad = (4 - (binByteLength % 4)) % 4;
  const binChunkLength = binByteLength + binPad;

  const totalLength = 12 + 8 + jsonChunkLength + 8 + binChunkLength;
  const header = Buffer.alloc(12);
  header.write('glTF', 0, 4, 'ascii');
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonChunkLength, 0);
  jsonChunkHeader.write('JSON', 4, 4, 'ascii');

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binChunkLength, 0);
  binChunkHeader.write('BIN\0', 4, 4, 'ascii');

  const outParts = [
    header,
    jsonChunkHeader,
    jsonBuffer,
    jsonPad ? Buffer.alloc(jsonPad, 0x20) : Buffer.alloc(0),
    binChunkHeader,
  ];
  for (const c of chunks) outParts.push(Buffer.from(c.buffer, c.byteOffset, c.byteLength));
  if (binPad) outParts.push(Buffer.alloc(binPad, 0));

  const finalGLB = Buffer.concat(outParts);
  mkdirSync('public/models', { recursive: true });
  writeFileSync('public/models/chef-fizz.glb', finalGLB);
  console.log(`Generated sculpted public/models/chef-fizz.glb (${(finalGLB.length / 1024).toFixed(1)} KB) with tiled plaid/denim textures, natural face, and animations: idle, walk, wave, talk`);
}

buildAvatarGLB().catch((err) => {
  console.error(err);
  process.exit(1);
});
