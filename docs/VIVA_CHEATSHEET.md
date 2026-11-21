# Viva Cheat-Sheet: Fizza Aman's Interactive 3D Web Portfolio

Use this guide during your viva / demo to explain every file and architectural choice clearly and confidently.

---

## 1. 30-Second Elevator Pitch
> "Assalam-o-Alaikum. My project is **Fizza's Travel Kitchen**, an interactive 3D web portfolio built with **Vite 8, vanilla JavaScript, Tailwind CSS 4, GSAP, and Three.js**. It has two experiences: a fast, accessible **Classic Portfolio** that works even without WebGL, and a lazy-loaded **Explore 3D Diorama** with 6 interactive hotspots and my custom Blender avatar **Chef Fizz** (`chef-fizz.glb`). On the backend, it uses **Vercel Serverless Functions** and **Supabase Postgres with pgvector**: `/api/contact` sends real emails via Gmail SMTP with 5 layers of anti-spam protection, and `/api/chat` runs my **RAG AI Twin** grounded on 17 chunks of my portfolio content with source citations, prompt-injection guards, and zero hallucinated personal data."

---

## 2. File-by-File Architecture Walkthrough

| File / Folder | What it does (how to explain it at the viva) |
|---|---|
| `index.html` | Single-page semantic HTML5 shell for Module 1 (Hero, 3D Avatar stage, 35s Promo Video player, About, Skills, Projects with category filter & search, Experience, Education, Contact form with Subject, and RAG Chatbot widget). |
| `src/style.css` | Tailwind CSS 4 theme (`@theme`) with my Barbie-pink palette (`#c2185b`, contrast ratio 5.9:1 on white) + Midnight Kitchen Dark Mode (`html[data-theme="dark"]`), reduced-motion rules, and responsive layouts. |
| `src/main.js` | Entry script. Initializes navigation, GSAP scroll reveals, Dark/Light theme toggle, project filter/search, promo player, contact form, and RAG chat widget. Checks `supportsWebGL()` and **dynamically imports** (`import()`) the 3D avatar stage and Explore 3D mode so Three.js is split into a separate lazy-loaded chunk. |
| `src/classic/avatar-stage.js` | **Module 2:** Renders `public/models/chef-fizz.glb` in the Hero section using `GLTFLoader` and `AnimationMixer`, plays `idle`, `wave`, `talk`, and `nod` animations, supports drag-to-spin, and rotates smoothly with mouse movement (`pointermove`). |
| `src/classic/music.js` | **Girly Background Music:** Synthesizes an 8-bar dreamy pastel music-box + Rhodes chord-pad WebAudio soundtrack (`Fmaj7 -> G6 -> Em7 -> Am7 -> Dm7 -> G7 -> Cmaj7 -> C6`), starts on first page gesture or `#music-toggle`, and ducks volume for promo/TTS. |
| `src/explore/scene.js` & `src/explore/index.js` | **Module 1 & Extra Credit 3D World:** Builds the low-poly Pink Travel Kitchen floating island diorama with procedural canvas textures (checkerboard tiles, world map with flight routes, globe, sky gradient), soft directional shadows, `OrbitControls`, `Raycaster` hover glow, and GSAP camera focus tweens to 6 hotspots (`src/explore/spots.js`). |
| `media/blender/make_chef_fizz.py` & `chef-fizz.blend` | **Module 2 Blender Source:** Python script and `.blend` file that construct Chef Fizz (Barbie-pink apron torso, chef hat, hair, gold pin, rigged arms/head) and export `public/models/chef-fizz.glb`. |
| `media/after-effects/build_promo.jsx` & `fizza-promo.aep` | **Module 3 Promo Video Source:** After Effects ExtendScript and `.aep` project file plus `public/video/fizza-promo.mp4` (35s showcase with captions `fizza-promo.vtt` and WebAudio chime soundtrack in `src/classic/promo-player.js`). |
| `content/*.md` & `scripts/ingest.mjs` | **Module 4 RAG Pipeline:** Markdown documents (`about.md`, `experience.md`, `projects.md`, `skills.md`, `contact.md`) split by section headings into 17 chunks, embedded locally (`content/kb-index.json`) and upserted to Supabase `public.kb_chunks` (`vector(768)` via Gemini `text-embedding-004`). |
| `api/_rag.js` & `api/chat.js` | **Module 4 Backend:** Screens queries for prompt injection and private data (phone/address), performs hybrid vector + keyword retrieval, refuses unanswerable questions instead of hallucinating, calls the Groq (`llama-3.1-8b-instant`) → Gemini (`gemini-2.5-flash`) LLM chain, filters output, and returns clickable section citations. |
| `api/_security.js` & `api/contact.js` | **Module 5 Backend:** Validates `name`, `email`, `subject`, `message` with **Zod**, checks origin allow-list, hidden `website` honeypot, HMAC SHA-256 time-trap token (`signTimestamp`/`verifyTimestamp`), salted IP-hash rate limit, Cloudflare Turnstile, stores in Supabase, and sends email via `nodemailer` over Gmail SMTP. |
| `supabase/migrations/001_portfolio.sql` | Enables `pgvector`, creates `contact_messages`, `rate_limits`, and `kb_chunks`, enables and **forces** Row-Level Security (RLS) with **zero policies**, and revokes `anon` access so the browser can never query the database directly. |

---

## 3. Common Viva Questions & Model Answers

1. **Q: Why did you lazy-load Three.js into a separate chunk?**
   - **A:** Three.js is ~165 KB gzipped. By dynamically importing `src/explore/index.js` and `src/classic/avatar-stage.js` only after initial load or button click, the main Classic portfolio JS stays under 50 KB gzipped and works even if WebGL is disabled.
2. **Q: How does your RAG chatbot avoid hallucinating facts or leaking your phone number?**
   - **A:** Three layers: (1) My phone number was stripped from `content/*.md` and `public/cv/Fizza-Aman-CV.pdf`, enforced by `scripts/check-secrets.mjs` and `tests/privacy.test.js`. (2) `screenQuery()` blocks any question asking for phone numbers, home addresses, or prompt-injection overrides. (3) `buildGroundedAnswer()` checks keyword and vector similarity thresholds—if a question is outside my portfolio (like Bitcoin trading or Formula 1), it explicitly refuses to guess.
3. **Q: How is your Contact Form protected against spam bots?**
   - **A:** Five defenses: origin header check, Zod schema length/email validation, a hidden CSS honeypot field (`website`), a cryptographically signed HMAC time-trap token that rejects forms submitted in under 1.2 seconds, and a salted IP-hash rate limiter (plus Cloudflare Turnstile when keys are set).
4. **Q: Why does your Supabase database have RLS enabled with NO policies?**
   - **A:** In Supabase, enabling and forcing RLS with zero policies denies all requests made with the public `anon` key. Only my server-side Vercel functions (`/api/contact` and `/api/chat`) can access the database using `SUPABASE_SERVICE_ROLE_KEY`, which never leaves the server.
