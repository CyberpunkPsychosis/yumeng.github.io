/* 同城活动 / 周边活动报名拼团 · 可点击多页原型
 * home(活动流) → detail(活动详情) → signup(报名/上车, 需微信手机号登录) → confirm
 *            → create(发起活动)  → mine(我的报名 / 我发起的)
 */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const screen = document.getElementById("screen");
const yuan = (n) => "¥" + (Math.round(n * 100) / 100);

let CFG, view = "home", dir = "fwd", filter = "全部";
let curId = null, signupCount = 1;
let user = null, pendingAfterLogin = null, loginOpen = false;
let myJoined = [], myCreated = [], newSeq = 0;

const act = (id) => CFG.activities.find((a) => a.id === id);
const remain = (a) => Math.max(0, a.capacity - a.joined);
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";

/* ---------- 视图 ---------- */
function avatarRow(a, max) {
  const list = a.avatars.slice(0, max || 6);
  const more = a.joined > (max || 6);
  return `<div class="avs">${list.map((t) => `<span class="av">${esc(t[0])}</span>`).join("")}${more ? `<span class="av more">+${a.joined - (max || 6)}</span>` : ""}<span class="avtx">已 ${a.joined}/${a.capacity} 人上车</span></div>`;
}
function card(a) {
  return `<div class="card" data-act="open" data-id="${a.id}">
    <div class="cover"><img src="${esc(a.cover)}" alt="" loading="lazy" /><span class="hot">${ic("fire")} 热门</span>
      <span class="cprice">${a.price ? yuan(a.price) + "/人" : "免费"}</span></div>
    <div class="cbody">
      <div class="ctitle">${esc(a.title)}</div>
      <div class="corg"><span class="obadge">${esc(a.organizer.badge)}</span>${esc(a.organizer.name)} 发起 · ${a.organizer.views}人看过</div>
      <div class="cmeta"><i class="mi">${ic("clock")}</i>${esc(a.date)} ${esc(a.time)}</div>
      <div class="cmeta"><i class="mi">${ic("pin")}</i>${esc(a.place)} · ${esc(a.distance)}</div>
      <div class="cfoot">${avatarRow(a, 6)}<span class="join">上车 ›</span></div>
    </div></div>`;
}

function vHome() {
  const cats = CFG.categories.map((c) => `<div class="cat"><span class="cic">${ic(c.icon)}</span><span class="cnm">${esc(c.name)}</span></div>`).join("");
  const feed = CFG.activities.map(card).join("");
  return `<div class="page ${dir}">
    <div class="scroll">
      <div class="statusbar"><span>16:23</span><span>···· 5G <span class="bat"></span></span></div>
      <div class="topbar"><span class="loc"><i class="mi">${ic("pin")}</i>${esc(CFG.city)}</span>
        <div class="search" data-act="tolist"><i class="mi">${ic("search")}</i><span>搜活动 · ${esc(CFG.slogan)}</span></div>
        <span class="me" data-act="tomine">${user ? "我的" : "登录"}</span></div>
      <div class="banner" style="background:${esc(CFG.banner.color)}">
        <div class="bz"><div class="bt">${esc(CFG.banner.title)}</div><div class="bs">${esc(CFG.banner.sub)}</div></div></div>
      <div class="cats">${cats}</div>
      <div class="sec"><span class="sec-t">周边活动 · 有趣的一天</span><span class="sec-m" data-act="tolist">查看全部 ›</span></div>
      <div class="feed">${feed}</div>
    </div>
    <div class="tabbar">
      <div class="t on"><span class="ic">${ic("home")}</span>首页</div>
      <div class="t" data-act="tolist"><span class="ic">${ic("compass")}</span>周边活动</div>
      <div class="t pub" data-act="tocreate"><span class="pubic">${ic("plus")}</span>发起</div>
      <div class="t" data-act="tomine"><span class="ic">${ic("chat")}</span>消息</div>
      <div class="t" data-act="tomine"><span class="ic">${ic("user")}</span>我的</div>
    </div></div>`;
}

function vList() {
  const tabs = CFG.filters.map((f) => `<div class="ftab ${f === filter ? "on" : ""}" data-act="filter" data-f="${esc(f)}">${esc(f)}</div>`).join("");
  const list = CFG.activities.filter((a) => filter === "全部" || a.cat === filter).map(card).join("");
  const body = list || `<div class="empty"><div class="e">🧭</div>该分类暂无活动</div>`;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">周边活动 · GOGO!!!</div></div>
    <div class="ftabs">${tabs}</div>
    <div class="scroll"><div class="feed">${body}</div></div></div>`;
}

function vDetail() {
  const a = act(curId);
  const pct = Math.round(a.joined / a.capacity * 100);
  return `<div class="page ${dir}">
    <div class="appbar float"><div class="back" data-act="home">‹</div></div>
    <div class="scroll">
      <img class="dcover" src="${esc(a.cover)}" alt="" />
      <div class="dwrap">
        <div class="dtitle">${esc(a.title)}</div>
        <div class="dtags">${a.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="org"><span class="obadge big">${esc(a.organizer.badge)}</span>
          <div class="oi"><div class="on">${esc(a.organizer.name)}</div><div class="ov">发起人 · ${a.organizer.views}人看过</div></div>
          <span class="ofo">+ 关注</span></div>
        <div class="dinfo">
          <div class="irow"><span class="ik"><i class="mi">${ic("clock")}</i>时间</span><span>${esc(a.date)} ${esc(a.time)}</span></div>
          <div class="irow"><span class="ik"><i class="mi">${ic("pin")}</i>地点</span><span>${esc(a.place)} · ${esc(a.distance)}</span></div>
          <div class="irow"><span class="ik"><i class="mi">${ic("coin")}</i>人均</span><span class="price">${a.price ? yuan(a.price) : "免费"}</span></div>
        </div>
        <div class="capbox">
          <div class="capbar"><i style="width:${pct}%"></i></div>
          <div class="capt">${avatarRow(a, 8)}</div>
          <div class="caps">${remain(a) > 0 ? `还差 <b>${remain(a)}</b> 人成行，快上车～` : "已满员，可候补"}</div>
        </div>
        <div class="block"><div class="bk-t">活动亮点</div>${a.highlights.map((h) => `<div class="li">✦ ${esc(h)}</div>`).join("")}</div>
        <div class="block"><div class="bk-t">费用包含</div>${a.includes.map((h) => `<div class="li">· ${esc(h)}</div>`).join("")}</div>
        <div class="block"><div class="bk-t">活动详情</div><div class="ddesc">${esc(a.desc)}</div></div>
      </div>
    </div>
    <div class="cobar"><div class="pz"><div class="price big">${a.price ? yuan(a.price) : "免费"}</div><div class="pu">/人</div></div>
      <button class="btn" data-act="tosignup" ${remain(a) ? "" : "disabled"}>${remain(a) ? "我要上车" : "已满员"}</button></div></div>`;
}

function vSignup() {
  const a = act(curId), max = remain(a);
  const total = a.price * signupCount;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="backdetail">‹</div><div class="ttl">报名上车</div></div>
    <div class="scroll">
      <div class="sumcard"><img src="${esc(a.cover)}" alt=""/><div class="si"><div class="t">${esc(a.title)}</div><div class="m">${esc(a.date)} ${esc(a.time)}</div><div class="m">${esc(a.place)}</div></div></div>
      <div class="fcard"><div class="cl">报名人数（剩 ${max} 个名额）</div>
        <div class="stepper"><button data-act="cnt" data-d="-1">−</button><span class="v">${signupCount}</span><button data-act="cnt" data-d="1">+</button></div></div>
      <div class="fcard"><div class="cl">出行人信息</div>
        <input id="suName" class="line" placeholder="姓名" value="${user ? "微信用户" : ""}"/>
        <input id="suPhone" class="line" placeholder="手机号" value="${user ? user.phone : ""}"/>
        <textarea id="suNote" class="line area" placeholder="想对发起人说的（可选）"></textarea></div>
      <div class="loginnote">${user ? "✅ 已用尾号 " + user.phone.slice(-4) + " 手机号登录" : "🔒 报名需先微信绑定手机号登录"}</div>
    </div>
    <div class="cobar"><div class="pz"><div class="pu">合计</div><div class="price big">${a.price ? yuan(total) : "免费"}</div></div>
      <button class="btn" data-act="submitsignup">提交报名</button></div></div>`;
}

function vConfirm() {
  const a = act(curId);
  return `<div class="page ${dir}">
    <div class="statusbar"><span>16:23</span><span>···· 5G <span class="bat"></span></span></div>
    <div class="confirm"><div class="ok">✓</div><h2>报名成功</h2>
      <div class="tip">已为你锁定 ${signupCount} 个名额（演示，无需支付）<br>${esc(a.date)} ${esc(a.time)} · ${esc(a.place)}<br>记得准时上车，发起人会拉你进群～</div>
      <div class="acts"><div class="gbtn" data-act="tomine">我的报名</div><div class="gbtn" data-act="home">返回首页</div></div>
    </div></div>`;
}

function vCreate() {
  const opts = CFG.filters.filter((f) => f !== "全部").map((f) => `<option>${esc(f)}</option>`).join("");
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">发起活动</div></div>
    <div class="scroll">
      <div class="crhero">把你的周末计划发出来，召集同好一起上车 🚀</div>
      <div class="fcard"><div class="cl">活动标题</div><input id="cvTitle" class="line" placeholder="例：周六露营烧烤，招 8 人"/></div>
      <div class="fcard"><div class="cl">分类</div><select id="cvCat" class="line">${opts}</select></div>
      <div class="fcard row"><div style="flex:1"><div class="cl">日期</div><input id="cvDate" class="line" placeholder="06-29 周一"/></div>
        <div style="flex:1"><div class="cl">时间</div><input id="cvTime" class="line" placeholder="15:00 - 21:00"/></div></div>
      <div class="fcard"><div class="cl">地点</div><input id="cvPlace" class="line" placeholder="南山 · 大沙河公园"/></div>
      <div class="fcard row"><div style="flex:1"><div class="cl">人均(元)</div><input id="cvPrice" class="line" type="number" placeholder="0"/></div>
        <div style="flex:1"><div class="cl">限额(人)</div><input id="cvCap" class="line" type="number" placeholder="10"/></div></div>
      <div class="fcard"><div class="cl">活动简介</div><textarea id="cvDesc" class="line area" placeholder="活动安排、集合方式、注意事项…"></textarea></div>
    </div>
    <div class="cobar"><div class="grow"></div><button class="btn block" data-act="publish">发布活动</button></div></div>`;
}

function vMine() {
  const tools = [["map", "活动规划"], ["gift", "我的奖品"], ["ticket", "优惠券"], ["users", "邀请好友"], ["chat", "意见反馈"], ["idcard", "实名认证"], ["user", "常用出行人"], ["gear", "设置"]];
  const joinedList = myJoined.length ? myJoined.map((m) => mineRow(m, "已报名")).join("") : `<div class="mini-empty">还没有报名活动</div>`;
  const createdList = myCreated.length ? myCreated.map((m) => mineRow(m, "我发起")).join("") : `<div class="mini-empty">还没有发起活动，去发起一个吧</div>`;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">我的</div></div>
    <div class="scroll">
      <div class="profile"><span class="pav">${user ? "👤" : "?"}</span>
        <div class="pi"><div class="pn">${user ? "尾号" + user.phone.slice(-4) : "未登录"}</div><div class="ps">${user ? "已实名 · 出行无忧" : "登录后管理报名与活动"}</div></div>
        ${user ? "" : `<button class="loginbtn" data-act="dologin">微信登录</button>`}</div>
      <div class="msec">我的报名</div><div class="mlist">${joinedList}</div>
      <div class="msec">我发起的</div><div class="mlist">${createdList}</div>
      <div class="msec">我的工具</div>
      <div class="tools">${tools.map((t) => `<div class="tool"><span class="tic">${ic(t[0])}</span>${esc(t[1])}</div>`).join("")}</div>
    </div></div>`;
}
function mineRow(m, badge) {
  return `<div class="mrow" data-act="open" data-id="${m.id}"><img src="${esc(m.cover)}" alt=""/>
    <div class="mi"><div class="t">${esc(m.title)}</div><div class="m">${esc(m.date)} · ${esc(m.place)}</div></div>
    <span class="mbadge">${badge}</span></div>`;
}

const VIEWS = { home: vHome, list: vList, detail: vDetail, signup: vSignup, confirm: vConfirm, create: vCreate, mine: vMine };
function loginSheet() {
  return `<div class="mask" data-act="closelogin"></div>
    <div class="sheet"><div class="sh-grip"></div><div class="sh-t">登录后参与</div>
      <div class="sh-s">报名、发起活动需先用微信绑定的手机号登录</div>
      <button class="wxbtn" data-act="dologin"><span class="wxic"></span>微信一键登录（绑定手机号）</button>
      <div class="sh-x" data-act="closelogin">暂不登录</div></div>`;
}
function render() { screen.innerHTML = VIEWS[view]() + (loginOpen ? loginSheet() : ""); const s = screen.querySelector(".scroll"); if (s) s.scrollTop = 0; }
function go(v, d = "fwd") { view = v; dir = d; render(); }
function toast(msg) { const t = document.createElement("div"); t.textContent = msg; t.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.82);color:#fff;padding:11px 18px;border-radius:10px;font-size:14px;z-index:30;max-width:80%;text-align:center"; screen.appendChild(t); setTimeout(() => t.remove(), 1400); }
function requireLogin(cb) { if (user) { cb(); return; } pendingAfterLogin = cb; loginOpen = true; render(); }

/* ---------- 交互 ---------- */
screen.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act;
  if (a === "home") go("home", "back");
  else if (a === "tolist") go("list");
  else if (a === "filter") { filter = el.dataset.f; render(); }
  else if (a === "open") { curId = el.dataset.id; go("detail"); }
  else if (a === "backdetail") go("detail", "back");
  else if (a === "tosignup") { signupCount = 1; requireLogin(() => go("signup")); }
  else if (a === "cnt") { const m = remain(act(curId)); signupCount = Math.max(1, Math.min(m, signupCount + (+el.dataset.d))); render(); }
  else if (a === "submitsignup") submitSignup();
  else if (a === "tocreate") requireLogin(() => go("create"));
  else if (a === "publish") publish();
  else if (a === "tomine") go("mine");
  else if (a === "closelogin") { loginOpen = false; pendingAfterLogin = null; render(); }
  else if (a === "dologin") { user = { phone: "138****6688" }; loginOpen = false; const cb = pendingAfterLogin; pendingAfterLogin = null; render(); if (cb) cb(); }
});

function submitSignup() {
  const a = act(curId);
  const phone = (document.getElementById("suPhone").value || "").trim();
  const name = (document.getElementById("suName").value || "").trim();
  if (!name || !phone) { toast("请填写姓名和手机号"); return; }
  a.joined = Math.min(a.capacity, a.joined + signupCount);
  for (let i = 0; i < signupCount; i++) a.avatars.push(name[0] || "新");
  if (!myJoined.find((m) => m.id === a.id)) myJoined.unshift(a);
  go("confirm");
}
function publish() {
  const g = (id) => (document.getElementById(id).value || "").trim();
  const title = g("cvTitle"); if (!title) { toast("先给活动起个标题"); return; }
  const id = "new" + (++newSeq);
  const a = {
    id, cat: document.getElementById("cvCat").value || CFG.filters[1], title,
    cover: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=70",
    tags: ["我发起"], organizer: { name: "尾号" + user.phone.slice(-4), badge: "我", views: 1 },
    date: g("cvDate") || "待定", time: g("cvTime") || "待定", place: g("cvPlace") || "待定",
    distance: "0km", price: +g("cvPrice") || 0, capacity: +g("cvCap") || 10, joined: 1,
    avatars: ["我"], highlights: ["新发起的活动"], includes: ["详见简介"], desc: g("cvDesc") || "—",
  };
  CFG.activities.unshift(a); myCreated.unshift(a);
  toast("活动已发布，等人来上车 🚀");
  setTimeout(() => go("home", "back"), 800);
}

/* ---------- 社区切换 ---------- */
const CONFIGS = window.EVENT_CONFIGS;
const LABELS = { city: "同城社交", kids: "亲子活动", outdoor: "户外露营" };
const sw = document.getElementById("switcher");
let key = new URLSearchParams(location.search).get("c");
if (!CONFIGS[key]) key = "city";
sw.innerHTML = Object.keys(CONFIGS).map((k) => `<button data-k="${k}" class="${k === key ? "on" : ""}">${LABELS[k] || k}</button>`).join("");
sw.addEventListener("click", (e) => { const k = e.target.dataset.k; if (!k) return; key = k; sw.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k)); load(k); });

function load(k) {
  CFG = JSON.parse(JSON.stringify(CONFIGS[k]));   // 深拷贝：报名/发布会改数据，切换可重置
  document.documentElement.style.setProperty("--accent", CFG.theme.accent);
  filter = "全部"; curId = null; signupCount = 1; user = null; loginOpen = false; pendingAfterLogin = null; myJoined = []; myCreated = [];
  go("home");
}
load(key);
