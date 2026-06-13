/* 混元视觉代理 —— Cloudflare Worker
 *
 * 作用：持有混元 API Key（绝不进前端/git），接收前端发来的画面，
 *      调用 hunyuan-vision 模型，返回摄影建议。
 *
 * 部署见同目录 README。Key 通过 secret 注入：
 *   wrangler secret put HUNYUAN_API_KEY
 */

// 腾讯云大模型服务平台 TokenHub（OpenAI 兼容接口）
const HUNYUAN_URL = "https://tokenhub.tencentmaas.com/v1/chat/completions";
const MODEL = "hy-vision-2.0-instruct";

// 两种模式的系统提示词（都用大白话，不讲专业术语）
const PROMPTS = {
  // 取景中：像朋友在旁边手把手教你拍
  live: `你是用户的拍照朋友，正站在他身边手把手教他。用户举着手机准备拍照，发给你的是当前取景画面。
请用最大的大白话告诉他现在该怎么做，目标是让这张拍得更好看。要求：
- 绝对不要用专业词（不要说构图、三分法、引导线、曝光、光线、留白这些）。
- 就说他身体能照着做的动作，比如：往左边挪一点、手机举高一点、蹲下来拍、离它近一点、把手机竖过来、等人走开再拍。
- 给 2~3 条，每条单独一行，开头用"👉"，每条一句话，简短直接。
- 不要解释为什么，不要客套，直接说怎么做。`,

  // 拍后：用大白话说下次怎么拍更好
  critique: `你在教一个完全不懂摄影的新手。用户拍了一张照片发给你。
请用最大的大白话告诉他：下次怎么拍能更好看。要求：
- 第一行先用一句话夸一下或说这张大概怎么样（亲切、鼓励）。
- 然后给 2~3 条下次能照着做的具体动作，每条单独一行，开头用"👉"。
- 绝对不要用专业词（不要说构图、曝光、饱和度、三分法、光线、色彩这些），不要打分。
- 就说大白话动作，比如：往左站半步、手机再举高点、离它近一点拍、等太阳没那么刺眼再拍、把手机擦干净。
- 别啰嗦、别讲道理，就告诉他怎么做。`,
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
