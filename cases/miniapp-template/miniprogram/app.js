App({
  globalData: { statusBarHeight: 20, capsule: null },
  onLaunch() {
    try {
      const win = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this.globalData.statusBarHeight = win.statusBarHeight || 20;
      this.globalData.capsule = wx.getMenuButtonBoundingClientRect();
    } catch (e) {}
  },
});
