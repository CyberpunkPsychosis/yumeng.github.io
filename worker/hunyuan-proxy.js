/* 混元视觉代理 —— Cloudflare Worker
 *
 * 作用：持有混元 API Key（绝不进前端/git），接收前端发来的画面，
 *      调用 hunyuan-vision 模型，返回摄影建议。
 *
 * 部署见同目录 README。Key 通过 secret 注入：
 *   wrangler secret put HUNYUAN_API_KEY
 */

const HUNYUAN_URL = "https://api.hunyuan.cloud.tencent.com/v1/chat/completions";
const MODEL = "hunyuan-vision";

// 两种模式的系统提示词
const PROMPTS = {
  // 取景中：像现场摄影师在旁边实时指点
  live: `你是一位专业摄影指导，正站在用户身边。用户举着手机取景，发给你的是当前取景画面。
请用中文给出简短、具体、可立即执行的拍摄建议，就像现场摄影师在旁边指点。要求：
1. 先点出这个画面里最值得拍的主体或亮点。
2. 怎么构图：用三分法/引导线/前景/留白等，说清楚主体该往哪个方向移、放在哪。
3. 机位与角度：要不要蹲低、换个位置、找逆光/侧光等。
4. 等什么时机：光线、人物、动态等。
每条一句话，最多 4 条，每条单独一行，直接给建议，不要客套、不要解释术语。`,

  // 拍后点评：结构化打分 + 改进
  critique: `你是一位专业摄影评图老师。用户拍了一张照片发给你点评。
请用中文给出结构化点评，每行一项，格式为「维度：评价（+改进建议）」：
- 构图、光线、曝光、色彩、主题表达，各一行简评并给分（1-10）。
- 最后一行用「下次改进：」开头，给一条最关键、最具体的可执行建议。
语气鼓励但诚实，直接给内容，不要客套开场白。`,
};

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    const url = new URL(request.url);
    if (request.method !== "POST" || !url.pathname.endsWith("/suggest")) {
      return new Response("Not found", { status: 404, headers: cors });
    }
    if (!env.HUNYUAN_API_KEY) {
      return json({ error: "未配置 HUNYUAN_API_KEY" }, 500, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "请求体必须是 JSON" }, 400, cors);
    }
    const { image, mode } = body;
    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return json({ error: "缺少 image（需 data:image/...;base64 格式）" }, 400, cors);
    }
    const system = PROMPTS[mode] || PROMPTS.live;

    try {
      const hy = await fetch(HUNYUAN_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.HUNYUAN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: [
                { type: "text", text: mode === "critique" ? "请点评这张照片。" : "我现在想拍这个画面，给我建议。" },
                { type: "image_url", image_url: { url: image } },
              ],
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!hy.ok) {
        const errText = await hy.text();
        return json({ error: `混元接口报错 ${hy.status}`, detail: errText.slice(0, 500) }, 502, cors);
      }
      const data = await hy.json();
      const text = data?.choices?.[0]?.message?.content ?? "";
      return json({ text }, 200, cors);
    } catch (e) {
      return json({ error: "调用混元失败：" + e.message }, 502, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
