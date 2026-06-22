/* 轮询编排 —— 按配置的开关和间隔，定时拉新邮件 → AI 抽取 → 落地待确认
 *
 * 每轮都重新读配置：后台改了间隔/开关，无需重启即时生效。
 */
import { fetchNewQuotes } from "./gmail.js";
import { extractQuote } from "./extract.js";
import { addPending, isSeen, list } from "./store.js";
import { isRunning, getIntervalMs } from "./config.js";

async function runOnce() {
  if (!isRunning()) return;
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
      console.log(`[poller] 已抽取：${mail.subject} -> ${fields.kol_name || ""}`);
    } catch (e) {
      console.error(`[poller] 抽取失败（${mail.subject}）：`, e.message);
    }
  }
}

export function startPoller() {
  console.log("[poller] 已启动（按后台开关与间隔运行）");
  const tick = async () => {
    await runOnce();
    setTimeout(tick, getIntervalMs()); // 每轮重读间隔
  };
  setTimeout(tick, 3000);
}
