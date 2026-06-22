/* Gmail 拉取 —— 按配置里的标签轮询报价邮件
 *
 * 底层 OAuth 应用凭证在 .env（我们交付时设），refresh_token 由客户在后台点
 * 「授权 Gmail」走 OAuth 拿到、存进配置。这里只读权限 gmail.readonly。
 */
import { google } from "googleapis";
import { getGoogle } from "./config.js";

export function oauthClient() {
  const g = getGoogle();
  const o = new google.auth.OAuth2(g.clientId, g.clientSecret, g.redirectUri);
  if (g.refreshToken) o.setCredentials({ refresh_token: g.refreshToken });
  return o;
}

// 递归取 text/plain（没有就取 text/html 去标签）
function extractBody(payload) {
  if (!payload) return "";
  const decode = (data) => Buffer.from(data || "", "base64").toString("utf8");
  if (payload.mimeType === "text/plain" && payload.body?.data) return decode(payload.body.data);
  if (payload.parts) {
    for (const p of payload.parts) {
      const t = extractBody(p);
      if (t) return t;
    }
  }
  if (payload.mimeType === "text/html" && payload.body?.data) {
    return decode(payload.body.data).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return "";
}
const header = (headers, name) => headers.find((h) => h.name.toLowerCase() === name)?.value || "";

// 返回未处理过的新邮件 [{ id, from, subject, body, date }]
export async function fetchNewQuotes(seenIds = new Set()) {
  const g = getGoogle();
  if (!g.refreshToken) return []; // 还没授权，先不拉
  const gmail = google.gmail({ version: "v1", auth: oauthClient() });
  const list = await gmail.users.messages.list({ userId: "me", q: `label:${g.label}`, maxResults: 25 });
  const ids = (list.data.messages || []).map((m) => m.id).filter((id) => !seenIds.has(id));
  const out = [];
  for (const id of ids) {
    const msg = await gmail.users.messages.get({ userId: "me", id, format: "full" });
    const headers = msg.data.payload?.headers || [];
    out.push({
      id,
      from: header(headers, "from"),
      subject: header(headers, "subject"),
      date: header(headers, "date"),
      body: extractBody(msg.data.payload) || msg.data.snippet || "",
    });
  }
  return out;
}
