/* 轻燃健身 · Keep 式 App（演示）
 * 发现 / 课程 / 社区 / 我的 四个 Tab + 课程详情 + 训练计划 + 全屏跟练播放器 + 完成打卡。
 */
const CFG = window.FITNESS_CONFIG;
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const screen = document.getElementById("screen");
const kfmt = (n) => n >= 10000 ? (n / 10000).toFixed(1) + " 万" : n;

let view = "home", catFilter = "全部", curCourse = null, curSeries = null;
let favs = new Set(load("fit_favs", [])), feed = CFG.feed.map((f) => ({ ...f })), doneToday = false;
let extraDone = load("fit_done_days", []);
// 播放器
let seq = [], pi = 0, phase = "action", remain = 0, total = 0, paused = false, timer = null, startedAt = 0;
const DONE = load("fitness_done", {});
function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
const course = (id) => CFG.courses.find((c) => c.id === id);
const courseMins = (c) => Math.round(c.actions.reduce((n, a) => n + a.dur + (a.rest || 0), 0) / 60);

/* ---------- 小人 ---------- */
const POSE = {
  stand: '<line x1="60" y1="33" x2="60" y2="74"/><line x1="60" y1="40" x2="42" y2="62"/><line x1="60" y1="40" x2="78" y2="62"/><line x1="60" y1="74" x2="48" y2="112"/><line x1="60" y1="74" x2="72" y2="112"/>',
  jumpingjack: '<line x1="60" y1="33" x2="60" y2="72"/><line x1="60" y1="40" x2="34" y2="22"/><line x1="60" y1="40" x2="86" y2="22"/><line x1="60" y1="72" x2="40" y2="112"/><line x1="60" y1="72" x2="80" y2="112"/>',
  highknee: '<line x1="60" y1="33" x2="60" y2="74"/><line x1="60" y1="40" x2="44" y2="24"/><line x1="60" y1="40" x2="76" y2="60"/><line x1="60" y1="74" x2="52" y2="112"/><polyline points="60,74 76,82 70,66" fill="none"/>',
  squat: '<line x1="60" y1="36" x2="60" y2="72"/><line x1="60" y1="42" x2="86" y2="40"/><line x1="60" y1="42" x2="86" y2="46"/><polyline points="60,72 46,90 52,112" fill="none"/><polyline points="60,72 74,90 68,112" fill="none"/>',
  plank: '<line x1="38" y1="84" x2="96" y2="74"/><line x1="42" y1="84" x2="40" y2="108"/><line x1="92" y1="75" x2="112" y2="106"/><line x1="92" y1="75" x2="100" y2="106"/>',
  stretch: '<line x1="60" y1="33" x2="58" y2="74"/><line x1="60" y1="40" x2="80" y2="20"/><line x1="60" y1="40" x2="48" y2="58"/><line x1="58" y1="74" x2="48" y2="112"/><line x1="58" y1="74" x2="70" y2="112"/>',
};
const POSEMAP = { jumpingjack: "jumpingjack", highknee: "highknee", squat: "squat", plank: "plank", pushup: "plank", climber: "plank", situp: "stretch", twist: "stretch", stretch: "stretch", rest: "stand" };
function figure(pose) { const p = POSEMAP[pose] || "stand"; return `<svg class="fig pose-${p}" viewBox="0 0 130 124"><g stroke="currentColor" stroke-width="7" stroke-linecap="round" fill="none"><circle cx="${p === "plank" ? 28 : 60}" cy="${p === "plank" ? 86 : 21}" r="11"/>${POSE[p]}</g></svg>`; }

function speak(t) { try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "zh-CN"; u.rate = 1; speechSynthesis.speak(u); } catch (e) { } }
let AC; function beep(hi) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = hi ? 880 : 520; o.connect(g); g.connect(AC.destination); const s = AC.currentTime; g.gain.setValueAtTime(.001, s); g.gain.exponentialRampToValueAtTime(.3, s + .02); g.gain.exponentialRampToValueAtTime(.001, s + .16); o.start(s); o.stop(s + .18); } catch (e) { } }

/* ---------- 组件 ---------- */
function courseCard(c, wide) {
  return `<div class="ccard ${wide ? "wide" : ""}" data-act="course" data-id="${c.id}">
    <div class="cc-cov" style="background:linear-gradient(135deg,${c.color},#1b1f2b)">${figure(c.actions[0].pose)}<span class="cc-lv">${esc(c.level)}</span></div>
    <div class="cc-b"><div class="cc-t">${esc(c.title)}</div>
      <div class="cc-meta">${ic("clock")} ${courseMins(c)}分钟 · ${ic("chart")} ${c.kcal}千卡</div>
      <div class="cc-sub">★ ${c.rating} · ${kfmt(c.plays)}人练过</div></div></div>`;
}
function tabbar(active) {
  const t = [["home", "发现", "home"], ["train", "课程", "dumbbell"], ["community", "社区", "users"], ["profile", "我的", "user"]];
  return `<div class="tabbar">${t.map((x) => `<div class="t ${x[0] === active ? "on" : ""}" data-act="tab" data-v="${x[0]}"><span class="ic">${ic(x[2])}</span>${x[1]}</div>`).join("")}</div>`;
}

/* ---------- 发现 ---------- */
function vHome() {
  const u = CFG.user;
  const cats = CFG.categories.map((c) => `<div class="cat" data-act="cat" data-c="${esc(c.name)}"><span class="cat-ic" style="color:var(--ac)">${figure(c.pose)}</span><span>${esc(c.name)}</span></div>`).join("");
  const recs = CFG.recommend.map((id) => courseCard(course(id), true)).join("");
  const series = CFG.series.map((s) => `<div class="scard" data-act="series" data-id="${s.id}" style="background:linear-gradient(120deg,${s.color},${s.color}cc)">
    <div class="sc-t">${esc(s.title)}</div><div class="sc-s">${s.weeks} 周 · ${kfmt(s.joined)}人加入</div><div class="sc-go">查看计划 ›</div></div>`).join("");
  const posts = feed.slice(0, 2).map(feedCard).join("");
  return `<div class="scroll" style="--ac:#ff5a36">
    <div class="homehd"><div class="hi"><div class="hi-t">${esc(u.motto)} 👋</div><div class="hi-s">本周已运动 ${u.stats.weekDays} 天 · ${u.stats.weekMin} 分钟</div></div>
      <span class="hi-av" data-act="tab" data-v="profile">${esc(u.badge)}</span></div>
    <div class="todaycard"><div class="tc-i"><b>${u.stats.weekMin}</b><span>本周分钟</span></div><div class="tc-i"><b>${u.stats.weekKcal}</b><span>消耗千卡</span></div><div class="tc-i"><b>${u.stats.streak}</b><span>连续天数</span></div></div>
    <div class="seclabel">运动分类</div><div class="cats">${cats}</div>
    <div class="seclabel">为你推荐 <span class="more" data-act="tab" data-v="train">全部 ›</span></div><div class="hscroll">${recs}</div>
    <div class="seclabel">训练计划</div>${series}
    <div class="seclabel">社区精选 <span class="more" data-act="tab" data-v="community">更多 ›</span></div>${posts}
    <div style="height:90px"></div></div>${tabbar("home")}`;
}

/* ---------- 课程 ---------- */
function vTrain() {
  const cats = ["全部", ...CFG.categories.map((c) => c.name)];
  const chips = cats.map((c) => `<div class="chip ${c === catFilter ? "on" : ""}" data-act="cat2" data-c="${esc(c)}">${esc(c)}</div>`).join("");
  const list = CFG.courses.filter((c) => catFilter === "全部" || c.cat === catFilter);
  return `<div class="scroll" style="--ac:#ff5a36">
    <div class="ph2">课程库</div>
    <div class="chips">${chips}</div>
    <div class="clist">${list.map((c) => courseCard(c)).join("") || `<div class="empty">该分类暂无课程</div>`}</div>
    <div class="seclabel">训练计划</div>${CFG.series.map((s) => `<div class="scard" data-act="series" data-id="${s.id}" style="background:linear-gradient(120deg,${s.color},${s.color}cc)"><div class="sc-t">${esc(s.title)}</div><div class="sc-s">${s.weeks} 周 · ${kfmt(s.joined)}人加入</div><div class="sc-go">查看计划 ›</div></div>`).join("")}
    <div style="height:90px"></div></div>${tabbar("train")}`;
}

/* ---------- 社区 ---------- */
function feedCard(f) {
  return `<div class="post">
    <div class="po-h"><span class="po-av">${esc(f.badge)}</span><div><b>${esc(f.user)}</b><span>${esc(f.time)}</span></div></div>
    <div class="po-text">${esc(f.text)}</div>
    <div class="po-metric" style="--ac:${f.color}"><span class="po-fig" style="color:${f.color}">${figure("jumpingjack")}</span><div><b>${esc(f.metric.label)}</b><span>消耗 ${esc(f.metric.value)}</span></div></div>
    <div class="po-act"><span class="${f.liked ? "on" : ""}" data-act="like" data-id="${f.id}">${ic("heart")} ${f.likes}</span><span>${ic("chat")} ${f.comments}</span><span>${ic("share")} 分享</span></div></div>`;
}
function vCommunity() {
  return `<div class="scroll">
    <div class="ph2">社区动态</div>
    <div class="compose" data-act="post"><span class="po-av">${esc(CFG.user.badge)}</span><span class="cmp-ph">晒晒今天的运动打卡…</span><span class="cmp-b">发布</span></div>
    ${feed.map(feedCard).join("")}<div style="height:90px"></div></div>${tabbar("community")}`;
}

/* ---------- 我的 ---------- */
function vProfile() {
  const u = CFG.user, done = new Set([...u.doneDays, ...extraDone]);
  const d = new Date(), y = d.getFullYear(), m = d.getMonth(), today = d.getDate();
  const days = new Date(y, m + 1, 0).getDate(), first = new Date(y, m, 1).getDay();
  let cells = ""; for (let i = 0; i < first; i++) cells += `<span class="cal-x"></span>`;
  for (let n = 1; n <= days; n++) cells += `<span class="cal-d ${done.has(n) ? "on" : ""} ${n === today ? "today" : ""}">${n}</span>`;
  const badges = u.badges.map((b) => `<div class="badge2 ${b.got ? "got" : ""}"><span class="bg-ic">${figure(b.pose)}</span><span class="bg-n">${esc(b.name)}</span></div>`).join("");
  const myc = CFG.courses.filter((c) => favs.has(c.id));
  return `<div class="scroll">
    <div class="prof-h"><span class="prof-av">${esc(u.badge)}</span><div class="prof-i"><div class="prof-n">${esc(u.name)}</div><div class="prof-m">${esc(u.motto)}</div></div></div>
    <div class="statgrid"><div><b>${u.stats.totalDays}</b><span>累计天数</span></div><div><b>${u.stats.streak}</b><span>连续打卡</span></div><div><b>${u.stats.weekKcal}</b><span>本周千卡</span></div><div><b>${u.stats.weekMin}</b><span>本周分钟</span></div></div>
    <div class="card"><div class="ph3">运动日历 · ${m + 1}月 ${doneToday ? '<span class="okt">今日已打卡 ✓</span>' : ""}</div>
      <div class="calhead">${["日", "一", "二", "三", "四", "五", "六"].map((x) => `<span>${x}</span>`).join("")}</div>
      <div class="cal">${cells}</div></div>
    <div class="card"><div class="ph3">我的勋章</div><div class="badges">${badges}</div></div>
    <div class="card"><div class="ph3">我的收藏（${myc.length}）</div>
      ${myc.length ? `<div class="clist">${myc.map((c) => courseCard(c)).join("")}</div>` : `<div class="muted" style="font-size:13px;padding:6px 0">还没有收藏课程，去课程页点心收藏吧</div>`}</div>
    <div style="height:90px"></div></div>${tabbar("profile")}`;
}

/* ---------- 课程详情 ---------- */
function vDetail() {
  const c = curCourse, fav = favs.has(c.id);
  const acts = c.actions.map((a, i) => `<div class="arow"><span class="anum">${i + 1}</span><div class="ai"><div class="an">${esc(a.name)}</div><div class="as">${a.reps ? "×" + a.reps + " 次" : a.dur + " 秒"}</div></div><span class="apose" style="color:${c.color}">${figure(a.pose)}</span></div>`).join("");
  const revs = (c.reviews || []).map((r) => `<div class="rev"><span class="rev-av">${esc(r.u[0])}</span><div><div class="rev-h"><b>${esc(r.u)}</b><span class="stars">${"★".repeat(r.stars)}</span></div><div class="rev-t">${esc(r.t)}</div></div></div>`).join("");
  return `<div class="phero" style="--c:${c.color}"><div class="back round" data-act="back">‹</div><span class="fav round ${fav ? "on" : ""}" data-act="fav" data-id="${c.id}">${ic("heart")}</span>
      <div class="ph-fig">${figure(c.actions[0].pose)}</div><div class="ph-t">${esc(c.title)}</div>
      <div class="ph-meta"><div><b>${courseMins(c)}</b><span>分钟</span></div><div><b>${c.actions.length}</b><span>动作</span></div><div><b>${c.kcal}</b><span>千卡</span></div><div><b>★${c.rating}</b><span>${kfmt(c.plays)}练过</span></div></div></div>
    <div class="scroll detail">
      <div class="dtags"><span class="tag">${esc(c.target)}</span><span class="tag">${esc(c.parts)}</span><span class="tag">${esc(c.equipment)}</span><span class="tag">适合：${esc(c.suit)}</span></div>
      <div class="ddesc">${esc(c.desc)}</div>
      <div class="seclabel">动作列表（${c.actions.length}）</div>${acts}
      <div class="seclabel">学员评价（${(c.reviews || []).length}）</div>${revs || '<div class="muted" style="font-size:13px">暂无评价</div>'}
      <div style="height:96px"></div></div>
    <div class="startbar"><button class="startbtn" data-act="start" style="background:${c.color}">${ic("play")} 开始训练</button></div>`;
}

/* ---------- 训练计划 ---------- */
function vSeries() {
  const s = curSeries;
  const days = s.days.map((d) => { const c = d.rest ? null : course(d.courseId);
    return `<div class="drow2 ${d.rest ? "rest" : ""}" ${c ? `data-act="course" data-id="${c.id}"` : ""}><span class="dd-l">${esc(d.label)}</span>
      ${c ? `<span class="dd-fig" style="color:${c.color}">${figure(c.actions[0].pose)}</span><div class="dd-i"><b>${esc(c.title)}</b><span>${courseMins(c)}分钟 · ${c.kcal}千卡</span></div><span class="arr">›</span>` : `<div class="dd-i"><b>休息日</b><span>放松恢复，让身体长肌肉</span></div>`}</div>`; }).join("");
  return `<div class="phero" style="--c:${s.color}"><div class="back round" data-act="back">‹</div><div class="ph-t" style="margin-top:30px">${esc(s.title)}</div>
      <div class="ph-meta"><div><b>${s.weeks}</b><span>周</span></div><div><b>${s.days.length}</b><span>天/周</span></div><div><b>${kfmt(s.joined)}</b><span>人加入</span></div></div></div>
    <div class="scroll detail"><div class="ddesc">${esc(s.desc)}</div><div class="seclabel">每日安排</div>${days}<div style="height:96px"></div></div>
    <div class="startbar"><button class="startbtn" data-act="startseries" style="background:${s.color}">${ic("play")} 开始今日训练</button></div>`;
}

/* ---------- 播放器 ---------- */
function vPlayer() {
  const node = seq[pi], p = curCourse, R = 54, C = 2 * Math.PI * R, off = total ? C * (1 - remain / total) : 0;
  if (phase === "rest") { const nx = node.next;
    return `<div class="player rest" style="--c:${p.color}"><div class="pl-top"><span class="pl-x" data-act="quit">✕</span><span class="pl-prog">休息</span><span class="pl-x" data-act="toggle">${paused ? "▶" : "❚❚"}</span></div>
      <div class="restmid"><div class="rest-lb">休息一下</div><div class="ring"><svg viewBox="0 0 130 130"><circle class="ring-bg" cx="65" cy="65" r="${R}"/><circle class="ring-fg" cx="65" cy="65" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg><div class="ring-n">${remain}</div></div>
        <div class="nextup">下一个：<b>${esc(nx.name)}</b> · ${nx.reps ? "×" + nx.reps : nx.dur + "s"}</div></div>
      <div class="pl-ctrl"><button class="cbtn" data-act="skip">跳过休息 ⏭</button></div></div>`; }
  const a = node;
  return `<div class="player" style="--c:${p.color}"><div class="pl-top"><span class="pl-x" data-act="quit">✕</span><span class="pl-prog">${pi + 1} / ${seq.length}</span><span class="pl-x" data-act="toggle">${paused ? "▶" : "❚❚"}</span></div>
    <div class="figwrap">${figure(a.pose)}</div><div class="actname">${esc(a.name)}</div>
    <div class="ring"><svg viewBox="0 0 130 130"><circle class="ring-bg" cx="65" cy="65" r="${R}"/><circle class="ring-fg" cx="65" cy="65" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg><div class="ring-n">${remain}<span>${a.reps ? "×" + a.reps : "秒"}</span></div></div>
    <div class="acttip">${ic("chart")} ${esc(a.tip || "")}</div>
    <div class="pl-ctrl"><button class="cbtn ghost" data-act="prev">⏮ 上一个</button><button class="cbtn ghost" data-act="skip">下一个 ⏭</button></div></div>`;
}

const VIEWS = { home: vHome, train: vTrain, community: vCommunity, profile: vProfile, detail: vDetail, series: vSeries, player: vPlayer };
function render() { screen.innerHTML = `<div class="view v-${view}">${VIEWS[view]()}</div>`; }
function go(v) { view = v; render(); }
function toast(m) { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; screen.appendChild(t); setTimeout(() => t.remove(), 1400); }

/* ---------- 跟练引擎 ---------- */
function buildSeq(c) { const s = []; c.actions.forEach((a, i) => { s.push({ kind: "action", name: a.name, pose: a.pose, dur: a.dur, reps: a.reps, tip: a.tip }); if (a.rest && i < c.actions.length - 1) s.push({ kind: "rest", dur: a.rest, next: c.actions[i + 1] }); }); return s; }
function startWorkout(c) { curCourse = c; seq = buildSeq(c); pi = 0; startedAt = Date.now(); paused = false; enter(); go("player"); }
function enter() { const node = seq[pi]; phase = node.kind; remain = node.dur; total = node.dur; if (phase === "action") speak(node.name + (node.tip ? "，" + node.tip : "")); else speak("休息"); render(); runTimer(); }
function runTimer() { clearInterval(timer); timer = setInterval(() => { if (paused || view !== "player") return; remain -= 1; if (remain <= 3 && remain >= 1) beep(false); if (remain <= 0) { beep(true); advance(); return; } updateRing(); }, 1000); }
function updateRing() { const R = 54, C = 2 * Math.PI * R; const fg = screen.querySelector(".ring-fg"), n = screen.querySelector(".ring-n"); if (fg) fg.setAttribute("stroke-dashoffset", total ? C * (1 - remain / total) : 0); if (n && n.childNodes[0]) n.childNodes[0].nodeValue = remain; }
function advance() { if (pi + 1 >= seq.length) { finish(); return; } pi++; enter(); }
function prev() { if (pi > 0) { pi--; while (pi > 0 && seq[pi].kind === "rest") pi--; } enter(); }
function toggle() { paused = !paused; render(); }
function finish() {
  clearInterval(timer);
  DONE[curCourse.id] = (DONE[curCourse.id] || 0) + 1; save("fitness_done", DONE);
  const td = new Date().getDate(); if (!extraDone.includes(td)) { extraDone.push(td); save("fit_done_days", extraDone); } doneToday = true;
  const mins = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
  speak("训练完成，太棒了！");
  screen.innerHTML = `<div class="view"><div class="done" style="--c:${curCourse.color}"><div class="done-ic">${ic("trophy")}</div><div class="done-t">训练完成！</div>
    <div class="done-stats"><div><b>${mins}</b><span>分钟</span></div><div><b>${curCourse.actions.length}</b><span>动作</span></div><div><b>${curCourse.kcal}</b><span>千卡</span></div></div>
    <div class="done-msg">已打卡 ✓ 连续运动更有效</div>
    <div class="done-btns"><button class="startbtn" data-act="sharepost" style="background:#fff;color:#1b1f27">${ic("share")} 发到社区</button><button class="startbtn ghost" data-act="home2">完成</button></div></div></div>`;
}

/* ---------- 交互 ---------- */
screen.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act;
  if (a === "tab") go(el.dataset.v);
  else if (a === "cat") { catFilter = el.dataset.c; go("train"); }
  else if (a === "cat2") { catFilter = el.dataset.c; render(); }
  else if (a === "course") { curCourse = course(el.dataset.id); go("detail"); }
  else if (a === "series") { curSeries = CFG.series.find((s) => s.id === el.dataset.id); go("series"); }
  else if (a === "back") go(curSeries && view === "series" ? "train" : "home");
  else if (a === "fav") { e.stopPropagation(); const id = el.dataset.id; favs.has(id) ? favs.delete(id) : favs.add(id); save("fit_favs", [...favs]); toast(favs.has(id) ? "已收藏" : "已取消收藏"); render(); }
  else if (a === "start") startWorkout(curCourse);
  else if (a === "startseries") { const d = curSeries.days.find((x) => !x.rest); startWorkout(course(d.courseId)); }
  else if (a === "skip") advance();
  else if (a === "prev") prev();
  else if (a === "toggle") toggle();
  else if (a === "quit") { clearInterval(timer); try { speechSynthesis.cancel(); } catch (e) { } go("home"); }
  else if (a === "home2") { go("home"); }
  else if (a === "sharepost") { feed.unshift({ id: "u" + Date.now(), user: CFG.user.name, badge: CFG.user.badge, time: "刚刚", text: "完成了《" + curCourse.title + "》，打卡 💪", color: curCourse.color, metric: { label: curCourse.title, value: curCourse.kcal + " 千卡" }, likes: 0, comments: 0, liked: false }); go("community"); }
  else if (a === "like") { const f = feed.find((x) => x.id === el.dataset.id); if (f) { f.liked = !f.liked; f.likes += f.liked ? 1 : -1; render(); } }
  else if (a === "post") { feed.unshift({ id: "u" + Date.now(), user: CFG.user.name, badge: CFG.user.badge, time: "刚刚", text: "今天也完成打卡，继续加油！", color: "#ff5a36", metric: { label: "今日运动", value: "已打卡" }, likes: 0, comments: 0, liked: false }); toast("已发布动态"); render(); }
});
go("home");
