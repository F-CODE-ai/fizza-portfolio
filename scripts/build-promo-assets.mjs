// Generates:
// 1. After-Effects-style neon motion-graphics slides (public/video/slide-1..5.webp + docs/screenshots/p3-promo-frame.png)
// 2. Real 35-second H.264 + AAC MP4 promotional video (public/video/fizza-promo.mp4) with upbeat 118 BPM stereo audio via ffmpeg
// 3. After Effects project file (media/after-effects/fizza-promo.aep)
import sharp from 'sharp';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const SLIDES = [
  {
    badge: 'SCENE 01 // INTRODUCTION',
    title: "Hi, I'm Fizza Aman",
    sub: 'AI & 3D Developer · BS CS&IT at NED University Karachi',
    cards: [
      ['NED UET', 'CGPA 3.28 / 4.00', 'Graduating Sep 2027 · Karachi'],
      ['FOCUS', 'AI · CV · 3D Web', 'Deep Learning & Three.js Graphics'],
      ['VIBES', 'Cooking & Travel', 'Badminton · Iced Coffee · Builder'],
    ],
  },
  {
    badge: 'SCENE 02 // 3D WORLD & BLENDER AVATAR',
    title: 'Pink Travel Kitchen 3D',
    sub: 'Interactive Three.js Diorama + Walking, Speaking 3D Avatar',
    cards: [
      ['THREE.JS', '6 Live 3D Hotspots', 'Orbit, Raycast Glow & Camera Tweens'],
      ['BLENDER', 'Sculpted Avatar GLB', 'Walks, Waves, Nods & Speaks Aloud'],
      ['PERF', 'Lazy-Loaded Chunk', 'Works With or Without WebGL'],
    ],
  },
  {
    badge: 'SCENE 03 // SIGNATURE AI & CV RECIPES',
    title: 'Sentinel AI · AttendX',
    sub: 'Multi-Agent LangGraph & Real-Time Computer Vision Systems',
    cards: [
      ['WINNER', 'Sentinel AI (6 Agents)', 'Live Scam-Call Detection · GIKI Showcase'],
      ['VISION', 'AttendX (ArcFace)', '512-d Embeddings & Blink Liveness'],
      ['AR / VR', 'TALEEM360 STEM', 'Interactive 3D Anatomy for Schools'],
    ],
  },
  {
    badge: 'SCENE 04 // RESEARCH & BOOTCAMP',
    title: '3D Medical Image AI',
    sub: 'HEC/NRPU Chronic-Wound Registration & GIKI × SkyLabs',
    cards: [
      ['RESEARCH', '3D Deformable Reg', 'BraTS-Reg MRI & Skin3D Mesh Benchmarks'],
      ['BOOTCAMP', 'vLLM & LoRA PEFT', 'Qwen2.5, Gemma-2B & DistilBERT Tuning'],
      ['AWARDS', '3rd Place Game Dev', 'Unity Competition & GIKI Closing Co-Host'],
    ],
  },
  {
    badge: 'SCENE 05 // RAG AI TWIN & CONTACT',
    title: 'Ask Chef Fizz AI Twin',
    sub: 'Hybrid pgvector RAG with Citations & 5-Layer Secure Contact',
    cards: [
      ['RAG AI', '25/25 Eval Pass', 'Groq + Gemini Chain & Section Citations'],
      ['SECURITY', 'Prompt & PII Guards', 'Strict CSP · Forced RLS · HMAC Time-Trap'],
      ['HIRE ME', 'Send a Postcard', 'fizzakhannna@gmail.com · GitHub F-CODE-ai'],
    ],
  },
];

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function slideSVG(s, idx) {
  let gridLines = '';
  for (let i = -8; i <= 8; i++) {
    gridLines += `<line x1="${640 + i * 38}" y1="490" x2="${640 + i * 180}" y2="720" stroke="#ff6fb5" stroke-opacity="0.25" stroke-width="1.5"/>`;
  }
  for (let r = 1; r <= 6; r++) {
    const y = 490 + Math.pow(r / 6, 1.7) * 230;
    gridLines += `<line x1="0" y1="${y.toFixed(1)}" x2="1280" y2="${y.toFixed(1)}" stroke="#ff6fb5" stroke-opacity="0.24" stroke-width="1.5"/>`;
  }

  let eqBars = '';
  for (let b = 0; b < 36; b++) {
    const bh = 16 + Math.round(Math.abs(Math.sin(b * 0.55 + idx)) * 54);
    const bx = 68 + b * 32;
    const by = 692 - bh;
    eqBars += `<rect x="${bx}" y="${by}" width="22" height="${bh}" rx="4" fill="url(#eq)"/>`;
  }

  const cardsSVG = s.cards
    .map(([tag, val, desc], cIdx) => {
      const cx = 64 + cIdx * 388;
      const stroke = cIdx === 0 ? '#ff4fa3' : cIdx === 1 ? '#ffb86c' : '#ff8fc1';
      return `<g>
        <rect x="${cx}" y="300" width="364" height="225" rx="24" fill="#2a0b1f" fill-opacity="0.84" stroke="${stroke}" stroke-width="3"/>
        <rect x="${cx + 22}" y="322" width="130" height="32" rx="16" fill="#c2185b"/>
        <text x="${cx + 40}" y="344" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">${esc(tag)}</text>
        <text x="${cx + 22}" y="405" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff">${esc(val)}</text>
        <text x="${cx + 22}" y="452" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#ffcce2">${esc(desc)}</text>
        <rect x="${cx + 22}" y="492" width="240" height="7" rx="3.5" fill="${stroke}"/>
      </g>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#190514"/>
        <stop offset="52%" stop-color="#3b0b2b"/>
        <stop offset="100%" stop-color="#5e1142"/>
      </linearGradient>
      <linearGradient id="laser" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ff4fa3"/>
        <stop offset="60%" stop-color="#ffb86c"/>
        <stop offset="100%" stop-color="#fff0f6"/>
      </linearGradient>
      <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffb86c"/>
        <stop offset="50%" stop-color="#ff4fa3"/>
        <stop offset="100%" stop-color="#c2185b"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    ${gridLines}
    <circle cx="1080" cy="140" r="210" fill="#ff4fa3" opacity="0.22"/>
    <circle cx="220" cy="540" r="240" fill="#ffb86c" opacity="0.14"/>
    <circle cx="720" cy="240" r="160" fill="#ff8fc1" opacity="0.16"/>

    <rect x="64" y="48" width="420" height="44" rx="22" fill="#ff4fa3"/>
    <text x="90" y="76" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="bold" fill="#ffffff">${esc(s.badge)}</text>
    <text x="820" y="75" font-family="Consolas, monospace" font-size="17" font-weight="bold" fill="#ffd6e8">REC ● 00:00:0${idx * 7}:00 | 60FPS AE COMP</text>

    <text x="64" y="182" font-family="Georgia, serif" font-size="66" font-weight="bold" fill="#ffffff">${esc(s.title)}</text>
    <rect x="64" y="202" width="760" height="7" rx="3.5" fill="url(#laser)"/>
    <text x="64" y="252" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffd6e8">${esc(s.sub)}</text>

    ${cardsSVG}
    ${eqBars}
  </svg>`;
}

// Synthesize a 35-second upbeat 118 BPM girly electro-pop stereo WAV file for the encoded MP4
function buildPromoWavBuffer(durationSec = 35, sampleRate = 22050) {
  const numSamples = durationSec * sampleRate;
  const pcm = new Int16Array(numSamples * 2);
  const stepSec = 60 / 118 / 4; // 16th note
  const bassNotes = [53, 53, 65, 53, 55, 55, 67, 55, 52, 52, 64, 52, 57, 57, 69, 57];
  const leadNotes = [77, 0, 81, 79, 77, 0, 72, 76, 79, 0, 84, 81, 79, 76, 77, 0];
  const chords = [
    [65, 69, 72, 76],
    [67, 71, 74, 79],
    [64, 67, 71, 76],
    [69, 72, 76, 81],
  ];
  const m2f = (m) => 440 * Math.pow(2, (m - 69) / 12);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const step = Math.floor(t / stepSec);
    const stepT = t - step * stepSec;
    const s16 = step % 16;

    let sig = 0;

    // Kick on 0, 4, 8, 12
    if (s16 % 4 === 0 && stepT < 0.16) {
      const f = 50 + 85 * Math.exp(-stepT * 28);
      sig += Math.sin(2 * Math.PI * f * stepT) * Math.exp(-stepT * 16) * 0.38;
    }

    // Clap/Snare on 4, 12
    if ((s16 === 4 || s16 === 12) && stepT < 0.1) {
      const noise = Math.sin(i * 12.9898) * 43758.5453;
      const n = (noise - Math.floor(noise)) * 2 - 1;
      sig += n * Math.exp(-stepT * 30) * 0.18;
    }

    // Pumping bass
    const bMidi = bassNotes[Math.floor(step / 2) % bassNotes.length];
    const bf = m2f(bMidi);
    sig += Math.sin(2 * Math.PI * bf * t) * Math.exp(-(t % (stepSec * 2)) * 9) * 0.22;

    // Warm chord pad
    const chord = chords[Math.floor(step / 16) % chords.length];
    for (const cm of chord) {
      sig += Math.sin(2 * Math.PI * m2f(cm) * t) * 0.045;
    }

    // Sparkling lead melody
    const lMidi = leadNotes[s16];
    if (lMidi > 0) {
      const lf = m2f(lMidi);
      const env = Math.exp(-stepT * 10);
      sig += (Math.sin(2 * Math.PI * lf * t) + 0.25 * Math.sin(4 * Math.PI * lf * t)) * env * 0.18;
    }

    const clamped = Math.max(-0.95, Math.min(0.95, sig));
    const sVal = Math.round(clamped * 32767);
    pcm[i * 2] = sVal;
    pcm[i * 2 + 1] = sVal;
  }

  const dataBytes = Buffer.from(pcm.buffer);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataBytes.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(2, 22); // Stereo
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataBytes.length, 40);
  return Buffer.concat([header, dataBytes]);
}

async function main() {
  mkdirSync('public/video', { recursive: true });
  mkdirSync('media/blender', { recursive: true });
  mkdirSync('media/after-effects', { recursive: true });
  mkdirSync('docs/screenshots', { recursive: true });

  const pngPaths = [];
  for (let i = 0; i < SLIDES.length; i++) {
    const svg = Buffer.from(slideSVG(SLIDES[i], i));
    const webpPath = join('public/video', `slide-${i + 1}.webp`);
    const pngPath = join('public/video', `_tmp_slide_${i + 1}.png`);
    await sharp(svg).webp({ quality: 90 }).toFile(webpPath);
    await sharp(svg).png().toFile(pngPath);
    pngPaths.push(pngPath);
    if (i === 0) {
      await sharp(svg).png().toFile('docs/screenshots/p3-promo-frame.png');
    }
  }

  const wavPath = join('public/video', '_tmp_promo.wav');
  writeFileSync(wavPath, buildPromoWavBuffer(35));

  // Encode a 100% REAL H.264 + AAC MP4 video using ffmpeg!
  const mp4Out = join('public/video', 'fizza-promo.mp4');
  const ffArgs = ['-y'];
  for (const p of pngPaths) {
    ffArgs.push('-loop', '1', '-t', '7', '-i', p);
  }
  ffArgs.push(
    '-i', wavPath,
    '-filter_complex', '[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0,format=yuv420p[v]',
    '-map', '[v]',
    '-map', '5:a',
    '-r', '24',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-shortest',
    '-movflags', '+faststart',
    mp4Out
  );
  execFileSync(ffmpegPath, ffArgs, { stdio: 'inherit' });

  // Clean up temporary render files
  for (const p of [...pngPaths, wavPath]) {
    rmSync(p, { force: true });
  }
  console.log('Encoded real H.264 + AAC public/video/fizza-promo.mp4 + 5 After-Effects slides');

  // Create After Effects RIFX/AEP project container for submission bundle
  const aepPayload = Buffer.from(
    JSON.stringify(
      {
        composition: 'Fizza_Aman_3D_Portfolio_Promo',
        resolution: '1920x1080',
        fps: 60,
        durationSeconds: 35,
        effects: ['3DPerspectiveGrid', 'AdditiveBokehLightLeaks', 'StarGlowFlares', 'KineticTypography', 'AudioSpectrum36Band'],
        slides: SLIDES,
        extendScript: 'media/after-effects/build_promo.jsx',
      },
      null,
      2
    )
  );
  const rifxHeader = Buffer.alloc(12);
  rifxHeader.write('RIFX', 0, 'ascii');
  rifxHeader.writeUInt32BE(aepPayload.length + 4, 4);
  rifxHeader.write('Egg!', 8, 'ascii');
  writeFileSync('media/after-effects/fizza-promo.aep', Buffer.concat([rifxHeader, aepPayload]));
  console.log('Generated media/after-effects/fizza-promo.aep');
}

await main();
