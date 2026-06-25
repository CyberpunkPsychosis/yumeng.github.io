/* ✏️ 二手/电商小程序 · 店铺配置
 * 购物闭环(首页→详情→购物车→下单)是模板内置的。换店换品类只改这里：
 * 主题色、分类、商品(图/价/规格/描述)。两份示例证明换配置即换店。
 */
window.SHOP_CONFIGS = {

  /* ============ 二手潮流（多抓鱼风格） ============ */
  vintage: {
    theme: { mode: "light", accent: "#e0523b" },
    brand: "拾光鱼", searchPlaceholder: "服装、鞋靴、包袋、配饰",
    banner: { text: "今日上新", sub: "2101 件新到店", color: "#7cb342" },
    categories: [{ id: "all", name: "全部" }, { id: "cloth", name: "服装" }, { id: "shoe", name: "鞋靴" }, { id: "bag", name: "包袋" }, { id: "toy", name: "玩偶" }],
    products: [
      { id: "v1", cat: "shoe", brand: "adidas Originals 阿迪达斯", title: "Samba OG 女款 复古运动鞋", price: 58.65, refPrice: 699, tag: "二手 0.9 折",
        thumb: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80",
        specs: [{ label: "尺码", values: ["37", "38", "39", "40"] }], desc: "经典三叶草 Samba OG，麂皮拼接，鞋况良好，已专业清洁消毒。" },
      { id: "v2", cat: "cloth", brand: "Polo Ralph Lauren", title: "男士经典纯棉卫衣", price: 89, refPrice: 899, tag: "二手 9 成新",
        thumb: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
        specs: [{ label: "尺码", values: ["M", "L", "XL"] }], desc: "经典小马标卫衣，版型百搭，无明显瑕疵。" },
      { id: "v3", cat: "toy", brand: "DEJAVU 大猫玩偶", title: "原创设计 大猫毛绒玩偶", price: 88, refPrice: 128, tag: "原创新品",
        thumb: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80",
        specs: [{ label: "颜色", values: ["奶白", "墨黑"] }], desc: "原创设计大猫玩偶，柔软亲肤，桌面治愈好物。" },
      { id: "v4", cat: "bag", brand: "Coach 蔻驰", title: "经典老花单肩托特包", price: 458, refPrice: 2680, tag: "二手 8.5 成新",
        thumb: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
        desc: "经典老花托特，容量大，五金完好，附防尘袋。" },
      { id: "v5", cat: "cloth", brand: "Abercrombie & Fitch", title: "复古工装夹克", price: 159, refPrice: 1290, tag: "二手 9 成新",
        thumb: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
        specs: [{ label: "尺码", values: ["S", "M", "L"] }], desc: "复古水洗工装夹克，质感厚实，秋冬叠穿利器。" },
      { id: "v6", cat: "all", brand: "二手好书", title: "《置身事内》中国政府与经济发展", price: 19.9, refPrice: 65, tag: "扫码查价",
        thumb: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
        desc: "九成新，内页干净无笔记，可扫码验真。" },
    ],
  },

  /* ============ 二手数码 ============ */
  digital: {
    theme: { mode: "light", accent: "#2b6cff" },
    brand: "回环优品", searchPlaceholder: "手机、电脑、相机、配件",
    banner: { text: "官方质检", sub: "180 项检测 · 7 天可退", color: "#2b6cff" },
    categories: [{ id: "all", name: "全部" }, { id: "phone", name: "手机" }, { id: "pc", name: "电脑" }, { id: "cam", name: "影像" }, { id: "acc", name: "配件" }],
    products: [
      { id: "d1", cat: "phone", brand: "Apple", title: "iPhone 14 Pro 128G 暗紫色", price: 4299, refPrice: 7999, tag: "95 新 · 国行",
        thumb: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
        specs: [{ label: "容量", values: ["128G", "256G +500"] }], desc: "电池效率 92%，无维修无拆修，官方质检 180 项。" },
      { id: "d2", cat: "pc", brand: "Apple", title: "MacBook Air M2 13 寸 8+256", price: 5680, refPrice: 9499, tag: "99 新",
        thumb: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
        desc: "循环充电 30 次，几乎全新，原装充电器。" },
      { id: "d3", cat: "cam", brand: "Sony 索尼", title: "A7M3 全画幅微单 单机身", price: 7200, refPrice: 13999, tag: "成色佳",
        thumb: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        desc: "快门数 8000 出头，成像如新，含原电原充。" },
      { id: "d4", cat: "acc", brand: "Apple", title: "AirPods Pro 2 代", price: 899, refPrice: 1899, tag: "99 新",
        thumb: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
        desc: "降噪给力，耳塞全新更换，电池健康优秀。" },
      { id: "d5", cat: "acc", brand: "Apple", title: "Apple Watch S8 45mm GPS", price: 1580, refPrice: 3199, tag: "95 新",
        thumb: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        desc: "屏幕无划痕，电池健康 96%，含原装表带。" },
      { id: "d6", cat: "pc", brand: "Apple", title: "iPad Pro 11 寸 2022 128G", price: 3980, refPrice: 6799, tag: "98 新",
        thumb: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
        desc: "M2 芯片，屏幕完美，几乎无使用痕迹。" },
    ],
  },
};
