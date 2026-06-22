/* 极简登录 + 带 token 的 fetch（window.apiFetch）
 * 有后端时：401 自动弹登录、带 Bearer 重试。
 * 无后端时（GitHub Pages 原型）：请求自然失败，调用方各自回退本地 mock。
 */
(function () {
  const KEY = "intake_token";
  const header = () => { const t = localStorage.getItem(KEY); return t ? { Authorization: "Bearer " + t } : {}; };

  function overlay() {
    let ov = document.getElementById("loginOverlay");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "loginOverlay";
      ov.innerHTML = `<div class="lg-card"><div class="lg-h">管理员登录</div>
        <input id="lgPw" type="password" placeholder="管理员密码" />
        <div id="lgErr" class="lg-err"></div>
        <button id="lgBtn">登录</button></div>`;
      document.body.appendChild(ov);
      const s = document.createElement("style");
      s.textContent = `#loginOverlay{position:fixed;inset:0;background:rgba(31,30,27,.45);display:flex;align-items:center;justify-content:center;z-index:50}
        #loginOverlay .lg-card{background:#fff;border-radius:14px;padding:22px;width:300px;font-family:Inter,system-ui,sans-serif}
        #loginOverlay .lg-h{font-weight:600;margin-bottom:14px}
        #loginOverlay input{width:100%;box-sizing:border-box;padding:9px 11px;border:1px solid #E5E1D6;border-radius:8px;font-size:14px;outline:none}
        #loginOverlay .lg-err{color:#b5634a;font-size:13px;min-height:18px;margin:6px 0}
        #loginOverlay button{width:100%;padding:9px;border:none;border-radius:8px;background:#CC785C;color:#fff;font-size:14px;font-weight:500;cursor:pointer}`;
      document.head.appendChild(s);
    }
    ov.style.display = "flex";
    return ov;
  }

  function login() {
    return new Promise((resolve) => {
      const ov = overlay();
      const pw = ov.querySelector("#lgPw"), btn = ov.querySelector("#lgBtn"), err = ov.querySelector("#lgErr");
      pw.value = ""; err.textContent = ""; pw.focus();
      const go = async () => {
        btn.disabled = true; err.textContent = "";
        try {
          const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw.value }) });
          if (r.ok) { localStorage.setItem(KEY, (await r.json()).token); ov.style.display = "none"; btn.disabled = false; resolve(); return; }
          err.textContent = "密码错误";
        } catch { err.textContent = "连不上服务"; }
        btn.disabled = false;
      };
      btn.onclick = go;
      pw.onkeydown = (e) => { if (e.key === "Enter") go(); };
    });
  }

  window.apiFetch = async function (path, opts = {}) {
    const o = { ...opts, headers: { ...(opts.headers || {}), ...header() } };
    if (o.body && !o.headers["Content-Type"]) o.headers["Content-Type"] = "application/json";
    const r = await fetch(path, o);
    if (r.status === 401) { await login(); return window.apiFetch(path, opts); }
    return r;
  };
})();
