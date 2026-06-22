/* AI 结构化抽取 —— 把一封邮件抽成模板定义的字段
 *
 * 用什么模型由 llm.js 决定（可随意切换厂商），抽什么字段由 templates 决定。
 * 这一层只负责把邮件拼成提示词、调统一接口。
 */
import { completeJSON } from "./llm.js";
import { activeTemplate } from "./templates/index.js";

export async function extractQuote({ subject = "", from = "", body = "" }) {
  const t = activeTemplate();
  return completeJSON({
    system: t.systemPrompt,
    user: `发件人：${from}\n主题：${subject}\n\n正文：\n${body.slice(0, 12000)}`,
    schema: t.schema,
  });
}
