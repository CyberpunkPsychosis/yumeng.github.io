/* 消息解析自动录入：把群里发的自然语言房源消息，拆成结构化房源。
 * 纯前端启发式解析（正则 + 关键词），正式可换成更强的 NLP 服务。
 * window.parseListings(text, regions) -> [{ community, region, rooms, area, floor, orient, price, priceText, tags[], phone, confidence, raw }]
 */
window.parseListings = (function () {
  const TAGS = ["满五唯一", "满五", "满二", "学区", "地铁口", "近地铁", "地铁", "精装修", "精装", "豪装", "毛坯",
    "江景", "河景", "花园", "洋房", "南北通透", "东西通透", "钥匙", "急售", "诚售", "独家", "稀缺", "低首付",
    "可贷款", "拎包入住", "商圈", "总价低", "性价比", "高性价比", "首付低", "婚房", "电梯房"];

  const reRooms = /(\d)\s*室\s*(\d)?\s*厅|(\d)\s*房(?:间|型)?/;
  const reArea = /(\d+(?:\.\d+)?)\s*(?:平米|平方米|平方|平|㎡|m2|m²)/i;
  const rePriceWan = /(\d+(?:\.\d+)?)\s*万/;
  const rePriceRent = /(\d+(?:\.\d+)?)\s*(?:元)?\s*(?:\/|每)\s*月|(\d{3,5})\s*(?:元|块)(?!\s*\/?㎡)/;
  const reFloor = /(低|中|高)\s*楼?层|(\d+)\s*\/\s*(\d+)\s*层|(\d+)\s*楼/;
  const reOrient = /朝\s*([东南西北]+)|(南北通透|东西通透|南北|朝南|朝北)/;
  const rePhone = /1[3-9]\d{9}/;

  function maskPhone(p) { return p ? p.slice(0, 3) + "****" + p.slice(7) : ""; }

  const SEP = "[\\s,，、。!！~～:：\\-—·|/]";
  function cleanCommunity(line, region, cutAt) {
    let s = cutAt >= 0 ? line.slice(0, cutAt) : line;
    s = s.replace(/【[^】]*】|\[[^\]]*\]|（[^）]*）|\([^)]*\)/g, " ");
    // 去掉营销词 + 独立成词的区域（区域粘在小区名里则保留，如「春申景城」前的「闵行」会被去，「静安丽舍」整体保留）
    s = s.replace(/急售|出售|诚售|主推|推荐|今日新上|今日|新上|笋盘|房源|钥匙房|业主|直签|更新|独家/g, " ");
    if (region) s = s.replace(new RegExp("(^|" + SEP + ")" + region + "(?=" + SEP + "|$)", "g"), " ");
    s = s.replace(new RegExp(SEP + "+", "g"), " ").trim();
    // 取最左边的有效片段作为小区名（群消息通常小区在前）
    const parts = s.split(" ").filter((x) => x && x.length >= 2);
    return parts[0] || (s.split(" ").filter(Boolean)[0] || "");
  }

  function parseLine(line, regions) {
    const raw = line.trim();
    if (!raw) return null;
    let earliest = raw.length;
    const note = (m) => { if (m && m.index < earliest) earliest = m.index; };

    const mRooms = raw.match(reRooms); note(mRooms);
    const mArea = raw.match(reArea); note(mArea);
    const mWan = raw.match(rePriceWan); note(mWan);
    const mRent = raw.match(rePriceRent);
    const mFloor = raw.match(reFloor);
    const mOrient = raw.match(reOrient);
    const mPhone = raw.match(rePhone);

    let priceText = "", price = 0;
    if (mWan) { priceText = mWan[1] + " 万"; price = +mWan[1]; }
    else if (mRent) { const v = mRent[1] || mRent[2]; priceText = v + " 元/月"; price = +v; }
    if (!mRooms && !mArea && !priceText) return null;          // 不像房源，跳过

    const region = regions.find((r) => raw.includes(r)) || "";
    const rooms = mRooms ? (mRooms[1] ? `${mRooms[1]}室${mRooms[2] || 1}厅` : `${mRooms[3]}室`) : "";
    const area = mArea ? +mArea[1] : 0;
    const floor = mFloor ? mFloor[0].replace(/\s+/g, "") : "";
    const orient = mOrient ? (mOrient[1] ? "朝" + mOrient[1] : mOrient[2]) : "";
    const tags = TAGS.filter((t) => raw.includes(t)).filter((t, i, a) => a.findIndex((x) => x.includes(t) || t.includes(x)) === i).slice(0, 5);
    const community = cleanCommunity(raw, region, earliest);

    let score = 0; if (priceText) score++; if (rooms) score++; if (area) score++; if (community) score++; if (region) score++;
    const confidence = score >= 4 ? "高" : score >= 2 ? "中" : "低";

    return { community, region, rooms, area, floor, orient, price, priceText, tags, phone: maskPhone(mPhone ? mPhone[0] : ""), confidence, raw };
  }

  return function parseListings(text, regions) {
    regions = regions || [];
    return String(text || "").split(/\r?\n/).map((l) => parseLine(l, regions)).filter(Boolean);
  };
})();

/* 演示用样例消息（点「填入样例」即用） */
window.SAMPLE_MSG = `【徐汇·急售】建岚公寓 2室1厅 71平 中楼层 朝南 698万 满五唯一 近地铁 钥匙在手 13800001111
静安丽舍 3室2厅 97平 高楼层 南北通透 1280万 地铁口 商圈 诚售
浦东 滨江一号 大平层 4室2厅 173平米 高区 朝南 3200万 江景 豪装 稀缺
国和苑 2房 60平 低楼层 458万 学区 总价低 13900002222
今日新上：高安花园 复式三房 129㎡ 朝南 1880万 花园洋房 独家
闵行春申景城 2室2厅 74平 中楼层 388万 满二 性价比`;
