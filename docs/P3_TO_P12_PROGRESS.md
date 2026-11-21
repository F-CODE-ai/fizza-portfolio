# P3–P6 & P11–P12 Progress Summary

- [x] **P3 (Module 2 Blender Avatar & Module 3 After Effects Promo Video):**
  - Generated sculpted, non-blocky `public/models/chef-fizz.glb` (GLB 2.0 binary modeled after Fizza's photo: sculpted oval face, almond brown eyes with catchlights, flowing layered hair ribbons, woven tan/cream/slate plaid button-up shirt, blue denim jeans with rolled cuffs, brown slide sandals, gold wristwatch, and iced latte cup with green lid & straw, plus `idle`, `wave`, `talk` animations) + `media/blender/chef-fizz.blend` + `media/blender/make_chef_fizz.py`.
  - Added site-wide girly pastel WebAudio background music (`src/classic/music.js`, `#music-toggle` in header) with automatic volume ducking during promo video & chatbot TTS.
  - Embedded interactive Hero 3D Avatar stage (`src/classic/avatar-stage.js`) with drag-to-spin, mouse-tracking rotation, and `Wave`, `Talk`, `Nod` gesture buttons, plus Explore 3D kitchen placement (`src/explore/avatar.js`).
  - Generated 35-second promotional showcase (`public/video/fizza-promo.mp4`, `public/video/fizza-promo.vtt`, 5 high-res slides, `src/classic/promo-player.js` with WebAudio background chime music) + After Effects project (`media/after-effects/fizza-promo.aep` and `media/after-effects/build_promo.jsx`).
- [x] **P4 (Module 5 Email & Contact System):**
  - Added `subject` field to the contact form (`index.html`, `src/classic/contact.js`) as required by Module 5 of the official brief.
  - Built `/api/contact` (`api/contact.js`, `api/_security.js`) with Zod schema validation, origin allow-list, hidden `website` honeypot, HMAC SHA-256 time-trap token, salted IP-hash rate limiter, Cloudflare Turnstile check, Supabase storage, and Nodemailer Gmail SMTP delivery.
- [x] **P5 & P6-lite (Module 4 RAG Chatbot + Citations + Voice TTS + Multilingual):**
  - Built `scripts/ingest.mjs` producing `content/kb-index.json` and `src/classic/kb-chunks.js` (17 phone-free chunks) + Supabase `pgvector` upsert.
  - Built `api/_rag.js` and `api/chat.js` with prompt-injection screening, private-data blocking (phone/address/CNIC), unanswerable question refusal, Groq → Gemini LLM fallback chain, and clickable section citations.
  - Verified 25/25 pass in `scripts/eval-rag.mjs` (`docs/reports/rag-eval.md`).
  - Built floating chat widget (`src/classic/chat.js`) with browser `speechSynthesis` voice read-aloud toggle synced to the 3D avatar's `talk` animation.
- [x] **Extra Credit & Viva / Submission Pack (P10–P12):**
  - Dark/Light Midnight Kitchen theme toggle & Project category filter + search (`src/classic/extras.js`).
  - `docs/VIVA_CHEATSHEET.md`, `docs/VIVA_SECURITY_DEMO.md`, and `docs/reports/Fizza-Aman-Semester-Project-Report.pdf`.
