const app = getApp();

Page({
  data: { cfg: {}, accent: "", mode: "", it: {}, opt: {} },

  onLoad() {
    const g = app.globalData, cfg = g.config;
    const it = cfg.items.find((x) => x.id === g.curId) || cfg.items[0];
    const opt = {};
    (it.options || []).forEach((o) => { opt[o.label] = o.values[0]; });
    g.opt = opt;
    this.setData({ cfg, accent: cfg.theme.accent, mode: cfg.theme.mode, it, opt });
    wx.setNavigationBarTitle({ title: cfg.unitLabel + "详情" });
  },

  onOpt(e) {
    const { label, val } = e.currentTarget.dataset;
    const opt = Object.assign({}, this.data.opt, { [label]: val });
    app.globalData.opt = opt;
    this.setData({ opt });
  },

  onBook() {
    const slots = this.data.cfg.booking.slots || [];
    app.globalData.form = { date: "", slot: slots[0] || "", extra: {}, name: "", phone: "", note: "" };
    wx.navigateTo({ url: "/pages/booking/booking" });
  },
});
