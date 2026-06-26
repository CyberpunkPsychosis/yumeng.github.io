/* AI 小老师对接层
 * 设计原则：数学对错由本地代码判（见 app.js 的 grade()），AI 只负责「讲解 / 鼓励 / 出相似题」。
 * 支持通义千问(DashScope OpenAI 兼容) / 任意 OpenAI 兼容接口；没配置 key 时用离线兜底。
 */
window.AITutor = (function () {
  const LSK = "kidscourse_ai";
  const PRESETS = {
    qwen: { label: "通义千问 (Qwen)", baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus" },
    openai: { label: "OpenAI 兼容", baseURL: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  };
  const SYS = "你是一位温柔耐心的幼儿数学启蒙老师，面对 5 岁左右的小朋友。" +
    "用最简单的口语、短句（最多两三句），多打比方（苹果、糖果、手指头），多鼓励。" +
    "不要用难字、不要长篇大论、不要列公式。";

  function cfg() { try { return JSON.parse(localStorage.getItem(LSK)) || {}; } catch (e) { return {}; } }
  function setCfg(c) { localStorage.setItem(LSK, JSON.stringify(c)); }
  function configured() { const c = cfg(); return !!(c.apiKey && c.baseURL && c.model); }

  async function chat(messages, opts) {
    const c = cfg();
    if (!configured()) throw new Error("not-configured");
    const res = await fetch(c.baseURL.replace(/\/+$/, "") + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + c.apiKey },
      body: JSON.stringify({ model: c.model, messages, temperature: (opts && opts.temp) ?? 0.5, max_tokens: 260 }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const j = await res.json();
    return (j.choices && j.choices[0] && j.choices[0].message.content || "").trim();
  }

  // 讲解某道题（problem 是题面文字，ask 是孩子的问题/默认讲思路）
  async function explain(problem, ask) {
    return chat([{ role: "system", content: SYS },
      { role: "user", content: `题目是「${problem}」。${ask || "请用小朋友能懂的话，讲讲怎么想出答案，别直接只说数字。"}` }]);
  }
  // 鼓励一句（答对/答错）
  async function cheer(correct, problem) {
    return chat([{ role: "system", content: SYS },
      { role: "user", content: correct ? `小朋友把「${problem}」做对了，用一句话夸夸他。` : `小朋友把「${problem}」做错了，用一句话温柔鼓励他再试一次，别说答案。` }], { temp: 0.8 });
  }

  return { cfg, setCfg, configured, chat, explain, cheer, PRESETS, SYS };
})();
