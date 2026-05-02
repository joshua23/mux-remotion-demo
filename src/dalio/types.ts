export type Direction = '支出' | '收入' | '不计收支';

export interface AlipayTransaction {
  txId: string; merchantOrderId: string; createdAt: string;
  paidAt: string | null; modifiedAt: string; source: string; txType: string;
  counterparty: string; itemName: string; amount: number; direction: Direction;
  status: string; serviceFee: number; refunded: number; note: string; fundStatus: string;
}

export interface AggregatedFinance {
  rangeStart: string; rangeEnd: string; totalCount: number;
  totalExpense: number; totalIncome: number; totalNeutral: number; netOutflow: number;
  byMonth: Array<{ month: string; expense: number; income: number }>;
  byCategory: Array<{ category: string; amount: number; count: number; pct: number }>;
  byMerchant: Array<{ name: string; amount: number; count: number }>;
  topSingleExpenses: Array<{ date: string; amount: number; counterparty: string; item: string }>;
  passiveIncome: { count: number; total: number; dailyAvg: number };
  anomalies: Array<{ month: string; amount: number; reason: string }>;
}
