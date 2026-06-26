const app = getApp();
Page({
  data: { accent: "", mode: "", total: 0, needAddress: false },
  onLoad() {
    const cfg = app.globalData.config, o = app.globalData.lastOrder || { total: 0 };
    this.setData({ accent: cfg.theme.accent, mode: cfg.theme.mode, total: o.total, needAddress: cfg.needAddress });
  },
  toHome() { wx.reLaunch({ url: "/pages/home/home" }); },
});
