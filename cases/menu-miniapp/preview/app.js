/* 餐饮 / 菜单 / 点餐 通用小程序 · 可点击多页原型
 * home(菜单) → detail(菜品+评价) → comment(写评价, 需手机号登录)
 *            → feedback(给商家提建议)
 *   ordering=true 时：detail 加购 → cart → checkout → confirm（无支付）
 */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const screen = document.getElementById("screen");
const yuan = (n) => "¥" + (Math.round(n * 100) / 100);
const WD = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";

let CFG, view = "home", dir = "fwd", cat = "all";
let curId = null, sel = {};                 // detail 选中的规格
let cart = [];                              // [{id, qty, spec, sel}]
let lastOrder = null;
let user = null;                            // 微信绑定手机号后的登录态
let pendingAfterLogin = null, loginOpen = false;
let dates = [], dateIdx = 0;                // 食堂：日期选择
let commentStars = 5, fbTags = new Set();

const dish = (id) => CFG.dishes.find((p) => p.id === id);
const cartCount = () => cart.reduce((n, c) => n + c.qty, 0);
const specKey = (s) => JSON.stringify(s || {});
const specText = (s) => Object.values(s || {}).join(" · ");
const selected = () => cart.filter((c) => c.sel);

/* 规格里 "大杯 +3" 这类带加价的，解析出价差 */
const extra = (v) => { const m = String(v).match(/\+(\d+(\.\d+)?)/); return m ? +m[1] : 0; };
const linePrice = (c) => dish(c.id).price + Object.values(c.spec || {}).reduce((n, v) => n + extra(v), 0);
const selTotal = () => selected().reduce((n, c) => n + linePrice(c) * c.qty, 0);

const stars = (n) => "★★★★★☆☆☆☆☆".slice(5 - Math.round(n), 10 - Math.round(n));
const todayMD = () => { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

/* 食堂：按选中日期(周几)过滤当天供应的菜 */
function buildDates() {
  dates = [];
  const base = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const js = d.getDay(), wd = js === 0 ? 7 : js;          // 1=周一 … 7=周日
    dates.push({ wlabel: i === 0 ? "今天" : i === 1 ? "明天" : WD[js], md: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, wd });
  }
}
function dishesForDay() {
  if (!CFG.dateMode) return CFG.dishes;
  const wd = dates[dateIdx].wd;
  return CFG.dishes.filter((p) => !p.days || p.days.includes(wd));
}

/* ---------- 视图 ---------- */
function badge(n) { return n > 0 ? `<span class="badge">${n > 99 ? "99+" : n}</span>` : ""; }
function loginPill() { return user ? `尾号 ${user.phone.slice(-4)}` : "未登录"; }

function vHome() {
  const list = dishesForDay().filter((p) => cat === "all" || p.cat === cat);
  const chips = CFG.categories.map((c) => `<div class="chip ${c.id === cat ? "on" : ""}" data-act="chip" data-cat="${c.id}">${esc(c.name)}</div>`).join("");
  const dateStrip = CFG.dateMode ? `<div class="datestrip">${dates.map((d, i) => `
    <div class="dcell ${i === dateIdx ? "on" : ""}" data-act="date" data-i="${i}"><div class="dw">${esc(d.wlabel)}</div><div class="dm">${esc(d.md)}</div></div>`).join("")}</div>` : "";
  const rows = list.map((p) => `
    <div class="drow" data-act="open" data-id="${p.id}">
      <img src="${esc(p.thumb)}" alt="" loading="lazy" />
      <div class="di">
        <div class="dn">${esc(p.name)}</div>
        <div class="dmeta">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}<span class="rate">★ ${p.rating} · ${p.reviews.length}条评价</span></div>
        <div class="db"><span class="price p">${yuan(p.price)}</span><span class="unit">/${esc(p.unit || "份")}</span>
          ${CFG.ordering ? `<button class="addbtn" data-act="quickadd" data-id="${p.id}">＋</button>` : `<span class="cmt" data-act="open" data-id="${p.id}">评价 ›</span>`}
        </div>
      </div>
    </div>`).join("");
  const empty = `<div class="empty"><div class="e">${ic("utensils")}</div>这一天暂无该分类菜品</div>`;
  return `<div class="page ${dir}">
    <div class="scroll">
      <div class="statusbar"><span>11:20</span><span>···· 5G <span class="bat"></span></span></div>
      <div class="head"><div><div class="brand">${esc(CFG.brand)}</div><div class="sub">${esc(CFG.sub)}</div></div>
        <div class="me" data-act="tologin">${user ? loginPill() : "登录"}</div></div>
      ${CFG.notice ? `<div class="notice"><span class="nic">${ic("bell")}</span>${esc(CFG.notice)}</div>` : ""}
      ${dateStrip}
      <div class="chips">${chips}</div>
      <div class="dlist">${list.length ? rows : empty}</div>
      <div class="fbentry" data-act="tofeedback"><span class="fb-ic">${ic("edit")}</span><div class="fb-tx">${esc(CFG.feedback.title)}</div><span class="arr">›</span></div>
    </div>
    ${CFG.ordering && cart.length ? `<div class="cartbar" data-act="tocart"><span class="cb-ic">${ic("cart")}${badge(cartCount())}</span><span class="cb-t">合计 <b class="price p">${yuan(selTotal())}</b></span><span class="cb-go">去结算</span></div>` : ""}
    <div class="tabbar">
      <div class="t on"><span class="ic">${ic("utensils")}</span>${CFG.dateMode ? "菜单" : "点餐"}</div>
      <div class="t" data-act="tofeedback"><span class="ic">${ic("edit")}</span>反馈</div>
      ${CFG.ordering ? `<div class="t" data-act="tocart"><span class="ic">${ic("cart")}</span>购物车${badge(cartCount())}</div>` : ""}
      <div class="t" data-act="tologin"><span class="ic">${ic("user")}</span>我的</div>
    </div></div>`;
}

function vDetail() {
  const p = dish(curId);
  const specs = (p.specs || []).map((o) => `
    <div class="opt"><div class="ol">${esc(o.label)}</div><div class="ov">
      ${o.values.map((v) => `<div class="o ${sel[o.label] === v ? "on" : ""}" data-act="spec" data-label="${esc(o.label)}" data-val="${esc(v)}">${esc(v)}</div>`).join("")}
    </div></div>`).join("");
  const reviews = p.reviews.length ? p.reviews.map((r) => `
    <div class="rv"><div class="rvh"><span class="rvn">${esc(r.name)}</span><span class="rvs">${stars(r.stars)}</span><span class="rvd">${esc(r.date)}</span></div>
      <div class="rvt">${esc(r.text)}</div></div>`).join("") : `<div class="noreview">还没有评价，来做第一个吧～</div>`;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">菜品详情</div></div>
    <div class="scroll">
      <img class="dimg" src="${esc(p.thumb)}" alt="" />
      <div class="dinfo">
        <div class="dn2">${esc(p.name)}</div>
        <div class="dp"><span class="price p">${yuan(p.price)}</span><span class="unit">/${esc(p.unit || "份")}</span><span class="rate2">★ ${p.rating}</span></div>
        <div class="dtags">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="ddesc">${esc(p.desc || "")}</div>
      </div>
      ${specs}
      <div class="rvbox">
        <div class="rvhd"><span>用户评价（${p.reviews.length}）</span><span class="writelink" data-act="writereview">写评价 ›</span></div>
        ${reviews}
      </div>
    </div>
    <div class="actionbar">
      <div class="icobtn" data-act="writereview"><span class="ic">${ic("edit")}</span>评价</div>
      ${CFG.ordering ? `<div class="icobtn" data-act="tocart"><span class="ic">${ic("cart")}</span>购物车${badge(cartCount())}</div><div class="grow"></div><button class="btn" data-act="add">加入购物车</button>`
      : `<div class="grow"></div><button class="btn" data-act="writereview">写评价</button>`}
    </div></div>`;
}

function vComment() {
  const p = dish(curId);
  const picker = [1, 2, 3, 4, 5].map((n) => `<span class="star ${n <= commentStars ? "on" : ""}" data-act="setstar" data-n="${n}">★</span>`).join("");
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="backdetail">‹</div><div class="ttl">写评价</div></div>
    <div class="scroll">
      <div class="cmtdish"><img src="${esc(p.thumb)}" alt=""/><div class="t">${esc(p.name)}</div></div>
      <div class="cmtcard">
        <div class="cl">打分</div><div class="starpick">${picker}<span class="starnum">${commentStars}.0</span></div>
      </div>
      <div class="cmtcard"><textarea id="rvText" class="rvinput" placeholder="说说这道菜的口味、分量、性价比…（已用 ${user ? "尾号 " + user.phone.slice(-4) + " 手机号" : "微信手机号"}登录）"></textarea></div>
      <div class="loginnote">已绑定手机号，评价将以「${user ? "尾号 " + user.phone.slice(-4) : ""}」匿名展示</div>
    </div>
    <div class="cobar"><div class="grow"></div><button class="btn block" data-act="submitreview">提交评价</button></div></div>`;
}

function vFeedback() {
  const f = CFG.feedback;
  const tags = f.tags.map((t) => `<div class="ftag ${fbTags.has(t) ? "on" : ""}" data-act="fbtag" data-t="${esc(t)}">${esc(t)}</div>`).join("");
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">${esc(f.title)}</div></div>
    <div class="scroll">
      <div class="fbhero">你的每条建议，商家都会看到 🙌</div>
      <div class="cmtcard"><div class="cl">快速选择</div><div class="ftags">${tags}</div></div>
      <div class="cmtcard"><textarea id="fbText" class="rvinput" placeholder="${esc(f.placeholder)}"></textarea></div>
      <div class="cmtcard"><div class="cl">联系方式（选填）</div><input id="fbContact" class="fbline" placeholder="留个微信/手机号，方便回复你" /></div>
    </div>
    <div class="cobar"><div class="grow"></div><button class="btn block" data-act="submitfb">提交建议</button></div></div>`;
}

function vCart() {
  const allSel = cart.length && cart.every((c) => c.sel);
  const rows = cart.map((c, i) => {
    const p = dish(c.id);
    return `<div class="crow">
      <div class="ck ${c.sel ? "on" : ""}" data-act="tsel" data-i="${i}">${c.sel ? "✓" : ""}</div>
      <img src="${esc(p.thumb)}" alt=""/>
      <div class="ci"><div class="t">${esc(p.name)}</div>
        ${specText(c.spec) ? `<span class="sp">${esc(specText(c.spec))}</span>` : ""}
        <div class="b"><span class="price p">${yuan(linePrice(c))}</span>
          <div class="stepper"><button data-act="qty" data-i="${i}" data-d="-1">−</button><span class="v">${c.qty}</span><button data-act="qty" data-i="${i}" data-d="1">+</button></div>
        </div></div>
      <div class="ck" data-act="del" data-i="${i}" style="border:none;color:var(--muted);align-self:flex-start">✕</div>
    </div>`;
  }).join("");
  const body = cart.length ? rows : `<div class="empty"><div class="e">${ic("cart")}</div>购物车还是空的<br>回去点几个吧</div>`;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">购物车</div></div>
    <div class="scroll">${body}</div>
    ${cart.length ? `<div class="cartfoot">
      <div class="all" data-act="tall"><span class="ck ${allSel ? "on" : ""}">${allSel ? "✓" : ""}</span>全选</div>
      <div class="tot">合计 <span class="price p">${yuan(selTotal())}</span></div>
      <button class="btn" data-act="checkout">去结算(${selected().reduce((n, c) => n + c.qty, 0)})</button>
    </div>` : ""}</div>`;
}

function vCheckout() {
  const items = selected();
  const list = items.map((c) => { const p = dish(c.id); return `
    <div class="coli"><img src="${esc(p.thumb)}" alt=""/>
      <div style="flex:1;min-width:0"><div class="t">${esc(p.name)}</div><div class="m">${esc(specText(c.spec))} ×${c.qty}</div></div>
      <div class="price p">${yuan(linePrice(c) * c.qty)}</div></div>`; }).join("");
  const head = CFG.needAddress
    ? `<div class="addr" data-act="noop"><span class="pin">${ic("pin")}</span><div class="ai"><div class="n">张同学　${user ? user.phone : "138****0000"}</div><div class="d">阳光大学 3 号宿舍楼 502</div></div><span class="arr">›</span></div>`
    : `<div class="addr" data-act="noop"><span class="pin">${ic("pin")}</span><div class="ai"><div class="n">到店自取　${user ? user.phone : "未登录"}</div><div class="d">${esc(CFG.brand)} · 取餐号到店出示</div></div><span class="arr">›</span></div>`;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="cart">‹</div><div class="ttl">确认订单</div></div>
    <div class="scroll">
      ${head}
      <div class="block-card">${list}</div>
      <div class="block-card" style="padding:4px 0">
        <div class="sumrow"><span>商品金额</span><span>${yuan(selTotal())}</span></div>
        <div class="sumrow"><span>${CFG.needAddress ? "配送费" : "打包费"}</span><span>${CFG.needAddress ? "¥3" : "免"}</span></div>
        <div class="sumrow big"><span>合计</span><span class="price p">${yuan(selTotal() + (CFG.needAddress ? 3 : 0))}</span></div>
      </div>
      <div class="paytip">演示版本：提交即下单，<b>不接微信支付</b></div>
    </div>
    <div class="cobar"><div class="tot" style="margin-left:0">应付 <span class="price p" style="font-size:20px">${yuan(selTotal() + (CFG.needAddress ? 3 : 0))}</span></div>
      <div class="grow"></div><button class="btn" data-act="pay">提交订单</button></div></div>`;
}

function vConfirm() {
  return `<div class="page ${dir}">
    <div class="statusbar"><span>11:20</span><span>···· 5G <span class="bat"></span></span></div>
    <div class="confirm"><div class="ok">✓</div><h2>下单成功</h2>
      <div class="tip">订单金额 ${yuan(lastOrder ? lastOrder.total : 0)}（演示，无需支付）<br>${CFG.needAddress ? "骑手将尽快为你配送" : "请凭手机号到店取餐"}</div>
      <div class="acts"><div class="gbtn" data-act="orders">查看订单</div><div class="gbtn" data-act="home">返回首页</div></div>
    </div></div>`;
}

function loginSheet() {
  return `<div class="mask" data-act="closelogin"></div>
    <div class="sheet">
      <div class="sh-grip"></div>
      <div class="sh-t">登录后参与</div>
      <div class="sh-s">评价、下单需先用微信绑定的手机号登录</div>
      <button class="wxbtn" data-act="dologin"><span class="wxic"></span>微信一键登录（绑定手机号）</button>
      <div class="sh-x" data-act="closelogin">暂不登录</div>
    </div>`;
}

const VIEWS = { home: vHome, detail: vDetail, comment: vComment, feedback: vFeedback, cart: vCart, checkout: vCheckout, confirm: vConfirm };
function render() {
  screen.innerHTML = VIEWS[view]() + (loginOpen ? loginSheet() : "");
  const s = screen.querySelector(".scroll"); if (s) s.scrollTop = 0;
}
function go(v, d = "fwd") { view = v; dir = d; render(); }

function toast(msg) {
  const t = document.createElement("div"); t.textContent = msg;
  t.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.8);color:#fff;padding:10px 18px;border-radius:10px;font-size:14px;z-index:30;max-width:80%;text-align:center";
  screen.appendChild(t); setTimeout(() => t.remove(), 1400);
}

/* 登录拦截：未登录则弹微信手机号登录，登录后执行 cb */
function requireLogin(cb) { if (user) { cb(); return; } pendingAfterLogin = cb; loginOpen = true; render(); }

/* ---------- 交互 ---------- */
screen.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act, i = +el.dataset.i;
  if (a === "chip") { cat = el.dataset.cat; render(); }
  else if (a === "date") { dateIdx = i; cat = "all"; render(); }
  else if (a === "open") { curId = el.dataset.id; sel = {}; (dish(curId).specs || []).forEach((o) => sel[o.label] = o.values[0]); go("detail"); }
  else if (a === "spec") { sel[el.dataset.label] = el.dataset.val; render(); }
  else if (a === "home") go("home", "back");
  else if (a === "backdetail") go("detail", "back");
  else if (a === "quickadd") {
    const p = dish(el.dataset.id);
    if (p.specs && p.specs.length) { curId = p.id; sel = {}; p.specs.forEach((o) => sel[o.label] = o.values[0]); go("detail"); return; }
    addToCart(p.id, {}); toast("已加入购物车"); render();
  }
  else if (a === "add") { addToCart(curId, Object.assign({}, sel)); toast("已加入购物车"); render(); }
  else if (a === "tocart") go("cart");
  else if (a === "cart") go("cart", "back");
  else if (a === "tsel") { cart[i].sel = !cart[i].sel; render(); }
  else if (a === "tall") { const all = cart.every((c) => c.sel); cart.forEach((c) => c.sel = !all); render(); }
  else if (a === "qty") { cart[i].qty = Math.max(1, cart[i].qty + (+el.dataset.d)); render(); }
  else if (a === "del") { cart.splice(i, 1); render(); }
  else if (a === "checkout") { if (!selected().length) { toast("请选择商品"); return; } go("checkout"); }
  else if (a === "pay") requireLogin(doPay);
  else if (a === "orders") toast("我的订单（演示）");
  // 评价（需登录）
  else if (a === "writereview") requireLogin(() => { commentStars = 5; go("comment"); });
  else if (a === "setstar") { commentStars = +el.dataset.n; render(); }
  else if (a === "submitreview") submitReview();
  // 反馈
  else if (a === "tofeedback") { fbTags = new Set(); go("feedback"); }
  else if (a === "fbtag") { const t = el.dataset.t; fbTags.has(t) ? fbTags.delete(t) : fbTags.add(t); render(); }
  else if (a === "submitfb") { toast("感谢反馈，已提交给商家 🙌"); setTimeout(() => go("home", "back"), 700); }
  // 登录
  else if (a === "tologin") { if (user) { toast("已登录：" + user.phone); } else requireLogin(() => toast("登录成功")); }
  else if (a === "dologin") { user = { phone: "138****6688" }; loginOpen = false; const cb = pendingAfterLogin; pendingAfterLogin = null; render(); if (cb) cb(); }
  else if (a === "closelogin") { loginOpen = false; pendingAfterLogin = null; render(); }
});

function addToCart(id, spec) {
  const key = specKey(spec);
  const line = cart.find((c) => c.id === id && specKey(c.spec) === key);
  if (line) line.qty++; else cart.push({ id, qty: 1, spec, sel: true });
}
function doPay() {
  lastOrder = { items: selected().slice(), total: selTotal() + (CFG.needAddress ? 3 : 0) };
  cart = cart.filter((c) => !c.sel);
  go("confirm");
}
function submitReview() {
  const txt = (document.getElementById("rvText").value || "").trim();
  if (!txt) { toast("写一句评价再提交吧"); return; }
  dish(curId).reviews.unshift({ name: "尾号" + user.phone.slice(-4), stars: commentStars, text: txt, date: todayMD() });
  toast("评价已发布，谢谢～");
  go("detail", "back");
}

/* ---------- 场景切换 ---------- */
const CONFIGS = window.MENU_CONFIGS;
const LABELS = { canteen: "高校食堂", takeout: "外卖点餐", drinks: "奶茶咖啡" };
const sw = document.getElementById("switcher");
let key = new URLSearchParams(location.search).get("c");
if (!CONFIGS[key]) key = "canteen";
sw.innerHTML = Object.keys(CONFIGS).map((k) => `<button data-k="${k}" class="${k === key ? "on" : ""}">${LABELS[k] || k}</button>`).join("");
sw.addEventListener("click", (e) => { const k = e.target.dataset.k; if (!k) return; key = k; sw.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k)); load(k); });

function load(k) {
  CFG = CONFIGS[k];
  document.documentElement.style.setProperty("--accent", CFG.theme.accent);
  screen.dataset.mode = CFG.theme.mode || "light";
  cat = "all"; curId = null; sel = {}; cart = []; lastOrder = null;
  user = null; pendingAfterLogin = null; loginOpen = false; dateIdx = 0; fbTags = new Set();
  buildDates();
  go("home");
}
load(key);
