const app = getApp();
Page({
  data: { accent: "", filters: [], filter: "全部", list: [] },
  onLoad() { const cfg = app.globalData.config; this.setData({ accent: cfg.theme.accent, filters: cfg.filters }); this.refresh(); },
  onShow() { this.refresh(); },
  refresh() {
    const f = this.data.filter;
    const list = app.globalData.config.activities.filter((a) => f === "全部" || a.cat === f).map((a) => app.decorate(a));
    this.setData({ list });
  },
  onFilter(e) { this.setData({ filter: e.currentTarget.dataset.f }, () => this.refresh()); },
  onOpen(e) { app.globalData.curId = e.currentTarget.dataset.id; wx.navigateTo({ url: "/pages/detail/detail" }); },
});
