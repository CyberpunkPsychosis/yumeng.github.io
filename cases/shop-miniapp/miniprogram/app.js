const config = require("./config.js");

App({
  globalData: {
    config,
    cart: [],      // [{id, qty, spec:{}, sel:true}]
    curId: null,
    lastOrder: null,
  },
  cartCount() { return this.globalData.cart.reduce((n, c) => n + c.qty, 0); },
});
