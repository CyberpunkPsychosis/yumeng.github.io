/* 统一大模型接口 —— 厂商/模型从配置存储读取（页面上切换）
 *
 *  provider=anthropic : 用官方 SDK + 结构化输出
 *  provider=openai    : 任意「OpenAI 兼容」端点（OpenAI / DeepSeek / 通义 /
 *                       Moonshot / 智谱 / 混元 / Gemini 兼容端点…），填 baseUrl 即可
 *
 * 对外只暴露 completeJSON({system,user,schema}) -> 解析好的对象。
 */
import Anthropic from "@anthropic-ai/sdk";
import { getLLM } from "./config.js";

export async function completeJSON({ system, user, schema }) {
  const cfg = getLLM();
  return cfg.provider === "anthropic"
    ? anthropicJSON(cfg, { system, user, schema })
    : openaiJSON(cfg, { system, user, schema });
}

/* ---------- Anthropic（原生结构化输出）---------- */
let _client, _key;
function anthropic(apiKey) {
  if (!_client || _key !== apiKey) { _client = new Anthropic({ apiKey }); _key = apiKey; }
  return _client;
}
async function anthropicJSON(cfg, { system, user, schema }) {
  const resp = await anthropic(cfg.apiKey).messages.create({
    model: cfg.model,
    max_tokens: 2000,
    system,
    output_config: { format: { type: "json_schema", schema } },
    messages: [{ role: "user", content: user }],
  });
  const text = resp.content.find((b) => b.type === "text")?.text ?? "{}";
  return JSON.parse(text);
}

/* ---------- OpenAI 兼容 ---------- */
async function openaiJSON(cfg, { system, user, schema }) {
  const base = (cfg.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
  const sys = `${system}\n\n只输出一个 JSON 对象，字段如下（缺失填空字符串或 0，不要多余字段）：\n${JSON.stringify(schema.properties)}`;
  const r = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.model,
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      response_format: { type: "json_object" },
      temperature: 0,
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`LLM ${r.status}: ${JSON.stringify(d).slice(0, 200)}`);
  const text = d.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(String(text).trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim());
}
