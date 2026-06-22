# cases/ —— 案例存放目录

每个案例一个独立子文件夹，自带完整 `index.html` + JS + CSS，**能单独打开运行**，互不干扰。

## 新增一个案例

1. 在这里建一个文件夹，例如 `cases/photo-coach/`，放进该案例的全部文件。
2. （可选）放一张截图 `thumb.png` 当首页卡片封面；不放也行，首页会自动用首字 + 渐变占位。
3. 回到仓库根目录，编辑 `cases.js`，往 `CASES` 数组里加一条：

   ```js
   {
     title: "拍照教练",
     desc:  "实时取景 + 构图辅助线 + AI 拍照建议。",
     tags:  ["相机", "AI", "工具"],
     path:  "cases/photo-coach/index.html",
     thumb: "cases/photo-coach/thumb.png",   // 可省略
     date:  "2026-06",
   }
   ```

首页会自动生成卡片，`tags` 同时用于搜索和筛选。

## 命名约定

- 文件夹用英文小写 + 连字符（`photo-coach`、`mistakes-notebook`），方便地址和复用。
- 标签尽量复用已有的（如 `工具`/`AI`/`相机`/`地图`/`表单`），这样以后"找相似"才好筛。
