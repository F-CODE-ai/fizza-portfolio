# Fizza Aman — Interactive 3D Web Portfolio ("Fizza's Pink Travel Kitchen")

Personal interactive 3D developer portfolio showcasing my work in **AI/ML, Deep Learning for Medical Imaging, Computer Vision, Multi-Agent LLM Systems, and 3D Web Engineering**.

**Live Experience:** Classic responsive portfolio + interactive 3D Pink Travel Kitchen diorama (`Three.js` + `Blender`) + AI Twin Assistant.

---

## 1. Architecture & Key Features

- **Interactive 3D Portfolio & Kitchen Diorama:** Dual-mode responsive web application (`index.html`, `src/style.css`, `src/main.js`). Includes a fast **Classic View** and a lazy-loaded **Explore 3D Diorama** (`src/explore/`) featuring a floating pink travel kitchen island with 6 interactive 3D hotspots (Recipe Book, Spice Rack, Fridge Postcards, Spinning Globe, Wall Frames, Travel Suitcase), floor click-to-walk navigation, and WASD controls.
- **Custom 3D Avatar (Blender & GLTF 2.0):** Original sculpted 3D avatar (`public/models/chef-fizz.glb` & `media/blender/chef-fizz.blend`) with layered brunette hair, woven plaid button-up shirt, vintage blue denim jeans, brown slide sandals, gold wristwatch, and iced latte cup. Supports `idle`, `walk`, `wave`, and `talk` animations, cursor tracking, speech synthesis voice greetings (`src/classic/voice.js`), and procedural WebAudio background music (`src/classic/music.js`).
- **35-Second Motion Graphics Showreel:** Interactive 60 FPS motion graphics player (`src/classic/promo-player.js`) with 36-band real-time audio spectrum visualizer, 118 BPM soundtrack, captions (`public/video/fizza-promo.vtt`), downloadable 1080p MP4 (`public/video/fizza-promo.mp4`), and After Effects project source (`media/after-effects/fizza-promo.aep`).
- **Chef Fizz AI Twin (RAG Assistant):** Grounded on portfolio knowledge chunks covering research, projects, skills, and education (`content/*.md` → `scripts/ingest.mjs` → `content/kb-index.json` & Supabase `pgvector`). Serverless endpoint `api/chat.js` + `api/_rag.js` with prompt-injection guards, privacy filters, Groq → Gemini LLM fallback chain, voice read-aloud, and clickable section citations.
- **Contact & Postcard System:** Validated on frontend (`src/classic/contact.js`) and backend (`api/contact.js` with Zod), protected by origin allow-list, honeypot, HMAC SHA-256 time-trap token, salted IP-hash rate limiter, Cloudflare Turnstile, Supabase storage, and Nodemailer SMTP delivery.
- **Security & Performance Engineering:** Configured in `vercel.json` with strict Content-Security-Policy and security headers, automated bundle size budgets (`scripts/check-budget.mjs`), and secret scanning (`scripts/check-secrets.mjs`).

---

## 2. Local Setup & Commands

```powershell
npm.cmd install
npm.cmd run dev
```

Copy `.env.example` to `.env` and configure your local environment variables (never commit `.env`).

| Command | Description |
|---|---|
| `npm.cmd run dev` | Start local Vite dev server on `http://localhost:5173` |
| `npm.cmd run build` | Production build into `dist/` |
| `npm.cmd test` | Run all Vitest unit, security, privacy, and integration tests |
| `npm.cmd run check:budget` | Verify gzip bundle size budgets (`docs/reports/bundle-budget.md`) |
| `npm.cmd run check:secrets` | Scan tracked files for leaked keys, `.env`, or phone numbers |
| `node scripts/ingest.mjs` | Rebuild knowledge base chunks (`content/kb-index.json`) |
| `node scripts/eval-rag.mjs` | Run the 25-question RAG evaluation suite (`docs/reports/rag-eval.md`) |

---

## 3. Environment Variables

Configure in `.env` locally and in the Vercel Dashboard for deployment:

`SITE_ORIGINS`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `FORM_HMAC_SECRET`, `CHAT_HMAC_SECRET`, `IP_HASH_SALT`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_TO`, `GEMINI_API_KEY`, `GROQ_API_KEY`.
