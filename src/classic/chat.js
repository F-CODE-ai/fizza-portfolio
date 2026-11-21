// Module 4 + P6-lite: RAG AI Twin Chatbot UI with clickable source citations,
// prompt-injection / private-data screening, browser speechSynthesis (TTS),
// and 3D avatar "talk" animation sync.
import { KB_CHUNKS } from './kb-chunks.js';
import { girlyMusic } from './music.js';

function triggerAvatarPose(name) {
  window.dispatchEvent(new CustomEvent('fizza:avatar-pose', { detail: name }));
}

const INJECTION_RE = /(ignore (all|previous|prior|above) (instructions|prompts|rules)|system prompt|reveal your (prompt|instructions|keys|secrets)|jailbreak|act as dan|developer mode|bypass (safety|security|filters)|print process\.env|supabase_service_role_key)/i;
const PRIVATE_DATA_RE = /\b(phone( number)?|mobile( number)?|whatsapp|cell ?phone|home address|street address|house number|cnic|id card|passport number)\b/i;
const STOP = new Set(['what', 'where', 'when', 'which', 'who', 'whom', 'whose', 'why', 'how', 'does', 'did', 'is', 'are', 'was', 'were', 'the', 'and', 'for', 'with', 'about', 'tell', 'me', 'fizza', 'aman', 'fizzas', 'her', 'she', 'have', 'has', 'can', 'you']);

function localAnswer(question) {
  const q = String(question || '').trim();
  if (INJECTION_RE.test(q)) {
    return {
      answer: "Nice try! I'm Chef Fizz, Fizza's grounded AI twin. I cannot ignore my instructions or reveal system prompts or secrets. Ask me about her AI projects, research, or skills instead!",
      citations: [{ id: 'contact-2', section: 'contact', title: 'Privacy Policy' }],
    };
  }
  if (PRIVATE_DATA_RE.test(q)) {
    return {
      answer: "For privacy, I never share Fizza's phone number, home address, or private personal identifiers. You can reach her via the contact form on this page or at fizzakhannna@gmail.com (Karachi, Pakistan).",
      citations: [{ id: 'contact-2', section: 'contact', title: 'Privacy Policy' }],
    };
  }

  const qLower = q.toLowerCase();
  const tokens = qLower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length > 2 && !STOP.has(t));
  const scored = KB_CHUNKS.map((c) => {
    const text = `${c.title} ${c.content} ${c.section}`.toLowerCase();
    let hits = 0;
    for (const tok of tokens) if (text.includes(tok)) hits++;
    return { ...c, hits };
  }).sort((a, b) => b.hits - a.hits);

  if (!tokens.length || scored[0].hits === 0) {
    return {
      answer: "I don't have that information in Fizza Aman's portfolio documents, so I won't guess or invent details. Try asking about her NED University research, Sentinel AI, AttendX, TALEEM360, NCAI internship, or technical skills!",
      citations: [{ id: 'about-1', section: 'about', title: 'About Fizza Aman' }],
    };
  }

  const top = scored.filter((c) => c.hits > 0).slice(0, 2);
  return {
    answer: top.map((c) => `${c.title}: ${c.content}`).join(' '),
    citations: top.map((c) => ({ id: c.id, section: c.section, title: c.title })),
  };
}

export function initChatWidget() {
  const fab = document.getElementById('chat-fab');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const ttsBtn = document.getElementById('chat-tts-toggle');
  const log = document.getElementById('chat-log');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  if (!fab || !panel || !log || !form || !input) return;

  let ttsEnabled = false;

  function setOpen(open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
  }

  fab.addEventListener('click', () => setOpen(panel.hidden));
  closeBtn?.addEventListener('click', () => setOpen(false));
  ttsBtn?.addEventListener('click', () => {
    ttsEnabled = !ttsEnabled;
    ttsBtn.setAttribute('aria-pressed', String(ttsEnabled));
    if (!ttsEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  function speak(text) {
    triggerAvatarPose('talk');
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02;
      u.pitch = 1.08;
      girlyMusic.setDucked(true);
      u.onend = () => girlyMusic.setDucked(false);
      u.onerror = () => girlyMusic.setDucked(false);
      window.speechSynthesis.speak(u);
    } catch {
      girlyMusic.setDucked(false);
    }
  }

  function appendMsg(role, text, citations = []) {
    const wrap = document.createElement('div');
    wrap.className = `chat-msg ${role}`;
    const p = document.createElement('p');
    p.textContent = text; // safe sink: textContent only
    wrap.appendChild(p);

    if (citations.length) {
      const row = document.createElement('div');
      row.className = 'chat-citations';
      for (const c of citations) {
        const a = document.createElement('a');
        a.className = 'chat-cite';
        a.href = `#${c.section}`;
        a.textContent = `📌 ${c.title}`;
        row.appendChild(a);
      }
      wrap.appendChild(row);
    }
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
  }

  async function ask(question) {
    const q = String(question || '').trim();
    if (!q) return;
    appendMsg('user', q);
    input.value = '';

    let data = null;
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      if (r.ok) data = await r.json();
    } catch {
      data = null;
    }

    const res = data?.answer ? data : localAnswer(q);
    appendMsg('bot', res.answer, res.citations || []);
    speak(res.answer);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ask(input.value);
  });

  document.querySelectorAll('[data-q]').forEach((btn) => {
    btn.addEventListener('click', () => ask(btn.getAttribute('data-q')));
  });
}
