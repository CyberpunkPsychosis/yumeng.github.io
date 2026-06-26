# 同城活动 / 周边活动 报名拼团 + 组织 小程序模板（多页可交互 · 可配置）

一套骨架覆盖**周末社交、亲子、户外露营**等同城活动场景，**换社区只改一份配置**。两条主线：
- **报名上车**：逛活动流 → 活动详情（人数进度 / 亮点 / 费用）→ 报名（**需微信绑定手机号登录**）→ 报名成功；
- **发起活动**：底部「＋发起」自己建活动招人，发布后立刻出现在活动流里（这就是「组织活动」）。

已内置 3 个社区：**同城社交 / 亲子活动 / 户外露营**。换城市换品类，复制一份配置、换素材即可。**演示版不接微信支付**。

## 两种看法
- **浏览器可交互预览**：`preview/index.html` —— 顶部切社区，**能真的点**：报名上车（弹微信手机号登录）、发起活动、看「我的报名/我发起的」。
  也可直接定位：`preview/index.html?c=city|kids|outdoor`。
- **真·原生小程序**：`miniprogram/` —— 用**微信开发者工具**打开（真多页 + 全局登录态/报名数据）。
  报名、发起用**原生 `getPhoneNumber` 绑定手机号登录**。当前 `config.js` 是「同城社交」那份。

## 配置结构（换社区主要改这个）
```js
{
  theme:{ accent }, brand, city, slogan,
  banner:{ title, sub, color },
  categories:[{ icon, name }],          // 首页分类宫格
  filters:[ "全部","活动派对",… ],       // 列表筛选
  activities:[{
    id, cat, title, cover, tags,
    organizer:{ name, badge, views },   // 发起人
    date, time, place, distance, price, // 时间/地点/人均
    capacity, joined, avatars:[],       // 限额 / 已报名 / 头像
    highlights:[], includes:[], desc,
  }],
}
```
`activities` 是核心：报名会让 `joined`+1、把头像加进 `avatars`；发起活动会往 `activities` 头部插一条。

## 目录
```
configs.js          三社区配置（浏览器预览用）
preview/{index.html,app.css,app.js}     可点击多页原型（报名/发起/我的，含登录拦截）
miniprogram/        原生多页工程
  app.json app.js config.js app.wxss sitemap.json project.config.json
  pages/home(活动流) list(筛选) detail(详情) signup(报名) confirm create(发起) mine(我的)
```

## 本轮范围 & 下一步
活动流、详情、报名上车、发起活动、我的报名/发起齐全（报名/发布为本地状态）。**真正运营**还需要后端：
活动/报名/订单存储、`getPhoneNumber` 服务端解密拿真实手机号、发起人审核与建群、退改与候补、（收费活动）微信支付与分账、消息通知。
这些属选定后的成品阶段，可按需接。图片为占位素材，正式用换客户的活动图。
