const app = getApp();
Page({
  data: { cfg: {}, accent: "", mode: "", p: {}, sel: {}, count: 0 },
  onLoad() {
    const g = app.globalData, cfg = g.config;
    const p = cfg.products.find((x) => x.id === g.curId) || cfg.products[0];
    const sel = {};
    (p.specs || []).forEach((o) => { sel[o.label] = o.values[0]; });
    this.setData({ cfg, accent: cfg.theme.accent, mode: cfg.theme.mode, p, sel, count: app.cartCount() });
  },
  onSpec(e) {
    const { label, val } = e.currentTarget.dataset;
    this.setData({ sel: Object.assign({}, this.data.sel, { [label]: val }) });
  },
  onAdd() {
    const cart = app.globalData.cart, p = this.data.p, key = JSON.stringify(this.data.sel);
    const line = cart.find((c) => c.id === p.id && JSON.stringify(c.spec) === key);
    if (line) line.qty++; else cart.push({ id: p.id, qty: 1, spec: Object.assign({}, this.data.sel), sel: true });
    this.setData({ count: app.cartCount() });
    wx.showToast({ title: "已加入购物车", icon: "none" });
  },
  toCart() { wx.navigateTo({ url: "/pages/cart/cart" }); },
  toHome() { wx.reLaunch({ url: "/pages/home/home" }); },
});
