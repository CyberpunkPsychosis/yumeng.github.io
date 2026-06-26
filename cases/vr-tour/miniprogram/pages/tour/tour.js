const app = getApp();
Page({
  data: { src: "" },
  onLoad(q) {
    if (q.name) wx.setNavigationBarTitle({ title: q.name });
    // web-view 载入 720° 全景 H5（需在小程序后台「业务域名」里配置该域名）
    this.setData({ src: app.globalData.config.h5tour });
  },
});
