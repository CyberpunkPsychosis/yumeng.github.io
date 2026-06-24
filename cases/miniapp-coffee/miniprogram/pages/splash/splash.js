Page({
  data: {
    navH: 64,                 // 自定义导航占位高度（状态栏 + 胶囊）
    product: {
      titleCn: "全冰黄油SOE",
      titleEn: "FULL ICE BUTTER SOE",
      note: "*图片仅供参考，请以实物或店内为准。",
      img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80",
      prices: [
        { y: "¥20", m: "(12oz)中杯 710ml" },
        { y: "¥20", m: "(16oz)大杯 950ml" },
      ],
    },
  },

  onLoad() {
    const g = getApp().globalData;
    // 自定义导航高度 = 状态栏高度 + 胶囊到状态栏的距离 ×2（标准避让算法）
    const cap = g.capsule;
    const navH = cap ? (cap.bottom + cap.top - g.statusBarHeight) : (g.statusBarHeight + 44);
    this.setData({ navH });

    // 动态加载英文衬线字体（高设计小程序还原编辑式标题的关键手段）
    wx.loadFontFace({
      family: "EditorialSerif",
      source: 'url("https://fonts.gstatic.com/s/ebgaramond/v27/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-6_RkCw.woff2")',
      scopes: ["webview", "native"],
      success: () => this.setData({ fontReady: true }),
      fail: () => {},
    });
  },

  // 底部导航事件（demo 只做提示，实际跳转对应页面）
  onStartOrder() { wx.showToast({ title: "开始点单", icon: "none" }); },
  onMemberCode() { wx.showToast({ title: "会员积分码", icon: "none" }); },
  onTap(e) { wx.showToast({ title: e.currentTarget.dataset.label, icon: "none" }); },
  onClose() { wx.showToast({ title: "关闭", icon: "none" }); },
});
