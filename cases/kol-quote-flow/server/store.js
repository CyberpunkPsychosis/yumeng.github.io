/* 本地暂存 —— 抽取结果先落地为「待确认」，人工通过后才进飞书
 *
 * 零依赖的 JSON 文件存储，够用且方便客户在自己服务器上跑。
 * 量大了可平替 SQLite/Postgres，接口不变。
 */
import fs from "fs";
import path from "path";

const FILE = process.env.STORE_FILE || path.join(process.cwd(), "data", "records.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { seenGmailIds: [], records: [] };
  }
}
function save(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

export function isSeen(gmailId) {
  return load().seenGmailIds.includes(gmailId);
}

// 新增一条待确认记录（同时记下已处理的 gmail id）
export function addPending({ gmailId, source, fields }) {
  const db = load();
  if (!db.seenGmailIds.includes(gmailId)) db.seenGmailIds.push(gmailId);
  const rec = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    gmailId,
    status: "pending", // pending | approved | rejected
    source,            // { from, subject, date, body }
    fields,            // 抽取出的结构化字段
    createdAt: new Date().toISOString(),
    feishuRecordId: null,
  };
  db.records.push(rec);
  save(db);
  return rec;
}

export function list(status) {
  const recs = load().records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return status ? recs.filter((r) => r.status === status) : recs;
}

export function get(id) {
  return load().records.find((r) => r.id === id) || null;
}

// 更新记录（合并字段），返回新记录
export function update(id, patch) {
  const db = load();
  const rec = db.records.find((r) => r.id === id);
  if (!rec) return null;
  Object.assign(rec, patch);
  save(db);
  return rec;
}
