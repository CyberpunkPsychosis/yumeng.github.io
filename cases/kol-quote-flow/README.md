# AI 数据录入中台（KOL 报价为首个模板）· 技术方案

把邮件/消息里的非结构化信息，自动整理成结构化数据，**人工确认后**写进飞书多维表格。
**全程页面操作，客户不用懂代码。**

```
Gmail(报价邮件) ──轮询──▶ AI 结构化抽取 ──▶ 待确认 ──人工核对──▶ 写入飞书多维表格
  打标签              (模型可页面切换)     (审核台)              (飞书 API)
              └──────────── 一切配置在「无代码后台 /admin」里点 ────────────┘
```

核心约束：AI 抽取完**不直接入库**，先落「待确认」，人核对/改字段，点确认才写飞书。

> 📦 产品视角与可扩展方向见 [PRODUCT.md](./PRODUCT.md)。

## 目录结构

```
server/
  server.js        HTTP：后台 + 审核台 + 配置/测试 API + Gmail 授权 + 启动轮询
  config.js        配置存储（页面改的都落 data/config.json；底层密钥走 .env）
  llm.js           统一大模型接口（按配置切 Claude / OpenAI 兼容各家）
  extract.js       调模型把邮件抽成模板字段
  templates/       字段模板（kol-quote.js 为首个模板/默认种子）
  gmail.js         Gmail 拉取（只读）+ OAuth 客户端
  feishu.js        飞书写入 + 拉取表头
  store.js         待确认记录暂存（JSON 文件）
  poller.js        定时轮询（按后台开关/间隔，改了即时生效）
  .env.example     只放底层应用密钥 + 服务参数
admin/             无代码配置后台（选模型 / 拖字段建模板 / 数据源 / 飞书映射 / 运行）
web/               人工审核台
*/auth.js          登录 + 带 token 的 apiFetch（两端共用）
```

## 无代码配置后台（/admin）

客户登录后，**所有配置都在页面上点**，不碰代码、不改文件：
- **数据源**：点「授权 Gmail」走 OAuth（底层应用我们已接好），设监控标签、轮询间隔。
- **模型**：下拉切厂商（Claude / OpenAI / DeepSeek / 通义 / Moonshot / 智谱 / 自定义），填 key，测试连接。
- **字段模板**：增删改字段、拖动排序，右侧实时预览审核台——这就是「换行业」的地方。
- **去向·飞书**：选表、「拉取表头」、把模板字段对到飞书列。
- **运行**：一键启停，看最近处理日志。

配置经鉴权接口存到服务器 `data/config.json`；密钥在接口里脱敏，不回传浏览器。
（同一套后台页面在无后端时会回退本地 mock，所以也能当离线 Demo。）

## 模型可随意切换

抽取走统一接口 `llm.js`，后台一个下拉切换：Claude 原生结构化输出，或任意「OpenAI 兼容」端点
（DeepSeek / 通义 / Moonshot / 智谱 / 混元 / Gemini 兼容…）。客户可填自己的 key，数据与成本在客户侧。

## 模型与成本

抽取是轻任务（单封约 1–3K 输入 token、几百输出）：

| 模型 | 输入/输出（每百万 token） | 适用 |
|---|---|---|
| Haiku 4.5 | $1 / $5 | 量大、省钱 |
| Sonnet 4.6 | $3 / $15 | 均衡 |
| Opus 4.8（默认） | $5 / $25 | 最准 |

国产各家通常更便宜，按需在后台切。非实时还可接 Batch API 再打 5 折。

## 部署（客户自备服务器）

```bash
cd server
cp .env.example .env      # 只填：管理员密码 + 底层 Google/飞书应用密钥（我们交付时做）
npm install
npm start                 # 后台 http://<服务器>:8787/admin/  审核台 http://<服务器>:8787/
```

进程常驻（pm2 / systemd 守护）。剩下的全在 `/admin` 页面里配。

**我们交付时一次性做的事**（之后客户不用碰）：
1. 建 Google OAuth 客户端，回调填 `https://域名/oauth/google/callback`，把 ID/密钥写进 `.env`。
2. 建飞书自建应用、开多维表格读写权限，把 App ID/Secret 写进 `.env`。
3. 设好 `ADMIN_PASSWORD`。

之后客户：登录后台 → 点授权 Gmail → 选模型/填 key → 建字段模板 → 选飞书表并映射 → 开运行。

## 工作流程

1. 报价信进 Gmail → 打监控标签。
2. 轮询拉新邮件 → 按所选模型抽取 → 存「待确认」。
3. 运营在审核台核对/改字段 → 点「确认入库」写飞书，或驳回。

## 可扩展

- 入口：Gmail → Outlook / IMAP / 表单 / Webhook…
- 去向：飞书 → Notion / Airtable / 数据库 / Webhook…（插件化）
- 暂存：JSON 文件 → SQLite/Postgres。
- 触发：轮询 → Gmail 推送（近实时）。
- 附件 PDF 报价一并解析。
