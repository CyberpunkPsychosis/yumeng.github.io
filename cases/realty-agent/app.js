/* 经纪人工作台 · 单页应用（演示）
 * 工作台 / 房源(录入·批量·消息解析·批量分享) / 客源 / 跟进 / 业绩 / 榜单 / 签约 / 地图 / 消息
 */
const D = window.AGENT_DATA;
const ic = (k) => (window.ICONS && window.ICONS[k]) || "";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const app = document.getElementById("app");

let listings = D.listings.map((x) => ({ ...x }));
let clients = D.clients.map((x) => ({ ...x, follows: x.follows.slice() }));
let signs = [];
let view = "dashboard", drawer = null, parsed = [], sel = new Set();
let curClient = clients[0].id, mapSel = null, chatSel = clients[0].id, perfMetric = "gmv";

const NAV = [
  ["dashboard", "工作台", "home"], ["listings", "房源管理", "buildings"], ["clients", "客源管理", "users"],
  ["follow", "客源跟进", "edit"], ["perf", "业绩统计", "chart"], ["rank", "业绩榜单", "trophy"],
  ["sign", "签约发起", "doc"], ["map", "地图找房", "map"], ["chat", "消息", "chat"],
];
const wan = (n) => `${n}万`;
const toast = (m) => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 1600); };

/* ---------- 视图 ---------- */
function vDashboard() {
  const me = D.agents.find((a) => a.id === D.me.id);
  const storeGmv = D.agents.reduce((n, a) => n + a.gmv, 0);
  const kpis = [["本月业绩", wan(me.gmv), "chart"], ["带看", me.views + " 次", "users"], ["成交", me.deals + " 单", "doc"], ["新增房源", me.newList + " 套", "buildings"]];
  const todo = clients.filter((c) => c.status === "跟进中" || c.status === "新");
  const top = [...D.agents].sort((a, b) => b.gmv - a.gmv).slice(0, 3);
  const donut = (() => { let acc = 0; const segs = D.sources.map((s) => { const a = acc; acc += s.value; return `${colorOf(s.name)} ${a}% ${acc}%`; }); return `conic-gradient(${segs.join(",")})`; })();
  return `<div class="grid4">${kpis.map((k) => `<div class="kpi"><span class="kpi-ic">${ic(k[2])}</span><div><b>${k[1]}</b><span>${k[0]}</span></div></div>`).join("")}</div>
    <div class="row2">
      <div class="panel"><div class="ph">本月业绩进度 <span class="muted">目标 ${wan(2000)}</span></div>
        <div class="progress"><i style="width:${Math.min(100, me.gmv / 2000 * 100)}%"></i></div>
        <div class="muted sm">已完成 ${wan(me.gmv)} · 还差 ${wan(Math.max(0, 2000 - me.gmv))}</div>
        <div class="ph mt">门店业绩 Top3</div>
        ${top.map((a, i) => `<div class="rankrow"><span class="medal m${i}">${i + 1}</span><span class="av">${esc(a.badge)}</span><span class="rn">${esc(a.name)}</span><span class="rbarwrap"><i style="width:${a.gmv / top[0].gmv * 100}%"></i></span><b>${wan(a.gmv)}</b></div>`).join("")}
      </div>
      <div class="panel"><div class="ph">业绩来源构成</div>
        <div class="donutwrap"><div class="donut" style="background:${donut}"><div class="dhole"><b>${wan(storeGmv)}</b><span>门店合计</span></div></div>
          <div class="legend2">${D.sources.map((s) => `<div><i style="background:${colorOf(s.name)}"></i>${esc(s.name)} <b>${s.value}%</b></div>`).join("")}</div></div>
      </div>
    </div>
    <div class="panel"><div class="ph">待跟进（${todo.length}）<span class="link" data-nav="follow">去跟进 ›</span></div>
      ${todo.map((c) => `<div class="todorow" data-act="openclient" data-id="${c.id}"><span class="av">${esc(c.name[0])}</span><div class="tinfo"><b>${esc(c.name)}</b><span>${esc(c.region)} · ${esc(c.budget)} · ${esc(c.rooms)}</span></div><span class="badge st-${stCls(c.status)}">${esc(c.status)}</span><span class="muted sm">最近 ${esc(c.last)}</span></div>`).join("")}
    </div>`;
}

function vListings() {
  const rows = listings.map((l) => `<tr data-id="${l.id}">
    <td><span class="ck ${sel.has(l.id) ? "on" : ""}" data-act="selrow" data-id="${l.id}"></span></td>
    <td><b>${esc(l.community)}</b><div class="sub">${esc(l.region)}</div></td>
    <td>${esc(l.rooms)}<div class="sub">${l.area}㎡</div></td>
    <td>${esc(l.floor)}<div class="sub">${esc(l.orient)}</div></td>
    <td class="price">${wan(l.price)}</td>
    <td><span class="badge st-${stCls(l.status)}">${esc(l.status)}</span></td>
    <td>${esc(l.agent)}</td><td class="sub">${esc(l.source)}</td>
    <td><span class="link" data-act="shareone" data-id="${l.id}">分享</span></td></tr>`).join("");
  return `<div class="toolbar">
      <div class="tcount">共 <b>${listings.length}</b> 套 · 已选 <b>${sel.size}</b></div>
      <div class="tbtns">
        <button class="btn ghost" data-act="drawer" data-d="share" ${sel.size ? "" : "disabled"}>${ic("share")} 批量分享</button>
        <button class="btn ghost" data-act="drawer" data-d="parse">${ic("import")} 消息解析录入</button>
        <button class="btn ghost" data-act="drawer" data-d="batch">${ic("import")} 批量录入</button>
        <button class="btn" data-act="drawer" data-d="addListing">${ic("plus")} 录入房源</button>
      </div></div>
    <div class="panel nopad"><table class="tbl">
      <thead><tr><th></th><th>小区/区域</th><th>户型/面积</th><th>楼层/朝向</th><th>价格</th><th>状态</th><th>维护人</th><th>来源</th><th>操作</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
}

function vClients() {
  const rows = clients.map((c) => `<tr>
    <td><span class="av">${esc(c.name[0])}</span> <b>${esc(c.name)}</b><div class="sub">${esc(c.phone)}</div></td>
    <td>${esc(c.region)} · ${esc(c.rooms)}<div class="sub">预算 ${esc(c.budget)}</div></td>
    <td><span class="badge st-${stCls(c.status)}">${esc(c.status)}</span></td>
    <td><span class="lv lv-${c.level}">${c.level}</span></td>
    <td>${esc(c.agent)}</td><td class="sub">${esc(c.last)}</td>
    <td><span class="link" data-act="openclient" data-id="${c.id}">跟进</span> · <span class="link" data-act="matchclient" data-id="${c.id}">匹配房源</span></td></tr>`).join("");
  return `<div class="toolbar"><div class="tcount">共 <b>${clients.length}</b> 个客源</div>
      <div class="tbtns"><button class="btn" data-act="drawer" data-d="addClient">${ic("plus")} 录入客源</button></div></div>
    <div class="panel nopad"><table class="tbl">
      <thead><tr><th>客户</th><th>需求</th><th>状态</th><th>等级</th><th>维护人</th><th>最近跟进</th><th>操作</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
}

function vFollow() {
  const c = clients.find((x) => x.id === curClient) || clients[0];
  const list = clients.map((x) => `<div class="clitem ${x.id === c.id ? "on" : ""}" data-act="pickclient" data-id="${x.id}"><span class="av">${esc(x.name[0])}</span><div><b>${esc(x.name)}</b><span class="sub">${esc(x.region)}·${esc(x.budget)}</span></div><span class="badge st-${stCls(x.status)}">${esc(x.status)}</span></div>`).join("");
  const matches = matchFor(c);
  return `<div class="followwrap">
    <div class="panel nopad cllist">${list}</div>
    <div class="panel followmain">
      <div class="fhead"><span class="av big">${esc(c.name[0])}</span><div><div class="fn">${esc(c.name)} <span class="lv lv-${c.level}">${c.level}</span></div><div class="sub">${esc(c.phone)} · ${esc(c.region)} · 预算 ${esc(c.budget)} · ${esc(c.rooms)}</div></div>
        <span class="badge st-${stCls(c.status)}">${esc(c.status)}</span></div>
      <div class="ph mt">添加跟进</div>
      <div class="addfollow"><input id="folInput" class="line" placeholder="记录这次沟通…"/><button class="btn" data-act="addfollow">记录</button></div>
      <div class="ph mt">跟进记录</div>
      <div class="timeline">${c.follows.map((f) => `<div class="tl"><span class="dot"></span><div><div class="tld">${esc(f.date)}</div><div class="tlt">${esc(f.text)}</div></div></div>`).join("")}</div>
      <div class="ph mt">房客匹配（${matches.length}）</div>
      ${matches.length ? matches.map((l) => `<div class="matchrow"><div><b>${esc(l.community)}</b> <span class="sub">${esc(l.rooms)}·${l.area}㎡·${esc(l.region)}</span></div><span class="price">${wan(l.price)}</span><span class="link" data-act="signfrom" data-l="${l.id}" data-c="${c.id}">发起签约</span></div>`).join("") : `<div class="muted sm">暂无匹配房源</div>`}
    </div></div>`;
}

function vPerf() {
  const max = Math.max(...D.agents.map((a) => a.gmv));
  const teams = {}; D.agents.forEach((a) => { teams[a.team] = (teams[a.team] || 0) + a.gmv; });
  const tmax = Math.max(...Object.values(teams));
  return `<div class="row2">
    <div class="panel"><div class="ph">经纪人业绩（万）</div>
      <div class="barchart">${D.agents.map((a) => `<div class="barcol"><div class="barv" style="height:${a.gmv / max * 100}%"><span>${a.gmv}</span></div><div class="barlb">${esc(a.name)}</div></div>`).join("")}</div></div>
    <div class="panel"><div class="ph">团队业绩对比</div>
      ${Object.entries(teams).map(([t, v]) => `<div class="hbar"><span class="hlb">${esc(t)}</span><span class="hbarwrap"><i style="width:${v / tmax * 100}%"></i></span><b>${wan(v)}</b></div>`).join("")}
      <div class="ph mt">来源分配统计</div>
      ${D.sources.map((s) => `<div class="hbar"><span class="hlb">${esc(s.name)}</span><span class="hbarwrap"><i style="width:${s.value}%;background:${colorOf(s.name)}"></i></span><b>${s.value}%</b></div>`).join("")}
    </div></div>
    <div class="grid4">
      <div class="kpi"><span class="kpi-ic">${ic("chart")}</span><div><b>${wan(D.agents.reduce((n, a) => n + a.gmv, 0))}</b><span>门店总业绩</span></div></div>
      <div class="kpi"><span class="kpi-ic">${ic("doc")}</span><div><b>${D.agents.reduce((n, a) => n + a.deals, 0)} 单</b><span>成交单数</span></div></div>
      <div class="kpi"><span class="kpi-ic">${ic("users")}</span><div><b>${D.agents.reduce((n, a) => n + a.views, 0)} 次</b><span>带看总量</span></div></div>
      <div class="kpi"><span class="kpi-ic">${ic("buildings")}</span><div><b>${D.agents.reduce((n, a) => n + a.newList, 0)} 套</b><span>新增房源</span></div></div>
    </div>`;
}

function vRank() {
  const metricLabel = { gmv: "业绩(万)", deals: "成交单", views: "带看", newList: "新增房源" };
  const ranked = [...D.agents].sort((a, b) => b[perfMetric] - a[perfMetric]);
  const max = ranked[0][perfMetric];
  return `<div class="toolbar"><div class="tcount">业绩榜单 · 本月</div>
    <div class="tbtns seg">${Object.keys(metricLabel).map((m) => `<button class="segbtn ${m === perfMetric ? "on" : ""}" data-act="metric" data-m="${m}">${metricLabel[m]}</button>`).join("")}</div></div>
    <div class="panel">${ranked.map((a, i) => `<div class="rankrow big"><span class="medal m${i}">${i + 1}</span><span class="av">${esc(a.badge)}</span>
      <div class="rn2"><b>${esc(a.name)}</b><span class="sub">${esc(a.team)}</span></div>
      <span class="rbarwrap"><i style="width:${a[perfMetric] / max * 100}%"></i></span>
      <b class="rv">${perfMetric === "gmv" ? wan(a[perfMetric]) : a[perfMetric]}</b></div>`).join("")}</div>`;
}

function vSign() {
  const opts = (arr, f) => arr.map((x) => `<option value="${x.id}">${esc(f(x))}</option>`).join("");
  return `<div class="panel formpanel">
    <div class="ph">签约发起</div>
    <div class="frow"><label>选择房源</label><select id="sgList" class="line">${opts(listings.filter((l) => l.status !== "已成交"), (l) => `${l.community} · ${l.rooms} · ${l.price}万`)}</select></div>
    <div class="frow"><label>选择客源</label><select id="sgClient" class="line">${opts(clients, (c) => `${c.name} · ${c.budget}`)}</select></div>
    <div class="frow2"><div><label>成交价(万)</label><input id="sgPrice" class="line" type="number" placeholder="如 690"/></div>
      <div><label>佣金(万)</label><input id="sgFee" class="line" type="number" placeholder="如 13.8"/></div></div>
    <div class="frow"><label>备注</label><input id="sgNote" class="line" placeholder="付款方式 / 过户安排…"/></div>
    <button class="btn block" data-act="dosign">${ic("doc")} 发起电子签约</button>
    ${signs.length ? `<div class="ph mt">已发起（${signs.length}）</div>${signs.map((s) => `<div class="signrow"><span class="av">${ic("doc")}</span><div><b>${esc(s.community)}</b> ⇄ ${esc(s.client)}</div><span class="price">${wan(s.price)}</span><span class="badge st-ok">待签署</span></div>`).join("")}` : ""}
  </div>`;
}

function vMap() {
  const stat = {}; listings.forEach((l) => { (stat[l.region] = stat[l.region] || []).push(l); });
  const pos = { "徐汇": [30, 62], "静安": [46, 40], "浦东": [72, 56], "杨浦": [60, 26], "闵行": [22, 82] };
  const bubbles = Object.keys(stat).map((r) => { const ls = stat[r], avg = Math.round(ls.reduce((n, l) => n + l.price, 0) / ls.length), p = pos[r] || [50, 50], on = mapSel === r;
    return `<div class="bubble ${on ? "on" : ""}" style="left:${p[0]}%;top:${p[1]}%" data-act="mapsel" data-r="${esc(r)}"><div class="bb-d">${esc(r)}</div><div class="bb-p">${avg}万·${ls.length}套</div></div>`; }).join("");
  const show = mapSel ? (stat[mapSel] || []) : listings;
  return `<div class="maprow">
    <div class="panel nopad mapcanvas"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" class="mapbg"><rect width="100" height="100" fill="#e8eef0"/><path d="M0 70 Q30 60 55 72 T100 66 L100 100 L0 100Z" fill="#cfe3ea"/><g stroke="#fff" stroke-width="1" opacity=".7"><path d="M0 40H100M0 66H100M40 0V100M70 0V100"/></g></svg><div class="bubbles">${bubbles}</div></div>
    <div class="panel nopad maplist"><div class="ph pad">${mapSel ? esc(mapSel) + " · " : "全部 · "}${show.length} 套 ${mapSel ? `<span class="link" data-act="mapclear">查看全部</span>` : ""}</div>
      ${show.map((l) => `<div class="mlrow"><div><b>${esc(l.community)}</b><div class="sub">${esc(l.rooms)}·${l.area}㎡·${esc(l.floor)}</div></div><span class="price">${wan(l.price)}</span></div>`).join("")}</div></div>`;
}

function vChat() {
  const c = clients.find((x) => x.id === chatSel) || clients[0];
  const list = clients.map((x) => `<div class="clitem ${x.id === c.id ? "on" : ""}" data-act="pickchat" data-id="${x.id}"><span class="av">${esc(x.name[0])}</span><div><b>${esc(x.name)}</b><span class="sub">${esc(x.region)}·${esc(x.budget)}</span></div></div>`).join("");
  const msgs = c._chat || [{ who: "c", t: `你好，我想看看${c.region}${c.rooms}的房子` }, { who: "me", t: `${c.name}您好！这边有几套很合适，方便约个时间带看吗？` }];
  return `<div class="chatwrap">
    <div class="panel nopad cllist">${list}</div>
    <div class="panel nopad chatmain">
      <div class="chathead"><span class="av">${esc(c.name[0])}</span><b>${esc(c.name)}</b><span class="sub">${esc(c.phone)}</span></div>
      <div class="chatbody">${msgs.map((m) => m.who === "me" ? `<div class="cmsg me"><div class="cb">${esc(m.t)}</div></div>` : `<div class="cmsg c"><span class="av">${esc(c.name[0])}</span><div class="cb">${esc(m.t)}</div></div>`).join("")}</div>
      <div class="chatinput"><input id="chatIn" class="line" placeholder="发消息…"/><button class="btn" data-act="chatsend">发送</button></div>
    </div></div>`;
}

const VIEWS = { dashboard: vDashboard, listings: vListings, clients: vClients, follow: vFollow, perf: vPerf, rank: vRank, sign: vSign, map: vMap, chat: vChat };

/* ---------- 抽屉 ---------- */
function drawerHTML() {
  if (!drawer) return "";
  let body = "", title = "";
  if (drawer === "addListing") {
    title = "录入房源";
    body = `<div class="frow2"><div><label>小区</label><input id="f_comm" class="line"/></div><div><label>区域</label><input id="f_region" class="line" placeholder="徐汇"/></div></div>
      <div class="frow2"><div><label>户型</label><input id="f_rooms" class="line" placeholder="2室1厅"/></div><div><label>面积㎡</label><input id="f_area" class="line" type="number"/></div></div>
      <div class="frow2"><div><label>楼层</label><input id="f_floor" class="line" placeholder="中楼层/6层"/></div><div><label>朝向</label><input id="f_orient" class="line" placeholder="朝南"/></div></div>
      <div class="frow2"><div><label>价格(万)</label><input id="f_price" class="line" type="number"/></div><div><label>来源</label><input id="f_source" class="line" placeholder="线上端口"/></div></div>
      <div class="frow"><label>标签(逗号分隔)</label><input id="f_tags" class="line" placeholder="满五唯一,近地铁"/></div>
      <button class="btn block" data-act="saveListing">保存入库</button>`;
  } else if (drawer === "batch") {
    title = "批量录入（每行一套：小区,区域,户型,面积,楼层,朝向,价格）";
    body = `<textarea id="batchTa" class="ta" placeholder="建岚公寓,徐汇,2室1厅,71,中楼层,朝南,698&#10;静安丽舍,静安,3室2厅,97,高楼层,朝南,1280"></textarea>
      <button class="btn block" data-act="saveBatch">解析并入库</button>`;
  } else if (drawer === "parse") {
    title = "消息解析录入（粘贴群里的房源消息，自动拆成房源）";
    body = `<div class="parsetop"><textarea id="parseTa" class="ta">${parsed._src || ""}</textarea>
        <div class="parsebtns"><button class="btn ghost" data-act="fillsample">填入样例</button><button class="btn" data-act="doparse">${ic("import")} 解析</button></div></div>
      ${parsed.length ? `<div class="ph">解析结果（${parsed.length}）<span class="muted sm">勾选后入库，字段可点开编辑</span></div>
        ${parsed.map((p, i) => `<div class="pcard"><span class="ck ${p._ck ? "on" : ""}" data-act="pck" data-i="${i}"></span>
          <div class="pc-body"><div class="pc-h"><b>${esc(p.community || "（未识别小区）")}</b><span class="badge cf-${p.confidence}">${p.confidence}信度</span></div>
          <div class="pc-meta">${[p.region, p.rooms, p.area ? p.area + "㎡" : "", p.floor, p.orient].filter(Boolean).map(esc).join(" · ")}</div>
          <div class="pc-row"><span class="price">${esc(p.priceText || "—")}</span>${p.phone ? `<span class="sub">${esc(p.phone)}</span>` : ""}<span class="pc-tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</span></div></div></div>`).join("")}
        <button class="btn block" data-act="saveParsed">入库选中（${parsed.filter((p) => p._ck).length}）</button>` : `<div class="muted sm">粘贴消息后点「解析」，或先「填入样例」试试。</div>`}`;
  } else if (drawer === "addClient") {
    title = "录入客源";
    body = `<div class="frow2"><div><label>姓名</label><input id="c_name" class="line"/></div><div><label>手机号</label><input id="c_phone" class="line"/></div></div>
      <div class="frow2"><div><label>意向区域</label><input id="c_region" class="line" placeholder="徐汇"/></div><div><label>户型</label><input id="c_rooms" class="line" placeholder="2室"/></div></div>
      <div class="frow2"><div><label>预算</label><input id="c_budget" class="line" placeholder="600-800万"/></div><div><label>等级</label><select id="c_level" class="line"><option>A</option><option>B</option><option>C</option></select></div></div>
      <div class="frow"><label>首次跟进</label><input id="c_note" class="line" placeholder="客户来源/需求要点"/></div>
      <button class="btn block" data-act="saveClient">保存入库</button>`;
  } else if (drawer === "share") {
    title = "批量分享";
    const items = listings.filter((l) => sel.has(l.id));
    const text = items.map((l) => `🏠${l.community} ${l.rooms} ${l.area}㎡ ${l.floor} ${l.orient} ${l.price}万 ${l.tags.join("/")}（${D.me.name} ${D.company}）`).join("\n");
    body = `<div class="muted sm">已选 ${items.length} 套，自动生成群发文案，可一键复制到微信群。</div>
      <textarea id="shareTa" class="ta" readonly>${esc(text)}</textarea>
      <div class="sharePosters">${items.slice(0, 3).map((l) => `<div class="poster"><div class="po-img">${ic("buildings")}</div><div class="po-p">${l.price}万</div><div class="po-t">${esc(l.community)}</div><div class="po-s">${esc(l.rooms)}·${l.area}㎡</div></div>`).join("")}</div>
      <button class="btn block" data-act="copyshare">${ic("share")} 复制群发文案</button>`;
  }
  return `<div class="dmask" data-act="closedrawer"></div><div class="drawer"><div class="dh"><b>${esc(title)}</b><span class="dx" data-act="closedrawer">✕</span></div><div class="dbody">${body}</div></div>`;
}

/* ---------- 渲染 ---------- */
function render() {
  app.innerHTML = `
    <aside class="sidebar">
      <div class="logo"><span class="logo-ic">${ic("buildings")}</span><div><b>经纪人工作台</b><span>${esc(D.company)}</span></div></div>
      <nav>${NAV.map((n) => `<a class="navitem ${n[0] === view ? "on" : ""}" data-nav="${n[0]}"><span class="ni-ic">${ic(n[2])}</span>${n[1]}</a>`).join("")}</nav>
      <div class="mebox"><span class="av">${esc(D.me.badge)}</span><div><b>${esc(D.me.name)}</b><span>${esc(D.me.role)} · ${esc(D.me.team)}</span></div></div>
    </aside>
    <main class="main">
      <header class="topbar"><div class="tt">${NAV.find((n) => n[0] === view)[1]}</div>
        <div class="tsearch"><span>${ic("search")}</span><input placeholder="搜索房源 / 客源 / 小区"/></div>
        <div class="tact"><span class="ti">${ic("bell")}</span><span class="ti">${ic("gear")}</span></div></header>
      <section class="content">${VIEWS[view]()}</section>
    </main>${drawerHTML()}`;
}

function colorOf(name) { return { "线上端口": "#fa5741", "门店到访": "#3b82f6", "老客转介": "#f59e0b", "小程序": "#10b981" }[name] || "#888"; }
function stCls(s) { return { "在售": "ok", "已成交": "done", "下架": "off", "跟进中": "ok", "新": "new", "已带看": "warn", "战败": "off" }[s] || "ok"; }
function matchFor(c) {
  const lo = +(c.budget.match(/(\d+)/) || [0, 0])[1], hi = +(c.budget.match(/-(\d+)/) || [0, 9999])[1] || 9999;
  const rn = +(c.rooms.match(/(\d)/) || [0, 0])[1];
  return listings.filter((l) => l.status === "在售" && l.region === c.region && l.price >= lo * 0.85 && l.price <= hi * 1.15 && (!rn || l.rooms.startsWith(rn + "室")));
}

/* ---------- 交互 ---------- */
app.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-nav]");
  if (nav) { view = nav.dataset.nav; drawer = null; render(); return; }
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act, id = el.dataset.id;
  if (a === "drawer") { drawer = el.dataset.d; if (drawer === "parse") parsed = []; render(); }
  else if (a === "closedrawer") { drawer = null; render(); }
  else if (a === "selrow") { sel.has(id) ? sel.delete(id) : sel.add(id); render(); }
  else if (a === "shareone") { sel = new Set([id]); drawer = "share"; render(); }
  else if (a === "openclient") { curClient = id; view = "follow"; render(); }
  else if (a === "pickclient") { curClient = id; render(); }
  else if (a === "matchclient") { curClient = id; view = "follow"; render(); }
  else if (a === "addfollow") { const v = (document.getElementById("folInput").value || "").trim(); if (!v) return; const c = clients.find((x) => x.id === curClient); c.follows.unshift({ date: today(), text: v }); c.last = today(); toast("已记录跟进"); render(); }
  else if (a === "metric") { perfMetric = el.dataset.m; render(); }
  else if (a === "mapsel") { mapSel = el.dataset.r; render(); }
  else if (a === "mapclear") { mapSel = null; render(); }
  else if (a === "pickchat") { chatSel = id; render(); }
  else if (a === "chatsend") { const v = (document.getElementById("chatIn").value || "").trim(); if (!v) return; const c = clients.find((x) => x.id === chatSel); c._chat = (c._chat || [{ who: "c", t: `你好，我想看看${c.region}${c.rooms}的房子` }, { who: "me", t: `${c.name}您好！这边有几套很合适，方便约个时间带看吗？` }]); c._chat.push({ who: "me", t: v }); render(); setTimeout(() => { c._chat.push({ who: "c", t: "好的，那约这周末看房吧～" }); if (view === "chat") render(); }, 800); }
  else if (a === "signfrom") { presetSign = { l: el.dataset.l, c: el.dataset.c }; view = "sign"; drawer = null; render(); }
  else if (a === "dosign") doSign();
  // 抽屉内
  else if (a === "saveListing") saveListing();
  else if (a === "saveBatch") saveBatch();
  else if (a === "fillsample") { parsed = []; parsed._src = window.SAMPLE_MSG; render(); setTimeout(() => { const ta = document.getElementById("parseTa"); if (ta) ta.value = window.SAMPLE_MSG; }, 0); }
  else if (a === "doparse") { const t = document.getElementById("parseTa").value; parsed = window.parseListings(t, D.regions); parsed.forEach((p) => p._ck = p.confidence !== "低"); parsed._src = t; render(); }
  else if (a === "pck") { const i = +el.dataset.i; parsed[i]._ck = !parsed[i]._ck; render(); }
  else if (a === "saveParsed") saveParsed();
  else if (a === "saveClient") saveClient();
  else if (a === "copyshare") { const ta = document.getElementById("shareTa"); ta.select(); try { document.execCommand("copy"); } catch (e) { } toast("已复制群发文案"); }
});

let presetSign = null;
function today() { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function g(id) { const e = document.getElementById(id); return e ? e.value.trim() : ""; }
function saveListing() {
  if (!g("f_comm")) { toast("请填小区"); return; }
  listings.unshift({ id: "n" + Date.now(), community: g("f_comm"), region: g("f_region"), rooms: g("f_rooms"), area: +g("f_area") || 0, floor: g("f_floor"), orient: g("f_orient"), price: +g("f_price") || 0, status: "在售", agent: D.me.name, source: g("f_source") || "手动录入", tags: g("f_tags") ? g("f_tags").split(/[,，]/).filter(Boolean) : [], date: today() });
  drawer = null; toast("已入库"); render();
}
function saveBatch() {
  const lines = g("batchTa").split(/\r?\n/).filter(Boolean); let n = 0;
  lines.forEach((ln) => { const p = ln.split(/[,，]/).map((x) => x.trim()); if (p[0]) { listings.unshift({ id: "n" + Date.now() + n, community: p[0], region: p[1] || "", rooms: p[2] || "", area: +p[3] || 0, floor: p[4] || "", orient: p[5] || "", price: +p[6] || 0, status: "在售", agent: D.me.name, source: "批量录入", tags: [], date: today() }); n++; } });
  drawer = null; toast(`已入库 ${n} 套`); render();
}
function saveParsed() {
  const chosen = parsed.filter((p) => p._ck); if (!chosen.length) { toast("请勾选房源"); return; }
  chosen.forEach((p, i) => listings.unshift({ id: "p" + Date.now() + i, community: p.community || "待补全", region: p.region, rooms: p.rooms, area: p.area, floor: p.floor, orient: p.orient, price: p.price, status: "在售", agent: D.me.name, source: "消息解析", tags: p.tags, date: today() }));
  drawer = null; parsed = []; toast(`已入库 ${chosen.length} 套`); view = "listings"; render();
}
function saveClient() {
  if (!g("c_name")) { toast("请填姓名"); return; }
  clients.unshift({ id: "nc" + Date.now(), name: g("c_name"), phone: g("c_phone") || "未填", region: g("c_region"), budget: g("c_budget"), rooms: g("c_rooms"), status: "新", agent: D.me.name, level: g("c_level") || "B", last: today(), follows: g("c_note") ? [{ date: today(), text: g("c_note") }] : [] });
  drawer = null; toast("客源已入库"); render();
}
function doSign() {
  const l = listings.find((x) => x.id === g("sgList")), c = clients.find((x) => x.id === g("sgClient"));
  if (!l || !c) { toast("请选择房源和客源"); return; }
  signs.unshift({ community: l.community, client: c.name, price: +g("sgPrice") || l.price });
  toast("电子签约已发起，等待双方签署"); render();
}
render();
