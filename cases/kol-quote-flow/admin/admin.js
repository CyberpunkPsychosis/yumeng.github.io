/* 无代码配置后台 · 原型
 * 纯前端 + localStorage，演示"客户全程页面操作"的体验。
 * 真接后端时：把 load/save 换成 fetch /api/config 即可，界面不动。
 */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- 厂商预设（呼应后端 llm.js）---------- */
const PROVIDERS = {
  anthropic: { label: "Claude (Anthropic)", baseUrl: "", compat: false, models: ["claude-opus-4-8", "claude-sonnet-4-6", "claude-haiku-4-5"] },
  openai:    { label: "OpenAI",      baseUrl: "https://api.openai.com/v1", compat: true, models: ["gpt-4o", "gpt-4o-mini"] },
  deepseek:  { label: "DeepSeek",    baseUrl: "https://api.deepseek.com/v1", compat: true, models: ["deepseek-chat"] },
  qwen:      { label: "通义千问",     baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", compat: true, models: ["qwen-plus", "qwen-max"] },
  moonshot:  { label: "Moonshot",    baseUrl: "https://api.moonshot.cn/v1", compat: true, models: ["moonshot-v1-8k", "moonshot-v1-32k"] },
  zhipu:     { label: "智谱 GLM",     baseUrl: "https://open.bigmodel.cn/api/paas/v4", compat: true, models: ["glm-4-flash", "glm-4-plus"] },
  custom:    { label: "自定义 (OpenAI 兼容)", baseUrl: "", compat: true, models: [] },
};

/* ---------- 默认配置（KOL 报价模板预置）---------- */
const DEFAULTS = {
  source: { type: "gmail", authorized: true, email: "ops@yourbrand.com", label: "KOL报价", intervalMin: 5 },
  llm: { provider: "anthropic", model: "claude-opus-4-8", apiKey: "", baseUrl: "" },
  template: {
    name: "KOL 报价",
    fields: [
      { key: "kol_name", label: "KOL", type: "text", required: true, feishu: "KOL" },
      { key: "platform", label: "平台", type: "text", required: true, feishu: "平台" },
      { key: "handle", label: "主页/Handle", type: "text", required: false, feishu: "主页/Handle" },
      { key: "followers", label: "粉丝量", type: "text", required: false, feishu: "粉丝量" },
      { key: "price", label: "报价", type: "number", required: true, feishu: "报价" },
      { key: "currency", label: "币种", type: "text", required: true, feishu: "币种" },
      { key: "deliverables", label: "合作形式", type: "text", required: false, feishu: "合作形式" },
      { key: "timeline", label: "可上线时间", type: "text", required: false, feishu: "可上线时间" },
      { key: "contact_email", label: "联系邮箱", type: "text", required: false, feishu: "联系邮箱" },
      { key: "notes", label: "备注", type: "text", required: false, feishu: "备注" },
    ],
  },
  destination: {
    type: "feishu", connected: true, appToken: "bascn••••••", tableId: "tbl••••••",
    columns: ["KOL", "平台", "主页/Handle", "粉丝量", "报价", "币种", "合作形式", "可上线时间", "联系邮箱", "备注", "状态"],
  },
  running: true,
};

const KEY = "intake_config";
const load = () => { try { return { ...structuredClone(DEFAULTS), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return structuredClone(DEFAULTS); } };
const save = () => { localStorage.setItem(KEY, JSON.stringify(state)); };
let state = load();

/* ---------- 导航 ---------- */
const STEPS = [
  { id: "source", n: 1, t: "数据源", d: "邮件从哪来" },
  { id: "model", n: 2, t: "模型", d: "用哪个 AI" },
  { id: "template", n: 3, t: "字段模板", d: "抽哪些字段" },
  { id: "destination", n: 4, t: "去向", d: "写到飞书哪张表" },
  { id: "run", n: 5, t: "运行", d: "启停与日志" },
];
let active = "template"; // 默认落在最能体现"无代码"的字段模板编辑器

function renderNav() {
  $("nav").innerHTML = STEPS.map((s) =>
    `<div class="step ${s.id === active ? "active" : ""}" data-step="${s.id}">
       <div class="n">${s.n}</div>
       <div><div class="t">${s.t}</div><div class="d">${s.d}</div></div>
     </div>`).join("");
  $("nav").querySelectorAll(".step").forEach((el) =>
    el.addEventListener("click", () => { active = el.dataset.step; render(); }));
}

function render() {
  renderNav();
  ({ source: renderSource, model: renderModel, template: renderTemplate, destination: renderDest, run: renderRun }[active])();
}

/* ---------- ① 数据源 ---------- */
function renderSource() {
  const s = state.source;
  $("panel").innerHTML = `
    <h1>数据源</h1>
    <p class="sub">报价邮件从这里进来。底层 Google 应用我们已帮你接好，你只需点授权。</p>
    <div class="card">
      <h3>Gmail</h3>
      <div class="hint">给报价信打上下面这个标签，系统会定时拉取。</div>
      <p style="margin-bottom:12px">${s.authorized
        ? `<span class="badge ok">已授权 · ${esc(s.email)}</span>`
        : `<span class="badge">未授权</span>`}
        <button id="authBtn" class="btn sm" style="margin-left:8px">${s.authorized ? "重新授权" : "授权 Gmail"}</button>
      </p>
      <div class="row">
        <label class="field"><span>监控标签</span><input id="label" value="${esc(s.label)}" /></label>
        <label class="field"><span>轮询间隔（分钟）</span><input id="interval" type="number" value="${s.intervalMin}" /></label>
      </div>
    </div>`;
  $("authBtn").onclick = () => { state.source.authorized = true; state.source.email = "ops@yourbrand.com"; save(); toast("已授权 Gmail（演示）"); render(); };
  $("label").oninput = (e) => { state.source.label = e.target.value; save(); };
  $("interval").oninput = (e) => { state.source.intervalMin = Number(e.target.value || 5); save(); };
}

/* ---------- ② 模型 ---------- */
function renderModel() {
  const l = state.llm;
  const p = PROVIDERS[l.provider] || PROVIDERS.anthropic;
  $("panel").innerHTML = `
    <h1>模型</h1>
    <p class="sub">一个下拉切换任意厂商/模型。换模型不影响其它配置。</p>
    <div class="card">
      <div class="row">
        <label class="field"><span>厂商</span>
          <select id="provider">${Object.entries(PROVIDERS).map(([k, v]) =>
            `<option value="${k}" ${k === l.provider ? "selected" : ""}>${v.label}</option>`).join("")}</select>
        </label>
        <label class="field"><span>模型</span>
          <input id="model" list="models" value="${esc(l.model)}" placeholder="模型名" />
          <datalist id="models">${p.models.map((m) => `<option value="${m}">`).join("")}</datalist>
        </label>
      </div>
      <label class="field"><span>API Key</span><input id="apiKey" type="password" value="${esc(l.apiKey)}" placeholder="${l.provider === "anthropic" ? "sk-ant-..." : "sk-..."}" /></label>
      ${p.compat ? `<label class="field"><span>Base URL（OpenAI 兼容端点）</span><input id="baseUrl" value="${esc(l.baseUrl || p.baseUrl)}" /></label>` : ""}
      <div style="display:flex;gap:10px;align-items:center;margin-top:4px">
        <button id="testBtn" class="btn sm">测试连接</button>
        <span id="testRes" class="badge" style="display:none"></span>
      </div>
    </div>
    <div class="card" style="background:transparent;border-style:dashed">
      <div class="hint" style="margin:0">提示：高并发场景可选更便宜的 Haiku / DeepSeek / 通义；要最准用 Claude Opus。客户可填自己的 key，数据与成本都在自己侧。</div>
    </div>`;
  $("provider").onchange = (e) => {
    const np = PROVIDERS[e.target.value];
    state.llm.provider = e.target.value;
    state.llm.model = np.models[0] || "";
    state.llm.baseUrl = np.baseUrl || "";
    save(); renderModel();
  };
  $("model").oninput = (e) => { state.llm.model = e.target.value; save(); };
  $("apiKey").oninput = (e) => { state.llm.apiKey = e.target.value; save(); };
  if ($("baseUrl")) $("baseUrl").oninput = (e) => { state.llm.baseUrl = e.target.value; save(); };
  $("testBtn").onclick = () => {
    const ok = !!(state.llm.model && (state.llm.apiKey || true));
    const el = $("testRes"); el.style.display = "inline-flex";
    el.className = "badge " + (ok ? "ok" : ""); el.textContent = ok ? "连接正常（演示）" : "请填模型";
  };
}

/* ---------- ③ 字段模板（重点）---------- */
const slug = (label, i) => {
  const s = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return s || `field_${i + 1}`;
};

function renderTemplate() {
  const t = state.template;
  $("panel").innerHTML = `
    <h1>字段模板</h1>
    <p class="sub">定义要从邮件里抽哪些字段——这就是"换个行业就复用"的地方，全程不碰代码。</p>
    <div class="card" style="padding:14px 18px">
      <label class="field" style="margin:0"><span>模板名称</span><input id="tplName" value="${esc(t.name)}" /></label>
    </div>
    <div class="tpl">
      <div>
        <div class="flist" id="flist"></div>
        <button id="addF" class="btn ghost sm" style="margin-top:10px">+ 新增字段</button>
      </div>
      <div class="preview">
        <div class="pv-h">审核台预览（所见即所得）</div>
        <div class="pvcard"><div class="pvgrid" id="preview"></div></div>
      </div>
    </div>`;
  $("tplName").oninput = (e) => { t.name = e.target.value; save(); };
  $("addF").onclick = () => { t.fields.push({ key: slug("", t.fields.length), label: "新字段", type: "text", required: false, feishu: "" }); save(); renderTemplate(); };
  renderFieldList();
  renderPreview();
}

function renderFieldList() {
  const t = state.template;
  $("flist").innerHTML = t.fields.map((f, i) => `
    <div class="frow" data-i="${i}">
      <input data-p="label" value="${esc(f.label)}" placeholder="显示名" />
      <input data-p="feishu" value="${esc(f.feishu)}" placeholder="飞书列名" />
      <select data-p="type">
        ${["text", "number", "date"].map((tp) => `<option value="${tp}" ${tp === f.type ? "selected" : ""}>${{ text: "文本", number: "数字", date: "日期" }[tp]}</option>`).join("")}
      </select>
      <div class="ops">
        <button class="iconbtn" data-act="up" title="上移">↑</button>
        <button class="iconbtn" data-act="down" title="下移">↓</button>
        <button class="iconbtn" data-act="del" title="删除">✕</button>
      </div>
      <div class="fkey"><label class="req"><input type="checkbox" data-p="required" ${f.required ? "checked" : ""} style="width:auto" /> 必填</label>　字段名 <code>${esc(f.key)}</code></div>
    </div>`).join("");

  $("flist").querySelectorAll(".frow").forEach((row) => {
    const i = Number(row.dataset.i);
    row.querySelectorAll("[data-p]").forEach((el) => {
      const p = el.dataset.p;
      const ev = el.type === "checkbox" ? "change" : "input";
      el.addEventListener(ev, () => {
        const f = state.template.fields[i];
        if (p === "required") f.required = el.checked;
        else f[p] = el.value;
        if (p === "label" && !state.template.fields[i]._keyEdited) f.key = slug(el.value, i);
        save(); renderPreview();
        if (p === "label") row.querySelector("code").textContent = f.key; // 更新字段名提示，不重建避免失焦
      });
    });
    row.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => {
      const fs = state.template.fields, act = b.dataset.act;
      if (act === "del") fs.splice(i, 1);
      if (act === "up" && i > 0) [fs[i - 1], fs[i]] = [fs[i], fs[i - 1]];
      if (act === "down" && i < fs.length - 1) [fs[i + 1], fs[i]] = [fs[i], fs[i + 1]];
      save(); renderTemplate();
    }));
  });
}

function renderPreview() {
  $("preview").innerHTML = state.template.fields.map((f) =>
    `<div class="pvf"><span>${esc(f.label || "（未命名）")}${f.required ? " <b>*</b>" : ""}</span>
       <input type="${f.type === "number" ? "number" : "text"}" placeholder="${f.type === "number" ? "0" : ""}" tabindex="-1" /></div>`).join("");
}

/* ---------- ④ 去向：飞书 ---------- */
function renderDest() {
  const d = state.destination, fields = state.template.fields;
  $("panel").innerHTML = `
    <h1>去向 · 飞书多维表格</h1>
    <p class="sub">底层飞书应用我们已接好。选好表，把模板字段对到飞书的列。</p>
    <div class="card">
      <p style="margin-bottom:12px"><span class="badge ok">飞书应用已连接</span></p>
      <div class="row">
        <label class="field"><span>多维表格 App Token</span><input id="appToken" value="${esc(d.appToken)}" /></label>
        <label class="field"><span>数据表 Table ID</span><input id="tableId" value="${esc(d.tableId)}" /></label>
      </div>
      <button id="pullCols" class="btn ghost sm">拉取表头</button>
      <span class="hint" style="margin-left:8px">已识别 ${d.columns.length} 列</span>
    </div>
    <div class="card">
      <h3>字段映射</h3>
      <div class="hint">左边是模板字段，右边选对应的飞书列。</div>
      <table class="maptable"><thead><tr><th>模板字段</th><th>→ 飞书列</th></tr></thead><tbody>
        ${fields.map((f) => `<tr><td>${esc(f.label)}</td><td>
          <select data-key="${f.key}">
            <option value="">（不写入）</option>
            ${d.columns.map((c) => `<option value="${esc(c)}" ${c === f.feishu ? "selected" : ""}>${esc(c)}</option>`).join("")}
          </select></td></tr>`).join("")}
      </tbody></table>
    </div>`;
  $("appToken").oninput = (e) => { d.appToken = e.target.value; save(); };
  $("tableId").oninput = (e) => { d.tableId = e.target.value; save(); };
  $("pullCols").onclick = () => { toast("已拉取飞书表头（演示）"); render(); };
  $("panel").querySelectorAll("[data-key]").forEach((sel) => sel.addEventListener("change", () => {
    const f = state.template.fields.find((x) => x.key === sel.dataset.key);
    if (f) { f.feishu = sel.value; save(); }
  }));
}

/* ---------- ⑤ 运行 ---------- */
const MOCK_LOG = [
  ["09:42", "Collab proposal – Mia Vlogs", "Mia Vlogs · YouTube · $1,800", "待确认"],
  ["09:15", "Partnership inquiry", "@streetstyle_ko · Instagram · $650", "已入库"],
  ["08:53", "Re: rate card", "TechDaily · YouTube · $3,200", "已入库"],
];
function renderRun() {
  const on = state.running;
  $("panel").innerHTML = `
    <h1>运行</h1>
    <p class="sub">启动后系统按设定间隔自动拉邮件、抽取、进待确认队列。</p>
    <div class="card" style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <h3 style="margin-bottom:2px">自动处理</h3>
        <div class="hint" style="margin:0">${on ? "运行中 · 每 " + state.source.intervalMin + " 分钟一轮" : "已停止"}</div>
      </div>
      <div class="switch ${on ? "on" : ""}" id="sw"><div class="track"><div class="knob"></div></div></div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:10px">最近处理</h3>
      <div class="log">${MOCK_LOG.map(([ts, subj, res, st]) =>
        `<div class="ln"><span class="ts">${ts}</span><span>${esc(subj)} → <b>${esc(res)}</b></span>
         <span class="st"><span class="badge ${st === "已入库" ? "ok" : ""}">${st}</span></span></div>`).join("")}</div>
      <p style="margin-top:12px"><a class="link" href="../web/index.html">→ 打开人工审核台</a></p>
    </div>`;
  $("sw").onclick = () => { state.running = !state.running; save(); renderRun(); };
}

/* ---------- 顶栏动作 ---------- */
$("saveBtn").onclick = () => { save(); toast("已保存"); };
$("exportBtn").onclick = () => { $("modalText").value = JSON.stringify(state, null, 2); $("modal").classList.remove("hidden"); };
$("modalClose").onclick = () => $("modal").classList.add("hidden");

let toastTimer;
function toast(msg) {
  const el = $("toast"); el.textContent = msg; el.classList.remove("hidden");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.add("hidden"), 1800);
}

render();
