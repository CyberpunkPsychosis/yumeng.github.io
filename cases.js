/* 案例库数据 —— 唯一需要手动维护的清单
 *
 * 加一个新案例：
 *   1) 在 cases/ 下新建一个文件夹（自带完整 HTML/JS/CSS，能独立打开）
 *   2) 在下面 CASES 数组里加一条
 *
 * 字段说明：
 *   title  案例名
 *   desc   一句话说明（首页卡片里展示）
 *   tags   标签数组，用于筛选 + 以后"找相似"（如 ["工具","相机","AI"]）
 *   path   打开地址（相对本页），如 "cases/photo-coach/index.html"
 *   thumb  截图路径（可选，没有就自动用首字 + 渐变占位）
 *   date   完成时间（可选，如 "2026-06"）
 */
const CASES = [
  {
    title: "海外 KOL 报价自动化",
    desc:  "Gmail 报价邮件 → AI 结构化抽取 → 人工确认 → 写入飞书多维表格。",
    tags:  ["AI", "自动化", "工作流", "飞书"],
    path:  "cases/kol-quote-flow/index.html",
    date:  "2026-06",
  },
];
