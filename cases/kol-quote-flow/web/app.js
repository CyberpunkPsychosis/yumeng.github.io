/* 审核台前端 —— 列出待确认报价，左看原邮件、右改字段，一键通过/驳回 */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let status = "pending";

// 字段定义（与后端 SCHEMA 对应）：key -> 中文标签 + 类型
const FIELDS = [
  ["kol_name", "KOL", "text"],
  ["platform", "平台", "text"],
  ["handle", "主页/Handle", "text"],
  ["followers", "粉丝量", "text"],
  ["price", "报价", "number"],
  ["currency", "币种", "text"],
  ["deliverables", "合作形式", "text"],
  ["timeline", "可上线时间", "text"],
  ["contact_email", "联系邮箱", "text"],
  ["notes", "备注", "text"],
];

async function load() {
  const recs = await fetch(`/api/records?status=${status}`).then((r) => r.json());
  const list = $("list");
  $("empty").classList.toggle("hidden", recs.length > 0);
  list.innerHTML = recs.map(card).join("");
  recs.forEach(wire);
}

function card(rec) {
  const src = rec.source || {};
  const inputs = FIELDS.map(([k, label, type]) =>
    `<label class="f"><span>${label}</span>
       <input data-k="${k}" type="${type}" value="${esc(rec.fields?.[k] ?? "")}"
              ${status === "pending" ? "" : "disabled"} /></label>`).join("");
  const actions = status === "pending"
    ? `<div class="actions">
         <button class="btn ghost" data-reject="${rec.id}">驳回</button>
         <button class="btn" data-approve="${rec.id}">确认入库 →</button>
       </div>`
    : `<div class="tag ${rec.status}">${rec.status === "approved" ? "已写入飞书" : "已驳回"}</div>`;
  return `<section class="rec" id="rec-${rec.id}">
    <div class="mail">
      <div class="mail-h">${esc(src.subject || "(无主题)")}</div>
      <div class="mail-meta">${esc(src.from || "")} · ${esc(src.date || "")}</div>
      <pre class="mail-body">${esc((src.body || "").slice(0, 1500))}</pre>
    </div>
    <div class="form">
      <div class="grid">${inputs}</div>
      ${actions}
      <div class="err" data-err></div>
    </div>
  </section>`;
}

function collect(id) {
  const fields = {};
  document.querySelectorAll(`#rec-${id} input[data-k]`).forEach((el) => {
    fields[el.dataset.k] = el.type === "number" ? Number(el.value || 0) : el.value;
  });
  return fields;
}

function wire(rec) {
  const root = $(`rec-${rec.id}`);
  if (!root) return;
  const errBox = root.querySelector("[data-err]");
  root.querySelector(`[data-approve]`)?.addEventListener("click", async (e) => {
    e.target.disabled = true; e.target.textContent = "写入中…";
    const resp = await fetch(`/api/records/${rec.id}/approve`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: collect(rec.id) }),
    });
    if (resp.ok) load();
    else { errBox.textContent = "⚠️ " + (await resp.json()).error; e.target.disabled = false; e.target.textContent = "确认入库 →"; }
  });
  root.querySelector(`[data-reject]`)?.addEventListener("click", async () => {
    await fetch(`/api/records/${rec.id}/reject`, { method: "POST" });
    load();
  });
}

document.querySelectorAll(".tab").forEach((t) =>
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === t));
    status = t.dataset.status;
    load();
  }));

load();
