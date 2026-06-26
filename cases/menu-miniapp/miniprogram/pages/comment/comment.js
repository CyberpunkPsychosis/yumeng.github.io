const app = getApp();
const todayMD = () => { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

Page({
  data: { accent: "", mode: "", p: {}, logged: false, tail: "", stars: 5, text: "" },
  onLoad() {
    const cfg = app.globalData.config;
    const p = cfg.dishes.find((d) => d.id === app.globalData.curId);
    const u = app.globalData.user;
    this.setData({ accent: cfg.theme.accent, mode: cfg.theme.mode, p, logged: !!u, tail: u ? u.phone.slice(-4) : "" });
  },
  // 微信绑定手机号登录：真机上 e.detail 含加密 code/encryptedData，需后端解密换取手机号。
  // 演示环境无后端，授权回调即视为登录成功。
  onLogin(e) {
    if (e.detail && e.detail.errMsg && e.detail.errMsg.indexOf("ok") === -1) {
      wx.showToast({ title: "需授权手机号后才能评价", icon: "none" });
      return;
    }
    app.globalData.user = { phone: "138****6688" };
    this.setData({ logged: true, tail: "6688" });
    wx.showToast({ title: "登录成功", icon: "none" });
  },
  onStar(e) { this.setData({ stars: +e.currentTarget.dataset.n }); },
  onInput(e) { this.setData({ text: e.detail.value }); },
  submit() {
    if (!this.data.logged) { wx.showToast({ title: "请先登录", icon: "none" }); return; }
    const txt = this.data.text.trim();
    if (!txt) { wx.showToast({ title: "写一句评价再提交吧", icon: "none" }); return; }
    const p = app.globalData.config.dishes.find((d) => d.id === app.globalData.curId);
    p.reviews.unshift({ name: "尾号" + this.data.tail, stars: this.data.stars, text: txt, date: todayMD() });
    wx.showToast({ title: "评价已发布", icon: "success" });
    setTimeout(() => wx.navigateBack(), 600);
  },
});
