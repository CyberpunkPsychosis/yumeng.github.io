const app = getApp();
Page({
  data: { accent: "", logged: false, cats: [], f: { title: "", catIdx: 0, date: "", time: "", place: "", price: "", cap: "", desc: "" } },
  onLoad() {
    const cfg = app.globalData.config;
    this.setData({ accent: cfg.theme.accent, logged: !!app.globalData.user, cats: cfg.filters.filter((x) => x !== "全部") });
  },
  onLogin(e) {
    if (e.detail && e.detail.errMsg && e.detail.errMsg.indexOf("ok") === -1) { wx.showToast({ title: "需登录后发起", icon: "none" }); return; }
    app.globalData.user = { phone: "138****6688" };
    this.setData({ logged: true });
  },
  set(e) { this.setData({ ["f." + e.currentTarget.dataset.k]: e.detail.value }); },
  onCat(e) { this.setData({ "f.catIdx": +e.detail.value }); },
  publish() {
    const f = this.data.f;
    if (!f.title.trim()) { wx.showToast({ title: "先给活动起个标题", icon: "none" }); return; }
    const cfg = app.globalData.config;
    const a = {
      id: "new" + (++app.globalData.seq), cat: this.data.cats[f.catIdx], title: f.title,
      cover: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=70",
      tags: ["我发起"], organizer: { name: "尾号" + app.globalData.user.phone.slice(-4), badge: "我", views: 1 },
      date: f.date || "待定", time: f.time || "待定", place: f.place || "待定", distance: "0km",
      price: +f.price || 0, capacity: +f.cap || 10, joined: 1, avatars: ["我"],
      highlights: ["新发起的活动"], includes: ["详见简介"], desc: f.desc || "—",
    };
    cfg.activities.unshift(a); app.globalData.myCreated.unshift(a);
    wx.showToast({ title: "活动已发布 🚀", icon: "none" });
    setTimeout(() => wx.reLaunch({ url: "/pages/home/home" }), 800);
  },
});
