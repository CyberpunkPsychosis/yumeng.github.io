# 📸 AI 摄影教练

一个网页版的拍照助手：举起手机实时取景，叠加构图辅助线和水平仪，并在你拍摄前后用 **腾讯混元视觉模型（hunyuan-vision）** 给出拍摄建议和点评——帮你慢慢练成"拍照即大片"。

## 功能

| 功能 | 说明 | 是否联网 / 花钱 |
|---|---|---|
| **实时辅助线** | 三分网格 + 构图甜点 + 水平仪（自动找平） | 本地，免费 |
| **给建议** | 取景时点一下，AI 看当前画面告诉你拍什么、怎么构图、怎么站位、等什么时机 | 调混元，按需 |
| **AI 点评** | 拍完后对照片做结构化点评（构图/光线/曝光/色彩/主题 + 改进建议） | 调混元，按需 |

## 架构

```
浏览器(index.html/app.js)  ──截帧──▶  Cloudflare Worker 代理  ──▶  混元 hunyuan-vision
   相机 + 实时辅助线                  (持有 API Key)
```

> ⚠️ **为什么需要代理**：API Key 不能放进前端，否则任何访问网页的人都能拿到。Worker 代理持有 Key、转发请求，Key 永远不进 git、不进浏览器。

## 部署步骤

### 1. 部署 AI 代理（Cloudflare Worker，免费）

```bash
npm install -g wrangler
cd worker
wrangler login
wrangler secret put HUNYUAN_API_KEY   # 粘贴你的混元 API Key
wrangler deploy
```

部署后会得到一个地址，形如 `https://hunyuan-photo-proxy.你的账号.workers.dev`。

### 2. 打开网页

- 已托管在 GitHub Pages：`https://你的用户名.github.io`
- 首次打开会弹设置，把上面的 Worker 地址填进去（保存在浏览器本地）。
- 允许摄像头权限即可使用。

> 📱 摄像头需要 **HTTPS 或 localhost** 才能调用。GitHub Pages 自带 HTTPS，没问题。

## 本地调试

```bash
# 终端 1：本地跑代理（key 放在 worker/.dev.vars，已被 .gitignore 忽略）
cd worker
echo 'HUNYUAN_API_KEY = "你的key"' > .dev.vars
wrangler dev            # 默认 http://localhost:8787

# 终端 2：本地起静态服务
python3 -m http.server 8080
```

浏览器打开 `http://localhost:8080`，在设置里把代理地址填成 `http://localhost:8787`。

## 后续可加

- 设备端主体/人脸检测（MediaPipe），实时提示"主体往左移到三分线"
- 举起停稳自动触发建议（无需手动点）
- 结合 GPS 推荐景点热门机位与黄金时段
- 拍后 AI 自动调色 / 一键成片
