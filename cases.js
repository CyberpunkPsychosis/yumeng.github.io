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
    title: "二手 / 电商小程序",
    desc:  "参考多抓鱼的购物小程序：逛商品→选规格→加购物车→结算下单，全程可点。换商品换店即复用。",
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
