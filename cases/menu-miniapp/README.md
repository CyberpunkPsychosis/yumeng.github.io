# 餐饮 / 菜单 / 点餐 通用小程序模板（多页可交互 · 可配置）

一套骨架覆盖**食堂、外卖、奶茶/咖啡**三类常见餐饮小程序，**换场景只改一份配置**。共用流程：
顶部选日期/时段 → 按分类看菜单 → 点开菜品看图文与**用户评价** → 写评价（**需微信绑定手机号登录**）→ 底部给商家**提建议**。
`ordering` 开关决定是「只看菜+评价」（食堂）还是「能加购下单」（外卖 / 奶茶，**演示版不接微信支付**）。

已内置 3 个场景：**高校食堂 / 外卖点餐 / 奶茶咖啡**。换店换行业，复制一份配置、换素材即可。

## 两种看法

- **浏览器可交互预览**：`preview/index.html` —— 顶部切场景，**能真的点**：
  食堂选日期看当天菜、点开菜品写评价（弹微信手机号登录）、底部提建议；外卖/奶茶可加购下单。
  也可直接定位：`preview/index.html?c=canteen|takeout|drinks`。
- **真·原生小程序**：`miniprogram/` —— 用**微信开发者工具**打开运行（真多页跳转 + 全局购物车/登录态）。
  评价、下单用**原生 `getPhoneNumber` 绑定手机号登录**。当前 `config.js` 是「高校食堂」那份。

## 配置结构（换场景主要改这个）

```js
{
  theme:{ mode:"light|dark", accent },
  brand, sub, notice,
  dateMode,        // 顶部是否显示日期选择（食堂按天换菜）
  ordering,        // 是否有购物车/下单（外卖、奶茶=true；食堂=false）
  needAddress,     // 下单是否填地址（外卖=true；自取=false）
  categories:[{id,name}],
  dishes:[{ id, cat, name, price, unit, thumb, tags?, desc, rating,
            reviews:[{name,stars,text,date}],
            days?,        // 食堂：周几供应（1=周一…7=周日），省略=每天
            specs? }],    // 奶茶等：规格组 [{label,values:[]}]，值里写 "大杯 +3" 即自动加价
  feedback:{ title, placeholder, tags:[] },
}
```

`dishes` 是核心：每道菜带图、价格、标签、评分、评价列表。食堂用 `days` 实现「不同日期不同菜」，
奶茶用 `specs`（杯型/温度/甜度/加料）实现规格与加价。

## 关键能力
- **日期菜单**（食堂）：顶部 7 天日期条，选某天只显示当天供应的菜（按 `days` 过滤）。
- **菜品评价**：详情页展示评分与评价列表；「写评价」先**微信手机号登录**，打分 + 文字提交后即时上墙（演示为本地状态）。
- **微信绑定手机号登录**：原生用 `<button open-type="getPhoneNumber">`，授权后拿到手机号（真机需后端解密 `code` 换取号码）。
- **建议反馈**：菜单底部入口，快捷标签 + 文字 + 联系方式，提交给商家。
- **点餐下单**（外卖/奶茶）：加购 → 购物车 → 确认（配送填地址 / 自取显示取餐）→ 下单成功，**全程无微信支付**。

## 目录

```
configs.js          三场景配置（浏览器预览用）
preview/{index.html,app.css,app.js}    可点击多页原型（含登录/评价/反馈/下单）
miniprogram/        原生多页工程
  config.js app.json app.js app.wxss sitemap.json project.config.json
  pages/home|detail|comment|feedback|cart|checkout|confirm/
```

## 本轮范围 & 下一步
界面与交互齐全（评价、登录、下单均为前端演示）。**真正落地**还需要后端：
评价/菜单/订单存储、`getPhoneNumber` 服务端解密拿真实手机号、建议工单、食堂按天排菜的后台、（点餐场景）库存与出餐通知。
这些属选定后的成品阶段，可按需接。图片为占位素材，正式用换客户的菜品图。
