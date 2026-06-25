const app = getApp();
Page({
  data: { accent: "", mode: "", items: [], total: 0 },
  onLoad() {
    const cfg = app.globalData.config;
    const items = app.globalData.cart.filter((c) => c.sel).map((c) => {
      const p = cfg.products.find((x) => x.id === c.id);
      return { qty: c.qty, specText: Object.values(c.spec || {}).join(" · "), title: p.title, thumb: p.thumb, price: p.price };
    });
    const total = items.reduce((n, l) => n + l.price * l.qty, 0);
    this.setData({ accent: cfg.theme.accent, mode: cfg.theme.mode, items, total: Math.round(total * 100) / 100 });
  },
  pay() {
    app.globalData.lastOrder = { total: this.data.total };
    app.globalData.cart = app.globalData.cart.filter((c) => !c.sel);
    wx.redirectTo({ url: "/pages/confirm/confirm" });
  },
});
