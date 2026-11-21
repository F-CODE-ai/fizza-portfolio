// Generates public/img/hero-800.webp, public/img/hero-1600.webp, and public/cv/Fizza-Aman-CV.pdf (phone-free).
import sharp from 'sharp';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const HERO_SRC = 'C:\\Users\\EliteBook\\.gemini\\antigravity\\brain\\24c2d993-bc84-489b-8864-4624b3994735\\option_a_pink_travel_kitchen_1795195416482.jpg';

async function buildHeroImages() {
  mkdirSync('public/img', { recursive: true });
  if (!existsSync(HERO_SRC)) {
    throw new Error(`Hero source image not found at ${HERO_SRC}`);
  }
  for (const w of [800, 1600]) {
    const out = join('public/img', `hero-${w}.webp`);
    await sharp(HERO_SRC)
      .resize({ width: w })
      .webp({ quality: 80 })
      .toFile(out);
    console.log(`Generated ${out}`);
  }
}

async function buildPhoneFreeCV() {
  mkdirSync('public/cv', { recursive: true });
  const pdf = await PDFDocument.create();
  pdf.setTitle('Fizza Aman - CV');
  pdf.setAuthor('Fizza Aman');

  const page = pdf.addPage([595.28, 841.89]); // A4
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);

  const pink = rgb(0.76, 0.09, 0.36); // #c2185b
  const plum = rgb(0.17, 0.04, 0.12);

  let y = 795;
  const left = 45;

  const drawText = (text, { font = fontReg, size = 9.5, color = plum, indent = 0, step = 13.5 } = {}) => {
    page.drawText(text, { x: left + indent, y, size, font, color });
    y -= step;
  };

  const section = (title) => {
    y -= 6;
    drawText(title, { font: fontBold, size: 11.5, color: pink, step: 15 });
  };

  drawText('FIZZA AMAN', { font: fontBold, size: 20, color: pink, step: 16 });
  drawText('Karachi, Pakistan  |  fizzakhannna@gmail.com  |  linkedin.com/in/fizza-aman-7984b8301  |  github.com/F-CODE-ai', { size: 9, step: 14 });

  section('EDUCATION');
  drawText('NED University of Engineering and Technology — Karachi, Pakistan', { font: fontBold, size: 10 });
  drawText('BS Computer Science & Information Technology  |  Expected Graduation: Sep 2027  |  CGPA: 3.28 / 4.00');

  section('EXPERIENCE');
  drawText('Undergraduate Research Assistant — Medical Imaging | Deep Learning', { font: fontBold, size: 10 });
  drawText('NED University, Faculty Supervisor: Dr. Usman Amjad  |  Sep 2026 – Present', { size: 9 });
  drawText('• Researching 3D deformable, featureless image registration to track chronic-wound longitudinal progression (HEC/NRPU project).', { indent: 8 });
  drawText('• Validating on two proxy datasets: BraTS-Reg (brain MRI with expert landmarks) and Skin3D/3DBodyTex (3D skin-surface meshes).', { indent: 8 });
  drawText('• Independently benchmarking registration accuracy across both datasets toward real wound-progression data.', { indent: 8 });

  y -= 3;
  drawText('AI Intern — National Center of Artificial Intelligence (NCAI), Karachi  |  14 Jan 2026 – 16 Mar 2026', { font: fontBold, size: 10 });
  drawText('• Built and deployed a Student Management System capstone using Flask and SQLite (CRUD, REST API design).', { indent: 8 });
  drawText('• Code: github.com/F-CODE-ai/student-management-system', { indent: 8 });

  section('PROJECTS');
  drawText('Sentinel AI — Live Scam Call Detection (GIKI Advanced AI Bootcamp 2026 Capstone, Team of 3)', { font: fontBold, size: 10 });
  drawText('• Real-time scam-call detection using a 6-worker LangGraph multi-agent pipeline, FastAPI/WebSocket backend, React + Electron UI.', { indent: 8 });
  drawText('• Owned frontend, UI, and testing (including fixing a live microphone input bug). Winning-project showcase to the GIKI Rector.', { indent: 8 });
  drawText('• Code: github.com/Hassan-Raza-Shaikh/Live-Scam-Calling-Detection', { indent: 8 });

  y -= 3;
  drawText('AttendX — Face-Recognition Attendance System (Academic Project, Team of 2)', { font: fontBold, size: 10 });
  drawText('• Classroom attendance with ArcFace (ResNet-50, 512-d) recognition, EAR blink liveness, wave-gesture check-out, spoof rejection.', { indent: 8 });
  drawText('• Stack: InsightFace/ArcFace, MediaPipe, FastAPI, Docker, SQLite, Gradio UI (~45 students).', { indent: 8 });
  drawText('• Code: github.com/muhammadumerfarooqq/attendance-system', { indent: 8 });

  y -= 3;
  drawText('TALEEM360 — AR/VR STEM Education App (Final Year Project)', { font: fontBold, size: 10 });
  drawText('• Co-developing an AR app delivering interactive 3D anatomical models (e.g. heart) for school-level STEM curriculum.', { indent: 8 });

  y -= 3;
  drawText('Interactive 3D Web Portfolio (this website)', { font: fontBold, size: 10 });
  drawText('• Built with three.js, Vite, Tailwind CSS, Blender 3D avatar, RAG AI twin chatbot, and serverless contact API.', { indent: 8 });

  section('TECHNICAL SKILLS');
  drawText('Languages: Python, TypeScript, JavaScript, C, C++');
  drawText('Frameworks: PyTorch, TensorFlow, FastAPI, Flask, React, Electron, Unity, Unreal Engine, three.js');
  drawText('AI / ML: Deep Learning, Multi-Agent Systems (LangGraph), Computer Vision (ArcFace, MediaPipe), BERT NLP, LoRA/PEFT, sherpa-onnx');
  drawText('Tools: Git/GitHub, WebSockets, NumPy, scikit-learn, SQLite, Docker, Blender');

  section('BOOTCAMP & ACHIEVEMENTS');
  drawText('Advanced AI Bootcamp 2026 — GIKI × SkyLabs (01 Jul 2026 – 24 Aug 2026)', { font: fontBold, size: 10 });
  drawText('• 8-week intensive bootcamp: LLM inference optimization (Transformers vs. vLLM on Qwen2.5-0.5B, Gemma-2B, TinyLlama),', { indent: 8 });
  drawText('  LoRA/PEFT fine-tuning on DistilBERT, and LangGraph multi-agent systems.', { indent: 8 });
  drawText('• 3rd Place — Departmental Game Development Competition (Unity-based game).', { indent: 8 });
  drawText('• Co-host, GIKI Advanced AI Bootcamp 2026 Closing Ceremony  |  Volunteer, ICONICS\'24 International Conference.', { indent: 8 });

  section('LANGUAGES');
  drawText('English (fluent / professional)  —  French (basic, coursework at NED)');

  const bytes = await pdf.save();
  const out = 'public/cv/Fizza-Aman-CV.pdf';
  writeFileSync(out, bytes);
  console.log(`Generated ${out} (${bytes.length} bytes, phone-free)`);
}

await buildHeroImages();
await buildPhoneFreeCV();
