/* Gmail 拉取 —— 轮询指定标签下的报价邮件
 *
 * 单个业务邮箱场景：用一次性授权拿到的 refresh_token 长期免登录。
 * 只读权限（gmail.readonly）即可。授权拿 token 的步骤见 README。
 */
import { google } from "googleapis";

const LABEL = process.env.GMAIL_LABEL || "KOL报价";

function gmailClient() {
  const oauth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI || "urn:ietf:wg:oauth:2.0:oob",
  );
  oauth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth: oauth });
}

// 从 multipart 邮件里递归取 text/plain（没有就退而取 text/html 去标签）
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

const header = (headers, name) =>
  (headers.find((h) => h.name.toLowerCase() === name)?.value) || "";

// 返回未处理过的新邮件列表 [{ id, from, subject, body, date }]
// seenIds：已处理过的 Gmail message id 集合，避免重复抽取。
export async function fetchNewQuotes(seenIds = new Set()) {
  const gmail = gmailClient();
  const list = await gmail.users.messages.list({
    userId: "me",
    q: `label:${LABEL}`,
    maxResults: 25,
  });
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
