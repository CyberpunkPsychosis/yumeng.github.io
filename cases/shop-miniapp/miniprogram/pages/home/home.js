const app = getApp();
Page({
  data: { cfg: {}, accent: "", mode: "", cat: "all", list: [], count: 0 },
  onLoad() {
    const cfg = app.globalData.config;
    this.setData({ cfg, accent: cfg.theme.accent, mode: cfg.theme.mode });
    this.filter("all");
    wx.setNavigationBarTitle({ title: cfg.brand });
  },
  onShow() { this.setData({ count: app.cartCount() }); },
  filter(cat) { this.setData({ cat, list: this.data.cfg.products.filter((p) => cat === "all" || p.cat === cat) }); },
  onCat(e) { this.filter(e.currentTarget.dataset.cat); },
  onOpen(e) { app.globalData.curId = e.currentTarget.dataset.id; wx.navigateTo({ url: "/pages/detail/detail" }); },
  toCart() { wx.navigateTo({ url: "/pages/cart/cart" }); },
});
