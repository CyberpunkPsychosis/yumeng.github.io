/* 极简 WebGL 全景查看器：把 equirectangular 贴到球面，相机在球心，拖动环视。
 * 无第三方依赖，可移植到微信小程序 <canvas type="webgl"> （同一套着色器与矩阵）。
 */
window.PanoViewer = (function () {
  // ---- mat4（列主序，gl-matrix 风格）----
  function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }
  function lookAt(eye, c, up) {
    let z0 = eye[0] - c[0], z1 = eye[1] - c[1], z2 = eye[2] - c[2];
    let rl = 1 / Math.hypot(z0, z1, z2); z0 *= rl; z1 *= rl; z2 *= rl;
    let x0 = up[1] * z2 - up[2] * z1, x1 = up[2] * z0 - up[0] * z2, x2 = up[0] * z1 - up[1] * z0;
    rl = Math.hypot(x0, x1, x2) || 1; rl = 1 / rl; x0 *= rl; x1 *= rl; x2 *= rl;
    const y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
    return [x0, y0, z0, 0, x1, y1, z1, 0, x2, y2, z2, 0,
      -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]), -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]), -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]), 1];
  }
  function mul(a, b) {
    const o = new Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  }
  function tv(m, x, y, z, w) {
    return [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w,
    m[2] * x + m[6] * y + m[10] * z + m[14] * w, m[3] * x + m[7] * y + m[11] * z + m[15] * w];
  }

  const VS = "attribute vec3 aPos;attribute vec2 aUV;uniform mat4 uMVP;varying vec2 vUV;void main(){gl_Position=uMVP*vec4(aPos,1.0);vUV=aUV;}";
  const FS = "precision mediump float;varying vec2 vUV;uniform sampler2D uTex;void main(){gl_FragColor=texture2D(uTex,vUV);}";
  const R = 10, clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function sphere(stacks, slices) {
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= stacks; i++) {
      const phi = Math.PI * i / stacks;
      for (let j = 0; j <= slices; j++) {
        const th = 2 * Math.PI * j / slices;
        pos.push(R * Math.sin(phi) * Math.cos(th), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(th));
        uv.push(j / slices, i / stacks);
      }
    }
    for (let i = 0; i < stacks; i++) for (let j = 0; j < slices; j++) {
      const a = i * (slices + 1) + j, b = a + slices + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    return { pos, uv, idx };
  }

  function compile(gl, t, src) { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; }

  function PanoViewer(canvas) {
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) throw new Error("WebGL not supported");
    this.canvas = canvas; this.gl = gl;
    this.yaw = 0; this.pitch = 0; this.fov = 75; this.vy = 0; this.vx = 0;
    this.auto = true; this.idle = 0; this.onFrame = null; this._mvp = null;

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog); this.prog = prog;

    const m = sphere(36, 72); this.count = m.idx.length;
    const put = (data, attr, size) => {
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, attr); gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    put(m.pos, "aPos", 3); put(m.uv, "aUV", 2);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(m.idx), gl.STATIC_DRAW);

    this.uMVP = gl.getUniformLocation(prog, "uMVP");
    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([40, 40, 46, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.clearColor(0.1, 0.1, 0.12, 1);

    this._bindInput();
    const loop = () => { this._render(); this._raf = requestAnimationFrame(loop); };
    loop();
  }

  PanoViewer.prototype.setTexture = function (src, opts) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    if (opts && opts.yaw != null) { this.yaw = opts.yaw; this.pitch = 0; }
    this.fov = 75;
  };

  PanoViewer.prototype._camDir = function (yaw, pitch) {
    return [Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), Math.cos(pitch) * Math.sin(yaw)];
  };

  PanoViewer.prototype._render = function () {
    const gl = this.gl, cv = this.canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    gl.viewport(0, 0, cv.width, cv.height);

    // 惯性 + 自动旋转
    this.yaw += this.vy; this.pitch = clamp(this.pitch + this.vx, -1.45, 1.45);
    this.vy *= 0.92; this.vx *= 0.92;
    if (Math.abs(this.vy) < 1e-4) this.vy = 0;
    if (Math.abs(this.vx) < 1e-4) this.vx = 0;
    if (this.auto && this.idle > 90 && !this._down) this.yaw += 0.0012;
    this.idle++;

    const dir = this._camDir(this.yaw, this.pitch);
    const V = lookAt([0, 0, 0], dir, [0, 1, 0]);
    const P = perspective(this.fov * Math.PI / 180, (w || 1) / (h || 1), 0.1, 100);
    const MVP = mul(P, V); this._mvp = MVP;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(this.uMVP, false, new Float32Array(MVP));
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);

    if (this.onFrame) this.onFrame(this);
  };

  // 把场景方向（偏航，俯仰默认 0）投影到屏幕像素；不可见返回 visible:false
  PanoViewer.prototype.project = function (yaw, pitch) {
    pitch = pitch || 0;
    const P = [R * Math.cos(pitch) * Math.cos(yaw), R * Math.sin(pitch), R * Math.cos(pitch) * Math.sin(yaw)];
    const c = tv(this._mvp, P[0], P[1], P[2], 1);
    if (c[3] <= 0.0001) return { visible: false };
    const nx = c[0] / c[3], ny = c[1] / c[3];
    return { x: (nx * 0.5 + 0.5) * this.canvas.clientWidth, y: (1 - (ny * 0.5 + 0.5)) * this.canvas.clientHeight, visible: Math.abs(nx) < 1.25 && Math.abs(ny) < 1.4 };
  };

  PanoViewer.prototype.lookAt = function (yaw) {
    // 取与当前最近的等价角度，缓动过去
    let d = yaw - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    this._target = this.yaw + d; this._tweening = true;
  };

  PanoViewer.prototype._bindInput = function () {
    const cv = this.canvas, self = this; const pts = new Map(); let lastX, lastY, pinch = 0;
    const down = (e) => { cv.setPointerCapture && cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, e); self._down = true; self.idle = 0; lastX = e.clientX; lastY = e.clientY; self.vy = self.vx = 0; self._tweening = false; };
    const move = (e) => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e); self.idle = 0;
      if (pts.size >= 2) {
        const a = [...pts.values()]; const d = Math.hypot(a[0].clientX - a[1].clientX, a[0].clientY - a[1].clientY);
        if (pinch) self.fov = clamp(self.fov - (d - pinch) * 0.12, 42, 92); pinch = d; return;
      }
      const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
      const k = (self.fov / 75) * 0.0028;
      self.yaw -= dx * k; self.pitch = clamp(self.pitch + dy * k, -1.45, 1.45);
      self.vy = -dx * k * 0.6; self.vx = dy * k * 0.6;
    };
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; if (!pts.size) self._down = false; };
    cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", (e) => { e.preventDefault(); self.fov = clamp(self.fov + e.deltaY * 0.04, 42, 92); self.idle = 0; }, { passive: false });
    // 缓动到目标朝向
    const tw = () => { if (self._tweening) { self.yaw += (self._target - self.yaw) * 0.12; if (Math.abs(self._target - self.yaw) < 0.002) { self.yaw = self._target; self._tweening = false; } } requestAnimationFrame(tw); };
    tw();
  };

  return PanoViewer;
})();
