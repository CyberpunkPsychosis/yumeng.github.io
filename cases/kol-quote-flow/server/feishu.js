/* 飞书多维表格写入 —— 人工确认后调用
 *
 * 用企业自建应用的 app_id/app_secret 换 tenant_access_token，再 append 一条记录。
 * 需要给应用开「多维表格」读写权限，并把目标表所在的 Base 加到应用可用范围。
 */
const BASE = process.env.FEISHU_BASE || "https://open.feishu.cn/open-apis";

// 抽取字段 -> 飞书表列名 的映射。客户表头不一样就改这里。
const FIELD_MAP = {
  kol_name:      "KOL",
  platform:      "平台",
  handle:        "主页/Handle",
  followers:     "粉丝量",
  price:         "报价",
  currency:      "币种",
  deliverables:  "合作形式",
  timeline:      "可上线时间",
  contact_email: "联系邮箱",
  notes:         "备注",
};

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

// 把抽取/编辑后的记录映射成飞书 fields 对象
function toFeishuFields(record) {
  const fields = {};
  for (const [key, col] of Object.entries(FIELD_MAP)) {
    const v = record[key];
    if (v === undefined || v === null || v === "") continue;
    fields[col] = v; // 数字列（报价）传 number，文本列传 string
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
