const config = require("./config.js");

App({
  globalData: {
    config,
    statusBarHeight: 20,
    curId: null,   // 当前选中的服务 id
    opt: {},       // 详情页选中的选项
    form: {},      // 预约表单
  },
  onLaunch() {
    try {
      const w = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this.globalData.statusBarHeight = w.statusBarHeight || 20;
    } catch (e) {}
  },
});
