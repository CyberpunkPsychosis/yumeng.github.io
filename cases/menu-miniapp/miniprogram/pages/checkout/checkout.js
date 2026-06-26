const app = getApp();
const specText = (s) => Object.values(s || {}).join(" · ");

Page({
  data: { cfg: {}, accent: "", mode: "", items: [], goods: 0, fee: 0, total: 0, logged: false, phone: "" },
  onLoad() {
    const cfg = app.globalData.config;
    const sel = app.globalData.cart.filter((c) => c.sel);
    const items = sel.map((c) => {
      const p = cfg.dishes.find((d) => d.id === c.id);
      return { name: p.name, thumb: p.thumb, specText: specText(c.spec), qty: c.qty, amount: Math.round(app.linePrice(c) * c.qty * 100) / 100 };
    });
    const goods = Math.round(sel.reduce((n, c) => n + app.linePrice(c) * c.qty, 0) * 100) / 100;
    const fee = cfg.needAddress ? 3 : 0;
    const u = app.globalData.user;
    this.setData({ cfg, accent: cfg.theme.accent, mode: cfg.theme.mode, items, goods, fee, total: Math.round((goods + fee) * 100) / 100, logged: !!u, phone: u ? u.phone : "" });
  },
  // 已登录直接下单
  pay() { if (!this.data.logged) { wx.showToast({ title: "请先登录", icon: "none" }); return; } this.placeOrder(); },
  // 未登录：点「登录并提交」走微信手机号授权
  onLoginAndPay(e) {
    if (e.detail && e.detail.errMsg && e.detail.errMsg.indexOf("ok") === -1) {
      wx.showToast({ title: "需登录后下单", icon: "none" }); return;
    }
    app.globalData.user = { phone: "138****6688" };
    this.setData({ logged: true, phone: "138****6688" });
    this.placeOrder();
  },
  placeOrder() {
    app.globalData.lastOrder = { total: this.data.total };
    app.globalData.cart = app.globalData.cart.filter((c) => !c.sel);
    wx.redirectTo({ url: "/pages/confirm/confirm" });
  },
});
