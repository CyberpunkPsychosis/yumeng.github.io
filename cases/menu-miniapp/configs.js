/* 餐饮 / 菜单 / 点餐 通用小程序配置 —— 换场景只改这份
 *
 * 三种内置场景共用一套骨架：选日期/时段 → 看菜单 → 点开菜品看评价 → 评论(需手机号登录) → 底部给商家提建议。
 * 用 ordering / dateMode 两个开关，决定是"只看菜+评价"(食堂) 还是"能加购下单"(外卖/奶茶)。
 *
 * 字段：
 *   theme   { mode:light|dark, accent }
 *   brand/sub/notice   抬头与公告
 *   dateMode  顶部是否显示日期选择（食堂按天换菜）
 *   ordering  是否有购物车/下单（外卖、奶茶=true；食堂=false）
 *   needAddress  下单是否要填地址（外卖=true）
 *   categories  分类
 *   dishes   菜品：{ id, cat, name, price, unit?, thumb, tags?, desc, rating, reviews:[{name,stars,text,date}],
 *                    days?(食堂：周几供应 1-7，省略=每天), specs?(规格组，奶茶用) }
 *   feedback  底部建议反馈：{ title, placeholder, tags }
 */
window.MENU_CONFIGS = {

  /* ============ 场景一：高校食堂菜单 + 评价（你描述的那个） ============ */
  canteen: {
    theme: { mode: "light", accent: "#3aa676" },
    brand: "阳光大学 · 中心食堂",
    sub: "今日菜单 · 明厨亮灶",
    notice: "今日推荐：番茄牛腩、蒜蓉西兰花，11:00 开餐",
    dateMode: true,
    ordering: false,
    needAddress: false,
    categories: [
      { id: "all", name: "全部" },
      { id: "hot", name: "热菜" },
      { id: "veg", name: "素菜" },
      { id: "staple", name: "主食" },
      { id: "soup", name: "汤品" },
    ],
    dishes: [
      { id: "c1", cat: "hot", name: "番茄牛腩", price: 12, unit: "份", tags: ["招牌", "今日推荐"], rating: 4.8,
        thumb: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=70",
        desc: "牛腩慢炖入味，番茄汤汁浓郁，拌饭一绝。",
        reviews: [
          { name: "王**", stars: 5, text: "牛腩炖得很烂，汤汁拌饭绝了，希望天天有。", date: "06-25" },
          { name: "李**", stars: 4, text: "味道不错，就是有时去晚了就没了。", date: "06-24" },
        ] },
      { id: "c2", cat: "hot", name: "宫保鸡丁", price: 9, unit: "份", tags: ["微辣"], rating: 4.5, days: [1, 3, 5],
        thumb: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&q=70",
        desc: "鸡丁滑嫩，花生香脆，酸甜微辣下饭。",
        reviews: [{ name: "赵**", stars: 5, text: "花生很脆，鸡肉给得足。", date: "06-25" }] },
      { id: "c3", cat: "hot", name: "红烧排骨", price: 13, unit: "份", tags: ["人气"], rating: 4.7, days: [2, 4, 6],
        thumb: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&q=70",
        desc: "肉质酥软，咸甜适口，连汤汁都想拌饭。",
        reviews: [{ name: "孙**", stars: 5, text: "排骨大块，性价比高。", date: "06-23" }] },
      { id: "c4", cat: "veg", name: "蒜蓉西兰花", price: 6, unit: "份", tags: ["清淡", "今日推荐"], rating: 4.6,
        thumb: "https://images.unsplash.com/photo-1583663848692-6f2c0e8d8e9d?w=400&q=70",
        desc: "西兰花脆嫩，蒜香清爽，少油少盐。",
        reviews: [{ name: "周**", stars: 4, text: "很新鲜，就是想再多给一点。", date: "06-24" }] },
      { id: "c5", cat: "veg", name: "麻婆豆腐", price: 7, unit: "份", tags: ["微辣"], rating: 4.4, days: [1, 2, 4, 5],
        thumb: "https://images.unsplash.com/photo-1582576163090-09d3b6f8e2b6?w=400&q=70",
        desc: "豆腐嫩滑，麻辣鲜香，经典川味。",
        reviews: [{ name: "吴**", stars: 4, text: "够麻够辣，下饭。", date: "06-22" }] },
      { id: "c6", cat: "staple", name: "扬州炒饭", price: 8, unit: "份", tags: [], rating: 4.3,
        thumb: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=70",
        desc: "粒粒分明，配料丰富，一份管饱。",
        reviews: [{ name: "郑**", stars: 4, text: "分量足，火腿肠有点少。", date: "06-21" }] },
      { id: "c7", cat: "staple", name: "牛肉拉面", price: 11, unit: "碗", tags: ["现做"], rating: 4.6, days: [1, 3, 5, 7],
        thumb: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=70",
        desc: "汤头清亮，面条筋道，现拉现煮。",
        reviews: [{ name: "冯**", stars: 5, text: "汤很鲜，牛肉片给得不少。", date: "06-25" }] },
      { id: "c8", cat: "soup", name: "紫菜蛋花汤", price: 3, unit: "份", tags: ["免费续"], rating: 4.5,
        thumb: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=70",
        desc: "蛋花细腻，清口解腻，可免费续汤。",
        reviews: [{ name: "陈**", stars: 5, text: "能续汤太贴心了。", date: "06-20" }] },
      { id: "c9", cat: "soup", name: "玉米排骨汤", price: 6, unit: "份", tags: ["养生"], rating: 4.7, days: [2, 4, 6],
        thumb: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=70",
        desc: "玉米清甜，排骨炖足两小时，汤色奶白。",
        reviews: [{ name: "褚**", stars: 5, text: "汤很浓，喝着舒服。", date: "06-19" }] },
    ],
    feedback: {
      title: "给食堂提建议",
      placeholder: "菜品口味、卫生、价格、排队…想说的都写给后勤吧",
      tags: ["希望多上新菜", "菜偏咸了", "排队时间长", "卫生很好", "希望延长开餐"],
    },
  },

  /* ============ 场景二：外卖点餐（能下单，无支付） ============ */
  takeout: {
    theme: { mode: "light", accent: "#ff6a00" },
    brand: "巷子口家常菜 · 外卖",
    sub: "30 分钟送达 · 起送 ¥15",
    notice: "满 30 减 5，雨天请耐心等待骑手～",
    dateMode: false,
    ordering: true,
    needAddress: true,
    categories: [
      { id: "all", name: "全部" },
      { id: "rice", name: "盖饭" },
      { id: "stir", name: "小炒" },
      { id: "noodle", name: "面食" },
      { id: "side", name: "小食/饮品" },
    ],
    dishes: [
      { id: "t1", cat: "rice", name: "黑椒牛肉饭", price: 22, unit: "份", tags: ["热销 No.1"], rating: 4.8,
        thumb: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=70",
        desc: "黑椒牛肉滑嫩，配米饭与时蔬，一盒满足。",
        reviews: [{ name: "顾**", stars: 5, text: "牛肉嫩，酱汁很香，下次还点。", date: "06-25" }] },
      { id: "t2", cat: "rice", name: "照烧鸡腿饭", price: 19, unit: "份", tags: ["招牌"], rating: 4.7,
        thumb: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=70",
        desc: "去骨鸡腿，照烧酱浓郁，附溏心蛋。",
        reviews: [{ name: "钱**", stars: 5, text: "鸡腿大，蛋是溏心的，加分。", date: "06-24" }] },
      { id: "t3", cat: "stir", name: "鱼香肉丝", price: 18, unit: "份", tags: ["下饭"], rating: 4.5,
        thumb: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&q=70",
        desc: "酸甜微辣，配菜爽脆，经典家常。",
        reviews: [{ name: "孙**", stars: 4, text: "味道正宗，份量再大点更好。", date: "06-23" }] },
      { id: "t4", cat: "stir", name: "干锅花菜", price: 20, unit: "份", tags: ["微辣"], rating: 4.6,
        thumb: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=70",
        desc: "花菜干香入味，带点腊肉香。",
        reviews: [{ name: "李**", stars: 5, text: "很香，配米饭绝配。", date: "06-22" }] },
      { id: "t5", cat: "noodle", name: "番茄牛肉面", price: 21, unit: "碗", tags: ["汤面"], rating: 4.7,
        thumb: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=70",
        desc: "番茄熬汤，牛肉软烂，面条筋道。",
        reviews: [{ name: "周**", stars: 5, text: "汤底浓，份量够。", date: "06-25" }] },
      { id: "t6", cat: "noodle", name: "葱油拌面", price: 14, unit: "碗", tags: ["素"], rating: 4.4,
        thumb: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=70",
        desc: "葱油喷香，简单却让人上瘾。",
        reviews: [{ name: "吴**", stars: 4, text: "香，建议配个荷包蛋。", date: "06-21" }] },
      { id: "t7", cat: "side", name: "炸鸡块（6 块）", price: 16, unit: "份", tags: ["现炸"], rating: 4.6,
        thumb: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=70",
        desc: "外酥里嫩，配甜辣酱。",
        reviews: [{ name: "郑**", stars: 5, text: "现炸的，到手还脆。", date: "06-20" }] },
      { id: "t8", cat: "side", name: "鲜榨橙汁", price: 10, unit: "杯", tags: ["鲜榨"], rating: 4.5,
        thumb: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=70",
        desc: "整橙现榨，无添加。",
        reviews: [{ name: "冯**", stars: 5, text: "很新鲜，不算太甜。", date: "06-19" }] },
    ],
    feedback: {
      title: "给商家提建议",
      placeholder: "口味、分量、配送、包装…欢迎告诉我们",
      tags: ["希望多送餐具", "包装可以更好", "希望出新品", "配送很快", "味道很赞"],
    },
  },

  /* ============ 场景三：奶茶 / 咖啡点单（带规格，能下单） ============ */
  drinks: {
    theme: { mode: "dark", accent: "#c98a3c" },
    brand: "拾光茶饮",
    sub: "现point现做 · 自取/外送",
    notice: "第二杯半价，每日 14:00–17:00 下午茶时段",
    dateMode: false,
    ordering: true,
    needAddress: false,
    categories: [
      { id: "all", name: "全部" },
      { id: "milk", name: "奶茶" },
      { id: "fruit", name: "果茶" },
      { id: "coffee", name: "咖啡" },
    ],
    dishes: [
      { id: "d1", cat: "milk", name: "招牌厚乳茶", price: 16, unit: "杯", tags: ["招牌"], rating: 4.9,
        thumb: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&q=70",
        desc: "锡兰红茶打底，厚乳绵密，回甘不腻。",
        specs: [
          { label: "杯型", values: ["中杯", "大杯 +3"] },
          { label: "温度", values: ["去冰", "少冰", "正常冰"] },
          { label: "甜度", values: ["无糖", "三分糖", "五分糖", "全糖"] },
          { label: "加料", values: ["不加", "珍珠 +2", "椰果 +2", "布丁 +3"] },
        ],
        reviews: [{ name: "顾**", stars: 5, text: "厚乳很香，三分糖刚好。", date: "06-25" }] },
      { id: "d2", cat: "milk", name: "黑糖珍珠鲜奶", price: 18, unit: "杯", tags: ["热销"], rating: 4.8,
        thumb: "https://images.unsplash.com/photo-1525803377221-4f6ccb5a6f1f?w=400&q=70",
        desc: "黑糖珍珠现煮，挂壁鲜奶，香甜软糯。",
        specs: [
          { label: "杯型", values: ["中杯", "大杯 +3"] },
          { label: "温度", values: ["去冰", "少冰", "正常冰"] },
          { label: "甜度", values: ["三分糖", "五分糖", "全糖"] },
        ],
        reviews: [{ name: "钱**", stars: 5, text: "珍珠很 Q，黑糖香。", date: "06-24" }] },
      { id: "d3", cat: "fruit", name: "满杯杨枝甘露", price: 19, unit: "杯", tags: ["当季"], rating: 4.9,
        thumb: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=70",
        desc: "芒果西柚现切，西米弹牙，清爽解腻。",
        specs: [
          { label: "杯型", values: ["中杯", "大杯 +3"] },
          { label: "温度", values: ["去冰", "少冰"] },
          { label: "甜度", values: ["三分糖", "五分糖"] },
        ],
        reviews: [{ name: "孙**", stars: 5, text: "料超多，芒果很甜。", date: "06-23" }] },
      { id: "d4", cat: "fruit", name: "鲜橙气泡茶", price: 15, unit: "杯", tags: ["0 脂"], rating: 4.6,
        thumb: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=70",
        desc: "鲜橙搭气泡，清爽冒泡，夏日必点。",
        specs: [
          { label: "杯型", values: ["中杯", "大杯 +3"] },
          { label: "温度", values: ["去冰", "少冰"] },
          { label: "甜度", values: ["无糖", "三分糖", "五分糖"] },
        ],
        reviews: [{ name: "李**", stars: 4, text: "气泡感足，挺解渴。", date: "06-22" }] },
      { id: "d5", cat: "coffee", name: "生椰拿铁", price: 17, unit: "杯", tags: ["人气"], rating: 4.8,
        thumb: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=70",
        desc: "意式浓缩配生椰乳，丝滑椰香。",
        specs: [
          { label: "杯型", values: ["中杯", "大杯 +3"] },
          { label: "温度", values: ["冰", "热"] },
          { label: "甜度", values: ["无糖", "三分糖", "五分糖"] },
        ],
        reviews: [{ name: "周**", stars: 5, text: "椰香浓，不齁。", date: "06-25" }] },
      { id: "d6", cat: "coffee", name: "美式（冷萃）", price: 13, unit: "杯", tags: ["0 糖"], rating: 4.5,
        thumb: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=70",
        desc: "12 小时冷萃，果酸明亮，提神不苦。",
        specs: [
          { label: "杯型", values: ["中杯", "大杯 +3"] },
          { label: "温度", values: ["冰", "热"] },
        ],
        reviews: [{ name: "吴**", stars: 4, text: "冷萃顺口，续命神器。", date: "06-21" }] },
    ],
    feedback: {
      title: "给门店提建议",
      placeholder: "口味、甜度、出餐速度、新品…都想听听",
      tags: ["希望出新品", "甜度再细分", "出餐慢了点", "包装很好看", "味道很赞"],
    },
  },

};
