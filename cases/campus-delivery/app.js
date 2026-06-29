/* 宿舍闪购 · 三端演示：用户端(利润引擎) / 骑手端(运力体系) / 管理后台(AI决策) */
const CD = window.CD;
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const root = document.getElementById("app");
const y = (n) => "¥" + (Math.round(n * 100) / 100).toFixed(2);
const sum = (a) => a.reduce((x, n) => x + n, 0);

let surface = "user";
// 用户端
let uView = "shop", addr = { campus: "东校区", building: "3栋", floor: "5层", room: "508" }, cart = {}, exPick = null, reserve = false, slot = 0, addrOpen = false;
// 骑手端
let rTab = "orders", gps = CD.rider.me.gpsOnline, sched = {}, rIncome = CD.rider.weekIncome, rOrders = CD.rider.orders.map((o) => ({ ...o, st: "wait" })), curOrder = null, lastCommission = null;
// 后台
let wh = 0, untouched = CD.untouched.map((u) => ({ ...u, sent: false }));

const prod = (id) => CD.products.find((p) => p.id === id);
const ex = (id) => CD.exchangeItems.find((x) => x.id === id);

/* ============ 利润引擎 ============ */
function engine() {
  const items = Object.entries(cart).filter(([, q]) => q > 0);
  const subtotal = sum(items.map(([id, q]) => prod(id).price * q));
  const tiers = CD.rule.tiers;
  const unlocked = tiers.filter((t) => subtotal >= t.min);
  const nextTier = tiers.find((t) => subtotal < t.min);
  const couponOn = subtotal >= CD.rule.couponTrigger;
  if (exPick && !unlocked.find((t) => t.exId === exPick)) exPick = null; // 不满足则失效
  const exItem = exPick ? ex(exPick) : null;
  const exAdd = exItem ? exItem.addPrice : 0;
  const freeDelivery = !!exItem;
  const delivery = (subtotal > 0 && !freeDelivery) ? CD.rule.deliveryBase : 0;
  const total = subtotal + exAdd + delivery;
  return { items, subtotal, unlocked, nextTier, couponOn, exItem, exAdd, freeDelivery, delivery, total };
}

/* ============ 顶部切换 ============ */
function topbar() {
  const t = [["user", "用户端", "cart"], ["rider", "骑手端", "bike"], ["admin", "管理后台", "chart"]];
  return `<div class="switchbar"><div class="sb-logo"><span class="sb-ic">${ic("bolt")}</span>${esc(CD.brand)} · 三端演示</div>
    <div class="sb-tabs">${t.map((x) => `<button class="sb-t ${x[0] === surface ? "on" : ""}" data-act="surface" data-s="${x[0]}">${ic(x[2])} ${x[1]}</button>`).join("")}</div></div>`;
}
function render() {
  let body;
  if (surface === "admin") body = `<div class="admin">${vAdmin()}</div>`;
  else body = `<div class="stage"><div class="phone"><div class="screen">${surface === "user" ? vUser() : vRider()}</div></div><div class="sidehint">${sideHint()}</div></div>`;
  root.innerHTML = topbar() + body;
}
function sideHint() {
  if (surface === "user") return `<b>用户端 · 利润引擎</b><p>四级地址锁定（校区-楼栋-楼层-寝室，不可手填）。加购后进购物车看 <b>凑单宝</b> 与 <b>阶梯换购免配送费</b>：满 3.5 触发凑单，满 4.5 加 1.99 换购、满 8 加 2.99 换两瓶，换购即免配送费。换购品平时商城隐藏，仅满额解锁。</p>`;
  return `<b>骑手端 · 运力体系</b><p>勾选下周可用时段；<b>只有排班 + GPS 在线</b>才派单。送达需拍 <b>带水印照片</b>（时间/地点/订单号）。完成后看 <b>佣金明细</b>：楼层阶梯 0.7/0.8/0.9 + 超 5kg 加 0.5 + 连续排班忠诚度补贴（封顶 0.5）。</p>`;
}
function toast(m) { const t = document.createElement("div"); t.className = "cdtoast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 1600); }

/* ============ 用户端 ============ */
function vUser() {
  if (uView === "confirm") return uConfirm();
  if (uView === "cart") return uCart();
  return uShop();
}
function uShop() {
  const e = engine();
  const grid = CD.products.map((p) => `<div class="pcard"><div class="pc-img" style="background:${p.color}22;color:${p.color}">${ic("box")}</div>
    <div class="pc-n">${esc(p.name)}</div><div class="pc-r"><span class="price">${y(p.price)}</span>
    ${cart[p.id] ? `<div class="step"><button data-act="dec" data-id="${p.id}">−</button><span>${cart[p.id]}</span><button data-act="inc" data-id="${p.id}">+</button></div>` : `<button class="addb" data-act="inc" data-id="${p.id}">+</button>`}</div></div>`).join("");
  return `<div class="uhead"><div class="addr" data-act="addr"><span class="adic">${ic("pin")}</span><div><b>${esc(addr.campus)} ${esc(addr.building)} ${esc(addr.floor)} ${esc(addr.room)}</b><span>四级地址已锁定 · 点击修改</span></div><span class="arr">›</span></div></div>
    <div class="scroll"><div class="banner">${ic("bolt")} 最快 15 分钟送达寝室 · 满额免配送费</div>
      <div class="pgrid">${grid}</div><div style="height:80px"></div></div>
    ${e.subtotal > 0 ? `<div class="cartbar" data-act="tocart"><span class="cb-ic">${ic("cart")}<span class="cb-badge">${sum(e.items.map(([, q]) => q))}</span></span>
      <span class="cb-t">合计 <b>${y(e.subtotal)}</b></span><span class="cb-go">去结算 ›</span></div>` : ""}
    ${addrOpen ? addrSheet() : ""}`;
}
function uCart() {
  const e = engine();
  const rows = e.items.map(([id, q]) => { const p = prod(id); return `<div class="crow"><div class="ci"><b>${esc(p.name)}</b><span class="price">${y(p.price)}</span></div>
    <div class="step"><button data-act="dec" data-id="${id}">−</button><span>${q}</span><button data-act="inc" data-id="${id}">+</button></div></div>`; }).join("");
  // 凑单宝
  let coupon = "";
  if (e.nextTier) { const gap = (e.nextTier.min - e.subtotal); coupon = `<div class="couponbox"><div class="cp-h">${ic("bolt")} 凑单宝</div><div class="cp-bar"><i style="width:${Math.min(100, e.subtotal / e.nextTier.min * 100)}%"></i></div>
    <div class="cp-t">${e.couponOn ? `再凑 <b>${y(gap)}</b> 即可「${esc(e.nextTier.label)}」` : `还差 <b>${y(CD.rule.couponTrigger - e.subtotal)}</b> 触发凑单宝`}</div></div>`; }
  else coupon = `<div class="couponbox"><div class="cp-h">${ic("bolt")} 凑单宝</div><div class="cp-t ok">已解锁全部换购档位，划算到底 🎉</div></div>`;
  // 换购位（仅满额解锁）
  let exg = "";
  if (e.unlocked.length) {
    exg = `<div class="exbox"><div class="ex-h">${ic("ticket")} 阶梯换购 · 免配送费</div>
      ${e.unlocked.map((t) => { const x = ex(t.exId); const on = exPick === t.exId; return `<div class="exrow ${on ? "on" : ""}" data-act="ex" data-id="${t.exId}">
        <span class="exck">${on ? ic("check") : ""}</span><div class="exi"><b>${esc(x.name)}</b><span>${esc(t.label)}</span></div><span class="exp">+${y(x.addPrice)}</span></div>`; }).join("")}
      <div class="ex-tip">换购品商城隐藏，仅满额出现；退款按原价扣差额。</div></div>`;
  }
  const resv = `<div class="resvbox"><div class="rs-row"><div><b>预约配送</b><span>次日时段送达，下单即锁库存</span></div><span class="sw ${reserve ? "on" : ""}" data-act="resv"></span></div>
    ${reserve ? `<div class="slots">${["次日 08-10", "次日 12-14", "次日 18-20"].map((s, i) => `<span class="slot ${i === slot ? "on" : ""}" data-act="slot" data-i="${i}">${s}</span>`).join("")}</div><div class="rs-tip">前 1 小时免费取消，1 小时内取消扣 ¥0.50。</div>` : ""}</div>`;
  return `<div class="appbar"><span class="back" data-act="shop">‹</span><b>购物车</b><span></span></div>
    <div class="scroll"><div class="crows">${rows || '<div class="empty">购物车空空，去加点东西吧</div>'}</div>
      ${e.items.length ? coupon + exg + resv : ""}<div style="height:120px"></div></div>
    ${e.items.length ? `<div class="checkout"><div class="sumline"><span>商品</span><span>${y(e.subtotal)}</span></div>
      ${e.exItem ? `<div class="sumline"><span>换购（${esc(e.exItem.name)}）</span><span>+${y(e.exAdd)}</span></div>` : ""}
      <div class="sumline"><span>配送费</span><span>${e.freeDelivery ? '<span class="free">已免</span>' : y(e.delivery)}</span></div>
      <div class="sumline big"><span>合计</span><span class="price">${y(e.total)}</span></div>
      <button class="cobtn" data-act="pay">提交订单</button></div>` : ""}`;
}
function uConfirm() {
  return `<div class="confirm"><div class="ok">${ic("check")}</div><h2>下单成功</h2>
    <div class="ctip">${reserve ? "已预约 · 已锁库存" : "骑手最快 15 分钟送达"}<br>${esc(addr.campus)} ${esc(addr.building)} ${esc(addr.floor)} ${esc(addr.room)}</div>
    <button class="cobtn" data-act="shop" style="max-width:200px;margin-top:24px">继续逛逛</button></div>`;
}
function addrSheet() {
  const blds = CD.buildings[addr.campus] || [];
  return `<div class="mask" data-act="addrclose"></div><div class="addrsheet"><div class="as-h">锁定收货地址<span class="as-x" data-act="addrclose">✕</span></div>
    <div class="as-row"><label>校区</label><div class="as-opts">${CD.campus.map((c) => `<span class="aopt ${c === addr.campus ? "on" : ""}" data-act="ad" data-k="campus" data-v="${c}">${c}</span>`).join("")}</div></div>
    <div class="as-row"><label>楼栋</label><div class="as-opts">${blds.map((b) => `<span class="aopt ${b === addr.building ? "on" : ""}" data-act="ad" data-k="building" data-v="${b}">${b}</span>`).join("")}</div></div>
    <div class="as-row"><label>楼层</label><div class="as-opts">${CD.floors.map((f) => `<span class="aopt ${f === addr.floor ? "on" : ""}" data-act="ad" data-k="floor" data-v="${f}">${f}</span>`).join("")}</div></div>
    <div class="as-row"><label>寝室号</label><input class="as-input" id="roomIn" value="${esc(addr.room)}" placeholder="如 508"/></div>
    <button class="cobtn" data-act="addrsave">确认锁定</button><div class="as-tip">四级结构化地址，不可手动篡改地址主体，仅可改寝室号。</div></div>`;
}

/* ============ 骑手端 ============ */
function loyaltyAdd() { const c = CD.rider.commission, w = CD.rider.me.weeksOnSchedule; return w >= 2 ? Math.min(c.loyaltyCap, (w - 1) * c.loyaltyStep) : 0; }
function vRider() {
  const tabs = [["orders", "接单"], ["sched", "排班"], ["income", "收入"]];
  let body = rTab === "sched" ? rSched() : rTab === "income" ? rIncomeV() : rOrdersV();
  return `<div class="rhead"><b>${esc(CD.rider.me.name)}</b><span class="gps ${gps ? "on" : ""}" data-act="gps">${ic("pin")} GPS ${gps ? "在线" : "离线"}</span></div>
    <div class="rtabs">${tabs.map((t) => `<span class="rt ${rTab === t[0] ? "on" : ""}" data-act="rtab" data-t="${t[0]}">${t[1]}</span>`).join("")}</div>
    <div class="scroll">${body}<div style="height:30px"></div></div>`;
}
function rOrdersV() {
  if (curOrder) return rDeliver();
  const hasSched = Object.keys(sched).some((k) => sched[k]);
  if (!gps || !hasSched) return `<div class="rnote">${ic("pin")}<div><b>暂不可接单</b><span>${!gps ? "请先开启 GPS 在线" : "请先在「排班」勾选可用时段"}</span></div></div>
    ${!hasSched ? `<button class="cobtn sm" data-act="rtab" data-t="sched" style="margin:12px 14px">去排班</button>` : ""}`;
  const list = rOrders.filter((o) => o.st !== "done").map((o) => `<div class="ordc"><div class="oc-h"><b>#${o.id}</b><span class="dist">${o.dist}</span></div>
    <div class="oc-a">${ic("pin")} ${esc(o.building)} ${o.floor}层 ${esc(o.room)}</div><div class="oc-i">${esc(o.items)} · ${o.weight}kg</div>
    <div class="oc-c">预计佣金 <b class="price">${y(calcCommission(o))}</b><button class="takeb" data-act="take" data-id="${o.id}">接单送达</button></div></div>`).join("");
  return `<div class="rlist">${list || '<div class="empty">暂无新订单</div>'}</div>`;
}
function calcCommission(o) { const c = CD.rider.commission; return (c.byFloor[o.floor] || 0.7) + (o.weight > c.overweightKg ? c.overweightAdd : 0) + loyaltyAdd(); }
function rDeliver() {
  const o = curOrder;
  return `<div class="deliver"><div class="dv-h">配送中 · #${o.id}</div>
    <div class="dv-a">${ic("pin")} ${esc(o.building)} ${o.floor}层 ${esc(o.room)} · ${o.items}</div>
    <div class="photoarea">${o.photo ? `<img src="${o.photo}" class="wmphoto"/>` : `<div class="photoph">${ic("image")}<span>送达后拍照留证（自动加水印）</span></div>`}</div>
    ${o.photo ? `<button class="cobtn" data-act="finish">确认送达完成</button>` : `<button class="cobtn" data-act="shoot">拍送达照片</button>`}
    <div class="dv-tip">强制水印：时间 / 地点 / 订单号。用户 15 分钟内可申诉，有合规照片平台兜底赔付。</div></div>`;
}
function rSched() {
  return `<div class="schwrap"><div class="sc-t">勾选下周可用时段（系统只向排班 + GPS 在线者派单）</div>
    <table class="schtable"><tr><th></th>${CD.rider.slots.map((s) => `<th>${s}</th>`).join("")}</tr>
    ${CD.rider.days.map((d, di) => `<tr><td class="day">${d}</td>${CD.rider.slots.map((s, si) => { const k = di + "_" + si; return `<td><span class="cell ${sched[k] ? "on" : ""}" data-act="cell" data-k="${k}">${sched[k] ? ic("check") : ""}</span></td>`; }).join("")}</tr>`).join("")}</table>
    <div class="sc-tip">爽约（排班却不在线/不接单）将取消当周忠诚度补贴资格。</div></div>`;
}
function rIncomeV() {
  const c = CD.rider.commission, la = loyaltyAdd();
  return `<div class="incwrap"><div class="inccard"><div class="ic-big">${y(rIncome)}</div><div class="ic-s">本周收入 · ${rOrders.filter(o => o.st === "done").length + CD.rider.weekOrders} 单</div></div>
    <div class="loyalty"><div class="ly-h">忠诚度补贴</div><div class="ly-bar"><i style="width:${la / c.loyaltyCap * 100}%"></i></div>
      <div class="ly-t">连续排班 <b>${CD.rider.me.weeksOnSchedule}</b> 周 · 当前每单 +${y(la)}（封顶 +${y(c.loyaltyCap)}）</div></div>
    <div class="ruletbl"><div class="rt-h">佣金规则</div>
      <div class="rt-r"><span>1-2 楼</span><span>¥0.70</span></div><div class="rt-r"><span>3-4 楼</span><span>¥0.80</span></div><div class="rt-r"><span>5-6 楼</span><span>¥0.90</span></div>
      <div class="rt-r"><span>超 5kg</span><span>+¥0.50</span></div><div class="rt-r"><span>忠诚度</span><span>+¥0.10/周 封顶 0.50</span></div></div>
    ${lastCommission ? `<div class="lastc">上一单佣金：${lastCommission.floor}楼 ${y(lastCommission.base)}${lastCommission.over ? " + 超重 " + y(lastCommission.over) : ""} + 忠诚 ${y(lastCommission.loyalty)} = <b class="price">${y(lastCommission.total)}</b></div>` : ""}</div>`;
}

/* ============ 管理后台 ============ */
function vAdmin() {
  const r = CD.report;
  const whchips = CD.warehouses.map((w, i) => `<span class="whchip ${i === wh ? "on" : ""}" data-act="wh" data-i="${i}">${esc(w)}</span>`).join("");
  return `<div class="adhead"><div class="ad-t">经营管理后台 · AI 决策</div><div class="whchips">${whchips}</div></div>
  <div class="adgrid">
    <div class="adcard span2"><div class="ac-h">每日经营报表 · ${r.date}<button class="exbtn" data-act="export">${ic("import")} 导出 Excel</button></div>
      <div class="reportcols">
        <div class="rcol"><div class="rc-t">🔥 热销榜</div>${r.hot.map((h, i) => `<div class="rc-r"><span class="rk">${i + 1}</span>${esc(h.name)}<span class="rc-v">${h.qty}件 · 毛利${h.gm}%</span></div>`).join("")}</div>
        <div class="rcol"><div class="rc-t">🧊 滞销榜</div>${r.cold.map((h) => `<div class="rc-r">${esc(h.name)}<span class="rc-v">${h.qty}件 · ${h.days}天未动</span></div>`).join("")}</div>
        <div class="rcol"><div class="rc-t">📦 补货建议</div>${r.restock.map((h) => `<div class="rc-r">${esc(h.name)}<span class="rc-v">余${h.stock} → 补${h.suggest}</span></div>`).join("")}</div>
      </div>
      ${r.grossAlert.map((g) => `<div class="alert">⚠ 毛利异常：${esc(g.name)} 毛利率 ${g.gm}% — ${esc(g.note)}</div>`).join("")}</div>

    <div class="adcard span2"><div class="ac-h">楼栋战区看板</div>
      <div class="bfgrid">${CD.battlefield.map((b) => `<div class="bfcard st-${b.status}"><div class="bf-b">${esc(b.building)} <span class="bf-st">${b.status}</span></div>
        <div class="bf-m"><div><b>${y(b.revenue)}</b><span>营业额</span></div><div><b>${b.orders}</b><span>单量</span></div><div><b>${y(b.avg)}</b><span>客单价</span></div></div>
        <div class="bf-adv">建议：${esc(b.advice)}</div><button class="bf-do" data-act="advice" data-b="${esc(b.building)}">一键执行</button></div>`).join("")}</div></div>

    <div class="adcard"><div class="ac-h">未触达宿舍 · 7 天未下单</div>
      <div class="utlist">${untouched.map((u, i) => `<div class="utrow"><span>${esc(u.room)}</span><span class="utd">${u.days}天</span>
        <button class="utb ${u.sent ? "sent" : ""}" data-act="sendcoupon" data-i="${i}">${u.sent ? "已派券" : "派1元券"}</button></div>`).join("")}</div>
      <button class="exbtn full" data-act="sendall">${ic("ticket")} 一键全部派发 1 元绑定券</button></div>

    <div class="adcard"><div class="ac-h">语音库存更新</div>
      <div class="voicebox"><button class="micbtn" data-act="mic">${ic("mic")} 按住说话</button>
        <input class="voiceinput" id="voiceIn" placeholder='标准句式：「商品 补/减 数量」如「可乐 补 20」'/>
        <button class="exbtn" data-act="voiceparse">识别</button></div>
      <div class="vtip">支持标准句式 + 二次确认，防错防恶意改库存。</div></div>
  </div>`;
}

/* ============ 交互 ============ */
root.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act, id = el.dataset.id;
  // 切换端
  if (a === "surface") { surface = el.dataset.s; render(); return; }
  // 用户端
  if (a === "inc") { cart[id] = (cart[id] || 0) + 1; render(); }
  else if (a === "dec") { cart[id] = Math.max(0, (cart[id] || 0) - 1); if (!cart[id]) delete cart[id]; render(); }
  else if (a === "tocart") { uView = "cart"; render(); }
  else if (a === "shop") { uView = "shop"; render(); }
  else if (a === "ex") { exPick = exPick === id ? null : id; render(); }
  else if (a === "resv") { reserve = !reserve; render(); }
  else if (a === "slot") { slot = +el.dataset.i; render(); }
  else if (a === "pay") { uView = "confirm"; render(); }
  else if (a === "addr") { addrOpen = true; render(); }
  else if (a === "addrclose") { addrOpen = false; render(); }
  else if (a === "ad") { const k = el.dataset.k, v = el.dataset.v; addr[k] = v; if (k === "campus") addr.building = CD.buildings[v][0]; render(); }
  else if (a === "addrsave") { const r = document.getElementById("roomIn"); if (r) addr.room = r.value.trim() || addr.room; addrOpen = false; render(); }
  // 骑手端
  else if (a === "gps") { gps = !gps; render(); }
  else if (a === "rtab") { rTab = el.dataset.t; render(); }
  else if (a === "cell") { sched[el.dataset.k] = !sched[el.dataset.k]; render(); }
  else if (a === "take") { curOrder = rOrders.find((o) => o.id === id); render(); }
  else if (a === "shoot") { shootPhoto(); }
  else if (a === "finish") finishOrder();
  // 后台
  else if (a === "wh") { wh = +el.dataset.i; render(); }
  else if (a === "export") exportExcel();
  else if (a === "advice") toast("已对「" + el.dataset.b + "」执行：" + (CD.battlefield.find(b => b.building === el.dataset.b).advice));
  else if (a === "sendcoupon") { untouched[+el.dataset.i].sent = true; toast("已向 " + untouched[+el.dataset.i].room + " 派发 1 元绑定券"); render(); }
  else if (a === "sendall") { untouched.forEach((u) => u.sent = true); toast("已向 " + untouched.length + " 间未触达宿舍全部派券"); render(); }
  else if (a === "mic") { const v = document.getElementById("voiceIn"); if (v) v.value = "可乐 补 20"; toast("识别中…（演示填入样例）"); }
  else if (a === "voiceparse") voiceParse();
});

/* 水印照片 */
function shootPhoto() {
  const o = curOrder, c = document.createElement("canvas"); c.width = 320; c.height = 240; const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 320, 240); g.addColorStop(0, "#5b6470"); g.addColorStop(1, "#2b3038"); x.fillStyle = g; x.fillRect(0, 0, 320, 240);
  x.fillStyle = "rgba(255,255,255,.12)"; for (let i = -240; i < 320; i += 90) { x.save(); x.translate(i, 0); x.rotate(-0.35); x.font = "bold 16px sans-serif"; x.fillText("宿舍闪购 已送达", 0, 120); x.restore(); }
  x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(0, 178, 320, 62);
  x.fillStyle = "#fff"; x.font = "12px sans-serif";
  const now = new Date(); const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  x.fillText("时间：" + ts, 10, 196); x.fillText("地点：" + o.building + " " + o.floor + "层 " + o.room, 10, 214); x.fillText("订单号：#" + o.id, 10, 232);
  o.photo = c.toDataURL("image/png"); render();
}
function finishOrder() {
  const o = curOrder, c = CD.rider.commission, base = c.byFloor[o.floor] || 0.7, over = o.weight > c.overweightKg ? c.overweightAdd : 0, loy = loyaltyAdd();
  const totalC = base + over + loy; o.st = "done"; rIncome = Math.round((rIncome + totalC) * 100) / 100;
  lastCommission = { floor: o.floor, base, over, loyalty: loy, total: totalC };
  curOrder = null; rTab = "income"; render(); toast("送达完成，本单佣金 " + y(totalC));
}
/* 导出 Excel(CSV) */
function exportExcel() {
  const r = CD.report; let csv = "类别,名称,数量,备注\n";
  r.hot.forEach((h) => csv += `热销,${h.name},${h.qty},毛利${h.gm}%\n`);
  r.cold.forEach((h) => csv += `滞销,${h.name},${h.qty},${h.days}天未动\n`);
  r.restock.forEach((h) => csv += `补货建议,${h.name},余${h.stock},建议补${h.suggest}\n`);
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `经营报表_${r.date}.csv`; a.click();
  toast("已导出经营报表 CSV");
}
/* 语音库存解析 */
function voiceParse() {
  const v = document.getElementById("voiceIn"); if (!v) return; const t = v.value.trim();
  const m = t.match(/(.+?)\s*(补|加|减|少)\s*(\d+)/);
  if (!m) { toast("没听清，请用「商品 补/减 数量」"); return; }
  const name = m[1].trim(), op = m[2], qty = +m[3]; const p = CD.products.find((x) => x.name.includes(name));
  if (!p) { toast("没有找到商品「" + name + "」"); return; }
  const delta = (op === "减" || op === "少") ? -qty : qty;
  if (confirm(`二次确认：「${p.name}」库存 ${p.stock} ${delta >= 0 ? "+" : ""}${delta} → ${p.stock + delta}？`)) {
    p.stock += delta; toast(p.name + " 库存已更新为 " + p.stock); v.value = "";
  }
}
render();
