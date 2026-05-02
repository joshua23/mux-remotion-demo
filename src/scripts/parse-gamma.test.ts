import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import { parseGammaHtml } from './parse-gamma';

const FIXTURE = path.resolve(__dirname, '../../tests/fixtures/gamma-sample.html');

describe('parseGammaHtml', () => {
  it('extracts 3 cards from fixture', async () => {
    const html = await fs.readFile(FIXTURE, 'utf-8');
    const cards = parseGammaHtml(html);
    expect(cards).toHaveLength(3);
  });

  it('extracts title from h1', async () => {
    const html = await fs.readFile(FIXTURE, 'utf-8');
    const cards = parseGammaHtml(html);
    expect(cards[0].title).toBe('看似花费，实则积累');
    expect(cards[1].title).toBe('收支结构全貌');
  });

  it('separates narration by 旁白 marker', async () => {
    const html = await fs.readFile(FIXTURE, 'utf-8');
    const cards = parseGammaHtml(html);
    expect(cards[0].narration).toContain('十六万');
    expect(cards[0].narration).not.toContain('旁白');
  });
});
