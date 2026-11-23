// 35-second After-Effects-style motion graphics promotional video player
// Features:
//  - 60 FPS procedural After Effects visual effects (3D perspective neon grid, additive light leaks,
//    rotating 4-point star flares, glassmorphic kinetic typography cards, holographic PiP preview,
//    whip-pan & shockwave transitions, and a live 36-bar audio spectrum visualizer)
//  - Upbeat 118 BPM multi-track girly electro-pop WebAudio soundtrack (kick, clap, hi-hat, bass, chords, lead)
//  - Synced voice narration per scene
import { girlyMusic } from './music.js';
import { speakAvatarText } from './voice.js';

const DURATION = 35; // 5 scenes x 7 seconds

const SCENES = [
  {
    code: 'SCENE 01 // INTRODUCTION',
    title: "Hi, I'm Fizza Aman",
    sub: 'AI & 3D Developer · BS CS&IT at NED University Karachi',
    cards: [
      { tag: 'NED UET', val: 'CGPA 3.28 / 4.00', desc: 'Graduating Sep 2027 · Karachi' },
      { tag: 'FOCUS', val: 'AI · CV · 3D Web', desc: 'Deep Learning & Interactive Graphics' },
      { tag: 'VIBES', val: 'Cooking & Travel', desc: 'Badminton · Iced Coffee · Builder' },
    ],
    voice: "Hello! Hi! I'm Fizza Aman, an AI and 3D developer at NED University in Karachi. Welcome to my portfolio promo!",
  },
  {
    code: 'SCENE 02 // 3D WORLD & BLENDER AVATAR',
    title: 'Pink Travel Kitchen 3D',
    sub: 'Interactive Three.js Diorama + Walking, Speaking 3D Avatar',
    cards: [
      { tag: 'THREE.JS', val: '6 Live 3D Hotspots', desc: 'Orbit, Raycast Glow & Camera Tweens' },
      { tag: 'BLENDER', val: 'Sculpted Avatar GLB', desc: 'Walks, Waves, Nods & Speaks Aloud' },
      { tag: 'PERF', val: 'Lazy-Loaded Chunk', desc: 'Works With or Without WebGL' },
    ],
    voice: "Explore my 3D Pink Travel Kitchen! My custom 3D avatar walks across the kitchen and speaks with you!",
  },
  {
    code: 'SCENE 03 // SIGNATURE AI & CV RECIPES',
    title: 'Sentinel AI · AttendX',
    sub: 'Multi-Agent LangGraph & Real-Time Computer Vision Systems',
    cards: [
      { tag: 'WINNER', val: 'Sentinel AI (6 Agents)', desc: 'Live Scam-Call Detection · GIKI Showcase' },
      { tag: 'VISION', val: 'AttendX (ArcFace)', desc: '512-d Embeddings & Blink Liveness' },
      { tag: 'AR / VR', val: 'TALEEM360 STEM', desc: 'Interactive 3D Anatomy for Schools' },
    ],
    voice: "Check out my top projects: Sentinel AI live scam-call detection, AttendX face recognition, and TALEEM360 AR!",
  },
  {
    code: 'SCENE 04 // RESEARCH & BOOTCAMP',
    title: '3D Medical Image AI',
    sub: 'HEC/NRPU Chronic-Wound Registration & GIKI × SkyLabs',
    cards: [
      { tag: 'RESEARCH', val: '3D Deformable Reg', desc: 'BraTS-Reg MRI & Skin3D Mesh Benchmarks' },
      { tag: 'BOOTCAMP', val: 'vLLM & LoRA PEFT', desc: 'Qwen2.5, Gemma-2B & DistilBERT Tuning' },
      { tag: 'AWARDS', val: '3rd Place Game Dev', desc: 'Unity Competition & GIKI Closing Co-Host' },
    ],
    voice: "I research 3D deformable medical image registration at NED University and completed the GIKI SkyLabs AI bootcamp!",
  },
  {
    code: 'SCENE 05 // RAG AI TWIN & CONTACT',
    title: 'Ask Chef Fizz AI Twin',
    sub: 'Hybrid pgvector RAG with Citations & 5-Layer Secure Contact',
    cards: [
      { tag: 'RAG AI', val: '25/25 Eval Pass', desc: 'Groq + Gemini Chain & Section Citations' },
      { tag: 'SECURITY', val: 'Prompt & PII Guards', desc: 'Strict CSP · Forced RLS · HMAC Time-Trap' },
      { tag: 'HIRE ME', val: 'Send a Postcard', desc: 'fizzakhannna@gmail.com · GitHub F-CODE-ai' },
    ],
    voice: "Chat with my grounded RAG AI twin or send me a postcard for AI and 3D opportunities!",
  },
];

// Pre-seeded particles & bokeh orbs for deterministic 60fps After Effects compositing
const ORBS = Array.from({ length: 24 }, (_, i) => ({
  x: (i * 173) % 1280,
  y: (i * 97) % 720,
  r: 22 + (i % 5) * 18,
  vx: (i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 9),
  vy: -14 - (i % 3) * 8,
  hue: i % 3 === 0 ? '#ff4fa3' : i % 3 === 1 ? '#ffb86c' : '#ff8fc1',
}));

const STARS = Array.from({ length: 14 }, (_, i) => ({
  x: 90 + ((i * 199) % 1100),
  y: 70 + ((i * 131) % 520),
  size: 10 + (i % 4) * 5,
  phase: i * 0.7,
}));

function midiToHz(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function drawStar(ctx, cx, cy, r, angle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 === 0 ? r : r * 0.22;
    const a = (i * Math.PI) / 4;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function initPromoPlayer() {
  const canvas = document.getElementById('promo-canvas');
  const playBtn = document.getElementById('promo-play');
  const muteBtn = document.getElementById('promo-mute');
  const fill = document.getElementById('promo-fill');
  const timeEl = document.getElementById('promo-time');
  if (!canvas || !playBtn) return;

  const ctx = canvas.getContext('2d');
  const heroImg = new Image();
  heroImg.src = '/img/hero-800.webp';
  heroImg.addEventListener('load', () => {
    if (!playing) drawFrame(elapsed);
  });

  let playing = false;
  let elapsed = 0;
  let lastTs = 0;
  let muted = false;
  let audioCtx = null;
  let nextStepAt = 0;
  let stepIdx = 0;
  let lastSpokenScene = -1;

  // 118 BPM upbeat 16th-note sequencer (step = ~0.127s)
  const STEP_DUR = 60 / 118 / 4;
  const BASS_SEQ = [53, 53, 65, 53, 55, 55, 67, 55, 52, 52, 64, 52, 57, 57, 69, 57];
  const LEAD_SEQ = [77, null, 81, 79, 77, null, 72, 76, 79, null, 84, 81, 79, 76, 77, null];
  const CHORD_SEQ = [
    [65, 69, 72, 76],
    [67, 71, 74, 79],
    [64, 67, 71, 76],
    [69, 72, 76, 81],
  ];

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx?.state === 'suspended') audioCtx.resume().catch(() => {});
    return Boolean(audioCtx);
  }

  function triggerPromoStep(step) {
    if (muted || !ensureAudio()) return;
    const now = audioCtx.currentTime + 0.02;
    const s16 = step % 16;

    // 1. Punchy Electro-Pop Kick on 0, 4, 8, 12
    if (s16 % 4 === 0) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(135, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.11);
      g.gain.setValueAtTime(0.24, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    // 2. Crisp Clap/Snare on 4, 12
    if (s16 === 4 || s16 === 12) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
      g.gain.setValueAtTime(0.14, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    }

    // 3. Upbeat Pumping Synth Bass on every 8th note
    if (s16 % 2 === 0) {
      const bNote = BASS_SEQ[Math.floor(step / 2) % BASS_SEQ.length];
      const osc = audioCtx.createOscillator();
      const flt = audioCtx.createBiquadFilter();
      const g = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(midiToHz(bNote), now);
      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(680, now);
      flt.frequency.exponentialRampToValueAtTime(220, now + 0.18);
      g.gain.setValueAtTime(0.11, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(flt).connect(g).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }

    // 4. Warm Chord Stab at start of every bar (s16 === 0 or 8)
    if (s16 === 0 || s16 === 8) {
      const chord = CHORD_SEQ[Math.floor(step / 16) % CHORD_SEQ.length];
      for (const m of chord) {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(midiToHz(m), now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.038, now + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0008, now + 0.55);
        osc.connect(g).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.58);
      }
    }

    // 5. Sparkling Pluck Lead Melody
    const lNote = LEAD_SEQ[s16];
    if (lNote !== null) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(midiToHz(lNote), now);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.095, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  function drawFrame(t) {
    const w = canvas.width;
    const h = canvas.height;
    const slideDur = DURATION / SCENES.length; // 7s
    const idx = Math.min(SCENES.length - 1, Math.floor(t / slideDur));
    const localT = (t % slideDur) / slideDur; // 0..1
    const scene = SCENES[idx];

    // 1. Deep After Effects Velvet-Magenta Cinema Background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#190514');
    bg.addColorStop(0.52, '#3b0b2b');
    bg.addColorStop(1, '#5e1142');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 2. Animated 3D Perspective Cyber-Pink Horizon Grid
    const horizonY = h * 0.68;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 111, 181, 0.24)';
    ctx.lineWidth = 1.5;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(w * 0.5 + i * 35, horizonY);
      ctx.lineTo(w * 0.5 + i * 195, h);
      ctx.stroke();
    }
    const gridScroll = (t * 1.4) % 1;
    for (let r = 0; r < 7; r++) {
      const p = Math.pow((r + gridScroll) / 7, 1.75);
      const y = horizonY + p * (h - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    // Glowing horizon laser beam
    const hGlow = ctx.createLinearGradient(0, horizonY - 16, 0, horizonY + 16);
    hGlow.addColorStop(0, 'rgba(255, 79, 163, 0)');
    hGlow.addColorStop(0.5, 'rgba(255, 143, 193, 0.55)');
    hGlow.addColorStop(1, 'rgba(255, 79, 163, 0)');
    ctx.fillStyle = hGlow;
    ctx.fillRect(0, horizonY - 16, w, 32);
    ctx.restore();

    // 3. Additive After Effects Bokeh Light Leaks
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const o of ORBS) {
      const ox = ((o.x + t * o.vx) % (w + 120) + (w + 120)) % (w + 120) - 60;
      const oy = ((o.y + t * o.vy) % (h + 120) + (h + 120)) % (h + 120) - 60;
      const pulse = 1 + Math.sin(t * 3.2 + o.r) * 0.22;
      const rad = o.r * pulse;
      const g = ctx.createRadialGradient(ox, oy, 2, ox, oy, rad);
      g.addColorStop(0, o.hue);
      g.addColorStop(0.5, 'rgba(255, 111, 181, 0.25)');
      g.addColorStop(1, 'rgba(255, 111, 181, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ox, oy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Whip-Pan & Entrance Motion-Graphics Curve
    const enterP = Math.min(1, localT / 0.07);
    const easeOut = 1 - Math.pow(1 - enterP, 3);
    const whipX = (1 - easeOut) * 110;

    ctx.save();
    ctx.translate(whipX, 0);

    // Top AE HUD Bar + Timecode
    roundRect(ctx, 64, 48, 390, 42, 21);
    ctx.fillStyle = 'rgba(255, 79, 163, 0.92)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px "Quicksand", "Segoe UI", sans-serif';
    ctx.fillText(scene.code, 88, 75);

    const tcSec = String(Math.floor(t)).padStart(2, '0');
    const tcFrm = String(Math.floor((t % 1) * 60)).padStart(2, '0');
    ctx.fillStyle = 'rgba(255, 224, 238, 0.85)';
    ctx.font = '700 16px monospace';
    ctx.fillText(`REC ● 00:00:${tcSec}:${tcFrm}  |  60FPS AE MOTION COMP`, w - 455, 74);

    // 5. Kinetic Headline with Neon Glow & Animated Laser Underline
    ctx.save();
    ctx.shadowColor = '#ff4fa3';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 62px Georgia, serif';
    ctx.fillText(scene.title, 64, 178);
    ctx.restore();

    const lineW = Math.min(680, easeOut * 680);
    const lGrad = ctx.createLinearGradient(64, 0, 64 + lineW, 0);
    lGrad.addColorStop(0, '#ff4fa3');
    lGrad.addColorStop(0.6, '#ffb86c');
    lGrad.addColorStop(1, '#fff0f6');
    ctx.fillStyle = lGrad;
    roundRect(ctx, 64, 198, Math.max(12, lineW), 6, 3);
    ctx.fill();

    // Subtitle with typewriter reveal
    const chars = Math.floor(scene.sub.length * Math.min(1, localT / 0.12));
    ctx.fillStyle = '#ffd6e8';
    ctx.font = '700 26px "Quicksand", "Segoe UI", sans-serif';
    ctx.fillText(scene.sub.slice(0, chars), 64, 246);

    // 6. Three Staggered Glassmorphic Feature Cards
    scene.cards.forEach((c, cIdx) => {
      const delay = 0.02 + cIdx * 0.03;
      const cp = Math.max(0, Math.min(1, (localT - delay) / 0.09));
      const cEase = 1 - Math.pow(1 - cp, 3);
      const cx = 64 + cIdx * 265;
      const cy = 295 + (1 - cEase) * 45;

      ctx.save();
      ctx.globalAlpha = cEase;
      roundRect(ctx, cx, cy, 248, 210, 22);
      ctx.fillStyle = 'rgba(42, 11, 31, 0.78)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = cIdx === 0 ? '#ff4fa3' : cIdx === 1 ? '#ffb86c' : '#ff8fc1';
      ctx.stroke();

      // Tag pill
      roundRect(ctx, cx + 18, cy + 18, 110, 28, 14);
      ctx.fillStyle = cIdx === 0 ? '#c2185b' : cIdx === 1 ? '#b86b11' : '#8c2f60';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 13px "Segoe UI", sans-serif';
      ctx.fillText(c.tag, cx + 32, cy + 37);

      // Value
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 23px "Segoe UI", sans-serif';
      ctx.fillText(c.val, cx + 18, cy + 94);

      // Desc
      ctx.fillStyle = '#ffcce2';
      ctx.font = '600 15px "Segoe UI", sans-serif';
      ctx.fillText(c.desc, cx + 18, cy + 136, 212);

      // Animated progress accent bar inside card
      roundRect(ctx, cx + 18, cy + 172, 212 * (0.55 + 0.45 * Math.sin(t * 2 + cIdx)), 6, 3);
      ctx.fillStyle = '#ff8fc1';
      ctx.fill();
      ctx.restore();
    });

    // 7. Floating 3D Picture-in-Picture Showcase Frame on the Right
    if (heroImg.complete && heroImg.naturalWidth) {
      const px = 875;
      const py = 125 + Math.sin(t * 2.2) * 10;
      const pw = 345;
      const ph = 380;
      ctx.save();
      ctx.shadowColor = '#ff4fa3';
      ctx.shadowBlur = 28;
      roundRect(ctx, px, py, pw, ph, 28);
      ctx.fillStyle = '#2a0b1e';
      ctx.fill();
      ctx.clip();
      const z = 1.12 + Math.sin(t * 0.9) * 0.06;
      ctx.drawImage(heroImg, px - 40, py - 20, pw * z, ph * z);

      // Holographic sweeping shine bar across PiP
      const shineX = px + ((t * 220) % (pw * 1.8)) - pw * 0.4;
      const sGrad = ctx.createLinearGradient(shineX, py, shineX + 85, py + ph);
      sGrad.addColorStop(0, 'rgba(255,255,255,0)');
      sGrad.addColorStop(0.5, 'rgba(255,255,255,0.28)');
      sGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sGrad;
      ctx.fillRect(px, py, pw, ph);
      ctx.restore();

      ctx.save();
      roundRect(ctx, px, py, pw, ph, 28);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ff8fc1';
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore(); // end whipX translate

    // 8. Twinkling 4-Point After Effects Star Flares
    for (const s of STARS) {
      const pulse = 0.45 + 0.55 * Math.abs(Math.sin(t * 3.4 + s.phase));
      ctx.fillStyle = `rgba(255, 240, 248, ${pulse.toFixed(2)})`;
      drawStar(ctx, s.x, s.y, s.size * pulse, t * 1.2 + s.phase);
    }

    // 9. Live 36-Bar Audio Spectrum Equalizer Visualizer at Bottom
    const bars = 36;
    const barW = 24;
    const gap = 8;
    const startX = (w - bars * (barW + gap)) / 2;
    for (let b = 0; b < bars; b++) {
      const wave =
        Math.sin(t * 9.5 + b * 0.45) * 0.45 +
        Math.cos(t * 14.2 - b * 0.3) * 0.35 +
        Math.sin(t * 4.0 + b) * 0.2;
      const activeAmp = playing ? 0.35 + Math.abs(wave) * 0.95 : 0.18 + Math.abs(Math.sin(b * 0.4)) * 0.25;
      const bh = Math.max(8, activeAmp * 78);
      const bx = startX + b * (barW + gap);
      const by = h - 28 - bh;

      const bGrad = ctx.createLinearGradient(bx, by, bx, h - 28);
      bGrad.addColorStop(0, '#ffb86c');
      bGrad.addColorStop(0.5, '#ff4fa3');
      bGrad.addColorStop(1, '#c2185b');
      ctx.fillStyle = bGrad;
      roundRect(ctx, bx, by, barW, bh, 4);
      ctx.fill();
    }

    // 10. Scene Transition Shockwave Ring & Flash (first 0.35s of each scene)
    if (localT < 0.08 && t > 0.2) {
      const fp = 1 - localT / 0.08;
      ctx.save();
      ctx.fillStyle = `rgba(255, 214, 236, ${(fp * 0.55).toFixed(2)})`;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = `rgba(255, 79, 163, ${fp.toFixed(2)})`;
      ctx.lineWidth = 12 * fp;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, (1 - fp) * 750, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function formatTime(sec) {
    const s = Math.floor(sec);
    return `0:${String(s).padStart(2, '0')}`;
  }

  function step(ts) {
    if (!playing) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.1, (ts - lastTs) / 1000);
    lastTs = ts;
    elapsed += dt;

    // Trigger 118 BPM 16th-note beat steps
    while (elapsed >= nextStepAt) {
      triggerPromoStep(stepIdx++);
      nextStepAt += STEP_DUR;
    }

    // Trigger voice narration at the start of each scene
    const curScene = Math.min(SCENES.length - 1, Math.floor(elapsed / (DURATION / SCENES.length)));
    if (curScene !== lastSpokenScene && !muted) {
      lastSpokenScene = curScene;
      speakAvatarText(SCENES[curScene].voice, { pose: 'talk' });
    }

    if (elapsed >= DURATION) {
      elapsed = DURATION;
      playing = false;
      girlyMusic.setPromoActive(false);
      playBtn.textContent = '↻ Replay 35s Promo';
    }

    drawFrame(elapsed);
    if (fill) fill.style.width = `${(elapsed / DURATION) * 100}%`;
    if (timeEl) timeEl.textContent = `${formatTime(elapsed)} / 0:35`;
    if (playing) requestAnimationFrame(step);
  }

  function togglePlay() {
    if (elapsed >= DURATION) {
      elapsed = 0;
      nextStepAt = 0;
      stepIdx = 0;
      lastSpokenScene = -1;
    }
    playing = !playing;
    lastTs = 0;
    girlyMusic.setPromoActive(playing && !muted);
    playBtn.textContent = playing ? '⏸ Pause Promo' : '▶ Play 35s Promo';
    if (playing) {
      nextStepAt = elapsed;
      requestAnimationFrame(step);
    }
  }

  // Draw dynamic initial poster frame with all cards, laser underline, PiP & equalizer visible
  drawFrame(2.4);
  playBtn.addEventListener('click', togglePlay);
  canvas.addEventListener('click', togglePlay);
  muteBtn?.addEventListener('click', () => {
    muted = !muted;
    muteBtn.setAttribute('aria-pressed', String(muted));
    muteBtn.textContent = muted ? '🔇' : '🎵';
    if (muted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    girlyMusic.setPromoActive(playing && !muted);
  });
}
