# Fizza Aman — Interactive 3D Web Portfolio ("Fizza's Pink Travel Kitchen")

> **Semester Project — Web 3D Programming & Computer Science**  
> **Student:** Fizza Aman  
> **Live GitHub Repository:** [https://github.com/F-CODE-ai/fizza-portfolio](https://github.com/F-CODE-ai/fizza-portfolio)

Personal interactive 3D developer portfolio showcasing research and engineering work in **AI/ML, Deep Learning for Medical Imaging, Computer Vision, Multi-Agent Systems, and 3D Web Engineering**.

---

## 📌 Submission Deliverables Summary

| Deliverable | File / Asset | Location / Link |
|---|---|---|
| **1. GitHub Repository** | Full Source Code & Web App | [https://github.com/F-CODE-ai/fizza-portfolio](https://github.com/F-CODE-ai/fizza-portfolio) |
| **2. Blender 3D Model** | `chef-fizz.blend` (Blender 5.3) | [media/blender/chef-fizz.blend](https://github.com/F-CODE-ai/fizza-portfolio/blob/main/media/blender/chef-fizz.blend) |
| **3. Exported 3D Asset** | `chef-fizz.glb` (GLTF 2.0 binary) | [public/models/chef-fizz.glb](https://github.com/F-CODE-ai/fizza-portfolio/blob/main/public/models/chef-fizz.glb) |
| **4. Promo Video (MP4)** | `fizza-promo.mp4` (1080p/720p HD) | [public/video/fizza-promo.mp4](https://github.com/F-CODE-ai/fizza-portfolio/blob/main/public/video/fizza-promo.mp4) |
| **5. Promo Audio (MP3)** | `fizza-promo.mp3` (Separated Audio) | [public/video/fizza-promo.mp3](https://github.com/F-CODE-ai/fizza-portfolio/blob/main/public/video/fizza-promo.mp3) |
| **6. Submission Docx** | `Fizza_Aman_Submission_Links.docx` | [Fizza_Aman_Submission_Links.docx](https://github.com/F-CODE-ai/fizza-portfolio/blob/main/Fizza_Aman_Submission_Links.docx) |

---

## 💻 Instructor Quick-Start Guide (Running on Your System)

Follow these simple steps to clone, run, and evaluate the full interactive 3D portfolio on your local machine.

### Step 1: Install Prerequisites (Required Software)

Before running the project, please ensure the following tools are installed on your system:

| Software | Minimum Version | Purpose | Official Download Link |
|---|---|---|---|
| **Node.js** | `v20.x` or higher (LTS recommended) | JavaScript runtime & package manager (`npm`) | [Download Node.js](https://nodejs.org/en/download) |
| **Git** | `2.x+` | Source control & cloning | [Download Git](https://git-scm.com/downloads) |
| **Modern Web Browser** | Latest Chrome / Edge / Firefox | WebGL / WebGL2 3D rendering | [Download Chrome](https://www.google.com/chrome/) \| [Firefox](https://www.mozilla.org/firefox/) |
| **Blender** *(Optional)* | `4.x` or `5.x` (Created in `5.3`) | Opening & inspecting the original `.blend` 3D scene | [Download Blender](https://www.blender.org/download/) |
| **VS Code** *(Optional)* | Any modern code editor | Inspecting project code and markdown | [Download VS Code](https://code.visualstudio.com/) |

---

### Step 2: Clone the Repository

Open your terminal (PowerShell, Command Prompt, or Terminal on macOS/Linux) and run:

```bash
git clone https://github.com/F-CODE-ai/fizza-portfolio.git
cd fizza-portfolio
```

---

### Step 3: Install Required Dependencies

Install all project packages via npm:

```bash
npm install
```

*(Windows PowerShell note: If execution policy prevents running script files, use `npm.cmd install`)*

---

### Step 4: Launch the Local Development Server

Run the development server with live reload:

```bash
npm run dev
```

*(Windows PowerShell note: use `npm.cmd run dev`)*

Your terminal will display:
```text
  VITE v8.3.8  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### Step 5: Open in Your Browser & Evaluation Guide

Open your browser and navigate to:
**[http://localhost:5173/](http://localhost:5173/)**

#### Key Features to Inspect:

1. **Interactive 3D Avatar (Hero Section):**
   - Located on the right of the hero banner.
   - Modeled faithfully after Fizza Aman's reference photo with layered dark brunette hair, tan/blue plaid button-up flannel shirt, vintage blue denim jeans, leather slide sandals, gold wristwatch, and an iced latte cup.
   - Click the interactive action buttons:
     - **Wave 👋**: Plays waving animation with voice greeting.
     - **Talk 💬**: Plays gesturing animation with spoken introduction.
     - **Nod ✨**: Plays affirmative nod animation.
   - **Mouse Interaction**: Click and drag the avatar to spin 360°; move cursor around the canvas to see the avatar's head follow your mouse.

2. **Explore 3D Diorama Mode:**
   - Click the **"Explore 3D ✈"** button in the top navigation bar (or **"Explore in 3D"** button in the hero).
   - Loads a floating 3D pink travel kitchen diorama built in Three.js.
   - Navigate with **WASD / Arrow Keys** or **click anywhere on the floor** to watch the avatar walk.
   - Click on the 6 glowing interactive 3D hotspots:
     - 📖 **Recipe Book** (Projects)
     - 🌶 **Spice Rack** (Skills & Technologies)
     - 📬 **Fridge Postcards** (Contact System)
     - 🌍 **Spinning Globe** (About & Research Experience)
     - 🖼 **Wall Frames** (Education & NED UET)
     - 🧳 **Travel Suitcase** (Experience)
   - Click the **"Exit 3D ✕"** button to return to the Classic view seamlessly.

3. **Motion Graphics Showreel (35s):**
   - Scroll down to the **"#promo"** section.
   - Features custom motion graphics with a 36-band real-time audio spectrum visualizer, 118 BPM soundtrack, captions, and playback controls.

4. **Chef Fizz AI Assistant (RAG Chatbot):**
   - Click the **"Ask Chef Fizz AI"** pill button at the bottom-right of the screen.
   - Powered by grounded knowledge base chunks covering Fizza's research, deep learning models, publications, and background.

---

### Step 6: Running Automated Tests & Build Verification

The project includes an automated test suite verifying component isolation, security headers, privacy compliance, bundle size budgets, and secret scanning:

```bash
# Run all Vitest unit and integration tests
npm test

# Build production bundle into /dist
npm run build

# Verify bundle size budgets (max gzip limits)
npm run check:budget

# Scan repository for secrets / private credentials
npm run check:secrets

# Run all checks at once
npm run check:all
```

*(On Windows, prepend `npm.cmd` if required by execution policy).*

---

## 📦 Required Libraries & Package Documentation

The project relies on modern, industry-standard web libraries:

### Production Runtime Dependencies

| Library | Version | Documentation Link | NPM Package Link | Purpose |
|---|---|---|---|---|
| **Three.js** | `^0.187.0` | [Three.js Official Docs](https://threejs.org/docs/) | [npm/three](https://www.npmjs.com/package/three) | Core WebGL 3D rendering engine, GLTF loader, lights, cameras, and animation mixer |
| **GSAP** | `^3.15.1` | [GSAP Documentation](https://gsap.com/docs/v3/) | [npm/gsap](https://www.npmjs.com/package/gsap) | Smooth UI timeline animations and transitions |
| **Tailwind CSS** | `^4.3.5` | [Tailwind CSS Docs](https://tailwindcss.com/docs) | [npm/tailwindcss](https://www.npmjs.com/package/tailwindcss) | Modern responsive layout and utility styling |
| **Zod** | `^4.6.7` | [Zod Documentation](https://zod.dev/) | [npm/zod](https://www.npmjs.com/package/zod) | Type-safe schema validation for APIs and contact form inputs |
| **Nodemailer** | `^10.6.1` | [Nodemailer Docs](https://nodemailer.com/) | [npm/nodemailer](https://www.npmjs.com/package/nodemailer) | Serverless contact postcard email delivery |
| **@fontsource/quicksand** | `^5.3.0` | [Fontsource Quicksand](https://fontsource.org/fonts/quicksand) | [npm/@fontsource/quicksand](https://www.npmjs.com/package/@fontsource/quicksand) | Self-hosted clean geometric body typography |
| **@fontsource/pacifico** | `^5.3.0` | [Fontsource Pacifico](https://fontsource.org/fonts/pacifico) | [npm/@fontsource/pacifico](https://www.npmjs.com/package/@fontsource/pacifico) | Self-hosted playful display branding typography |

### Development & Asset Build Tools

| Tool | Version | Official Link | NPM Link | Purpose |
|---|---|---|---|---|
| **Vite** | `^8.3.8` | [Vite Guide](https://vite.dev/guide/) | [npm/vite](https://www.npmjs.com/package/vite) | Next-generation frontend bundler & fast HMR development server |
| **Vitest** | `^5.1.1` | [Vitest Guide](https://vitest.dev/guide/) | [npm/vitest](https://www.npmjs.com/package/vitest) | Fast unit and integration test runner |
| **Sharp** | `^0.35.5` | [Sharp Documentation](https://sharp.pixelplumbing.com/) | [npm/sharp](https://www.npmjs.com/package/sharp) | High-speed responsive WebP hero image compression |
| **@ffmpeg-installer/ffmpeg** | `^1.1.0` | [FFmpeg Project](https://ffmpeg.org/) | [npm/@ffmpeg-installer/ffmpeg](https://www.npmjs.com/package/@ffmpeg-installer/ffmpeg) | Standalone cross-platform FFmpeg binary for audio/video extraction |
| **PDF-Lib** | `^1.17.1` | [PDF-Lib Docs](https://pdf-lib.js.org/) | [npm/pdf-lib](https://www.npmjs.com/package/pdf-lib) | Procedural generation of the phone-free CV PDF |

---

## 📂 Project Architecture & Directory Structure

```text
fizza-portfolio/
├── Fizza_Aman_Submission_Links.docx   # Word submission document for evaluator
├── README.md                          # Instructor guide & project documentation
├── index.html                         # Dual-mode responsive single-page web app
├── package.json                       # Scripts, dependencies, and engine requirements
├── vite.config.js                     # Vite build configuration & Rollup chunking
├── vercel.json                        # CSP, security headers, and routing rules
│
├── api/                               # Serverless API endpoints
│   ├── chat.js                        # Chef Fizz AI RAG chat endpoint
│   ├── contact.js                     # Validated contact form endpoint with rate limiting
│   ├── _rag.js                        # Vector retrieval & Gemini/Groq fallback engine
│   └── _security.js                   # HMAC tokens, honeypot, and IP hashing
│
├── content/                           # Grounded knowledge base for AI Assistant
│   ├── about.md                       # Biography & research interests
│   ├── projects.md                    # AI/ML & 3D projects portfolio
│   ├── skills.md                      # Technical competencies & stack
│   ├── experience.md                  # Work history & research fellowships
│   ├── contact.md                     # Contact protocols
│   └── kb-index.json                  # Ingested chunks & search indices
│
├── docs/                              # Project reports, screenshots & cheatsheets
│   ├── reports/                       # Bundle budget & RAG evaluation reports
│   └── screenshots/                   # Verification renders and promo frames
│
├── media/                             # Original source project files
│   ├── blender/                       # 3D source files
│   │   ├── chef-fizz.blend            # Genuine Blender 5.3 3D scene & avatar
│   │   ├── make_chef_fizz.py          # Headless Blender render automation script
│   │   └── chef-fizz.glb              # Blender GLTF export
│   └── after-effects/                 # Motion graphics source files
│       ├── fizza-promo.aep            # After Effects project file
│       ├── build_promo.jsx            # AE automation script
│       └── fizza-promo.mp3            # Promo audio track
│
├── public/                            # Static assets served at root
│   ├── models/
│   │   └── chef-fizz.glb              # Multi-material GLTF 2.0 avatar asset
│   ├── video/
│   │   ├── fizza-promo.mp4            # 1080p/720p HD motion graphics showreel
│   │   ├── fizza-promo.mp3            # Separated MP3 audio deliverable
│   │   └── fizza-promo.vtt            # WebVTT accessibility captions
│   ├── img/                           # Responsive WebP hero graphics
│   └── cv/
│       └── Fizza-Aman-CV.pdf          # Clean phone-free printable CV
│
├── scripts/                           # Asset generation and validation scripts
│   ├── build-avatar-glb.mjs           # Geometry-baked GLTF avatar builder
│   ├── build-assets.mjs               # Sharp WebP image & PDF CV builder
│   ├── check-budget.mjs               # Automated gzip bundle size verifier
│   └── check-secrets.mjs              # Automated secret scanner
│
├── src/                               # Application source code
│   ├── main.js                        # Classic view orchestrator & WebGL detector
│   ├── style.css                      # Tailwind v4 theme & custom animations
│   ├── classic/                       # Classic mode UI modules
│   │   ├── avatar-stage.js            # Hero 3D Three.js avatar canvas controller
│   │   ├── chat.js                    # Floating AI chat drawer
│   │   ├── contact.js                 # Contact form validation & submission
│   │   ├── music.js                   # Procedural WebAudio background music
│   │   ├── promo-player.js            # 60 FPS video player with audio visualizer
│   │   └── voice.js                   # SpeechSynthesis voice greetings
│   └── explore/                       # Explore 3D diorama mode
│       ├── index.js                   # Explore 3D fullscreen overlay controller
│       ├── scene.js                   # Three.js floating island kitchen scene
│       ├── avatar.js                  # Character controller & walking navigation
│       └── spots.js                   # Interactive 3D clickable hotspots
│
└── tests/                             # Automated test suite
    ├── modules.test.js                # Core module exports & logic
    ├── portfolio.test.js              # HTML accessibility & DOM element tests
    └── privacy.test.js                # Privacy & credential leakage checks
```

---

## 👩‍💻 Author & Contact

* **Developer:** Fizza Aman
* **Institution:** NED University of Engineering & Technology
* **Field:** Computer Science, AI/ML, Medical Imaging, 3D Web Engineering
* **GitHub:** [https://github.com/F-CODE-ai](https://github.com/F-CODE-ai)
* **Portfolio Repository:** [https://github.com/F-CODE-ai/fizza-portfolio](https://github.com/F-CODE-ai/fizza-portfolio)
