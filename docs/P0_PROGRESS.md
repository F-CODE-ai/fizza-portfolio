# P0 progress: repo, toolchain, secret hygiene

- [x] package.json with exact pins (vite 8.3.8, three 0.187.0, gsap 3.15.1, tailwindcss 4.3.5, zod 4.6.7, nodemailer 10.6.1, vitest 5.1.1)
- [x] .npmrc: save-exact, ignore-scripts
- [x] .gitignore: .env*, private/, *.mp4, dist, node_modules
- [x] .env.example (names only)
- [x] vercel.json security headers + strict CSP (self + Turnstile only)
- [x] scripts/check-secrets.mjs (keys, JWTs, PK phone numbers)
- [x] scripts/check-budget.mjs
- [x] tests/privacy.test.js
- [x] content/*.md knowledge base from the CV (phone removed)
- [x] docs: PLAN, LIMITATIONS, security, SHOTLIST
- [x] `git init` (no commits made by the agent)
- Verified: `npm test` 2/2 pass · `npm run build` OK · budget OK · secrets scan OK

Next: P1 Classic portfolio once the theme is picked.
