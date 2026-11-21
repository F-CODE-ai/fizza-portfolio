# Fizza Aman: Interactive 3D Web Portfolio ("Fizza's Pink Travel Kitchen")

Web 3D Programming (Three.js) Semester Project — **NED University of Engineering and Technology, Karachi** (7th Semester, BS CS&IT).

**Theme:** Option A — *Pink Travel Kitchen* · **Avatar:** *Chef Fizz* (`public/models/chef-fizz.glb`)

---

## 1. Modules Implemented (100% of Official Teacher Brief + 8 Extra-Credit Features)

- **Module 1 — 3D Web-Based Portfolio:** Dual-mode responsive site (`index.html`, `src/style.css`, `src/main.js`). Includes a fast **Classic Portfolio** (works with no WebGL) and a lazy-loaded **Explore 3D Diorama** (`src/explore/`) featuring a floating pink travel kitchen island with 6 interactive 3D hotspots (Recipe Book, Spice Rack, Fridge Postcards, Spinning Globe, Wall Frames, Travel Suitcase).
- **Module 2 — Custom 3D Avatar Using Blender:** Original sculpted 3D avatar modeled after Fizza Aman (long layered brown hair, woven plaid button-up shirt, washed blue denim jeans, brown slide sandals, gold watch, and iced latte cup) with 3 animations (`idle`, `wave`, `talk`). Source files in `media/blender/chef-fizz.blend` and `media/blender/make_chef_fizz.py`; exported web model at `public/models/chef-fizz.glb`, rendered both in the Hero 3D Avatar stage (`src/classic/avatar-stage.js`) and inside the Explore 3D kitchen (`src/explore/avatar.js`), accompanied by site-wide girly pastel background music (`src/classic/music.js`).
- **Module 3 — Short Animated Video Using Adobe After Effects:** 35-second promotional showcase (`public/video/fizza-promo.mp4` + captions `public/video/fizza-promo.vtt` + interactive 60fps canvas player `src/classic/promo-player.js` with WebAudio background chime soundtrack). Source project in `media/after-effects/fizza-promo.aep` and ExtendScript generator `media/after-effects/build_promo.jsx`.
- **Module 4 — RAG-Based AI Chatbot ("Chef Fizz AI Twin"):** Grounded on 17 chunks of Fizza's CV, research, projects, skills, and achievements (`content/*.md` → `scripts/ingest.mjs` → `content/kb-index.json` & Supabase `pgvector`). Serverless endpoint `api/chat.js` + `api/_rag.js` with prompt-injection guards, private-data filters (blocks phone/address requests), refusal on unanswerable queries, Groq → Gemini LLM fallback chain, and clickable section citations (`25/25 PASS` in `docs/reports/rag-eval.md`).
- **Module 5 — Email & Contact System:** Contact form with `name`, `email`, `subject`, and `message` validated on frontend (`src/classic/contact.js`) and backend (`api/contact.js` with Zod), protected by origin allow-list, honeypot, HMAC SHA-256 time-trap token, salted IP-hash rate limiter, Cloudflare Turnstile, Supabase storage, and Nodemailer Gmail SMTP delivery.
- **Module 6 — Deployment & Documentation:** Configured in `vercel.json` with strict Content-Security-Policy and security headers. Complete academic report PDF in `docs/reports/Fizza-Aman-Semester-Project-Report.pdf`, viva guide in `docs/VIVA_CHEATSHEET.md`, and live security demo script in `docs/VIVA_SECURITY_DEMO.md`.

---

## 2. Local Setup & Commands

```powershell
npm.cmd install
npm.cmd run dev
```
Copy `.env.example` to `.env` and fill in your local values (never commit `.env`).

| Command | Description |
|---|---|
| `npm.cmd run dev` | Start local Vite dev server on `http://localhost:5173` |
| `npm.cmd run build` | Production build into `dist/` |
| `npm.cmd test` | Run all Vitest unit, security, privacy, and module tests |
| `npm.cmd run check:budget` | Verify gzip bundle size budgets (`docs/reports/bundle-budget.md`) |
| `npm.cmd run check:secrets` | Scan tracked files for leaked keys, `.env`, or phone numbers |
| `node scripts/ingest.mjs` | Rebuild RAG chunks (`content/kb-index.json`) and upsert to Supabase pgvector |
| `node scripts/eval-rag.mjs` | Run the 25-question RAG evaluation suite (`docs/reports/rag-eval.md`) |

---

## 3. Environment Variables (Names Only — Set in `.env` Locally and in Vercel Dashboard)

`SITE_ORIGINS`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `FORM_HMAC_SECRET`, `CHAT_HMAC_SECRET`, `IP_HASH_SALT`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_TO`, `GEMINI_API_KEY`, `GROQ_API_KEY`.
