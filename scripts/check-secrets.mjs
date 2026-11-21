// Simple secret + PII scanner for tracked files. Exit code 1 if anything suspicious is found.
// Usage: node scripts/check-secrets.mjs
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, statSync } from 'node:fs';

const PATTERNS = [
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['Groq API key', /gsk_[0-9A-Za-z]{20,}/],
  ['JWT / Supabase key', /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/],
  ['Supabase secret key', /sb_secret_[0-9A-Za-z_-]{10,}/],
  ['Private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Turnstile secret', /0x4AAAAAAA[0-9A-Za-z_-]{20,}/],
  ['Pakistani mobile number', /(\+92|0092|\b0)3\d{2}[\s-]?\d{7}\b/],
  ['Generic assignment', /(PASSWORD|SECRET|API_KEY|SERVICE_ROLE_KEY)\s*=\s*['"]?[A-Za-z0-9_\-]{12,}/],
];

const SKIP = [/^package-lock\.json$/, /\.(png|jpe?g|webp|glb|gltf|blend|pdf|ico|mp4|woff2?)$/i];

let files;
try {
  files = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
} catch {
  console.error('Not a git repository yet. Run "git init" first.');
  process.exit(2);
}

const tracked = files.filter((f) => f === '.env' || /(^|\/)\.env(\.|$)/.test(f));
const problems = [];
for (const f of tracked) if (!f.endsWith('.env.example')) problems.push(`${f}: .env file is not ignored`);

for (const f of files) {
  if (SKIP.some((r) => r.test(f)) || !existsSync(f) || statSync(f).size > 2_000_000) continue;
  const text = readFileSync(f, 'utf8');
  text.split('\n').forEach((line, i) => {
    for (const [name, re] of PATTERNS) {
      if (re.test(line) && !line.includes('check-secrets:ignore')) problems.push(`${f}:${i + 1}  ${name}`);
    }
  });
}

if (problems.length) {
  console.error('Possible secrets / PII found (values not printed):');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log(`check-secrets: OK (${files.length} files scanned)`);
