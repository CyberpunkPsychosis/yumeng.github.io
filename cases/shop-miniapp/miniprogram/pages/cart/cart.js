const app = getApp();
Page({
  data: { accent: "", mode: "", lines: [], total: 0, allSel: false, selQty: 0 },
  onShow() {
    const cfg = app.globalData.config;
    this.setData({ accent: cfg.theme.accent, mode: cfg.theme.mode });
    this.refresh();
  },
  refresh() {
    const cfg = app.globalData.config, cart = app.globalData.cart;
    const lines = cart.map((c, i) => {
      const p = cfg.products.find((x) => x.id === c.id);
      return { i, qty: c.qty, sel: c.sel, specText: Object.values(c.spec || {}).join(" · "), title: p.title, thumb: p.thumb, price: p.price };
    });
    const selLines = lines.filter((l) => l.sel);
    const total = selLines.reduce((n, l) => n + l.price * l.qty, 0);
    this.setData({ lines, total: Math.round(total * 100) / 100, allSel: cart.length > 0 && cart.every((c) => c.sel), selQty: selLines.reduce((n, l) => n + l.qty, 0) });
  },
  tsel(e) { const c = app.globalData.cart[e.currentTarget.dataset.i]; c.sel = !c.sel; this.refresh(); },
  tall() { const cart = app.globalData.cart, all = cart.every((c) => c.sel); cart.forEach((c) => c.sel = !all); this.refresh(); },
  qty(e) { const { i, d } = e.currentTarget.dataset; const c = app.globalData.cart[i]; c.qty = Math.max(1, c.qty + Number(d)); this.refresh(); },
  del(e) { app.globalData.cart.splice(e.currentTarget.dataset.i, 1); this.refresh(); },
  checkout() {
    if (!app.globalData.cart.some((c) => c.sel)) { wx.showToast({ title: "请选择商品", icon: "none" }); return; }
    wx.navigateTo({ url: "/pages/checkout/checkout" });
  },
  toHome() { wx.reLaunch({ url: "/pages/home/home" }); },
});
