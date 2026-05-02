"""15+ 维深度分析支付宝账本，为 Principles 风格故事剧本提供素材"""
import csv
from collections import defaultdict, Counter
from datetime import datetime, timedelta
import statistics

CSV = "/Users/joshuaspc/Documents/10-19 公司行政/15 财务/银行流水/支付宝财务摘要 原始数据.csv"

with open(CSV, encoding="utf-8") as f:
    rows = list(csv.DictReader(f))


def col(r, k):
    for kk in r.keys():
        if kk.strip() == k:
            return r[kk]
    return None


def amt(r):
    try:
        return float(col(r, "金额") or "0")
    except ValueError:
        return 0.0


def kind(r):
    return (col(r, "收支") or "").strip()


def parse_dt(r):
    t = col(r, "交易创建时间")
    if not t:
        return None
    try:
        return datetime.strptime(t, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        try:
            return datetime.strptime(t.split()[0], "%Y-%m-%d")
        except (ValueError, IndexError):
            return None


# 全部交易加上 dt
for r in rows:
    r["_dt"] = parse_dt(r)

txs = [r for r in rows if r["_dt"]]
print(f"=== 数据规模 ===")
print(f"总交易: {len(rows)}")
print(f"有时间戳: {len(txs)}")

expenses = [r for r in txs if kind(r) == "支出"]
incomes = [r for r in txs if kind(r) == "收入"]
neutral = [r for r in txs if kind(r) == "不计收支"]
print(f"支出/收入/不计: {len(expenses)}/{len(incomes)}/{len(neutral)}")

# === 维度 1: 日内时间分布 ===
print(f"\n=== 1. 日内时间分布（小时直方图）===")
by_hour = Counter(r["_dt"].hour for r in expenses)
for h in range(24):
    bar = "█" * (by_hour.get(h, 0) // 5)
    print(f"  {h:02d}:00  {by_hour.get(h, 0):4d} {bar}")

# === 维度 2: 周内分布 ===
print(f"\n=== 2. 周内分布 ===")
by_dow = Counter(r["_dt"].strftime("%a") for r in expenses)
weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
for d in weekdays:
    c = by_dow.get(d, 0)
    print(f"  {d}: {c:4d} 笔  ({c / len(expenses) * 100:.1f}%)")

# === 维度 3: 余额宝每日收益曲线（增长/稳定/下降?）===
print(f"\n=== 3. 余额宝月度收益变化（隐性引擎是否在加速）===")
yueb = [r for r in rows if "余额宝" in (col(r, "商品名称") or "") and "收益发放" in (col(r, "商品名称") or "")]
yueb_by_month = defaultdict(list)
for r in yueb:
    if r["_dt"]:
        m = r["_dt"].strftime("%Y-%m")
        yueb_by_month[m].append(amt(r))

for m in sorted(yueb_by_month.keys()):
    vals = yueb_by_month[m]
    total = sum(vals)
    avg = total / len(vals) if vals else 0
    print(f"  {m}: 共 {len(vals):3d} 次 / 总额 ¥{total:>8,.2f} / 日均 ¥{avg:6.2f}")

# === 维度 4: NaNa 转账的时间规律 ===
print(f"\n=== 4. NaNa 转账规律（间隔分布）===")
nana = sorted([r for r in expenses if "NaNa" in (col(r, "交易对方") or "")], key=lambda r: r["_dt"])
print(f"  共 {len(nana)} 笔，¥{sum(amt(r) for r in nana):,.2f}")
print(f"  时间跨度: {nana[0]['_dt'].date()} ~ {nana[-1]['_dt'].date()}")
gaps = []
for i in range(1, len(nana)):
    gap_days = (nana[i]["_dt"] - nana[i-1]["_dt"]).days
    gaps.append(gap_days)
if gaps:
    print(f"  转账间隔（天）: 中位 {statistics.median(gaps):.0f} / 平均 {sum(gaps)/len(gaps):.1f} / 最长 {max(gaps)}")
    same_day = sum(1 for g in gaps if g == 0)
    print(f"  同日多笔: {same_day} 次")

# === 维度 5: 12 月那几天的精确时间戳 ===
print(f"\n=== 5. 2023-12-15 至 2023-12-20 详情 ===")
window = [r for r in expenses if r["_dt"] and datetime(2023, 12, 15) <= r["_dt"] <= datetime(2023, 12, 20, 23, 59)]
window.sort(key=lambda r: r["_dt"])
for r in window:
    if amt(r) > 1000:
        print(f"  {r['_dt']:%Y-%m-%d %H:%M}  ¥{amt(r):>9,.2f}  {col(r, '交易对方')[:25]:25}  {(col(r, '商品名称') or '')[:30]}")

# === 维度 6: "其他/未分类" 45% 解剖 ===
print(f"\n=== 6. 「其他」类目里到底是什么（按金额排序前 30）===")
# 重做一次 categorize 找 "其他"
def categorize(item):
    if not item:
        return "其他"
    keywords = {
        "理财收益": ["余额宝", "基金", "理财", "收益发放"],
        "交通出行": ["火车", "高铁", "12306", "机票", "滴滴", "出租", "地铁", "公交", "ETC", "停车"],
        "餐饮外卖": ["美团", "饿了么", "外卖", "肯德基", "麦当劳", "星巴克", "瑞幸"],
        "电商购物": ["淘宝", "天猫", "京东", "拼多多"],
        "工资薪酬": ["工资", "薪资"],
        "住房居家": ["租金", "房租", "物业", "水电", "燃气"],
        "通讯网络": ["话费", "充值", "宽带", "中国移动"],
        "云服务订阅": ["阿里云", "腾讯云", "OpenAI", "GitHub"],
        "亲情转账": ["亲情卡"],
        "教育培训": ["课程", "学费"],
        "医疗健康": ["医院", "药店", "挂号"],
    }
    for cat, kws in keywords.items():
        if any(k in item for k in kws):
            return cat
    return "其他"

others = [r for r in expenses if categorize(col(r, "商品名称") or "") == "其他"]
others_by_cp = defaultdict(lambda: {"sum": 0, "count": 0, "items": Counter()})
for r in others:
    cp = (col(r, "交易对方") or "未知").strip()
    others_by_cp[cp]["sum"] += amt(r)
    others_by_cp[cp]["count"] += 1
    item = (col(r, "商品名称") or "").strip()[:30]
    others_by_cp[cp]["items"][item] += 1
print(f"  「其他」总额 ¥{sum(amt(r) for r in others):,.2f}（占 {sum(amt(r) for r in others) / sum(amt(r) for r in expenses) * 100:.1f}%）")
print(f"  Top 15 对手方:")
for cp, d in sorted(others_by_cp.items(), key=lambda x: -x[1]["sum"])[:15]:
    top_item = d["items"].most_common(1)[0][0] if d["items"] else ""
    print(f"    {cp[:30]:30}  ¥{d['sum']:>10,.2f} ({d['count']:3d}笔)  「{top_item[:20]}」")

# === 维度 7: 月度交易笔数 vs 月度金额（活跃度 vs 大额度）===
print(f"\n=== 7. 月度活跃度 vs 金额 ===")
month_count = defaultdict(int)
month_amount = defaultdict(float)
for r in expenses:
    m = r["_dt"].strftime("%Y-%m")
    month_count[m] += 1
    month_amount[m] += amt(r)
for m in sorted(month_count.keys()):
    avg = month_amount[m] / month_count[m]
    print(f"  {m}: {month_count[m]:4d} 笔 / ¥{month_amount[m]:>9,.0f} / 单笔均 ¥{avg:>7,.0f}")

# === 维度 8: 单笔金额的分布（小额很多？大额少？）===
print(f"\n=== 8. 单笔金额分布 ===")
amounts = [amt(r) for r in expenses]
buckets = [0, 10, 50, 100, 500, 1000, 5000, 10000, 100000]
for i in range(len(buckets) - 1):
    lo, hi = buckets[i], buckets[i + 1]
    n = sum(1 for a in amounts if lo <= a < hi)
    s = sum(a for a in amounts if lo <= a < hi)
    print(f"  ¥{lo:6}~¥{hi:6}: {n:5d} 笔 / 累计 ¥{s:>10,.2f} / 占比 {s/sum(amounts)*100:5.1f}%")

# === 维度 9: 余额宝 vs 主动收入比例的月度变化 ===
print(f"\n=== 9. 月度被动 vs 主动收入比 ===")
month_active = defaultdict(float)  # 主动收入
month_passive = defaultdict(float)  # 余额宝
for r in incomes:
    if r["_dt"]:
        month_active[r["_dt"].strftime("%Y-%m")] += amt(r)
for r in yueb:
    if r["_dt"]:
        month_passive[r["_dt"].strftime("%Y-%m")] += amt(r)
for m in sorted(set(month_active) | set(month_passive)):
    a = month_active.get(m, 0)
    p = month_passive.get(m, 0)
    ratio = p / (a + 0.01)
    print(f"  {m}: 主动 ¥{a:>9,.2f} / 被动 ¥{p:>8,.2f} / 被动是主动的 {ratio:>5.1f}×")

# === 维度 10: 收入来源（主动收入 ¥23k 是从哪些地方来的）===
print(f"\n=== 10. 主动收入¥23k的来源 ===")
inc_by_cp = defaultdict(lambda: {"sum": 0, "count": 0})
for r in incomes:
    cp = (col(r, "交易对方") or "").strip()
    inc_by_cp[cp]["sum"] += amt(r)
    inc_by_cp[cp]["count"] += 1
for cp, d in sorted(inc_by_cp.items(), key=lambda x: -x[1]["sum"]):
    print(f"  {cp[:35]:35}  ¥{d['sum']:>9,.2f} ({d['count']}笔)")

# === 维度 11: 上海公共交通卡，频率/总额（推测通勤强度）===
print(f"\n=== 11. 上海公交/地铁通勤模式 ===")
metro = [r for r in expenses if "上海公共交通卡" in (col(r, "交易对方") or "")]
print(f"  共 {len(metro)} 笔 / ¥{sum(amt(r) for r in metro):,.2f}")
if metro:
    metro_dates = sorted(set(r["_dt"].date() for r in metro))
    print(f"  使用过 {len(metro_dates)} 个不同的日期，平均日均 ¥{sum(amt(r) for r in metro) / len(metro_dates):.2f}")

# === 维度 12: 电力/燃气月度账单（生活成本基线）===
print(f"\n=== 12. 公用事业月账（电+网） ===")
utils = [r for r in expenses if any(k in (col(r, "交易对方") or "") for k in ["国网", "电力", "中国移动", "联通", "电信"])]
util_by_month = defaultdict(float)
for r in utils:
    util_by_month[r["_dt"].strftime("%Y-%m")] += amt(r)
for m in sorted(util_by_month.keys()):
    print(f"  {m}: ¥{util_by_month[m]:.2f}")

# === 维度 13: 一年里最长的"消费空白期" ===
print(f"\n=== 13. 消费空白期（连续无支出天数）===")
exp_dates = sorted(set(r["_dt"].date() for r in expenses))
gaps = []
for i in range(1, len(exp_dates)):
    g = (exp_dates[i] - exp_dates[i - 1]).days
    if g > 1:
        gaps.append((exp_dates[i - 1], exp_dates[i], g))
gaps.sort(key=lambda x: -x[2])
for d1, d2, g in gaps[:8]:
    print(f"  {d1} → {d2}（{g} 天空窗）")

# === 维度 14: 节假日支出（春节/十一）===
print(f"\n=== 14. 节假日支出（2024 春节、2023 十一）===")
festivals = {
    "2024 春节 (2-10~2-17)": (datetime(2024, 2, 10), datetime(2024, 2, 17, 23, 59)),
    "2023 十一 (10-1~10-7)": (datetime(2023, 10, 1), datetime(2023, 10, 7, 23, 59)),
    "2023 双十一 (11-11)": (datetime(2023, 11, 11), datetime(2023, 11, 11, 23, 59)),
    "2023 双十二 (12-12)": (datetime(2023, 12, 12), datetime(2023, 12, 12, 23, 59)),
}
for name, (start, end) in festivals.items():
    fest = [r for r in expenses if start <= r["_dt"] <= end]
    total = sum(amt(r) for r in fest)
    days = (end - start).days + 1
    print(f"  {name}: {len(fest)} 笔 / ¥{total:,.2f} / 日均 ¥{total/days:.2f}")

# === 维度 15: NaNa & 燕燕 转账时间是否同步 ===
print(f"\n=== 15. NaNa 与 燕燕 转账时间相关性 ===")
nana_dates = set(r["_dt"].date() for r in expenses if "NaNa" in (col(r, "交易对方") or ""))
yan_dates = set(r["_dt"].date() for r in expenses if "燕燕" in (col(r, "交易对方") or ""))
overlap = nana_dates & yan_dates
print(f"  NaNa 出现日: {len(nana_dates)}")
print(f"  燕燕 出现日: {len(yan_dates)}")
print(f"  同日两者都出现: {len(overlap)} 天")
if overlap:
    print(f"  同日详情:")
    for d in sorted(overlap):
        nana_sum = sum(amt(r) for r in expenses if "NaNa" in (col(r, "交易对方") or "") and r["_dt"].date() == d)
        yan_sum = sum(amt(r) for r in expenses if "燕燕" in (col(r, "交易对方") or "") and r["_dt"].date() == d)
        print(f"    {d}: NaNa ¥{nana_sum:>8,.0f}  燕燕 ¥{yan_sum:>8,.0f}")

# === 维度 16: 行为拐点（前 6 个月 vs 后 6 个月）===
print(f"\n=== 16. 行为拐点：前后半年对比 ===")
mid = datetime(2024, 3, 1)
first_half = [r for r in expenses if r["_dt"] < mid]
second_half = [r for r in expenses if r["_dt"] >= mid]
print(f"  前半年 (2023-09 至 2024-02): {len(first_half)} 笔 / ¥{sum(amt(r) for r in first_half):,.2f}")
print(f"  后半年 (2024-03 至 2024-08): {len(second_half)} 笔 / ¥{sum(amt(r) for r in second_half):,.2f}")
print(f"  支出降幅: {(sum(amt(r) for r in first_half) - sum(amt(r) for r in second_half)) / sum(amt(r) for r in first_half) * 100:.1f}%")

# === 维度 17: 余额宝累计本金推算 ===
print(f"\n=== 17. 余额宝有效本金推算 ===")
total_yueb = sum(amt(r) for r in yueb)
days = (max(r["_dt"] for r in yueb) - min(r["_dt"] for r in yueb)).days
annualized_yield = 0.022  # 假设余额宝年化 2.2%
implied_principal = total_yueb / annualized_yield
print(f"  总收益: ¥{total_yueb:,.2f}")
print(f"  时间跨度: {days} 天")
print(f"  按 2.2% 年化反推本金: ¥{implied_principal:,.0f}")
print(f"  按 1.8% 年化反推本金: ¥{total_yueb / 0.018:,.0f}")
print(f"  按 2.5% 年化反推本金: ¥{total_yueb / 0.025:,.0f}")
