const app = getApp();
const starStr = (n) => "★★★★★☆☆☆☆☆".slice(5 - Math.round(n), 10 - Math.round(n));

Page({
  data: { cfg: {}, accent: "", mode: "", p: {}, sel: {}, reviews: [], count: 0 },
  onLoad() {
    const cfg = app.globalData.config;
    const p = cfg.dishes.find((d) => d.id === app.globalData.curId);
    const sel = {};
    (p.specs || []).forEach((o) => (sel[o.label] = o.values[0]));
    this.setData({ cfg, accent: cfg.theme.accent, mode: cfg.theme.mode, p, sel });
    this.refreshReviews();
  },
  onShow() { this.setData({ count: app.cartCount() }); this.refreshReviews(); },
  refreshReviews() {
    const p = app.globalData.config.dishes.find((d) => d.id === app.globalData.curId);
    this.setData({ reviews: p.reviews.map((r) => ({ ...r, starStr: starStr(r.stars) })) });
  },
  onSpec(e) {
    const { label, val } = e.currentTarget.dataset;
    this.setData({ ["sel." + label]: val });
  },
  onAdd() {
    const cart = app.globalData.cart, id = this.data.p.id, spec = this.data.sel;
    const key = JSON.stringify(spec);
    const line = cart.find((c) => c.id === id && JSON.stringify(c.spec) === key);
    if (line) line.qty++; else cart.push({ id, qty: 1, spec: { ...spec }, sel: true });
    this.setData({ count: app.cartCount() });
    wx.showToast({ title: "已加入购物车", icon: "none" });
  },
  toComment() { wx.navigateTo({ url: "/pages/comment/comment" }); },
  toCart() { wx.navigateTo({ url: "/pages/cart/cart" }); },
});
