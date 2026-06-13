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

const PROXY_KEY = "ai_photo_proxy_url";
const getProxyUrl = () => localStorage.getItem(PROXY_KEY) || "";

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
function captureFrame(maxW = 1024) {
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw) return null;
  const scale = Math.min(1, maxW / vw);
  const c = document.createElement("canvas");
  c.width = Math.round(vw * scale);
  c.height = Math.round(vh * scale);
  c.getContext("2d").drawImage(video, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

/* ---------- 调用混元代理 ---------- */
async function askAI(dataUrl, mode) {
  const proxy = getProxyUrl();
  if (!proxy) {
    openSettings();
    throw new Error("请先在设置里填写 AI 代理地址。");
  }
  const resp = await fetch(proxy.replace(/\/$/, "") + "/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataUrl, mode }),
  });
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
  const frame = captureFrame(2048);
  if (!frame) return;
  $("resultImg").src = frame;
  $("saveBtn").href = frame;
  $("critiqueBody").innerHTML = "";
  $("result").classList.remove("hidden");
});

$("retakeBtn").addEventListener("click", () => $("result").classList.add("hidden"));

$("critiqueBtn").addEventListener("click", async () => {
  $("critiqueBody").innerHTML = '<div class="loading">AI 正在点评这张照片…</div>';
  try {
    const text = await askAI($("resultImg").src, "critique");
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
