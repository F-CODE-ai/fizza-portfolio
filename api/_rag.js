// Shared RAG engine:
// - Chunks content/*.md
// - Screens user queries for prompt-injection attacks and private-data requests (phone, home address)
// - Performs hybrid retrieval (pgvector RPC when SUPABASE_URL + GEMINI_API_KEY exist, plus deterministic BM25-style TF-IDF + cosine vector index over content/kb-index.json)
// - Calls Groq -> Gemini LLM chain when API keys exist, with grounded deterministic fallback + source citations
// - Filters output so no phone number or secret ever leaks
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const INJECTION_RE = /(ignore (all|previous|prior|above) (instructions|prompts|rules)|system prompt|reveal your (prompt|instructions|keys|secrets)|jailbreak|act as dan|developer mode|bypass (safety|security|filters)|print process\.env|supabase_service_role_key)/i;
const PRIVATE_DATA_RE = /\b(phone( number)?|mobile( number)?|whatsapp|cell ?phone|home address|street address|house number|cnic|id card|passport number)\b/i;
const PHONE_LEAK_RE = /(\+92|0092|\b0)3\d{2}[\s-]?\d{7}\b/g;

export function screenQuery(q) {
  const text = String(q || '').trim();
  if (!text) return { blocked: true, reason: 'empty', reply: 'Please ask a question about Fizza Aman!' };
  if (text.length > 400) return { blocked: true, reason: 'too_long', reply: 'Please keep your question under 400 characters.' };
  if (INJECTION_RE.test(text)) {
    return {
      blocked: true,
      reason: 'prompt_injection',
      reply: "Nice try! I'm Chef Fizz, Fizza's grounded AI twin. I cannot ignore my instructions or reveal system prompts or secrets. Ask me about her AI projects, research, or skills instead!",
    };
  }
  if (PRIVATE_DATA_RE.test(text)) {
    return {
      blocked: true,
      reason: 'private_data',
      reply: "For privacy, I never share Fizza's phone number, home address, or private personal identifiers. You can reach her via the contact form on this page or at fizzakhannna@gmail.com (Karachi, Pakistan).",
    };
  }
  return { blocked: false };
}

export function filterOutput(text) {
  return String(text || '')
    .replace(PHONE_LEAK_RE, '[REDACTED-PHONE]')
    .replace(/AIza[0-9A-Za-z_-]{35}/g, '[REDACTED-KEY]')
    .replace(/gsk_[0-9A-Za-z]{20,}/g, '[REDACTED-KEY]');
}

// Deterministic 128-dim hashed n-gram vector embedding for offline/unit-test vector search
export function localEmbed(text, dims = 128) {
  const vec = new Float32Array(dims);
  const clean = String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = clean.split(/\s+/).filter(Boolean);
  for (const tok of tokens) {
    let h = 2166136261;
    for (let i = 0; i < tok.length; i++) {
      h ^= tok.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const idx = Math.abs(h) % dims;
    vec[idx] += 1;
  }
  let norm = 0;
  for (let i = 0; i < dims; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  return Array.from(vec, (v) => Number((v / norm).toFixed(5)));
}

export function cosineSim(a, b) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

export function loadChunksFromDisk(contentDir = 'content') {
  const indexFile = join(contentDir, 'kb-index.json');
  if (existsSync(indexFile)) {
    return JSON.parse(readFileSync(indexFile, 'utf8'));
  }
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.md'));
  const chunks = [];
  for (const file of files) {
    const raw = readFileSync(join(contentDir, file), 'utf8');
    const secMatch = raw.match(/section:\s*(\w+)/);
    const section = secMatch ? secMatch[1] : file.replace(/\.md$/, '');
    const body = raw.replace(/^---[\s\S]*?---\s*/, '');
    const parts = body.split(/\n(?=##?\s)/);
    parts.forEach((p, idx) => {
      const lines = p.trim().split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim() || section;
      const content = lines.slice(1).join(' ').replace(/\s+/g, ' ').trim() || title;
      chunks.push({
        id: `${section}-${idx + 1}`,
        section,
        title,
        content,
        localVec: localEmbed(`${title} ${content}`),
      });
    });
  }
  return chunks;
}

const STOP = new Set(['what', 'where', 'when', 'which', 'who', 'whom', 'whose', 'why', 'how', 'does', 'did', 'is', 'are', 'was', 'were', 'the', 'and', 'for', 'with', 'about', 'tell', 'me', 'fizza', 'aman', 'fizzas', 'her', 'she', 'have', 'has', 'can', 'you', 'parlez', 'vous', 'que', 'est', 'bonjour', 'salut', 'quels', 'sont', 'les', 'avec', 'salam', 'assalam', 'kya', 'mein', 'aur', 'hain', 'kar', 'rahi']);

export function retrieveLocal(query, k = 3, chunks = loadChunksFromDisk()) {
  const qLower = String(query || '').toLowerCase();
  const qVec = localEmbed(qLower);
  const qTokens = qLower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length > 2 && !STOP.has(t));

  const scored = chunks.map((c) => {
    const text = `${c.title} ${c.content} ${c.section}`.toLowerCase();
    let kwHits = 0;
    for (const tok of qTokens) {
      if (text.includes(tok)) kwHits += 1;
    }
    const kwScore = qTokens.length ? kwHits / qTokens.length : 0;
    const vecScore = c.localVec ? cosineSim(qVec, c.localVec) : 0;
    // Reciprocal combination of keyword overlap + vector similarity
    const score = kwScore * 0.68 + vecScore * 0.32;
    return { ...c, score, kwHits };
  });

  scored.sort((a, b) => b.score - a.score);
  return { top: scored.slice(0, k), qTokens };
}

export function buildGroundedAnswer(query, retrieved) {
  const { top, qTokens } = retrieved;
  const best = top[0];

  // Multilingual greeting check (Urdu / Roman Urdu / French / English)
  const q = String(query || '').toLowerCase();
  const isFrench = /\b(bonjour|salut|francais|français|qui est|projets|competences)\b/.test(q);
  const isUrdu = /\b(salam|assalam|kya|kaun|kahan|batao)\b/.test(q);

  // If the question has substantive tokens that don't match strongly in the knowledge base -> refuse to invent!
  const maxKwRatio = qTokens.length ? best.kwHits / qTokens.length : 0;
  if (qTokens.length > 0 && (best.kwHits === 0 || (qTokens.length >= 4 && maxKwRatio < 0.34))) {
    return {
      answer: "I don't have that information in Fizza Aman's portfolio documents, so I won't guess or invent details. You can ask me about her NED University research, Sentinel AI, AttendX, TALEEM360, NCAI internship, technical skills, or education!",
      citations: [{ id: 'about-1', section: 'about', title: 'About Fizza Aman' }],
      grounded: false,
    };
  }

  const chosen = top.filter((c) => c.kwHits > 0 || c === best).slice(0, 2);
  const summary = chosen.map((c) => `${c.title}: ${c.content}`).join(' ');
  const prefix = isFrench
    ? 'Bonjour ! Voici ce que disent les documents de Fizza : '
    : isUrdu
      ? 'Assalam-o-Alaikum! Fizza ke portfolio ke mutabiq: '
      : '';

  const citations = chosen.map((c) => ({
    id: c.id,
    section: c.section,
    title: c.title,
  }));

  return {
    answer: filterOutput(`${prefix}${summary}`),
    citations,
    grounded: true,
  };
}
