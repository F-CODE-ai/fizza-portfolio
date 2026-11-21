// Shared security helpers for serverless endpoints: origin allow-list, salted IP hashing,
// HMAC time-trap tokens, Cloudflare Turnstile check, and in-memory + Supabase rate limits.
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const memBuckets = new Map();

export function hashIP(ip, salt = process.env.IP_HASH_SALT || 'fizza-default-salt') {
  return createHash('sha256').update(`${salt}:${ip || '0.0.0.0'}`).digest('hex').slice(0, 32);
}

export function clientIP(req) {
  const xf = req.headers?.['x-forwarded-for'] || req.headers?.get?.('x-forwarded-for') || '';
  return String(xf).split(',')[0].trim() || '127.0.0.1';
}

export function isAllowedOrigin(req) {
  const origin = req.headers?.origin || req.headers?.get?.('origin') || '';
  if (!origin) return true; // same-origin non-CORS or server test
  const raw = process.env.SITE_ORIGINS || 'http://localhost:5173,http://localhost:4173';
  const allowed = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) return true;
  // Also allow matching Vercel preview/production deployment host
  const host = req.headers?.host || req.headers?.get?.('host') || '';
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) return true;
  return false;
}

export function signTimestamp(ts = Date.now(), secret = process.env.FORM_HMAC_SECRET || 'fizza-dev-hmac-secret') {
  const payload = String(ts);
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyTimestamp(token, { minAgeMs = 1200, maxAgeMs = 2 * 3600 * 1000, secret = process.env.FORM_HMAC_SECRET || 'fizza-dev-hmac-secret' } = {}) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return { ok: false, reason: 'missing_token' };
  const [tsStr, sig] = token.split('.');
  const ts = Number(tsStr);
  if (!Number.isFinite(ts)) return { ok: false, reason: 'bad_ts' };
  const expected = createHmac('sha256', secret).update(tsStr).digest('hex');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: 'bad_sig' };
  const age = Date.now() - ts;
  if (age < minAgeMs) return { ok: false, reason: 'too_fast' };
  if (age > maxAgeMs) return { ok: false, reason: 'expired' };
  return { ok: true };
}

export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, bypassed: true };
  if (!token) return { ok: false, reason: 'missing_turnstile' };
  const body = new URLSearchParams({ secret, response: token, remoteip: ip || '' });
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = await r.json();
  return { ok: Boolean(data.success) };
}

export async function checkRateLimit(bucket, ipHash, windowSeconds = 300, maxHits = 5) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    try {
      const r = await fetch(`${url}/rest/v1/rpc/check_rate_limit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          p_bucket: bucket,
          p_ip_hash: ipHash,
          p_window_seconds: windowSeconds,
          p_max_hits: maxHits,
        }),
      });
      if (r.ok) {
        const allowed = await r.json();
        return Boolean(allowed);
      }
    } catch {
      // fall back to in-memory
    }
  }
  const now = Date.now();
  const k = `${bucket}:${ipHash}`;
  const list = (memBuckets.get(k) || []).filter((t) => now - t < windowSeconds * 1000);
  if (list.length >= maxHits) return false;
  list.push(now);
  memBuckets.set(k, list);
  return true;
}
