const app = getApp();
Page({
  data: { accent: "", a: {}, count: 1, remain: 0, logged: false, name: "", phone: "", note: "", total: 0 },
  onLoad() {
    const cfg = app.globalData.config, a = app.act(app.globalData.curId), u = app.globalData.user;
    const remain = Math.max(0, a.capacity - a.joined);
    this.setData({ accent: cfg.theme.accent, a, remain, count: 1, logged: !!u, name: u ? "微信用户" : "", phone: u ? u.phone : "", total: a.price });
  },
  onLogin(e) {
    if (e.detail && e.detail.errMsg && e.detail.errMsg.indexOf("ok") === -1) { wx.showToast({ title: "需登录后报名", icon: "none" }); return; }
    app.globalData.user = { phone: "138****6688" };
    this.setData({ logged: true, name: "微信用户", phone: "138****6688" });
  },
  cnt(e) { let c = this.data.count + (+e.currentTarget.dataset.d); c = Math.max(1, Math.min(this.data.remain, c)); this.setData({ count: c, total: Math.round(this.data.a.price * c * 100) / 100 }); },
  iName(e) { this.setData({ name: e.detail.value }); },
  iPhone(e) { this.setData({ phone: e.detail.value }); },
  iNote(e) { this.setData({ note: e.detail.value }); },
  submit() {
    if (!this.data.logged) { wx.showToast({ title: "请先登录", icon: "none" }); return; }
    if (!this.data.name.trim() || !this.data.phone.trim()) { wx.showToast({ title: "请填写姓名和手机号", icon: "none" }); return; }
    const a = app.act(app.globalData.curId);
    a.joined = Math.min(a.capacity, a.joined + this.data.count);
    for (let i = 0; i < this.data.count; i++) a.avatars.push(this.data.name[0] || "新");
    if (!app.globalData.myJoined.find((m) => m.id === a.id)) app.globalData.myJoined.unshift(a);
    app.globalData.signupCount = this.data.count;
    wx.redirectTo({ url: "/pages/confirm/confirm" });
  },
});
