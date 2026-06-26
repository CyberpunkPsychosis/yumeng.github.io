const app = getApp();
Page({
  data: { accent: "", a: {}, shownAvatars: [], moreCount: 0, pct: 0, remain: 0 },
  onLoad() { this.refresh(); },
  onShow() { this.refresh(); },
  refresh() {
    const cfg = app.globalData.config, a = app.act(app.globalData.curId);
    const remain = Math.max(0, a.capacity - a.joined);
    this.setData({ accent: cfg.theme.accent, a, shownAvatars: a.avatars.slice(0, 8), moreCount: Math.max(0, a.joined - 8), pct: Math.round(a.joined / a.capacity * 100), remain });
  },
  toSignup() { if (this.data.remain <= 0) return; app.globalData.signupCount = 1; wx.navigateTo({ url: "/pages/signup/signup" }); },
});
