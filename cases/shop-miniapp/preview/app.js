/* 二手/电商小程序 · 可点击多页原型
 * home → detail →(加购)→ cart → checkout → confirm。购物车为真实状态。
 */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const screen = document.getElementById("screen");
const yuan = (n) => "¥" + (Math.round(n * 100) / 100);

let CFG, view = "home", dir = "fwd", cat = "all";
let curId = null, sel = {};            // detail 选中的规格
let cart = [];                          // [{id, qty, spec:{}, sel:true}]
let lastOrder = null;

const product = (id) => CFG.products.find((p) => p.id === id);
const cartCount = () => cart.reduce((n, c) => n + c.qty, 0);
const specKey = (s) => JSON.stringify(s || {});
const specText = (s) => Object.values(s || {}).join(" · ");
const selected = () => cart.filter((c) => c.sel);
const selTotal = () => selected().reduce((n, c) => n + product(c.id).price * c.qty, 0);

/* ---------- 视图 ---------- */
function badge(n) { return n > 0 ? `<span class="badge">${n > 99 ? "99+" : n}</span>` : ""; }

function vHome() {
  const b = CFG.banner;
  const chips = CFG.categories.map((c) => `<div class="chip ${c.id === cat ? "on" : ""}" data-act="chip" data-cat="${c.id}">${esc(c.name)}</div>`).join("");
  const list = CFG.products.filter((p) => cat === "all" || p.cat === cat).map((p) => `
    <div class="gcard" data-act="open" data-id="${p.id}">
      <img src="${esc(p.thumb)}" alt="" loading="lazy" />
      <div class="gb">
        <div class="gt">${esc(p.title)}</div>
        <div class="gbr">${esc(p.brand || "")}</div>
        <div class="gp"><span class="price p">${yuan(p.price)}</span>${p.refPrice ? `<span class="ref">${yuan(p.refPrice)}</span>` : ""}</div>
        ${p.tag ? `<div class="gtag"><span class="tag">${esc(p.tag)}</span></div>` : ""}
      </div>
    </div>`).join("");
  return `<div class="page ${dir}">
    <div class="scroll">
      <div class="statusbar"><span>15:44</span><span>···· 5G <span class="bat"></span></span></div>
      <div class="searchbar"><span class="ico">⊞</span>
        <div class="box"><span>🔍</span><span>${esc(CFG.searchPlaceholder)}</span><span class="go" style="margin-left:auto">搜索</span></div>
        <span class="ico">▦</span></div>
      <div class="banner" style="background:${esc(b.color)}"><div><div class="bt">${esc(b.text)}</div><div class="bs">${esc(b.sub)}</div></div><span class="arr">›</span></div>
      <div class="chips">${chips}</div>
      <div class="grid">${list}</div>
    </div>
    <div class="tabbar">
      <div class="t on"><span class="ic">🏠</span>首页</div>
      <div class="t"><span class="ic">▦</span>分类</div>
      <div class="t" data-act="tocart"><span class="ic">🛒</span>购物车${badge(cartCount())}</div>
      <div class="t"><span class="ic">👤</span>我的</div>
    </div></div>`;
}

function vDetail() {
  const p = product(curId);
  const specs = (p.specs || []).map((o) => `
    <div class="opt"><div class="ol">${esc(o.label)}</div><div class="ov">
      ${o.values.map((v) => `<div class="o ${sel[o.label] === v ? "on" : ""}" data-act="spec" data-label="${esc(o.label)}" data-val="${esc(v)}">${esc(v)}</div>`).join("")}
    </div></div>`).join("");
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">${esc(p.brand || "商品")}</div></div>
    <div class="scroll">
      <img class="dimg" src="${esc(p.thumb)}" alt="" />
      <div class="dinfo">
        <div class="dp"><span class="price p">${yuan(p.price)}</span>${p.refPrice ? `<span class="ref">${yuan(p.refPrice)}</span>` : ""}${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ""}</div>
        <div class="dt">${esc(p.title)}</div>
        <div class="dbr">${esc(p.brand || "")}</div>
      </div>
      ${specs}
      <div class="note"><span>发货 / 验货说明</span><span>›</span></div>
      <div class="ddesc">${esc(p.desc || "")}</div>
    </div>
    <div class="actionbar">
      <div class="icobtn" data-act="home"><span class="ic">🏠</span>首页</div>
      <div class="icobtn" data-act="tocart"><span class="ic">🛒</span>购物车${badge(cartCount())}</div>
      <div class="grow"></div>
      <button class="btn" data-act="add">加入购物车</button>
    </div></div>`;
}

function vCart() {
  const allSel = cart.length && cart.every((c) => c.sel);
  const rows = cart.map((c, i) => {
    const p = product(c.id);
    return `<div class="crow">
      <div class="ck ${c.sel ? "on" : ""}" data-act="tsel" data-i="${i}">${c.sel ? "✓" : ""}</div>
      <img src="${esc(p.thumb)}" alt=""/>
      <div class="ci"><div class="t">${esc(p.title)}</div>
        ${specText(c.spec) ? `<span class="sp">${esc(specText(c.spec))}</span>` : ""}
        <div class="b"><span class="price p">${yuan(p.price)}</span>
          <div class="stepper"><button data-act="qty" data-i="${i}" data-d="-1">−</button><span class="v">${c.qty}</span><button data-act="qty" data-i="${i}" data-d="1">+</button></div>
        </div></div>
      <div class="ck" data-act="del" data-i="${i}" style="border:none;color:var(--muted);align-self:flex-start">✕</div>
    </div>`;
  }).join("");
  const body = cart.length ? rows : `<div class="empty"><div class="e">🛒</div>购物车还是空的<br>去首页逛逛吧</div>`;
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
  const list = items.map((c) => { const p = product(c.id); return `
    <div class="coli"><img src="${esc(p.thumb)}" alt=""/>
      <div style="flex:1;min-width:0"><div class="t">${esc(p.title)}</div><div class="m">${esc(specText(c.spec))} ×${c.qty}</div></div>
      <div class="price p">${yuan(p.price)}</div></div>`; }).join("");
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="cart">‹</div><div class="ttl">确认订单</div></div>
    <div class="scroll">
      <div class="addr" data-act="noop"><span class="pin">📍</span><div class="ai"><div class="n">张先生　138****0000</div><div class="d">上海市徐汇区安福路 300 号</div></div><span class="arr">›</span></div>
      <div class="block-card">${list}</div>
      <div class="block-card" style="padding:4px 0">
        <div class="sumrow"><span>商品金额</span><span>${yuan(selTotal())}</span></div>
        <div class="sumrow"><span>运费</span><span>包邮</span></div>
        <div class="sumrow big"><span>合计</span><span class="price p">${yuan(selTotal())}</span></div>
      </div>
    </div>
    <div class="cobar"><div class="tot" style="margin-left:0">应付 <span class="price p" style="font-size:20px">${yuan(selTotal())}</span></div>
      <div class="grow"></div><button class="btn" data-act="pay">提交订单</button></div></div>`;
}

function vConfirm() {
  return `<div class="page ${dir}">
    <div class="statusbar"><span>15:44</span><span>···· 5G <span class="bat"></span></span></div>
    <div class="confirm"><div class="ok">✓</div><h2>下单成功</h2>
      <div class="tip">已支付 ${yuan(lastOrder ? lastOrder.total : 0)}（演示）<br>我们会尽快为你发货</div>
      <div class="acts"><div class="gbtn" data-act="orders">查看订单</div><div class="gbtn" data-act="home">返回首页</div></div>
    </div></div>`;
}

const VIEWS = { home: vHome, detail: vDetail, cart: vCart, checkout: vCheckout, confirm: vConfirm };
function render() { screen.innerHTML = VIEWS[view](); const s = screen.querySelector(".scroll"); if (s) s.scrollTop = 0; }
function go(v, d = "fwd") { view = v; dir = d; render(); }

function toast(msg) {
  const t = document.createElement("div"); t.textContent = msg;
  t.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.8);color:#fff;padding:10px 18px;border-radius:10px;font-size:14px;z-index:9";
  screen.appendChild(t); setTimeout(() => t.remove(), 1300);
}

/* ---------- 交互 ---------- */
screen.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act, i = +el.dataset.i;
  if (a === "chip") { cat = el.dataset.cat; render(); }
  else if (a === "open") { curId = el.dataset.id; sel = {}; (product(curId).specs || []).forEach((o) => sel[o.label] = o.values[0]); go("detail"); }
  else if (a === "spec") { sel[el.dataset.label] = el.dataset.val; render(); }
  else if (a === "home") go("home", "back");
  else if (a === "tocart") go("cart");
  else if (a === "cart") go("cart", "back");
  else if (a === "add") {
    const p = product(curId), key = specKey(sel);
    const line = cart.find((c) => c.id === curId && specKey(c.spec) === key);
    if (line) line.qty++; else cart.push({ id: curId, qty: 1, spec: Object.assign({}, sel), sel: true });
    toast("已加入购物车"); render();
  }
  else if (a === "tsel") { cart[i].sel = !cart[i].sel; render(); }
  else if (a === "tall") { const all = cart.every((c) => c.sel); cart.forEach((c) => c.sel = !all); render(); }
  else if (a === "qty") { cart[i].qty = Math.max(1, cart[i].qty + (+el.dataset.d)); render(); }
  else if (a === "del") { cart.splice(i, 1); render(); }
  else if (a === "checkout") { if (!selected().length) { toast("请选择商品"); return; } go("checkout"); }
  else if (a === "pay") {
    lastOrder = { items: selected().slice(), total: selTotal() };
    cart = cart.filter((c) => !c.sel);
    go("confirm");
  }
  else if (a === "orders") toast("我的订单（演示）");
});

/* ---------- 店铺切换 ---------- */
const CONFIGS = window.SHOP_CONFIGS;
const LABELS = { vintage: "二手潮流", digital: "二手数码" };
const sw = document.getElementById("switcher");
let key = new URLSearchParams(location.search).get("c");
if (!CONFIGS[key]) key = "vintage";
sw.innerHTML = Object.keys(CONFIGS).map((k) => `<button data-k="${k}" class="${k === key ? "on" : ""}">${LABELS[k] || k}</button>`).join("");
sw.addEventListener("click", (e) => { const k = e.target.dataset.k; if (!k) return; key = k; sw.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k)); load(k); });

function load(k) {
  CFG = CONFIGS[k];
  document.documentElement.style.setProperty("--accent", CFG.theme.accent);
  screen.dataset.mode = CFG.theme.mode || "light";
  cat = "all"; curId = null; sel = {}; cart = []; lastOrder = null;
  go("home");
}
load(key);
