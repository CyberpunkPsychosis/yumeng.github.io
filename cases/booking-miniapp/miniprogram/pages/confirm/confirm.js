const app = getApp();

Page({
  data: { accent: "", mode: "", rows: [] },

  onLoad() {
    const g = app.globalData, cfg = g.config, b = cfg.booking;
    const it = cfg.items.find((x) => x.id === g.curId) || cfg.items[0];
    const f = g.form || { extra: {} };
    const rows = [
      { k: "项目", v: it.name },
      { k: b.dateLabel || "日期", v: f.date || "—" },
    ];
    if (f.slot) rows.push({ k: "时段", v: f.slot });
    (b.extra || []).forEach((x) => rows.push({ k: x.label, v: String(f.extra && f.extra[x.key] != null ? f.extra[x.key] : "—") }));
    rows.push({ k: "联系人", v: (f.name || "—") + " " + (f.phone || "") });
    this.setData({ accent: cfg.theme.accent, mode: cfg.theme.mode, rows });
  },

  onHome() { wx.reLaunch({ url: "/pages/home/home" }); },
});
