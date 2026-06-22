/* 统一大模型接口 —— 一行 env 切换厂商/模型
 *
 * LLM_PROVIDER=anthropic | openai
 *   anthropic : 用官方 SDK + 结构化输出（最稳的 JSON 约束）
 *   openai    : 任意「OpenAI 兼容」端点，填 LLM_BASE_URL 即可，覆盖
 *               OpenAI / DeepSeek / 通义千问(DashScope兼容) / Moonshot /
 *               智谱GLM / 腾讯混元 / Gemini(兼容端点) 等几乎所有主流模型。
 *
 * 对外只暴露一个方法：completeJSON({system, user, schema}) -> 解析好的对象。
 * 上层（抽取逻辑）完全不感知用的是哪家模型。
 */
import Anthropic from "@anthropic-ai/sdk";

const PROVIDER = process.env.LLM_PROVIDER || "anthropic";
const MODEL =
  process.env.LLM_MODEL ||
  (PROVIDER === "anthropic" ? "claude-opus-4-8" : "gpt-4o-mini");

export function activeModelInfo() {
  return { provider: PROVIDER, model: MODEL };
}

export async function completeJSON({ system, user, schema }) {
  return PROVIDER === "anthropic"
    ? anthropicJSON({ system, user, schema })
    : openaiJSON({ system, user, schema });
}

/* ---------- Anthropic（原生结构化输出）---------- */
let _anthropic;
async function anthropicJSON({ system, user, schema }) {
  _anthropic ||= new Anthropic(); // 读 ANTHROPIC_API_KEY
  const resp = await _anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system,
    output_config: { format: { type: "json_schema", schema } },
    messages: [{ role: "user", content: user }],
  });
  const text = resp.content.find((b) => b.type === "text")?.text ?? "{}";
  return JSON.parse(text);
}

/* ---------- OpenAI 兼容（覆盖国内外各家）---------- */
async function openaiJSON({ system, user, schema }) {
  const base = (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const key = process.env.LLM_API_KEY;
  // 兼容性优先：用 json_object 模式，把目标结构写进 system，最大化跨厂商可用
  const sys = `${system}\n\n只输出一个 JSON 对象，字段如下（缺失填空字符串或 0，不要多余字段）：\n${JSON.stringify(schema.properties)}`;
  const r = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`LLM ${r.status}: ${JSON.stringify(d).slice(0, 200)}`);
  const text = d.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(stripFence(text));
}

function stripFence(t) {
  return String(t).trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
}
