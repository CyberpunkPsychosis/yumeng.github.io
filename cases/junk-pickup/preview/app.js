/* 代扔垃圾 / 上门清运小程序 · 可点击多页原型
 * home(首页) → order(单次代扔, 实时算价) → confirm
 *            → plans(包月套餐) / bulky(大件代扔) / coupons(超值券包)
 *            → orders(我的订单) / mine(我的)
 * 下单/购买需微信手机号登录（演示用模拟登录浮层）。
 */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const screen = document.getElementById("screen");
const yuan = (n) => "¥" + (Math.round(n * 100) / 100);
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";

let CFG, view = "home", dir = "fwd";
let user = null, pendingAfterLogin = null, loginOpen = false;

// 单次代扔表单
let sType, sBags = 1, sFloor = 6, sElevator = true, sSlotIdx = 1, useCoupon = false;
// 大件代扔表单
let bulkPick = {}, bFloor = 6, bElevator = true;
// 包月 / 券包选择
let planPick = null, packPick = null;
// 账户态
let myOrders = [], couponsOwned = 0, planActive = null, lastOrder = null, orderSeq = 0;
let feedIdx = 0, feedTimer = null;

/* ---------- 计价引擎 ---------- */
function singlePrice() {
  const r = CFG.rule.single;
  let p = r.base + Math.max(0, sBags - r.baseBags) * r.addBag;
  if (sSlotIdx === 0) p += r.urgentFee;
  if (!sElevator) p += Math.max(0, sFloor - 1) * r.noElevatorPerFloor;
  return p;
}
function singleCouponCut() {
  if (!useCoupon || couponsOwned <= 0) return 0;
  return Math.min(singlePrice(), CFG.couponFace);
}
function bulkySubtotal() {
  return CFG.bulky.reduce((s, it) => s + it.price * (bulkPick[it.id] || 0), 0);
}
function bulkyFloorAdd() {
  return bElevator ? 0 : Math.max(0, bFloor - 1) * CFG.rule.bulkyNoElevatorPerFloor;
}
function bulkyCount() { return Object.values(bulkPick).reduce((a, b) => a + b, 0); }

/* ---------- 视图 ---------- */
function vHome() {
  const f = CFG.feed[feedIdx % CFG.feed.length];
  const chips = CFG.bulky.map((b) => `<div class="bchip" data-act="tobulky" data-id="${b.id}"><span class="bcic">${ic(b.icon)}</span>${esc(b.name)}</div>`).join("");
  const best = CFG.couponPacks.find((p) => p.best) || CFG.couponPacks[CFG.couponPacks.length - 1];
  const steps = CFG.steps.map((s, i) => `<div class="step"><span class="sic">${ic(s.icon)}</span><div class="st">${esc(s.t)}</div><div class="ss">${esc(s.s)}</div>${i < CFG.steps.length - 1 ? '<span class="sarr">›</span>' : ""}</div>`).join("");
  return `<div class="page ${dir}">
    <div class="scroll">
      <div class="statusbar"><span>16:23</span><span>···· 5G <span class="bat"></span></span></div>
      <div class="topbar"><span class="loc"><i class="mi">${ic("pin")}</i>${esc(CFG.city)}</span>
        <div class="search"><i class="mi">${ic("search")}</i><span>${esc(CFG.slogan)}</span></div>
        <span class="me" data-act="tomine">${user ? "我的" : "登录"}</span></div>

      <div class="hero">
        <div class="ht">${esc(CFG.hero.title)}</div>
        <div class="hs">${esc(CFG.hero.sub)}</div>
        <div class="hbadges"><span>${ic("shield")} 实名骑手</span><span>${ic("leaf")} 分类合规</span><span>${ic("clock")} 准时上门</span></div>
      </div>

      <div class="ticker"><span class="tdot"></span><b>${esc(f.who)}</b> ${esc(f.what)} · <span class="tago">${esc(f.ago)}</span></div>

      <div class="entries">
        <div class="ecard big" data-act="toorder">
          <div class="ei">${ic("trash")}</div>
          <div class="etx"><div class="et">单次代扔</div><div class="es">按次收费 · 下楼这件小事交给我们</div></div>
          <span class="ego">去下单 ›</span>
        </div>
        <div class="ecard big" data-act="toplans">
          <div class="ei alt">${ic("calendar")}</div>
          <div class="etx"><div class="et">包月套餐</div><div class="es">包月代扔更省心 · 低至 ¥${Math.min(...CFG.plans.map((p) => p.price))}/月</div></div>
          <span class="ego">看套餐 ›</span>
        </div>
      </div>

      <div class="sec"><span class="sec-t">大件代扔</span><span class="sec-m" data-act="tobulky">选品类规格下单 ›</span></div>
      <div class="bbanner" data-act="tobulky">
        <div class="bbt">代扔处理旧家具</div>
        <div class="bbs">床 · 衣柜 · 电视柜 · 餐桌 · 马桶 · 猫架，按件计价</div>
      </div>
      <div class="bchips">${chips}</div>

      <div class="sec"><span class="sec-t">超值券包</span><span class="sec-m" data-act="tocoupons">全部 ›</span></div>
      <div class="couponad" data-act="tocoupons">
        <div class="cazig">
          <div class="caL"><div class="cafee">${CFG.couponFace}<small>元</small></div><div class="cax">×${best.n}张</div></div>
          <div class="caR"><div class="cat1">单次代扔券 · ${best.n}张</div><div class="cat2">券包价 <b>¥${best.price}</b> <s>¥${best.orig}</s></div><div class="cat3">最高省 ¥${best.save}</div></div>
          <div class="cabtn">立即领</div>
        </div>
      </div>

      <div class="sec"><span class="sec-t">服务流程</span></div>
      <div class="steps">${steps}</div>
      <div class="pad"></div>
    </div>

    <div class="kf" data-act="kefu"><span>${ic("headset")}</span>客服</div>
    <div class="tabbar">
      <div class="t on"><span class="ic">${ic("home")}</span>首页</div>
      <div class="t" data-act="toorders"><span class="ic">${ic("orders")}</span>订单</div>
      <div class="t" data-act="tomine"><span class="ic">${ic("user")}</span>我的</div>
    </div></div>`;
}

function vOrder() {
  const types = CFG.trashTypes.map((t) => `<div class="opt ${sType === t.id ? "on" : ""}" data-act="stype" data-id="${t.id}">
    <span class="optic">${ic(t.icon)}</span><div class="optx"><div class="optt">${esc(t.name)}</div><div class="opts">${esc(t.note)}</div></div>
    <span class="optck">${sType === t.id ? "✓" : ""}</span></div>`).join("");
  const slots = CFG.slots.map((s, i) => `<div class="slot ${sSlotIdx === i ? "on" : ""}" data-act="sslot" data-i="${i}">${esc(s)}</div>`).join("");
  const base = singlePrice(), cut = singleCouponCut(), total = base - cut;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">单次代扔</div></div>
    <div class="scroll">
      <div class="fcard"><div class="cl">垃圾类型</div>${types}</div>
      <div class="fcard"><div class="cl">数量（${CFG.rule.single.baseBags}袋起 · 每加1袋 +${yuan(CFG.rule.single.addBag)}）</div>
        <div class="rowb"><span class="rk">袋数</span>
          <div class="stepper"><button data-act="bags" data-d="-1">−</button><span class="v">${sBags}</span><button data-act="bags" data-d="1">+</button></div></div></div>
      <div class="fcard"><div class="cl">取件楼层</div>
        <div class="rowb"><span class="rk">楼层</span>
          <div class="stepper"><button data-act="floor" data-d="-1">−</button><span class="v">${sFloor}层</span><button data-act="floor" data-d="1">+</button></div></div>
        <div class="rowb tog" data-act="elev"><span class="rk">${ic("stairs")} 有电梯</span>
          <span class="switch ${sElevator ? "on" : ""}"><i></i></span></div>
        ${!sElevator ? `<div class="hintline">无电梯，骑手需爬楼搬运，加价 ${yuan(CFG.rule.single.noElevatorPerFloor)}/层（${sFloor - 1} 层 = +${yuan(Math.max(0, sFloor - 1) * CFG.rule.single.noElevatorPerFloor)}）</div>` : ""}</div>
      <div class="fcard"><div class="cl">上门时间${sSlotIdx === 0 ? `（加急 +${yuan(CFG.rule.single.urgentFee)}）` : ""}</div><div class="slots">${slots}</div></div>
      <div class="fcard"><div class="cl">取件地址</div>
        <input id="oAddr" class="line" placeholder="小区 / 楼栋 / 门牌" value="阳光花园 6栋2单元 1203"/></div>
      <div class="fcard rowb tog" data-act="coupon"><span class="rk">${ic("ticket")} 使用单次代扔券（剩 ${couponsOwned} 张，每张抵 ${yuan(CFG.couponFace)}）</span>
        <span class="switch ${useCoupon && couponsOwned > 0 ? "on" : ""}"><i></i></span></div>
      ${cut > 0 ? `<div class="cutline">已抵扣 −${yuan(cut)}</div>` : ""}
    </div>
    <div class="cobar"><div class="pz"><div class="pu">合计</div><div class="price big">${yuan(total)}</div></div>
      <button class="btn" data-act="submitorder">${user ? "确认下单" : "登录并下单"}</button></div></div>`;
}

function vBulky() {
  const grid = CFG.bulky.map((b) => {
    const q = bulkPick[b.id] || 0;
    return `<div class="gcard ${q ? "picked" : ""}">
      <div class="gic">${ic(b.icon)}</div>
      <div class="gn">${esc(b.name)}</div>
      <div class="gp">${yuan(b.price)}/件</div>
      <div class="gstep">${q ? `<button data-act="bk" data-id="${b.id}" data-d="-1">−</button><span>${q}</span>` : ""}<button data-act="bk" data-id="${b.id}" data-d="1">+</button></div>
    </div>`;
  }).join("");
  const sub = bulkySubtotal(), fa = bulkyFloorAdd(), total = sub + fa;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">大件代扔</div></div>
    <div class="scroll">
      <div class="bnote">选品类与数量，按件计价 · 旧家具 / 家电 / 洁具上门搬走</div>
      <div class="grid">${grid}</div>
      <div class="fcard"><div class="cl">取件楼层</div>
        <div class="rowb"><span class="rk">楼层</span>
          <div class="stepper"><button data-act="bfloor" data-d="-1">−</button><span class="v">${bFloor}层</span><button data-act="bfloor" data-d="1">+</button></div></div>
        <div class="rowb tog" data-act="belev"><span class="rk">${ic("stairs")} 有电梯</span>
          <span class="switch ${bElevator ? "on" : ""}"><i></i></span></div>
        ${!bElevator ? `<div class="hintline">无电梯，大件搬运加价 ${yuan(CFG.rule.bulkyNoElevatorPerFloor)}/层（${bFloor - 1} 层 = +${yuan(fa)}）</div>` : ""}</div>
      <div class="fcard"><div class="cl">取件地址</div>
        <input id="bAddr" class="line" placeholder="小区 / 楼栋 / 门牌" value="阳光花园 6栋2单元 1203"/></div>
      ${sub ? `<div class="sumrow"><span>家具小计</span><span>${yuan(sub)}</span></div>${fa ? `<div class="sumrow"><span>无电梯搬运</span><span>+${yuan(fa)}</span></div>` : ""}` : ""}
    </div>
    <div class="cobar"><div class="pz"><div class="pu">合计 · ${bulkyCount()} 件</div><div class="price big">${yuan(total)}</div></div>
      <button class="btn" data-act="submitbulky" ${bulkyCount() ? "" : "disabled"}>${bulkyCount() ? (user ? "确认下单" : "登录并下单") : "请选品类"}</button></div></div>`;
}

function vPlans() {
  const list = CFG.plans.map((p) => `<div class="plan ${planPick === p.id ? "on" : ""}" data-act="ppick" data-id="${p.id}">
    ${p.hot ? '<span class="phot">热销</span>' : ""}
    <div class="ph"><div class="pn">${esc(p.name)}${p.tag ? `<span class="ptag">${esc(p.tag)}</span>` : ""}</div>
      <div class="pprice"><b>¥${p.price}</b><small>/月</small></div></div>
    <div class="pt">${esc(p.times)} · ${esc(p.per)}</div>
    <span class="pradio">${planPick === p.id ? "●" : "○"}</span></div>`).join("");
  const cur = CFG.plans.find((p) => p.id === planPick);
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">包月套餐</div></div>
    <div class="scroll">
      <div class="planhero">包月代扔更省心<br><small>选定后每天/隔天自动有骑手上门，无需重复下单</small></div>
      ${list}
      <div class="plist-note">${ic("shield")} 到期前提醒 · 未用次数可顺延 · 随时可退</div>
    </div>
    <div class="cobar"><div class="pz"><div class="pu">${cur ? esc(cur.name) : "请选套餐"}</div><div class="price big">${cur ? yuan(cur.price) : "—"}</div></div>
      <button class="btn" data-act="buyplan" ${cur ? "" : "disabled"}>${user ? "立即开通" : "登录并开通"}</button></div></div>`;
}

function vCoupons() {
  const packs = CFG.couponPacks.map((p) => `<div class="pack ${packPick === p.id ? "on" : ""}" data-act="cpick" data-id="${p.id}">
    ${p.best ? '<span class="pbest">最划算</span>' : ""}
    <div class="packL"><div class="packfee">${CFG.couponFace}<small>元/张</small></div><div class="packn">×${p.n} 张</div></div>
    <div class="packR"><div class="packt">单次代扔券 ${p.n} 张</div>
      <div class="packp"><b>¥${p.price}</b> <s>¥${p.orig}</s></div>
      <div class="packs">立省 ¥${p.save}</div></div>
    <span class="pradio">${packPick === p.id ? "●" : "○"}</span></div>`).join("");
  const cur = CFG.couponPacks.find((p) => p.id === packPick);
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">超值券包</div></div>
    <div class="scroll">
      <div class="planhero alt">单次代扔券 · 买得多省得多<br><small>下单时自动抵扣每单 ${yuan(CFG.couponFace)}，长期使用最划算</small></div>
      ${packs}
      <div class="plist-note">${ic("ticket")} 券永久有效 · 仅可用于单次代扔 · 不可提现</div>
    </div>
    <div class="cobar"><div class="pz"><div class="pu">${cur ? `${cur.n}张券包` : "请选券包"}</div><div class="price big">${cur ? yuan(cur.price) : "—"}</div></div>
      <button class="btn" data-act="buypack" ${cur ? "" : "disabled"}>${user ? "立即购买" : "登录并购买"}</button></div></div>`;
}

function vConfirm() {
  const o = lastOrder || {};
  return `<div class="page ${dir}">
    <div class="statusbar"><span>16:23</span><span>···· 5G <span class="bat"></span></span></div>
    <div class="confirm"><div class="ok">✓</div><h2>${esc(o.okTitle || "下单成功")}</h2>
      <div class="tip">${o.lines ? o.lines.map(esc).join("<br>") : ""}</div>
      <div class="acts"><div class="gbtn" data-act="toorders">查看订单</div><div class="gbtn" data-act="home">返回首页</div></div>
    </div></div>`;
}

function vOrders() {
  const list = myOrders.length ? myOrders.map((o) => {
    const cls = o.status === "已完成" ? "done" : o.status === "待接单" ? "wait" : "doing";
    return `<div class="orow"><div class="oh"><span class="oid">单号 ${esc(o.id)}</span><span class="ostat ${cls}">${esc(o.status)}</span></div>
      <div class="ot">${esc(o.type)}</div>
      <div class="om"><i class="mi">${ic("pin")}</i>${esc(o.addr)}</div>
      <div class="om"><i class="mi">${ic("clock")}</i>${esc(o.time)}</div>
      <div class="of"><span class="oamt">${yuan(o.amount)}</span>${o.status === "待接单" ? '<span class="obtn ghost" data-act="cancelorder" data-id="' + esc(o.id) + '">取消</span>' : ""}<span class="obtn" data-act="kefu">联系客服</span></div></div>`;
  }).join("") : `<div class="empty"><div class="e">🧹</div>还没有订单，去首页下一单吧</div>`;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">我的订单</div></div>
    <div class="scroll"><div class="olist">${list}</div></div>
    <div class="tabbar">
      <div class="t" data-act="home"><span class="ic">${ic("home")}</span>首页</div>
      <div class="t on"><span class="ic">${ic("orders")}</span>订单</div>
      <div class="t" data-act="tomine"><span class="ic">${ic("user")}</span>我的</div>
    </div></div>`;
}

function vMine() {
  const tools = [["ticket", "我的券包"], ["calendar", "我的套餐"], ["pin", "地址管理"], ["gift", "邀请有礼"], ["coin", "钱包余额"], ["star", "服务评价"], ["headset", "联系客服"], ["gear", "设置"]];
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">我的</div></div>
    <div class="scroll">
      <div class="profile"><span class="pav">${user ? "👤" : "?"}</span>
        <div class="pi"><div class="pn">${user ? "尾号" + user.phone.slice(-4) : "未登录"}</div>
          <div class="ps">${user ? (planActive ? "已开通 " + planActive : "登录后享会员价") : "登录后管理订单 · 套餐 · 券包"}</div></div>
        ${user ? "" : `<button class="loginbtn" data-act="dologin">微信登录</button>`}</div>
      <div class="statline">
        <div class="stat" data-act="tocoupons"><b>${couponsOwned}</b><span>代扔券</span></div>
        <div class="stat" data-act="toplans"><b>${planActive ? "1" : "0"}</b><span>包月套餐</span></div>
        <div class="stat" data-act="toorders"><b>${myOrders.length}</b><span>订单</span></div>
      </div>
      <div class="msec">我的服务</div>
      <div class="tools">${tools.map((t) => `<div class="tool" data-act="${t[0] === "ticket" ? "tocoupons" : t[0] === "calendar" ? "toplans" : ""}"><span class="tic">${ic(t[0])}</span>${esc(t[1])}</div>`).join("")}</div>
    </div>
    <div class="tabbar">
      <div class="t" data-act="home"><span class="ic">${ic("home")}</span>首页</div>
      <div class="t" data-act="toorders"><span class="ic">${ic("orders")}</span>订单</div>
      <div class="t on"><span class="ic">${ic("user")}</span>我的</div>
    </div></div>`;
}

const VIEWS = { home: vHome, order: vOrder, bulky: vBulky, plans: vPlans, coupons: vCoupons, confirm: vConfirm, orders: vOrders, mine: vMine };

function loginSheet() {
  return `<div class="mask" data-act="closelogin"></div>
    <div class="sheet"><div class="sh-grip"></div><div class="sh-t">登录后使用</div>
      <div class="sh-s">下单、买套餐、领券需先用微信绑定的手机号登录</div>
      <button class="wxbtn" data-act="dologin"><span class="wxic"></span>微信一键登录（绑定手机号）</button>
      <div class="sh-x" data-act="closelogin">暂不登录</div></div>`;
}

function render() {
  if (feedTimer) { clearInterval(feedTimer); feedTimer = null; }
  screen.innerHTML = VIEWS[view]() + (loginOpen ? loginSheet() : "");
  const s = screen.querySelector(".scroll"); if (s) s.scrollTop = 0;
  if (view === "home") feedTimer = setInterval(() => {
    feedIdx++; const el = screen.querySelector(".ticker");
    if (el) { const f = CFG.feed[feedIdx % CFG.feed.length]; el.innerHTML = `<span class="tdot"></span><b>${esc(f.who)}</b> ${esc(f.what)} · <span class="tago">${esc(f.ago)}</span>`; }
  }, 2400);
}
function go(v, d = "fwd") { view = v; dir = d; render(); }
function toast(msg) { const t = document.createElement("div"); t.textContent = msg; t.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.82);color:#fff;padding:11px 18px;border-radius:10px;font-size:14px;z-index:30;max-width:80%;text-align:center"; screen.appendChild(t); setTimeout(() => t.remove(), 1500); }
function requireLogin(cb) { if (user) { cb(); return; } pendingAfterLogin = cb; loginOpen = true; render(); }
function addOrder(o) { o.id = (CFG.brand === JUNK_CONFIGS.trash.brand ? "T" : "C") + (90000 + (++orderSeq)); myOrders.unshift(o); }

/* ---------- 交互 ---------- */
screen.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act;
  if (a === "home") go("home", "back");
  else if (a === "toorder") go("order");
  else if (a === "tobulky") { if (el.dataset.id) bulkPick[el.dataset.id] = (bulkPick[el.dataset.id] || 0) + 1; go("bulky"); }
  else if (a === "toplans") go("plans");
  else if (a === "tocoupons") go("coupons");
  else if (a === "toorders") go("orders");
  else if (a === "tomine") go("mine");
  else if (a === "kefu") toast("已为你转接在线客服（演示）");
  // 单次代扔表单
  else if (a === "stype") { sType = el.dataset.id; render(); }
  else if (a === "bags") { sBags = Math.max(1, sBags + (+el.dataset.d)); render(); }
  else if (a === "floor") { sFloor = Math.min(34, Math.max(1, sFloor + (+el.dataset.d))); render(); }
  else if (a === "elev") { sElevator = !sElevator; render(); }
  else if (a === "sslot") { sSlotIdx = +el.dataset.i; render(); }
  else if (a === "coupon") { if (couponsOwned <= 0) { toast("暂无可用券，去领一份券包"); return; } useCoupon = !useCoupon; render(); }
  else if (a === "submitorder") submitOrder();
  // 大件代扔
  else if (a === "bk") { const id = el.dataset.id; bulkPick[id] = Math.max(0, (bulkPick[id] || 0) + (+el.dataset.d)); if (!bulkPick[id]) delete bulkPick[id]; render(); }
  else if (a === "bfloor") { bFloor = Math.min(34, Math.max(1, bFloor + (+el.dataset.d))); render(); }
  else if (a === "belev") { bElevator = !bElevator; render(); }
  else if (a === "submitbulky") submitBulky();
  // 套餐 / 券包
  else if (a === "ppick") { planPick = el.dataset.id; render(); }
  else if (a === "buyplan") buyPlan();
  else if (a === "cpick") { packPick = el.dataset.id; render(); }
  else if (a === "buypack") buyPack();
  else if (a === "cancelorder") { myOrders = myOrders.filter((o) => o.id !== el.dataset.id); toast("订单已取消"); render(); }
  // 登录
  else if (a === "closelogin") { loginOpen = false; pendingAfterLogin = null; render(); }
  else if (a === "dologin") { user = { phone: "138****6688" }; loginOpen = false; const cb = pendingAfterLogin; pendingAfterLogin = null; render(); if (cb) cb(); }
});

function submitOrder() {
  if (!sType) { toast("请选择垃圾类型"); return; }
  requireLogin(() => {
    const addr = (document.getElementById("oAddr") || {}).value || "阳光花园 6栋2单元 1203";
    const t = CFG.trashTypes.find((x) => x.id === sType);
    const cut = singleCouponCut(), total = singlePrice() - cut;
    if (cut > 0) couponsOwned -= 1;
    addOrder({ type: `单次代扔 · ${t.name} ×${sBags}袋`, addr, time: CFG.slots[sSlotIdx].replace("（加急）", ""), amount: total, status: sSlotIdx === 0 ? "待接单" : "待接单" });
    lastOrder = { okTitle: "下单成功", lines: [`${t.name} ×${sBags}袋 · ${CFG.slots[sSlotIdx]}`, `${addr}`, cut > 0 ? `实付 ${yuan(total)}（已用券抵 ${yuan(cut)}）` : `实付 ${yuan(total)}`, "骑手接单后将上门取件（演示，无需支付）"] };
    useCoupon = false;
    go("confirm");
  });
}

function submitBulky() {
  if (!bulkyCount()) { toast("请先选择品类"); return; }
  requireLogin(() => {
    const addr = (document.getElementById("bAddr") || {}).value || "阳光花园 6栋2单元 1203";
    const items = CFG.bulky.filter((b) => bulkPick[b.id]).map((b) => `${b.name}×${bulkPick[b.id]}`).join(" ");
    const total = bulkySubtotal() + bulkyFloorAdd();
    addOrder({ type: `大件代扔 · ${items}`, addr, time: "上门时间待骑手确认", amount: total, status: "待接单" });
    lastOrder = { okTitle: "下单成功", lines: [`大件代扔 · ${items}`, `${addr}`, `实付 ${yuan(total)}`, "骑手将联系你确认上门时间（演示，无需支付）"] };
    bulkPick = {};
    go("confirm");
  });
}

function buyPlan() {
  const p = CFG.plans.find((x) => x.id === planPick); if (!p) return;
  requireLogin(() => {
    planActive = p.name;
    lastOrder = { okTitle: "开通成功", lines: [`${p.name} · ${yuan(p.price)}/月`, `${p.times}`, "已为你激活，每次自动派单上门（演示，无需支付）"] };
    go("confirm");
  });
}

function buyPack() {
  const p = CFG.couponPacks.find((x) => x.id === packPick); if (!p) return;
  requireLogin(() => {
    couponsOwned += p.n;
    lastOrder = { okTitle: "购买成功", lines: [`单次代扔券 ×${p.n} 张`, `实付 ${yuan(p.price)} · 立省 ${yuan(p.save)}`, `当前共 ${couponsOwned} 张，下单可自动抵扣`] };
    go("confirm");
  });
}

/* ---------- 场景切换 ---------- */
const CONFIGS = window.JUNK_CONFIGS;
const LABELS = { trash: "生活垃圾代扔", clean: "大件 / 装修清运" };
const sw = document.getElementById("switcher");
let key = new URLSearchParams(location.search).get("c");
if (!CONFIGS[key]) key = "trash";
sw.innerHTML = Object.keys(CONFIGS).map((k) => `<button data-k="${k}" class="${k === key ? "on" : ""}">${LABELS[k] || k}</button>`).join("");
sw.addEventListener("click", (e) => { const k = e.target.dataset.k; if (!k) return; key = k; sw.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k)); load(k); });

function load(k) {
  CFG = JSON.parse(JSON.stringify(CONFIGS[k]));   // 深拷贝：下单/购买会改数据，切换可重置
  document.documentElement.style.setProperty("--accent", CFG.theme.accent);
  view = "home"; dir = "fwd"; user = null; loginOpen = false; pendingAfterLogin = null;
  sType = CFG.trashTypes[0].id; sBags = 1; sFloor = 6; sElevator = true; sSlotIdx = 1; useCoupon = false;
  bulkPick = {}; bFloor = 6; bElevator = true; planPick = CFG.plans[0].id; packPick = (CFG.couponPacks.find((p) => p.best) || CFG.couponPacks[0]).id;
  myOrders = JSON.parse(JSON.stringify(CFG.orders || [])); couponsOwned = 0; planActive = null; lastOrder = null; orderSeq = 0; feedIdx = 0;
  render();
}
load(key);
