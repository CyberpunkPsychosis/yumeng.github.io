const app = getApp();
Page({
  data: { accent: "", mode: "", quote: 0 },
  onLoad() {
    const cfg = app.globalData.config, o = app.globalData.sellOrder || { quote: 0 };
    this.setData({ accent: cfg.theme.accent, mode: cfg.theme.mode, quote: o.quote });
  },
  toSell() { wx.redirectTo({ url: "/pages/sell/sell" }); },
  toHome() { wx.reLaunch({ url: "/pages/home/home" }); },
});
