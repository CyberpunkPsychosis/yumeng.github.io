const app = getApp();

Page({
  data: { accent: "", mode: "", fb: {}, tags: [], picked: {}, text: "", contact: "" },
  onLoad() {
    const cfg = app.globalData.config;
    this.setData({ accent: cfg.theme.accent, mode: cfg.theme.mode, fb: cfg.feedback, tags: cfg.feedback.tags });
  },
  onTag(e) {
    const t = e.currentTarget.dataset.t, picked = { ...this.data.picked };
    picked[t] = !picked[t];
    this.setData({ picked });
  },
  onText(e) { this.setData({ text: e.detail.value }); },
  onContact(e) { this.setData({ contact: e.detail.value }); },
  submit() {
    const chosen = Object.keys(this.data.picked).filter((k) => this.data.picked[k]);
    if (!chosen.length && !this.data.text.trim()) {
      wx.showToast({ title: "选个标签或写两句吧", icon: "none" });
      return;
    }
    // 演示：实际可在此 wx.request 上报到商家后台
    wx.showToast({ title: "感谢反馈，已提交", icon: "success" });
    setTimeout(() => wx.navigateBack(), 700);
  },
});
