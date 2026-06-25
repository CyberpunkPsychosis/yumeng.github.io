const app = getApp();

Page({
  data: { cfg: {}, accent: "#2f9e8f", mode: "light", cat: "all", list: [], navH: 64 },

  onLoad() {
    const cfg = app.globalData.config;
    this.setData({
      cfg, accent: cfg.theme.accent, mode: cfg.theme.mode,
      navH: (app.globalData.statusBarHeight || 20) + 44,
    });
    this.filter("all");
  },

  filter(cat) {
    const list = this.data.cfg.items.filter((it) => cat === "all" || it.cat === cat);
    this.setData({ cat, list });
  },
  onCat(e) { this.filter(e.currentTarget.dataset.cat); },
  onOpen(e) {
    app.globalData.curId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/detail/detail" });
  },
});
