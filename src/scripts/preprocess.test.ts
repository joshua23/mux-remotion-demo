import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { parseAlipayCsv } from './preprocess';

const FIXTURE = path.resolve(__dirname, '../../tests/fixtures/alipay-sample.csv');

describe('parseAlipayCsv', () => {
  it('parses 4 rows', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    expect(txs).toHaveLength(4);
  });

  it('parses amount as number', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    expect(txs[0].amount).toBe(25.50);
  });

  it('parses direction as enum', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    expect(txs[0].direction).toBe('支出');
    expect(txs[1].direction).toBe('不计收支');
    expect(txs[2].direction).toBe('收入');
  });

  it('maps empty paidAt to null', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    expect(txs[1].paidAt).toBeNull();
  });
});
