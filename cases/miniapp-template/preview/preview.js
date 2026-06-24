/* 浏览器预览：按 config 渲染区块。换行业 = 换一份 config（见 ../configs.js） */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const screen = document.getElementById("screen");

/* ---------- 各区块渲染 ---------- */
const BLOCKS = {
  cover(b) {
    const bg = b.bg ? `<div class="bg" style="background-image:url('${esc(b.bg)}')"></div>` : "";
    const prices = b.prices ? `<div class="prices">${b.prices.map((p) =>
      `<div class="p"><span class="y">${esc(p.y)}</span><span class="m">${esc(p.m)}</span></div>`).join("")}</div>` : "";
    const cta = b.cta ? `<a class="cta"><span class="cn">${esc(b.cta.label)}</span>${b.cta.en ? `<span class="en">${esc(b.cta.en)}</span>` : ""}</a>` : "";
    const dock = b.dock ? `<div class="dock">${b.dock.map((d) =>
      `<div class="d"><div class="cn">${esc(d.cn)}</div><div class="en">${esc(d.en || "")}</div></div>`).join("")}</div>` : "";
    return `<section class="cover ${b.overlay ? "overlay" : ""}">${bg}${prices}
      <div class="ct rv">
        <div class="eyebrow">${esc(b.eyebrow || "")}</div>
        <h1 class="title">${esc(b.title)}</h1>
        ${b.sub ? `<p class="sub">${esc(b.sub)}</p>` : ""}
        ${cta}
      </div>${dock}</section>`;
  },
  gallery(b, i) {
    return `<section class="sec ${i % 2 ? "alt" : ""}">
      <div class="rv"><div class="eyebrow">${esc(b.eyebrow || "")}</div><div class="h2">${esc(b.title || "")}</div></div>
      <div class="gal c${b.cols || 2}">
        ${b.images.map((src, k) => `<div class="cell rv" style="transition-delay:${(k % 3) * 70}ms"><img src="${esc(src)}" loading="lazy" alt=""/></div>`).join("")}
      </div></section>`;
  },
  services(b, i) {
    return `<section class="sec ${i % 2 ? "alt" : ""}">
      <div class="rv"><div class="eyebrow">${esc(b.eyebrow || "")}</div><div class="h2">${esc(b.title || "")}</div></div>
      <div class="svc">${b.items.map((it) => `<div class="row rv">
        <div class="info"><div class="name">${esc(it.name)}</div><div class="desc">${esc(it.desc || "")}</div></div>
        ${it.price ? `<div class="price">${esc(it.price)}</div>` : ""}
      </div>`).join("")}</div></section>`;
  },
  split(b, i) {
    const pic = `<div class="pic rv"><img src="${esc(b.img)}" loading="lazy" alt=""/></div>`;
    const txt = `<div class="txt rv"><div class="eyebrow">${esc(b.eyebrow || "")}</div><div class="h2">${esc(b.title || "")}</div><p>${esc(b.text || "")}</p></div>`;
    return `<section class="sec ${i % 2 ? "alt" : ""}"><div class="split">${b.reverse ? txt + pic : pic + txt}</div></section>`;
  },
  contact(b, i) {
    return `<section class="sec ${i % 2 ? "alt" : ""}">
      <div class="rv"><div class="eyebrow">${esc(b.eyebrow || "")}</div><div class="h2">${esc(b.title || "")}</div></div>
      <div class="contact"><div class="rows">${b.rows.map((r) =>
        `<div class="r rv"><div class="k">${esc(r.k)}</div><div class="v">${esc(r.v)}</div></div>`).join("")}</div></div></section>`;
  },
};

function render(cfg) {
  document.documentElement.style.setProperty("--accent", cfg.theme.accent || "#c8a15a");
  screen.dataset.mode = cfg.theme.mode || "dark";
  const body = cfg.blocks.map((b, i) => (BLOCKS[b.type] ? BLOCKS[b.type](b, i) : "")).join("");
  screen.innerHTML =
    `<div class="statusbar" style="color:${cfg.blocks[0]?.overlay ? "#fff" : "var(--text)"}">
       <span>16:15</span><span>···· 5G <span class="bat"></span></span>
     </div>` + body +
    `<div class="foot"><div class="b">${esc(cfg.brand)}</div><div style="margin-top:6px">© ${new Date().getFullYear()} ${esc(cfg.brand)}</div></div>`;
  screen.scrollTop = 0;
  // 滚动进场
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { root: screen, threshold: 0.12 });
  screen.querySelectorAll(".rv").forEach((el) => io.observe(el));
}

/* ---------- 行业切换 ---------- */
const CONFIGS = window.MINIAPP_CONFIGS;
const LABELS = { studio: "摄影工作室", coffee: "咖啡品牌" };
const sw = document.getElementById("switcher");
let current = new URLSearchParams(location.search).get("c") || "studio";
if (!CONFIGS[current]) current = "studio";
sw.innerHTML = Object.keys(CONFIGS).map((k) =>
  `<button data-k="${k}" class="${k === current ? "on" : ""}">${LABELS[k] || k}</button>`).join("");
sw.addEventListener("click", (e) => {
  const k = e.target.dataset.k; if (!k) return;
  current = k;
  sw.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k));
  render(CONFIGS[k]);
});

render(CONFIGS[current]);
