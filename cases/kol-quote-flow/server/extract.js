/* AI 结构化抽取 —— 从 KOL 报价邮件里抽出固定字段的 JSON
 *
 * 用 Claude 的「结构化输出」(output_config.format) 约束返回，保证拿到合法 JSON。
 * 模型在 .env 的 MODEL 里配，默认 claude-opus-4-8（最准）。
 * 高并发/降成本可改 claude-sonnet-4-6 或 claude-haiku-4-5（见 README 成本表）。
 */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // 读 ANTHROPIC_API_KEY
const MODEL = process.env.MODEL || "claude-opus-4-8";

// 抽取字段定义 —— 同时也是“飞书表要哪些列”的事实来源。
// 结构化输出要求 additionalProperties:false，且不支持 min/max 等约束。
export const SCHEMA = {
  type: "object",
  properties: {
    kol_name:      { type: "string", description: "KOL 名称或账号名" },
    platform:      { type: "string", description: "平台，如 YouTube / Instagram / TikTok" },
    handle:        { type: "string", description: "主页链接或 @handle，没有则留空" },
    followers:     { type: "string", description: "粉丝量，保留原文（如 1.2M），没有则留空" },
    price:         { type: "number", description: "报价金额，只取数字；多档报价取最低价" },
    currency:      { type: "string", description: "币种，如 USD / EUR / GBP，未写默认 USD" },
    deliverables:  { type: "string", description: "合作形式/交付内容，如 1 integrated video + 2 stories" },
    timeline:      { type: "string", description: "可上线时间或周期，没有则留空" },
    contact_email: { type: "string", description: "联系邮箱，优先正文里写明的" },
    notes:         { type: "string", description: "其他要点，一句话；没有则留空" },
  },
  required: ["kol_name", "platform", "price", "currency"],
  additionalProperties: false,
};

const SYSTEM = `你是海外 KOL 营销团队的助理。用户会发来一封 KOL（网红/达人）发来的合作或报价邮件，
请从中抽取结构化信息，严格按给定 JSON schema 输出。要求：
- 只依据邮件内容，不要编造；信息缺失就用空字符串，price 缺失用 0。
- price 只保留数字；遇到区间或多档，取最低的一档，把完整报价写进 notes。
- platform 用平台英文名（YouTube / Instagram / TikTok / X 等）。
- followers 保留原始写法（如 "1.2M"、"850k"），不要换算。`;

// 入参：单封邮件的发件人/主题/正文纯文本
export async function extractQuote({ subject = "", from = "", body = "" }) {
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM,
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
    messages: [
      {
        role: "user",
        content: `发件人：${from}\n主题：${subject}\n\n正文：\n${body.slice(0, 12000)}`,
      },
    ],
  });
  // 结构化输出保证首个 text 块是合法 JSON
  const text = resp.content.find((b) => b.type === "text")?.text ?? "{}";
  return JSON.parse(text);
}
