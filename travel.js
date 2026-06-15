/* 到了就看 · 景点地图（高德地图）
 * 打开 → 自动定位 → 显示你在哪 + 地图 + 周边景点
 */
const $ = (id) => document.getElementById(id);

const KEY_K = "amap_key", KEY_S = "amap_sec";
const getKey = () => localStorage.getItem(KEY_K) || "";
const getSec = () => localStorage.getItem(KEY_S) || "";

let map = null, meMarker = null, poiMarkers = [], placeSearch = null, geocoder = null;

/* ---------- 加载高德 JS API ---------- */
function loadAmap(key, sec) {
  return new Promise((resolve, reject) => {
    if (window.AMap) return resolve();
    if (sec) window._AMapSecurityConfig = { securityJsCode: sec };
    const s = document.createElement("script");
    s.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}&plugin=AMap.Geolocation,AMap.PlaceSearch,AMap.Geocoder`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("地图脚本加载失败"));
    document.head.appendChild(s);
  });
}

/* ---------- 初始化地图 ---------- */
async function initMap() {
  try {
    await loadAmap(getKey(), getSec());
  } catch (e) {
    $("whereami").textContent = "地图加载失败，请检查 key";
    openSettings();
    return;
  }
  map = new AMap.Map("map", { zoom: 15, viewMode: "2D" });
  placeSearch = new AMap.PlaceSearch({ type: "风景名胜|公园广场|旅游景点", pageSize: 20 });
  geocoder = new AMap.Geocoder();
  locate();
}

/* ---------- 定位 ---------- */
function locate() {
  $("whereami").textContent = "定位中…";
  const geo = new AMap.Geolocation({ enableHighAccuracy: true, timeout: 12000, showButton: false });
  map.addControl(geo);
  geo.getCurrentPosition((status, result) => {
    if (status === "complete" && result.position) {
      onLocated([result.position.lng, result.position.lat]);
    } else {
      $("whereami").textContent = "定位失败，可手动搜索地点";
    }
  });
}

function onLocated(center) {
  map.setZoomAndCenter(15, center);
  if (meMarker) meMarker.setPosition(center);
  else meMarker = new AMap.Marker({
    position: center, map,
    content: '<div style="width:18px;height:18px;background:#2f6f9c;border:3px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,.4)"></div>',
    offset: new AMap.Pixel(-9, -9),
  });
  // 你在哪
  geocoder.getAddress(center, (s, r) => {
    if (s === "complete" && r.regeocode) {
      const c = r.regeocode.addressComponent;
      const near = (r.regeocode.aois && r.regeocode.aois[0] && r.regeocode.aois[0].name)
        || (r.regeocode.pois && r.regeocode.pois[0] && r.regeocode.pois[0].name) || "";
      $("whereami").textContent = "📍 " + [c.district, c.township, near].filter(Boolean).join(" · ");
    }
  });
  searchNearby(center);
}

/* ---------- 周边景点 ---------- */
function searchNearby(center) {
  placeSearch.searchNearBy("", center, 3000, (status, result) => {
    const pois = (status === "complete" && result.poiList && result.poiList.pois) || [];
    renderPois(pois, center);
  });
}

function clearPoiMarkers() { poiMarkers.forEach((m) => map.remove(m)); poiMarkers = []; }

function renderPois(pois, center) {
  clearPoiMarkers();
  const list = $("poiList");
  if (!pois.length) { list.innerHTML = '<div class="empty">附近没找到景点，换个地方或手动搜索</div>'; return; }
  list.innerHTML = "";
  pois.forEach((p, i) => {
    const pos = [p.location.lng, p.location.lat];
    const marker = new AMap.Marker({
      position: pos, map,
      content: `<div style="background:#e6492d;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #fff">${i + 1}</div>`,
      offset: new AMap.Pixel(-12, -12),
    });
    marker.on("click", () => map.setZoomAndCenter(17, pos));
    poiMarkers.push(marker);

    const dist = p.distance != null ? (p.distance >= 1000 ? (p.distance / 1000).toFixed(1) + "km" : p.distance + "m") : "";
    const row = document.createElement("div");
    row.className = "poi";
    row.innerHTML = `<div class="idx">${i + 1}</div>
      <div class="info"><div class="name">${esc(p.name)}</div>
      <div class="meta">${esc(p.type ? p.type.split(";").pop() : "")}${p.address ? " · " + esc(p.address) : ""}</div></div>
      <div class="dist">${dist}</div>`;
    row.addEventListener("click", () => { map.setZoomAndCenter(17, pos); });
    list.appendChild(row);
  });
}

function esc(s) { return String(s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

/* ---------- 搜索框 ---------- */
$("searchInput").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const kw = e.target.value.trim();
  if (!kw || !placeSearch) return;
  placeSearch.search(kw, (status, result) => {
    const pois = (status === "complete" && result.poiList && result.poiList.pois) || [];
    if (pois.length) {
      const pos = [pois[0].location.lng, pois[0].location.lat];
      map.setZoomAndCenter(15, pos);
      renderPois(pois, pos);
      $("whereami").textContent = "🔎 " + esc(pois[0].name);
    }
  });
});

$("locBtn").addEventListener("click", () => { if (map) locate(); });

/* ---------- 设置 ---------- */
function openSettings() {
  $("amapKey").value = getKey();
  $("amapSec").value = getSec();
  $("settings").classList.remove("hidden");
}
$("setBtn").addEventListener("click", openSettings);
$("setCancel").addEventListener("click", () => $("settings").classList.add("hidden"));
$("setSave").addEventListener("click", () => {
  localStorage.setItem(KEY_K, $("amapKey").value.trim());
  localStorage.setItem(KEY_S, $("amapSec").value.trim());
  $("settings").classList.add("hidden");
  location.reload();
});

/* ---------- 启动 ---------- */
if (!getKey()) openSettings();
else initMap();
