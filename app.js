/* 案例库首页逻辑
 * 从 cases.js 的 CASES 渲染卡片，支持搜索 + 标签筛选。
 * 数据驱动：加案例只改 cases.js，这里不用动。
 */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// 👉 把下面换成你的微信号或邮箱，首页底部会显示出来
const CONTACT = "（在此填写你的微信号或邮箱）";

let activeTag = "全部";
let query = "";

/* 无截图时，按标题生成一个稳定的暖色渐变占位 */
function placeholder(title) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) % 360;
  const a = 18 + (h % 24);          // 陶土橙系附近取色
  const b = (a + 28) % 360;
  const glyph = esc([...title][0] || "✦");
  return `<div class="thumb" style="background:linear-gradient(135deg,hsl(${a} 46% 62%),hsl(${b} 40% 50%))">
            <span class="glyph">${glyph}</span>
          </div>`;
}

function allTags() {
  const set = new Set();
  CASES.forEach((c) => (c.tags || []).forEach((t) => set.add(t)));
  return ["全部", ...set];
}

function renderTags() {
  const tags = allTags();
  // 只有一个"全部"（即没有任何标签）时就不显示筛选条
  $("tags").innerHTML = tags.length <= 1 ? "" : tags.map((t) =>
    `<button class="chip${t === activeTag ? " active" : ""}" data-tag="${esc(t)}">${esc(t)}</button>`).join("");
  $("tags").querySelectorAll(".chip").forEach((el) =>
    el.addEventListener("click", () => { activeTag = el.dataset.tag; render(); }));
}

function match(c) {
  if (activeTag !== "全部" && !(c.tags || []).includes(activeTag)) return false;
  if (!query) return true;
  const hay = [c.title, c.desc, ...(c.tags || [])].join(" ").toLowerCase();
  return hay.includes(query);
}

function card(c) {
  const thumb = c.thumb
    ? `<div class="thumb"><img src="${esc(c.thumb)}" alt="${esc(c.title)}" loading="lazy" /></div>`
    : placeholder(c.title || "案例");
  const tags = (c.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
  return `<a class="card" href="${esc(c.path)}">
    ${thumb}
    <div class="card-body">
      <div class="card-title">${esc(c.title)}</div>
      <div class="card-desc">${esc(c.desc || "")}</div>
      <div class="card-tags">${tags}</div>
      <div class="card-foot">
        <span>${esc(c.date || "")}</span>
        <span class="card-open">了解详情 →</span>
      </div>
    </div>
  </a>`;
}

function render() {
  renderTags();
  const list = CASES.filter(match);
  const grid = $("grid"), empty = $("empty");

  if (!CASES.length) {                 // 库里一个案例都没有
    grid.innerHTML = "";
    empty.classList.remove("hidden");
  } else if (!list.length) {           // 有案例但筛/搜没命中
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    empty.querySelector("h3").textContent = "没有匹配的案例";
    empty.querySelector("p").textContent = "换个关键词或标签试试。";
  } else {
    empty.classList.add("hidden");
    grid.innerHTML = list.map(card).join("");
  }

  const n = CASES.length;
  $("count").textContent = n ? `共 ${n} 个案例` : "暂无案例";
}

$("search").addEventListener("input", (e) => { query = e.target.value.trim().toLowerCase(); render(); });

$("contact").textContent = CONTACT;
render();
