# 二手 / 电商小程序模板（多页可交互 · 可配置）

二手平台 / 电商类微信小程序模板（参考多抓鱼），**买卖双闭环内置、换店只改配置**：

- **买（C2C）**：逛商品 → 详情选规格 → 加入购物车 → 改数量/选择 → 结算下单 → 成功。
- **卖闲置 / 回收（C2B）**：首页入口 → 选要出的闲置 → 选成色（系统秒出估价）→ 传实拍图 → 提交回收 → 成功。
  估价 = 物品市场参考价 × 成色系数，全程对客户用业务话术。

已内置 2 个店铺示例：**二手潮流 / 二手数码**。换品类/换店复制一份配置、换素材即可。

## 两种看法

- **浏览器可交互预览**：`preview/index.html` —— 顶部切店铺，**能真的点着买**（购物车数量、合计实时算）。
  也可直接定位：`preview/index.html?c=vintage|digital`。
- **真·原生小程序**：`miniprogram/` —— 用 **微信开发者工具** 打开运行（真多页 + 购物车跨页状态）。
  当前 `config.js` 是「二手潮流」那份。

## 配置结构（换店主要改这个）

```js
{
  theme:{ mode:"light|dark", accent:"#e0523b" },
  brand, searchPlaceholder,
  banner:{ text, sub, color },                 // 首页运营位
  categories:[{id,name}],                      // 分类筛选
  products:[{ id, cat, brand, title, price, refPrice?, tag?, thumb,
              specs:[{label,values:[]}], desc }],
  sell:{                                        // 卖闲置/回收（可选，不填则不显示入口）
    entryText, entrySub,
    conditions:[{ id, name, factor }],          // 成色档位，factor=可回收占市场价比例
    items:[{ id, cat, brand, title, market, thumb }],  // 可回收物品（market=市场参考价）
  },
}
```

`products` 是购物核心：每个商品带图、现价、参考价（划线）、标签（如“二手 0.9 折”）、规格（尺码/颜色）、描述。
`sell` 是卖闲置核心：回收物品清单 + 成色系数，估价自动算（`market × factor`），换店改这块即可。

## 目录

```
configs.js          店铺配置（浏览器预览用）
preview/{index.html,app.css,app.js}   可点击多页原型（含购物车状态）
miniprogram/        原生多页工程
  config.js app.json app.js app.wxss sitemap.json
  pages/home|detail|cart|checkout|confirm/      买（购物）
  pages/sell|sellform|selldone/                 卖闲置（回收估价）
project.config.json
```

## 本轮范围 & 下一步

界面与买/卖双流程齐全（下单/支付/估价均为本地 mock）。**真正能交易**还需要：
微信支付、商品/库存/订单后端、用户账号、地址管理、物流；卖闲置侧还需回收质检、ISBN/条码扫码估价、
真机多图上传与打款。这些属于选定后的成品阶段，可按需接。图片为占位素材，正式用换客户的商品图。
