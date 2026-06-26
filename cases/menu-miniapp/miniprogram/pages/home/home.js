const app = getApp();
const WD = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

Page({
  data: {
    cfg: {}, accent: "", mode: "", cat: "all",
    dates: [], dateIdx: 0, list: [], count: 0, total: 0, user: null,
  },
  onLoad() {
    const cfg = app.globalData.config;
    this.setData({ cfg, accent: cfg.theme.accent, mode: cfg.theme.mode });
    wx.setNavigationBarTitle({ title: cfg.brand });
    if (cfg.dateMode) this.buildDates();
    this.filter("all");
  },
  onShow() {
    const u = app.globalData.user;
    this.setData({ count: app.cartCount(), total: this.cartTotal(), user: u ? { phone: u.phone, tail: u.phone.slice(-4) } : null });
  },
  buildDates() {
    const base = new Date(), dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      const js = d.getDay(), wd = js === 0 ? 7 : js;
      const md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dates.push({ wlabel: i === 0 ? "今天" : i === 1 ? "明天" : WD[js], md, wd });
    }
    this.setData({ dates });
  },
  dishesForDay() {
    const cfg = this.data.cfg;
    if (!cfg.dateMode) return cfg.dishes;
    const wd = this.data.dates[this.data.dateIdx].wd;
    return cfg.dishes.filter((p) => !p.days || p.days.includes(wd));
  },
  filter(cat) {
    const list = this.dishesForDay()
      .filter((p) => cat === "all" || p.cat === cat)
      .map((p) => ({ ...p, rc: p.reviews.length }));
    this.setData({ cat, list });
  },
  cartTotal() {
    return Math.round(app.globalData.cart.filter((c) => c.sel).reduce((n, c) => n + app.linePrice(c) * c.qty, 0) * 100) / 100;
  },
  onCat(e) { this.filter(e.currentTarget.dataset.cat); },
  onDate(e) { this.setData({ dateIdx: +e.currentTarget.dataset.i }); this.filter("all"); },
  onOpen(e) { app.globalData.curId = e.currentTarget.dataset.id; wx.navigateTo({ url: "/pages/detail/detail" }); },
  onQuickAdd(e) {
    const p = this.data.cfg.dishes.find((d) => d.id === e.currentTarget.dataset.id);
    if (p.specs && p.specs.length) { app.globalData.curId = p.id; wx.navigateTo({ url: "/pages/detail/detail" }); return; }
    const cart = app.globalData.cart, line = cart.find((c) => c.id === p.id && !Object.keys(c.spec).length);
    if (line) line.qty++; else cart.push({ id: p.id, qty: 1, spec: {}, sel: true });
    this.setData({ count: app.cartCount(), total: this.cartTotal() });
    wx.showToast({ title: "已加入购物车", icon: "none" });
  },
  toCart() { wx.navigateTo({ url: "/pages/cart/cart" }); },
  toFeedback() { wx.navigateTo({ url: "/pages/feedback/feedback" }); },
  toMine() {
    const u = app.globalData.user;
    wx.showToast({ title: u ? "已登录 " + u.phone : "评价/下单时登录", icon: "none" });
  },
});
