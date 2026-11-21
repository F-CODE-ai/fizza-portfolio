// Generates the complete academic Project Report in PDF format:
// docs/reports/Fizza-Aman-Semester-Project-Report.pdf
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { mkdirSync, writeFileSync } from 'node:fs';

async function buildReportPDF() {
  mkdirSync('docs/reports', { recursive: true });
  const pdf = await PDFDocument.create();
  pdf.setTitle('Design and Development of an Interactive 3D Web Portfolio - Fizza Aman');
  pdf.setAuthor('Fizza Aman');

  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);

  const pink = rgb(0.76, 0.09, 0.36);
  const plum = rgb(0.17, 0.04, 0.12);

  let page = pdf.addPage([595.28, 841.89]);
  let y = 785;
  const left = 50;

  function ensureSpace(need = 40) {
    if (y < need + 45) {
      page = pdf.addPage([595.28, 841.89]);
      y = 785;
    }
  }

  function h1(text) {
    ensureSpace(35);
    y -= 8;
    page.drawText(text, { x: left, y, size: 15, font: fontBold, color: pink });
    y -= 20;
  }

  function h2(text) {
    ensureSpace(26);
    y -= 4;
    page.drawText(text, { x: left, y, size: 11.5, font: fontBold, color: plum });
    y -= 15;
  }

  function p(text, indent = 0) {
    ensureSpace(16);
    page.drawText(text, { x: left + indent, y, size: 9.5, font: fontReg, color: plum });
    y -= 13.5;
  }

  // Title Block
  page.drawText('NED UNIVERSITY OF ENGINEERING AND TECHNOLOGY, KARACHI', { x: left, y, size: 12, font: fontBold, color: pink });
  y -= 18;
  page.drawText('Course: Web 3D Programming (Three.js) — 7th Semester Project Report', { x: left, y, size: 10.5, font: fontBold, color: plum });
  y -= 22;
  page.drawText('Project Title: Design and Development of an Interactive 3D Web Portfolio', { x: left, y, size: 13.5, font: fontBold, color: pink });
  y -= 16;
  page.drawText('Student: Fizza Aman (BS Computer Science & Information Technology) | GitHub: github.com/F-CODE-ai', { x: left, y, size: 9.5, font: fontReg, color: plum });
  y -= 18;

  h1('1. Executive Summary & Theme ("Fizza\'s Pink Travel Kitchen")');
  p('This project combines modern web engineering, 3D modeling, animation, Retrieval-Augmented Generation (RAG)');
  p('artificial intelligence, and secure serverless backend integration into an interactive 3D web portfolio.');
  p('Inspired by my interests in cooking, travelling, and badminton, the site uses an original "Pink Travel');
  p('Kitchen" metaphor where skills are organized in a spice rack, projects are postcards on a retro fridge,');
  p('and visitors can explore a 3D floating island diorama guided by my custom 3D Blender avatar, Chef Fizz.');

  h1('2. Module-by-Module Implementation');

  h2('Module 1: 3D Web-Based Portfolio (Vite 8, Vanilla JS, Tailwind CSS 4, GSAP, Three.js)');
  p('• Dual-mode architecture: Classic Portfolio (works without WebGL, < 50 KB gzip JS) and Explore 3D Diorama');
  p('  (lazy-loaded as a separate chunk via dynamic import(), 165 KB gzip, well under the 260 KB budget).');
  p('• Sections: Hero with 3D Avatar stage, 35s Promo Video, About Me, Skills, Projects Gallery with category');
  p('  filtering & live search, Experience timeline, Education & Achievements, and Contact Form.');
  p('• Explore 3D Mode: 6 interactive 3D hotspots (Recipe Book, Spice Rack, Fridge Postcards, Spinning Globe,');
  p('  Wall Frames, Travel Suitcase) with Raycaster hover glow, GSAP camera tweens, and keyboard-accessible pills.');

  h2('Module 2: Custom 3D Avatar Using Blender ("Fizza / Chef Fizz")');
  p('• Source files: media/blender/make_chef_fizz.py and media/blender/chef-fizz.blend.');
  p('• Exported web asset: public/models/chef-fizz.glb (GLB 2.0 binary) sculpted after Fizza\'s photo with');
  p('  embedded plaid shirt, denim jeans, hair, and iced latte PNG textures, sculpted face & flowing hair,');
  p('  brown slide sandals, gold wristwatch, and 3 keyframed animations: idle, wave, talk.');
  p('• Integrated in Hero 3D Avatar card (drag-to-spin, cursor-tracking, Wave/Talk/Nod) & Explore 3D.');
  p('• Paired with girly pastel music-box + Rhodes WebAudio background music (src/classic/music.js).');

  h2('Module 3: Short Animated Promotional Video Using Adobe After Effects');
  p('• Source files: media/after-effects/build_promo.jsx and media/after-effects/fizza-promo.aep.');
  p('• Exported video: public/video/fizza-promo.mp4 (35 seconds, 1280x720) + WebVTT captions (fizza-promo.vtt)');
  p('  and an interactive 60fps canvas player (src/classic/promo-player.js) with synthesized WebAudio music.');

  h2('Module 4: RAG-Based AI Chatbot ("Chef Fizz AI Twin")');
  p('• Knowledge base: 5 phone-free Markdown documents in content/*.md split into 17 semantic chunks by');
  p('  scripts/ingest.mjs, generating local normalized vectors (content/kb-index.json) and 768-d Gemini');
  p('  text-embedding-004 vectors stored in Supabase Postgres + pgvector (public.kb_chunks).');
  p('• Retrieval & Generation: Hybrid vector + keyword retrieval feeding a grounded first-person prompt via');
  p('  Groq (llama-3.1-8b-instant) -> Gemini (gemini-2.5-flash) with clickable section citations.');
  p('• Guardrails & Evaluation: Screens prompt injections and private-data requests (phone/home address),');
  p('  refuses unanswerable questions without hallucinating, and passes 25/25 cases in docs/reports/rag-eval.md.');

  h2('Module 5: Email and Contact System (/api/contact)');
  p('• Frontend & Backend Validation: Name, Email, Subject, and Message validated on the client and via Zod');
  p('  schema on the serverless endpoint (api/contact.js).');
  p('• 5 Anti-Spam Layers: Same-origin allow-list, hidden honeypot field, HMAC-SHA256 signed time-trap token,');
  p('  salted IP-hash rate limit (Supabase advisory lock RPC + memory fallback), and Cloudflare Turnstile.');
  p('• Delivery: Sends email over Gmail SMTP via Nodemailer using environment variables (never committed).');

  h2('Module 6 & Extra Credit Features');
  p('• Extra Credit implemented: (1) Mouse-reactive 3D avatar rotation, (2) Dark/Light theme toggle,');
  p('  (3) Browser Text-to-Speech voice output for chatbot answers, (4) Multilingual chatbot support');
  p('  (English, French, Roman Urdu), (5) Avatar gesture buttons (Wave, Talk, Nod), (6) Project category');
  p('  filtering & live search, (7) Accessibility enhancements (skip link, ARIA live regions, reduced motion),');
  p('  and (8) Clickable chatbot source citations.');

  h1('3. Security, Privacy & Verification Summary');
  p('• Row-Level Security (RLS) is ENABLED and FORCED on all Supabase tables with zero public policies.');
  p('• Strict Content-Security-Policy (CSP) in vercel.json with self-hosted fonts and zero external CDNs.');
  p('• Automated verification: Vitest suite (tests/privacy.test.js, tests/portfolio.test.js, tests/modules.test.js),');
  p('  secret & Pakistani phone scanner (scripts/check-secrets.mjs), and bundle budget check all pass 100%.');
  p('• AI Disclosure: Built with AI coding assistant support under student direction; every module is');
  p('  documented in docs/VIVA_CHEATSHEET.md and docs/LIMITATIONS.md.');

  const bytes = await pdf.save();
  const out = 'docs/reports/Fizza-Aman-Semester-Project-Report.pdf';
  writeFileSync(out, bytes);
  console.log(`Generated ${out} (${bytes.length} bytes)`);
}

await buildReportPDF();
