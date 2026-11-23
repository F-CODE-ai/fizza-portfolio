// Contact form serverless API (GET issues an HMAC time-trap token;
// POST validates input with zod, checks origin, honeypot, time-trap, Turnstile,
// rate limit, stores in Supabase with service role key, and sends email via Gmail SMTP).
import { z } from 'zod';
import nodemailer from 'nodemailer';
import {
  isAllowedOrigin,
  clientIP,
  hashIP,
  signTimestamp,
  verifyTimestamp,
  verifyTurnstile,
  checkRateLimit,
} from './_security.js';

export const ContactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().email('Valid email is required').max(120),
  subject: z.string().trim().min(2, 'Subject is required').max(120),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
  website: z.string().max(200).optional().default(''),
  formToken: z.string().optional(),
  turnstileToken: z.string().optional(),
});

async function storeInSupabase(row) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  const r = await fetch(`${url}/rest/v1/contact_messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  return r.ok;
}

async function sendGmail({ name, email, subject, message }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.CONTACT_TO || user || 'fizzakhannna@gmail.com';
  if (!user || !pass) return { sent: false, mode: 'simulated_no_smtp_env' };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Fizza Portfolio Contact" <${user}>`,
    to,
    replyTo: email,
    subject: `[Portfolio Postcard] ${subject} — from ${name}`,
    text: `New message from Fizza's Travel Kitchen portfolio:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n`,
  });
  return { sent: true, mode: 'gmail_smtp' };
}

export default async function handler(req, res) {
  try {
    if (!isAllowedOrigin(req)) {
      return res.status(403).json({ ok: false, error: 'Forbidden origin' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, formToken: signTimestamp() });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const rawBody = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const parsed = ContactSchema.safeParse(rawBody);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: parsed.error.issues?.[0]?.message || 'Invalid form fields',
      });
    }

    const data = parsed.data;

    // 1. Honeypot check: bots fill the hidden "website" field
    if (data.website && data.website.trim() !== '') {
      return res.status(200).json({ ok: true, message: 'Postcard received!' });
    }

    // 2. HMAC time-trap check (when token provided)
    if (data.formToken) {
      const vt = verifyTimestamp(data.formToken);
      if (!vt.ok) {
        return res.status(400).json({ ok: false, error: 'Please wait a moment before submitting.' });
      }
    }

    const ip = clientIP(req);
    const ipHash = hashIP(ip);

    // 3. Rate limit check (max 5 contact submissions per 10 minutes per IP hash)
    const allowed = await checkRateLimit('contact', ipHash, 600, 5);
    if (!allowed) {
      return res.status(429).json({ ok: false, error: 'Too many messages sent recently. Please try again later.' });
    }

    // 4. Cloudflare Turnstile check (when TURNSTILE_SECRET_KEY is configured)
    const ts = await verifyTurnstile(data.turnstileToken, ip);
    if (!ts.ok) {
      return res.status(400).json({ ok: false, error: 'Spam verification failed.' });
    }

    // 5. Store in Supabase + send email over Gmail SMTP (PII-free logs)
    const stored = await storeInSupabase({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      ip_hash: ipHash,
    });
    const mail = await sendGmail(data);

    return res.status(200).json({
      ok: true,
      stored,
      mailSent: mail.sent,
      message: 'Shukriya! Your postcard has been delivered to Fizza.',
    });
  } catch {
    return res.status(500).json({ ok: false, error: 'Could not send message right now. Please email fizzakhannna@gmail.com.' });
  }
}
