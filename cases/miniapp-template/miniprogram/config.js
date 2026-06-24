/* 原生小程序读取的配置（与浏览器预览 configs.js 同一套结构）
 * 换客户/换行业：改这一份的 theme / brand / blocks，再把图片换成素材地址。
 */
module.exports = {
  theme: { mode: "dark", accent: "#c8a15a" }, // cream | dark | light
  brand: "LUMIÈRE",
  blocks: [
    {
      type: "cover", overlay: true,
      bg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      eyebrow: "PHOTOGRAPHY · SINCE 2014",
      title: "光影之间\n定格永恒",
      sub: "高端人像 · 婚纱旅拍 · 家庭影像",
      cta: { label: "预约拍摄", en: "Book a Session" },
    },
    {
      type: "gallery", eyebrow: "PORTFOLIO", title: "作品精选", cols: 2,
      images: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      type: "services", eyebrow: "PACKAGES", title: "拍摄套系",
      items: [
        { name: "经典人像", desc: "2 小时 · 2 套服装 · 精修 15 张", price: "¥1,280" },
        { name: "婚纱旅拍", desc: "整日跟拍 · 多场景 · 精修 40 张", price: "¥5,800" },
        { name: "全家福", desc: "1 小时 · 温馨棚拍 · 精修 10 张", price: "¥1,980" },
      ],
    },
    {
      type: "split", eyebrow: "ABOUT", title: "关于我们",
      img: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80",
      text: "十年专注高端影像。我们相信，好照片不只是记录，更是把一段情绪、一束光，永久地留下来。",
    },
    {
      type: "contact", eyebrow: "BOOK NOW", title: "预约我们",
      rows: [
        { k: "预约电话", v: "400-888-0000" },
        { k: "微信", v: "lumiere_studio" },
        { k: "地址", v: "某市某区艺术园区 A3 栋" },
      ],
    },
  ],
};
