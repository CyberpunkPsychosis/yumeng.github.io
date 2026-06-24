// 全局：读取一次系统信息（状态栏高度、胶囊位置），各页面共用
App({
  globalData: {
    statusBarHeight: 20,
    capsule: null,
  },
  onLaunch() {
    try {
      const win = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this.globalData.statusBarHeight = win.statusBarHeight || 20;
      // 胶囊按钮位置，用来给自定义导航留出避让区域
      this.globalData.capsule = wx.getMenuButtonBoundingClientRect();
    } catch (e) {}
  },
});
