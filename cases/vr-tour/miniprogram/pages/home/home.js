const app = getApp();
Page({
  data: { cfg: {} },
  onLoad() { this.setData({ cfg: app.globalData.config }); },
  onTap(e) {
    const f = this.data.cfg.features[+e.currentTarget.dataset.i];
    if (f.type === "tour") {
      wx.navigateTo({ url: "/pages/tour/tour?name=" + encodeURIComponent(f.name) });
    } else {
      wx.showToast({ title: f.name + "（演示）", icon: "none" });
    }
  },
});
