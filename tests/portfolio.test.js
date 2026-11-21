import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { SPOTS } from '../src/explore/spots.js';

describe('P1 Classic portfolio & P2 Explore hotspots', () => {
  it('index.html contains all mandatory portfolio sections (M1)', () => {
    const html = readFileSync('index.html', 'utf8');
    for (const id of ['about', 'skills', 'projects', 'experience', 'education', 'contact']) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('href="#main"'); // skip link
    expect(html).toContain('/cv/Fizza-Aman-CV.pdf');
    expect(html).toContain('/img/hero-800.webp');
    expect(html).toContain('/img/hero-1600.webp');
  });

  it('public assets exist and are non-empty (WebP hero + phone-free CV PDF)', () => {
    for (const p of ['public/img/hero-800.webp', 'public/img/hero-1600.webp', 'public/cv/Fizza-Aman-CV.pdf']) {
      expect(existsSync(p), p).toBe(true);
      expect(statSync(p).size).toBeGreaterThan(500);
    }
    // Check PDF binary does not contain the phone number digits
    const pdfRaw = readFileSync('public/cv/Fizza-Aman-CV.pdf', 'latin1');
    expect(pdfRaw.includes('3790925')).toBe(false);
  });

  it('Explore SPOTS cover every section with safe plain-text fields', () => {
    expect(SPOTS.length).toBe(6);
    const ids = SPOTS.map((s) => s.id);
    expect(ids).toEqual(['about', 'skills', 'projects', 'experience', 'education', 'contact']);
    for (const s of SPOTS) {
      expect(s.title.length).toBeGreaterThan(2);
      expect(s.text.length).toBeGreaterThan(20);
      expect(s.text.includes('<script')).toBe(false);
    }
  });
});
