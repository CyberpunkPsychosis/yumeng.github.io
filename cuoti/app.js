/* AI 错题本
 * 拍错题 → 混元视觉分析(学科/知识点/解析/易错点) → 本地 IndexedDB 存储
 * → 错题列表 + 薄弱点统计 + 复习(默认折叠隐藏答案)
 */
const $ = (id) => document.getElementById(id);
const PROXY = "https://hunyuan-photo-proxy.yumenglalala.workers.dev";

let items = [];          // 全部错题
let filterSubject = "全部";
let pending = null;       // 待保存的分析结果

/* ---------- IndexedDB ---------- */
function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("cuotiben", 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains("items")) db.createObjectStore("items", { keyPath: "id" });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function dbAll() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const rq = db.transaction("items").objectStore("items").getAll();
    rq.onsuccess = () => res(rq.result || []);
    rq.onerror = () => rej(rq.error);
  });
}
async function dbPut(item) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("items", "readwrite");
    tx.objectStore("items").put(item);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function dbDel(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("items", "readwrite");
    tx.objectStore("items").delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

/* ---------- 工具 ---------- */
const esc = (s) => String(s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

// 压缩图片为 dataURL
function fileToDataURL(file, maxW) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.82));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

// 从模型返回里抽出 JSON
function parseResult(text) {
  let t = String(text || "").trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) t = t.slice(a, b + 1);
  return JSON.parse(t);
}

/* ---------- 添加错题 ---------- */
$("fab").addEventListener("click", () => $("fileInput").click());

$("fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const aiImg = await fileToDataURL(file, 1280);  // 给 AI 看（清晰认字）
  const thumb = await fileToDataURL(file, 900);   // 存储用
  openAnalyze(aiImg, thumb);
});

function openAnalyze(aiImg, thumb) {
  pending = null;
  $("previewImg").src = thumb;
  $("analyzeStatus").classList.remove("hidden");
  $("analyzeStatus").textContent = "AI 正在分析这道题…";
  $("analyzeResult").classList.add("hidden");
  $("analyzeActions").classList.add("hidden");
  $("analyzeOverlay").classList.remove("hidden");
  analyze(aiImg, thumb);
}

async function analyze(aiImg, thumb) {
  try {
    const resp = await fetch(PROXY + "/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: aiImg, mode: "cuoti" }),
    });
    if (!resp.ok) throw new Error("分析服务返回 " + resp.status);
    const data = await resp.json();
    const r = parseResult(data.text);
    pending = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      img: thumb,
      subject: r.subject || "其他",
      topic: r.topic || "未识别",
      tags: Array.isArray(r.tags) ? r.tags.slice(0, 3) : [],
      question: r.question || "",
      answer: r.answer || "",
      analysis: r.analysis || "",
      mistake: r.mistake || "",
      tip: r.tip || "",
      created: Date.now(),
      mastered: false,
    };
    renderAnalyzeResult(pending);
  } catch (err) {
    $("analyzeStatus").textContent = "分析失败：" + err.message + "（换张更清楚的图重试）";
  }
}

function renderAnalyzeResult(r) {
  $("analyzeStatus").classList.add("hidden");
  const box = $("analyzeResult");
  box.innerHTML = `
    <span class="badge">${esc(r.subject)}</span>
    <h4>知识点</h4><div>${esc(r.topic)} ${r.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join(" ")}</div>
    ${r.answer ? `<h4>正确答案</h4><div>${esc(r.answer)}</div>` : ""}
    <h4>解析</h4><div>${esc(r.analysis)}</div>
    ${r.mistake ? `<h4>你为什么错</h4><div>${esc(r.mistake)}</div>` : ""}
    ${r.tip ? `<h4>复习建议</h4><div>${esc(r.tip)}</div>` : ""}`;
  box.classList.remove("hidden");
  $("analyzeActions").classList.remove("hidden");
}

$("saveBtn").addEventListener("click", async () => {
  if (!pending) return;
  await dbPut(pending);
  $("analyzeOverlay").classList.add("hidden");
  await load();
});
$("discardBtn").addEventListener("click", () => $("analyzeOverlay").classList.add("hidden"));

/* ---------- 列表渲染 ---------- */
function subjects() {
  const set = new Set(items.map((i) => i.subject));
  return ["全部", ...set];
}

function renderFilters() {
  $("filters").innerHTML = subjects().map((s) =>
    `<button class="fchip${s === filterSubject ? " active" : ""}" data-s="${esc(s)}">${esc(s)}</button>`).join("");
  $("filters").querySelectorAll(".fchip").forEach((el) =>
    el.addEventListener("click", () => { filterSubject = el.dataset.s; renderList(); }));
}

function renderList() {
  renderFilters();
  const list = $("list");
  let data = items.slice().sort((a, b) => b.created - a.created);
  if (filterSubject !== "全部") data = data.filter((i) => i.subject === filterSubject);
  $("emptyList").classList.toggle("hidden", items.length > 0);
  list.innerHTML = data.map((i) => `
    <div class="card${i.mastered ? " done" : ""}" data-id="${i.id}">
      <div class="top">
        <img src="${i.img}" alt="" />
        <div class="meta">
          <span class="badge">${esc(i.subject)}</span>
          <div class="topic">${esc(i.topic)}</div>
          <div class="tags">${i.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        </div>
      </div>
      <div class="row2">
        <label class="master"><input type="checkbox" ${i.mastered ? "checked" : ""} data-master="${i.id}" />已掌握</label>
        <button class="expandBtn" data-exp="${i.id}">看解析 ▾</button>
      </div>
      <div class="detail hidden" id="d-${i.id}">
        ${i.answer ? `<h4>正确答案</h4><div>${esc(i.answer)}</div>` : ""}
        <h4>解析</h4><div>${esc(i.analysis)}</div>
        ${i.mistake ? `<h4>你为什么错</h4><div>${esc(i.mistake)}</div>` : ""}
        ${i.tip ? `<h4>复习建议</h4><div>${esc(i.tip)}</div>` : ""}
        <button class="del" data-del="${i.id}">删除这道</button>
      </div>
    </div>`).join("");

  list.querySelectorAll("[data-exp]").forEach((el) => el.addEventListener("click", () => {
    const d = $("d-" + el.dataset.exp);
    const open = d.classList.toggle("hidden");
    el.textContent = open ? "看解析 ▾" : "收起 ▴";
  }));
  list.querySelectorAll("[data-master]").forEach((el) => el.addEventListener("change", async () => {
    const it = items.find((x) => x.id === el.dataset.master);
    if (it) { it.mastered = el.checked; await dbPut(it); renderList(); }
  }));
  list.querySelectorAll("[data-del]").forEach((el) => el.addEventListener("click", async () => {
    if (!confirm("删除这道错题？")) return;
    await dbDel(el.dataset.del); await load();
  }));
}

/* ---------- 薄弱点统计 ---------- */
function renderStats() {
  const total = items.length, done = items.filter((i) => i.mastered).length;
  const tagCount = {}, subjCount = {};
  items.forEach((i) => {
    (i.tags.length ? i.tags : [i.topic]).forEach((t) => { if (t) tagCount[t] = (tagCount[t] || 0) + 1; });
    subjCount[i.subject] = (subjCount[i.subject] || 0) + 1;
  });
  const top = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const subj = Object.entries(subjCount).sort((a, b) => b[1] - a[1]);
  const maxT = top.length ? top[0][1] : 1, maxS = subj.length ? subj[0][1] : 1;
  const bars = (arr, max) => arr.map(([k, v]) =>
    `<div class="bar"><div class="lab"><span>${esc(k)}</span><b>${v}</b></div>
     <div class="track"><div class="fill" style="width:${Math.round(v / max * 100)}%"></div></div></div>`).join("");

  $("stats").innerHTML = `
    <div class="block">
      <div class="summary">
        <div class="s"><div class="n">${total}</div><div class="l">总错题</div></div>
        <div class="s"><div class="n">${done}</div><div class="l">已掌握</div></div>
        <div class="s"><div class="n">${total - done}</div><div class="l">待攻克</div></div>
      </div>
    </div>
    <div class="block"><h3>🎯 最常错的知识点（先攻这些）</h3>${top.length ? bars(top, maxT) : '<div class="empty" style="margin:10px">还没有数据</div>'}</div>
    <div class="block"><h3>📦 学科分布</h3>${subj.length ? bars(subj, maxS) : '<div class="empty" style="margin:10px">还没有数据</div>'}</div>`;
}

/* ---------- 视图切换 ---------- */
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === t));
  const v = t.dataset.view;
  $("view-list").classList.toggle("hidden", v !== "list");
  $("view-stats").classList.toggle("hidden", v !== "stats");
  if (v === "stats") renderStats();
}));

/* ---------- 启动 ---------- */
async function load() {
  items = await dbAll();
  renderList();
}
load();
