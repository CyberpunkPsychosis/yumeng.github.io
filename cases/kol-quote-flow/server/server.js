/* HTTP 服务 —— 审核台后端 + 静态前端
 *
 * 提供：待确认列表 / 通过(写飞书) / 驳回；并托管 web/ 审核台。
 * 同时启动 Gmail 轮询。客户在自己服务器上 `npm start` 即可。
 */
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { list, get, update } from "./store.js";
import { appendRecord } from "./feishu.js";
import { startPoller } from "./poller.js";
import { activeTemplate } from "./templates/index.js";
import { activeModelInfo } from "./llm.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// 当前模板（字段定义）+ 用的模型 —— 审核台据此动态渲染表单
app.get("/api/template", (req, res) => {
  const t = activeTemplate();
  res.json({
    name: t.name,
    model: activeModelInfo(),
    fields: t.fields.map(({ key, label, type }) => ({ key, label, type })),
  });
});

// 列表：?status=pending|approved|rejected（默认全部）
app.get("/api/records", (req, res) => {
  res.json(list(req.query.status));
});

// 通过：可带编辑后的 fields；写入飞书后标记 approved
app.post("/api/records/:id/approve", async (req, res) => {
  const rec = get(req.params.id);
  if (!rec) return res.status(404).json({ error: "记录不存在" });
  if (rec.status === "approved") return res.status(409).json({ error: "已入库，勿重复" });
  const fields = { ...rec.fields, ...(req.body?.fields || {}) };
  try {
    const feishuRecordId = await appendRecord(fields);
    const saved = update(rec.id, { status: "approved", fields, feishuRecordId });
    res.json(saved);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// 驳回：仅标记，不写飞书
app.post("/api/records/:id/reject", (req, res) => {
  const rec = get(req.params.id);
  if (!rec) return res.status(404).json({ error: "记录不存在" });
  res.json(update(rec.id, { status: "rejected" }));
});

// 静态审核台
app.use("/", express.static(path.join(__dirname, "..", "web")));

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  console.log(`[server] 审核台 http://localhost:${PORT}`);
  startPoller();
});
