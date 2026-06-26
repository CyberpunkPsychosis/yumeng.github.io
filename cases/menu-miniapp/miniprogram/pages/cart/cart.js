const app = getApp();
const specText = (s) => Object.values(s || {}).join(" · ");

Page({
  data: { accent: "", mode: "", lines: [], total: 0, selQty: 0, allSel: false },
  onShow() {
    const cfg = app.globalData.config;
    this.setData({ accent: cfg.theme.accent, mode: cfg.theme.mode });
    this.refresh();
  },
  refresh() {
    const cfg = app.globalData.config, cart = app.globalData.cart;
    const lines = cart.map((c, i) => {
      const p = cfg.dishes.find((d) => d.id === c.id);
      return { i, qty: c.qty, sel: c.sel, name: p.name, thumb: p.thumb, specText: specText(c.spec), price: app.linePrice(c) };
    });
    const sel = cart.filter((c) => c.sel);
    const total = Math.round(sel.reduce((n, c) => n + app.linePrice(c) * c.qty, 0) * 100) / 100;
    this.setData({ lines, total, selQty: sel.reduce((n, c) => n + c.qty, 0), allSel: cart.length && cart.every((c) => c.sel) });
  },
  tsel(e) { const c = app.globalData.cart[+e.currentTarget.dataset.i]; c.sel = !c.sel; this.refresh(); },
  tall() { const cart = app.globalData.cart, all = cart.every((c) => c.sel); cart.forEach((c) => (c.sel = !all)); this.refresh(); },
  qty(e) { const c = app.globalData.cart[+e.currentTarget.dataset.i]; c.qty = Math.max(1, c.qty + (+e.currentTarget.dataset.d)); this.refresh(); },
  del(e) { app.globalData.cart.splice(+e.currentTarget.dataset.i, 1); this.refresh(); },
  toHome() { wx.reLaunch({ url: "/pages/home/home" }); },
  checkout() {
    if (!this.data.selQty) { wx.showToast({ title: "请选择商品", icon: "none" }); return; }
    wx.navigateTo({ url: "/pages/checkout/checkout" });
  },
});
