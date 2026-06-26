/* 案例库数据 —— 唯一需要手动维护的清单
 *
 * 加一个新案例：
 *   1) 在 cases/ 下新建一个文件夹（自带完整 HTML/JS/CSS，能独立打开）
 *   2) 在下面 CASES 数组里加一条
 *
 * 字段说明：
 *   title  案例名
 *   desc   一句话说明（首页卡片里展示）
 *   tags   标签数组，用于筛选 + 以后"找相似"（如 ["工具","自动化","飞书"]）
 *   path   打开地址（相对本页），如 "cases/photo-coach/index.html"
 *   thumb  截图路径（可选，没有就自动用首字 + 渐变占位）
 *   date   完成时间（可选，如 "2026-06"）
 */
const CASES = [
  {
    title: "找房小程序（地图找房 / 地铁找房）",
    desc:  "房产中介C端：搜索/地图(价格气泡)/地铁(线路选站)找房→房源详情→预约看房(微信登录)/在线咨询/在线签约支付→收藏与浏览记录。二手房+租房，全程可点。",
    tags:  ["小程序", "房产", "地图找房", "可玩"],
    path:  "cases/realty-miniapp/preview/index.html?c=buy",
    date:  "2026-06",
  },
  {
    title: "同城活动报名小程序（社交 / 亲子 / 户外）",
    desc:  "周边活动平台：逛活动→看人数亮点→报名上车(微信手机号登录)→报名成功；还能自己「发起活动」招人。一份配置换社区，全程可点。",
    tags:  ["小程序", "同城活动", "报名拼团", "可定制"],
    path:  "cases/event-miniapp/preview/index.html?c=city",
    date:  "2026-06",
  },
  {
    title: "VR 实景样板间 · 720° 看房",
    desc:  "房产全景看房：选楼盘户型→拖动环视360°→点门口热点走进下一个房间。自研 WebGL 全景，打开即玩，正式换客户实拍720°图即可。",
    tags:  ["小程序", "VR全景", "房产", "可玩"],
    path:  "cases/vr-tour/index.html",
    date:  "2026-06",
  },
  {
    title: "餐饮点餐小程序（食堂 / 外卖 / 奶茶）",
    desc:  "食堂菜单：选日期看当天菜→点开写评价(微信手机号登录)→底部给食堂提建议；外卖/奶茶可加购下单。一份配置换场景，全程可点。",
    tags:  ["小程序", "餐饮", "点餐", "可定制"],
    path:  "cases/menu-miniapp/preview/index.html?c=canteen",
    date:  "2026-06",
  },
  {
    title: "跳一跳 · 小游戏",
    desc:  "微信经典跳一跳的网页复刻，打开就能玩：长按蓄力→松开起跳→落点判定→计分连击。同一套逻辑可移植微信小游戏。",
    tags:  ["小游戏", "Canvas", "可玩", "H5"],
    path:  "cases/jump-game/index.html",
    date:  "2026-06",
  },
  {
    title: "二手 / 电商小程序",
    desc:  "参考多抓鱼的二手平台小程序，买卖双闭环：逛商品→加购→下单，以及卖闲置→选成色→秒出回收估价→提交，全程可点。换商品换店即复用。",
    tags:  ["小程序", "电商", "二手", "可定制"],
    path:  "cases/shop-miniapp/preview/index.html?c=vintage",
    date:  "2026-06",
  },
  {
    title: "陪诊小程序",
    desc:  "陪同就医的预约小程序：选服务→填就诊信息→确认，全程可点。可换成你的服务与价格。",
    tags:  ["小程序", "陪诊", "预约", "可定制"],
    path:  "cases/booking-miniapp/preview/index.html?c=peizhen",
    date:  "2026-06",
  },
  {
    title: "民宿预订小程序",
    desc:  "选房型→定日期人数→下单确认。换上你的房源图文价格即可上线。",
    tags:  ["小程序", "民宿", "预订", "可定制"],
    path:  "cases/booking-miniapp/preview/index.html?c=minsu",
    date:  "2026-06",
  },
  {
    title: "医院挂号小程序",
    desc:  "按科室找医生→选号选时段→预约确认。可换成你的科室与医生。",
    tags:  ["小程序", "挂号", "医疗", "可定制"],
    path:  "cases/booking-miniapp/preview/index.html?c=guahao",
    date:  "2026-06",
  },
  {
    title: "高端小程序模板（可换行业）",
    desc:  "内置高级排版与动效的微信小程序模板。换一份配置、传上素材，就能生成摄影、咖啡、品牌等不同行业的小程序，排版照样高端。",
    tags:  ["小程序", "模板", "可配置", "高端"],
    path:  "cases/miniapp-template/preview/index.html",
    date:  "2026-06",
  },
  {
    title: "高端企业官网模板",
    desc:  "大气的排版与滚动动画，看着高端上档次。内容集中在一个文件里改，换上你公司的信息就能上线。",
    tags:  ["官网", "模板", "可定制", "高端"],
    path:  "cases/corp-site/index.html",
    date:  "2026-06",
  },
  {
    title: "邮件信息自动整理进表格",
    desc:  "邮件/消息里的关键信息自动整理成表格，确认一下就入库。全程网页操作，不用懂技术，可换成你的行业。",
    tags:  ["自动化", "免抄表", "飞书", "可定制"],
    path:  "cases/kol-quote-flow/admin/index.html",
    date:  "2026-06",
  },
  {
    title: "海外 KOL 报价自动入库",
    desc:  "网红发来的报价邮件，自动整理进飞书表格，人工确认即可——告别一封封手动抄表。",
    tags:  ["KOL 营销", "自动化", "飞书", "可定制"],
    path:  "cases/kol-quote-flow/index.html",
    date:  "2026-06",
  },
];
