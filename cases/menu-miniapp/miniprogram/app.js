// 餐饮 / 菜单 / 点餐 通用小程序 —— 全局状态
const config = require("./config.js");

App({
  globalData: {
    config,
    user: null,        // 微信绑定手机号登录后：{ phone }
    cart: [],          // [{ id, qty, spec:{}, sel:true }]
    curId: null,       // 当前查看的菜品
    lastOrder: null,
  },
  cartCount() {
    return this.globalData.cart.reduce((n, c) => n + c.qty, 0);
  },
  // 规格里 "大杯 +3" 这类带加价的，解析单行价
  linePrice(c) {
    const p = config.dishes.find((d) => d.id === c.id);
    const add = Object.values(c.spec || {}).reduce((n, v) => {
      const m = String(v).match(/\+(\d+(\.\d+)?)/); return n + (m ? +m[1] : 0);
    }, 0);
    return p.price + add;
  },
});
