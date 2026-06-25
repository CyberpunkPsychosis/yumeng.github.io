const app = getApp();
Page({
  data: { cfg: {}, accent: "", mode: "", cat: "all", cats: [], list: [] },
  onLoad() {
    const cfg = app.globalData.config;
    // 只保留有回收物品的分类
    const cats = [{ id: "all", name: "全部" }].concat(
      cfg.categories.filter((c) => c.id !== "all" && cfg.sell.items.some((it) => it.cat === c.id))
    );
    this.setData({ cfg, accent: cfg.theme.accent, mode: cfg.theme.mode, cats });
    this.filter("all");
  },
  filter(cat) {
    const sc = this.data.cfg.sell;
    const fs = sc.conditions.map((c) => c.factor);
    const lo = Math.min.apply(null, fs), hi = Math.max.apply(null, fs);
    const list = sc.items.filter((it) => cat === "all" || it.cat === cat)
      .map((it) => Object.assign({}, it, { lo: Math.round(it.market * lo), hi: Math.round(it.market * hi) }));
    this.setData({ cat, list });
  },
  onCat(e) { this.filter(e.currentTarget.dataset.cat); },
  onPick(e) {
    app.globalData.sellPick = this.data.cfg.sell.items.find((x) => x.id === e.currentTarget.dataset.id);
    wx.navigateTo({ url: "/pages/sellform/sellform" });
  },
});
