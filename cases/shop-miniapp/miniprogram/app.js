const config = require("./config.js");

App({
  globalData: {
    config,
    cart: [],      // [{id, qty, spec:{}, sel:true}]
    curId: null,
    lastOrder: null,
    sellPick: null,   // 卖闲置：选中的回收物品
    sellOrder: null,  // 卖闲置：提交的回收单 {item, cond, quote}
  },
  cartCount() { return this.globalData.cart.reduce((n, c) => n + c.qty, 0); },
});
