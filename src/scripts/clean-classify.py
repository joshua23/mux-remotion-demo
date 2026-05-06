"""第二轮规则细化：把 Top 30 审核项目归类"""
import re
import csv, json
from collections import defaultdict, Counter
from datetime import datetime

CSV = "/Users/joshuaspc/Documents/10-19 公司行政/15 财务/银行流水/支付宝财务摘要 原始数据.csv"
OUT_JSON = "/Users/joshuaspc/Documents/20-29 产品研发/29 故事村/MG动画/mux-remotion-demo/out/alipay-2024-classified.json"
OUT_MD = "/Users/joshuaspc/Documents/20-29 产品研发/29 故事村/MG动画/mux-remotion-demo/out/alipay-2024-classified.md"

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


PEOPLE_NETWORK = {
    "NaNa(张娜)": {"role": "妻子", "alias": "NaNa", "name": "张娜"},
    "燕燕（9万)(张春彦)": {"role": "妹妹", "alias": "燕燕", "name": "张春彦", "note": "9万账号"},
    "燕燕（7万)": {"role": "妹妹", "alias": "燕燕", "name": "张春彦", "note": "7万账号"},
    "龙(张龙)": {"role": "小舅子", "alias": "龙", "name": "张龙"},
    "国法(张国法)": {"role": "亲属", "alias": "国法", "name": "张国法"},
    "皆柏贸易（杭州）有限公司上海第七分公司": {"role": "业务伙伴", "alias": "皆柏贸易", "name": "皆柏贸易"},
    "伟峰(**峰)": {"role": "朋友", "alias": "伟峰", "name": "**峰"},
    "张啸": {"role": "亲属/朋友", "alias": "张啸", "name": "张啸"},
}

def lookup_person(cp):
    return PEOPLE_NETWORK.get(cp.strip())


def classify(r):
    cp = (col(r, "交易对方") or "").strip()
    item = (col(r, "商品名称") or "").strip()
    direction = kind(r)
    a = amt(r)

    # === 不计收支细分 ===
    if direction == "不计收支":
        if "余额宝" in item:
            return ("理财", "余额宝收益" if "收益发放" in item else "余额宝本金搬运", False)
        if "退款" in item: return ("退款回收", "购物退款", False)
        if "还款" in item: return ("还款回收", "信用卡/借款", False)
        return ("理财", "其他", True)

    # === 收入 ===
    if direction == "收入":
        if "燕燕" in cp: return ("家庭流转", "亲属退款", False)
        if "NaNa" in cp: return ("家庭流转", "妻子退款", False)
        if "中体彩" in cp: return ("琐碎进账", "彩票", False)
        if "支付宝" in cp and "红包" in item: return ("琐碎进账", "支付宝红包", False)
        if "淘宝" in cp: return ("退款回收", "电商退款", False)
        return ("琐碎进账", "其他小额", False)

    # === 支出 ===
    person = lookup_person(cp)
    if person:
        if person["role"] == "妻子":
            if a < 100: return ("家庭日常-亲情卡", f"NaNa 亲情卡", False)
            elif a >= 1000: return ("家庭大额转账", f"妻子 NaNa", False)
            else: return ("家庭小额转账", f"妻子 NaNa", False)
        elif person["role"] in ("妹妹", "小舅子", "亲属"):
            return ("家庭大额转账", f"{person['role']} {person['alias']}", False)
        elif person["role"] == "业务伙伴":
            return ("业务付款", person["alias"], False)
        elif person["role"] == "朋友":
            return ("朋友间", person["alias"], False)

    # === 公用事业 ===
    if "国网" in cp or "电力" in cp: return ("公用事业", "电费", False)
    if "自来水" in cp: return ("公用事业", "水费", False)
    if "燃气" in cp: return ("公用事业", "燃气费", False)
    if any(k in cp for k in ["中国移动", "上海移动", "中国联通", "上海联通", "中国电信", "上海电信"]):
        return ("通讯", "话费/宽带", False)
    if "物业" in cp or "物业" in item: return ("住房", "物业费", False)

    # === 保险（更严格）===
    if any(k in cp for k in ["人保", "保险股份", "保险公司", "平安保险", "太平洋保险", "新华保险"]):
        return ("保险", cp[:8].replace("中国人民", ""), False)

    # === 交通（增强）===
    if "上海公共交通卡" in cp or "公交" in item: return ("交通", "地铁公交", False)
    if "12306" in cp or "铁路" in cp: return ("交通", "火车票", False)
    if any(k in cp for k in ["中国石油", "中石油", "中国石化", "中石化"]):
        return ("交通", "加油", False)
    if any(k in cp for k in ["滴滴", "出租", "首汽", "神州"]): return ("交通", "网约车", False)
    if "停车" in item or "停车" in cp: return ("交通", "停车", False)
    if any(k in cp for k in ["东方航空", "中国国航", "南方航空", "去哪儿", "携程"]): return ("交通", "机票", False)
    # 交通罚没
    if "上海公共支付一网通办" in cp and ("罚" in item or "罚没" in item):
        return ("交通", "罚款", False)

    # === 餐饮（增强）===
    if any(k in cp for k in ["美团", "饿了么"]): return ("餐饮", "外卖平台", False)
    if any(k in cp for k in ["肯德基", "麦当劳", "星巴克", "瑞幸", "喜茶", "海底捞"]): return ("餐饮", "连锁餐饮", False)
    if any(k in cp + item for k in ["家常菜", "餐厅", "饭店", "小吃", "面馆", "火锅", "串串", "烧烤", "烤肉", "Hi香野", "老地方"]):
        return ("餐饮", "餐厅", False)

    # === 孩子相关（新增）===
    if any(k in cp + item for k in ["巴拉巴拉", "贝因美", "babycare"]):
        return ("子女", "童装/婴幼用品", False)
    if "上海儿童医学中心" in cp:
        return ("子女", "儿童医院", False)

    # === 服饰（增强）===
    if any(k in cp.lower() + item.lower() for k in ["y-3", "y3", "adidas", "nike", "uniqlo", "优衣库"]):
        return ("服饰", "品牌服装", False)
    # 闵三商业 = 服装店
    if "上海闵三商业" in cp:
        return ("服饰", "服装", False)
    # "工装裤""女上衣""衬衫""外套" 等关键词
    if any(k in item for k in ["工装裤", "外套", "T恤", "衬衫", "卫衣", "羽绒服", "牛仔", "连衣裙", "女上衣", "毛衣"]):
        return ("服饰", "服装", False)

    # === 电商购物（增强）===
    if any(k in cp for k in ["淘宝", "天猫", "京东", "拼多多", "苏宁", "亚马逊"]):
        return ("电商购物", "综合电商", False)
    if "店" in cp[-2:] or re.match(r"^[a-zA-Z0-9]+\*+", cp):
        return ("电商购物", "线上店铺", False)

    # === 医疗 ===
    if any(k in cp for k in ["医院", "药店", "挂号", "随申"]):
        return ("医疗健康", cp[:8], False)

    # === 订阅服务 ===
    if any(k in cp for k in ["阿里云", "腾讯云", "OpenAI", "GitHub", "ChatGPT", "Apple", "App Store", "百度网盘", "STRIPE"]):
        return ("订阅服务", cp[:8], False)
    # 巴拉巴拉购物金 → 子女
    if "购物金" in cp and a > 500:
        return ("子女", "购物金充值", False)

    # === 资金流转 ===
    if "微信换" in item: return ("资金流转", "微信换", False)
    if "充值" in item and "石化" in cp: return ("交通", "加油充值", False)

    # === 收钱码收款 → 个人/小餐馆 ===
    if "收钱码收款" in item:
        # 大额可能是朋友间、小额是路边摊
        if a >= 200: return ("朋友间", f"收钱码-{cp[:6]}", True)
        else: return ("餐饮", f"路边摊-{cp[:6]}", False)

    # === 便利店启发式 ===
    if a < 50 and (cp.endswith("店") or "**" in cp):
        return ("便利店零食", cp[:8], False)

    # === 兜底 ===
    if "转账" in item or len(cp) <= 4:
        return ("个人转账", "未识别对手方", True)
    if a >= 500:
        return ("待人工审核", cp[:15], True)
    return ("零散小额", cp[:10], True)


classified = []
for r in rows:
    main_cat, sub_cat, needs_review = classify(r)
    classified.append({
        "tx_id": col(r, "交易号"),
        "datetime": col(r, "交易创建时间"),
        "counterparty": col(r, "交易对方"),
        "item": col(r, "商品名称"),
        "amount": amt(r),
        "direction": kind(r),
        "main_category": main_cat,
        "sub_category": sub_cat,
        "needs_review": needs_review,
        "person_role": lookup_person(col(r, "交易对方") or "")["role"] if lookup_person(col(r, "交易对方") or "") else None,
    })

with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(classified, f, ensure_ascii=False, indent=2)

needs_review = [c for c in classified if c["needs_review"]]
print(f"=== 第二轮 ===")
print(f"总交易: {len(classified)}")
print(f"待审核: {len(needs_review)} ({len(needs_review)/len(classified)*100:.1f}%)")

by_main = defaultdict(lambda: {"sum": 0, "count": 0, "subs": defaultdict(lambda: {"sum": 0, "count": 0})})
for c in classified:
    if c["direction"] == "支出":
        by_main[c["main_category"]]["sum"] += c["amount"]
        by_main[c["main_category"]]["count"] += 1
        by_main[c["main_category"]]["subs"][c["sub_category"]]["sum"] += c["amount"]
        by_main[c["main_category"]]["subs"][c["sub_category"]]["count"] += 1

total_exp = sum(d["sum"] for d in by_main.values())
print(f"\n=== 支出按主类（第二轮）===")
for main, d in sorted(by_main.items(), key=lambda x: -x[1]["sum"]):
    pct = d["sum"] / total_exp * 100
    print(f"  ▸ {main:20s}  ¥{d['sum']:>10,.2f}  ({pct:5.1f}%)  {d['count']:4d}笔")

# 写汇总 markdown
with open(OUT_MD, "w", encoding="utf-8") as f:
    f.write("# 支付宝财务清理后分类汇总（第二轮）\n\n")
    f.write(f"**总交易**: {len(classified)} / **需审核**: {len(needs_review)} ({len(needs_review)/len(classified)*100:.1f}%)\n\n")
    f.write(f"**支出总额**: ¥{total_exp:,.2f}\n\n")
    f.write("## 按主类目分布\n\n")
    f.write("| 主类 | 金额 | 占比 | 笔数 |\n|---|---|---|---|\n")
    for main, d in sorted(by_main.items(), key=lambda x: -x[1]["sum"]):
        pct = d["sum"] / total_exp * 100
        f.write(f"| {main} | ¥{d['sum']:,.2f} | {pct:.1f}% | {d['count']} |\n")
    f.write("\n## 子类目细节\n\n")
    for main, d in sorted(by_main.items(), key=lambda x: -x[1]["sum"]):
        f.write(f"### {main}（¥{d['sum']:,.2f} / {d['sum']/total_exp*100:.1f}%）\n")
        f.write("| 子类 | 金额 | 笔数 |\n|---|---|---|\n")
        for sub, sd in sorted(d["subs"].items(), key=lambda x: -x[1]["sum"]):
            f.write(f"| {sub} | ¥{sd['sum']:,.2f} | {sd['count']} |\n")
        f.write("\n")
    review = sorted(needs_review, key=lambda x: -x["amount"])[:30]
    f.write("## 待人工审核 Top 30\n\n")
    f.write("| 金额 | 对手方 | 项目 |\n|---|---|---|\n")
    for c in review:
        cp = (c["counterparty"] or "").replace("|", "/")
        it = (c["item"] or "").replace("|", "/")
        f.write(f"| ¥{c['amount']:,.2f} | {cp[:25]} | {it[:40]} |\n")
