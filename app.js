/* AI 摄影教练 —— 前端逻辑
 * 1) 调用摄像头实时取景
 * 2) 叠加三分网格 + 水平仪（实时、本地，不联网）
 * 3) 「给建议」/「AI 点评」截当前帧发给混元代理，返回拍摄建议
 */

const $ = (id) => document.getElementById(id);

const video = $("video");
const overlay = $("overlay");
const ctx = overlay.getContext("2d");
const preview = $("preview");           // 取景实时风格预览（覆盖在 video 上）
const pctx = preview.getContext("2d");
const previewWork = document.createElement("canvas"); // 离屏低分辨率工作画布

let stream = null;
let facingMode = "environment"; // 默认后置
let gridOn = true;
let tilt = { roll: 0, ready: false };
let aiPhoto = null; // 拍照后用于 AI 点评的缩小版（控制上传体积）
let srcImageData = null; // 拍下时的原始像素，供本地滤镜反复套用
let srcW = 0, srcH = 0;
let currentPreset = "none";
let livePreset = "none";  // 取景中选中的实时风格
let lastPreviewTs = 0;
let zoom = 1;          // 当前倍率（可连续，如 0.5/1/2.3…）
let digitalZoom = 1;   // 硬件无法满足时由数码变焦补足的部分
let zoomCap = null;    // 摄像头硬件变焦能力 { min, max, step }
let minZoom = 1, maxZoom = 5;
let guideOn = false;        // 实时构图引导开关
let detector = null;        // MediaPipe 物体(人物)检测器
let detectorLoading = false;
let lastDetectTs = 0;

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
    setupZoom();
  } catch (err) {
    alert("无法打开摄像头：" + err.message + "\n请确认已授予摄像头权限，并使用 HTTPS 或 localhost 访问。");
  }
}

function resizeOverlay() {
  overlay.width = overlay.clientWidth;
  overlay.height = overlay.clientHeight;
  preview.width = preview.clientWidth;
  preview.height = preview.clientHeight;
}
window.addEventListener("resize", resizeOverlay);

/* ---------- 倍率（变焦）---------- */
function setupZoom() {
  const track = stream && stream.getVideoTracks()[0];
  const caps = track && track.getCapabilities ? track.getCapabilities() : {};
  zoomCap = caps && caps.zoom ? caps.zoom : null;
  const hwMin = zoomCap && zoomCap.min ? zoomCap.min : 1;
  const hwMax = zoomCap && zoomCap.max ? zoomCap.max : 1;
  minZoom = Math.min(hwMin, 1); // 硬件支持小于 1 才有广角
  maxZoom = Math.max(hwMax, 5); // 数码最多到 5×
  // 档位：0.5(广角，仅设备支持时)/1/2/3/5，按可用范围筛选
  let levels = [0.5, 1, 2, 3, 5].filter((z) => z >= minZoom - 1e-3 && z <= maxZoom + 1e-3);
  if (!levels.some((z) => Math.abs(z - 1) < 1e-3)) levels.push(1);
  levels.sort((a, b) => a - b);
  const bar = $("zoomBar");
  bar.innerHTML = levels.map((z) =>
    `<button class="zoom" data-z="${z}">${z === 0.5 ? ".5" : z}×</button>`).join("");
  bar.querySelectorAll(".zoom").forEach((el) =>
    el.addEventListener("click", () => setZoom(+el.dataset.z)));
  setZoom(1);
}

function setZoom(z) {
  z = Math.min(Math.max(z, minZoom), maxZoom);
  zoom = z;
  let hw = 1; // 硬件变焦达到的倍率
  if (zoomCap) {
    hw = Math.min(Math.max(z, zoomCap.min || 1), zoomCap.max);
    const track = stream && stream.getVideoTracks()[0];
    if (track) track.applyConstraints({ advanced: [{ zoom: hw }] }).catch(() => {});
  }
  digitalZoom = z / hw; // 硬件够用则为 1，否则数码变焦补足
  video.style.transform = digitalZoom > 1 ? `scale(${digitalZoom})` : "";
  document.querySelectorAll("#zoomBar .zoom").forEach((el) =>
    el.classList.toggle("active", Math.abs(+el.dataset.z - z) < 1e-3));
}

// 双指捏合缩放
function setupPinch() {
  const vf = $("viewfinder");
  let d0 = 0, z0 = 1;
  const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  vf.addEventListener("touchstart", (e) => { if (e.touches.length === 2) { d0 = dist(e.touches); z0 = zoom; } });
  vf.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && d0) { e.preventDefault(); setZoom(z0 * dist(e.touches) / d0); }
  }, { passive: false });
  vf.addEventListener("touchend", (e) => { if (e.touches.length < 2) d0 = 0; });
}

/* ---------- 取景实时风格预览 ---------- */
async function selectLivePreset(id) {
  if (id.indexOf("lut:") === 0) {
    try { await ensureLut(id); } catch (e) { alert("LUT 加载失败：" + e.message); return; }
  }
  livePreset = id;
  document.querySelectorAll("#liveFilters .chip").forEach((el) =>
    el.classList.toggle("active", el.dataset.id === id));
}

function renderPreview(ts) {
  requestAnimationFrame(renderPreview);
  const shooting = $("result").classList.contains("hidden"); // 没在看拍后结果 = 取景中
  if (!shooting || livePreset === "none" || !video.videoWidth) {
    if (!preview.classList.contains("hidden")) preview.classList.add("hidden");
    return;
  }
  if (ts - lastPreviewTs < 50) return; // 约 20fps，省电
  lastPreviewTs = ts;
  const vw = video.videoWidth, vh = video.videoHeight;
  const z = digitalZoom || 1;                  // 与拍照一致的数码变焦裁切
  const sw = vw / z, sh = vh / z, sx = (vw - sw) / 2, sy = (vh - sh) / 2;
  const long = 720, scale = Math.min(1, long / Math.max(sw, sh)); // 提高处理分辨率，减少糊
  const ww = Math.round(sw * scale), wh = Math.round(sh * scale);
  if (previewWork.width !== ww || previewWork.height !== wh) { previewWork.width = ww; previewWork.height = wh; }
  const wctx = previewWork.getContext("2d");
  wctx.drawImage(video, sx, sy, sw, sh, 0, 0, ww, wh);
  const img = wctx.getImageData(0, 0, ww, wh);
  gradeData(img.data, ww, wh, livePreset, { noGrain: true }); // 预览不加颗粒（低分辨率下=噪点）
  wctx.putImageData(img, 0, 0);
  if (preview.classList.contains("hidden")) preview.classList.remove("hidden");
  // 按真实像素密度(dpr)设画布，避免再被屏幕放大一次（隐藏时 clientWidth 为 0，故显示后再设）
  const dpr = window.devicePixelRatio || 1;
  const tw = Math.round(preview.clientWidth * dpr), th = Math.round(preview.clientHeight * dpr);
  if (preview.width !== tw || preview.height !== th) { preview.width = tw; preview.height = th; }
  const cw = preview.width, ch = preview.height;
  const s = Math.max(cw / ww, ch / wh); // cover，与 video 的 object-fit:cover 一致
  const dw = ww * s, dh = wh * s;
  pctx.clearRect(0, 0, cw, ch);
  pctx.drawImage(previewWork, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

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

  maybeGuide();
  requestAnimationFrame(drawOverlay);
}

/* ---------- 实时构图引导（本地人物检测）---------- */
async function ensureDetector() {
  if (detector || detectorLoading) return;
  detectorLoading = true;
  $("guideHint").classList.remove("hidden");
  $("guideHint").innerHTML = '<div class="gtext">智能引导加载中…</div>';
  try {
    const V = "0.10.14";
    const vision = await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${V}/vision_bundle.mjs`);
    const fileset = await vision.FilesetResolver.forVisionTasks(
      `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${V}/wasm`);
    // 物体检测：识别"人"，远近/全身半身都能认到
    detector = await vision.ObjectDetector.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      scoreThreshold: 0.3,
      maxResults: 5,
    });
  } catch (e) {
    guideOn = false;
    $("guideBtn").textContent = "引导 关";
    $("guideHint").innerHTML = '<div class="gtext">引导加载失败（需联网）</div>';
    setTimeout(() => $("guideHint").classList.add("hidden"), 2000);
  }
  detectorLoading = false;
}

function showGuide(arrow, text, ok) {
  const el = $("guideHint");
  el.classList.remove("hidden");
  el.innerHTML = `<div class="garrow${ok ? " ok" : ""}">${arrow}</div><div class="gtext${ok ? " ok" : ""}">${text}</div>`;
}

function maybeGuide() {
  if (!guideOn || !detector) return;
  const shooting = $("result").classList.contains("hidden");
  if (!shooting || !video.videoWidth) return;
  const now = performance.now();
  if (now - lastDetectTs < 140) return; // 约 7 次/秒
  lastDetectTs = now;

  let res;
  try { res = detector.detectForVideo(video, now); } catch (e) { return; }
  const persons = ((res && res.detections) || []).filter(
    (d) => d.categories && d.categories[0] && d.categories[0].categoryName === "person");
  if (!persons.length) { showGuide("📷", "把人放进画面", false); return; }

  // 取面积最大的人为主体
  let big = persons[0];
  for (const d of persons)
    if (d.boundingBox.width * d.boundingBox.height > big.boundingBox.width * big.boundingBox.height) big = d;
  const bb = big.boundingBox;
  const vw = video.videoWidth, vh = video.videoHeight;
  const z = digitalZoom || 1;                 // 考虑数码变焦的中心裁切
  const cropW = vw / z, cropH = vh / z, ox = (vw - cropW) / 2, oy = (vh - cropH) / 2;
  const nx = (bb.originX + bb.width / 2 - ox) / cropW;   // 人中心 x（0~1，相对可见画面）
  const fh = bb.height / cropH;                           // 人占画面高度比例

  // 1) 水平仪
  if (tilt.ready && Math.abs(tilt.roll) > 4) {
    showGuide(tilt.roll > 0 ? "↺" : "↻", "把手机放平", false); return;
  }
  // 2) 远近（按人的高度判断）
  if (fh > 0.98) { showGuide("⤢", "退后一点（人顶到边了）", false); return; }
  if (fh < 0.35) { showGuide("⤡", "靠近一点", false); return; }
  // 3) 水平：把人放到最近的三分线（0.33 或 0.67）
  const targetX = nx < 0.5 ? 1 / 3 : 2 / 3;
  if (nx - targetX > 0.08) { showGuide("→", "镜头右移", false); return; }
  if (nx - targetX < -0.08) { showGuide("←", "镜头左移", false); return; }

  showGuide("✓", "构图不错！", true);
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
  const z = digitalZoom || 1;                  // 数码变焦：中心裁切
  const sw = vw / z, sh = vh / z, sx = (vw - sw) / 2, sy = (vh - sh) / 2;
  const scale = Math.min(1, maxW / sw);
  const c = document.createElement("canvas");
  c.width = Math.round(sw * scale);
  c.height = Math.round(sh * scale);
  c.getContext("2d").drawImage(video, sx, sy, sw, sh, 0, 0, c.width, c.height);
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
  if (lutCache["lut:mine"]) ensureMineChip();
  applyPreset(livePreset); // 沿用取景时选的风格
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
  { id: "jp", name: "日系", temp: -2, tint: 2, exposure: 0.08, contrast: 0.9, saturation: 0.95,
    blackLift: 0.1, shadow: [2, 4, 6], highlight: [5, 5, 3], vignette: 0.0, grain: 0.02 },
  { id: "jpfilm", name: "日系胶片", temp: 0, tint: 6, exposure: 0.03, contrast: 0.96, saturation: 0.9,
    blackLift: 0.08, shadow: [-2, 5, 3], highlight: [6, 6, -2], vignette: 0.06, grain: 0.06 },
  { id: "hk", name: "港风", temp: 2, tint: 7, exposure: -0.02, contrast: 1.05, saturation: 0.82,
    blackLift: 0.07, shadow: [-7, 3, 7], highlight: [11, 6, -7], vignette: 0.16, grain: 0.09 },
  { id: "guofeng", name: "古风", temp: 4, tint: 3, exposure: -0.02, contrast: 1.02, saturation: 0.7,
    blackLift: 0.06, shadow: [-3, 1, 2], highlight: [8, 6, -2], vignette: 0.18, grain: 0.05 },
  { id: "cine", name: "电影", temp: -4, exposure: 0.0, contrast: 1.16, saturation: 0.9,
    blackLift: 0.04, shadow: [-9, 0, 11], highlight: [13, 5, -9], vignette: 0.22, grain: 0.05 },
  { id: "tealorange", name: "青橙", temp: -2, exposure: 0.0, contrast: 1.14, saturation: 1.0,
    blackLift: 0.03, shadow: [-12, -2, 14], highlight: [16, 7, -12], vignette: 0.18, grain: 0.04 },
  { id: "cool", name: "冷调", temp: -14, tint: -2, exposure: -0.03, contrast: 1.12, saturation: 0.85,
    blackLift: 0.04, shadow: [-6, -2, 10], highlight: [-4, 0, 6], vignette: 0.2, grain: 0.05 },
  { id: "cream", name: "奶油", temp: 8, exposure: 0.07, contrast: 0.92, saturation: 0.95,
    blackLift: 0.1, shadow: [6, 4, 2], highlight: [12, 8, 2], vignette: 0.0, grain: 0.02 },
  { id: "vintage", name: "复古", temp: 10, tint: 4, exposure: -0.02, contrast: 1.0, saturation: 0.78,
    blackLift: 0.12, shadow: [6, 4, -4], highlight: [14, 10, -10], vignette: 0.24, grain: 0.12 },
  { id: "blackgold", name: "黑金", temp: 6, exposure: -0.04, contrast: 1.2, saturation: 0.7,
    blackLift: 0.0, shadow: [-2, -2, -2], highlight: [16, 10, -12], vignette: 0.26, grain: 0.05 },
  { id: "cyber", name: "赛博", temp: -6, tint: -6, exposure: 0.0, contrast: 1.16, saturation: 1.25,
    blackLift: 0.03, shadow: [-8, -4, 16], highlight: [14, -6, 12], vignette: 0.2, grain: 0.05 },
  { id: "warm", name: "暖阳", temp: 14, exposure: 0.06, contrast: 1.06, saturation: 1.1,
    blackLift: 0.02, shadow: [2, 1, -2], highlight: [13, 6, -8], vignette: 0.08, grain: 0.03 },
  { id: "bw", name: "黑白", exposure: 0.03, contrast: 1.18, saturation: 0, blackLift: 0.04,
    grayscale: true, vignette: 0.16, grain: 0.10 },
];

// 内置原创胶片 LUT（自制，可商用），按需加载
const LUT_FILES = [
  { id: "lut:kodak", name: "柯达金", file: "luts/kodak-warm.cube" },
  { id: "lut:fuji", name: "富士绿", file: "luts/fuji-green.cube" },
  { id: "lut:cine", name: "影院", file: "luts/cine-tealorange.cube" },
  { id: "lut:fade", name: "褪色", file: "luts/vintage-fade.cube" },
  { id: "lut:mono", name: "银盐黑白", file: "luts/silver-mono.cube" },
];
const lutCache = {}; // id -> { size, data:Float32Array }
const ALL_LOOKS = () => PRESETS.concat(LUT_FILES);

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

// 参数化风格调色（色调LUT + 饱和/黑白 + 分离色调 + 暗角 + 颗粒）
function gradePreset(d, w, h, p, opts) {
  const lut = buildLUT(p);
  const sat = p.saturation == null ? 1 : p.saturation;
  const gray = !!p.grayscale;
  const sh = p.shadow || [0, 0, 0], hi = p.highlight || [0, 0, 0];
  const split = !!(p.shadow || p.highlight);
  const vig = p.vignette || 0, grain = (opts && opts.noGrain) ? 0 : (p.grain || 0);
  const cx = w / 2, cy = h / 2, maxd2 = cx * cx + cy * cy;
  const xs = new Float32Array(w);
  for (let x = 0; x < w; x++) xs[x] = (x - cx) * (x - cx);
  for (let y = 0; y < h; y++) {
    const dy2 = (y - cy) * (y - cy);
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      const idx = row + x * 4;
      let r = lut[0][d[idx]], g = lut[1][d[idx + 1]], b = lut[2][d[idx + 2]];
      const L = 0.299 * r + 0.587 * g + 0.114 * b;
      if (gray) { r = g = b = L; }
      else if (sat !== 1) { r = L + (r - L) * sat; g = L + (g - L) * sat; b = L + (b - L) * sat; }
      if (split) {
        const t = L / 255, ws = 1 - t;
        r += sh[0] * ws + hi[0] * t; g += sh[1] * ws + hi[1] * t; b += sh[2] * ws + hi[2] * t;
      }
      if (vig) { const dd = (xs[x] + dy2) / maxd2; const f = 1 - vig * dd * dd; r *= f; g *= f; b *= f; }
      if (grain) { const n = (Math.random() - 0.5) * grain * 55; r += n; g += n; b += n; }
      d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; // Uint8ClampedArray 自动裁剪 0-255
    }
  }
}

// 按风格 id 给一段像素调色（原图 / LUT / 参数风格）
function gradeData(d, w, h, id, opts) {
  if (id === "none") return;
  if (id.indexOf("lut:") === 0) { const lut = lutCache[id]; if (lut) applyCubeLUT(d, lut); return; }
  const p = PRESETS.find((x) => x.id === id);
  if (p) gradePreset(d, w, h, p, opts);
}

// 套用到已拍摄的整张照片，刷新预览与"保存"
function applyPreset(id) {
  currentPreset = id;
  document.querySelectorAll("#filters .chip").forEach((el) =>
    el.classList.toggle("active", el.dataset.id === id));
  if (!srcImageData) return;
  const out = new ImageData(new Uint8ClampedArray(srcImageData.data), srcW, srcH);
  gradeData(out.data, srcW, srcH, id);
  const c = document.createElement("canvas");
  c.width = srcW; c.height = srcH;
  c.getContext("2d").putImageData(out, 0, 0);
  const url = c.toDataURL("image/jpeg", 0.92);
  $("resultImg").src = url;
  $("saveBtn").href = url;
}

// 通用滤镜条构建（拍后页 / 取景页共用）
function buildStrip(boxId, onPick) {
  const box = $(boxId);
  if (box.childElementCount) return;
  box.innerHTML = ALL_LOOKS().map((p) =>
    `<button class="chip${p.id === "none" ? " active" : ""}" data-id="${p.id}">${p.name}</button>`).join("")
    + `<button class="chip import" data-id="import">+ LUT</button>`;
  box.querySelectorAll(".chip").forEach((el) =>
    el.addEventListener("click", async () => {
      const id = el.dataset.id;
      if (id === "import") { $("lutFile").click(); return; }
      if (id.indexOf("lut:") === 0) { try { await ensureLut(id); } catch (e) { alert("LUT 加载失败：" + e.message); return; } }
      onPick(id);
    }));
}

function renderFilterStrip() { buildStrip("filters", applyPreset); }
function renderLiveStrip() { buildStrip("liveFilters", selectLivePreset); }

/* ---------- 3D LUT (.cube) 引擎 ---------- */
function parseCube(text) {
  let size = 0;
  const data = [];
  for (let raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line[0] === "#") continue;
    if (/^TITLE/i.test(line)) continue;
    if (/^LUT_1D_SIZE/i.test(line)) throw new Error("暂只支持 3D LUT(.cube)");
    if (/^LUT_3D_SIZE/i.test(line)) { size = parseInt(line.split(/\s+/)[1], 10); continue; }
    if (/^(DOMAIN_MIN|DOMAIN_MAX|LUT_3D_INPUT_RANGE)/i.test(line)) continue;
    const parts = line.split(/\s+/).map(Number);
    if (parts.length === 3 && parts.every((n) => !isNaN(n))) data.push(parts[0], parts[1], parts[2]);
  }
  if (!size || data.length !== size * size * size * 3) throw new Error("LUT 解析失败或尺寸不符");
  return { size, data: Float32Array.from(data) };
}

// 三线性插值套用 3D LUT（R 变化最快，符合 .cube 规范）
function applyCubeLUT(d, lut) {
  const N = lut.size, N1 = N - 1, L = lut.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = (d[i] / 255) * N1, g = (d[i + 1] / 255) * N1, b = (d[i + 2] / 255) * N1;
    const r0 = r | 0, g0 = g | 0, b0 = b | 0;
    const r1 = r0 < N1 ? r0 + 1 : N1, g1 = g0 < N1 ? g0 + 1 : N1, b1 = b0 < N1 ? b0 + 1 : N1;
    const fr = r - r0, fg = g - g0, fb = b - b0;
    const c000 = ((b0 * N + g0) * N + r0) * 3, c100 = ((b0 * N + g0) * N + r1) * 3;
    const c010 = ((b0 * N + g1) * N + r0) * 3, c110 = ((b0 * N + g1) * N + r1) * 3;
    const c001 = ((b1 * N + g0) * N + r0) * 3, c101 = ((b1 * N + g0) * N + r1) * 3;
    const c011 = ((b1 * N + g1) * N + r0) * 3, c111 = ((b1 * N + g1) * N + r1) * 3;
    for (let k = 0; k < 3; k++) {
      const x00 = L[c000 + k] * (1 - fr) + L[c100 + k] * fr;
      const x10 = L[c010 + k] * (1 - fr) + L[c110 + k] * fr;
      const x01 = L[c001 + k] * (1 - fr) + L[c101 + k] * fr;
      const x11 = L[c011 + k] * (1 - fr) + L[c111 + k] * fr;
      const y0 = x00 * (1 - fg) + x10 * fg, y1 = x01 * (1 - fg) + x11 * fg;
      d[i + k] = (y0 * (1 - fb) + y1 * fb) * 255;
    }
  }
}

// 加载内置 LUT 文件（带缓存）
async function ensureLut(id) {
  if (lutCache[id]) return lutCache[id];
  const f = LUT_FILES.find((x) => x.id === id);
  if (!f) throw new Error("未知 LUT");
  const txt = await fetch(f.file).then((r) => { if (!r.ok) throw new Error("找不到文件"); return r.text(); });
  lutCache[id] = parseCube(txt);
  return lutCache[id];
}

// 在两个滤镜条里补上"我的LUT"按钮
function ensureMineChip() {
  for (const stripId of ["filters", "liveFilters"]) {
    const strip = $(stripId);
    if (!strip || !strip.childElementCount) continue;
    if (strip.querySelector('.chip[data-id="lut:mine"]')) continue;
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.id = "lut:mine";
    chip.textContent = "我的LUT";
    chip.addEventListener("click", stripId === "filters"
      ? () => applyPreset("lut:mine")
      : () => selectLivePreset("lut:mine"));
    strip.insertBefore(chip, strip.querySelector(".chip.import"));
  }
}

// 导入自定义 .cube
$("lutFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    lutCache["lut:mine"] = parseCube(await file.text());
    ensureMineChip();
    // 取景中导入则直接套到实时预览，否则套到已拍照片
    if ($("result").classList.contains("hidden")) selectLivePreset("lut:mine");
    else applyPreset("lut:mine");
  } catch (err) {
    alert("LUT 导入失败：" + err.message);
  }
  e.target.value = "";
});

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

$("guideBtn").addEventListener("click", () => {
  guideOn = !guideOn;
  $("guideBtn").textContent = guideOn ? "引导 开" : "引导 关";
  if (guideOn) ensureDetector();
  else $("guideHint").classList.add("hidden");
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
  renderLiveStrip();
  setupPinch();
  requestAnimationFrame(drawOverlay);
  requestAnimationFrame(renderPreview);
  if (!getProxyUrl()) openSettings(); // 首次使用提示填代理
}

// 需用户手势才能在 iOS 上申请方向权限，这里在首次点击时补一次
document.body.addEventListener("click", enableOrientation, { once: true });

init();
