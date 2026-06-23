/* ✏️ 网站内容 —— 改这一个文件就行
 *
 * 所有文字、图片、链接、主题色都在这里。换公司就改这里，不用动其它代码。
 * 图片可填你自己的图片网址；留空的地方会用默认。
 */
const CONTENT = {
  brand: "AURELIX",            // 公司名/Logo 文字
  accent: "#2b6cff",          // 主题色（按钮、强调）
  hero: {
    eyebrow: "DESIGN · ENGINEERING · FUTURE",
    title: "以设计与技术\n定义高端体验",     // \n 换行
    sub: "我们为追求极致的品牌，打造世界级的数字产品与空间体验。",
    primary: { label: "了解我们", href: "#features" },
    secondary: { label: "查看案例", href: "#gallery" },
  },
  nav: [
    { label: "实力", href: "#features" },
    { label: "服务", href: "#services" },
    { label: "案例", href: "#gallery" },
    { label: "关于", href: "#about" },
  ],
  navCta: { label: "联系我们", href: "#contact" },

  intro: {
    eyebrow: "OUR PHILOSOPHY",
    big: "少，即是多。",
    text: "我们相信克制的设计、精密的工程，以及对细节近乎偏执的追求。每一个项目，都从「为什么」开始。",
  },

  features: [
    {
      eyebrow: "PRECISION",
      title: "精密如一",
      text: "从整体结构到每一个像素，我们以毫米级的标准对待每个细节，让品质经得起放大。",
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    },
    {
      eyebrow: "EXPERIENCE",
      title: "如丝顺滑的体验",
      text: "流畅的动效、克制的交互、清晰的层次——让用户在不知不觉中，爱上你的品牌。",
      img: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=80",
    },
    {
      eyebrow: "IMPACT",
      title: "看得见的结果",
      text: "好设计不只是好看。我们关注转化、留存与口碑，把美学变成实在的商业价值。",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
    },
  ],

  services: {
    eyebrow: "WHAT WE DO",
    title: "我们能为你做什么",
    items: [
      { title: "品牌设计", text: "从命名、标识到完整的视觉体系。" },
      { title: "官网与小程序", text: "高端、响应式、可自助修改内容。" },
      { title: "产品体验", text: "App / 软件界面与交互设计。" },
      { title: "空间与展陈", text: "线下门店与展厅的沉浸式体验。" },
    ],
  },

  stats: [
    { num: 12, suffix: "+", label: "年行业经验" },
    { num: 260, suffix: "+", label: "服务客户" },
    { num: 98, suffix: "%", label: "客户满意度" },
    { num: 40, suffix: "+", label: "行业奖项" },
  ],

  gallery: {
    eyebrow: "SELECTED WORK",
    title: "精选案例",
    images: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1000&q=80",
    ],
  },

  about: {
    eyebrow: "ABOUT US",
    title: "一群对「好」上瘾的人",
    text: "我们是一支由设计师、工程师与策略师组成的团队。过去十余年，我们与众多领先品牌并肩，把一个个想法，变成令人惊叹的现实。",
  },

  cta: {
    title: "准备好开始了吗？",
    sub: "聊聊你的项目，我们给你一份惊喜。",
    button: { label: "立即咨询", href: "#contact" },
  },

  contact: {
    eyebrow: "GET IN TOUCH",
    title: "联系我们",
    phone: "400-000-0000",
    email: "hello@aurelix.com",
    address: "中国 · 某市某区某大厦 28F",
  },
};
