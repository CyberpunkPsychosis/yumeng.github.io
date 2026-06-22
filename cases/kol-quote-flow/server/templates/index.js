/* 当前模板 —— 来自配置存储（页面上编辑），并派生出 schema 和飞书列映射 */
import { getTemplate } from "../config.js";

export function activeTemplate() {
  const t = getTemplate(); // { name, systemPrompt?, fields:[{key,label,type,required,feishu,desc?}] }
  return {
    name: t.name,
    systemPrompt: t.systemPrompt || genericPrompt(t),
    fields: t.fields,
    schema: buildSchema(t),
    fieldMap: buildFieldMap(t),
  };
}

// 没有自定义提示词时，按字段自动生成一段通用抽取提示
function genericPrompt(t) {
  return `你是数据录入助理。请从用户提供的邮件中，按给定字段抽取「${t.name}」相关的结构化信息，严格输出 JSON。
- 只依据邮件内容，不要编造；缺失的文本字段留空字符串，数字字段缺失用 0。`;
}

function buildSchema(t) {
  const properties = {};
  const required = [];
  for (const f of t.fields) {
    properties[f.key] = { type: f.type === "number" ? "number" : "string", description: f.desc || f.label };
    if (f.required) required.push(f.key);
  }
  return { type: "object", properties, required, additionalProperties: false };
}

function buildFieldMap(t) {
  const m = {};
  for (const f of t.fields) if (f.feishu) m[f.key] = f.feishu;
  return m;
}
