import fs from 'node:fs/promises';

export interface OutlineCard {
  index: number; title: string; body: string; narration: string;
  visualConcept?: string; rawHtml: string;
}

export function parseGammaHtml(html: string): OutlineCard[] {
  const cards: OutlineCard[] = [];
  const sectionRegex = /<section[^>]*>([\s\S]*?)<\/section>/g;
  let match; let index = 0;
  while ((match = sectionRegex.exec(html)) !== null) {
    const inner = match[1];
    const titleMatch = inner.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (!titleMatch) continue;
    const title = stripTags(titleMatch[1]).trim();
    const narrationMatch = inner.match(/<p[^>]*>(?:[^<]*<b>)?旁白[:：][^<]*<\/b>?\s*([\s\S]*?)<\/p>/);
    const narration = narrationMatch ? stripTags(narrationMatch[1]).trim() : '';
    let bodyHtml = inner
      .replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '')
      .replace(/<p[^>]*>(?:[^<]*<b>)?旁白[:：][\s\S]*?<\/p>/, '');
    const body = stripTags(bodyHtml).replace(/\s+/g, ' ').trim();
    cards.push({ index: index++, title, body, narration, rawHtml: match[0] });
  }
  return cards;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , input, output] = process.argv;
  if (!input || !output) { console.error('Usage: tsx parse-gamma.ts <html> <json>'); process.exit(1); }
  fs.readFile(input, 'utf-8').then((html) => {
    const cards = parseGammaHtml(html);
    return fs.writeFile(output, JSON.stringify(cards, null, 2), 'utf-8').then(() => cards.length);
  }).then((n) => console.log(`✓ Parsed ${n} cards`)).catch((err) => { console.error(err); process.exit(2); });
}
