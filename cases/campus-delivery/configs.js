/* 校园宿舍即时零售平台 · 演示数据与规则
 * 三端共用：用户端 / 骑手端 / 管理后台。规则数值按需求精确实现。
 */
window.CD = {
  brand: "宿舍闪购",
  // 四级地址锁定
  campus: ["东校区", "西校区"],
  buildings: { "东校区": ["1栋", "2栋", "3栋", "5栋"], "西校区": ["7栋", "8栋", "9栋"] },
  floors: ["1层", "2层", "3层", "4层", "5层", "6层"],

  // 商品
  products: [
    { id: "p1", name: "可乐 330ml", price: 3.0, cost: 1.8, cat: "饮料", stock: 42, color: "#e23744" },
    { id: "p2", name: "矿泉水 550ml", price: 2.0, cost: 0.8, cat: "饮料", stock: 88, color: "#3aa6ff" },
    { id: "p3", name: "薯片 原味", price: 5.5, cost: 3.2, cat: "零食", stock: 30, color: "#f5a623" },
    { id: "p4", name: "泡面 红烧牛肉", price: 4.5, cost: 2.6, cat: "速食", stock: 25, color: "#d8542b" },
    { id: "p5", name: "巧克力派", price: 6.0, cost: 3.4, cat: "零食", stock: 18, color: "#7a4b2b" },
    { id: "p6", name: "酸奶", price: 4.0, cost: 2.4, cat: "乳品", stock: 14, color: "#9bd0a0" },
    { id: "p7", name: "纸巾 抽纸", price: 3.5, cost: 1.9, cat: "日用", stock: 50, color: "#9aa6b2" },
    { id: "p8", name: "火腿肠", price: 2.5, cost: 1.3, cat: "速食", stock: 60, color: "#e88aa0" },
  ],
  // 换购品（商城隐藏，仅满额解锁；退款按原价扣差额）
  exchangeItems: [
    { id: "x1", tier: 1, name: "饮料 1 瓶（换购）", addPrice: 1.99, cost: 0.6, orig: 3.0 },
    { id: "x2", tier: 2, name: "饮料 2 瓶（换购）", addPrice: 2.99, cost: 1.2, orig: 6.0 },
  ],
  // 利润引擎规则
  rule: {
    couponTrigger: 3.5,           // 凑单宝触发门槛
    deliveryBase: 2.0,            // 基础配送费
    tiers: [
      { min: 4.5, exId: "x1", label: "满 4.5 元 · 加 1.99 换购饮料免配送费" },
      { min: 8.0, exId: "x2", label: "满 8 元 · 加 2.99 换购两瓶免配送费" },
    ],
  },

  // 骑手运力
  rider: {
    me: { name: "骑手 · 小杨", weeksOnSchedule: 2, gpsOnline: true },
    commission: { byFloor: { 1: 0.7, 2: 0.7, 3: 0.8, 4: 0.8, 5: 0.9, 6: 0.9 }, overweightKg: 5, overweightAdd: 0.5, loyaltyStep: 0.1, loyaltyCap: 0.5 },
    weekIncome: 186.4, weekOrders: 142,
    slots: ["07-09", "11-13", "13-17", "17-20", "20-22"],
    days: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    orders: [
      { id: "D2418", building: "3栋", floor: 5, room: "508", items: "可乐×2 薯片×1", weight: 1.2, dist: "0.4km" },
      { id: "D2419", building: "1栋", floor: 2, room: "203", items: "泡面×3 火腿肠×2", weight: 5.6, dist: "0.6km" },
      { id: "D2420", building: "5栋", floor: 6, room: "611", items: "纸巾×2 矿泉水×6", weight: 4.0, dist: "0.3km" },
    ],
  },

  // 管理后台
  warehouses: ["全部总览", "东校区·1栋", "东校区·3栋", "西校区·7栋"],
  report: {
    date: "06-29",
    hot: [{ name: "可乐 330ml", qty: 128, gm: 40 }, { name: "泡面 红烧牛肉", qty: 96, gm: 42 }, { name: "矿泉水 550ml", qty: 90, gm: 60 }],
    cold: [{ name: "酸奶", qty: 3, days: 5 }, { name: "巧克力派", qty: 5, days: 4 }],
    restock: [{ name: "可乐 330ml", stock: 12, suggest: 60 }, { name: "泡面 红烧牛肉", stock: 8, suggest: 50 }, { name: "纸巾 抽纸", stock: 9, suggest: 40 }],
    grossAlert: [{ name: "薯片 原味", gm: 18, note: "毛利率偏低，建议复核进价或调价" }],
  },
  battlefield: [
    { building: "1栋", revenue: 1280, orders: 96, avg: 13.3, status: "热", advice: "推换购拉高客单" },
    { building: "3栋", revenue: 860, orders: 72, avg: 11.9, status: "稳", advice: "推拼单满减" },
    { building: "5栋", revenue: 420, orders: 38, avg: 11.1, status: "温", advice: "推券唤醒" },
    { building: "7栋", revenue: 180, orders: 16, avg: 11.3, status: "冷", advice: "未触达派券 + 地推" },
  ],
  untouched: [
    { room: "2栋-410", days: 9 }, { room: "5栋-507", days: 8 }, { room: "1栋-118", days: 7 },
    { room: "7栋-302", days: 12 }, { room: "8栋-205", days: 7 },
  ],
};
