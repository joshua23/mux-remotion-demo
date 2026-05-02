import fs from 'node:fs/promises';
import Papa from 'papaparse';
import type { AlipayTransaction, AggregatedFinance, Direction } from '../dalio/types';

const CATEGORY_RULES: Array<[RegExp, string]> = [
  [/余额宝|理财|基金|收益|利息/, '理财收益'],
  [/滴滴|高铁|12306|地铁|公交|打车|出行|机票|火车/, '交通出行'],
  [/外卖|美团|饿了么|餐饮|饭店|食堂|早餐|午餐|晚餐/, '餐饮外卖'],
  [/淘宝|天猫|京东|拼多多|购物|商城|超市|便利店|商店/, '电商购物'],
  [/工资|薪酬|薪资|奖金|绩效/, '工资薪酬'],
  [/房租|水电|物业|燃气|宽带|房贷/, '住房居家'],
  [/话费|流量|电话|通讯|联通|移动|电信/, '通讯网络'],
  [/云服务|阿里云|腾讯云|订阅|会员|VIP/, '云服务订阅'],
  [/转账|红包|家人|父母|爸|妈|兄|弟|姐|妹/, '亲情转账'],
  [/教育|培训|学费|课程|书籍|考试/, '教育培训'],
  [/医院|药店|医疗|健康|保险/, '医疗健康'],
];

function categorize(itemName: string): string {
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(itemName)) return cat;
  }
  return '其他';
}

export function aggregate(txs: AlipayTransaction[]): AggregatedFinance {
  let totalExpense = 0, totalIncome = 0, totalNeutral = 0;
  const monthlyMap: Map<string, { expense: number; income: number }> = new Map();
  const categoryMap: Map<string, { amount: number; count: number }> = new Map();
  const merchantMap: Map<string, { amount: number; count: number }> = new Map();
  const passiveTxs: AlipayTransaction[] = [];
  const singleExpenses: AlipayTransaction[] = [];

  let rangeStart = '';
  let rangeEnd = '';

  for (const tx of txs) {
    const dateStr = tx.createdAt.slice(0, 10);
    if (!rangeStart || dateStr < rangeStart) rangeStart = dateStr;
    if (!rangeEnd || dateStr > rangeEnd) rangeEnd = dateStr;
    const month = tx.createdAt.slice(0, 7);

    if (tx.direction === '支出') {
      totalExpense += tx.amount;
      singleExpenses.push(tx);
      const m = monthlyMap.get(month) ?? { expense: 0, income: 0 };
      m.expense += tx.amount;
      monthlyMap.set(month, m);
      const cat = categorize(tx.itemName);
      const c = categoryMap.get(cat) ?? { amount: 0, count: 0 };
      c.amount += tx.amount; c.count++;
      categoryMap.set(cat, c);
      const merch = merchantMap.get(tx.counterparty) ?? { amount: 0, count: 0 };
      merch.amount += tx.amount; merch.count++;
      merchantMap.set(tx.counterparty, merch);
    } else if (tx.direction === '收入') {
      totalIncome += tx.amount;
      const m = monthlyMap.get(month) ?? { expense: 0, income: 0 };
      m.income += tx.amount;
      monthlyMap.set(month, m);
    } else {
      totalNeutral += tx.amount;
      // Passive income: 不计收支 from 余额宝/理财
      if (/余额宝|理财|基金|收益|利息/.test(tx.itemName)) {
        passiveTxs.push(tx);
      }
    }
  }

  const byMonth = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, expense: v.expense, income: v.income }));

  const catTotal = Array.from(categoryMap.values()).reduce((s, v) => s + v.amount, 0) || 1;
  const byCategory = Array.from(categoryMap.entries())
    .sort(([, a], [, b]) => b.amount - a.amount)
    .map(([category, v]) => ({ category, amount: v.amount, count: v.count, pct: v.amount / catTotal }));

  const byMerchant = Array.from(merchantMap.entries())
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 20)
    .map(([name, v]) => ({ name, amount: v.amount, count: v.count }));

  const topSingleExpenses = singleExpenses
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((tx) => ({ date: tx.createdAt.slice(0, 10), amount: tx.amount, counterparty: tx.counterparty, item: tx.itemName }));

  const passiveTotal = passiveTxs.reduce((s, t) => s + t.amount, 0);
  const dayCount = rangeStart && rangeEnd
    ? Math.max(1, Math.ceil((new Date(rangeEnd).getTime() - new Date(rangeStart).getTime()) / 86400000) + 1)
    : 1;

  // Anomaly: months where expense > 2× median expense
  const expenses = byMonth.map((m) => m.expense).sort((a, b) => a - b);
  const median = expenses.length > 0 ? expenses[Math.floor(expenses.length / 2)] : 0;
  const anomalies = byMonth
    .filter((m) => m.expense > 2 * median && median > 0)
    .map((m) => ({ month: m.month, amount: m.expense, reason: '月支出超过中位数两倍' }));

  return {
    rangeStart, rangeEnd, totalCount: txs.length,
    totalExpense: Math.round(totalExpense * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalNeutral: Math.round(totalNeutral * 100) / 100,
    netOutflow: Math.round((totalExpense - totalIncome) * 100) / 100,
    byMonth, byCategory, byMerchant, topSingleExpenses,
    passiveIncome: { count: passiveTxs.length, total: Math.round(passiveTotal * 100) / 100, dailyAvg: Math.round((passiveTotal / dayCount) * 100) / 100 },
    anomalies,
  };
}

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

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , input, output] = process.argv;
  if (!input || !output) { console.error('Usage: tsx preprocess.ts <in.csv> <out.json>'); process.exit(1); }
  parseAlipayCsv(input).then(aggregate).then(async (agg) => {
    const fsw = await import('node:fs/promises');
    await fsw.writeFile(output, JSON.stringify(agg, null, 2), 'utf-8');
    console.log(`✓ Wrote ${output} — ${agg.totalCount} txs, ¥${agg.totalExpense.toFixed(2)} expense, ¥${agg.passiveIncome.total.toFixed(2)} passive`);
  }).catch((err) => { console.error(err); process.exit(2); });
}
