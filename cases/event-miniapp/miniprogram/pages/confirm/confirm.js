const app = getApp();
Page({
  data: { accent: "", a: {}, count: 1 },
  onLoad() { const cfg = app.globalData.config; this.setData({ accent: cfg.theme.accent, a: app.act(app.globalData.curId), count: app.globalData.signupCount }); },
  toMine() { wx.reLaunch({ url: "/pages/mine/mine" }); },
  toHome() { wx.reLaunch({ url: "/pages/home/home" }); },
});
