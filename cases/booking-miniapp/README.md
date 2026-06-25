# 服务预约小程序模板（多页可交互 · 可配置）

一套「服务预约」类微信小程序模板，**多页流程内置、换行业只改配置**：
看服务 → 看详情/选项 → 填预约（选日期/时段/信息）→ 提交确认。

已内置 5 个行业示例：**陪诊 / 民宿预订 / 医院挂号 / 家政 / 月嫂母婴**。
来个同类新需求（宠物、法律、维修…），复制一份配置、换素材即可。

## 两种看法

- **浏览器可交互预览**：`preview/index.html` —— 顶部切行业，**能真的点着走完四页流程**。
  也可直接定位某行业：`preview/index.html?c=peizhen|minsu|guahao|jiazheng|yuesao`。
- **真·原生小程序**：`miniprogram/` —— 用 **微信开发者工具** 打开运行（真多页 `navigateTo`）。
  当前 `miniprogram/config.js` 是「陪诊」那份；换成其它行业把对应配置贴进去即可。

## 怎么换行业（你以后的主要工作）

改配置文件即可（预览端 `configs.js`、原生端 `miniprogram/config.js`，**同一套结构**）：

```js
{
  theme:{ mode:"light|cream|dark", accent:"#2f9e8f" },
  brand, tagline, unitLabel:"服务|房型|医生…", bookCta:"立即预约|预订|挂号",
  hero:{ eyebrow, title, sub, img },
  categories:[{id,name}],                       // 顶部筛选（可空）
  items:[{ id,cat,name,price,unit:"/次|/晚|/号",thumb,tags:[],desc,
           options:[{label,values:[]}] }],       // 服务/房型/医生…
  steps:[{t,d}],                                 // 预约流程
  booking:{ dateLabel, slots:[], extra:[{key,label,type:"stepper|select|text",options?,min?,max?,value?}] },
  contact:{ rows:[{k,v}] }
}
```

- `items` 是核心：每个服务/房型/医生一条，带图、价、标签、简介、可选项。
- `booking.extra` 决定预约表单里多出哪些字段（人数、科室、面积…），三种控件：数字增减 `stepper`、单选 `select`、文本 `text`。

## 目录

```
configs.js              5 个行业配置（浏览器预览用）
preview/{index.html,app.css,app.js}   可点击多页原型
miniprogram/            原生多页工程（home/detail/booking/confirm）
  config.js  app.json  app.js  app.wxss  sitemap.json
  pages/home|detail|booking|confirm/
project.config.json
```

## 本轮范围

界面与交互流程齐全（演示提交为本地 mock）。**真实下单/支付/短信通知、登录、订单列表** 属于
选定后的成品阶段，可再接（同我们其它案例的"接后端"做法）。图片为占位素材，正式用换客户的。
