/* 手续生成 equirectangular 360° 房间全景（演示素材，正式换客户实拍 720° 图）
 * 输出一张 2048×1024 的画布：横向 = 偏航 0~360°，纵向 = 俯仰 +90°(顶) ~ -90°(底)。
 * viewer.js 把它当作球面贴图，于是就能拖动环视。
 */
window.makePano = (function () {
  const W = 2048, H = 1024;
  const TAU = Math.PI * 2;
  const xOf = (yaw) => { let t = yaw / TAU; t -= Math.floor(t); return t * W; };

  // 在某偏航处画一个形状，跨 0/2π 接缝时自动补画一份
  function atYaw(ctx, yaw, draw) {
    const x = xOf(yaw);
    ctx.save(); ctx.translate(x, 0); draw(ctx); ctx.restore();
    if (x < W * 0.12) { ctx.save(); ctx.translate(x + W, 0); draw(ctx); ctx.restore(); }
    if (x > W * 0.88) { ctx.save(); ctx.translate(x - W, 0); draw(ctx); ctx.restore(); }
  }

  return function makePano(scene, tint) {
    const p = scene.palette;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    const ceilB = H * 0.40, floorT = H * 0.60;

    // ---- 天花 ----
    let g = ctx.createLinearGradient(0, 0, 0, ceilB);
    g.addColorStop(0, p.ceil); g.addColorStop(1, p.ceil2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, ceilB);
    // 顶灯
    ctx.fillStyle = p.light;
    for (let i = 0; i < 6; i++) {
      const lx = W * (i + 0.5) / 6, ly = ceilB * 0.42;
      ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.ellipse(lx, ly, 46, 16, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.20; ctx.beginPath(); ctx.ellipse(lx, ly, 92, 34, 0, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ---- 墙 ----
    g = ctx.createLinearGradient(0, ceilB, 0, floorT);
    g.addColorStop(0, p.wall); g.addColorStop(1, p.wall2);
    ctx.fillStyle = g; ctx.fillRect(0, ceilB, W, floorT - ceilB);
    // 墙身明暗：正面(yaw0)亮、背面(yawπ)暗，营造立体房间
    for (let x = 0; x < W; x += 6) {
      const yaw = (x / W) * TAU;
      const f = 0.5 + 0.5 * Math.cos(yaw);            // 1=正面 0=背面
      ctx.fillStyle = "rgba(0,0,0," + ((1 - f) * 0.16).toFixed(3) + ")";
      ctx.fillRect(x, ceilB, 6, floorT - ceilB);
    }
    // 四角竖缝 + 顶/地踢脚线
    ctx.strokeStyle = "rgba(0,0,0,.22)"; ctx.lineWidth = 3;
    for (let k = 0; k < 4; k++) {
      const x = xOf(k * Math.PI / 2);
      ctx.beginPath(); ctx.moveTo(x, ceilB * 0.86); ctx.lineTo(x, floorT + (H - floorT) * 0.18); ctx.stroke();
    }
    ctx.fillStyle = "rgba(0,0,0,.14)"; ctx.fillRect(0, ceilB - 4, W, 7);     // 顶角线
    ctx.fillStyle = "rgba(0,0,0,.20)"; ctx.fillRect(0, floorT - 5, W, 10);   // 踢脚线

    // ---- 地 ----
    g = ctx.createLinearGradient(0, floorT, 0, H);
    g.addColorStop(0, p.floor); g.addColorStop(1, p.floor2);
    ctx.fillStyle = g; ctx.fillRect(0, floorT, W, H - floorT);
    // 地砖横线（越近越疏，仿透视）
    ctx.strokeStyle = "rgba(255,255,255,.10)"; ctx.lineWidth = 2;
    for (let i = 1; i <= 6; i++) {
      const y = floorT + (H - floorT) * Math.pow(i / 7, 1.7);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // 地砖竖线（接缝对齐四角）
    for (let k = 0; k < 8; k++) {
      const x = xOf(k * Math.PI / 4);
      ctx.beginPath(); ctx.moveTo(x, floorT); ctx.lineTo(x, H); ctx.stroke();
    }

    // ---- 门洞（热点位置）----
    (scene.hotspots || []).forEach((h) => {
      atYaw(ctx, h.yaw, (c) => {
        const dw = W * 0.058, dTop = ceilB + (floorT - ceilB) * 0.10, dBot = floorT + (H - floorT) * 0.30;
        // 门外的光
        const lg = c.createLinearGradient(0, dTop, 0, dBot);
        lg.addColorStop(0, "rgba(255,255,255,.55)"); lg.addColorStop(1, "rgba(255,255,255,.15)");
        c.fillStyle = "rgba(20,22,26,.55)";
        c.fillRect(-dw / 2 - 8, dTop - 8, dw + 16, dBot - dTop + 8);   // 门框
        c.fillStyle = lg;
        c.beginPath();
        c.moveTo(-dw / 2, dBot); c.lineTo(-dw / 2, dTop + 26);
        c.quadraticCurveTo(0, dTop - 18, dw / 2, dTop + 26); c.lineTo(dw / 2, dBot); c.closePath(); c.fill();
      });
    });

    // ---- 主墙标识（feature 面板）----
    atYaw(ctx, Math.PI, (c) => {
      const cy = (ceilB + floorT) / 2;
      c.fillStyle = "rgba(0,0,0,.06)"; c.fillRect(-150, cy - 70, 300, 140);
      c.strokeStyle = p.accent; c.lineWidth = 3; c.strokeRect(-150, cy - 70, 300, 140);
      c.fillStyle = p.accent; c.textAlign = "center";
      c.font = "700 30px 'Noto Serif SC', serif";
      c.fillText(scene.name, 0, cy - 8);
      c.font = "600 18px Inter, sans-serif";
      c.fillStyle = "rgba(0,0,0,.45)";
      c.fillText((scene.feature || "").split("").join(" "), 0, cy + 34);
    });

    // ---- 楼盘色调 ----
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); }
    // 暗角
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.18)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);

    return cv;
  };
})();
