/* 视觉系作品集小程序 · 可点击多页原型
 * home(作品卡堆·可滑) → work(杂志式详情·点赞/分享)
 * cats(风格类别) → cat(系列横滑) → work
 * mine(我的·微信登录) → fav(喜爱) / photos(写真) / studio(工作室名片) / scan(扫码)
 * 占位海报按每个作品的色调自动生成（SVG），交付时替换为真实成片。
 */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const screen = document.getElementById("screen");
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";
const fmt = (n) => n >= 10000 ? (n / 10000).toFixed(1) + "w" : String(n);

let CFG, view = "home", dir = "fwd";
let user = null, loginOpen = false, pendingAfterLogin = null;
let contactOpen = false, qrOpen = false;
let favs = new Set(), stackOrder = [], curWork = null, curCat = null, openFrom = "home", scanBack = "home";

const workById = (id) => CFG.works.find((w) => w.id === id);
const catById = (id) => CFG.cats.find((c) => c.id === id);
const worksOf = (cid) => CFG.works.filter((w) => w.cat === cid);

/* ---------- 占位海报生成（按作品色调，示意构图；交付时换成真实成片） ---------- */
function hash(s) { let h = 9; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 387420489); return h >>> 0; }
function art(w, W, H, v) {
  v = v || 0;
  const hs = hash(w.id + "·" + v);
  const R = (n) => ((hs >> (n * 2)) % 97) / 97;
  let blobs = "";
  for (let i = 0; i < 5; i++) {
    const bx = W * (0.12 + 0.76 * R(i)), by = H * (0.14 + 0.72 * R(i + 5)), br = W * (0.09 + 0.18 * R(i + 9));
    blobs += `<ellipse cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" rx="${br.toFixed(0)}" ry="${(br * 0.7).toFixed(0)}" fill="${w.ink}" opacity="${(0.05 + 0.06 * R(i + 3)).toFixed(2)}"/>`;
  }
  const m = (W * 0.055).toFixed(0);
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0.75" y2="1"><stop offset="0" stop-color="${w.c1}"/><stop offset="1" stop-color="${w.c2}"/></linearGradient><radialGradient id="r" cx="0.32" cy="0.2" r="0.9"><stop offset="0" stop-color="#ffffff" stop-opacity="0.26"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#r)"/>${blobs}<rect x="${m}" y="${m}" width="${(W - m * 2).toFixed(0)}" height="${(H - m * 2).toFixed(0)}" fill="none" stroke="${w.ink}" stroke-opacity="0.5" stroke-width="1.3"/><text x="50%" y="${(H * 0.17).toFixed(0)}" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="${(W * 0.12).toFixed(0)}" fill="${w.ink}" opacity="0.92">${esc(w.code)}</text><text x="50%" y="${(H * 0.92).toFixed(0)}" text-anchor="middle" font-family="Arial" letter-spacing="${(W * 0.018).toFixed(1)}" font-size="${(W * 0.042).toFixed(0)}" fill="${w.ink}" opacity="0.85">${esc(CFG.logo)}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(s);
}
function qrSvg() {
  let cells = "";
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    if ((x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)) continue;
    if (hash("qr" + x + "_" + y + CFG.brand) % 7 < 3) cells += `<rect x="${x * 8}" y="${y * 8}" width="8" height="8"/>`;
  }
  const eye = (px, py) => `<rect x="${px + 4}" y="${py + 4}" width="48" height="48" fill="none" stroke="#151515" stroke-width="9"/><rect x="${px + 20}" y="${py + 20}" width="16" height="16" fill="#151515"/>`;
  return `<svg class="qr" viewBox="0 0 168 168"><rect width="168" height="168" fill="#fff"/><g fill="#151515">${cells}</g>${eye(0, 0)}${eye(112, 0)}${eye(0, 112)}</svg>`;
}
function mapSvg() {
  return `<svg class="map" viewBox="0 0 300 130"><rect width="300" height="130" fill="#e9e6df"/>
    <path d="M0 40 H300 M0 96 H300 M70 0 V130 M188 0 V130 M252 20 L300 60" stroke="#fff" stroke-width="9" fill="none"/>
    <rect x="86" y="52" width="40" height="30" fill="#dcd8ce"/><rect x="140" y="50" width="34" height="34" fill="#d5d1c6"/>
    <rect x="12" y="52" width="42" height="32" fill="#dcd8ce"/><rect x="200" y="48" width="40" height="36" fill="#d5d1c6"/>
    <circle cx="157" cy="67" r="12" fill="var(--accent)" opacity="0.25"/>
    <path d="M157 52c6 0 10 4.4 10 9.8 0 6.8-10 15.2-10 15.2s-10-8.4-10-15.2c0-5.4 4-9.8 10-9.8z" fill="var(--accent)"/><circle cx="157" cy="62" r="3.4" fill="#fff"/></svg>`;
}

/* ---------- 组件 ---------- */
function tabbar(on) {
  const t = (k, act) => `<div class="t ${on === k ? "on" : ""}" data-act="${act}"><span class="ic">${ic(k === "home" ? "album" : k === "cats" ? "layers" : "user")}</span></div>`;
  return `<div class="tabbar">${t("home", "home")}${t("cats", "tocats")}${t("mine", "tomine")}</div>`;
}
function statusbar() { return `<div class="statusbar"><span>9:41</span><span>···· 5G <span class="bat"></span></span></div>`; }

/* ---------- 视图 ---------- */
function vHome() {
  const cards = stackOrder.slice(0, 3).map((wi, pos) => {
    const w = CFG.works[wi];
    return `<div class="scard p${pos}" data-id="${w.id}" style="background-image:url('${art(w, 300, 400)}')"></div>`;
  }).join("");
  const dots = CFG.works.map((_, i) => `<span class="${i === stackOrder[0] ? "on" : ""}"></span>`).join("");
  return `<div class="page ${dir}">
    <div class="scroll noscroll">
      ${statusbar()}
      <div class="brandbar"><span class="wordmark">${esc(CFG.logo)}<i>·</i></span><span class="bico" data-act="toscan">${ic("scan")}</span></div>
      <div class="searchpill" data-act="search">${ic("search")}<span>${esc(CFG.searchHint)}</span></div>
      <div class="stackwrap"><div class="stack">${cards}</div></div>
      <div class="dots">${dots}</div>
      <div class="swipehint">左右滑动切换 · 点击查看系列</div>
    </div>
    ${tabbar("home")}</div>`;
}

function vCats() {
  const cells = CFG.cats.map((c) => {
    const ws = worksOf(c.id);
    return ws.slice(0, 3).map((w, i) => `<div class="ccell" data-act="tocat" data-id="${c.id}">
      <img src="${art(w, 150, 210, i)}" alt=""/>${i === 0 ? `<span class="cname">${esc(c.name)}</span>` : ""}</div>`).join("");
  }).join("");
  return `<div class="page ${dir}">
    <div class="scroll">
      ${statusbar()}
      <div class="brandbar"><span class="bico ghost">${ic("layers")}</span><span class="ptitle">風 格 類 別</span><span class="bico" data-act="toscan">${ic("scan")}</span></div>
      <div class="cgrid">${cells}</div>
    </div>
    ${tabbar("cats")}</div>`;
}

function vCat() {
  const c = catById(curCat);
  const ws = worksOf(c.id);
  const cards = ws.map((w) => `<div class="hcard" data-act="openwork" data-id="${w.id}" data-from="cat">
    <img src="${art(w, 260, 430)}" alt=""/><span class="htt">${esc(w.title)}</span></div>`).join("");
  return `<div class="page ${dir}">
    <div class="scroll noscroll">
      ${statusbar()}
      <div class="brandbar"><span class="bico" data-act="tocats">${ic("back")}</span><span class="ptitle">${esc(c.name).split("").join(" ")}</span><span class="bico" data-act="toscan">${ic("scan")}</span></div>
      <div class="hs">${cards}</div>
      <div class="likespill">
        <span class="lavs"><i style="background:#c9a96a"></i><i style="background:#8fa38d"></i><i style="background:#a3849c"></i></span>
        近期有 300+ 用户点赞过
        <b>${ic("eye")}${esc(c.stats.v)}+</b><b class="hred">${ic("heart")}${esc(c.stats.l)}+</b><b>${ic("chat")}${esc(c.stats.c)}+</b>
      </div>
    </div>
    ${tabbar("cats")}</div>`;
}

function vWork() {
  const w = workById(curWork);
  const liked = favs.has(w.id);
  const paras = w.paras.map((p) => `<div class="wpar rise"><img src="${art(w, 300, 380, p.v)}" alt=""/><p>${esc(p.cap)}</p></div>`).join("");
  return `<div class="page ${dir} workpage" style="--w1:${esc(w.c1)};--w2:${esc(w.c2)};--wink:${esc(w.ink)}">
    <div class="scroll">
      <div class="whero"><img class="wcover rise" src="${art(w, 300, 400)}" alt=""/>
        <div class="wen">${esc(w.en)}</div></div>
      <div class="wtitleblk">
        <div class="wcode">${esc(w.code)}</div>
        <div class="wtt">${esc(w.title)}</div>
        <div class="wacts">
          <span class="wact ${liked ? "liked pop" : ""}" data-act="like">${liked ? ic("heartf") : ic("heart")}</span>
          <span class="wact" data-act="share">${ic("share")}</span>
        </div>
        <div class="wlikes">${fmt(w.likes + (liked ? 1 : 0))} 人喜欢这组</div>
      </div>
      <div class="warticle">${paras}
        <div class="wend">
          <p>感谢您的耐心观看<br>如果您有拍写真的想法<br>可先自行挑选您想拍的风格<br>提前一至两周预约拍摄档期</p>
          <button class="wcta" data-act="contact">欢迎联系${esc(CFG.studio.short)}工作室 ${ic("wechat")}</button>
        </div>
      </div>
    </div>
    <div class="wbar"><span class="wnav" data-act="backwork">${ic("back")}</span><span class="wnav" data-act="share">${ic("share")}</span></div></div>`;
}

function vMine() {
  const acts = [["heart", "喜爱", "tofav"], ["camera", "写真", "tophotos"], ["video", "视频", "soon"], ["gear", "设置", "soon"]];
  return `<div class="page ${dir}">
    <div class="scroll">
      ${statusbar()}
      <div class="brandbar"><span class="bico" data-act="home">${ic("close")}</span><span></span><span class="bico" data-act="toscan">${ic("scan")}</span></div>
      <div class="profcard" data-act="${user ? "" : "wantlogin"}">
        <span class="pav">${user ? "👤" : "🐥"}</span>
        <div class="pz"><div class="pn">${user ? "微信用户 · 尾号" + user.phone.slice(-4) : "注册 / 登陆 >"}</div>
          <div class="pid">${user ? "已绑定手机号" : "1 7 6 8 5 8 7 x x x"}</div></div>
      </div>
      <div class="minesec">我 的 信 息</div>
      <div class="minegrid">${acts.map((a) => `<div class="mact" data-act="${a[2]}"><span class="mic">${ic(a[0])}</span>${a[1]}</div>`).join("")}</div>
      <div class="studiocard" data-act="tostudio">
        <div class="sz"><div class="slogo">${esc(CFG.logo)}<i>·</i></div><div class="sname">${esc(CFG.studio.name)}</div></div>
        <div class="sbtns"><span>${ic("home")}<i>工作室信息</i></span><span>${ic("pin")}<i>地点位置</i></span></div>
      </div>
    </div>
    ${tabbar("mine")}</div>`;
}

function gridPage(title, icon, works, emptyTip) {
  const imgs = works.length
    ? works.map((x) => `<img class="gph" data-act="openwork" data-id="${x.w.id}" data-from="mineback" src="${art(x.w, 150, 200, x.v)}" alt=""/>`).join("")
    : `<div class="gempty">${emptyTip}</div>`;
  return `<div class="page ${dir}">
    <div class="scroll">
      ${statusbar()}
      <div class="brandbar"><span class="bico" data-act="tomine">${ic("close")}</span><span></span><span class="bico ghost">${ic(icon)}<i class="blab">${title}</i></span></div>
      <div class="pgrid">${imgs}</div>
    </div>
    ${tabbar("mine")}</div>`;
}
function vFav() { return gridPage("喜爱", "heart", [...favs].map((id) => ({ w: workById(id), v: 0 })).filter((x) => x.w), "还没有喜爱的作品，去详情页点一颗 ❤ 吧"); }
function vPhotos() { const a = []; CFG.works.forEach((w) => { a.push({ w, v: 0 }); a.push({ w, v: 2 }); }); return gridPage("写真", "camera", a, ""); }

function vStudio() {
  const s = CFG.studio;
  return `<div class="page ${dir}">
    <div class="scroll">
      ${statusbar()}
      <div class="brandbar"><span class="bico" data-act="tomine">${ic("close")}</span><span></span><span class="bico" data-act="toscan">${ic("scan")}</span></div>
      <div class="stucard rise">
        <div class="stulogo">${esc(CFG.logo)}<i>·</i></div>
        <div class="stuname">${esc(s.name)}</div>
        <div class="stutag">工作室信息</div>
        <div class="stusince">${esc(s.since)}</div>
        <div class="stuintro">${s.intro.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
        <div class="stuaddr">${esc(s.addr)}</div>
        <div class="sturow">
          <span class="stubtn" data-act="phone">${ic("phone")}<i>电话</i></span>
          ${mapSvg()}
          <span class="stubtn" data-act="showqr">${ic("wechat")}<i>官方微信</i></span>
        </div>
        <span class="stuhome" data-act="home">${ic("home")}</span>
      </div>
    </div>
    ${tabbar("mine")}</div>`;
}

function vScan() {
  return `<div class="page ${dir} scanpage">
    <div class="scroll noscroll">
      <div class="brandbar"><span class="bico" data-act="scanback">${ic("back")}</span><span class="ptitle dim">扫描二维码</span><span></span></div>
      <div class="scanbox"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><span class="scanline"></span></div>
      <div class="scantip">将客片二维码放入框内，自动识别云相册（演示）</div>
      <div class="scanlogo">${esc(CFG.logo)}<i>·</i></div>
    </div></div>`;
}

const VIEWS = { home: vHome, cats: vCats, cat: vCat, work: vWork, mine: vMine, fav: vFav, photos: vPhotos, studio: vStudio, scan: vScan };

/* ---------- 浮层 ---------- */
function loginSheet() {
  return `<div class="mask" data-act="closelogin"></div>
    <div class="sheet"><div class="sh-grip"></div><div class="sh-t">登录 ${esc(CFG.brand)}</div>
      <div class="sh-s">登录后可收藏作品、查看云相册与预约档期</div>
      <button class="wxbtn" data-act="dologin"><span class="wxic"></span>微信一键登录（绑定手机号）</button>
      <div class="sh-x" data-act="closelogin">暂不登录</div></div>`;
}
function contactSheet() {
  return `<div class="mask" data-act="closecontact"></div>
    <div class="sheet left"><div class="sh-cap">选 择 资 讯 方 式</div>
      <div class="crow" data-act="showqr">${ic("wechat")}<span>添加工作室官方微信</span><b>›</b></div>
      <div class="crow" data-act="phone">${ic("phone")}<span>电话资讯</span><b>›</b></div>
      <div class="crow dim" data-act="closecontact">${ic("close")}<span>取消</span></div></div>`;
}
function qrModal() {
  return `<div class="mask deep" data-act="closeqr"></div>
    <div class="qcard pop"><span class="qx" data-act="closeqr">${ic("close")}</span>
      <div class="qhead"><i class="qdot"></i>${esc(CFG.studio.name)}</div>
      <div class="qtt">长 按 添 加 微 信</div>
      ${qrSvg()}
      <div class="qid">工作室官方微信：${esc(CFG.studio.wechat)}</div></div>`;
}

function render() {
  screen.innerHTML = VIEWS[view]() + (contactOpen ? contactSheet() : "") + (loginOpen ? loginSheet() : "") + (qrOpen ? qrModal() : "");
  const s = screen.querySelector(".scroll"); if (s) s.scrollTop = 0;
}
function go(v, d = "fwd") { view = v; dir = d; render(); }
function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; screen.appendChild(t); setTimeout(() => t.remove(), 1500); }
function requireLogin(cb) { if (user) { cb(); return; } pendingAfterLogin = cb; loginOpen = true; render(); }
function openWork(id, from) { curWork = id; openFrom = from; go("work"); }

/* ---------- 卡堆滑动（首页） ---------- */
let dragSt = null;
screen.addEventListener("pointerdown", (e) => {
  const el = e.target.closest(".scard.p0"); if (!el) return;
  dragSt = { x: e.clientX, el, dx: 0 };
  el.style.transition = "none";
});
screen.addEventListener("pointermove", (e) => {
  if (!dragSt) return;
  dragSt.dx = e.clientX - dragSt.x;
  dragSt.el.style.transform = `translate(calc(-50% + ${dragSt.dx}px),-50%) rotate(${(dragSt.dx / 16).toFixed(1)}deg)`;
});
window.addEventListener("pointerup", (e) => {
  if (!dragSt) return;
  const { el, dx } = dragSt; dragSt = null;
  el.style.transition = "";
  if (Math.abs(dx) > 70) {
    el.style.transform = `translate(calc(-50% + ${dx > 0 ? 520 : -520}px),-50%) rotate(${dx > 0 ? 26 : -26}deg)`;
    el.style.opacity = "0";
    setTimeout(() => { stackOrder.push(stackOrder.shift()); render(); }, 300);
  } else if (Math.abs(dx) < 8) {
    openWork(el.dataset.id, "home");
  } else {
    el.style.transform = "";
  }
});

/* ---------- 交互 ---------- */
screen.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act; if (!a) return;
  if (a === "home") go("home", "back");
  else if (a === "tocats") go("cats", view === "cat" ? "back" : "fwd");
  else if (a === "tocat") { curCat = el.dataset.id; go("cat"); }
  else if (a === "openwork") openWork(el.dataset.id, el.dataset.from || "home");
  else if (a === "backwork") go(openFrom === "cat" ? "cat" : openFrom === "mineback" ? "mine" : "home", "back");
  else if (a === "tomine") go("mine", "back");
  else if (a === "tofav") go("fav");
  else if (a === "tophotos") go("photos");
  else if (a === "tostudio") go("studio");
  else if (a === "toscan") { scanBack = view; go("scan"); }
  else if (a === "scanback") go(scanBack, "back");
  else if (a === "search") toast("演示 · 输入关键词搜索作品与风格");
  else if (a === "soon") toast("演示 · 该栏目交付时接入");
  else if (a === "like") requireLogin(() => { const id = curWork; favs.has(id) ? favs.delete(id) : favs.add(id); render(); });
  else if (a === "share") toast("演示 · 已生成分享海报");
  else if (a === "contact") { contactOpen = true; render(); }
  else if (a === "closecontact") { contactOpen = false; render(); }
  else if (a === "showqr") { contactOpen = false; qrOpen = true; render(); }
  else if (a === "closeqr") { qrOpen = false; render(); }
  else if (a === "phone") { contactOpen = false; render(); toast(`演示 · 拨打 ${CFG.studio.phone}`); }
  else if (a === "wantlogin") { loginOpen = true; render(); }
  else if (a === "closelogin") { loginOpen = false; pendingAfterLogin = null; render(); }
  else if (a === "dologin") { user = { phone: "176****8588" }; loginOpen = false; const cb = pendingAfterLogin; pendingAfterLogin = null; render(); if (cb) cb(); }
});

/* ---------- 场景切换 ---------- */
const CONFIGS = window.PS_CONFIGS;
const LABELS = { sanjing: "人像摄影 · 暗调", wedding: "婚纱旅拍 · 亮调" };
const sw = document.getElementById("switcher");
let key = new URLSearchParams(location.search).get("c");
if (!CONFIGS[key]) key = "sanjing";
sw.innerHTML = Object.keys(CONFIGS).map((k) => `<button data-k="${k}" class="${k === key ? "on" : ""}">${LABELS[k] || k}</button>`).join("");
sw.addEventListener("click", (e) => { const k = e.target.dataset.k; if (!k) return; key = k; sw.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k)); load(k); });

function load(k) {
  CFG = JSON.parse(JSON.stringify(CONFIGS[k]));   // 深拷贝：收藏/登录会改状态，切换可重置
  document.documentElement.style.setProperty("--accent", CFG.theme.accent);
  screen.classList.toggle("light", CFG.theme.mode === "light");
  view = "home"; dir = "fwd"; user = null; loginOpen = false; pendingAfterLogin = null;
  contactOpen = false; qrOpen = false; favs = new Set();
  stackOrder = CFG.works.map((_, i) => i); curWork = null; curCat = null; openFrom = "home"; scanBack = "home";
  render();
}
load(key);
