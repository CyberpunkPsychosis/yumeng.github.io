/* VR 实景样板间 · 把配置接到界面：楼盘 / 户型 / 场景切换 + 全景热点跳转 */
(function () {
  const cfg = window.VR_CONFIG;
  const $ = (s) => document.querySelector(s);
  const canvas = $("#pano");
  const viewer = new PanoViewer(canvas);
  window.vrViewer = viewer;   // 调试句柄

  let projIdx = 0, groupIdx = 0, sceneIdx = 0;
  const project = () => cfg.projects[projIdx];
  const group = () => cfg.groups[groupIdx];
  const scenes = () => group().scenes;
  const scene = () => scenes()[sceneIdx];

  const fade = $("#fade"), titleEl = $("#sceneTitle"), hotsEl = $("#hotspots");
  let hotEls = [];

  // ---- 顶部 / 顾问 ----
  $("#topTitle").textContent = cfg.title;
  $("#agentBadge").textContent = cfg.agent.badge;
  $("#agentName").textContent = cfg.agent.name;

  // ---- 楼盘 chips ----
  $("#projects").innerHTML = cfg.projects.map((p, i) => `<button class="chip ${i === 0 ? "on" : ""}" data-i="${i}">${p.name}</button>`).join("");
  $("#projects").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    projIdx = +b.dataset.i;
    [...$("#projects").children].forEach((c, i) => c.classList.toggle("on", i === projIdx));
    setScene(sceneIdx, { yaw: viewer.yaw });        // 仅换色调
  });

  // ---- 户型 tabs ----
  function buildGroups() {
    $("#groups").innerHTML = cfg.groups.map((g, i) => `<button class="tab ${i === groupIdx ? "on" : ""}" data-i="${i}">${g.name}</button>`).join("");
  }
  $("#groups").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    groupIdx = +b.dataset.i; sceneIdx = 0; buildGroups(); buildThumbs(); setScene(0, { yaw: 0 });
  });

  // ---- 场景缩略图 ----
  function buildThumbs() {
    $("#thumbs").innerHTML = scenes().map((s, i) =>
      `<button class="thumb ${i === sceneIdx ? "on" : ""}" data-i="${i}"><span class="tk">${s.name[0]}</span><span class="tn">${s.name}</span></button>`).join("");
  }
  $("#thumbs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    setScene(+b.dataset.i, { yaw: 0 });
  });
  function markThumb() { [...$("#thumbs").children].forEach((c, i) => c.classList.toggle("on", i === sceneIdx)); }

  // ---- 热点 ----
  function buildHotspots(s) {
    hotsEl.innerHTML = "";
    hotEls = (s.hotspots || []).map((h) => {
      const el = document.createElement("div");
      el.className = "hot"; el._yaw = h.yaw;
      el.innerHTML = `<span class="hdot"></span><span class="hlb">${h.label}</span>`;
      el.addEventListener("click", () => navigate(h));
      hotsEl.appendChild(el); return el;
    });
  }
  viewer.onFrame = (v) => {
    for (const el of hotEls) {
      const p = v.project(el._yaw, 0);
      if (p.visible) { el.style.display = "flex"; el.style.left = p.x + "px"; el.style.top = p.y + "px"; }
      else el.style.display = "none";
    }
  };

  // 找到目标场景所在的 group/scene 下标（先本组，再全局）
  function locate(id) {
    const here = scenes().findIndex((s) => s.id === id);
    if (here >= 0) return { g: groupIdx, s: here };
    for (let g = 0; g < cfg.groups.length; g++) {
      const s = cfg.groups[g].scenes.findIndex((x) => x.id === id);
      if (s >= 0) return { g, s };
    }
    return null;
  }
  function navigate(h) {
    const loc = locate(h.to); if (!loc) return;
    groupIdx = loc.g; sceneIdx = loc.s;
    buildGroups(); buildThumbs();
    setScene(sceneIdx, { yaw: h.yaw });             // 进门后保持朝向，像继续往里走
  }

  // ---- 切换场景（带渐隐）----
  function setScene(idx, opts) {
    sceneIdx = idx;
    fade.style.opacity = "1";
    setTimeout(() => {
      const s = scene();
      viewer.setTexture(window.makePano(s, project().tint), { yaw: opts && opts.yaw != null ? opts.yaw : viewer.yaw });
      titleEl.textContent = s.name;
      buildHotspots(s); markThumb();
      fade.style.opacity = "0";
    }, 190);
  }

  // ---- 场景切换面板收起 ----
  $("#switchBtn").addEventListener("click", () => $("#panel").classList.toggle("min"));

  // ---- 启动 ----
  buildGroups(); buildThumbs();
  viewer.setTexture(window.makePano(scene(), project().tint), { yaw: 0 });
  titleEl.textContent = scene().name; buildHotspots(scene());
})();
