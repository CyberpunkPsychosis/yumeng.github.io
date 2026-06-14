/* AI 摄影教练 —— 前端逻辑
 * 1) 调用摄像头实时取景
 * 2) 叠加三分网格 + 水平仪（实时、本地，不联网）
 * 3) 「给建议」/「AI 点评」截当前帧发给混元代理，返回拍摄建议
 */

const $ = (id) => document.getElementById(id);

const video = $("video");
const overlay = $("overlay");
const ctx = overlay.getContext("2d");

let stream = null;
let facingMode = "environment"; // 默认后置
let gridOn = true;
let tilt = { roll: 0, ready: false };
let aiPhoto = null; // 拍照后用于 AI 点评的缩小版（控制上传体积）
let srcImageData = null; // 拍下时的原始像素，供本地滤镜反复套用
let srcW = 0, srcH = 0;
let currentPreset = "none";

const PROXY_KEY = "ai_photo_proxy_url";
// 已部署的 AI 代理（Cloudflare Worker）默认地址，打开即用；可在设置里覆盖
const DEFAULT_PROXY = "https://hunyuan-photo-proxy.yumenglalala.workers.dev";
const getProxyUrl = () => localStorage.getItem(PROXY_KEY) || DEFAULT_PROXY;

/* ---------- 摄像头 ---------- */
async function startCamera() {
  if (stream) stream.getTracks().forEach((t) => t.stop());
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    resizeOverlay();
  } catch (err) {
    alert("无法打开摄像头：" + err.message + "\n请确认已授予摄像头权限，并使用 HTTPS 或 localhost 访问。");
  }
}

function resizeOverlay() {
  overlay.width = overlay.clientWidth;
  overlay.height = overlay.clientHeight;
}
window.addEventListener("resize", resizeOverlay);

/* ---------- 实时叠加层：三分网格 + 水平仪 ---------- */
function drawOverlay() {
  const w = overlay.width, h = overlay.height;
  ctx.clearRect(0, 0, w, h);

  if (gridOn) {
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const x = (w / 3) * i, y = (h / 3) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    // 三分线交点（构图甜点）
    ctx.fillStyle = "rgba(255,214,10,0.85)";
    for (const px of [w / 3, (2 * w) / 3]) {
      for (const py of [h / 3, (2 * h) / 3]) {
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // 水平仪：根据设备横滚角画一条参考线
  if (tilt.ready) {
    const cx = w / 2, cy = h / 2, len = w * 0.32;
    const rad = (tilt.roll * Math.PI) / 180;
    const level = Math.abs(tilt.roll) < 2;
    ctx.strokeStyle = level ? "rgba(48,209,88,0.95)" : "rgba(255,149,0,0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(rad) * len, cy - Math.sin(rad) * len);
    ctx.lineTo(cx + Math.cos(rad) * len, cy + Math.sin(rad) * len);
    ctx.stroke();
    // 固定的中心水平参考短线
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy); ctx.lineTo(cx + 18, cy); ctx.stroke();

    const hint = $("levelHint");
    if (level) { hint.textContent = "水平 ✓"; hint.className = "pill ok"; }
    else { hint.textContent = `偏 ${tilt.roll > 0 ? "右" : "左"} ${Math.abs(Math.round(tilt.roll))}°`; hint.className = "pill warn"; }
  }

  requestAnimationFrame(drawOverlay);
}

/* ---------- 水平仪：设备方向 ---------- */
function handleOrientation(e) {
  // gamma：左右倾斜，作为横滚角的近似
  if (e.gamma == null) return;
  tilt.roll = e.gamma;
  tilt.ready = true;
}

async function enableOrientation() {
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === "granted") window.addEventListener("deviceorientation", handleOrientation);
    } catch (_) { /* 用户拒绝则跳过水平仪 */ }
  } else {
    window.addEventListener("deviceorientation", handleOrientation);
  }
}

/* ---------- 截取当前帧 ---------- */
function captureCanvas(maxW = 1024) {
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw) return null;
  const scale = Math.min(1, maxW / vw);
  const c = document.createElement("canvas");
  c.width = Math.round(vw * scale);
  c.height = Math.round(vh * scale);
  c.getContext("2d").drawImage(video, 0, 0, c.width, c.height);
  return c;
}

function captureFrame(maxW = 1024) {
  const c = captureCanvas(maxW);
  return c ? c.toDataURL("image/jpeg", 0.85) : null;
}

/* ---------- 调用混元代理 ---------- */
async function askAI(dataUrl, mode) {
  const proxy = getProxyUrl();
  if (!proxy) {
    openSettings();
    throw new Error("请先在设置里填写 AI 代理地址。");
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 90000); // 90s 超时
  let resp;
  try {
    resp = await fetch(proxy.replace(/\/$/, "") + "/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl, mode }),
      signal: ctrl.signal,
    });
  } catch (e) {
    if (e.name === "AbortError") throw new Error("分析超时了，换张小一点的画面或检查网络后重试。");
    throw new Error("网络请求失败：连不上 AI 服务，请检查网络后重试。");
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`代理返回 ${resp.status}：${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  return data.text || "（无返回内容）";
}

function renderAdvice(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  $("adviceBody").innerHTML = lines.map((l) => `<div class="tip">${escapeHtml(l)}</div>`).join("");
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

/* ---------- 「给建议」（取景中实时） ---------- */
$("adviceBtn").addEventListener("click", async () => {
  const panel = $("advicePanel");
  panel.classList.remove("hidden");
  $("adviceBody").innerHTML = '<div class="loading">正在分析画面…</div>';
  try {
    const frame = captureFrame();
    if (!frame) throw new Error("摄像头还没准备好。");
    renderAdvice(await askAI(frame, "live"));
  } catch (e) {
    $("adviceBody").innerHTML = `<div class="tip">⚠️ ${escapeHtml(e.message)}</div>`;
  }
});
$("adviceClose").addEventListener("click", () => $("advicePanel").classList.add("hidden"));

/* ---------- 拍照 ---------- */
$("shutterBtn").addEventListener("click", () => {
  const c = captureCanvas(1600); // 成片工作分辨率（兼顾画质与处理速度）
  if (!c) return;
  srcImageData = c.getContext("2d").getImageData(0, 0, c.width, c.height);
  srcW = c.width; srcH = c.height;
  aiPhoto = captureFrame(1280); // 给 AI 用的缩小版，控制上传体积
  $("critiqueBody").innerHTML = "";
  renderFilterStrip();
  applyPreset("none"); // 默认原图
  $("result").classList.remove("hidden");
});

$("retakeBtn").addEventListener("click", () => $("result").classList.add("hidden"));

/* ---------- 本地风格滤镜（成片）---------- */
// 每个风格的调色参数：色温 temp、微调 tint、曝光 exposure、对比 contrast、
// 饱和 saturation、提黑 blackLift、分离色调 shadow/highlight、暗角 vignette、颗粒 grain
const PRESETS = [
  { id: "none", name: "原图" },
  { id: "leica", name: "徕卡", temp: 8, exposure: 0.03, contrast: 1.12, saturation: 1.12,
    blackLift: 0.0, shadow: [-2, -1, 2], highlight: [7, 3, -3], vignette: 0.12, grain: 0.04 },
  { id: "hk", name: "港风", temp: 2, tint: 7, exposure: -0.02, contrast: 1.05, saturation: 0.82,
    blackLift: 0.07, shadow: [-7, 3, 7], highlight: [11, 6, -7], vignette: 0.16, grain: 0.09 },
  { id: "cine", name: "电影", temp: -4, exposure: 0.0, contrast: 1.16, saturation: 0.9,
    blackLift: 0.04, shadow: [-9, 0, 11], highlight: [13, 5, -9], vignette: 0.22, grain: 0.05 },
  { id: "bw", name: "黑白", exposure: 0.03, contrast: 1.18, saturation: 0, blackLift: 0.04,
    grayscale: true, vignette: 0.16, grain: 0.10 },
  { id: "warm", name: "暖阳", temp: 14, exposure: 0.06, contrast: 1.06, saturation: 1.1,
    blackLift: 0.02, shadow: [2, 1, -2], highlight: [13, 6, -8], vignette: 0.08, grain: 0.03 },
];

// 预生成每个通道的色调查找表（曝光+白平衡+对比+提黑）
function buildLUT(p) {
  const temp = p.temp || 0, tint = p.tint || 0, exp = p.exposure || 0;
  const con = p.contrast == null ? 1 : p.contrast, bl = p.blackLift || 0;
  const wb = [1 + temp / 300, 1 + tint / 400, 1 - temp / 300];
  const expF = Math.pow(2, exp);
  const lut = [new Float32Array(256), new Float32Array(256), new Float32Array(256)];
  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < 256; i++) {
      let v = (i / 255) * expF * wb[c];
      v = (v - 0.5) * con + 0.5;     // 对比（绕中灰）
      v = bl + v * (1 - bl);          // 提黑（褪色感）
      lut[c][i] = Math.max(0, Math.min(1, v)) * 255;
    }
  }
  return lut;
}

function applyPreset(id) {
  currentPreset = id;
  document.querySelectorAll("#filters .chip").forEach((el) =>
    el.classList.toggle("active", el.dataset.id === id));
  if (!srcImageData) return;

  const out = new ImageData(new Uint8ClampedArray(srcImageData.data), srcW, srcH);
  const d = out.data;
  const p = PRESETS.find((x) => x.id === id) || PRESETS[0];

  if (id !== "none") {
    const lut = buildLUT(p);
    const sat = p.saturation == null ? 1 : p.saturation;
    const gray = !!p.grayscale;
    const sh = p.shadow || [0, 0, 0], hi = p.highlight || [0, 0, 0];
    const split = !!(p.shadow || p.highlight);
    const vig = p.vignette || 0, grain = p.grain || 0;
    const cx = srcW / 2, cy = srcH / 2, maxd2 = cx * cx + cy * cy;
    // 预存每列的横向平方距离，避免逐像素重复计算
    const xs = new Float32Array(srcW);
    for (let x = 0; x < srcW; x++) xs[x] = (x - cx) * (x - cx);

    for (let y = 0; y < srcH; y++) {
      const dy2 = (y - cy) * (y - cy);
      let row = y * srcW * 4;
      for (let x = 0; x < srcW; x++) {
        const idx = row + x * 4;
        let r = lut[0][d[idx]], g = lut[1][d[idx + 1]], b = lut[2][d[idx + 2]];
        const L = 0.299 * r + 0.587 * g + 0.114 * b;
        if (gray) { r = g = b = L; }
        else if (sat !== 1) { r = L + (r - L) * sat; g = L + (g - L) * sat; b = L + (b - L) * sat; }
        if (split) {
          const t = L / 255, ws = 1 - t;
          r += sh[0] * ws + hi[0] * t; g += sh[1] * ws + hi[1] * t; b += sh[2] * ws + hi[2] * t;
        }
        if (vig) {
          const dd = (xs[x] + dy2) / maxd2;     // 0..1
          const f = 1 - vig * dd * dd;
          r *= f; g *= f; b *= f;
        }
        if (grain) {
          const n = (Math.random() - 0.5) * grain * 55;
          r += n; g += n; b += n;
        }
        d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; // Uint8ClampedArray 自动裁剪 0-255
      }
    }
  }

  const c = document.createElement("canvas");
  c.width = srcW; c.height = srcH;
  c.getContext("2d").putImageData(out, 0, 0);
  const url = c.toDataURL("image/jpeg", 0.92);
  $("resultImg").src = url;
  $("saveBtn").href = url;
}

function renderFilterStrip() {
  const box = $("filters");
  if (box.childElementCount) return; // 只建一次
  box.innerHTML = PRESETS.map((p) =>
    `<button class="chip${p.id === "none" ? " active" : ""}" data-id="${p.id}">${p.name}</button>`).join("");
  box.querySelectorAll(".chip").forEach((el) =>
    el.addEventListener("click", () => applyPreset(el.dataset.id)));
}

$("critiqueBtn").addEventListener("click", async () => {
  $("critiqueBody").innerHTML = '<div class="loading">AI 正在点评这张照片…</div>';
  try {
    const text = await askAI(aiPhoto || $("resultImg").src, "critique");
    $("critiqueBody").innerHTML = text.split("\n").map((l) => l.trim()).filter(Boolean)
      .map((l) => `<div class="tip">${escapeHtml(l)}</div>`).join("");
  } catch (e) {
    $("critiqueBody").innerHTML = `<div class="tip">⚠️ ${escapeHtml(e.message)}</div>`;
  }
});

/* ---------- 翻转 / 网格 / 设置 ---------- */
$("flipBtn").addEventListener("click", () => {
  facingMode = facingMode === "environment" ? "user" : "environment";
  startCamera();
});

$("gridBtn").addEventListener("click", () => {
  gridOn = !gridOn;
  $("gridBtn").textContent = gridOn ? "网格 开" : "网格 关";
});

function openSettings() {
  $("proxyUrl").value = getProxyUrl();
  $("settings").classList.remove("hidden");
}
$("settingsBtn").addEventListener("click", openSettings);
$("settingsCancel").addEventListener("click", () => $("settings").classList.add("hidden"));
$("settingsSave").addEventListener("click", () => {
  localStorage.setItem(PROXY_KEY, $("proxyUrl").value.trim());
  $("settings").classList.add("hidden");
});

/* ---------- 启动 ---------- */
async function init() {
  await startCamera();
  await enableOrientation();
  requestAnimationFrame(drawOverlay);
  if (!getProxyUrl()) openSettings(); // 首次使用提示填代理
}

// 需用户手势才能在 iOS 上申请方向权限，这里在首次点击时补一次
document.body.addEventListener("click", enableOrientation, { once: true });

init();
