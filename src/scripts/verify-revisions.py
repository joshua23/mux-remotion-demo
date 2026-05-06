"""验证关键数据修正"""
import csv
from collections import defaultdict
from datetime import datetime

CSV = "/Users/joshuaspc/Documents/10-19 公司行政/15 财务/银行流水/支付宝财务摘要 原始数据.csv"
with open(CSV, encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

def col(r, k):
    for kk in r.keys():
        if kk.strip() == k:
            return r[kk]
    return None
def amt(r):
    try: return float(col(r, "金额") or "0")
    except: return 0.0
def kind(r):
    return (col(r, "收支") or "").strip()

# === 1. "不计收支" 205,333 到底是什么构成 ===
print("=== 「不计收支」¥205,333 构成 ===")
neutral = [r for r in rows if kind(r) == "不计收支"]
total = sum(amt(r) for r in neutral)
print(f"  总额 ¥{total:,.2f} / {len(neutral)} 笔")

# 按商品名前缀聚合
from collections import Counter
by_item_prefix = defaultdict(lambda: {"sum": 0, "n": 0})
for r in neutral:
    item = (col(r, "商品名称") or "").strip()
    # 取前 12 字符作为分类键
    if "余额宝" in item:
        key = "余额宝-收益发放" if "收益发放" in item else "余额宝-其他"
    elif "退款" in item:
        key = "退款"
    elif "还款" in item:
        key = "还款"
    else:
        key = item[:20] if item else "未知"
    by_item_prefix[key]["sum"] += amt(r)
    by_item_prefix[key]["n"] += 1

for k, d in sorted(by_item_prefix.items(), key=lambda x: -x[1]["sum"])[:20]:
    print(f"  {k[:35]:35}  ¥{d['sum']:>10,.2f}  ({d['n']}笔)")

# === 2. ¥20k from 燕燕(7万) 是什么时候 ===
print("\n=== ¥20k from 燕燕(7万) 详情 ===")
yan_in = [r for r in rows if kind(r) == "收入" and "燕燕" in (col(r, "交易对方") or "")]
for r in yan_in:
    print(f"  {col(r, '交易创建时间')}  ¥{amt(r):,.2f}  对方:{col(r, '交易对方')}  备注:{col(r, '商品名称')}")

# === 3. 行为拐点精确日期 ===
print("\n=== 月度支出拐点（精确）===")
expenses = [r for r in rows if kind(r) == "支出"]
month_total = defaultdict(float)
for r in expenses:
    t = col(r, "交易创建时间")
    if t:
        try:
            m = datetime.strptime(t.split()[0], "%Y-%m-%d").strftime("%Y-%m")
            month_total[m] += amt(r)
        except: pass
prev = None
for m in sorted(month_total.keys()):
    delta = ""
    if prev:
        d = month_total[m] - prev
        pct = d / prev * 100 if prev else 0
        delta = f"  Δ {d:+,.0f} ({pct:+.0f}%)"
    print(f"  {m}: ¥{month_total[m]:>9,.0f}{delta}")
    prev = month_total[m]

# === 4. NaNa 真的是亲情卡日常吗 ===
print("\n=== NaNa 转账模式（验证：是日常生活费还是大额转账？）===")
nana = [r for r in rows if kind(r) == "支出" and "NaNa" in (col(r, "交易对方") or "")]
amounts = sorted([amt(r) for r in nana])
import statistics
print(f"  共 {len(nana)} 笔，¥{sum(amounts):,.2f}")
print(f"  中位单笔: ¥{statistics.median(amounts):.2f}")
print(f"  平均单笔: ¥{statistics.mean(amounts):.2f}")
print(f"  ¥100 以下: {sum(1 for a in amounts if a < 100)} 笔 / 累计 ¥{sum(a for a in amounts if a < 100):,.2f}")
print(f"  ¥100-1000: {sum(1 for a in amounts if 100 <= a < 1000)} 笔 / 累计 ¥{sum(a for a in amounts if 100 <= a < 1000):,.2f}")
print(f"  ¥1000+: {sum(1 for a in amounts if a >= 1000)} 笔 / 累计 ¥{sum(a for a in amounts if a >= 1000):,.2f}")

# 看商品名
items = Counter()
for r in nana:
    items[(col(r, "商品名称") or "").strip()] += 1
print("  Top 10 商品名:")
for it, c in items.most_common(10):
    print(f"    [{c:3d}]  「{it}」")
