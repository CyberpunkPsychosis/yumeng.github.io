/* 飞书多维表格写入 —— 人工确认后调用
 *
 * 列名映射来自当前模板（templates），换行业不用改这里。
 * 用企业自建应用的 app_id/app_secret 换 tenant_access_token，再 append 记录。
 */
import { activeTemplate } from "./templates/index.js";

const BASE = process.env.FEISHU_BASE || "https://open.feishu.cn/open-apis";

async function tenantToken() {
  const r = await fetch(`${BASE}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET,
    }),
  });
  const d = await r.json();
  if (d.code !== 0) throw new Error(`飞书取 token 失败 ${d.code}: ${d.msg}`);
  return d.tenant_access_token;
}

// 抽取/编辑后的记录 -> 飞书 fields（按模板列映射）
function toFeishuFields(record) {
  const map = activeTemplate().fieldMap;
  const fields = {};
  for (const [key, col] of Object.entries(map)) {
    const v = record[key];
    if (v === undefined || v === null || v === "") continue;
    fields[col] = v; // 数字列传 number，文本列传 string
  }
  return fields;
}

// 追加一条记录，返回飞书 record_id
export async function appendRecord(record) {
  const token = await tenantToken();
  const url = `${BASE}/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records`;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toFeishuFields(record) }),
  });
  const d = await r.json();
  if (d.code !== 0) throw new Error(`飞书写入失败 ${d.code}: ${d.msg}`);
  return d.data.record.record_id;
}
