/* 配置存储 —— 唯一的运行时配置来源（页面可改、落地到 data/config.json）
 *
 * 分两类：
 *  - 客户在页面上改的（label/模型/字段模板/飞书表/开关…）→ 存这里。
 *  - 我们交付时设的「底层应用」密钥（Google/飞书 应用）→ 放 .env，永不进前端。
 * 这样换配置不用动代码、不用重启，底层密钥也不暴露给浏览器。
 */
import fs from "fs";
import path from "path";
import kolQuote from "./templates/kol-quote.js";

const FILE = process.env.CONFIG_FILE || path.join(process.cwd(), "data", "config.json");
const MASK = "••••••";

// 页面可改部分的默认值（首次启动用 KOL 报价模板兜底）
const DEFAULTS = {
  source: { label: "KOL报价", intervalMin: 5 },
  oauth: { email: "", refreshToken: "", authorizedAt: "" },
  llm: { provider: "anthropic", model: "claude-opus-4-8", apiKey: "", baseUrl: "" },
  template: { name: kolQuote.name, systemPrompt: kolQuote.systemPrompt, fields: kolQuote.fields },
  destination: { appToken: "", tableId: "", columns: [] },
  running: false,
};

let cache = null;
function load() {
  if (cache) return cache;
  try { cache = deepDefault(JSON.parse(fs.readFileSync(FILE, "utf8")), DEFAULTS); }
  catch { cache = structuredClone(DEFAULTS); }
  return cache;
}
function persist() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(cache, null, 2));
}
function deepDefault(obj, def) {
  const out = structuredClone(def);
  for (const k of Object.keys(def)) {
    if (obj && typeof def[k] === "object" && !Array.isArray(def[k]) && obj[k]) out[k] = deepDefault(obj[k], def[k]);
    else if (obj && obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/* ---------- 给后端各模块用的访问器 ---------- */
const env = process.env;
export const feishuConfigured = () => !!(env.FEISHU_APP_ID && env.FEISHU_APP_SECRET);

export function getLLM() {
  const c = load().llm;
  const apiKey = c.apiKey || (c.provider === "anthropic" ? env.ANTHROPIC_API_KEY || "" : "");
  return { provider: c.provider, model: c.model, apiKey, baseUrl: c.baseUrl };
}
export function getGoogle() {
  const c = load();
  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI || "urn:ietf:wg:oauth:2.0:oob",
    refreshToken: c.oauth.refreshToken,
    label: c.source.label,
  };
}
export function getFeishu() {
  const c = load().destination;
  return {
    base: env.FEISHU_BASE || "https://open.feishu.cn/open-apis",
    appId: env.FEISHU_APP_ID,
    appSecret: env.FEISHU_APP_SECRET,
    appToken: c.appToken,
    tableId: c.tableId,
  };
}
export const getTemplate = () => load().template;
export const isRunning = () => load().running;
export const getIntervalMs = () => Math.max(1, Number(load().source.intervalMin) || 5) * 60 * 1000;

export function setOAuth({ email, refreshToken }) {
  const c = load();
  c.oauth.email = email || c.oauth.email;
  if (refreshToken) c.oauth.refreshToken = refreshToken;
  c.oauth.authorizedAt = new Date().toISOString();
  persist();
}
export function setColumns(columns) { load().destination.columns = columns || []; persist(); }

/* ---------- 给管理后台 API 用的视图 ---------- */
// 给前端的安全视图（脱敏密钥），形状与 admin 原型一致
export function publicView() {
  const c = load();
  return {
    source: { type: "gmail", authorized: !!c.oauth.refreshToken, email: c.oauth.email, label: c.source.label, intervalMin: c.source.intervalMin },
    llm: { provider: c.llm.provider, model: c.llm.model, apiKey: c.llm.apiKey ? MASK : "", baseUrl: c.llm.baseUrl },
    template: c.template,
    destination: { type: "feishu", connected: feishuConfigured(), appToken: c.destination.appToken, tableId: c.destination.tableId, columns: c.destination.columns },
    running: c.running,
  };
}
// 应用前端提交的修改（脱敏占位则保留原值；计算字段忽略）
export function applyPatch(p = {}) {
  const c = load();
  if (p.source) {
    if (p.source.label !== undefined) c.source.label = p.source.label;
    if (p.source.intervalMin !== undefined) c.source.intervalMin = Number(p.source.intervalMin) || 5;
  }
  if (p.llm) {
    for (const k of ["provider", "model", "baseUrl"]) if (p.llm[k] !== undefined) c.llm[k] = p.llm[k];
    if (p.llm.apiKey !== undefined && p.llm.apiKey !== MASK) c.llm.apiKey = p.llm.apiKey;
  }
  if (p.template) c.template = { name: p.template.name, systemPrompt: p.template.systemPrompt || c.template.systemPrompt, fields: p.template.fields || [] };
  if (p.destination) {
    if (p.destination.appToken !== undefined) c.destination.appToken = p.destination.appToken;
    if (p.destination.tableId !== undefined) c.destination.tableId = p.destination.tableId;
    if (p.destination.columns !== undefined) c.destination.columns = p.destination.columns;
  }
  if (p.running !== undefined) c.running = !!p.running;
  persist();
  return publicView();
}
export function setRunning(on) { load().running = !!on; persist(); }
