import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PHONE = /(\+92|0092|\b0)3\d{2}[\s-]?\d{7}\b/;

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe('privacy: no phone numbers in public content', () => {
  for (const dir of ['content', 'src']) {
    it(`${dir}/ has no phone numbers`, () => {
      let files = [];
      try { files = walk(dir).filter((f) => /\.(md|js|html|css|json)$/.test(f)); } catch { /* dir may not exist yet */ }
      for (const f of files) expect(PHONE.test(readFileSync(f, 'utf8')), f).toBe(false);
    });
  }
});
