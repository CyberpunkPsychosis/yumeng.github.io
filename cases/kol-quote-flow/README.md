# 海外 KOL 报价自动化工作流 · 技术方案

把 KOL 来谈合作的报价邮件，自动整理成结构化数据，**人工确认后**写进飞书多维表格。

```
Gmail(报价邮件)  ──轮询──▶  AI 结构化抽取  ──▶  本地暂存「待确认」  ──人工核对/编辑──▶  写入飞书多维表格
  打标签 KOL报价              (Claude)            (审核台 Web 界面)            (飞书开放平台 API)
```

核心约束：**AI 抽取完不直接入库**，先落到「待确认」，人在审核台核对/改字段，点确认才写飞书。

## 目录结构

```
server/
  server.js      HTTP 服务：审核台 API + 托管前端 + 启动轮询
  poller.js      定时拉新邮件 → 抽取 → 落地待确认
  gmail.js       Gmail 拉取（只读，按标签过滤）
  extract.js     Claude 结构化抽取（output_config.format 约束 JSON）
  feishu.js      飞书多维表格写入（tenant_access_token + append record）
  store.js       本地 JSON 暂存（pending/approved/rejected）
  .env.example   全部配置项（密钥不进 git）
web/             人工审核台（左看原邮件、右改字段、一键通过/驳回）
```

## 抽取字段（= 飞书表列）

`KOL / 平台 / 主页 / 粉丝量 / 报价 / 币种 / 合作形式 / 可上线时间 / 联系邮箱 / 备注`

字段定义集中在 `server/extract.js` 的 `SCHEMA`；飞书列名映射在 `server/feishu.js` 的 `FIELD_MAP`，客户表头不同改这两处即可。

## 模型与成本（高并发抽取）

抽取是「读一封邮件吐一段 JSON」的轻任务，单封约 1–3K 输入 token、几百输出。按 `MODEL` 配：

| 模型 | 输入 / 输出（每百万 token） | 适用 |
|---|---|---|
| `claude-haiku-4-5` | $1 / $5 | 量大、字段规整、要省钱 |
| `claude-sonnet-4-6` | $3 / $15 | 均衡，邮件格式杂也稳 |
| `claude-opus-4-8`（默认） | $5 / $25 | 最准，复杂/多档报价 |

> 粗算：一封报价信 ≈ 2K 输入 + 0.3K 输出。用 Haiku ≈ $0.0035/封，Opus ≈ $0.018/封。
> 非实时场景还能再省一半 —— 后续可接 **Batch API**（5 折，结果约 1 小时内返回）。
> 默认给最准的 Opus，客户按量级自行在 `.env` 里换更便宜的档。

抽取用「结构化输出」（`output_config.format` + JSON schema），保证拿到字段固定的合法 JSON，无需正则兜底。

## 部署（客户自备服务器）

```bash
cd server
cp .env.example .env      # 填入三套密钥（见下）
npm install
npm start                 # 审核台 http://<服务器>:8787
```

进程常驻（建议用 pm2 / systemd 守护），它会每 5 分钟轮询一次 Gmail。

### 要准备的三套密钥

1. **大模型**：`ANTHROPIC_API_KEY`。
2. **Gmail（只读）**：在 Google Cloud 建 OAuth 客户端，用业务邮箱一次性授权（scope `gmail.readonly`）拿到 `refresh_token`，填 `GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN`。让客户在 Gmail 里给报价信打上 `KOL报价` 标签（可配过滤规则自动打）。
3. **飞书**：建企业自建应用，开「多维表格」读写权限，把目标 Base 加入应用可用范围，填 `FEISHU_APP_ID/SECRET`、目标表的 `FEISHU_APP_TOKEN` 和 `FEISHU_TABLE_ID`。海外用 Lark 则把 `FEISHU_BASE` 换成 `open.larksuite.com`。

> 所有密钥只在服务器的 `.env` 里，`.env` 与 `data/` 已被 `.gitignore` 忽略，不进仓库、不进前端。

## 工作流程

1. KOL 报价信进 Gmail → 客户/规则打 `KOL报价` 标签。
2. 轮询拉到新邮件 → Claude 抽取 → 存为「待确认」。
3. 运营打开审核台，左边看原邮件、右边核对/修改字段。
4. 点「确认入库」→ 写入飞书多维表格；或「驳回」丢弃。

## 可平替 / 扩展

- 暂存：JSON 文件 → SQLite/Postgres（接口不变，改 `store.js`）。
- 触发：轮询 → Gmail Pub/Sub 推送（近实时）。
- 附件：媒体包/PDF 报价 → 一并喂给模型解析（Claude 支持 PDF 输入）。
- 降本：接 Batch API（非实时，5 折）。
