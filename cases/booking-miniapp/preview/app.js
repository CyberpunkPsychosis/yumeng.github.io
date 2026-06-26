/* 服务预约 · 可点击多页原型
 * 浏览器里维护 state，切换 home/detail/booking/confirm 四个视图；提交为 mock。
 * 原生小程序版是真多页(navigateTo)，读同一份 config 结构。
 */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const screen = document.getElementById("screen");

let CFG, view = "home", dir = "fwd";
let cat = "all", curId = null, opt = {};
let form = { date: "", slot: "", extra: {}, name: "", phone: "", note: "" };

const ic = (k) => (window.ICONS && window.ICONS[k]) || "";
const item = (id) => CFG.items.find((x) => x.id === id);
const priceHtml = (it) => `<span class="price">¥${it.price}<span class="u">${esc(it.unit || "")}</span></span>`;

/* ---------- 视图 ---------- */
function vHome() {
  const h = CFG.hero;
  const chips = (CFG.categories || []).map((c) =>
    `<div class="chip ${c.id === cat ? "on" : ""}" data-act="chip" data-cat="${c.id}">${esc(c.name)}</div>`).join("");
  const list = CFG.items.filter((it) => cat === "all" || it.cat === cat).map((it) => `
    <div class="card" data-act="open" data-id="${it.id}">
      <img class="th" src="${esc(it.thumb)}" alt="" loading="lazy" />
      <div class="info">
        <div class="nm">${esc(it.name)}</div>
        <div class="ds">${esc(it.desc || "")}</div>
        <div class="bot">
          <div class="tagrow">${(it.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          ${priceHtml(it)}
        </div>
      </div>
    </div>`).join("");
  const steps = CFG.steps.map((s, i) =>
    `<div class="step"><div class="n">${i + 1}</div><div><div class="st">${esc(s.t)}</div><div class="sd">${esc(s.d)}</div></div></div>`).join("");
  const contact = CFG.contact.rows.map((r) => `<div class="r"><span class="k">${esc(r.k)}</span><span>${esc(r.v)}</span></div>`).join("");
  return `<div class="page ${dir}"><div class="scroll">
    <div class="statusbar" style="color:#fff;position:absolute;left:0;right:0;z-index:3"><span>16:15</span><span>···· 5G <span class="bat"></span></span></div>
    <div class="hero"><div class="bg" style="background-image:url('${esc(h.img)}')"></div>
      <div class="ct"><div class="eyebrow" style="color:#fff;opacity:.85">${esc(h.eyebrow || "")}</div>
        <h1>${esc(h.title)}</h1><p>${esc(h.sub || "")}</p></div></div>
    ${chips ? `<div class="chips">${chips}</div>` : ""}
    <div class="list">${list}</div>
    <div class="sec"><div class="h">预约流程</div><div class="steps" style="margin-top:14px">${steps}</div></div>
    <div class="contact">${contact}</div>
  </div>
  <div class="tabbar"><div class="t on"><span class="ic">${ic("home")}</span>首页</div><div class="t"><span class="ic">${ic("orders")}</span>订单</div><div class="t"><span class="ic">${ic("user")}</span>我的</div></div>
  </div>`;
}

function vDetail() {
  const it = item(curId);
  const options = (it.options || []).map((o) => `
    <div class="opt"><div class="ol">${esc(o.label)}</div><div class="ov">
      ${o.values.map((v) => `<div class="o ${opt[o.label] === v ? "on" : ""}" data-act="opt" data-label="${esc(o.label)}" data-val="${esc(v)}">${esc(v)}</div>`).join("")}
    </div></div>`).join("");
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="back-home">‹</div><div class="ttl">${esc(CFG.unitLabel)}详情</div></div>
    <div class="scroll">
      <div class="dimg" style="background-image:url('${esc(it.thumb)}')"></div>
      <div class="dbody">
        <div class="tagrow">${(it.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="nm">${esc(it.name)}</div>
        <div class="pr">${priceHtml(it)}</div>
        <div class="ds">${esc(it.desc || "")}</div>
        ${options}
      </div>
    </div>
    <div class="actionbar"><div class="meta"><div class="price" style="font-size:22px">¥${it.price}<span class="u">${esc(it.unit || "")}</span></div></div>
      <button class="btn" data-act="tobook">${esc(CFG.bookCta)}</button></div>
  </div>`;
}

function vBooking() {
  const it = item(curId);
  const b = CFG.booking;
  const slots = (b.slots || []).map((s) => `<div class="s ${form.slot === s ? "on" : ""}" data-act="slot" data-slot="${esc(s)}">${esc(s)}</div>`).join("");
  const extra = (b.extra || []).map((f) => {
    if (f.type === "stepper") {
      const v = form.extra[f.key] ?? f.value ?? f.min ?? 1;
      return `<div class="field"><div class="fl">${esc(f.label)}</div>
        <div class="stepper"><button data-act="step" data-key="${f.key}" data-dir="-1">−</button><div class="v">${v}</div><button data-act="step" data-key="${f.key}" data-dir="1">+</button></div></div>`;
    }
    if (f.type === "select") {
      return `<div class="field"><div class="fl">${esc(f.label)}</div><div class="selectrow">
        ${f.options.map((o) => `<div class="s ${form.extra[f.key] === o ? "on" : ""}" data-act="sel" data-key="${f.key}" data-val="${esc(o)}">${esc(o)}</div>`).join("")}</div></div>`;
    }
    return `<div class="field"><div class="fl">${esc(f.label)}</div><input data-field="extra:${f.key}" value="${esc(form.extra[f.key] || "")}" placeholder="请输入" /></div>`;
  }).join("");
  return `<div class="page ${dir}">
    <div class="appbar"><div class="back" data-act="back-detail">‹</div><div class="ttl">填写预约</div></div>
    <div class="scroll">
      <div class="summary"><img src="${esc(it.thumb)}" alt=""/><div><div class="nm">${esc(it.name)}</div><div class="price">¥${it.price}<span class="u">${esc(it.unit || "")}</span></div></div></div>
      <div class="form">
        <div class="field"><div class="fl">${esc(b.dateLabel || "预约日期")}</div><input class="dateinput" type="date" data-field="date" value="${esc(form.date)}" /></div>
        ${slots ? `<div class="field"><div class="fl">时段</div><div class="slots">${slots}</div></div>` : ""}
        ${extra}
        <div class="field"><div class="fl">联系人</div><input data-field="name" value="${esc(form.name)}" placeholder="您的姓名" /></div>
        <div class="field"><div class="fl">手机号</div><input data-field="phone" type="tel" value="${esc(form.phone)}" placeholder="用于联系您" /></div>
        <div class="field"><div class="fl">备注（选填）</div><input data-field="note" value="${esc(form.note)}" placeholder="补充说明" /></div>
      </div>
    </div>
    <div class="actionbar"><button class="btn block" data-act="submit">提交预约</button></div>
  </div>`;
}

function vConfirm() {
  const it = item(curId);
  const b = CFG.booking;
  const rows = [
    ["项目", it.name],
    [b.dateLabel || "日期", form.date || "—"],
    ...(form.slot ? [["时段", form.slot]] : []),
    ...(b.extra || []).map((f) => [f.label, String(form.extra[f.key] ?? "—")]),
    ["联系人", `${form.name || "—"} ${form.phone || ""}`],
  ];
  return `<div class="page ${dir}">
    <div class="statusbar"><span>16:15</span><span>···· 5G <span class="bat"></span></span></div>
    <div class="confirm">
      <div class="ok">✓</div>
      <h2>预约提交成功</h2>
      <div class="tip">我们会尽快与您联系确认（演示）</div>
      <div class="recap">${rows.map(([k, v]) => `<div class="r"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join("")}</div>
      <button class="btn block" style="margin-top:24px" data-act="tohome">返回首页</button>
    </div>
  </div>`;
}

const VIEWS = { home: vHome, detail: vDetail, booking: vBooking, confirm: vConfirm };
function render() { screen.innerHTML = VIEWS[view](); screen.querySelector(".scroll") && (screen.querySelector(".scroll").scrollTop = 0); }
function go(v, d = "fwd") { view = v; dir = d; render(); }

/* ---------- 交互（事件委托）---------- */
screen.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act;
  if (a === "chip") { cat = el.dataset.cat; render(); }
  else if (a === "open") {
    curId = el.dataset.id; opt = {};
    (item(curId).options || []).forEach((o) => { opt[o.label] = o.values[0]; });
    go("detail");
  }
  else if (a === "opt") { opt[el.dataset.label] = el.dataset.val; render(); }
  else if (a === "back-home") go("home", "back");
  else if (a === "tobook") { form = { date: "", slot: (CFG.booking.slots || [])[0] || "", extra: {}, name: "", phone: "", note: "" }; go("booking"); }
  else if (a === "back-detail") go("detail", "back");
  else if (a === "slot") { form.slot = el.dataset.slot; render(); }
  else if (a === "sel") { form.extra[el.dataset.key] = el.dataset.val; render(); }
  else if (a === "step") {
    const f = CFG.booking.extra.find((x) => x.key === el.dataset.key);
    const cur = Number(form.extra[f.key] ?? f.value ?? f.min ?? 0);
    const next = cur + Number(el.dataset.dir) * (f.step || 1);
    form.extra[f.key] = Math.max(f.min ?? 0, Math.min(f.max ?? 9999, next));
    render();
  }
  else if (a === "submit") {
    if (!form.date || !form.name || !form.phone) { alert("请填写日期、姓名、手机号"); return; }
    go("confirm");
  }
  else if (a === "tohome") { go("home", "back"); }
});

screen.addEventListener("input", (e) => {
  const f = e.target.dataset.field; if (!f) return;
  if (f.startsWith("extra:")) form.extra[f.slice(6)] = e.target.value;
  else form[f] = e.target.value;
});

/* ---------- 行业切换 ---------- */
const CONFIGS = window.BOOKING_CONFIGS;
const LABELS = { peizhen: "陪诊", minsu: "民宿预订", guahao: "医院挂号", jiazheng: "家政", yuesao: "月嫂母婴" };
const sw = document.getElementById("switcher");
let key = new URLSearchParams(location.search).get("c");
if (!CONFIGS[key]) key = "peizhen";
sw.innerHTML = Object.keys(CONFIGS).map((k) => `<button data-k="${k}" class="${k === key ? "on" : ""}">${LABELS[k] || k}</button>`).join("");
sw.addEventListener("click", (e) => {
  const k = e.target.dataset.k; if (!k) return;
  key = k; sw.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k));
  load(k);
});

function load(k) {
  CFG = CONFIGS[k];
  document.documentElement.style.setProperty("--accent", CFG.theme.accent);
  screen.dataset.mode = CFG.theme.mode || "light";
  cat = "all"; curId = null; opt = {};
  go("home");
}
load(key);
