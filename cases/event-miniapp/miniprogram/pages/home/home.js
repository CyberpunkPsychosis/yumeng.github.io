const app = getApp();
Page({
  data: { cfg: {}, accent: "", list: [] },
  onLoad() { const cfg = app.globalData.config; this.setData({ cfg, accent: cfg.theme.accent }); wx.setNavigationBarTitle({ title: cfg.brand }); },
  onShow() { this.setData({ list: app.globalData.config.activities.map((a) => app.decorate(a)) }); },
  onOpen(e) { app.globalData.curId = e.currentTarget.dataset.id; wx.navigateTo({ url: "/pages/detail/detail" }); },
  toList() { wx.navigateTo({ url: "/pages/list/list" }); },
  toCreate() { wx.navigateTo({ url: "/pages/create/create" }); },
  toMine() { wx.navigateTo({ url: "/pages/mine/mine" }); },
  msg() { wx.showToast({ title: "消息（演示）", icon: "none" }); },
});
