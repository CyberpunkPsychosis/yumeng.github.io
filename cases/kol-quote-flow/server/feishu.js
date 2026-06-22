/* 飞书多维表格 —— 应用凭证在 .env（我们交付时设），目标表/列映射在配置（页面选）
 *
 * 人工确认后 append 记录；另提供「拉取表头」给后台做字段映射。
 */
import { getFeishu } from "./config.js";
import { activeTemplate } from "./templates/index.js";

async function tenantToken() {
  const f = getFeishu();
  const r = await fetch(`${f.base}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: f.appId, app_secret: f.appSecret }),
  });
  const d = await r.json();
  if (d.code !== 0) throw new Error(`飞书取 token 失败 ${d.code}: ${d.msg}`);
  return d.tenant_access_token;
}

// 抽取/编辑后的记录 -> 飞书 fields（按当前模板列映射）
function toFeishuFields(record) {
  const map = activeTemplate().fieldMap;
  const fields = {};
  for (const [key, col] of Object.entries(map)) {
    const v = record[key];
    if (v === undefined || v === null || v === "") continue;
    fields[col] = v;
  }
  return fields;
}

// 追加一条记录，返回飞书 record_id
export async function appendRecord(record) {
  const f = getFeishu();
  const token = await tenantToken();
  const url = `${f.base}/bitable/v1/apps/${f.appToken}/tables/${f.tableId}/records`;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toFeishuFields(record) }),
  });
  const d = await r.json();
  if (d.code !== 0) throw new Error(`飞书写入失败 ${d.code}: ${d.msg}`);
  return d.data.record.record_id;
}

// 拉取目标表的列名（给后台「拉取表头」做映射）
export async function fetchColumns() {
  const f = getFeishu();
  const token = await tenantToken();
  const url = `${f.base}/bitable/v1/apps/${f.appToken}/tables/${f.tableId}/fields?page_size=100`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const d = await r.json();
  if (d.code !== 0) throw new Error(`飞书取字段失败 ${d.code}: ${d.msg}`);
  return (d.data.items || []).map((it) => it.field_name);
}
