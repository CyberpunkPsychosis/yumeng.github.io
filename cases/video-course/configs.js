/* 视频课平台配置 —— 换课程只改这份
 * course → chapters → lessons。lesson 有 dur(分钟) 与 free(试看)。
 */
window.VIDEO_CONFIG = {
  brand: "云课堂",
  categories: ["全部", "编程开发", "设计创意", "职场技能", "语言学习"],
  courses: [
    {
      id: "js", title: "从零到一：现代 JavaScript 全栈", cat: "编程开发", color: "#f7b733",
      instructor: { name: "陈一鸣", title: "前端架构师 · 10 年经验", badge: "陈" },
      price: 0, students: 18420, rating: 4.9, level: "入门到进阶", hours: 12.5,
      desc: "从语法基础到工程实战，带你系统掌握现代 JavaScript 与全栈开发，配套练习与项目，学完能独立做项目。",
      learn: ["掌握 ES6+ 核心语法与异步编程", "理解模块化与工程化构建", "动手做一个前后端项目", "建立解决问题的工程思维"],
      chapters: [
        { title: "第一章 · 入门与环境", lessons: [
          { id: "j1", title: "课程介绍与学习路线", dur: 8, free: true },
          { id: "j2", title: "搭建开发环境", dur: 12, free: true },
          { id: "j3", title: "变量、类型与运算符", dur: 18 } ] },
        { title: "第二章 · 核心语法", lessons: [
          { id: "j4", title: "函数与作用域", dur: 22 },
          { id: "j5", title: "数组与对象方法", dur: 26 },
          { id: "j6", title: "ES6+ 新特性", dur: 20 } ] },
        { title: "第三章 · 异步与工程化", lessons: [
          { id: "j7", title: "Promise 与 async/await", dur: 24 },
          { id: "j8", title: "模块化与打包", dur: 19 },
          { id: "j9", title: "实战：做一个待办应用", dur: 32 } ] },
      ],
      reviews: [
        { user: "学**", stars: 5, text: "讲得特别清楚，循序渐进，跟着做项目收获很大。" },
        { user: "前**", stars: 5, text: "异步那块讲透了，终于搞懂 Promise 了。" },
        { user: "小**", stars: 4, text: "内容很好，希望再多点练习题。" } ],
    },
    {
      id: "ui", title: "UI 设计实战：从临摹到原创", cat: "设计创意", color: "#ee5a8e",
      instructor: { name: "林墨", title: "资深 UI/UX 设计师", badge: "林" },
      price: 199, students: 9650, rating: 4.8, level: "入门", hours: 9,
      desc: "用真实项目带你建立设计审美与规范，从临摹大厂作品到独立完成一套 App 界面与设计系统。",
      learn: ["建立设计审美与视觉规范", "掌握配色、排版、组件设计", "完成一套完整 App 界面", "学会用设计系统提效"],
      chapters: [
        { title: "第一章 · 设计基础", lessons: [
          { id: "u1", title: "好设计的底层逻辑", dur: 14, free: true },
          { id: "u2", title: "色彩与排版基础", dur: 20 } ] },
        { title: "第二章 · 组件与界面", lessons: [
          { id: "u3", title: "常用组件规范", dur: 22 },
          { id: "u4", title: "首页与列表设计", dur: 28 },
          { id: "u5", title: "设计系统搭建", dur: 25 } ] },
      ],
      reviews: [
        { user: "设**", stars: 5, text: "老师审美在线，案例都是真实项目，很实用。" },
        { user: "转**", stars: 5, text: "零基础转行，跟下来做出了作品集。" } ],
    },
    {
      id: "speak", title: "职场表达力：会说话的人更值钱", cat: "职场技能", color: "#3a7afe",
      instructor: { name: "苏晴", title: "企业培训师 · TEDx 讲者", badge: "苏" },
      price: 99, students: 24310, rating: 4.7, level: "通用", hours: 6,
      desc: "汇报、沟通、谈判、演讲，一套可复用的表达框架，让你在职场把话说到点子上。",
      learn: ["结构化表达：金字塔原理", "高效汇报与向上沟通", "即兴表达不怯场", "用故事打动人"],
      chapters: [
        { title: "第一章 · 结构化表达", lessons: [
          { id: "s1", title: "为什么你说不清楚", dur: 10, free: true },
          { id: "s2", title: "金字塔原理实操", dur: 18 } ] },
        { title: "第二章 · 场景实战", lessons: [
          { id: "s3", title: "如何做一次好汇报", dur: 16 },
          { id: "s4", title: "即兴表达的万能公式", dur: 14 } ] },
      ],
      reviews: [
        { user: "职**", stars: 5, text: "汇报模板拿来就能用，领导都夸了。" },
        { user: "i**", stars: 4, text: "对社恐很友好，方法很具体。" } ],
    },
    {
      id: "eng", title: "实用英语口语：开口说的 30 天", cat: "语言学习", color: "#16b07a",
      instructor: { name: "Lucy", title: "英语口语教练 · 海归", badge: "L" },
      price: 149, students: 31200, rating: 4.8, level: "入门", hours: 8,
      desc: "告别哑巴英语，从高频场景句型入手，每天 15 分钟，30 天敢开口、说得顺。",
      learn: ["掌握高频生活与职场句型", "纠正发音与语音语调", "用影子跟读练流利度", "建立开口的自信"],
      chapters: [
        { title: "第一章 · 开口准备", lessons: [
          { id: "e1", title: "为什么学了多年还不敢说", dur: 9, free: true },
          { id: "e2", title: "发音的关键 20%", dur: 16 } ] },
        { title: "第二章 · 场景口语", lessons: [
          { id: "e3", title: "自我介绍与寒暄", dur: 14 },
          { id: "e4", title: "点餐购物出行", dur: 18 },
          { id: "e5", title: "职场会议表达", dur: 20 } ] },
      ],
      reviews: [
        { user: "英**", stars: 5, text: "影子跟读真的有用，敢开口了。" },
        { user: "出**", stars: 5, text: "出国前突击，点餐问路都够用了。" } ],
    },
  ],
};
