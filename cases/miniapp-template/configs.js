/* ✏️ 小程序模板配置 —— 以后换客户/换行业，主要就改这个文件
 *
 * 一份配置 = 一个完整小程序的内容与排版。布局/动效/高级感是模板内置的，
 * 你只需：选主题(theme) → 按区块(blocks)填文字 → 换图片地址。换行业就复制一份改。
 *
 * 区块类型(type)：
 *   cover    沉浸式首屏（大图/标题/副标题，可带价签、可带底部双语导航）
 *   gallery  作品/产品图墙（2 或 3 列）
 *   services 套系/菜单列表（名称 + 说明 + 价格）
 *   split    图文左右（关于我们/特色）
 *   contact  预约/联系（任意 键值 行）
 *
 * theme.mode：cream(暖色编辑) | dark(暗调轻奢) | light(清爽简约)；accent 为强调色。
 */
window.MINIAPP_CONFIGS = {

  /* ============ 行业示例 1：摄影工作室（暗调轻奢） ============ */
  studio: {
    theme: { mode: "dark", accent: "#c8a15a" },
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
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
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
        type: "split", eyebrow: "ABOUT", title: "关于我们", reverse: false,
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
  },

  /* ============ 行业示例 2：咖啡品牌（暖色编辑） ============ */
  coffee: {
    theme: { mode: "cream", accent: "#5a3b27" },
    brand: "AURELIX",
    blocks: [
      {
        type: "cover",
        eyebrow: "FULL ICE BUTTER SOE",
        title: "全冰黄油\nSOE",
        sub: "图片仅供参考，请以实物或店内为准",
        bg: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
        prices: [{ y: "¥20", m: "12oz 中杯" }, { y: "¥20", m: "16oz 大杯" }],
        dock: [
          { cn: "开始点单", en: "Start Order" },
          { cn: "会员积分码", en: "Membership" },
        ],
      },
      {
        type: "services", eyebrow: "MENU", title: "季节新品",
        items: [
          { name: "全冰黄油 SOE", desc: "醇厚坚果气息，绵密如丝", price: "¥20" },
          { name: "黄杏冰美式", desc: "自然果香 + 醇厚冰美式", price: "¥15" },
          { name: "话梅气泡美式", desc: "话梅咸甜 + 气泡冰美式", price: "¥18" },
        ],
      },
      {
        type: "gallery", eyebrow: "SIGNATURE", title: "招牌系列", cols: 3,
        images: [
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80",
          "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=500&q=80",
          "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=500&q=80",
        ],
      },
      {
        type: "contact", eyebrow: "FIND US", title: "到店体验",
        rows: [
          { k: "门店电话", v: "021-0000-0000" },
          { k: "营业时间", v: "07:30 – 21:00" },
          { k: "地址", v: "某市某路 1 号 L1-08" },
        ],
      },
    ],
  },
};
