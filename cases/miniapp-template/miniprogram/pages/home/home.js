const config = require("../../config.js");

Page({
  data: {
    theme: config.theme,
    brand: config.brand,
    blocks: config.blocks,
    navH: 64,
  },

  onLoad() {
    const g = getApp().globalData;
    const cap = g.capsule;
    const navH = cap ? (cap.bottom + cap.top - g.statusBarHeight) : (g.statusBarHeight + 44);
    this.setData({ navH });

    // 动态加载英文衬线字体（编辑式标题关键手段）
    wx.loadFontFace({
      family: "EditorialSerif",
      source: 'url("https://fonts.gstatic.com/s/ebgaramond/v27/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-6_RkCw.woff2")',
      scopes: ["webview", "native"],
      success: () => {}, fail: () => {},
    });
  },

  onAction(e) {
    wx.showToast({ title: e.currentTarget.dataset.label || "操作", icon: "none" });
  },
});
