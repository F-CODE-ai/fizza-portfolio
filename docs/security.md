# Security design

## Principles
- The browser never talks to the database. Only `/api/*` serverless functions use the Supabase service-role key, which lives in server env vars.
- Supabase tables: RLS enabled **and forced**, **no policies**, so the anon key is denied on every table.
- Secrets live only in `.env` (git-ignored) and in Vercel env vars. `.env.example` lists names only.
- No phone number or home address anywhere: not in the site, the knowledge base, the prompts or the chatbot answers.
- Strict CSP (see `vercel.json`): only `self`, plus Cloudflare Turnstile. No CDNs, no inline scripts, no eval, no innerHTML sinks.
- Dependencies are pinned exactly (`save-exact`), install scripts are disabled (`ignore-scripts=true`), and `npm audit fix --force` is never used.

## Controls (filled in per phase)

| Control | Where | Test / evidence | Status |
|---|---|---|---|
| Secret + phone scanner | scripts/check-secrets.mjs | `npm run check:secrets` | P0 done |
| Security headers + CSP | vercel.json | Live header check, Observatory grade | P8 |
| Contact abuse controls | api/contact.js | tests/contact.test.js | P4 |
| RAG prompt-injection + private-data screen | api/chat.js | tests/guards.test.js, rag-eval | P5 |
| RLS verifier (anon denied) | scripts/verify-rls.mjs | docs/reports/rls.md | P4/P5 |

## Threat table (filled in per phase)

| Threat | Mitigation |
|---|---|
| Leaked API keys | .gitignore, scanner, server-only env vars |
| Spam via contact form | Turnstile, honeypot, HMAC time-trap, IP-hash rate limit |
| Prompt injection / data exfiltration via chatbot | Heuristics + guard model, grounded prompt, output filter, no private data in KB |
| XSS | CSP, textContent only, no innerHTML |
| Clickjacking | frame-ancestors 'none', X-Frame-Options DENY |
