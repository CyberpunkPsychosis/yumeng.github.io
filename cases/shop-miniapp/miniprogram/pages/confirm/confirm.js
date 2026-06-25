const app = getApp();
Page({
  data: { accent: "", mode: "", total: 0 },
  onLoad() {
    const cfg = app.globalData.config, o = app.globalData.lastOrder || { total: 0 };
    this.setData({ accent: cfg.theme.accent, mode: cfg.theme.mode, total: o.total });
  },
  toHome() { wx.reLaunch({ url: "/pages/home/home" }); },
  orders() { wx.showToast({ title: "我的订单（演示）", icon: "none" }); },
});
