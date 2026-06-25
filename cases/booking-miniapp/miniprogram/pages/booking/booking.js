const app = getApp();

Page({
  data: { cfg: {}, accent: "", mode: "", it: {}, b: {}, form: {} },

  onLoad() {
    const g = app.globalData, cfg = g.config;
    const it = cfg.items.find((x) => x.id === g.curId) || cfg.items[0];
    const form = g.form || { date: "", slot: "", extra: {}, name: "", phone: "", note: "" };
    (cfg.booking.extra || []).forEach((f) => {
      if (f.type === "stepper" && form.extra[f.key] === undefined) form.extra[f.key] = f.value != null ? f.value : (f.min || 1);
    });
    this.setData({ cfg, accent: cfg.theme.accent, mode: cfg.theme.mode, it, b: cfg.booking, form });
  },

  apply(form) { this.setData({ form }); app.globalData.form = form; },

  onDate(e) { this.apply(Object.assign({}, this.data.form, { date: e.detail.value })); },
  onSlot(e) { this.apply(Object.assign({}, this.data.form, { slot: e.currentTarget.dataset.slot })); },
  onSel(e) {
    const { key, val } = e.currentTarget.dataset;
    this.apply(Object.assign({}, this.data.form, { extra: Object.assign({}, this.data.form.extra, { [key]: val }) }));
  },
  onStep(e) {
    const { key, dir } = e.currentTarget.dataset;
    const f = this.data.b.extra.find((x) => x.key === key);
    let v = Number(this.data.form.extra[key]) + Number(dir) * (f.step || 1);
    v = Math.max(f.min != null ? f.min : 0, Math.min(f.max != null ? f.max : 99999, v));
    this.apply(Object.assign({}, this.data.form, { extra: Object.assign({}, this.data.form.extra, { [key]: v }) }));
  },
  onInput(e) {
    const k = e.currentTarget.dataset.k;
    if (k.indexOf("extra:") === 0) {
      this.apply(Object.assign({}, this.data.form, { extra: Object.assign({}, this.data.form.extra, { [k.slice(6)]: e.detail.value }) }));
    } else {
      this.apply(Object.assign({}, this.data.form, { [k]: e.detail.value }));
    }
  },

  onSubmit() {
    const f = this.data.form;
    if (!f.date || !f.name || !f.phone) { wx.showToast({ title: "请填写日期/姓名/手机号", icon: "none" }); return; }
    app.globalData.form = f;
    wx.redirectTo({ url: "/pages/confirm/confirm" });
  },
});
