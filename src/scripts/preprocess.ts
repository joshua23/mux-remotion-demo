import fs from 'node:fs/promises';
import Papa from 'papaparse';
import type { AlipayTransaction, Direction } from '../dalio/types';

export async function parseAlipayCsv(filePath: string): Promise<AlipayTransaction[]> {
  let raw = await fs.readFile(filePath, 'utf-8');
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const result = Papa.parse(raw, {
    header: true, skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });
  return result.data.map((row: Record<string, string>): AlipayTransaction => ({
    txId: row['交易号']?.trim() ?? '',
    merchantOrderId: row['商家订单号']?.trim() ?? '',
    createdAt: row['交易创建时间']?.trim() ?? '',
    paidAt: row['交易付款时间']?.trim() || null,
    modifiedAt: row['最近修改时间']?.trim() ?? '',
    source: row['交易来源地']?.trim() ?? '',
    txType: row['交易类型']?.trim() ?? '',
    counterparty: row['交易对方']?.trim() ?? '',
    itemName: row['商品名称']?.trim() ?? '',
    amount: Number(row['金额']) || 0,
    direction: (row['收支']?.trim() as Direction) ?? '不计收支',
    status: row['交易状态']?.trim() ?? '',
    serviceFee: Number(row['服务费']) || 0,
    refunded: Number(row['成功退款']) || 0,
    note: row['备注']?.trim() ?? '',
    fundStatus: row['资金状态']?.trim() ?? '',
  }));
}
