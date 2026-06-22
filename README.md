# 作品集 · 案例库

我的网页作品集，托管在 GitHub Pages。每接到一个需求就做成一个小案例放进来，攒成一个能直接复用的库。

## 结构

```
index.html / style.css / app.js   案例库首页（Claude 风格，自动列出所有案例 + 搜索筛选）
cases.js                          案例清单（加案例只改这个文件）
cases/<案例名>/                    每个案例一个独立文件夹，能单独打开运行
cases/README.md                   如何新增一个案例
```

## 新增一个案例

1. 在 `cases/` 下建文件夹，放进该案例完整的 HTML/JS/CSS。
2. 在 `cases.js` 的 `CASES` 数组里加一条（`title`/`desc`/`tags`/`path`，截图 `thumb` 可选）。

首页会自动出卡片，`tags` 用于搜索和筛选，方便以后翻库找相似案例。详见 `cases/README.md`。

## 本地预览

纯静态，开个静态服务即可：

```bash
python3 -m http.server 8080   # 打开 http://localhost:8080
```

无构建、无依赖、无框架；首页字体走 Google Fonts CDN。
