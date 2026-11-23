// Generates public/models/chef-fizz.glb (GLB 2.0 binary) — sculpted, 100% geometry-baked
// multi-material 3D avatar modeled faithfully after Fizza Aman's reference photograph.
//
// Uses exact sRGB-to-Linear glTF 2.0 material conversion so every color renders
// accurately in both Three.js and Blender Cycles/EEVEE without washing out.
import * as THREE from 'three';
import { mkdirSync, writeFileSync } from 'node:fs';

function srgbToLinear(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return [
    Number(toLin(r).toFixed(4)),
    Number(toLin(g).toFixed(4)),
    Number(toLin(b).toFixed(4)),
    1,
  ];
}

// ---------------------------------------------------------------------------
// 1. Material Palette (sRGB colors sampled from Fizza's photo -> glTF Linear)
// ---------------------------------------------------------------------------
const MATERIALS = [
  // 0: Warm South Asian golden-olive skin (#dba586)
  { name: 'Skin', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#dba586'), metallicFactor: 0.0, roughnessFactor: 0.56 } },
  // 1: Soft warm eyelid / nose contour shade (#c98b6f)
  { name: 'SkinShade', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#c98b6f'), metallicFactor: 0.0, roughnessFactor: 0.58 } },
  // 2: Natural rose-berry smiling lips (#b04e5a)
  { name: 'Lips', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#b04e5a'), metallicFactor: 0.02, roughnessFactor: 0.34 } },
  // 3: Deep espresso dark-brown hair base & roots (#23140c)
  { name: 'HairDeep', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#23140c'), metallicFactor: 0.03, roughnessFactor: 0.42 } },
  // 4: Rich dark brunette hair main waves (#331d12)
  { name: 'HairBrunette', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#331d12'), metallicFactor: 0.04, roughnessFactor: 0.38 } },
  // 5: Warm chestnut hair sheen highlights (#46291a)
  { name: 'HairChestnut', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#46291a'), metallicFactor: 0.05, roughnessFactor: 0.36 } },
  // 6: Eye sclera soft off-white (#f7f4f2)
  { name: 'Sclera', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#f7f4f2'), metallicFactor: 0.0, roughnessFactor: 0.16 } },
  // 7: Rich dark warm-brown iris (#3b1d0e)
  { name: 'IrisBrown', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#3b1d0e'), metallicFactor: 0.02, roughnessFactor: 0.14 } },
  // 8: Deep black pupil & winged eyeliner lash line (#120806)
  { name: 'EyelinerBlack', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#120806'), metallicFactor: 0.02, roughnessFactor: 0.14 } },
  // 9: Pure white eye catchlight twinkle
  { name: 'Catchlight', emissiveFactor: [0.96, 0.96, 0.96], pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0.0, roughnessFactor: 0.05 } },

  // --- Woven Plaid Shirt Palette (Sampled from Fizza's plaid flannel shirt) ---
  // 10: Plaid warm camel-tan base (#b48e65)
  { name: 'PlaidShirt_Tan', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#b48e65'), metallicFactor: 0.0, roughnessFactor: 0.85 } },
  // 11: Plaid soft slate blue-grey check (#66798b)
  { name: 'PlaidShirt_Slate', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#66798b'), metallicFactor: 0.0, roughnessFactor: 0.85 } },
  // 12: Plaid deep cocoa brown stripe (#4d3421)
  { name: 'PlaidShirt_Cocoa', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#4d3421'), metallicFactor: 0.0, roughnessFactor: 0.88 } },
  // 13: Plaid warm golden-taupe check (#947250)
  { name: 'PlaidShirt_Taupe', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#947250'), metallicFactor: 0.0, roughnessFactor: 0.85 } },
  // 14: Plaid crisp ivory-cream pin-stripe (#eee3d5)
  { name: 'PlaidShirt_Cream', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#eee3d5'), metallicFactor: 0.0, roughnessFactor: 0.82 } },

  // --- Vintage Blue Denim Jeans Palette ---
  // 15: Classic medium vintage blue denim (#4c729c)
  { name: 'DenimJeans_Base', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#4c729c'), metallicFactor: 0.0, roughnessFactor: 0.82 } },
  // 16: Soft vintage washed front thigh denim (#5b82ad)
  { name: 'DenimJeans_Highlight', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#5b82ad'), metallicFactor: 0.0, roughnessFactor: 0.80 } },
  // 17: Darker indigo denim side seam & fly detail (#38567a)
  { name: 'DenimJeans_Dark', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#38567a'), metallicFactor: 0.0, roughnessFactor: 0.84 } },
  // 18: Rolled light-denim ankle cuff (#7a9cc2)
  { name: 'DenimJeans_Cuff', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#7a9cc2'), metallicFactor: 0.0, roughnessFactor: 0.80 } },

  // --- Footwear & Accessories ---
  // 19: Brown Birkenstock slide sandal leather straps (#4a2b1b)
  { name: 'SandalLeather', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#4a2b1b'), metallicFactor: 0.04, roughnessFactor: 0.50 } },
  // 20: Cork sandal footbed (#8f6847)
  { name: 'CorkSole', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#8f6847'), metallicFactor: 0.0, roughnessFactor: 0.82 } },
  // 21: Metallic gold (wristwatch, sandal buckles, necklace pendant) (#e5b842)
  { name: 'Gold', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#e5b842'), metallicFactor: 0.80, roughnessFactor: 0.22 } },
  // 22: Iced latte creamy milk top (#f2e7d8)
  { name: 'IcedLatte_Cream', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#f2e7d8'), metallicFactor: 0.02, roughnessFactor: 0.25 } },
  // 23: Iced latte coffee middle (#cfa376)
  { name: 'IcedLatte_Coffee', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#cfa376'), metallicFactor: 0.02, roughnessFactor: 0.25 } },
  // 24: Iced latte rich espresso bottom (#9c693e)
  { name: 'IcedLatte_Espresso', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#9c693e'), metallicFactor: 0.02, roughnessFactor: 0.25 } },
  // 25: Signature emerald-green cup lid & logo (#15734f)
  { name: 'IcedLatte_Lid', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#15734f'), metallicFactor: 0.05, roughnessFactor: 0.32 } },
  // 26: Pearl white shirt buttons & straw (#f7f4f0)
  { name: 'IcedLatte_Straw', pbrMetallicRoughness: { baseColorFactor: srgbToLinear('#f7f4f0'), metallicFactor: 0.04, roughnessFactor: 0.28 } },
];

const PLAID_ROW = [14, 10, 10, 12, 13, 10, 14, 11, 11, 12, 10, 13];
function getPlaidMaterial(uIdx, vIdx) {
  const u = ((uIdx % 12) + 12) % 12;
  const v = ((vIdx % 12) + 12) % 12;
  const ru = PLAID_ROW[u];
  const rv = PLAID_ROW[v];
  if (ru === 14 || rv === 14) return 14;
  if (ru === 12 || rv === 12) return 12;
  if (ru === 11 && rv === 11) return 11;
  if (ru === 11 || rv === 11) return (u + v) % 2 === 0 ? 11 : 13;
  if (ru === 13 || rv === 13) return 13;
  return 10;
}

// Note: in Three.js LatheGeometry, u=0 (phi=0) is +Z (FRONT), u=radialSegs/4 is +X (OUTER SIDE),
// u=radialSegs/2 is -Z (BACK), u=3*radialSegs/4 is -X (INNER SIDE).
function getDenimMaterial(uIdx, radialSegs, vIdx, heightSegs) {
  if (vIdx <= 2) return 18; // Rolled light-denim ankle cuff
  const u = uIdx % radialSegs;
  const q1 = Math.round(radialSegs * 0.25); // +X side seam
  const q3 = Math.round(radialSegs * 0.75); // -X inseam
  if (u === q1 || u === q3) return 17;
  // Front of thigh/shin is around u = 0..4 and u = radialSegs-4..radialSegs-1
  const distFromFront = Math.min(u, radialSegs - u) / radialSegs;
  if (distFromFront < 0.14 && vIdx >= 7 && vIdx <= heightSegs - 5) {
    return 16; // soft vintage front wash highlight
  }
  return 15;
}

// ---------------------------------------------------------------------------
// 2. Geometry Sculpting Helpers
// ---------------------------------------------------------------------------
function ensureIndexAndNormals(geom) {
  if (!geom.index) {
    const count = geom.attributes.position.count;
    const idx = new Uint32Array(count);
    for (let i = 0; i < count; i++) idx[i] = i;
    geom.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  geom.computeVertexNormals();
  return geom;
}

function transformGeom(geom, { sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, tx = 0, ty = 0, tz = 0 } = {}) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
  m.compose(new THREE.Vector3(tx, ty, tz), q, new THREE.Vector3(sx, sy, sz));
  geom.applyMatrix4(m);
  return ensureIndexAndNormals(geom);
}

function splitGridByMaterial(baseGeom, radialSegs, heightSegs, materialPicker) {
  const pos = baseGeom.attributes.position;
  const norm = baseGeom.attributes.normal;
  const stride = heightSegs + 1;
  const buckets = new Map();

  function addTri(matIdx, a, b, c) {
    let arr = buckets.get(matIdx);
    if (!arr) {
      arr = { pos: [], norm: [], idx: [] };
      buckets.set(matIdx, arr);
    }
    const base = arr.pos.length / 3;
    for (const v of [a, b, c]) {
      arr.pos.push(pos.getX(v), pos.getY(v), pos.getZ(v));
      arr.norm.push(norm.getX(v), norm.getY(v), norm.getZ(v));
    }
    arr.idx.push(base, base + 1, base + 2);
  }

  for (let u = 0; u < radialSegs; u++) {
    for (let v = 0; v < heightSegs; v++) {
      const a = u * stride + v;
      const b = (u + 1) * stride + v;
      const c = (u + 1) * stride + (v + 1);
      const d = u * stride + (v + 1);
      const matIdx = materialPicker(u, v);
      addTri(matIdx, a, b, d);
      addTri(matIdx, b, c, d);
    }
  }

  const parts = [];
  for (const [matIdx, data] of buckets.entries()) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(data.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(data.norm, 3));
    g.setIndex(data.idx);
    parts.push([g, matIdx]);
  }
  return parts;
}

// Sculpted feminine V-oval head matching Fizza's slender jawline & dainty chin
function createSculptedHead() {
  const g = new THREE.SphereGeometry(0.114, 48, 36);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    if (y >= 0) {
      y *= 1.12;
      x *= 0.98;
    } else {
      y *= 0.94; // compact, feminine lower face (chin tip at y = -0.107)
      const t = Math.min(1, -y / 0.107);
      // Slender V-oval jawline taper matching Fizza's photo
      x *= 1.0 - 0.44 * Math.pow(t, 1.35);
      z *= 1.0 - 0.18 * t;
      if (z > 0.02) {
        z += 0.012 * Math.sin(t * Math.PI * 0.85);
      }
    }

    // Soft natural cheekbones
    if (z > 0.02 && y > -0.042 && y < 0.025) {
      const cheek = Math.exp(-Math.pow((y + 0.008) / 0.030, 2)) * 0.007;
      z += cheek * Math.max(0, 1 - Math.abs(x) / 0.10);
    }

    pos.setXYZ(i, x, y, z);
  }
  return ensureIndexAndNormals(g);
}

// Sculpted cranial hair volume covering crown, back, temples & nape with 100% solid coverage
function createSculptedHairCap() {
  const radialSegs = 48;
  const latSegs = 32;
  const positions = [];
  const indices = [];

  function getHairRim(theta) {
    const cosT = Math.cos(theta); // +1 at front, -1 at back
    const sinT = Math.sin(theta); // +1 at left, -1 at right
    const absSin = Math.abs(sinT);

    let x, y, z;
    if (cosT >= 0) {
      // Front half: forehead hairline to sideburns
      const w = Math.pow(absSin, 1.25);
      x = sinT * (0.092 + 0.018 * w);
      // Forehead hairline at center sits naturally at y = 0.072 (natural feminine forehead)
      y = 0.072 * (1 - w) + (-0.045) * w;
      z = 0.112 * Math.sqrt(Math.max(0, 1 - Math.pow(absSin, 1.8))) + 0.025 * w;
    } else {
      // Back half: sideburns to nape of neck
      const backT = -cosT; // 0 at sides, 1 at back center
      const w = Math.pow(backT, 0.85);
      x = sinT * (0.105 * (1 - w * 0.95));
      y = (-0.045) * (1 - w) + (-0.142) * w;
      z = - (0.025 * (1 - w) + 0.124 * w);
    }
    return { x, y, z };
  }

  // Generate vertices row by row from apex (v=0) to rim (v=1)
  for (let j = 0; j <= latSegs; j++) {
    const v = j / latSegs; // 0 at top apex, 1 at rim
    const thetaV = v * Math.PI * 0.5;
    const sinV = Math.sin(thetaV);
    const cosV = Math.cos(thetaV);

    for (let i = 0; i <= radialSegs; i++) {
      const u = i / radialSegs;
      const theta = u * Math.PI * 2 - Math.PI; // -PI to +PI
      const rim = getHairRim(theta);

      let x = rim.x * sinV;
      let y = 0.150 * cosV + rim.y * Math.pow(sinV, 1.8);
      let z = rim.z * sinV;

      // Volumetric hair fullness (so it floats realistically over the skull, never clipping)
      const fullness = 1.0 + 0.08 * Math.sin(v * Math.PI);
      x *= fullness;
      z *= fullness;

      // Middle part indentation along top center of head (v < 0.72 and near z > 0)
      if (v < 0.72) {
        const frontBias = Math.max(0, Math.cos(theta));
        const partFactor = (1 - v / 0.72) * frontBias;
        const partIndent = 0.007 * Math.exp(-Math.pow(x / 0.016, 2)) * partFactor;
        const moundLeft = 0.008 * Math.exp(-Math.pow((x - 0.040) / 0.026, 2)) * partFactor;
        const moundRight = 0.008 * Math.exp(-Math.pow((x + 0.040) / 0.026, 2)) * partFactor;
        y += (moundLeft + moundRight - partIndent);
      }

      positions.push(x, y, z);
    }
  }

  // Generate quad indices with outward-facing normals
  const stride = radialSegs + 1;
  for (let j = 0; j < latSegs; j++) {
    for (let i = 0; i < radialSegs; i++) {
      const a = j * stride + i;
      const b = (j + 1) * stride + i;
      const c = (j + 1) * stride + i + 1;
      const d = j * stride + i + 1;
      // Winding order for outward normal: a, d, b, then d, c, b
      indices.push(a, d, b, d, c, b);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return ensureIndexAndNormals(g);
}

function createTaperedRibbon(points, { segs = 24, radialSegs = 10, rx0 = 0.035, rx1 = 0.012, ry0 = 0.016, ry1 = 0.006, twist = 0 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  const frames = curve.computeFrenetFrames(segs, false);
  const positions = [];
  const indices = [];

  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const center = curve.getPointAt(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const taper = Math.sin(Math.min(1, t * 1.12) * Math.PI * 0.5) * (1 - Math.pow(t, 2.3) * 0.62) + (1 - t) * 0.30;
    const rx = (rx0 * (1 - t) + rx1 * t) * Math.max(0.25, taper);
    const ry = (ry0 * (1 - t) + ry1 * t) * Math.max(0.25, taper);
    const angOffset = twist * t;

    for (let j = 0; j <= radialSegs; j++) {
      const theta = (j / radialSegs) * Math.PI * 2 + angOffset;
      const cx = Math.cos(theta) * rx;
      const cy = Math.sin(theta) * ry;
      positions.push(
        center.x + cx * N.x + cy * B.x,
        center.y + cx * N.y + cy * B.y,
        center.z + cx * N.z + cy * B.z
      );
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
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

// Multi-material woven plaid shirt torso (60 radial x 36 vertical quads)
// Bottom hem flares slightly over the jeans waistband so jeans NEVER poke through the shirt!
function createPlaidTorsoParts() {
  const pts = [];
  const heightSegs = 36;
  const rawProfile = [
    [-0.03, 0.060], // inner hem tuck
    [-0.025, 0.156], // outer flared shirt hem overlapping cleanly outside jeans waist
    [0.03,  0.150],
    [0.10,  0.138], // waist
    [0.18,  0.142],
    [0.26,  0.152], // bust
    [0.34,  0.156], // shoulders
    [0.39,  0.105], // shoulder slope
    [0.415, 0.044], // neck opening
  ];
  const profCurve = new THREE.SplineCurve(rawProfile.map(([y, r]) => new THREE.Vector2(r, y)));
  for (let j = 0; j <= heightSegs; j++) {
    pts.push(profCurve.getPoint(j / heightSegs));
  }

  const radialSegs = 60;
  const g = new THREE.LatheGeometry(pts, radialSegs);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i) * 0.72;
    if (z > 0.01 && y > 0.15 && y < 0.34) {
      const bust = Math.exp(-Math.pow((y - 0.245) / 0.06, 2)) * 0.022 * Math.max(0, 1 - Math.abs(x) / 0.15);
      z += bust;
    }
    pos.setXYZ(i, x * 1.04, y, z);
  }
  g.computeVertexNormals();

  return splitGridByMaterial(g, radialSegs, heightSegs, (u, v) => {
    // Open V-neck collarbone skin triangle at top front (u=0 / u=radialSegs is front +Z)
    const distFromFront = Math.min(u, radialSegs - u);
    const vFromTop = heightSegs - 1 - v;
    if (vFromTop <= 9 && distFromFront <= Math.floor((9 - vFromTop) * 0.85)) {
      return 0; // Skin in open V-neck
    }
    return getPlaidMaterial(u, v);
  });
}

function createPlaidSleeveParts(transformOpts) {
  const heightSegs = 18;
  const radialSegs = 36;
  const pts = [];
  for (let j = 0; j <= heightSegs; j++) {
    const t = j / heightSegs;
    const r = 0.044 * (1 - t) + 0.050 * t;
    const y = -0.105 + t * 0.21;
    pts.push(new THREE.Vector2(r, y));
  }
  const g = new THREE.LatheGeometry(pts, radialSegs);
  transformGeom(g, transformOpts);
  return splitGridByMaterial(g, radialSegs, heightSegs, (u, v) => getPlaidMaterial(u * 2, v * 2));
}

// Smooth sculpted high-waisted denim jeans pelvis that tucks cleanly INSIDE the shirt hem
function createDenimPelvisParts() {
  const heightSegs = 18;
  const radialSegs = 36;
  const rawProfile = [
    [-0.12, 0.005], // smooth closed saddle bottom between thighs
    [-0.11, 0.095],
    [-0.07, 0.144], // lower hip curve matching outer thigh width
    [-0.01, 0.146], // mid hip
    [0.04,  0.136], // upper waist tucked inside shirt hem (r=0.136 < shirt r=0.156)
    [0.06,  0.010],
  ];
  const profCurve = new THREE.SplineCurve(rawProfile.map(([y, r]) => new THREE.Vector2(r, y)));
  const pts = [];
  for (let j = 0; j <= heightSegs; j++) pts.push(profCurve.getPoint(j / heightSegs));
  const g = new THREE.LatheGeometry(pts, radialSegs);
  transformGeom(g, { sx: 1.00, sz: 0.68, ty: 0.83 });
  return splitGridByMaterial(g, radialSegs, heightSegs, (u) => {
    // Subtle dark-indigo center fly seam at front (u === 0) and side seams (q1, q3)
    const q1 = Math.round(radialSegs * 0.25);
    const q3 = Math.round(radialSegs * 0.75);
    if (u === 0 || u === q1 || u === q3) return 17;
    return 15;
  });
}

// Wide/straight-leg vintage blue denim jeans leg
function createDenimLegParts() {
  const heightSegs = 28;
  const radialSegs = 32;
  const rawProfile = [
    [0.00, 0.002],
    [0.005, 0.072],
    [0.042, 0.075],
    [0.052, 0.070],
    [0.24, 0.073],
    [0.44, 0.076],
    [0.64, 0.080],
    [0.73, 0.080], // upper thigh tucked cleanly inside pelvis
    [0.78, 0.062],
    [0.80, 0.002],
  ];
  const profCurve = new THREE.SplineCurve(rawProfile.map(([y, r]) => new THREE.Vector2(r, y)));
  const pts = [];
  for (let j = 0; j <= heightSegs; j++) pts.push(profCurve.getPoint(j / heightSegs));
  const g = new THREE.LatheGeometry(pts, radialSegs);
  transformGeom(g, { sx: 0.94, sz: 0.96, ty: -0.74 });
  return splitGridByMaterial(g, radialSegs, heightSegs, (u, v) => getDenimMaterial(u, radialSegs, v, heightSegs));
}

function createTaperedCylinder(rTop, rBot, h, segs = 20) {
  return ensureIndexAndNormals(new THREE.CylinderGeometry(rTop, rBot, h, segs, 4));
}

function createHand(isLeft) {
  const g = new THREE.SphereGeometry(0.032, 18, 14);
  return transformGeom(g, { sx: 0.82, sy: 1.25, sz: 0.52, rz: isLeft ? -0.08 : 0.08 });
}

// ---------------------------------------------------------------------------
// 3. Build Complete GLB 2.0 Binary
// ---------------------------------------------------------------------------
async function buildAvatarGLB() {
  const chunks = [];
  const bufferViews = [];
  const accessors = [];
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

  const meshes = [];
  function buildMeshFromParts(name, parts) {
    const byMat = new Map();
    for (const [geom, matIndex] of parts) {
      ensureIndexAndNormals(geom);
      let bucket = byMat.get(matIndex);
      if (!bucket) {
        bucket = { pos: [], norm: [], idx: [] };
        byMat.set(matIndex, bucket);
      }
      const posAttr = geom.attributes.position;
      const normAttr = geom.attributes.normal;
      const idxAttr = geom.index;
      const base = bucket.pos.length / 3;
      for (let i = 0; i < posAttr.count; i++) {
        bucket.pos.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
        bucket.norm.push(normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i));
      }
      for (let i = 0; i < idxAttr.count; i++) {
        bucket.idx.push(base + idxAttr.getX(i));
      }
    }

    const primitives = [];
    for (const [matIndex, bucket] of byMat.entries()) {
      const posArr = new Float32Array(bucket.pos);
      const normArr = new Float32Array(bucket.norm);
      const vCount = posArr.length / 3;
      const idxArr = vCount > 65535 ? new Uint32Array(bucket.idx) : new Uint16Array(bucket.idx);
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
      const idxBV = pushBytes(new Uint8Array(idxArr.buffer), 34963);

      const posAcc = accessors.length;
      accessors.push({ bufferView: posBV, componentType: 5126, count: vCount, type: 'VEC3', min, max });
      const normAcc = accessors.length;
      accessors.push({ bufferView: normBV, componentType: 5126, count: vCount, type: 'VEC3' });
      const idxAcc = accessors.length;
      accessors.push({ bufferView: idxBV, componentType: idxCompType, count: idxArr.length, type: 'SCALAR' });

      primitives.push({
        attributes: { POSITION: posAcc, NORMAL: normAcc },
        indices: idxAcc,
        material: matIndex,
      });
    }
    const idx = meshes.length;
    meshes.push({ name, primitives });
    return idx;
  }

  // --- 1. Lower Body: Denim Hips & Wide-Leg Jeans + Brown Birkenstock Sandals ---
  const hipsMesh = buildMeshFromParts('Hips', createDenimPelvisParts());

  function buildLegMesh(name, side) {
    const legParts = [
      ...createDenimLegParts(),
      [transformGeom(new THREE.TorusGeometry(0.070, 0.013, 10, 24), { rx: Math.PI / 2, ty: -0.715 }), 18],
      [transformGeom(createTaperedCylinder(0.038, 0.034, 0.10, 18), { ty: -0.77 }), 0],
      [transformGeom(new THREE.SphereGeometry(0.042, 18, 14), { sx: 0.90, sy: 0.52, sz: 1.70, ty: -0.814, tz: 0.038 }), 0],
      [transformGeom(new THREE.CylinderGeometry(0.050, 0.047, 0.024, 20), { sx: 0.96, sz: 1.90, ty: -0.836, tz: 0.040 }), 20],
      [transformGeom(new THREE.TorusGeometry(0.044, 0.011, 10, 20, Math.PI), { ty: -0.816, tz: 0.065 }), 19],
      [transformGeom(new THREE.TorusGeometry(0.046, 0.011, 10, 20, Math.PI), { ty: -0.808, tz: 0.014 }), 19],
      [transformGeom(new THREE.SphereGeometry(0.0085, 10, 8), { tx: side * 0.042, ty: -0.806, tz: 0.065 }), 21],
      [transformGeom(new THREE.SphereGeometry(0.0085, 10, 8), { tx: side * 0.044, ty: -0.800, tz: 0.014 }), 21],
    ];
    return buildMeshFromParts(name, legParts);
  }
  const legRightMesh = buildLegMesh('LegRight', -1);
  const legLeftMesh = buildLegMesh('LegLeft', 1);

  // --- 2. Upper Torso: Geometry-Baked Woven Plaid Button-Up Shirt ---
  const torsoParts = [
    ...createPlaidTorsoParts(),
    // Crisp folded V-neck shirt collar flaps (left & right) in tan & cocoa plaid
    [transformGeom(new THREE.BoxGeometry(0.046, 0.014, 0.065), { rx: 0.35, ry: -0.42, rz: -0.32, tx: -0.052, ty: 0.390, tz: 0.075 }), 10],
    [transformGeom(new THREE.BoxGeometry(0.046, 0.014, 0.065), { rx: 0.35, ry: 0.42, rz: 0.32, tx: 0.052, ty: 0.390, tz: 0.075 }), 10],
    // Front center placket (stays strictly inside shirt torso from y=0.02 to y=0.30!)
    [transformGeom(new THREE.BoxGeometry(0.018, 0.28, 0.006), { ty: 0.16, tz: 0.110 }), 13],
  ];
  for (let b = 0; b < 3; b++) {
    const by = 0.055 + b * 0.088;
    const bz = b === 1 ? 0.120 : 0.114;
    torsoParts.push([transformGeom(new THREE.SphereGeometry(0.0055, 10, 8), { sz: 0.5, ty: by, tz: bz }), 26]);
  }
  const torsoMesh = buildMeshFromParts('PlaidTorso', torsoParts);

  // --- 3. Head, Pretty Feminine Face & Voluminous Layered Dark-Brown Hair ---
  const headParts = [
    // Slender feminine neck connecting smoothly down into the V-neck shirt opening
    [transformGeom(createTaperedCylinder(0.036, 0.043, 0.17, 22), { ty: -0.125, tz: -0.012 }), 0],
    // Dainty gold necklace resting against upper chest in open V-neck
    [transformGeom(new THREE.TorusGeometry(0.044, 0.0026, 8, 24), { rx: 0.58, ty: -0.155, tz: 0.022 }), 21],
    [transformGeom(new THREE.CylinderGeometry(0.0048, 0.0048, 0.002, 12), { rx: Math.PI / 2, ty: -0.185, tz: 0.062 }), 21],
    // Sculpted oval feminine face with dainty chin
    [createSculptedHead(), 0],
    // Delicate nose bridge & small feminine nose tip
    [transformGeom(createTaperedCylinder(0.0045, 0.008, 0.032, 12), { rx: -0.16, ty: -0.002, tz: 0.115 }), 0],
    [transformGeom(new THREE.SphereGeometry(0.0098, 14, 12), { sx: 0.85, sy: 0.75, sz: 0.90, ty: -0.017, tz: 0.121 }), 0],
    // Warm, natural rose-berry smile (slightly wider with softly upturned corners)
    [createTaperedRibbon([
      [-0.028, -0.043, 0.098],
      [-0.013, -0.045, 0.109],
      [0.0,    -0.047, 0.111],
      [0.013,  -0.045, 0.109],
      [0.028,  -0.043, 0.098],
    ], { segs: 16, radialSegs: 8, rx0: 0.0046, rx1: 0.0046, ry0: 0.0042, ry1: 0.0042 }), 2],
    [createTaperedRibbon([
      [-0.025, -0.046, 0.099],
      [0.0,    -0.053, 0.110],
      [0.025,  -0.046, 0.099],
    ], { segs: 14, radialSegs: 8, rx0: 0.0058, rx1: 0.0058, ry0: 0.0050, ry1: 0.0050 }), 2],
  ];

  // Expressive Almond Brown Eyes + Winged Upper Eyeliner + Natural Arched Dark Brows
  for (const s of [-1, 1]) {
    const ex = s * 0.040;
    const ey = 0.018;
    const ez = 0.104;
    // Almond white sclera
    headParts.push([transformGeom(new THREE.SphereGeometry(0.0195, 20, 14), { sx: 1.24, sy: 0.72, sz: 0.42, rz: s * 0.05, ry: s * 0.18, tx: ex, ty: ey, tz: ez }), 6]);
    // Large warm dark-brown iris
    headParts.push([transformGeom(new THREE.SphereGeometry(0.0132, 18, 12), { sx: 0.98, sy: 0.98, sz: 0.32, ry: s * 0.18, tx: ex - s * 0.001, ty: ey + 0.001, tz: ez + 0.0065 }), 7]);
    // Deep black pupil
    headParts.push([transformGeom(new THREE.SphereGeometry(0.0072, 14, 10), { sx: 0.96, sy: 0.96, sz: 0.28, ry: s * 0.18, tx: ex - s * 0.001, ty: ey + 0.001, tz: ez + 0.0085 }), 8]);
    // Eye catchlight twinkles
    headParts.push([transformGeom(new THREE.SphereGeometry(0.0028, 8, 8), { tx: ex + s * 0.003, ty: ey + 0.0045, tz: ez + 0.010 }), 9]);
    headParts.push([transformGeom(new THREE.SphereGeometry(0.0015, 8, 8), { tx: ex - s * 0.0035, ty: ey - 0.003, tz: ez + 0.010 }), 9]);
    // Winged dark upper lash line
    headParts.push([createTaperedRibbon([
      [ex - s * 0.021, ey - 0.001, ez + 0.002],
      [ex - s * 0.007, ey + 0.010, ez + 0.008],
      [ex + s * 0.011, ey + 0.010, ez + 0.006],
      [ex + s * 0.025, ey + 0.003, ez - 0.001],
    ], { segs: 12, radialSegs: 6, rx0: 0.0038, rx1: 0.0028, ry0: 0.0034, ry1: 0.0024 }), 8]);
    // Natural gracefully arched dark-brown eyebrow
    headParts.push([createTaperedRibbon([
      [ex - s * 0.021, ey + 0.024, ez + 0.003],
      [ex - s * 0.004, ey + 0.031, ez + 0.006],
      [ex + s * 0.014, ey + 0.030, ez + 0.003],
      [ex + s * 0.026, ey + 0.022, ez - 0.004],
    ], { segs: 12, radialSegs: 8, rx0: 0.0048, rx1: 0.0024, ry0: 0.0036, ry1: 0.0022 }), 3]);
  }

  // --- Voluminous Layered Dark-Brown Hair ---
  headParts.push([createSculptedHairCap(), 3]);

  // Sweeping Face-Framing Curtain Bangs & Lush Overlapping Chest Waves (Left & Right)
  for (const s of [-1, 1]) {
    // Top center-parted curtain wave meeting seamlessly at x=0 on top of forehead (no gap, no shadow band!)
    headParts.push([createTaperedRibbon([
      [s * 0.008, 0.144, 0.075],
      [s * 0.045, 0.124, 0.096],
      [s * 0.098, 0.065, 0.092],
      [s * 0.116, -0.015, 0.078],
      [s * 0.112, -0.120, 0.092],
      [s * 0.095, -0.235, 0.116],
      [s * 0.075, -0.340, 0.120],
    ], { segs: 28, radialSegs: 12, rx0: 0.048, rx1: 0.024, ry0: 0.024, ry1: 0.012 }), 5]);

    // Mid-layer thick brunette wave overlapping seamlessly with curtain wave
    headParts.push([createTaperedRibbon([
      [s * 0.012, 0.142, 0.055],
      [s * 0.085, 0.112, 0.065],
      [s * 0.128, 0.025, 0.055],
      [s * 0.134, -0.09, 0.064],
      [s * 0.122, -0.23, 0.096],
      [s * 0.098, -0.37, 0.112],
    ], { segs: 28, radialSegs: 12, rx0: 0.056, rx1: 0.028, ry0: 0.028, ry1: 0.015 }), 4]);

    // Outer voluminous shoulder cascade
    headParts.push([createTaperedRibbon([
      [s * 0.032, 0.142, 0.010],
      [s * 0.108, 0.096, 0.018],
      [s * 0.144, -0.02, 0.018],
      [s * 0.148, -0.16, 0.038],
      [s * 0.134, -0.30, 0.074],
      [s * 0.114, -0.40, 0.092],
    ], { segs: 26, radialSegs: 10, rx0: 0.058, rx1: 0.028, ry0: 0.030, ry1: 0.016 }), 3]);
  }

  // Full Back Hair Waterfall
  for (let i = -4; i <= 4; i++) {
    const xOff = i * 0.034;
    const zCurve = -0.105 - (1 - Math.abs(i) / 4.5) * 0.035;
    const matIdx = Math.abs(i) % 2 === 0 ? 3 : 4;
    headParts.push([createTaperedRibbon([
      [xOff * 0.60, 0.135, -0.045],
      [xOff * 1.05, 0.03, zCurve],
      [xOff * 1.15, -0.14, zCurve - 0.018],
      [xOff * 1.08, -0.30, zCurve - 0.008],
      [xOff * 0.92, -0.43 + Math.abs(i) * 0.015, zCurve + 0.012],
    ], { segs: 22, radialSegs: 10, rx0: 0.054, rx1: 0.024, ry0: 0.028, ry1: 0.012 }), matIdx]);
  }
  const headMesh = buildMeshFromParts('HeadAndHair', headParts);

  // --- 4. Right Arm (Rolled 3/4 Plaid Sleeve + Gold Wristwatch + Waving Hand) ---
  const armRightParts = [
    [transformGeom(new THREE.SphereGeometry(0.050, 16, 14), { tx: 0.012, ty: 0.0 }), 10],
    ...createPlaidSleeveParts({ ty: -0.105 }),
    [transformGeom(new THREE.TorusGeometry(0.045, 0.010, 10, 20), { rx: Math.PI / 2, ty: -0.21 }), 14],
    [transformGeom(createTaperedCylinder(0.035, 0.027, 0.22, 18), { ty: -0.315 }), 0],
    [transformGeom(new THREE.TorusGeometry(0.029, 0.0045, 8, 18), { rx: Math.PI / 2, ty: -0.385 }), 21],
    [transformGeom(new THREE.CylinderGeometry(0.014, 0.014, 0.007, 16), { rz: Math.PI / 2, tx: -0.029, ty: -0.385 }), 21],
    [transformGeom(createHand(false), { ty: -0.45 }), 0],
  ];
  const armRightMesh = buildMeshFromParts('ArmRight', armRightParts);

  // --- 5. Left Arm (Rolled 3/4 Plaid Sleeve + Holding Multi-Layered Iced Latte Cup!) ---
  const armLeftParts = [
    [transformGeom(new THREE.SphereGeometry(0.050, 16, 14), { tx: -0.012, ty: 0.0 }), 10],
    ...createPlaidSleeveParts({ rz: 0.22, rx: -0.22, tx: 0.024, ty: -0.102, tz: 0.024 }),
    [transformGeom(new THREE.TorusGeometry(0.045, 0.010, 10, 20), { rx: Math.PI / 2 - 0.22, rz: 0.22, tx: 0.046, ty: -0.202, tz: 0.046 }), 14],
    [transformGeom(createTaperedCylinder(0.034, 0.027, 0.21, 18), { rx: -1.18, rz: -0.38, tx: 0.012, ty: -0.240, tz: 0.132 }), 0],
    [transformGeom(createHand(true), { rx: -1.0, tx: -0.034, ty: -0.280, tz: 0.220 }), 0],
    [transformGeom(createTaperedCylinder(0.042, 0.038, 0.040, 22), { tx: -0.042, ty: -0.218, tz: 0.242 }), 22],
    [transformGeom(createTaperedCylinder(0.038, 0.034, 0.045, 22), { tx: -0.042, ty: -0.260, tz: 0.242 }), 23],
    [transformGeom(createTaperedCylinder(0.034, 0.030, 0.040, 22), { tx: -0.042, ty: -0.302, tz: 0.242 }), 24],
    [transformGeom(new THREE.CylinderGeometry(0.014, 0.014, 0.005, 16), { rx: Math.PI / 2, tx: -0.042, ty: -0.258, tz: 0.276 }), 25],
    [transformGeom(new THREE.CylinderGeometry(0.044, 0.044, 0.016, 22), { tx: -0.042, ty: -0.192, tz: 0.242 }), 25],
    [transformGeom(new THREE.CylinderGeometry(0.004, 0.004, 0.095, 10), { rz: 0.14, rx: -0.12, tx: -0.048, ty: -0.148, tz: 0.248 }), 26],
  ];
  const armLeftMesh = buildMeshFromParts('ArmLeftWithLatte', armLeftParts);

  // ---------------------------------------------------------------------------
  // 4. Node Hierarchy & Smooth Keyframed Animations (idle, walk, wave, talk)
  // ---------------------------------------------------------------------------
  const nodes = [
    { name: 'ChefFizzRoot', children: [1], translation: [0, 0, 0] },
    { name: 'Hips', mesh: hipsMesh, translation: [0, 0, 0], rotation: [0, 0, 0, 1], children: [2, 6, 7] },
    { name: 'PlaidTorso', mesh: torsoMesh, translation: [0, 0.89, 0], rotation: [0, 0, 0, 1], children: [3, 4, 5] },
    { name: 'HeadAndHair', mesh: headMesh, translation: [0, 0.56, 0], rotation: [0, 0, 0, 1] },
    { name: 'ArmRight', mesh: armRightMesh, translation: [-0.158, 0.355, 0], rotation: [0, 0, -0.11, 0.9939] },
    { name: 'ArmLeftWithLatte', mesh: armLeftMesh, translation: [0.158, 0.355, 0], rotation: [0, 0, 0.06, 0.9982] },
    { name: 'LegRight', mesh: legRightMesh, translation: [-0.076, 0.85, 0], rotation: [0, 0, 0, 1] },
    { name: 'LegLeft', mesh: legLeftMesh, translation: [0.076, 0.85, 0], rotation: [0, 0, 0, 1] },
  ];

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

  const idleClip = makeClip('idle', 3.0, [
    {
      node: 2, path: 'translation',
      times: [0.0, 1.5, 3.0],
      values: [0, 0.89, 0,  0, 0.898, 0.003,  0, 0.89, 0],
    },
    {
      node: 3, path: 'rotation',
      times: [0.0, 1.5, 3.0],
      values: [...eulerToQuat(0, 0, 0.025), ...eulerToQuat(-0.02, 0.045, -0.02), ...eulerToQuat(0, 0, 0.025)],
    },
    {
      node: 4, path: 'rotation',
      times: [0.0, 1.5, 3.0],
      values: [...eulerToQuat(0, 0, -0.11), ...eulerToQuat(0.03, 0, -0.15), ...eulerToQuat(0, 0, -0.11)],
    },
  ]);

  const walkClip = makeClip('walk', 1.0, [
    {
      node: 6, path: 'rotation',
      times: [0.0, 0.25, 0.5, 0.75, 1.0],
      values: [
        ...eulerToQuat(0.34, 0, 0),
        ...eulerToQuat(0.0, 0, 0),
        ...eulerToQuat(-0.34, 0, 0),
        ...eulerToQuat(0.0, 0, 0),
        ...eulerToQuat(0.34, 0, 0),
      ],
    },
    {
      node: 7, path: 'rotation',
      times: [0.0, 0.25, 0.5, 0.75, 1.0],
      values: [
        ...eulerToQuat(-0.34, 0, 0),
        ...eulerToQuat(0.0, 0, 0),
        ...eulerToQuat(0.34, 0, 0),
        ...eulerToQuat(0.0, 0, 0),
        ...eulerToQuat(-0.34, 0, 0),
      ],
    },
    {
      node: 4, path: 'rotation',
      times: [0.0, 0.5, 1.0],
      values: [
        ...eulerToQuat(-0.24, 0, -0.11),
        ...eulerToQuat(0.24, 0, -0.11),
        ...eulerToQuat(-0.24, 0, -0.11),
      ],
    },
    {
      node: 1, path: 'translation',
      times: [0.0, 0.25, 0.5, 0.75, 1.0],
      values: [0, 0, 0,  0, 0.018, 0,  0, 0, 0,  0, 0.018, 0,  0, 0, 0],
    },
  ]);

  const waveClip = makeClip('wave', 2.0, [
    {
      node: 4, path: 'rotation',
      times: [0.0, 0.35, 0.65, 0.95, 1.25, 1.6, 2.0],
      values: [
        ...eulerToQuat(0, 0, -0.11),
        ...eulerToQuat(0, 0, 2.15),
        ...eulerToQuat(0, 0.35, 2.45),
        ...eulerToQuat(0, -0.35, 2.05),
        ...eulerToQuat(0, 0.35, 2.45),
        ...eulerToQuat(0, 0, 1.8),
        ...eulerToQuat(0, 0, -0.11),
      ],
    },
    {
      node: 3, path: 'rotation',
      times: [0.0, 0.5, 1.2, 2.0],
      values: [
        ...eulerToQuat(0, 0, 0),
        ...eulerToQuat(-0.05, 0.10, -0.07),
        ...eulerToQuat(-0.03, -0.05, 0.04),
        ...eulerToQuat(0, 0, 0),
      ],
    },
  ]);

  const talkClip = makeClip('talk', 2.0, [
    {
      node: 3, path: 'rotation',
      times: [0.0, 0.35, 0.75, 1.15, 1.55, 2.0],
      values: [
        ...eulerToQuat(0, 0, 0),
        ...eulerToQuat(0.07, 0.04, 0.02),
        ...eulerToQuat(-0.04, -0.05, -0.02),
        ...eulerToQuat(0.06, 0.02, 0.03),
        ...eulerToQuat(-0.02, 0.04, -0.01),
        ...eulerToQuat(0, 0, 0),
      ],
    },
    {
      node: 4, path: 'rotation',
      times: [0.0, 0.5, 1.0, 1.5, 2.0],
      values: [
        ...eulerToQuat(0, 0, -0.11),
        ...eulerToQuat(0.35, 0, -0.26),
        ...eulerToQuat(0.15, 0.18, -0.20),
        ...eulerToQuat(0.36, -0.1, -0.28),
        ...eulerToQuat(0, 0, -0.11),
      ],
    },
  ]);

  const gltf = {
    asset: { version: '2.0', generator: 'Fizza Aman Blender/GLTF Multi-Material Avatar Builder' },
    scene: 0,
    scenes: [{ name: 'Scene', nodes: [0] }],
    nodes,
    meshes,
    materials: MATERIALS,
    accessors,
    bufferViews,
    buffers: [{ byteLength: byteOffset }],
    animations: [idleClip, walkClip, waveClip, talkClip],
  };

  const jsonBuffer = Buffer.from(JSON.stringify(gltf), 'utf8');
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
  console.log(`Generated 100% geometry-baked public/models/chef-fizz.glb (${(finalGLB.length / 1024).toFixed(1)} KB) with ${MATERIALS.length} linear-calibrated PBR materials`);
}

buildAvatarGLB().catch((err) => {
  console.error(err);
  process.exit(1);
});
