import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { parseAlipayCsv, aggregate } from './preprocess';

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

describe('aggregate', () => {
  it('computes totalCount=4', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    const agg = aggregate(txs);
    expect(agg.totalCount).toBe(4);
  });

  it('computes totalExpense=40.50', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    const agg = aggregate(txs);
    expect(agg.totalExpense).toBeCloseTo(40.50, 2);
  });

  it('computes totalIncome=5000', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    const agg = aggregate(txs);
    expect(agg.totalIncome).toBeCloseTo(5000, 2);
  });

  it('computes totalNeutral=1.50', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    const agg = aggregate(txs);
    expect(agg.totalNeutral).toBeCloseTo(1.50, 2);
  });

  it('has 1 monthly entry', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    const agg = aggregate(txs);
    expect(agg.byMonth).toHaveLength(1);
    expect(agg.byMonth[0].month).toBe('2024-01');
  });

  it('detects passive income with count=1', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    const agg = aggregate(txs);
    expect(agg.passiveIncome.count).toBe(1);
    expect(agg.passiveIncome.total).toBeCloseTo(1.50, 2);
  });

  it('lists 美团 as top merchant', async () => {
    const txs = await parseAlipayCsv(FIXTURE);
    const agg = aggregate(txs);
    expect(agg.byMerchant[0].name).toBe('美团外卖');
  });
});
