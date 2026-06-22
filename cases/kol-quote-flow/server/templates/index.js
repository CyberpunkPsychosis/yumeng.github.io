/* 模板注册表 —— 按 env TEMPLATE 选用，并从字段定义派生出 schema 和飞书列映射
 *
 * 加新行业：写一个 templates/xxx.js，在下面 ALL 里登记一行即可。
 */
import kolQuote from "./kol-quote.js";

const ALL = {
  "kol-quote": kolQuote,
  // "inquiry":  外贸询盘 → CRM
  // "resume":   简历 → 人才库
  // "invoice":  发票/账单 → 财务表
};

export function activeTemplate() {
  const id = process.env.TEMPLATE || "kol-quote";
  const t = ALL[id];
  if (!t) throw new Error(`未知模板：${id}（可用：${Object.keys(ALL).join(", ")}）`);
  return { ...t, schema: buildSchema(t), fieldMap: buildFieldMap(t) };
}

// 字段定义 -> 结构化输出 schema
function buildSchema(t) {
  const properties = {};
  const required = [];
  for (const f of t.fields) {
    properties[f.key] = { type: f.type === "number" ? "number" : "string", description: f.desc || f.label };
    if (f.required) required.push(f.key);
  }
  return { type: "object", properties, required, additionalProperties: false };
}

// 字段定义 -> { key: 飞书列名 }
function buildFieldMap(t) {
  const m = {};
  for (const f of t.fields) if (f.feishu) m[f.key] = f.feishu;
  return m;
}
