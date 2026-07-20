/* 视觉系作品集小程序（摄影工作室 · 杂志风）· 演示数据
 * 配置驱动：换工作室 = 改这份配置（品牌/风格类别/作品/文案/联系方式），页面与动效不动。
 * 占位海报由代码按每个作品的色调自动生成（示意构图与色调），交付时替换为工作室真实成片。
 */
window.PS_CONFIGS = {
  /* ===== 场景一：人像摄影 · 暗调编辑部风（SANJING 式） ===== */
  sanjing: {
    brand: "叁景视觉",
    logo: "SANJING",
    theme: { accent: "#c9a96a", mode: "dark" },
    searchHint: "搜索作品 / 风格 / 系列编号",
    studio: {
      name: "叁景视觉艺术工作室",
      short: "叁景视觉",
      since: "“叁景视觉艺术工作室成立于2020年八月”",
      intro: [
        "以景为序，以光为笔，以镜为媒。",
        "专注人像摄影，提供化妆造型、场景置景、专业拍摄一站式服务。",
        "定格每一份独属于你的质感与情绪，留存有温度的视觉影像。",
      ],
      addr: "广东省茂名市茂南区站前西路19号（演示地址）",
      phone: "0668-888 8888",
      wechat: "sanjing_studio2020",
    },
    cats: [
      { id: "sen",  name: "森系氛围", stats: { v: "113545", l: "13678", c: "6678" } },
      { id: "han",  name: "韩系简约", stats: { v: "86220",  l: "9021",  c: "3125" } },
      { id: "guo",  name: "国风古典", stats: { v: "97102",  l: "11540", c: "4302" } },
      { id: "city", name: "都市胶片", stats: { v: "64380",  l: "7228",  c: "2210" } },
    ],
    works: [
      { id: "fs01", code: "Fs-01", cat: "sen", title: "森系 · 雾中白", en: "Forest Series · White in the Mist",
        c1: "#46583f", c2: "#1d2a1c", ink: "#ece7d3", likes: 13678,
        paras: [
          { v: 1, cap: "薄雾般的白纱与森绿相遇，肤色通透，发间点缀白色花瓣，安宁又自然。" },
          { v: 2, cap: "前景虚化的花枝作障景，半身构图温柔而沉静，情绪徐徐展开。" },
          { v: 3, cap: "留白与低饱和统一色调，胶片颗粒收束整组的呼吸感。" },
        ] },
      { id: "fs02", code: "Fs-02", cat: "sen", title: "森系 · 苔与雾", en: "Forest Series · Moss & Fog",
        c1: "#3a4a36", c2: "#141d16", ink: "#e2e0cd", likes: 8120,
        paras: [
          { v: 1, cap: "深绿苔色作底，光从枝叶缝隙落下，人物与环境彼此呼吸。" },
          { v: 2, cap: "侧逆光勾勒轮廓，湿润空气里的颗粒感是这组的底色。" },
        ] },
      { id: "hs01", code: "Hs-01", cat: "han", title: "韩系 · 奶油白", en: "Korean Series · Cream White",
        c1: "#cfc3b1", c2: "#8f8576", ink: "#2c2721", likes: 9021,
        paras: [
          { v: 1, cap: "奶油色墙面与柔光箱，干净的影调里只留表情。" },
          { v: 2, cap: "淡妆与米白针织，低对比让皮肤像被晨光洗过。" },
        ] },
      { id: "hs02", code: "Hs-02", cat: "han", title: "韩系 · 午后胶片", en: "Korean Series · Afternoon Film",
        c1: "#b9a794", c2: "#6e6152", ink: "#f4efe4", likes: 6612,
        paras: [
          { v: 1, cap: "窗边的午后，暖调胶片把日常拍成值得收藏的样子。" },
          { v: 2, cap: "一杯茶、一本书，松弛感是韩系写真的关键词。" },
        ] },
      { id: "gf01", code: "Gf-01", cat: "guo", title: "国风 · 朱砂", en: "Oriental Series · Cinnabar",
        c1: "#8c2f2f", c2: "#341112", ink: "#f2d9a6", likes: 11540,
        paras: [
          { v: 1, cap: "朱砂红与鎏金相衬，盘发点翠，端庄里藏着一点艳。" },
          { v: 2, cap: "手持团扇半遮面，古典构图讲究藏与露的分寸。" },
        ] },
      { id: "gf02", code: "Gf-02", cat: "guo", title: "国风 · 青绿山水", en: "Oriental Series · Landscape Green",
        c1: "#3f6f63", c2: "#16281f", ink: "#e9e4c9", likes: 7845,
        paras: [
          { v: 1, cap: "取青绿山水设色，衣袂如画卷展开，人物立于其间。" },
          { v: 2, cap: "大面积留白模拟绢本质感，东方审美的呼吸留在画外。" },
        ] },
      { id: "ct01", code: "Ct-01", cat: "city", title: "都市 · 夜色霓虹", en: "City Series · Neon Night",
        c1: "#3c4257", c2: "#131622", ink: "#dfe4f2", likes: 7228,
        paras: [
          { v: 1, cap: "霓虹作光源，雨后街面反光，都市夜里每个人都是主角。" },
          { v: 2, cap: "冷暖对撞的色温差，是夜景人像的戏剧感来源。" },
        ] },
      { id: "ct02", code: "Ct-02", cat: "city", title: "都市 · 黑白光影", en: "City Series · B&W Light",
        c1: "#5a5a5e", c2: "#151517", ink: "#efefef", likes: 5310,
        paras: [
          { v: 1, cap: "去掉颜色之后，只剩结构、光比与情绪。" },
          { v: 2, cap: "百叶窗光影切割画面，经典的黑白语言不过时。" },
        ] },
    ],
  },

  /* ===== 场景二：婚纱旅拍 · 亮调（换一份配置 = 换一家店） ===== */
  wedding: {
    brand: "白露婚纱",
    logo: "LUMIERE",
    theme: { accent: "#b98a5e", mode: "light" },
    searchHint: "搜索系列 / 目的地 / 档期",
    studio: {
      name: "白露 LUMIÈRE 婚纱摄影",
      short: "白露婚纱",
      since: "“把一生一次的仪式，拍成可以传家的影像”",
      intro: [
        "从礼服、跟妆到旅拍路线，一支团队全程随行。",
        "教堂、海岸、山野与城市，四条成熟旅拍线路可选。",
        "底片全送，精修不限次，只为交付值得装裱的那一张。",
      ],
      addr: "深圳市南山区海上世界文化艺术中心 L2（演示地址）",
      phone: "0755-666 6666",
      wechat: "lumiere_wedding",
    },
    cats: [
      { id: "wed",  name: "婚纱系列", stats: { v: "203401", l: "25640", c: "9870" } },
      { id: "trip", name: "旅拍系列", stats: { v: "156730", l: "18251", c: "7432" } },
      { id: "fam",  name: "亲子系列", stats: { v: "88210",  l: "10240", c: "3661" } },
    ],
    works: [
      { id: "we01", code: "We-01", cat: "wed", title: "教堂 · 圣白", en: "Wedding · Chapel White",
        c1: "#ece5da", c2: "#b8ac9c", ink: "#4a4034", likes: 25640,
        paras: [
          { v: 1, cap: "穹顶光自上而下，白纱的层次在逆光里一寸寸展开。" },
          { v: 2, cap: "誓言时刻用长焦远远记录，不打扰才有真实的眼泪。" },
        ] },
      { id: "we02", code: "We-02", cat: "wed", title: "海岸 · 蓝调时刻", en: "Wedding · Blue Hour",
        c1: "#6f87a3", c2: "#2b3a4d", ink: "#f2ede2", likes: 18730,
        paras: [
          { v: 1, cap: "日落后二十分钟的蓝调天光，是海边婚纱最贵的布景。" },
          { v: 2, cap: "裙摆与海风合作，一张照片里能听见浪。" },
        ] },
      { id: "tr01", code: "Tr-01", cat: "trip", title: "旅拍 · 山野", en: "Travel · Into the Wild",
        c1: "#7d8b6a", c2: "#39412e", ink: "#f0ecdd", likes: 12251,
        paras: [
          { v: 1, cap: "把婚纱穿进山野，风声与快门声都是背景乐。" },
          { v: 2, cap: "越野车、帐篷与篝火，纪实感的旅拍更耐看。" },
        ] },
      { id: "tr02", code: "Tr-02", cat: "trip", title: "旅拍 · 城市漫游", en: "Travel · City Walk",
        c1: "#c2b3a2", c2: "#6b5d4e", ink: "#2f2820", likes: 9660,
        paras: [
          { v: 1, cap: "老街、电车与转角咖啡店，把恋爱日常拍成电影截帧。" },
          { v: 2, cap: "抓拍优先，摆拍只是热身。" },
        ] },
      { id: "fa01", code: "Fa-01", cat: "fam", title: "亲子 · 暖阳", en: "Family · Warm Sun",
        c1: "#d9b98c", c2: "#8a6a42", ink: "#3c2d1a", likes: 10240,
        paras: [
          { v: 1, cap: "下午四点的太阳最懂小朋友，逆光里的碎发都在发光。" },
          { v: 2, cap: "不喊口令，跟着孩子跑，笑声自己会进画面。" },
        ] },
      { id: "fa02", code: "Fa-02", cat: "fam", title: "亲子 · 童话页", en: "Family · Fairy Tale",
        c1: "#a3b8ad", c2: "#4c6156", ink: "#f4f1e6", likes: 8115,
        paras: [
          { v: 1, cap: "把绘本里的场景搬进影棚，一家三口住进童话某一页。" },
        ] },
    ],
  },
};
