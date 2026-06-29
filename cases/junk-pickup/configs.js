/* 代扔垃圾 / 上门清运小程序 · 演示数据与规则
 * 配置驱动：换品牌、换品类、换价格 = 改这份配置，逻辑不动。
 * 两套场景示例：trash(生活垃圾代扔) / clean(大件家具清运)。
 */
window.JUNK_CONFIGS = {
  /* ===== 场景一：生活垃圾代扔（五享扔式） ===== */
  trash: {
    brand: "享扔到家",
    theme: { accent: "#13b36b" },
    city: "深圳",
    slogan: "专业代扔 · 生活垃圾",
    hero: { title: "专业代扔 生活垃圾", sub: "绿色生活，从点滴做起 · 下楼这件小事交给我们" },

    // 首页实时动态（社会证明）
    feed: [
      { who: "拉拉姐", what: "购买了 包月套餐", ago: "2分钟前" },
      { who: "Tina", what: "完成了 单次代扔", ago: "5分钟前" },
      { who: "阿成", what: "下单了 大件代扔（旧衣柜）", ago: "刚刚" },
      { who: "小鹿", what: "领取了 超值券包", ago: "8分钟前" },
    ],

    // 单次代扔：可选垃圾类型
    trashTypes: [
      { id: "life", name: "生活垃圾", icon: "trash", note: "日常装袋垃圾" },
      { id: "kitchen", name: "厨余垃圾", icon: "bowl", note: "需密封防漏" },
      { id: "recycle", name: "可回收物", icon: "recycle", note: "纸箱/瓶罐" },
    ],

    // 大件代扔品类（带单价）
    bulky: [
      { id: "bed", name: "床/床垫", icon: "bed", price: 39 },
      { id: "wardrobe", name: "衣柜", icon: "wardrobe", price: 49 },
      { id: "tvstand", name: "电视柜", icon: "tv", price: 29 },
      { id: "table", name: "餐桌", icon: "table", price: 35 },
      { id: "toilet", name: "马桶", icon: "toilet", price: 45 },
      { id: "catframe", name: "猫架", icon: "cat", price: 19 },
    ],

    // 包月套餐
    plans: [
      { id: "daily", name: "每日上门", times: "每天 1 次 · 约 30 次/月", price: 99, per: "约 ¥3.3/次", tag: "最省心", hot: true },
      { id: "other", name: "隔日上门", times: "隔天 1 次 · 约 15 次/月", price: 65, per: "约 ¥4.3/次", tag: "" },
      { id: "week3", name: "每周三次", times: "每周 3 次 · 约 12 次/月", price: 49, per: "约 ¥4.1/次", tag: "轻量" },
    ],

    // 超值券包（单次代扔券）
    couponPacks: [
      { id: "c10", n: 10, price: 59, orig: 70, save: 11 },
      { id: "c20", n: 20, price: 99, orig: 140, save: 41, best: true },
    ],
    couponFace: 7,   // 每张单次代扔券抵扣面额

    // 计价规则
    rule: {
      single: { base: 5, baseBags: 1, addBag: 3, urgentFee: 3, noElevatorPerFloor: 1 },
      bulkyNoElevatorPerFloor: 5,
    },

    // 服务流程
    steps: [
      { icon: "edit", t: "下单", s: "选类型/地址/时间" },
      { icon: "bolt", t: "接单", s: "附近骑手抢单" },
      { icon: "bike", t: "上门", s: "到家门口收取" },
      { icon: "leaf", t: "代扔", s: "分类投放完成" },
    ],

    // 预约时段
    slots: ["立即上门（加急）", "今天 18:00-20:00", "明天 08:00-10:00", "明天 12:00-14:00"],

    // 演示订单
    orders: [
      { id: "T20627", type: "单次代扔 · 生活垃圾 ×3袋", addr: "阳光花园 6栋2单元 1203", time: "今天 18:30", amount: 11, status: "已完成" },
      { id: "T20631", type: "大件代扔 · 旧衣柜 ×1", addr: "阳光花园 6栋2单元 1203", time: "明天 09:00", amount: 49, status: "待接单" },
    ],
  },

  /* ===== 场景二：大件家具 / 装修垃圾清运 ===== */
  clean: {
    brand: "速清到家",
    theme: { accent: "#ff7a18" },
    city: "上海",
    slogan: "大件清运 · 装修垃圾",
    hero: { title: "大件清运 装修垃圾", sub: "搬不动、扔不掉？一个电话，上门搬走" },

    feed: [
      { who: "王先生", what: "下单了 整屋清运", ago: "3分钟前" },
      { who: "李姐", what: "完成了 旧沙发清运", ago: "刚刚" },
      { who: "装修队·张", what: "购买了 工地清运套餐", ago: "10分钟前" },
    ],

    trashTypes: [
      { id: "reno", name: "装修垃圾", icon: "trash", note: "砖石/木料/袋装" },
      { id: "life", name: "生活垃圾", icon: "bowl", note: "日常清运" },
      { id: "recycle", name: "可回收物", icon: "recycle", note: "纸箱/金属" },
    ],

    bulky: [
      { id: "sofa", name: "沙发", icon: "sofa", price: 59 },
      { id: "bed", name: "床/床垫", icon: "bed", price: 49 },
      { id: "wardrobe", name: "衣柜", icon: "wardrobe", price: 55 },
      { id: "fridge", name: "冰箱/家电", icon: "tv", price: 39 },
      { id: "table", name: "桌椅", icon: "table", price: 29 },
      { id: "toilet", name: "马桶/洁具", icon: "toilet", price: 49 },
    ],

    plans: [
      { id: "site", name: "工地包月", times: "随叫随到 · 不限次数", price: 399, per: "工地专享", tag: "工程", hot: true },
      { id: "store", name: "商铺包月", times: "每天 1 次清运", price: 199, per: "约 ¥6.6/次", tag: "" },
      { id: "home", name: "家庭季卡", times: "三个月 6 次大件", price: 159, per: "约 ¥26/次", tag: "灵活" },
    ],

    couponPacks: [
      { id: "c5", n: 5, price: 199, orig: 250, save: 51 },
      { id: "c10", n: 10, price: 359, orig: 500, save: 141, best: true },
    ],
    couponFace: 50,

    rule: {
      single: { base: 30, baseBags: 5, addBag: 5, urgentFee: 20, noElevatorPerFloor: 3 },
      bulkyNoElevatorPerFloor: 8,
    },

    steps: [
      { icon: "edit", t: "下单", s: "拍照报清运量" },
      { icon: "bolt", t: "派单", s: "就近调度货车" },
      { icon: "bike", t: "上门", s: "搬运工到场" },
      { icon: "leaf", t: "清运", s: "合规消纳处置" },
    ],

    slots: ["立即上门（加急）", "今天 14:00-18:00", "明天 08:00-12:00", "明天 14:00-18:00"],

    orders: [
      { id: "C30188", type: "大件清运 · 旧沙发 ×1 旧床 ×1", addr: "静安·中凯城市之光 18F", time: "今天 15:00", amount: 108, status: "服务中" },
    ],
  },
};
