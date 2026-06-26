const app = getApp();
Page({
  data: { accent: "", user: null, joined: [], created: [], tools: ["旅行规划师", "我的奖品", "优惠券", "邀请好友", "意见反馈", "实名认证", "常用出行人", "设置"] },
  onShow() {
    const cfg = app.globalData.config, u = app.globalData.user;
    this.setData({ accent: cfg.theme.accent, user: u ? { tail: u.phone.slice(-4) } : null, joined: app.globalData.myJoined.slice(), created: app.globalData.myCreated.slice() });
  },
  onLogin(e) {
    if (e.detail && e.detail.errMsg && e.detail.errMsg.indexOf("ok") === -1) return;
    app.globalData.user = { phone: "138****6688" };
    this.onShow();
  },
  onOpen(e) { app.globalData.curId = e.currentTarget.dataset.id; wx.navigateTo({ url: "/pages/detail/detail" }); },
  toHome() { wx.reLaunch({ url: "/pages/home/home" }); },
});
