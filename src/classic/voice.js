// Speaking Avatar Voice & Speech Bubble Engine
// Uses browser speechSynthesis with a female voice, ducks background music while speaking,
// triggers 3D avatar animations, and updates floating speech bubbles in Hero & Explore 3D.
import { girlyMusic } from './music.js';

export const AVATAR_SENTENCES = [
  "Hello! Hi! I'm Fizza Aman. What are you searching about me today?",
  "Welcome to my Pink Travel Kitchen! Are you looking for my AI projects, my 3D work, or my CV?",
  "I'm a Computer Science student at NED University in Karachi, researching 3D medical image registration!",
  "My signature recipes are Sentinel AI for live scam-call detection, AttendX face recognition, and TALEEM360 AR!",
  "When I'm not coding AI agents or 3D worlds, I love cooking, travelling, playing badminton, and iced coffee!",
  "Click Explore 3D to walk around my kitchen with me, or open Ask Chef Fizz AI to ask anything!",
];

export const SPOT_SPEECH = {
  about: "Here's my recipe book! Hello, I'm Fizza — I blend AI, computer vision, and 3D web with cooking and travel!",
  skills: "Welcome to my spice rack! Python, TypeScript, PyTorch, LangGraph multi-agent systems, ArcFace, and three.js!",
  projects: "Check out the postcards on my fridge! Sentinel AI won a GIKI Rector showcase, plus AttendX and TALEEM360!",
  experience: "Spinning the globe! I'm an Undergraduate Research Assistant in 3D medical imaging at NED and an NCAI AI alum!",
  education: "My wall of souvenirs! BS CS & IT at NED University with a 3.28 CGPA, plus 3rd place in Unity game development!",
  contact: "My suitcase is packed! What are you searching about me? Send me a postcard for internships or AI & 3D roles!",
};

let sentenceIdx = 0;
let bubbleTimer = null;

function pickFemaleVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;
  const preferred = voices.find((v) =>
    /zira|aria|jenny|samantha|victoria|karen|sara|female|google uk english female|google us english/i.test(v.name)
  );
  const en = voices.find((v) => /^en/i.test(v.lang));
  return preferred || en || voices[0];
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { pickFemaleVoice(); };
}

export function speakAvatarText(text, { pose = 'talk', onBubble } = {}) {
  const line = String(text || AVATAR_SENTENCES[0]).trim();

  // 1. Update Hero speech bubble if present
  const heroBubble = document.getElementById('avatar-speech');
  if (heroBubble) {
    heroBubble.textContent = line;
    heroBubble.hidden = false;
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
      heroBubble.hidden = true;
    }, Math.max(4800, line.length * 65));
  }

  // 2. Callback for Explore 3D floating speech bubble
  onBubble?.(line);

  // 3. Trigger 3D avatar animation
  window.dispatchEvent(new CustomEvent('fizza:avatar-pose', { detail: pose }));

  // 4. Speak aloud via Web Speech API
  if (!('speechSynthesis' in window)) return line;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(line);
    const voice = pickFemaleVoice();
    if (voice) u.voice = voice;
    u.rate = 1.03;
    u.pitch = 1.14;
    u.volume = 1.0;

    girlyMusic.setDucked(true);
    u.onend = () => girlyMusic.setDucked(false);
    u.onerror = () => girlyMusic.setDucked(false);
    window.speechSynthesis.speak(u);
  } catch {
    girlyMusic.setDucked(false);
  }
  return line;
}

export function speakNextAvatarSentence(pose = 'talk', onBubble) {
  const line = AVATAR_SENTENCES[sentenceIdx % AVATAR_SENTENCES.length];
  sentenceIdx = (sentenceIdx + 1) % AVATAR_SENTENCES.length;
  return speakAvatarText(line, { pose, onBubble });
}
