/* 渲染 + 动效 —— 从 content.js 的 CONTENT 生成页面，并加滚动进场/计数/导航效果 */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const C = CONTENT;
document.documentElement.style.setProperty("--accent", C.accent || "#2b6cff");

/* ---------- 顶栏 ---------- */
function navHTML() {
  return `<header class="nav" id="nav"><div class="wrap">
    <a class="brand" href="#top">${esc(C.brand)}</a>
    <nav class="links" id="navLinks">
      ${C.nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("")}
      <a class="cta" href="${esc(C.navCta.href)}">${esc(C.navCta.label)}</a>
    </nav>
    <button class="burger" id="burger" aria-label="菜单"><span></span><span></span><span></span></button>
  </div></header>`;
}

/* ---------- 各区块 ---------- */
function heroHTML() {
  const h = C.hero;
  return `<section class="hero" id="top">
    <div class="wrap">
      <p class="eyebrow reveal">${esc(h.eyebrow)}</p>
      <h1 class="reveal d1">${esc(h.title)}</h1>
      <p class="reveal d2">${esc(h.sub)}</p>
      <div class="btns reveal d3">
        <a class="btn primary" href="${esc(h.primary.href)}">${esc(h.primary.label)}</a>
        <a class="btn ghost" href="${esc(h.secondary.href)}">${esc(h.secondary.label)}</a>
      </div>
    </div>
    <div class="scrolldown">SCROLL</div>
  </section>`;
}

function introHTML() {
  const i = C.intro;
  return `<section class="intro"><div class="wrap">
    <p class="eyebrow reveal">${esc(i.eyebrow)}</p>
    <div class="big reveal d1">${esc(i.big)}</div>
    <p class="reveal d2">${esc(i.text)}</p>
  </div></section>`;
}

function featuresHTML() {
  return `<section class="section" id="features"><div class="wrap">
    ${C.features.map((f) => `<div class="feature">
      <div class="ftxt reveal">
        <p class="eyebrow">${esc(f.eyebrow)}</p>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.text)}</p>
      </div>
      <div class="fimg reveal d1"><img src="${esc(f.img)}" alt="${esc(f.title)}" loading="lazy" /></div>
    </div>`).join("")}
  </div></section>`;
}

function servicesHTML() {
  const s = C.services;
  return `<section class="section soft" id="services"><div class="wrap">
    <div class="head reveal"><p class="eyebrow">${esc(s.eyebrow)}</p><h2>${esc(s.title)}</h2></div>
    <div class="grid4">
      ${s.items.map((it, i) => `<div class="scard reveal d${(i % 3) + 1}">
        <div class="num">0${i + 1}</div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p>
      </div>`).join("")}
    </div>
  </div></section>`;
}

function statsHTML() {
  return `<section class="section dark" id="stats"><div class="wrap">
    <div class="stats">
      ${C.stats.map((st, i) => `<div class="stat reveal d${i % 4}">
        <div class="n"><span class="count" data-to="${st.num}">0</span><span class="suffix">${esc(st.suffix || "")}</span></div>
        <div class="l">${esc(st.label)}</div>
      </div>`).join("")}
    </div>
  </div></section>`;
}

function galleryHTML() {
  const g = C.gallery;
  return `<section class="section" id="gallery"><div class="wrap">
    <div class="head reveal"><p class="eyebrow">${esc(g.eyebrow)}</p><h2>${esc(g.title)}</h2></div>
    <div class="gal">
      ${g.images.map((src, i) => `<div class="cell reveal d${i % 3}"><img src="${esc(src)}" alt="案例 ${i + 1}" loading="lazy" /></div>`).join("")}
    </div>
  </div></section>`;
}

function aboutHTML() {
  const a = C.about;
  return `<section class="section soft" id="about"><div class="wrap about">
    <div class="reveal"><p class="eyebrow">${esc(a.eyebrow)}</p><div class="big">${esc(a.title)}</div></div>
    <div class="reveal d1"><p>${esc(a.text)}</p></div>
  </div></section>`;
}

function ctaHTML() {
  const c = C.cta;
  return `<section class="ctaband"><div class="wrap">
    <h2 class="reveal">${esc(c.title)}</h2>
    <p class="reveal d1">${esc(c.sub)}</p>
    <div class="reveal d2"><a class="btn primary" href="${esc(c.button.href)}">${esc(c.button.label)}</a></div>
  </div></section>`;
}

function contactFootHTML() {
  const ct = C.contact;
  return `<section class="section" id="contact"><div class="wrap contact">
    <div class="head reveal" style="margin:0"><p class="eyebrow">${esc(ct.eyebrow)}</p><h2>${esc(ct.title)}</h2></div>
    <div class="info reveal d1">
      <div class="row"><div class="k">电话</div><div class="v">${esc(ct.phone)}</div></div>
      <div class="row"><div class="k">邮箱</div><div class="v">${esc(ct.email)}</div></div>
      <div class="row"><div class="k">地址</div><div class="v">${esc(ct.address)}</div></div>
    </div>
  </div></section>
  <footer class="foot"><div class="wrap">
    <span class="brand">${esc(C.brand)}</span>
    <span>© <span id="yr"></span> ${esc(C.brand)} · 版权所有</span>
  </div></footer>`;
}

/* ---------- 组装 ---------- */
document.getElementById("app").innerHTML =
  navHTML() + heroHTML() + introHTML() + featuresHTML() + servicesHTML() +
  statsHTML() + galleryHTML() + aboutHTML() + ctaHTML() + contactFootHTML();
document.getElementById("yr").textContent = new Date().getFullYear();

/* ---------- 滚动进场 ---------- */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- 数字滚动 ---------- */
const counted = new Set();
const cio = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting || counted.has(e.target)) continue;
    counted.add(e.target);
    const to = +e.target.dataset.to, t0 = performance.now(), dur = 1500;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      e.target.textContent = Math.round(to * ease);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}, { threshold: 0.4 });
document.querySelectorAll(".count").forEach((el) => cio.observe(el));

/* ---------- 顶栏：滚动变实 + 移动端菜单 ---------- */
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("solid", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
document.getElementById("burger").addEventListener("click", () => nav.classList.toggle("open"));
document.getElementById("navLinks").addEventListener("click", (e) => { if (e.target.tagName === "A") nav.classList.remove("open"); });
