/* 找房小程序 · 可点击多页原型
 * 首页 → 搜索/地图/地铁找房 → 房源详情 → 预约看房(登录)/在线咨询/在线签约+支付；收藏 + 浏览记录。
 */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const screen = document.getElementById("screen");
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";

let CFG, view = "home", dir = "fwd";
let region = "全部", curId = null;
let user = null, pendingAfterLogin = null, loginOpen = false;
let favs = new Set(), history = [], booked = [], signed = [];
let mapSel = null, subSel = null, chatMsgs = [];
let bookDate = 0, bookSlot = 0;

const L = (id) => CFG.listings.find((x) => x.id === id);
const isRent = () => CFG.mode === "租房";
const money = (p) => isRent() ? `${p}` : `${p}`;
const priceTag = (l) => isRent() ? `<span class="price">¥${l.price}</span><span class="pu">/月</span>`
  : `<span class="price">${l.price}</span><span class="pu">万</span>`;
const unitLine = (l) => isRent() ? `${l.area}㎡ · ${esc(l.orient)}` : `单价 ${Math.round(l.unitPrice).toLocaleString()} 元/㎡`;
const filtered = () => CFG.listings.filter((l) => region === "全部" || l.region === region);

/* ---------- 组件 ---------- */
function card(l) {
  const fav = favs.has(l.id);
  return `<div class="lcard" data-act="open" data-id="${l.id}">
    <div class="lcover"><img src="${esc(l.cover)}" alt="" loading="lazy" />
      <span class="pcount">${ic("image")} ${l.images.length}</span>
      <span class="fav ${fav ? "on" : ""}" data-act="fav" data-id="${l.id}">${ic("heart")}</span></div>
    <div class="lbody">
      <div class="ltitle">${esc(l.title)}</div>
      <div class="lspec">${esc(l.rooms)} · ${l.area}㎡ · ${esc(l.floor)} · ${esc(l.orient)}</div>
      <div class="lcomm">${ic("pin")} ${esc(l.community)} · ${esc(l.region)}</div>
      <div class="ltags">${l.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <div class="lprice">${priceTag(l)}<span class="lunit">${isRent() ? "" : Math.round(l.unitPrice).toLocaleString() + " 元/㎡"}</span></div>
    </div></div>`;
}
function badge(n) { return n > 0 ? `<span class="nbadge">${n}</span>` : ""; }

/* ---------- 首页 ---------- */
function vHome() {
  const tiles = [["map", "地图找房", "tomap"], ["train", "地铁找房", "tosubway"], ["clock", "预约看房", "openfirst"], ["heart", "我的收藏", "tomine"]];
  const chips = CFG.filters.regions.map((r) => `<div class="chip ${r === region ? "on" : ""}" data-act="region" data-r="${esc(r)}">${esc(r)}</div>`).join("");
  const feed = filtered().map(card).join("");
  return `<div class="page ${dir}">
    <div class="scroll">
      <div class="statusbar"><span>9:41</span><span>···· 5G <span class="bat"></span></span></div>
      <div class="topbar"><span class="loc">${ic("pin")} ${esc(CFG.city)}</span>
        <div class="search" data-act="tolist"><span class="sic">${ic("search")}</span><span>小区 / 地铁 / 商圈找房</span></div>
        <span class="msg" data-act="tochat">${ic("chat")}</span></div>
      <div class="tiles">${tiles.map((t) => `<div class="tile" data-act="${t[2]}"><span class="tile-ic">${ic(t[0])}</span><span>${t[1]}</span></div>`).join("")}</div>
      <div class="sec"><span class="sec-t">${esc(CFG.mode)}房源</span><span class="sec-m" data-act="tolist">查看全部 ›</span></div>
      <div class="chips">${chips}</div>
      <div class="feed">${feed}</div>
    </div>
    <div class="tabbar">
      <div class="t on"><span class="ic">${ic("home")}</span>首页</div>
      <div class="t" data-act="tomap"><span class="ic">${ic("map")}</span>地图</div>
      <div class="t" data-act="tochat"><span class="ic">${ic("chat")}</span>消息</div>
      <div class="t" data-act="tomine"><span class="ic">${ic("user")}</span>我的</div>
    </div></div>`;
}

/* ---------- 列表 ---------- */
function vList() {
  const chips = CFG.filters.regions.map((r) => `<div class="chip ${r === region ? "on" : ""}" data-act="region" data-r="${esc(r)}">${esc(r)}</div>`).join("");
  const list = filtered();
  const body = list.length ? list.map(card).join("") : `<div class="empty">该区域暂无房源</div>`;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div>
      <div class="searchmini"><span class="sic">${ic("search")}</span>${esc(CFG.city)} · ${esc(CFG.mode)}</div></div>
    <div class="filterbar">
      <div class="chips">${chips}</div>
      <div class="sortrow"><span data-act="noop">综合排序 ${ic("sort")}</span><span data-act="noop">价格</span><span data-act="noop">户型</span><span data-act="tomap">地图 ${ic("map")}</span></div>
    </div>
    <div class="scroll"><div class="feed">${body}</div></div></div>`;
}

/* ---------- 地图找房 ---------- */
function districtStat(d) {
  const ls = CFG.listings.filter((l) => l.district === d.name);
  if (!ls.length) return null;
  const avg = Math.round(ls.reduce((n, l) => n + l.price, 0) / ls.length);
  return { count: ls.length, avg };
}
function vMap() {
  const bubbles = CFG.districts.map((d) => {
    const s = districtStat(d); if (!s) return "";
    const on = mapSel === d.name;
    const avgTxt = isRent() ? `${s.avg}元` : `${s.avg}万`;
    return `<div class="bubble ${on ? "on" : ""}" style="left:${d.mx}%;top:${d.my}%" data-act="mapsel" data-d="${esc(d.name)}">
      <div class="bb-d">${esc(d.name)}</div><div class="bb-p">${avgTxt}·${s.count}套</div></div>`;
  }).join("");
  const sheet = mapSel ? CFG.listings.filter((l) => l.district === mapSel).map(card).join("") : filtered().map(card).join("");
  return `<div class="page ${dir}">
    <div class="appbar abs"><div class="back" data-act="home">‹</div><div class="ttl">地图找房</div></div>
    <div class="mapwrap">
      <svg class="mapbg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <rect width="100" height="100" fill="#e8eef0"/>
        <path d="M0 70 Q30 60 55 72 T100 66 L100 100 L0 100Z" fill="#cfe3ea"/>
        <g fill="#dde6e4"><rect x="10" y="14" width="30" height="26" rx="3"/><rect x="44" y="10" width="26" height="22" rx="3"/><rect x="60" y="40" width="32" height="26" rx="3"/><rect x="14" y="46" width="28" height="24" rx="3"/></g>
        <g stroke="#fff" stroke-width="1.2" opacity=".7"><path d="M0 40H100M0 66H100M40 0V100M70 0V100"/></g>
      </svg>
      <div class="bubbles">${bubbles}</div>
    </div>
    <div class="mapsheet">
      <div class="ms-h">${mapSel ? esc(mapSel) + " · " : ""}${(mapSel ? CFG.listings.filter((l) => l.district === mapSel).length : filtered().length)} 套房源 ${mapSel ? `<span class="ms-clear" data-act="mapclear">查看全部</span>` : ""}</div>
      <div class="scroll msfeed">${sheet}</div>
    </div></div>`;
}

/* ---------- 地铁找房 ---------- */
function vSubway() {
  const lines = CFG.subway.lines;
  // 每条线在 SVG 里画一条折线，站点均匀分布
  const W = 340, segs = [
    [[40, 55], [40, 255]], [[95, 150], [300, 150]], [[300, 45], [130, 255]],
  ];
  let svg = "", labels = "";
  lines.forEach((ln, li) => {
    const [a, b] = segs[li % segs.length];
    const n = ln.stations.length;
    svg += `<polyline points="${a[0]},${a[1]} ${b[0]},${b[1]}" fill="none" stroke="${ln.color}" stroke-width="6" stroke-linecap="round" opacity=".9"/>`;
    ln.stations.forEach((st, si) => {
      const t = n === 1 ? 0 : si / (n - 1);
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      const on = subSel === st;
      svg += `<circle cx="${x}" cy="${y}" r="${on ? 8 : 5}" fill="#fff" stroke="${ln.color}" stroke-width="3" data-act="subsel" data-st="${esc(st)}"/>`;
      const lx = li === 1 ? x : x + 10, ly = li === 1 ? y - 10 : y + 3;
      labels += `<text x="${lx}" y="${ly}" font-size="10" fill="${on ? ln.color : "#555"}" font-weight="${on ? 700 : 400}" data-act="subsel" data-st="${esc(st)}">${esc(st)}</text>`;
    });
  });
  const legend = lines.map((ln) => `<span class="leg"><i style="background:${ln.color}"></i>${esc(ln.name)}</span>`).join("");
  const near = subSel ? CFG.listings.filter((l) => l.subwayStations.includes(subSel)) : [];
  const sheet = subSel ? (near.length ? near.map(card).join("") : `<div class="empty">该站点附近暂无房源</div>`) : `<div class="subtip">点击线路上的站点，看附近房源</div>`;
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">地铁找房</div></div>
    <div class="legendbar">${legend}</div>
    <div class="subwrap"><svg viewBox="0 0 340 300" class="subsvg">${svg}${labels}</svg></div>
    <div class="mapsheet">
      <div class="ms-h">${subSel ? `${ic("train")} ${esc(subSel)} · ${near.length} 套` : "选择站点"}</div>
      <div class="scroll msfeed">${sheet}</div>
    </div></div>`;
}

/* ---------- 详情 ---------- */
function vDetail() {
  const l = L(curId), fav = favs.has(l.id);
  return `<div class="page ${dir}">
    <div class="appbar abs"><div class="back" data-act="home">‹</div></div>
    <div class="scroll">
      <div class="gallery"><img src="${esc(l.cover)}" alt="" /><span class="gcount">${ic("image")} 1/${l.images.length}</span></div>
      <div class="dwrap">
        <div class="dprice">${isRent() ? `<span class="price big">¥${l.price}</span><span class="pu">/月</span>` : `<span class="price big">${l.price}</span><span class="pu">万</span><span class="dunit">${Math.round(l.unitPrice).toLocaleString()} 元/㎡</span>`}</div>
        <div class="dtitle">${esc(l.title)}</div>
        <div class="dtags">${l.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="dgrid">
          <div><b>${esc(l.rooms)}</b><span>户型</span></div><div><b>${l.area}㎡</b><span>面积</span></div>
          <div><b>${esc(l.orient)}</b><span>朝向</span></div><div><b>${esc(l.floor)}</b><span>楼层</span></div>
          <div><b>${esc(l.community)}</b><span>小区</span></div><div><b>${l.year}年</b><span>建成</span></div>
        </div>
        <div class="block"><div class="bk-t">房源亮点</div>${l.features.map((f) => `<div class="li">${ic("key2")} ${esc(f)}</div>`).join("")}</div>
        <div class="block"><div class="bk-t">房源描述</div><div class="ddesc">${esc(l.desc)}</div></div>
        <div class="block"><div class="bk-t">位置 · ${esc(l.region)}</div>
          <div class="minimap"><svg viewBox="0 0 100 60" preserveAspectRatio="none"><rect width="100" height="60" fill="#e8eef0"/><path d="M0 42 Q40 36 100 44 L100 60 L0 60Z" fill="#cfe3ea"/><g stroke="#fff" stroke-width="1"><path d="M0 30H100M50 0V60"/></g></svg>
            <span class="mpin">${ic("pin")}</span><span class="mtxt">${esc(l.community)}</span></div></div>
        <div class="agentcard">
          <span class="ag-av">${esc(l.agent.badge)}</span>
          <div class="ag-i"><div class="ag-n">${esc(l.agent.name)} <span class="ag-r">★ ${l.agent.rating}</span></div><div class="ag-s">成交 ${l.agent.sales} 套 · 极速响应</div></div>
          <span class="ag-call" data-act="call">${ic("phone")}</span>
          <span class="ag-chat" data-act="tochat">咨询</span>
        </div>
      </div>
    </div>
    <div class="dbar">
      <div class="db-ic" data-act="fav" data-id="${l.id}"><span class="${fav ? "on" : ""}">${ic("heart")}</span>${fav ? "已收藏" : "收藏"}</div>
      <div class="db-ic" data-act="tochat">${ic("chat")}咨询</div>
      <button class="btn ghost" data-act="tobook">预约看房</button>
      <button class="btn" data-act="tosign">在线签约</button>
    </div></div>`;
}

/* ---------- 预约看房 ---------- */
function vBook() {
  const l = L(curId);
  const days = []; const wk = ["日", "一", "二", "三", "四", "五", "六"];
  for (let i = 0; i < 5; i++) { const d = new Date(); d.setDate(d.getDate() + i); days.push({ md: `${d.getMonth() + 1}/${d.getDate()}`, w: i === 0 ? "今天" : "周" + wk[d.getDay()] }); }
  const slots = ["上午 9-12", "下午 12-15", "下午 15-18", "晚上 18-20"];
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="backdetail">‹</div><div class="ttl">预约看房</div></div>
    <div class="scroll">
      <div class="bsum"><img src="${esc(l.cover)}" alt=""/><div><div class="t">${esc(l.title)}</div><div class="m">${esc(l.community)} · ${esc(l.rooms)} · ${l.area}㎡</div></div></div>
      <div class="fcard"><div class="cl">选择看房日期</div><div class="days">${days.map((d, i) => `<div class="day ${i === bookDate ? "on" : ""}" data-act="bday" data-i="${i}"><b>${d.w}</b><span>${d.md}</span></div>`).join("")}</div></div>
      <div class="fcard"><div class="cl">时间段</div><div class="slots">${slots.map((s, i) => `<div class="slot ${i === bookSlot ? "on" : ""}" data-act="bslot" data-i="${i}">${s}</div>`).join("")}</div></div>
      <div class="fcard"><div class="cl">联系方式</div>
        <input id="bkName" class="line" placeholder="称呼" value="${user ? "微信用户" : ""}"/>
        <input id="bkPhone" class="line" placeholder="手机号" value="${user ? user.phone : ""}"/></div>
      <div class="loginnote">${user ? "已用尾号 " + user.phone.slice(-4) + " 登录" : "预约需先微信绑定手机号登录"}</div>
    </div>
    <div class="cobar"><div class="grow"></div><button class="btn block" data-act="submitbook">提交预约</button></div></div>`;
}

/* ---------- 在线咨询 IM ---------- */
function vChat() {
  const l = curId ? L(curId) : null;
  const ag = l ? l.agent : (CFG.listings[0].agent);
  const msgs = chatMsgs.length ? chatMsgs : [{ who: "ag", t: `您好，我是${ag.name}，这套${l ? l.community : "房源"}还在的，方便看房随时约～` }];
  const bubbles = msgs.map((m) => m.who === "ag"
    ? `<div class="cmsg ag"><span class="cav">${esc(ag.badge)}</span><div class="cb">${esc(m.t)}</div></div>`
    : `<div class="cmsg me"><div class="cb">${esc(m.t)}</div></div>`).join("");
  const quick = ["这套还在吗？", "能约今天看房吗？", "最低多少？", "首付怎么算？"];
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">${esc(ag.name)} · 在线</div><span class="ag-call" data-act="call">${ic("phone")}</span></div>
    <div class="scroll chatscroll">${bubbles}</div>
    <div class="quickrow">${quick.map((q) => `<span class="qchip" data-act="quick" data-q="${esc(q)}">${esc(q)}</span>`).join("")}</div>
    <div class="chatbar"><input id="chatInput" class="line" placeholder="发消息…"/><button class="btn" data-act="send">发送</button></div></div>`;
}

/* ---------- 在线签约 + 支付 ---------- */
function vSign() {
  const l = L(curId);
  const deposit = isRent() ? l.price : Math.round(l.price * 10000 * 0.01);
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="backdetail">‹</div><div class="ttl">在线签约</div></div>
    <div class="scroll">
      <div class="signtop">${ic("doc")}<div><div class="st-t">${isRent() ? "租赁意向协议" : "购房意向协议"}</div><div class="st-s">线上确认，经纪人跟进签约</div></div></div>
      <div class="fcard rowsum"><img src="${esc(l.cover)}" alt=""/><div><div class="t">${esc(l.title)}</div><div class="m">${esc(l.community)} · ${esc(l.rooms)} · ${l.area}㎡</div></div></div>
      <div class="block-card">
        <div class="sr"><span>${isRent() ? "月租金" : "成交总价"}</span><span class="price">${isRent() ? "¥" + l.price + "/月" : l.price + " 万"}</span></div>
        <div class="sr"><span>${isRent() ? "押金" : "意向金/定金"}</span><span>¥${deposit.toLocaleString()}</span></div>
        <div class="sr"><span>经纪人</span><span>${esc(l.agent.name)}</span></div>
        <div class="sr big"><span>本次支付（定金）</span><span class="price">¥${deposit.toLocaleString()}</span></div>
      </div>
      <label class="agree"><input type="checkbox" id="agreeChk" checked/> 我已阅读并同意《${isRent() ? "租赁" : "购房"}意向协议》</label>
      <div class="paytip">演示：点击走微信支付（不产生真实扣款）</div>
    </div>
    <div class="cobar"><div class="pz"><div class="pu">定金</div><div class="price big">¥${deposit.toLocaleString()}</div></div>
      <button class="btn wxpay" data-act="pay">${ic("doc")} 确认签约并支付</button></div></div>`;
}
function vSignDone() {
  const l = L(curId);
  return `<div class="page ${dir}">
    <div class="statusbar"><span>9:41</span><span>···· 5G <span class="bat"></span></span></div>
    <div class="confirm"><div class="ok">${ic("doc")}</div><h2>签约成功</h2>
      <div class="tip">${esc(l.community)} · ${esc(l.rooms)}（演示，无真实扣款）<br>经纪人 ${esc(l.agent.name)} 将尽快与你联系办理后续</div>
      <div class="acts"><div class="gbtn" data-act="tomine">我的合同</div><div class="gbtn" data-act="home">返回首页</div></div>
    </div></div>`;
}

/* ---------- 我的 ---------- */
function miniList(ids, badge) {
  if (!ids.length) return `<div class="mini-empty">暂无</div>`;
  return ids.map((id) => { const l = L(id); return `<div class="mrow" data-act="open" data-id="${id}"><img src="${esc(l.cover)}" alt=""/><div class="mi"><div class="t">${esc(l.title)}</div><div class="m">${esc(l.community)} · ${esc(l.rooms)} · ${l.area}㎡</div></div><span class="mbadge">${badge}</span></div>`; }).join("");
}
function vMine() {
  const tools = [["heart", "我的收藏", favs.size], ["clock", "浏览记录", history.length], ["doc", "我的预约", booked.length], ["key2", "我的合同", signed.length]];
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="home">‹</div><div class="ttl">我的</div></div>
    <div class="scroll">
      <div class="profile"><span class="pav">${ic("user")}</span>
        <div class="pi"><div class="pn">${user ? "尾号" + user.phone.slice(-4) : "未登录"}</div><div class="ps">${user ? "找房 · 看房 · 签约一站搞定" : "登录后管理收藏与预约"}</div></div>
        ${user ? "" : `<button class="loginbtn" data-act="dologin">微信登录</button>`}</div>
      <div class="statgrid">${tools.map((t) => `<div class="stat"><span class="st-ic">${ic(t[0])}</span><b>${t[2]}</b><span>${t[1]}</span></div>`).join("")}</div>
      <div class="msec">我的收藏</div><div class="mlist">${miniList([...favs], "收藏")}</div>
      <div class="msec">浏览记录</div><div class="mlist">${miniList(history.slice(0, 5), "看过")}</div>
    </div></div>`;
}

const VIEWS = { home: vHome, list: vList, map: vMap, subway: vSubway, detail: vDetail, book: vBook, chat: vChat, sign: vSign, signdone: vSignDone, mine: vMine };
function loginSheet() {
  return `<div class="mask" data-act="closelogin"></div>
    <div class="sheet"><div class="sh-grip"></div><div class="sh-t">登录后操作</div>
      <div class="sh-s">预约看房、在线签约需先用微信绑定的手机号登录</div>
      <button class="wxbtn" data-act="dologin"><span class="wxic"></span>微信一键登录（绑定手机号）</button>
      <div class="sh-x" data-act="closelogin">暂不登录</div></div>`;
}
function render() { screen.innerHTML = VIEWS[view]() + (loginOpen ? loginSheet() : ""); const s = screen.querySelector(".scroll"); if (s) s.scrollTop = 0; }
function go(v, d = "fwd") { view = v; dir = d; render(); }
function toast(m) { const t = document.createElement("div"); t.textContent = m; t.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.82);color:#fff;padding:11px 18px;border-radius:10px;font-size:14px;z-index:30;max-width:80%;text-align:center"; screen.appendChild(t); setTimeout(() => t.remove(), 1400); }
function requireLogin(cb) { if (user) { cb(); return; } pendingAfterLogin = cb; loginOpen = true; render(); }
function openDetail(id) { curId = id; history = [id, ...history.filter((x) => x !== id)]; go("detail"); }

screen.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act;
  if (a === "home") go("home", "back");
  else if (a === "tolist") go("list");
  else if (a === "region") { region = el.dataset.r; render(); }
  else if (a === "open") openDetail(el.dataset.id);
  else if (a === "openfirst") openDetail(filtered()[0].id);
  else if (a === "backdetail") go("detail", "back");
  else if (a === "fav") { e.stopPropagation(); const id = el.dataset.id; favs.has(id) ? favs.delete(id) : favs.add(id); toast(favs.has(id) ? "已收藏" : "已取消收藏"); render(); }
  else if (a === "tomap") { mapSel = null; go("map"); }
  else if (a === "mapsel") { mapSel = el.dataset.d; render(); }
  else if (a === "mapclear") { mapSel = null; render(); }
  else if (a === "tosubway") { subSel = null; go("subway"); }
  else if (a === "subsel") { subSel = el.dataset.st; render(); }
  else if (a === "tobook") requireLogin(() => { bookDate = 0; bookSlot = 0; go("book"); })
  else if (a === "bday") { bookDate = +el.dataset.i; render(); }
  else if (a === "bslot") { bookSlot = +el.dataset.i; render(); }
  else if (a === "submitbook") {
    const ph = (document.getElementById("bkPhone").value || "").trim();
    if (!ph) { toast("请填手机号"); return; }
    if (!booked.includes(curId)) booked.push(curId);
    toast("预约成功，经纪人会联系你确认");
    setTimeout(() => go("detail", "back"), 800);
  }
  else if (a === "tochat") { chatMsgs = []; go("chat"); }
  else if (a === "quick") { chatMsgs.push({ who: "me", t: el.dataset.q }); replyLater(); render(); }
  else if (a === "send") { const v = (document.getElementById("chatInput").value || "").trim(); if (!v) return; chatMsgs.push({ who: "me", t: v }); replyLater(); render(); }
  else if (a === "call") toast("拨打经纪人电话（演示）");
  else if (a === "tosign") requireLogin(() => go("sign"));
  else if (a === "pay") { if (!signed.includes(curId)) signed.push(curId); go("signdone"); }
  else if (a === "tomine") go("mine");
  else if (a === "dologin") { user = { phone: "138****6688" }; loginOpen = false; const cb = pendingAfterLogin; pendingAfterLogin = null; render(); if (cb) cb(); }
  else if (a === "closelogin") { loginOpen = false; pendingAfterLogin = null; render(); }
});
function replyLater() {
  const l = curId ? L(curId) : CFG.listings[0];
  setTimeout(() => { chatMsgs.push({ who: "ag", t: "收到～这套" + l.community + "性价比很高，您方便的话我安排今天带看？" }); if (view === "chat") render(); }, 700);
}

/* ---------- 模式切换 ---------- */
const CONFIGS = window.REALTY_CONFIGS;
const LABELS = { buy: "二手房", rent: "租房" };
const sw = document.getElementById("switcher");
let key = new URLSearchParams(location.search).get("c");
if (!CONFIGS[key]) key = "buy";
sw.innerHTML = Object.keys(CONFIGS).map((k) => `<button data-k="${k}" class="${k === key ? "on" : ""}">${LABELS[k]}</button>`).join("");
sw.addEventListener("click", (e) => { const k = e.target.dataset.k; if (!k) return; key = k; sw.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k)); load(k); });
function load(k) {
  CFG = CONFIGS[k];
  document.documentElement.style.setProperty("--accent", CFG.theme.accent);
  region = "全部"; curId = null; user = null; loginOpen = false; pendingAfterLogin = null;
  favs = new Set(); history = []; booked = []; signed = []; mapSel = null; subSel = null; chatMsgs = [];
  go("home");
}
load(key);
