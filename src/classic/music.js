// Girly dreamy pastel music-box + warm Rhodes electric-piano background soundtrack
// Synthesized cleanly with Web Audio API (zero external CDN requests, strict CSP safe).
// Starts smoothly on first user interaction (unless muted) or via #music-toggle button.

const BPM = 96;
const STEP_SEC = 60 / BPM / 2; // eighth-note step (~0.3125s)

// Dreamy 8-bar pastel Barbie-pop chord progression (MIDI note numbers)
const CHORDS = [
  [65, 69, 72, 76], // Fmaj7
  [67, 71, 74, 76], // G6
  [64, 67, 71, 74], // Em7
  [69, 72, 76, 79], // Am7
  [62, 65, 69, 72], // Dm7
  [67, 71, 74, 77], // G7
  [60, 64, 67, 71], // Cmaj7
  [60, 64, 67, 69], // C6
];

// Sweet celesta / music-box melody over the 8 bars (8 eighth-notes per bar = 64 steps; null = rest)
const MELODY = [
  // Bar 1 (Fmaj7)
  81, null, 79, 76, 77, null, 72, null,
  // Bar 2 (G6)
  79, null, 76, 74, 76, null, 71, null,
  // Bar 3 (Em7)
  76, null, 74, 71, 72, null, 74, 76,
  // Bar 4 (Am7)
  79, null, 81, null, 76, null, null, null,
  // Bar 5 (Dm7)
  77, null, 76, 74, 72, null, 74, null,
  // Bar 6 (G7)
  79, null, 77, 74, 71, null, 74, null,
  // Bar 7 (Cmaj7)
  76, null, 79, 81, 84, null, 79, null,
  // Bar 8 (C6 sparkle turnaround)
  76, 79, 81, null, 79, null, 76, null,
];

const BASS = [53, 55, 52, 57, 50, 55, 48, 48];

function midiToHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class GirlyMusicEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.delay = null;
    this.playing = false;
    this.muted = localStorage.getItem('fizza-music-muted') === '1';
    this.ducked = false;
    this.promoActive = false;
    this.step = 0;
    this.timer = null;
    this.listeners = new Set();
  }

  onChange(fn) {
    this.listeners.add(fn);
    fn(this.getState());
  }

  notify() {
    const s = this.getState();
    for (const fn of this.listeners) fn(s);
  }

  getState() {
    return { playing: this.playing, muted: this.muted };
  }

  ensureContext() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.0001;

      // Gentle fairy-light stereo-feel echo
      this.delay = this.ctx.createDelay(1.0);
      this.delay.delayTime.value = STEP_SEC * 1.5;
      const fb = this.ctx.createGain();
      fb.gain.value = 0.24;
      const delayFilter = this.ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.value = 2600;

      this.delay.connect(delayFilter);
      delayFilter.connect(fb);
      fb.connect(this.delay);
      delayFilter.connect(this.master);

      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  updateMasterGain() {
    if (!this.ctx || !this.master) return;
    const target = !this.playing || this.muted || this.promoActive
      ? 0.0001
      : this.ducked
        ? 0.045
        : 0.22;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.18);
  }

  playBell(midi, time, dur = 0.65, vol = 0.20) {
    const osc = this.ctx.createOscillator();
    const harm = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const hg = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(midiToHz(midi), time);
    harm.type = 'triangle';
    harm.frequency.setValueAtTime(midiToHz(midi) * 2, time);

    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    hg.gain.value = 0.12;
    osc.connect(g);
    harm.connect(hg).connect(g);
    g.connect(this.master);
    g.connect(this.delay);

    osc.start(time);
    harm.start(time);
    osc.stop(time + dur + 0.05);
    harm.stop(time + dur + 0.05);
  }

  playChordPad(midis, time, dur = STEP_SEC * 7.8) {
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1150, time);
    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.0001, time);
    padGain.gain.linearRampToValueAtTime(0.09, time + 0.18);
    padGain.gain.setValueAtTime(0.075, time + dur * 0.65);
    padGain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    filter.connect(padGain).connect(this.master);

    for (const m of midis) {
      const o = this.ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(midiToHz(m), time);
      o.connect(filter);
      o.start(time);
      o.stop(time + dur + 0.05);
    }
  }

  playBass(midi, time, dur = STEP_SEC * 3.6) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(midiToHz(midi), time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.14, time + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g).connect(this.master);
    o.start(time);
    o.stop(time + dur + 0.05);
  }

  tick() {
    if (!this.playing || this.muted || this.promoActive || !this.ctx) return;
    const now = this.ctx.currentTime + 0.04;
    const s = this.step % MELODY.length;
    const bar = Math.floor(s / 8);
    const beatInBar = s % 8;

    if (beatInBar === 0) {
      this.playChordPad(CHORDS[bar], now);
      this.playBass(BASS[bar], now);
    }
    if (beatInBar === 4) {
      this.playBass(BASS[bar] + 7, now, STEP_SEC * 2.5);
    }

    const note = MELODY[s];
    if (note !== null) {
      this.playBell(note, now);
    } else if (beatInBar % 2 === 1) {
      // Soft high sparkle arpeggio accent
      const chord = CHORDS[bar];
      this.playBell(chord[beatInBar % chord.length] + 12, now, 0.35, 0.055);
    }

    this.step = (this.step + 1) % MELODY.length;
  }

  start() {
    if (this.muted) return false;
    if (!this.ensureContext()) return false;
    if (this.playing) return true;
    this.playing = true;
    this.updateMasterGain();
    this.tick();
    this.timer = window.setInterval(() => this.tick(), STEP_SEC * 1000);
    this.notify();
    return true;
  }

  stop() {
    this.playing = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.updateMasterGain();
    this.notify();
  }

  toggle() {
    if (this.muted || !this.playing) {
      this.muted = false;
      localStorage.setItem('fizza-music-muted', '0');
      this.start();
    } else {
      this.muted = true;
      localStorage.setItem('fizza-music-muted', '1');
      this.stop();
    }
  }

  setDucked(on) {
    this.ducked = Boolean(on);
    this.updateMasterGain();
  }

  setPromoActive(on) {
    this.promoActive = Boolean(on);
    this.updateMasterGain();
  }
}

export const girlyMusic = new GirlyMusicEngine();

export function initBackgroundMusic() {
  const btn = document.getElementById('music-toggle');
  if (!btn) return;

  const render = ({ playing, muted }) => {
    const active = playing && !muted;
    btn.setAttribute('aria-pressed', String(active));
    btn.classList.toggle('playing', active);
    btn.textContent = active ? '🎵 Music: On' : muted ? '🔇 Music: Off' : '🎵 Play Music';
  };
  girlyMusic.onChange(render);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    girlyMusic.toggle();
  });

  // Start girly background music gently on first page interaction unless explicitly muted
  const autoUnlock = (ev) => {
    if (ev.target.closest?.('#music-toggle, #promo-play, #promo-canvas')) return;
    if (!girlyMusic.muted && !girlyMusic.playing) {
      girlyMusic.start();
    }
    window.removeEventListener('pointerdown', autoUnlock);
    window.removeEventListener('keydown', autoUnlock);
  };
  window.addEventListener('pointerdown', autoUnlock, { passive: true });
  window.addEventListener('keydown', autoUnlock, { passive: true });
}
