/* 轮询编排 —— 定时拉新邮件 → AI 抽取 → 落地为待确认
 *
 * 单业务邮箱场景轮询最稳；默认每 5 分钟一轮（POLL_INTERVAL_MS 可调）。
 */
import { fetchNewQuotes } from "./gmail.js";
import { extractQuote } from "./extract.js";
import { addPending, isSeen, list } from "./store.js";

const INTERVAL = Number(process.env.POLL_INTERVAL_MS) || 5 * 60 * 1000;

async function runOnce() {
  const seen = new Set(list().map((r) => r.gmailId));
  let mails;
  try {
    mails = await fetchNewQuotes(seen);
  } catch (e) {
    console.error("[poller] 拉取 Gmail 失败：", e.message);
    return;
  }
  for (const mail of mails) {
    if (isSeen(mail.id)) continue;
    try {
      const fields = await extractQuote({ subject: mail.subject, from: mail.from, body: mail.body });
      addPending({
        gmailId: mail.id,
        source: { from: mail.from, subject: mail.subject, date: mail.date, body: mail.body.slice(0, 4000) },
        fields,
      });
      console.log(`[poller] 已抽取：${mail.subject} -> ${fields.kol_name}`);
    } catch (e) {
      console.error(`[poller] 抽取失败（${mail.subject}）：`, e.message);
    }
  }
}

export function startPoller() {
  console.log(`[poller] 启动，每 ${Math.round(INTERVAL / 1000)}s 轮询一次`);
  runOnce();
  setInterval(runOnce, INTERVAL);
}
