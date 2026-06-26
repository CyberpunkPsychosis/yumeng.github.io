/* 小步课堂 · 互动课程平台（演示）
 * 课程列表 → 单元/课时 → 闯关式上课（数数/比多少/加减/选一选）。
 * 对错本地判分（准确）；AI 小老师只讲解/鼓励/出相似题（可接通义千问，未配置则离线兜底）。
 */
const CFG = window.COURSE_CONFIG;
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const root = document.getElementById("app");
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

let view = "home", curCourse = null, lesson = null, steps = [], idx = 0, sStatus = "idle", lessonStars = 0;
let aiMsgs = [];
const PROG = loadProg();
function loadProg() { try { return JSON.parse(localStorage.getItem("kidscourse_progress")) || {}; } catch (e) { return {}; } }
function saveProg() { localStorage.setItem("kidscourse_progress", JSON.stringify(PROG)); }

/* ---------- 形状/物体 SVG ---------- */
function shapeSVG(kind, i) {
  const S = {
    apple: '<svg viewBox="0 0 48 48"><path d="M24 14c-3-5-12-4-14 2-2 7 4 18 14 18s16-11 14-18c-2-6-11-7-14-2z" fill="#fa5741"/><path d="M24 14c0-4 2-6 5-7" fill="none" stroke="#8a5a2b" stroke-width="2.5" stroke-linecap="round"/><path d="M27 9c3-1 6 0 7 2-2 2-5 2-7 0z" fill="#3bbf6b"/></svg>',
    star: '<svg viewBox="0 0 48 48"><path d="M24 5l5.5 11.5L42 18l-9 8.7 2.3 12.3L24 33l-11.3 6 2.3-12.3L6 18l12.5-1.5z" fill="#ffb300"/></svg>',
    balloon: '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="19" rx="13" ry="16" fill="#7b61ff"/><path d="M24 35v8" stroke="#9aa0b0" stroke-width="2" fill="none"/><path d="M21 35l3 3 3-3z" fill="#7b61ff"/></svg>',
    candy: '<svg viewBox="0 0 48 48"><rect x="13" y="16" width="22" height="16" rx="7" fill="#ff5fa2"/><path d="M13 24l-7-5v10zM35 24l7-5v10z" fill="#ff9ec7"/></svg>',
    fish: '<svg viewBox="0 0 48 48"><ellipse cx="22" cy="24" rx="14" ry="9" fill="#26b6c9"/><path d="M36 24l8-6v12z" fill="#1796a8"/><circle cx="16" cy="22" r="2" fill="#fff"/></svg>',
  }[kind] || '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="#4a7bf7"/></svg>';
  return `<span class="obj pop" style="animation-delay:${(i || 0) * 60}ms">${S}</span>`;
}
function objects(kind, count) {
  if (kind === "shapes") return `<div class="objs">
    <span class="obj"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="#4a7bf7"/></svg></span>
    <span class="obj"><svg viewBox="0 0 48 48"><rect x="8" y="8" width="32" height="32" rx="4" fill="#19b36b"/></svg></span>
    <span class="obj"><svg viewBox="0 0 48 48"><path d="M24 7l17 30H7z" fill="#ffb300"/></svg></span></div>`;
  let s = ""; for (let i = 0; i < count; i++) s += shapeSVG(kind, i);
  return `<div class="objs">${s}</div>`;
}

/* ---------- 语音 / 音效 ---------- */
function speak(text) {
  try { if (!window.speechSynthesis) return; speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "zh-CN"; u.rate = 0.9; u.pitch = 1.15; speechSynthesis.speak(u);
  } catch (e) { }
}
let AC; function tone(ok) {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const seq = ok ? [[660, 0], [880, .12], [1175, .24]] : [[300, 0], [240, .14]];
    seq.forEach(([f, t]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = "sine"; o.frequency.value = f;
      o.connect(g); g.connect(AC.destination); const s = AC.currentTime + t; g.gain.setValueAtTime(.001, s); g.gain.exponentialRampToValueAtTime(.25, s + .03); g.gain.exponentialRampToValueAtTime(.001, s + .18); o.start(s); o.stop(s + .2); });
  } catch (e) { }
}

/* ---------- 课时构建 + 判分 ---------- */
function buildSteps(ls) {
  if (ls.steps) return ls.steps.map(normalize);
  if (ls.gen) { const out = []; for (let i = 0; i < ls.gen.n; i++) out.push(genArith(ls.gen)); return out.map(normalize); }
  return [];
}
function genArith(g) {
  if (g.type === "add") { const a = rand(1, g.max - 1), b = rand(1, g.max - a); return { type: "arith", a, b, op: "+" }; }
  const a = rand(2, g.max), b = rand(1, a - 1); return { type: "arith", a, b, op: "-" };
}
function normalize(st) {
  const s = Object.assign({}, st);
  if (s.type === "arith") { s.answer = s.op === "+" ? s.a + s.b : s.a - s.b; s.prompt = `${s.a} ${s.op} ${s.b} = ?`;
    s.say = `${s.a} ${s.op === "+" ? "加" : "减"} ${s.b} 等于几？`;
    const set = new Set([s.answer]); while (set.size < 4) set.add(Math.max(0, s.answer + rand(-3, 3))); s.choices = shuffle([...set]); }
  if (s.type === "count") { s.answer = s.count; }
  return s;
}
function grade(s, given) {
  if (s.type === "count" || s.type === "arith") return +given === s.answer;
  if (s.type === "compare") { const a = s.left.count, b = s.right.count; const want = a > b ? "left" : a < b ? "right" : "equal"; return given === want; }
  if (s.type === "choose") return +given === s.answer;
  return false;
}
function problemText(s) {
  if (s.type === "arith") return `${s.a} ${s.op} ${s.b}`;
  if (s.type === "count") return s.prompt;
  if (s.type === "compare") return s.prompt;
  if (s.type === "choose") return s.prompt;
  return s.prompt || "";
}

/* ---------- 视图 ---------- */
function vHome() {
  const cards = CFG.courses.map((c) => {
    const total = c.units.reduce((n, u) => n + u.lessons.length, 0);
    const done = c.units.reduce((n, u) => n + u.lessons.filter((l) => PROG[l.id]).length, 0);
    return `<div class="ccard" data-act="opencourse" data-id="${c.id}" style="--cc:${c.color}">
      <div class="cc-cover">${ic(c.icon)}<span class="cc-num">${esc(c.cover)}</span></div>
      <div class="cc-b"><div class="cc-t">${esc(c.title)}</div><div class="cc-s">${esc(c.subtitle)}</div>
        <div class="cc-meta"><span class="lvl">${esc(c.level)}</span><span class="prog">${done}/${total} 课</span></div>
        <div class="cc-bar"><i style="width:${total ? done / total * 100 : 0}%"></i></div></div></div>`;
  }).join("");
  const ai = window.AITutor.configured();
  return `<div class="topbar"><div class="logo"><span class="logo-ic">${ic("cap")}</span>${esc(CFG.brand)}</div>
      <div class="ai-status ${ai ? "on" : ""}" data-act="settings">${ic("chat")} ${ai ? "已连接 AI 老师" : "离线小老师 · 点此接 AI"}</div></div>
    <div class="hero"><div><h1>动动手指，学会数学 ✦</h1><p>给 5 岁左右小朋友的互动课：数一数、比多少、加减法，做错有小老师讲解。</p></div></div>
    <h2 class="sec">选择课程</h2><div class="courses">${cards}</div>`;
}

function vCourse() {
  const c = curCourse;
  const units = c.units.map((u, ui) => `<div class="unit"><div class="un-t"><span class="un-n">${ui + 1}</span>${esc(u.title)}</div>
    <div class="lessons">${u.lessons.map((l) => { const p = PROG[l.id]; return `<div class="lcard ${p ? "done" : ""}" data-act="lesson" data-id="${l.id}">
      <span class="l-ic">${ic(l.icon || "star")}</span><div class="l-b"><div class="l-t">${esc(l.title)}</div>
      <div class="l-s">${p ? "已完成" : "去上课"}</div></div>
      <span class="l-stars">${p ? "★".repeat(p.stars) + "☆".repeat(3 - p.stars) : "›"}</span></div>`; }).join("")}</div></div>`).join("");
  return `<div class="topbar"><span class="back" data-act="home">‹ 返回</span><div class="tt">${esc(c.title)}</div><span></span></div>
    <div class="coursewrap">${units}</div>`;
}

function vLesson() {
  const s = steps[idx];
  const prog = steps.map((_, i) => `<span class="pdot ${i < idx ? "done" : i === idx ? "now" : ""}"></span>`).join("");
  let body = "";
  if (s.type === "teach") {
    body = `<div class="teach"><div class="big-prompt">${esc(s.prompt)}</div>${objects(s.kind, s.count)}
      <button class="bigbtn" data-act="next">我知道啦 ✓</button></div>`;
  } else if (s.type === "count") {
    body = `<div class="qcard"><div class="q-row"><div class="big-prompt">${esc(s.prompt)}</div><button class="spk" data-act="say">${ic("chat")}</button></div>
      ${objects(s.kind, s.count)}
      <div class="numpad">${Array.from({ length: 10 }, (_, i) => i + 1).map((n) => `<button class="num" data-act="answer" data-v="${n}" ${sStatus !== "idle" ? "disabled" : ""}>${n}</button>`).join("")}</div></div>`;
  } else if (s.type === "arith") {
    body = `<div class="qcard"><div class="q-row"><div class="big-prompt eq">${s.a} ${s.op} ${s.b} = <b>?</b></div><button class="spk" data-act="say">${ic("chat")}</button></div>
      <div class="eqviz">${objects("apple", s.a)}<span class="opmark">${s.op}</span>${objects(s.op === "+" ? "star" : "apple", s.b)}</div>
      <div class="choices">${s.choices.map((n) => `<button class="choice" data-act="answer" data-v="${n}" ${sStatus !== "idle" ? "disabled" : ""}>${n}</button>`).join("")}</div></div>`;
  } else if (s.type === "compare") {
    body = `<div class="qcard"><div class="q-row"><div class="big-prompt">${esc(s.prompt)}</div><button class="spk" data-act="say">${ic("chat")}</button></div>
      <div class="cmp"><div class="cmp-side">${objects(s.left.kind, s.left.count)}</div><div class="cmp-vs">VS</div><div class="cmp-side">${objects(s.right.kind, s.right.count)}</div></div>
      <div class="choices three"><button class="choice" data-act="answer" data-v="left" ${sStatus !== "idle" ? "disabled" : ""}>⬅ 左边多</button>
        <button class="choice" data-act="answer" data-v="equal" ${sStatus !== "idle" ? "disabled" : ""}>一样多</button>
        <button class="choice" data-act="answer" data-v="right" ${sStatus !== "idle" ? "disabled" : ""}>右边多 ➡</button></div></div>`;
  } else if (s.type === "choose") {
    body = `<div class="qcard"><div class="q-row"><div class="big-prompt">${esc(s.prompt)}</div><button class="spk" data-act="say">${ic("chat")}</button></div>
      <div class="choices ${s.options.length > 2 ? "three" : ""}">${s.options.map((o, i) => `<button class="choice" data-act="answer" data-v="${i}" ${sStatus !== "idle" ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div></div>`;
  }
  const fb = sStatus === "ok" ? `<div class="feedback ok">🎉 答对啦！<button class="bigbtn" data-act="next">${idx + 1 >= steps.length ? "完成 🏆" : "下一题 →"}</button></div>`
    : sStatus === "no" ? `<div class="feedback no">再试一次，看看小老师的提示 👇<button class="smallbtn" data-act="retry">重新选</button></div>` : "";
  return `<div class="topbar"><span class="back" data-act="course">‹ 退出</span><div class="tt">${esc(lesson.title)}</div><span class="stars">★ ${lessonStars}</span></div>
    <div class="progbar">${prog}</div>
    <div class="lessonbody">${body}${fb}</div>
    ${aiPanel()}`;
}

function aiPanel() {
  const arith = steps[idx] && (steps[idx].type === "arith" || steps[idx].type === "count");
  const msgs = aiMsgs.map((m) => `<div class="aimsg ${m.who}">${m.who === "ai" ? `<span class="ai-av">${ic("cap")}</span>` : ""}<div class="aib">${esc(m.t)}</div></div>`).join("");
  return `<div class="aipanel">
    <div class="ai-h"><span class="ai-av">${ic("cap")}</span><b>AI 小老师</b><span class="ai-tag">${window.AITutor.configured() ? "千问" : "离线"}</span></div>
    <div class="ai-body" id="aibody">${msgs || `<div class="aimsg ai"><span class="ai-av">${ic("cap")}</span><div class="aib">遇到不会的，点下面的按钮问我呀～</div></div>`}</div>
    <div class="ai-btns">
      <button class="aibtn" data-act="ai" data-k="hint">💡 给点提示</button>
      <button class="aibtn" data-act="ai" data-k="explain">🧠 讲讲思路</button>
      <button class="aibtn" data-act="say2">🔁 再读一遍</button>
      ${arith ? `<button class="aibtn" data-act="ai" data-k="more">✨ 换一道</button>` : ""}
    </div></div>`;
}

function vSettings() {
  const c = window.AITutor.cfg();
  return `<div class="topbar"><span class="back" data-act="home">‹ 返回</span><div class="tt">连接 AI 老师</div><span></span></div>
    <div class="setwrap">
      <div class="panel">
        <p class="muted">接入大模型后，做错题时 AI 老师会用小朋友能懂的话讲解、鼓励、出相似题。<b>数学对错始终由本地判定，保证准确</b>，AI 只负责讲解。</p>
        <div class="presets">${Object.entries(window.AITutor.PRESETS).map(([k, v]) => `<button class="aibtn" data-act="preset" data-k="${k}">${esc(v.label)}</button>`).join("")}</div>
        <label>接口地址 (Base URL)</label><input id="s_base" class="line" value="${esc(c.baseURL || "")}" placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"/>
        <label>模型</label><input id="s_model" class="line" value="${esc(c.model || "")}" placeholder="qwen-plus"/>
        <label>API Key</label><input id="s_key" class="line" type="password" value="${esc(c.apiKey || "")}" placeholder="sk-..."/>
        <div class="setbtns"><button class="bigbtn sm" data-act="savecfg">保存</button><button class="smallbtn" data-act="testcfg">测试连接</button>
          <button class="smallbtn" data-act="clearcfg">清空（用离线小老师）</button></div>
        <div id="testout" class="muted sm"></div>
        <p class="muted sm">提示：浏览器里直接填 Key 会暴露在前端，仅适合自己单机用；正式上线建议用后端中转。</p>
      </div></div>`;
}

const VIEWS = { home: vHome, course: vCourse, lesson: vLesson, settings: vSettings };
function render() { root.innerHTML = `<div class="screen v-${view}">${VIEWS[view]()}</div>`; const ab = document.getElementById("aibody"); if (ab) ab.scrollTop = ab.scrollHeight; }
function go(v) { view = v; render(); }

/* ---------- 上课流程 ---------- */
function startLesson(l) {
  lesson = l; steps = buildSteps(l); idx = 0; sStatus = "idle"; lessonStars = 0; aiMsgs = [];
  go("lesson"); sayStep();
}
function sayStep() { const s = steps[idx]; if (s && s.say) setTimeout(() => speak(s.say), 250); }
function answer(v) {
  const s = steps[idx]; if (sStatus !== "idle") return;
  if (grade(s, v)) { sStatus = "ok"; lessonStars++; tone(true); aiCheer(true); render(); }
  else { sStatus = "no"; tone(false); pushAI("ai", offlineHint(s)); render(); }
}
function next() {
  if (idx + 1 >= steps.length) { finishLesson(); return; }
  idx++; sStatus = "idle"; aiMsgs = []; render(); sayStep();
}
function finishLesson() {
  const stars = lessonStars >= steps.length ? 3 : lessonStars >= steps.length * 0.6 ? 2 : 1;
  PROG[lesson.id] = { done: true, stars: Math.max(PROG[lesson.id] ? PROG[lesson.id].stars : 0, stars) }; saveProg();
  tone(true); setTimeout(() => speak("太棒啦，你完成了这一课！"), 200);
  root.innerHTML = `<div class="screen"><div class="reward">
    <div class="confetti">${Array.from({ length: 14 }, (_, i) => `<i style="--d:${i}"></i>`).join("")}</div>
    <div class="rw-card"><div class="rw-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
      <h2>这一课完成啦！</h2><p>答对 ${lessonStars} / ${steps.length} 题</p>
      <div class="rw-btns"><button class="bigbtn" data-act="again">再来一遍</button><button class="bigbtn ghost" data-act="course">继续闯关</button></div>
    </div></div></div>`;
}

/* ---------- AI 小老师 ---------- */
function pushAI(who, t) { aiMsgs.push({ who, t }); }
function offlineHint(s) {
  if (s.type === "count") return "用小手指一个一个点着数：1、2、3……数到最后一个就是答案啦。";
  if (s.type === "arith" && s.op === "+") return `先有 ${s.a} 个，再添上 ${s.b} 个。从 ${s.a} 开始，往后一个一个数 ${s.b} 下试试。`;
  if (s.type === "arith") return `本来有 ${s.a} 个，拿走 ${s.b} 个。从 ${s.a} 开始，往回一个一个数 ${s.b} 下试试。`;
  if (s.type === "compare") return "两边一个对着一个比，哪边还多出来，哪边就更多；正好配完就是一样多。";
  return "别急，把题目再读一遍，慢慢看每个选项。";
}
async function aiAsk(kind) {
  const s = steps[idx];
  if (kind === "more" && (s.type === "arith")) { steps[idx] = normalize(genArith({ type: s.op === "+" ? "add" : "sub", max: 10 })); sStatus = "idle"; aiMsgs = []; pushAI("ai", "给你换了一道新的，加油！"); render(); sayStep(); return; }
  if (kind === "more" && s.type === "count") { const k = s.kind, c = rand(2, 10); steps[idx] = normalize({ type: "count", kind: k, count: c, prompt: `数一数，有几个？`, say: "数一数，有几个？" }); sStatus = "idle"; aiMsgs = []; render(); sayStep(); return; }
  pushAI("me", kind === "hint" ? "给点提示" : "讲讲思路"); render();
  if (!window.AITutor.configured()) { const t = offlineHint(s); pushAI("ai", t); render(); speak(t); return; }
  pushAI("ai", "让我想想…"); render();
  try {
    const t = await window.AITutor.explain(problemText(s), kind === "hint" ? "给个小提示就好，别直接说答案。" : "讲讲怎么想出来。");
    aiMsgs[aiMsgs.length - 1] = { who: "ai", t }; render(); speak(t);
  } catch (e) { aiMsgs[aiMsgs.length - 1] = { who: "ai", t: offlineHint(s) + "（AI 连接失败，用离线提示）" }; render(); }
}
async function aiCheer(ok) {
  if (!window.AITutor.configured()) { pushAI("ai", ok ? "太棒啦，你真聪明！🎉" : ""); return; }
  try { const t = await window.AITutor.cheer(ok, problemText(steps[idx])); pushAI("ai", t); render(); } catch (e) { }
}

/* ---------- 设置 ---------- */
function saveCfg() {
  const c = { baseURL: val("s_base"), model: val("s_model"), apiKey: val("s_key") };
  window.AITutor.setCfg(c); toast("已保存");
}
function val(id) { const e = document.getElementById(id); return e ? e.value.trim() : ""; }
function toast(m) { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 1500); }

/* ---------- 交互 ---------- */
root.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act;
  if (a === "home") go("home");
  else if (a === "settings") go("settings");
  else if (a === "opencourse") { curCourse = CFG.courses.find((c) => c.id === el.dataset.id); go("course"); }
  else if (a === "course") { curCourse ? go("course") : go("home"); }
  else if (a === "lesson") { for (const u of curCourse.units) { const l = u.lessons.find((x) => x.id === el.dataset.id); if (l) startLesson(l); } }
  else if (a === "answer") answer(el.dataset.v);
  else if (a === "next") next();
  else if (a === "retry") { sStatus = "idle"; render(); }
  else if (a === "again") startLesson(lesson);
  else if (a === "say") speak(steps[idx].say || steps[idx].prompt);
  else if (a === "say2") speak(steps[idx].say || steps[idx].prompt);
  else if (a === "ai") aiAsk(el.dataset.k);
  else if (a === "preset") { const p = window.AITutor.PRESETS[el.dataset.k]; document.getElementById("s_base").value = p.baseURL; document.getElementById("s_model").value = p.model; }
  else if (a === "savecfg") saveCfg();
  else if (a === "clearcfg") { window.AITutor.setCfg({}); go("settings"); toast("已切回离线小老师"); }
  else if (a === "testcfg") testCfg();
});
async function testCfg() {
  saveCfg(); const out = document.getElementById("testout"); out.textContent = "测试中…";
  try { const r = await window.AITutor.chat([{ role: "user", content: "用一句话和小朋友打个招呼" }]); out.textContent = "✅ 连接成功：" + r; }
  catch (e) { out.textContent = "❌ 连接失败：" + e.message + "（将使用离线小老师）"; }
}
render();
