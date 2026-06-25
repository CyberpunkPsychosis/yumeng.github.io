/* 跳一跳 · H5 Canvas 小游戏
 * 长按蓄力 → 松开按时长跳跃 → 等距落点判定 → 计分 + 相机跟随。
 * 纯 canvas + requestAnimationFrame，逻辑可移植到微信小游戏。
 */
(function () {
  const cv = document.getElementById("game");
  const ctx = cv.getContext("2d");
  const $ = (id) => document.getElementById(id);

  // ---------- 工具 ----------
  const TAU = Math.PI * 2, ISO = 0.5;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const hsl = (h, s, l) => `hsl(${h},${s}%,${clamp(l, 0, 100)}%)`;

  // ---------- 画布尺寸 ----------
  let W = 0, H = 0, S = 1, ANCHOR = { x: 0, y: 0 };
  function resize() {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    W = r.width; H = r.height; S = Math.min(W, 460) / 400;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ANCHOR = { x: W * 0.30, y: H * 0.60 };
    if (cur) recenterInstant(); // 旋转屏幕/缩放时把当前块拉回锚点
  }
  window.addEventListener("resize", resize);

  // ---------- 参数 ----------
  const MIN_D = 60, MAX_D = 278, MAXCHARGE = 850; // 跳跃距离与最大蓄力(ms)
  const GAP_MIN = 116, GAP_MAX = 226;

  // ---------- 状态 ----------
  let state = "start";          // start | idle | charging | jumping | recenter | falling | over
  let cur = null, next = null;  // 当前块 / 下一块
  let blocks = [];              // 可见块（含 cur,next）
  let lastDir = null;
  let player = { x: 0, y: 0, h: 0, squash: 0, rot: 0 };
  let score = 0, combo = 0, jumps = 0;
  let best = +(localStorage.getItem("jump_best") || 0);

  let chargeStart = 0, power = 0;
  let jump = null, recen = null, fall = null;
  const effects = [];           // 完美文字 / 落地波纹

  // ---------- 方块 ----------
  function makeBlock(cx, cy) {
    const hw = rand(44, 60) * S, bh = (24 + rand(0, 8)) * S;
    let h = 220, s = 0, l = rand(50, 60);
    if (Math.random() < 0.18) { h = [120, 205, 28, 350][(Math.random() * 4) | 0]; s = 26; l = 52; }
    return { cx, cy, hw, bh, h, s, l };
  }
  function radiusAlongRay(hw, dir) { return hw / (Math.abs(dir.x) + Math.abs(dir.y) / ISO); }
  function randDir() {
    // 前方：屏幕左上 或 右上，二选一（不连续三次同向）
    let d;
    do { d = Math.random() < 0.5 ? { x: 0.894, y: -0.447 } : { x: -0.894, y: -0.447 }; }
    while (lastDir && d.x === lastDir.x && Math.random() < 0.4);
    lastDir = d; return d;
  }

  // ---------- 绘制：方块 ----------
  function quad(a, b, c, d, fill) {
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  }
  function drawSide(p1, p2, bh, cols) {
    for (let k = 0; k < 3; k++) {
      const o0 = bh * k / 3, o1 = bh * (k + 1) / 3;
      quad({ x: p1.x, y: p1.y + o0 }, { x: p2.x, y: p2.y + o0 }, { x: p2.x, y: p2.y + o1 }, { x: p1.x, y: p1.y + o1 }, cols[k]);
    }
  }
  function drawBlock(b, compress) {
    const bh = b.bh * (compress || 1);
    const T = { x: b.cx, y: b.cy - b.hw * ISO }, R = { x: b.cx + b.hw, y: b.cy };
    const B = { x: b.cx, y: b.cy + b.hw * ISO }, L = { x: b.cx - b.hw, y: b.cy };
    // 地面投影
    ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = "#5a5e66";
    ctx.beginPath(); ctx.ellipse(b.cx + 14 * S, b.cy + bh * 0.7, b.hw * 1.04, b.hw * ISO * 1.04, 0, 0, TAU); ctx.fill(); ctx.restore();
    // 侧面（左暗右更暗，带三段条纹）
    drawSide(L, B, bh, [hsl(b.h, b.s, b.l + 24), hsl(b.h, b.s, b.l + 2), hsl(b.h, b.s, b.l - 12)]);
    drawSide(B, R, bh, [hsl(b.h, b.s, b.l + 15), hsl(b.h, b.s, b.l - 7), hsl(b.h, b.s, b.l - 19)]);
    // 顶面
    quad(T, R, B, L, hsl(b.h, b.s, b.l + 7));
  }

  // ---------- 绘制：棋子 ----------
  function drawPlayer() {
    const px = player.x, py = player.y, h = player.h;
    // 阴影（随高度变淡变小）
    const k = clamp(1 - h / 300, 0.12, 1);
    ctx.save(); ctx.globalAlpha = 0.26 * k; ctx.fillStyle = "#4a4e57";
    ctx.beginPath(); ctx.ellipse(px, py, 17 * S * k, 9 * S * k, 0, 0, TAU); ctx.fill(); ctx.restore();

    ctx.save();
    ctx.translate(px, py - h);
    const sx = 1 + player.squash * 0.20, sy = 1 - player.squash * 0.32;
    // 翻转（绕身体中心）
    if (player.rot) { ctx.translate(0, -24 * S * sy); ctx.rotate(player.rot); ctx.translate(0, 24 * S * sy); }
    ctx.scale(sx, sy);
    const bw = 26 * S, tw = 13 * S, bodyH = 34 * S, hr = 11 * S;
    // 底座
    ctx.fillStyle = "#241d3a";
    ctx.beginPath(); ctx.ellipse(0, 0, bw / 2, bw / 2 * ISO, 0, 0, TAU); ctx.fill();
    // 身体
    const bg = ctx.createLinearGradient(0, -bodyH, 0, 0);
    bg.addColorStop(0, "#564a7a"); bg.addColorStop(1, "#2c2444");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(-bw / 2, -2 * S);
    ctx.bezierCurveTo(-bw / 2, -bodyH * 0.5, -tw / 2 - 3 * S, -bodyH + 3 * S, -tw / 2, -bodyH);
    ctx.lineTo(tw / 2, -bodyH);
    ctx.bezierCurveTo(tw / 2 + 3 * S, -bodyH + 3 * S, bw / 2, -bodyH * 0.5, bw / 2, -2 * S);
    ctx.closePath(); ctx.fill();
    // 头
    const hy = -bodyH - hr * 0.6;
    const hg = ctx.createRadialGradient(-hr * 0.35, hy - hr * 0.35, hr * 0.2, 0, hy, hr * 1.2);
    hg.addColorStop(0, "#7c6fa6"); hg.addColorStop(1, "#312953");
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(0, hy, hr, 0, TAU); ctx.fill();
    ctx.restore();
  }

  // ---------- 渲染 ----------
  function render() {
    ctx.clearRect(0, 0, W, H);
    const order = blocks.slice().sort((a, b) => a.cy - b.cy);
    for (const b of order) drawBlock(b, b === cur && state === "charging" ? 1 - power * 0.16 : 1);
    drawPlayer();
    // 完美文字 / 波纹
    for (const e of effects) {
      if (e.type === "ring") {
        ctx.save(); ctx.globalAlpha = (1 - e.t) * 0.7; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2 * S;
        ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * e.t, e.r * e.t * ISO, 0, 0, TAU); ctx.stroke(); ctx.restore();
      } else {
        ctx.save(); ctx.globalAlpha = clamp(1 - e.t, 0, 1); ctx.fillStyle = "#fff";
        ctx.font = `700 ${20 * S}px Inter, sans-serif`; ctx.textAlign = "center";
        ctx.fillText(e.text, e.x, e.y - e.t * 40 * S); ctx.restore();
      }
    }
    // 蓄力条
    if (state === "charging") {
      const bw = W * 0.5, bx = (W - bw) / 2, by = H - 64;
      ctx.fillStyle = "rgba(255,255,255,.35)"; rrect(bx, by, bw, 8 * S, 4 * S); ctx.fill();
      ctx.fillStyle = "#6b5bb0"; rrect(bx, by, bw * power, 8 * S, 4 * S); ctx.fill();
    }
  }
  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // ---------- 更新 ----------
  let lastT = 0;
  function loop(now) {
    const dt = Math.min((now - lastT) / 1000 || 0, 0.05); lastT = now;
    update(dt); render(); requestAnimationFrame(loop);
  }
  function update(dt) {
    // 特效推进
    for (let i = effects.length - 1; i >= 0; i--) { effects[i].t += dt / (effects[i].type === "ring" ? 0.5 : 0.9); if (effects[i].t >= 1) effects.splice(i, 1); }

    if (state === "charging") {
      power = clamp((performance.now() - chargeStart) / MAXCHARGE, 0, 1);
      player.squash = power; player.x = cur.cx; player.y = cur.cy;
    } else if (state === "idle") {
      player.squash += (0 - player.squash) * Math.min(1, dt * 12);
      player.rot = 0; player.x = cur.cx; player.y = cur.cy;
    } else if (state === "jumping") {
      jump.t = clamp(jump.t + dt / jump.dur, 0, 1);
      const t = jump.t;
      player.x = lerp(jump.from.x, jump.target.x, t);
      player.y = lerp(jump.from.y, jump.target.y, t);
      player.h = Math.sin(Math.PI * t) * jump.hop;
      player.rot = t * TAU * jump.spin;
      player.squash = -Math.sin(Math.PI * t) * 0.12;
      if (t >= 1) { player.rot = 0; player.h = 0; jump.success ? onLanded() : startFall(); }
    } else if (state === "recenter") {
      recen.t = clamp(recen.t + dt / 0.26, 0, 1);
      const e = easeOut(recen.t);
      for (const b of blocks) { b.cx = b._ox + recen.dx * e; b.cy = b._oy + recen.dy * e; }
      player.x = cur.cx; player.y = cur.cy;
      player.squash = Math.sin(recen.t * Math.PI) * -0.10; // 落地回弹
      if (recen.t >= 1) finishRecenter();
    } else if (state === "falling") {
      fall.t += dt; fall.vy += 1400 * dt; player.y += fall.vy * dt; player.rot += dt * 6;
      if (fall.t > 0.75) gameOver();
    }
  }

  // ---------- 流程 ----------
  function startCharge() {
    if (state !== "idle") return;
    state = "charging"; chargeStart = performance.now(); power = 0; hideHint();
  }
  function release() {
    if (state !== "charging") return;
    const d = MIN_D + power * (MAX_D - MIN_D);
    const dir = { x: next.cx - cur.cx, y: next.cy - cur.cy };
    const gap = Math.hypot(dir.x, dir.y); dir.x /= gap; dir.y /= gap;
    const r = radiusAlongRay(next.hw, dir);
    const success = d >= gap - r && d <= gap + r;
    const perfect = success && Math.abs(d - gap) <= r * 0.24;
    const target = success ? { x: next.cx, y: next.cy } : { x: cur.cx + dir.x * d, y: cur.cy + dir.y * d };
    jump = {
      t: 0, dur: clamp(0.36 + d / 760, 0.4, 0.72),
      from: { x: cur.cx, y: cur.cy }, target,
      hop: (66 + d * 0.45) * S, spin: dir.x >= 0 ? 1 : -1,
      success, perfect,
    };
    player.squash = 0; state = "jumping"; jumps++;
  }
  function onLanded() {
    // 计分
    if (jump.perfect) { combo++; score += 1 + combo * 2; effects.push({ type: "txt", text: "完美 +" + (combo * 2), x: next.cx, y: next.cy - 40 * S, t: 0 }); }
    else { combo = 0; score += 1; }
    effects.push({ type: "ring", x: next.cx, y: next.cy, r: next.hw * 0.9, t: 0 });
    $("score").textContent = score;
    // 切块 + 生成新的下一块
    cur = next;
    const dir = randDir(), gap = rand(GAP_MIN, GAP_MAX) * S;
    next = makeBlock(cur.cx + dir.x * gap, cur.cy + dir.y * gap);
    blocks.push(next);
    if (blocks.length > 5) blocks = blocks.slice(-5);
    // 相机：把当前块缓动回锚点（所有块一起平移，新块随之入场）
    for (const b of blocks) { b._ox = b.cx; b._oy = b.cy; }
    recen = { t: 0, dx: ANCHOR.x - cur.cx, dy: ANCHOR.y - cur.cy };
    state = "recenter";
  }
  function finishRecenter() { state = "idle"; }
  function recenterInstant() {
    const dx = ANCHOR.x - cur.cx, dy = ANCHOR.y - cur.cy;
    for (const b of blocks) { b.cx += dx; b.cy += dy; }
    player.x = cur.cx; player.y = cur.cy;
  }
  function startFall() {
    // 没跳到下一块：原地坠落
    effects.length = 0;
    fall = { t: 0, vy: -120 }; state = "falling";
  }
  function gameOver() {
    state = "over";
    if (score > best) { best = score; localStorage.setItem("jump_best", best); }
    $("finalScore").textContent = score; $("bestScore").textContent = best;
    $("gameOver").classList.remove("hidden");
    $("score").classList.add("hidden");
  }

  function resetGame() {
    lastDir = null;
    cur = makeBlock(ANCHOR.x, ANCHOR.y);
    const dir = randDir(), gap = rand(GAP_MIN, GAP_MAX) * S;
    next = makeBlock(cur.cx + dir.x * gap, cur.cy + dir.y * gap);
    blocks = [cur, next];
    player = { x: cur.cx, y: cur.cy, h: 0, squash: 0, rot: 0 };
    score = 0; combo = 0; jumps = 0; power = 0; effects.length = 0;
    $("score").textContent = "0"; $("score").classList.remove("hidden");
    state = "idle";
    if (jumps === 0) showHint();
  }
  function showHint() { $("hint").classList.remove("hidden"); }
  function hideHint() { $("hint").classList.add("hidden"); }

  // ---------- 输入 ----------
  cv.addEventListener("pointerdown", (e) => { e.preventDefault(); if (state === "idle") startCharge(); });
  window.addEventListener("pointerup", () => { if (state === "charging") release(); });
  window.addEventListener("pointercancel", () => { if (state === "charging") release(); });
  window.addEventListener("keydown", (e) => { if (e.code === "Space" && !e.repeat && state === "idle") { e.preventDefault(); startCharge(); } });
  window.addEventListener("keyup", (e) => { if (e.code === "Space" && state === "charging") release(); });

  $("startBtn").addEventListener("click", () => { $("startScreen").classList.add("hidden"); resize(); resetGame(); });
  $("againBtn").addEventListener("click", () => { $("gameOver").classList.add("hidden"); resetGame(); });

  // ---------- 启动 ----------
  resize();
  requestAnimationFrame(loop);
})();
