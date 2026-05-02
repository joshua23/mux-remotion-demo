import { describe, it, expect } from 'vitest';
import { ttsCard } from './tts';
import type { OutlineCard } from './parse-gamma';

describe('ttsCard', () => {
  it('throws when MINIMAX_API_KEY is missing', async () => {
    const savedApiKey = process.env.MINIMAX_API_KEY;
    const savedGroupId = process.env.MINIMAX_GROUP_ID;
    delete process.env.MINIMAX_API_KEY;
    delete process.env.MINIMAX_GROUP_ID;

    const card: OutlineCard = {
      index: 0, title: '测试', body: '', narration: '测试旁白', rawHtml: '',
    };

    await expect(ttsCard(card, '/tmp/tts-test')).rejects.toThrow('MINIMAX_API_KEY');

    process.env.MINIMAX_API_KEY = savedApiKey;
    process.env.MINIMAX_GROUP_ID = savedGroupId;
  });
});
