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
