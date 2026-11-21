// Gzip size budget per built JS/CSS chunk. Run after "npm run build".
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const BUDGET_KB = { classic: 60, explore: 260, css: 25 }; // gzip KB
const dir = 'dist/assets';
let files;
try { files = readdirSync(dir); } catch { console.error('Run "npm run build" first.'); process.exit(2); }

const rows = [];
let fail = false;
for (const f of files.filter((x) => /\.(js|css)$/.test(x))) {
  const kb = gzipSync(readFileSync(join(dir, f))).length / 1024;
  const kind = f.endsWith('.css') ? 'css' : /explore|three|scene|avatar|GLTFLoader/i.test(f) ? 'explore' : 'classic';
  const ok = kb <= BUDGET_KB[kind];
  if (!ok) fail = true;
  rows.push(`| ${f} | ${kind} | ${kb.toFixed(1)} | ${BUDGET_KB[kind]} | ${ok ? 'OK' : 'OVER'} |`);
}
const report = ['# Bundle budget report', '', `Generated: ${new Date().toISOString()}`, '',
  '| file | kind | gzip KB | budget KB | status |', '|---|---|---|---|---|', ...rows, ''].join('\n');
mkdirSync('docs/reports', { recursive: true });
writeFileSync('docs/reports/bundle-budget.md', report);
console.log(report);
process.exit(fail ? 1 : 0);
