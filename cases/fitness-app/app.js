/* 轻燃健身 · 跟练 App（演示）
 * 计划列表 → 计划详情(动作列表) → 全屏跟练播放器(动画+倒计时+语音+进度+休息) → 训练完成
 */
const CFG = window.FITNESS_CONFIG;
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const screen = document.getElementById("screen");

let view = "home", curPlan = null;
// 播放器状态
let seq = [], pi = 0, phase = "action", remain = 0, total = 0, paused = false, timer = null, startedAt = 0, doneCount = 0;
const DONE = loadDone();
function loadDone() { try { return JSON.parse(localStorage.getItem("fitness_done")) || {}; } catch (e) { return {}; } }
function saveDone() { localStorage.setItem("fitness_done", JSON.stringify(DONE)); }

/* ---------- 动作小人 ---------- */
const POSE = {
  stand: '<line x1="60" y1="33" x2="60" y2="74"/><line x1="60" y1="40" x2="42" y2="62"/><line x1="60" y1="40" x2="78" y2="62"/><line x1="60" y1="74" x2="48" y2="112"/><line x1="60" y1="74" x2="72" y2="112"/>',
  jumpingjack: '<line x1="60" y1="33" x2="60" y2="72"/><line x1="60" y1="40" x2="34" y2="22"/><line x1="60" y1="40" x2="86" y2="22"/><line x1="60" y1="72" x2="40" y2="112"/><line x1="60" y1="72" x2="80" y2="112"/>',
  highknee: '<line x1="60" y1="33" x2="60" y2="74"/><line x1="60" y1="40" x2="44" y2="24"/><line x1="60" y1="40" x2="76" y2="60"/><line x1="60" y1="74" x2="52" y2="112"/><polyline points="60,74 76,82 70,66" fill="none"/>',
  squat: '<line x1="60" y1="36" x2="60" y2="72"/><line x1="60" y1="42" x2="86" y2="40"/><line x1="60" y1="42" x2="86" y2="46"/><polyline points="60,72 46,90 52,112" fill="none"/><polyline points="60,72 74,90 68,112" fill="none"/>',
  plank: '<line x1="38" y1="84" x2="96" y2="74"/><line x1="42" y1="84" x2="40" y2="108"/><line x1="92" y1="75" x2="112" y2="106"/><line x1="92" y1="75" x2="100" y2="106"/>',
  stretch: '<line x1="60" y1="33" x2="58" y2="74"/><line x1="60" y1="40" x2="80" y2="20"/><line x1="60" y1="40" x2="48" y2="58"/><line x1="58" y1="74" x2="48" y2="112"/><line x1="58" y1="74" x2="70" y2="112"/>',
};
const POSEMAP = { jumpingjack: "jumpingjack", highknee: "highknee", squat: "squat", plank: "plank", pushup: "plank", climber: "plank", situp: "stretch", twist: "stretch", stretch: "stretch", rest: "stand" };
function figure(pose) {
  const p = POSEMAP[pose] || "stand";
  return `<svg class="fig pose-${p}" viewBox="0 0 130 124"><g stroke="currentColor" stroke-width="7" stroke-linecap="round" fill="none">
    <circle cx="${p === "plank" ? 28 : 60}" cy="${p === "plank" ? 86 : 21}" r="11"/>${POSE[p]}</g></svg>`;
}

/* ---------- 语音 ---------- */
function speak(t) { try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "zh-CN"; u.rate = 1; speechSynthesis.speak(u); } catch (e) { } }
let AC; function beep(hi) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = hi ? 880 : 520; o.connect(g); g.connect(AC.destination); const s = AC.currentTime; g.gain.setValueAtTime(.001, s); g.gain.exponentialRampToValueAtTime(.3, s + .02); g.gain.exponentialRampToValueAtTime(.001, s + .16); o.start(s); o.stop(s + .18); } catch (e) { } }

/* ---------- 视图 ---------- */
function vHome() {
  const cards = CFG.plans.map((p) => {
    const done = DONE[p.id] || 0;
    return `<div class="plan" data-act="plan" data-id="${p.id}" style="--c:${p.color}">
      <div class="pl-cover">${figure(p.actions[0].pose)}<span class="pl-lv">${esc(p.level)}</span></div>
      <div class="pl-b"><div class="pl-t">${esc(p.title)}</div>
        <div class="pl-meta">${ic("clock")} ${Math.round(p.actions.reduce((n, a) => n + a.dur + (a.rest || 0), 0) / 60)} 分钟 · ${ic("chart")} ${p.kcal} 千卡 · ${esc(p.parts)}</div>
        <div class="pl-tags"><span class="tag">${esc(p.target)}</span><span class="tag">${esc(p.equipment)}</span>${done ? `<span class="tag done">已练 ${done} 次</span>` : ""}</div></div></div>`;
  }).join("");
  return `<div class="scroll">
    <div class="hd"><div class="hd-t">今天，动起来 💪</div><div class="hd-s">挑一个计划，跟着练就行</div></div>
    <div class="seclabel">训练计划</div>${cards}
    <div class="foot">轻燃健身 · 跟练演示</div></div>`;
}

function vDetail() {
  const p = curPlan, mins = Math.round(p.actions.reduce((n, a) => n + a.dur + (a.rest || 0), 0) / 60);
  const acts = p.actions.map((a, i) => `<div class="arow"><span class="anum">${i + 1}</span>
    <div class="ai"><div class="an">${esc(a.name)}</div><div class="as">${a.reps ? "×" + a.reps + " 次" : a.dur + " 秒"}${a.rest ? " · 休息 " + a.rest + "s" : ""}</div></div>
    <span class="apose">${figure(a.pose)}</span></div>`).join("");
  return `<div class="phero" style="--c:${p.color}">
      <div class="back round" data-act="home">‹</div>
      <div class="ph-t">${esc(p.title)}</div>
      <div class="ph-meta"><div><b>${mins}</b><span>分钟</span></div><div><b>${p.actions.length}</b><span>动作</span></div><div><b>${p.kcal}</b><span>千卡</span></div><div><b>${esc(p.level)}</b><span>难度</span></div></div>
    </div>
    <div class="scroll detail">
      <div class="ddesc">${esc(p.desc)}</div>
      <div class="seclabel">动作列表（${p.actions.length}）</div>${acts}
      <div style="height:90px"></div></div>
    <div class="startbar"><button class="startbtn" data-act="start" style="background:${p.color}">${ic("plus")} 开始训练</button></div>`;
}

function vPlayer() {
  const node = seq[pi];
  const p = curPlan, R = 54, C = 2 * Math.PI * R, off = total ? C * (1 - remain / total) : 0;
  if (phase === "rest") {
    const nx = node.next;
    return `<div class="player rest" style="--c:${p.color}">
      <div class="pl-top"><span class="pl-x" data-act="home">✕</span><span class="pl-prog">休息</span><span class="pl-x" data-act="toggle">${paused ? "▶" : "❚❚"}</span></div>
      <div class="restmid"><div class="rest-lb">休息一下</div>
        <div class="ring"><svg viewBox="0 0 130 130"><circle class="ring-bg" cx="65" cy="65" r="${R}"/><circle class="ring-fg" cx="65" cy="65" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg><div class="ring-n">${remain}</div></div>
        <div class="nextup">下一个：<b>${esc(nx.name)}</b> · ${nx.reps ? "×" + nx.reps : nx.dur + "s"}</div></div>
      <div class="pl-ctrl"><button class="cbtn" data-act="skip">跳过休息 ⏭</button></div></div>`;
  }
  const a = node;
  return `<div class="player" style="--c:${p.color}">
    <div class="pl-top"><span class="pl-x" data-act="home">✕</span><span class="pl-prog">${pi + 1} / ${seq.length}</span><span class="pl-x" data-act="toggle">${paused ? "▶" : "❚❚"}</span></div>
    <div class="figwrap">${figure(a.pose)}</div>
    <div class="actname">${esc(a.name)}</div>
    <div class="ring"><svg viewBox="0 0 130 130"><circle class="ring-bg" cx="65" cy="65" r="${R}"/><circle class="ring-fg" cx="65" cy="65" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg><div class="ring-n">${remain}<span>${a.reps ? "×" + a.reps : "秒"}</span></div></div>
    <div class="acttip">${ic("chart")} ${esc(a.tip || "")}</div>
    <div class="pl-ctrl"><button class="cbtn ghost" data-act="prev">⏮ 上一个</button><button class="cbtn ghost" data-act="skip">下一个 ⏭</button></div></div>`;
}

const VIEWS = { home: vHome, detail: vDetail, player: vPlayer };
function render() { screen.innerHTML = `<div class="view v-${view}">${VIEWS[view] ? VIEWS[view]() : ""}</div>`; }
function go(v) { view = v; render(); }

/* ---------- 跟练引擎 ---------- */
function buildSeq(p) {
  const s = [];
  p.actions.forEach((a, i) => {
    s.push({ kind: "action", name: a.name, pose: a.pose, dur: a.dur, reps: a.reps, tip: a.tip });
    if (a.rest && i < p.actions.length - 1) s.push({ kind: "rest", dur: a.rest, next: p.actions[i + 1] });
  });
  return s;
}
function startWorkout(p) {
  curPlan = p; seq = buildSeq(p); pi = 0; doneCount = 0; startedAt = Date.now(); paused = false;
  enter(); go("player");
}
function enter() {
  const node = seq[pi]; phase = node.kind; remain = node.dur; total = node.dur;
  if (phase === "action") { doneCount++; speak(node.name + (node.tip ? "，" + node.tip : "")); }
  else speak("休息");
  render(); runTimer();
}
function runTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (paused || view !== "player") return;
    remain -= 1;
    if (remain <= 3 && remain >= 1) beep(false);
    if (remain <= 0) { beep(true); advance(); return; }
    updateRing();
  }, 1000);
}
function updateRing() {
  const R = 54, C = 2 * Math.PI * R;
  const fg = screen.querySelector(".ring-fg"); const n = screen.querySelector(".ring-n");
  if (fg) fg.setAttribute("stroke-dashoffset", total ? C * (1 - remain / total) : 0);
  if (n) n.childNodes[0] && (n.childNodes[0].nodeValue = remain);
}
function advance() {
  if (pi + 1 >= seq.length) { finish(); return; }
  pi++; enter();
}
function prev() { if (pi > 0) { pi--; while (pi > 0 && seq[pi].kind === "rest") pi--; enter(); } else enter(); }
function toggle() { paused = !paused; render(); }
function finish() {
  clearInterval(timer);
  DONE[curPlan.id] = (DONE[curPlan.id] || 0) + 1; saveDone();
  const mins = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
  speak("训练完成，太棒了！");
  screen.innerHTML = `<div class="view"><div class="done" style="--c:${curPlan.color}">
    <div class="done-ic">${ic("trophy")}</div><div class="done-t">训练完成！</div>
    <div class="done-stats"><div><b>${mins}</b><span>分钟</span></div><div><b>${curPlan.actions.length}</b><span>动作</span></div><div><b>${curPlan.kcal}</b><span>千卡</span></div></div>
    <div class="done-msg">坚持就是胜利，已为你打卡 ✓</div>
    <div class="done-btns"><button class="startbtn" data-act="redo" style="background:${curPlan.color}">再练一次</button><button class="startbtn ghost" data-act="home">返回首页</button></div>
  </div></div>`;
}

/* ---------- 交互 ---------- */
screen.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act;
  if (a === "home") { clearInterval(timer); try { speechSynthesis.cancel(); } catch (e) { } go("home"); }
  else if (a === "plan") { curPlan = CFG.plans.find((p) => p.id === el.dataset.id); go("detail"); }
  else if (a === "start") startWorkout(curPlan);
  else if (a === "skip") advance();
  else if (a === "prev") prev();
  else if (a === "toggle") toggle();
  else if (a === "redo") startWorkout(curPlan);
});
go("home");
