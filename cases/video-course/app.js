/* 云课堂 · 视频课平台（演示）
 * 课程列表 → 课程详情(大纲/介绍/评价) → 学习页(视频播放器 + 章节目录 + 笔记/讨论) → 完成证书
 */
const CFG = window.VIDEO_CONFIG;
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const app = document.getElementById("app");

let view = "home", cat = "全部", curCourse = null, curLesson = null, ltab = "intro";
let playing = false, cur = 0, ptimer = null;
const PROG = load("videocourse_progress", {});
const ENROLL = new Set(load("videocourse_enroll", []));
const NOTES = load("videocourse_notes", {});
const DISC = {};
function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const yuan = (n) => n ? "¥" + n : "免费";

const flat = (c) => c.chapters.flatMap((ch) => ch.lessons);
const lessonTotal = (l) => l.dur * 60;
const courseProg = (c) => { const ls = flat(c); return { done: ls.filter((l) => PROG[l.id]).length, total: ls.length }; };
const allDone = (c) => { const p = courseProg(c); return p.total && p.done >= p.total; };

/* ---------- 顶栏 ---------- */
function topbar() {
  return `<header class="nav"><div class="logo" data-act="home"><span class="logo-ic">${ic("cap")}</span>${esc(CFG.brand)}</div>
    <div class="navcats">${CFG.categories.map((c) => `<span class="ncat ${c === cat && view === "home" ? "on" : ""}" data-act="cat" data-c="${esc(c)}">${esc(c)}</span>`).join("")}</div>
    <div class="navsearch"><span>${ic("search")}</span><input placeholder="搜索课程"/></div>
    <div class="navme" data-act="mylearning"><span class="av">学</span> 我的学习</div></header>`;
}

/* ---------- 首页 ---------- */
function vHome() {
  const list = CFG.courses.filter((c) => cat === "全部" || c.cat === cat);
  const feat = CFG.courses[0];
  const cards = list.map(courseCard).join("");
  return topbar() + `<div class="wrap">
    <div class="banner" style="--c:${feat.color}"><div class="bn-l"><div class="bn-tag">精选推荐</div><h1>${esc(feat.title)}</h1>
      <p>${esc(feat.desc)}</p><button class="btn" data-act="course" data-id="${feat.id}">${ic("play")} 立即学习</button></div>
      <div class="bn-cover" style="background:linear-gradient(135deg,${feat.color},#222)">${ic("play")}</div></div>
    <h2 class="sec">${cat === "全部" ? "全部课程" : esc(cat)}（${list.length}）</h2>
    <div class="cgrid">${cards}</div></div>`;
}
function courseCard(c) {
  const p = courseProg(c), pct = p.total ? Math.round(p.done / p.total * 100) : 0;
  return `<div class="ccard" data-act="course" data-id="${c.id}">
    <div class="cc-cover" style="background:linear-gradient(135deg,${c.color},#2b2f3a)"><span class="cc-play">${ic("play")}</span><span class="cc-cat">${esc(c.cat)}</span></div>
    <div class="cc-b"><div class="cc-t">${esc(c.title)}</div>
      <div class="cc-ins">${esc(c.instructor.name)} · ${esc(c.instructor.title)}</div>
      <div class="cc-meta"><span class="rate">★ ${c.rating}</span><span>${(c.students / 10000).toFixed(1)} 万人学</span><span class="cc-price">${yuan(c.price)}</span></div>
      ${ENROLL.has(c.id) ? `<div class="cc-prog"><div class="cc-bar"><i style="width:${pct}%"></i></div><span>${pct}%</span></div>` : ""}</div></div>`;
}

/* ---------- 课程详情 ---------- */
function vDetail() {
  const c = curCourse, p = courseProg(c), enrolled = ENROLL.has(c.id);
  let li = 0;
  const chapters = c.chapters.map((ch, ci) => `<div class="chap"><div class="chap-t">${esc(ch.title)}</div>
    ${ch.lessons.map((l) => { li++; const done = PROG[l.id]; const can = enrolled || l.free;
      return `<div class="les ${done ? "done" : ""}" data-act="${can ? "learn" : "needbuy"}" data-id="${l.id}">
        <span class="les-ic">${done ? ic("check") : can ? ic("play") : ic("lock")}</span>
        <span class="les-t">${li}. ${esc(l.title)}</span>${l.free && !enrolled ? `<span class="free">试看</span>` : ""}
        <span class="les-d">${l.dur}:00</span></div>`; }).join("")}</div>`).join("");
  return topbar() + `<div class="detail">
    <div class="dhero" style="--c:${c.color}">
      <div class="dh-cover" style="background:linear-gradient(135deg,${c.color},#222)">${ic("play")}</div>
      <div class="dh-info"><div class="dh-cat">${esc(c.cat)} · ${esc(c.level)}</div><h1>${esc(c.title)}</h1>
        <p>${esc(c.desc)}</p>
        <div class="dh-meta"><span class="rate">★ ${c.rating}</span><span>${(c.students / 10000).toFixed(1)} 万人在学</span><span>共 ${c.hours} 小时 · ${p.total} 节</span></div>
        <div class="dh-ins"><span class="av">${esc(c.instructor.badge)}</span><div><b>${esc(c.instructor.name)}</b><span>${esc(c.instructor.title)}</span></div></div>
        <div class="dh-buy"><div class="price">${yuan(c.price)}</div>
          ${enrolled ? `<button class="btn" data-act="continue">${ic("play")} ${p.done ? "继续学习" : "开始学习"}</button>`
        : `<button class="btn" data-act="enroll">${c.price ? "立即购买" : "免费学习"}</button><button class="btn ghost" data-act="trial">先试看</button>`}
          ${allDone(c) ? `<button class="btn cert" data-act="cert">${ic("cert")} 领取证书</button>` : ""}</div>
      </div></div>
    <div class="dbody"><div class="dmain">
      <div class="dcard"><h3>你将学到</h3><div class="learn">${c.learn.map((x) => `<div class="li">${ic("check")} ${esc(x)}</div>`).join("")}</div></div>
      <div class="dcard"><h3>课程大纲（${p.total} 节）</h3>${chapters}</div>
      <div class="dcard"><h3>学员评价（${c.reviews.length}）</h3>${c.reviews.map((r) => `<div class="rev"><span class="av sm">${esc(r.user[0])}</span><div><div class="rev-h"><b>${esc(r.user)}</b><span class="stars">${"★".repeat(r.stars)}</span></div><div class="rev-t">${esc(r.text)}</div></div></div>`).join("")}</div>
    </div>
    <aside class="dside"><div class="dcard"><h3>讲师</h3><div class="dh-ins big"><span class="av lg">${esc(c.instructor.badge)}</span><div><b>${esc(c.instructor.name)}</b><span>${esc(c.instructor.title)}</span></div></div>
      <div class="sidestat"><div><b>${(c.students / 10000).toFixed(1)}万</b><span>学员</span></div><div><b>${c.rating}</b><span>评分</span></div><div><b>${c.hours}h</b><span>时长</span></div></div></div></aside>
    </div></div>`;
}

/* ---------- 学习页 ---------- */
function vLearn() {
  const c = curCourse, l = curLesson, total = lessonTotal(l), pct = total ? cur / total * 100 : 0;
  const ls = flat(c), i = ls.findIndex((x) => x.id === l.id);
  let li = 0;
  const toc = c.chapters.map((ch) => `<div class="toc-ch">${esc(ch.title)}</div>${ch.lessons.map((x) => { li++; const on = x.id === l.id;
    return `<div class="toc-l ${on ? "on" : ""} ${PROG[x.id] ? "done" : ""}" data-act="learn" data-id="${x.id}">
      <span class="toc-ic">${PROG[x.id] ? ic("check") : on && playing ? ic("pause") : ic("play")}</span><span class="toc-t">${li}. ${esc(x.title)}</span><span class="toc-d">${x.dur}:00</span></div>`; }).join("")}`).join("");
  return topbar() + `<div class="learn">
    <div class="lmain">
      <div class="player">
        <div class="screen2" style="--c:${c.color}" data-act="playpause">
          <div class="scr-bg" style="background:linear-gradient(135deg,${c.color},#1a1d26)"></div>
          <div class="bigplay ${playing ? "hide" : ""}">${ic("play")}</div>
          <div class="scr-title">${esc(l.title)}</div>
          ${cur >= total && total ? `<div class="scr-end"><div>${ic("check")} 本节已学完</div>${i + 1 < ls.length ? `<button class="btn" data-act="learn" data-id="${ls[i + 1].id}">下一节 ›</button>` : `<button class="btn" data-act="cert">${ic("cert")} 领取证书</button>`}</div>` : ""}
        </div>
        <div class="ctrlbar">
          <span class="cb-ic" data-act="playpause">${playing ? ic("pause") : ic("play")}</span>
          <span class="cb-time">${mmss(cur)} / ${mmss(total)}</span>
          <div class="scrub" data-act="seek"><div class="scrub-f" style="width:${pct}%"></div></div>
          <span class="cb-ic" data-act="note">${ic("edit")}</span><span class="cb-ic">${ic("fullscreen")}</span>
        </div>
      </div>
      <div class="ltabs">${[["intro", "简介"], ["note", "笔记"], ["disc", "讨论"]].map((t) => `<span class="ltab ${ltab === t[0] ? "on" : ""}" data-act="ltab" data-t="${t[0]}">${t[1]}</span>`).join("")}</div>
      <div class="ltabbody">${learnTab(c, l)}</div>
    </div>
    <aside class="lside"><div class="lside-h"><b>${esc(c.title)}</b><span>${courseProg(c).done}/${courseProg(c).total} 节已学</span></div>
      <div class="toc">${toc}</div></aside></div>`;
}
function learnTab(c, l) {
  if (ltab === "note") {
    const ns = (NOTES[c.id] || []).filter((n) => n.lesson === l.id);
    return `<div class="notebox"><div class="note-add"><input id="noteIn" class="line" placeholder="在 ${mmss(cur)} 记一条笔记…"/><button class="btn sm" data-act="addnote">记笔记</button></div>
      ${ns.length ? ns.map((n) => `<div class="noterow" data-act="seekto" data-t="${n.time}"><span class="ntime">${mmss(n.time)}</span><span class="ntext">${esc(n.text)}</span></div>`).join("") : `<div class="muted sm" style="padding:10px 0">还没有笔记，看到重点随手记一条吧。</div>`}</div>`;
  }
  if (ltab === "disc") {
    const ds = DISC[c.id] || (DISC[c.id] = [{ u: "同**", t: "老师，这节的例子代码在哪下载呀？" }, { u: "讲师", t: "在资料区已上传，跟着敲一遍效果更好～", teacher: true }]);
    return `<div class="discbox"><div class="note-add"><input id="discIn" class="line" placeholder="提个问题，老师和同学会回复你…"/><button class="btn sm" data-act="adddisc">提问</button></div>
      ${ds.map((d) => `<div class="discrow"><span class="av sm ${d.teacher ? "tea" : ""}">${esc(d.u[0])}</span><div><div class="rev-h"><b>${esc(d.u)}</b>${d.teacher ? `<span class="teatag">讲师</span>` : ""}</div><div class="rev-t">${esc(d.t)}</div></div></div>`).join("")}</div>`;
  }
  return `<div class="introbox"><p>${esc(c.desc)}</p><div class="learn">${c.learn.map((x) => `<div class="li">${ic("check")} ${esc(x)}</div>`).join("")}</div></div>`;
}

const VIEWS = { home: vHome, detail: vDetail, learn: vLearn, mylearning: vMyLearning };
function vMyLearning() {
  const mine = CFG.courses.filter((c) => ENROLL.has(c.id));
  return topbar() + `<div class="wrap"><h2 class="sec">我的学习（${mine.length}）</h2>
    ${mine.length ? `<div class="cgrid">${mine.map(courseCard).join("")}</div>` : `<div class="empty">还没有在学课程，去首页选一门吧</div>`}</div>`;
}
function render() { app.innerHTML = VIEWS[view](); }
function go(v) { view = v; render(); }
function toast(m) { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 1500); }

/* ---------- 播放器 ---------- */
function openLesson(id) {
  stopPlay(); for (const ch of curCourse.chapters) { const l = ch.lessons.find((x) => x.id === id); if (l) curLesson = l; }
  cur = 0; ltab = "intro"; go("learn");
}
function playpause() { playing ? stopPlay() : startPlay(); }
function startPlay() {
  const total = lessonTotal(curLesson); if (cur >= total) cur = 0;
  playing = true; render();
  clearInterval(ptimer); ptimer = setInterval(() => {
    cur += Math.max(1, Math.round(total / 30));
    if (cur >= total) { cur = total; stopPlay(); markDone(); return; }
    const f = app.querySelector(".scrub-f"), t = app.querySelector(".cb-time"); const pct = cur / total * 100;
    if (f) f.style.width = pct + "%"; if (t) t.textContent = `${mmss(cur)} / ${mmss(total)}`;
  }, 500);
}
function stopPlay() { playing = false; clearInterval(ptimer); }
function markDone() { PROG[curLesson.id] = true; save("videocourse_progress", PROG); render(); }
function seekClick(e) {
  const bar = e.target.closest(".scrub"); if (!bar) return; const r = bar.getBoundingClientRect();
  cur = Math.round((e.clientX - r.left) / r.width * lessonTotal(curLesson)); render();
}

/* ---------- 交互 ---------- */
app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act, id = el.dataset.id;
  if (a === "home") { stopPlay(); go("home"); }
  else if (a === "cat") { cat = el.dataset.c; go("home"); }
  else if (a === "course") { curCourse = CFG.courses.find((c) => c.id === id); stopPlay(); go("detail"); }
  else if (a === "mylearning") { stopPlay(); go("mylearning"); }
  else if (a === "enroll") { ENROLL.add(curCourse.id); save("videocourse_enroll", [...ENROLL]); toast(curCourse.price ? "购买成功，开始学习吧" : "已加入学习"); openLesson(flat(curCourse)[0].id); }
  else if (a === "trial") { const f = flat(curCourse).find((l) => l.free) || flat(curCourse)[0]; openLesson(f.id); }
  else if (a === "continue") { const ls = flat(curCourse); const nx = ls.find((l) => !PROG[l.id]) || ls[0]; openLesson(nx.id); }
  else if (a === "learn") { if (!ENROLL.has(curCourse.id)) { const l = flat(curCourse).find((x) => x.id === id); if (l && !l.free) { toast("购买后可学习全部章节"); return; } } openLesson(id); }
  else if (a === "needbuy") toast("购买后可学习该章节");
  else if (a === "playpause") playpause();
  else if (a === "seek") seekClick(e);
  else if (a === "ltab") { ltab = el.dataset.t; render(); }
  else if (a === "addnote") { const v = (document.getElementById("noteIn").value || "").trim(); if (!v) return; (NOTES[curCourse.id] = NOTES[curCourse.id] || []).push({ lesson: curLesson.id, time: cur, text: v }); save("videocourse_notes", NOTES); render(); }
  else if (a === "seekto") { cur = +el.dataset.t; render(); }
  else if (a === "adddisc") { const v = (document.getElementById("discIn").value || "").trim(); if (!v) return; (DISC[curCourse.id] = DISC[curCourse.id] || []).push({ u: "我", t: v }); render(); setTimeout(() => { DISC[curCourse.id].push({ u: "讲师", t: "好问题！这点我在下一节会展开讲～", teacher: true }); if (view === "learn" && ltab === "disc") render(); }, 800); }
  else if (a === "cert") showCert();
});
function showCert() {
  const c = curCourse;
  const d = new Date(); const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const m = document.createElement("div"); m.className = "certmask"; m.innerHTML = `<div class="cert">
    <div class="cert-top">${ic("cert")} 结业证书</div><div class="cert-name">学员 同学</div>
    <div class="cert-txt">已完成课程</div><div class="cert-course">《${esc(c.title)}》</div>
    <div class="cert-foot"><span>${esc(CFG.brand)}</span><span>${ds}</span></div>
    <button class="btn" data-x="1">收下证书</button></div>`;
  m.addEventListener("click", (e) => { if (e.target === m || e.target.dataset.x) m.remove(); });
  document.body.appendChild(m);
}
go("home");
