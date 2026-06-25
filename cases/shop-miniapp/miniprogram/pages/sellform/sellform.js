const app = getApp();
Page({
  data: { cfg: {}, accent: "", mode: "", item: {}, conds: [], condId: "", condName: "", quote: null, photos: 0, slots: [0, 1, 2] },
  onLoad() {
    const g = app.globalData, cfg = g.config;
    const item = g.sellPick || cfg.sell.items[0];
    this.setData({ cfg, accent: cfg.theme.accent, mode: cfg.theme.mode, item, conds: cfg.sell.conditions });
  },
  onCond(e) {
    const cond = this.data.cfg.sell.conditions.find((c) => c.id === e.currentTarget.dataset.id);
    this.setData({ condId: cond.id, condName: cond.name, quote: Math.round(this.data.item.market * cond.factor) });
  },
  addPhoto() {
    // 演示：直接占位；真机可换 wx.chooseMedia 选图后上传
    if (this.data.photos < 3) this.setData({ photos: this.data.photos + 1 });
  },
  submit() {
    if (!this.data.condId) { wx.showToast({ title: "请选择成色", icon: "none" }); return; }
    const cond = this.data.cfg.sell.conditions.find((c) => c.id === this.data.condId);
    app.globalData.sellOrder = { item: this.data.item, cond, quote: this.data.quote };
    wx.redirectTo({ url: "/pages/selldone/selldone" });
  },
});
