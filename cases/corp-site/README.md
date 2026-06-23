# 高端企业官网模板

大疆风格的高端官网：大图头屏、滚动进场动画、数字滚动、图文交错、精致排版。
**所有内容集中在一个文件 `content.js`，改它就行，不用动其它代码。**

## 怎么换成你公司的

打开 `content.js`，按注释改：
- `brand`：公司名/Logo 文字
- `accent`：主题色（一行换整站强调色）
- `hero / intro / features / services / stats / gallery / about / cta / contact`：各板块文字
- 图片：把 `img` / `images` 里的网址换成你自己的图片地址

改完直接刷新页面就能看到效果。

## 上线
纯静态，三种方式任选：丢到任意静态托管（GitHub Pages / Netlify / 对象存储 OSS）、
或放进客户现有服务器。无需后端、无需安装。

## 文件
```
index.html   页面骨架（一般不用动）
content.js   ✏️ 网站内容（改这个）
style.css    样式与动效
main.js      渲染与滚动动画
```

> 进阶：以后可加一个「无代码后台」让非技术同事在网页上改内容（和「数据录入中台」那个案例同思路），需要再说。
