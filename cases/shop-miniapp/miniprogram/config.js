/* 原生小程序读取的店铺配置（与浏览器预览 configs.js 同结构）。
 * 换店换品类：把这份换成对应配置即可。
 */
module.exports = {
  theme: { mode: "light", accent: "#e0523b" },
  brand: "拾光鱼", searchPlaceholder: "服装、鞋靴、包袋、配饰",
  banner: { text: "今日上新", sub: "2101 件新到店", color: "#7cb342" },
  categories: [{ id: "all", name: "全部" }, { id: "cloth", name: "服装" }, { id: "shoe", name: "鞋靴" }, { id: "bag", name: "包袋" }, { id: "toy", name: "玩偶" }],
  products: [
    { id: "v1", cat: "shoe", brand: "adidas Originals", title: "Samba OG 女款 复古运动鞋", price: 58.65, refPrice: 699, tag: "二手 0.9 折",
      thumb: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80",
      specs: [{ label: "尺码", values: ["37", "38", "39", "40"] }], desc: "经典三叶草 Samba OG，麂皮拼接，鞋况良好，已专业清洁消毒。" },
    { id: "v2", cat: "cloth", brand: "Polo Ralph Lauren", title: "男士经典纯棉卫衣", price: 89, refPrice: 899, tag: "9 成新",
      thumb: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
      specs: [{ label: "尺码", values: ["M", "L", "XL"] }], desc: "经典小马标卫衣，版型百搭，无明显瑕疵。" },
    { id: "v3", cat: "toy", brand: "DEJAVU", title: "原创设计 大猫毛绒玩偶", price: 88, refPrice: 128, tag: "原创新品",
      thumb: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80",
      specs: [{ label: "颜色", values: ["奶白", "墨黑"] }], desc: "原创设计大猫玩偶，柔软亲肤，桌面治愈好物。" },
    { id: "v4", cat: "bag", brand: "Coach", title: "经典老花单肩托特包", price: 458, refPrice: 2680, tag: "8.5 成新",
      thumb: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
      desc: "经典老花托特，容量大，五金完好，附防尘袋。" },
    { id: "v5", cat: "cloth", brand: "Abercrombie & Fitch", title: "复古工装夹克", price: 159, refPrice: 1290, tag: "9 成新",
      thumb: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
      specs: [{ label: "尺码", values: ["S", "M", "L"] }], desc: "复古水洗工装夹克，质感厚实，秋冬叠穿利器。" },
    { id: "v6", cat: "all", brand: "二手好书", title: "《置身事内》中国政府与经济发展", price: 19.9, refPrice: 65, tag: "扫码查价",
      thumb: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
      desc: "九成新，内页干净无笔记，可扫码验真。" },
  ],
  /* 卖闲置 / 回收估价（C2B）。估价 = market × 成色 factor */
  sell: {
    entryText: "卖闲置 · 一键估价", entrySub: "闲置秒估价 · 质检后打款",
    conditions: [
      { id: "new", name: "全新未拆", factor: 0.55 },
      { id: "like", name: "95 新", factor: 0.42 },
      { id: "good", name: "9 成新", factor: 0.32 },
      { id: "fair", name: "8 成新", factor: 0.22 },
    ],
    items: [
      { id: "rs1", cat: "shoe", brand: "Nike 耐克", title: "Dunk Low 复古板鞋", market: 899,
        thumb: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80" },
      { id: "rs2", cat: "cloth", brand: "Stüssy", title: "经典 Logo 套头卫衣", market: 699,
        thumb: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80" },
      { id: "rs3", cat: "bag", brand: "Louis Vuitton", title: "Neverfull 老花托特包", market: 9800,
        thumb: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=600&q=80" },
      { id: "rs4", cat: "cloth", brand: "Carhartt WIP", title: "Detroit 工装夹克", market: 1290,
        thumb: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80" },
      { id: "rs5", cat: "toy", brand: "Jellycat", title: "邦尼兔毛绒玩偶 中号", market: 359,
        thumb: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80" },
    ],
  },
};
