// 同城活动报名 / 组织 小程序 —— 全局
const config = require("./config.js");
App({
  globalData: {
    config,            // 当前社区配置（活动会被报名/发起修改）
    user: null,        // 微信绑定手机号登录：{ phone }
    curId: null,
    signupCount: 1,
    myJoined: [],
    myCreated: [],
    seq: 0,
  },
  act(id) { return this.globalData.config.activities.find((a) => a.id === id); },
  // 卡片展示用：截取头像 + 计算 +N
  decorate(a) { return Object.assign({}, a, { shownAvatars: a.avatars.slice(0, 6), moreCount: Math.max(0, a.joined - 6) }); },
});
