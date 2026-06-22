/* HTTP 服务 —— 无代码配置后台 + 人工审核台 + Gmail 授权 + 轮询
 *
 * 路由：
 *   /admin            无代码配置后台（页面操作所有配置）
 *   /                 人工审核台
 *   POST /api/login   管理员登录（ADMIN_PASSWORD）
 *   GET/PUT /api/config           读/写配置（密钥脱敏）
 *   POST /api/test/llm|feishu     测试连接
 *   POST /api/feishu/columns      拉取飞书表头
 *   POST /api/run                 启停自动处理
 *   GET  /api/template            当前模板字段（审核台用）
 *   GET  /api/records  POST .../approve  .../reject   审核
 *   GET  /oauth/google/start|callback    Gmail 授权
 */
import express from "express";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

import * as config from "./config.js";
import { list, get, update } from "./store.js";
import { appendRecord, fetchColumns } from "./feishu.js";
import { completeJSON } from "./llm.js";
import { activeTemplate } from "./templates/index.js";
import { oauthClient } from "./gmail.js";
import { startPoller } from "./poller.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

/* ---------- 登录 / 鉴权 ---------- */
const ADMIN_PW = process.env.ADMIN_PASSWORD || "admin";
const tokens = new Set();

app.post("/api/login", (req, res) => {
  if ((req.body?.password ?? "") === ADMIN_PW) {
    const t = crypto.randomBytes(24).toString("hex");
    tokens.add(t);
    return res.json({ token: t });
  }
  res.status(401).json({ error: "密码错误" });
});

// /api/* 全部需登录（除 /api/login）
app.use("/api", (req, res, next) => {
  if (req.path === "/login") return next();
  const t = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (tokens.has(t)) return next();
  res.status(401).json({ error: "未登录" });
});

/* ---------- 配置 ---------- */
app.get("/api/config", (req, res) => res.json(config.publicView()));
app.put("/api/config", (req, res) => res.json(config.applyPatch(req.body || {})));
app.post("/api/run", (req, res) => { config.setRunning(!!req.body?.running); res.json(config.publicView()); });

/* ---------- 测试连接 ---------- */
app.post("/api/test/llm", async (req, res) => {
  try {
    const out = await completeJSON({
      system: "回显测试。",
      user: "请输出 {\"ok\": true}。",
      schema: { type: "object", properties: { ok: { type: "boolean" } }, required: ["ok"], additionalProperties: false },
    });
    res.json({ ok: out.ok !== undefined });
  } catch (e) { res.status(502).json({ ok: false, error: e.message }); }
});

app.post("/api/test/feishu", async (req, res) => {
  try { await fetchColumns(); res.json({ ok: true }); }
  catch (e) { res.status(502).json({ ok: false, error: e.message }); }
});

app.post("/api/feishu/columns", async (req, res) => {
  try {
    const columns = await fetchColumns();
    config.setColumns(columns);
    res.json({ columns });
  } catch (e) { res.status(502).json({ error: e.message }); }
});

/* ---------- 审核台数据 ---------- */
app.get("/api/template", (req, res) => {
  const t = activeTemplate();
  res.json({ name: t.name, model: { provider: config.getLLM().provider, model: config.getLLM().model }, fields: t.fields.map(({ key, label, type }) => ({ key, label, type })) });
});
app.get("/api/records", (req, res) => res.json(list(req.query.status)));

app.post("/api/records/:id/approve", async (req, res) => {
  const rec = get(req.params.id);
  if (!rec) return res.status(404).json({ error: "记录不存在" });
  if (rec.status === "approved") return res.status(409).json({ error: "已入库，勿重复" });
  const fields = { ...rec.fields, ...(req.body?.fields || {}) };
  try {
    const feishuRecordId = await appendRecord(fields);
    res.json(update(rec.id, { status: "approved", fields, feishuRecordId }));
  } catch (e) { res.status(502).json({ error: e.message }); }
});
app.post("/api/records/:id/reject", (req, res) => {
  const rec = get(req.params.id);
  if (!rec) return res.status(404).json({ error: "记录不存在" });
  res.json(update(rec.id, { status: "rejected" }));
});

/* ---------- Gmail 授权（页面点按钮触发，无需脚本）---------- */
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];
app.get("/oauth/google/start", (req, res) => {
  const url = oauthClient().generateAuthUrl({ access_type: "offline", prompt: "consent", scope: SCOPES });
  res.redirect(url);
});
app.get("/oauth/google/callback", async (req, res) => {
  try {
    const client = oauthClient();
    const { tokens: tk } = await client.getToken(req.query.code);
    client.setCredentials(tk);
    let email = "";
    try { email = (await google.oauth2({ version: "v2", auth: client }).userinfo.get()).data.email || ""; } catch {}
    config.setOAuth({ email, refreshToken: tk.refresh_token });
    res.redirect("/admin/?authorized=1");
  } catch (e) { res.status(500).send("授权失败：" + e.message); }
});

/* ---------- 静态页面 ---------- */
app.use("/admin", express.static(path.join(__dirname, "..", "admin")));
app.use("/", express.static(path.join(__dirname, "..", "web")));

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  console.log(`[server] 配置后台 http://localhost:${PORT}/admin/`);
  console.log(`[server] 审核台   http://localhost:${PORT}/`);
  startPoller();
});
