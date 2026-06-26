/* 同城活动 / 周边活动报名拼团 通用小程序配置 —— 换社区只改这份
 *
 * 三个内置社区共用一套骨架：首页活动流 → 活动详情 → 报名/上车（微信手机号登录）→ 报名成功；
 * 还能「发起活动」（组织者建活动招人）。换社区改 theme/brand/categories/activities 即可。
 *
 * activity 字段：
 *   id,cat   活动 id 与所属筛选分类
 *   title,cover,tags
 *   organizer{ name, badge, views }    发起人
 *   date,time,place,distance,price     时间/地点/距离/人均
 *   capacity,joined                    限额 / 已报名人数
 *   avatars[]                          已报名头像（取首字）
 *   highlights[]  includes[]  desc     亮点 / 包含 / 详情
 */
window.EVENT_CONFIGS = {

  /* ============ 同城社交（深圳周末活动，对齐截图） ============ */
  city: {
    theme: { accent: "#19b36b" },
    brand: "享趣周边",
    city: "深圳",
    slogan: "找搭子，一起出发",
    banner: { title: "暑趣模式开启", sub: "周末别躺平 · 上车找搭子", color: "#19b36b" },
    categories: [
      { icon: "🏕️", name: "露营烧烤" }, { icon: "🎲", name: "桌游剧本" }, { icon: "🥾", name: "徒步爬山" },
      { icon: "🎤", name: "Livehouse" }, { icon: "🛼", name: "运动局" }, { icon: "🍲", name: "饭搭子" },
      { icon: "📷", name: "City Walk" }, { icon: "🎉", name: "派对交友" },
    ],
    filters: ["全部", "活动派对", "户外", "同好交友", "运动"],
    activities: [
      { id: "c1", cat: "活动派对", title: "拒绝躺平！一场「撕名牌+躲猫猫」大作战", cover: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=70",
        tags: ["主题体验", "陌生人social"], organizer: { name: "婷婷", badge: "婷", views: 1086 },
        date: "06-26 周五", time: "19:00 - 21:30", place: "深圳北站 · 中心公园", distance: "10.66km", price: 38, capacity: 20, joined: 12,
        avatars: ["阿", "K", "丸", "蓉", "豆", "九", "冯", "陈", "周", "吴", "郑", "孙"],
        highlights: ["破冰小游戏，社恐友好", "撕名牌 + 躲猫猫双玩法", "赢家有神秘小奖品"],
        includes: ["场地与道具", "领队带队", "饮用水"], desc: "周五晚来释放一周压力！分队 PK，轻松认识新朋友，社恐也能玩开。迟到不等人，记得准时上车～" },
      { id: "c2", cat: "户外", title: "周末出逃计划 · 露营烧烤肉局", cover: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=70",
        tags: ["主题体验", "露营"], organizer: { name: "椰椰", badge: "椰", views: 916 },
        date: "06-27 周六", time: "15:30 - 22:30", place: "大学城 · 营地", distance: "14.5km", price: 128, capacity: 16, joined: 9,
        avatars: ["林", "M", "猫", "卡", "图", "九", "顾", "钱", "孙"],
        highlights: ["天幕 + 桌椅全配好", "无限畅吃烧烤食材", "草坪游戏 + 音响"],
        includes: ["营地与装备", "烧烤食材", "饮料"], desc: "把城市留在身后，草坪、天幕、烤串和音乐，朋友是现场认识的。带上好心情就行，装备我们全包。" },
      { id: "c3", cat: "同好交友", title: "桌游剧本之夜 · 微醺推理局", cover: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&q=70",
        tags: ["桌游", "微醺"], organizer: { name: "阿楷", badge: "楷", views: 642 },
        date: "06-27 周六", time: "19:30 - 23:00", place: "南山 · 桌游吧", distance: "6.2km", price: 68, capacity: 12, joined: 7,
        avatars: ["丸", "T", "豆", "九", "冯", "陈", "周"],
        highlights: ["新手本 + 进阶本都有", "DM 带本不冷场", "一杯特调随本送"],
        includes: ["桌游/剧本", "DM 主持", "特调一杯"], desc: "不尬聊，靠游戏破冰。新手友好，DM 全程带节奏，散场常常一起约下一场。" },
      { id: "c4", cat: "运动", title: "周日晨间飞盘 · 新手友好局", cover: "https://images.unsplash.com/photo-1591491653056-4313c1b6c9bb?w=600&q=70",
        tags: ["飞盘", "运动social"], organizer: { name: "Leo", badge: "L", views: 503 },
        date: "06-28 周日", time: "09:00 - 11:00", place: "深圳湾 · 体育公园", distance: "8.1km", price: 45, capacity: 18, joined: 14,
        avatars: ["阿", "K", "蓉", "豆", "九", "冯", "陈", "周", "吴", "郑", "孙", "钱", "顾", "林"],
        highlights: ["专业教练教规则", "分队对抗不站桩", "运动 + 拍照两不误"],
        includes: ["飞盘与标志桶", "教练带队", "运动饮料"], desc: "零基础也能上手的飞盘局，跑起来认识新朋友。记得穿运动鞋，做好热身～" },
      { id: "c5", cat: "户外", title: "City Walk · 老街区咖啡漫游", cover: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=70",
        tags: ["City Walk", "摄影"], organizer: { name: "小鹿", badge: "鹿", views: 388 },
        date: "06-28 周日", time: "16:00 - 18:30", place: "蛇口 · 老街", distance: "9.3km", price: 30, capacity: 15, joined: 6,
        avatars: ["丸", "蓉", "豆", "九", "冯", "陈"],
        highlights: ["小众机位边走边拍", "两家宝藏咖啡馆", "出片率超高"],
        includes: ["领队讲解", "拍照指导"], desc: "慢下来逛逛老城区，咖啡香里聊聊天、拍拍照，适合一个人来认识同好。" },
      { id: "c6", cat: "活动派对", title: "周六夜 · 天台微醺音乐派对", cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=70",
        tags: ["派对", "音乐"], organizer: { name: "Mia", badge: "M", views: 1203 },
        date: "06-27 周六", time: "20:00 - 23:30", place: "福田 · 天台 Bar", distance: "5.0km", price: 88, capacity: 30, joined: 21,
        avatars: ["阿", "K", "丸", "蓉", "豆", "九", "冯", "陈", "周", "吴", "郑", "孙", "钱", "顾", "林", "猫", "图", "卡", "T", "九", "婷"],
        highlights: ["DJ 现场 + 天台夜景", "一杯欢迎特调", "社交游戏破冰"],
        includes: ["入场 + 一杯特调", "DJ/音响", "拍立得"], desc: "城市夜景 + 微醺 + 音乐，认识有趣的人。穿得好看点，今晚的主角是你。" },
    ],
  },

  /* ============ 亲子活动 ============ */
  kids: {
    theme: { accent: "#ff7aa2" },
    brand: "蚂蚁亲子",
    city: "深圳",
    slogan: "陪孩子，过有趣的一天",
    banner: { title: "暑期亲子季", sub: "遛娃不无聊 · 边玩边长大", color: "#ff7aa2" },
    categories: [
      { icon: "🌱", name: "自然探索" }, { icon: "🎨", name: "手工艺术" }, { icon: "🔬", name: "科学实验" },
      { icon: "🐑", name: "农场牧场" }, { icon: "🏊", name: "亲子运动" }, { icon: "📚", name: "绘本故事" },
      { icon: "🎂", name: "生日派对" }, { icon: "🚜", name: "户外营地" },
    ],
    filters: ["全部", "自然探索", "手工艺术", "科学实验", "运动"],
    activities: [
      { id: "k1", cat: "自然探索", title: "红树林湿地 · 小小观鸟家", cover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=70",
        tags: ["自然", "3-8岁"], organizer: { name: "豆豆老师", badge: "豆", views: 742 },
        date: "06-28 周日", time: "09:30 - 11:30", place: "福田 · 红树林", distance: "7.4km", price: 99, capacity: 12, joined: 8,
        avatars: ["乐", "朵", "可", "honey", "小", "果", "甜", "麦"],
        highlights: ["专业自然老师带队", "望远镜 + 观察手册", "认识 10 种水鸟"],
        includes: ["观察装备", "自然老师", "活动手册"], desc: "带孩子走进湿地，用望远镜观察水鸟，边玩边认识大自然。一位家长陪同一个孩子。" },
      { id: "k2", cat: "手工艺术", title: "亲子陶艺 · 捏一只你的小怪兽", cover: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=70",
        tags: ["手工", "4-10岁"], organizer: { name: "可可老师", badge: "可", views: 531 },
        date: "06-27 周六", time: "14:00 - 16:00", place: "南山 · 美学空间", distance: "6.0km", price: 128, capacity: 10, joined: 5,
        avatars: ["乐", "朵", "可", "小", "果"],
        highlights: ["手工陶泥安全无毒", "成品可烧制带走", "锻炼专注与想象"],
        includes: ["陶泥与工具", "老师指导", "烧制邮寄"], desc: "和孩子一起捏陶，做一只独一无二的小怪兽。成品烧好后寄到家。" },
      { id: "k3", cat: "科学实验", title: "小小科学家 · 火山喷发实验课", cover: "https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=600&q=70",
        tags: ["科学", "5-10岁"], organizer: { name: "麦克老师", badge: "麦", views: 689 },
        date: "06-28 周日", time: "10:00 - 11:30", place: "南山 · 科学馆", distance: "8.8km", price: 88, capacity: 16, joined: 11,
        avatars: ["乐", "朵", "可", "honey", "小", "果", "甜", "麦", "壮", "丁", "宝"],
        highlights: ["亲手做火山喷发", "趣味讲解原理", "每人一套实验器材"],
        includes: ["实验器材", "科学老师", "小白褂"], desc: "通过动手实验认识化学反应，孩子边惊呼边学习。器材人手一份，安全放心。" },
      { id: "k4", cat: "运动", title: "亲子飞盘 · 草坪运动会", cover: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=70",
        tags: ["运动", "5-12岁"], organizer: { name: "Sam 教练", badge: "S", views: 412 },
        date: "06-29 周一", time: "16:30 - 18:00", place: "深圳湾公园", distance: "8.1km", price: 59, capacity: 20, joined: 9,
        avatars: ["乐", "朵", "可", "小", "果", "甜", "麦", "壮", "丁"],
        highlights: ["亲子配合小游戏", "教练带队不枯燥", "运动出汗长个子"],
        includes: ["飞盘器材", "专业教练", "饮用水"], desc: "和孩子组队玩飞盘，增进默契还能锻炼身体。建议穿运动装备。" },
    ],
  },

  /* ============ 户外露营 / 徒步 ============ */
  outdoor: {
    theme: { accent: "#2f9e7e" },
    brand: "山系周末",
    city: "深圳",
    slogan: "走进山野，过个野周末",
    banner: { title: "山野计划", sub: "徒步 · 露营 · 溯溪", color: "#2f9e7e" },
    categories: [
      { icon: "🥾", name: "徒步" }, { icon: "🏕️", name: "露营" }, { icon: "💦", name: "溯溪" },
      { icon: "🚵", name: "骑行" }, { icon: "🧗", name: "攀岩" }, { icon: "🌊", name: "海岛" },
      { icon: "🔥", name: "篝火" }, { icon: "📸", name: "风光摄影" },
    ],
    filters: ["全部", "徒步", "露营", "溯溪", "海岛"],
    activities: [
      { id: "o1", cat: "徒步", title: "梧桐山徒步 · 看云海日出", cover: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=70",
        tags: ["徒步", "中级"], organizer: { name: "老鹰领队", badge: "鹰", views: 1320 },
        date: "06-28 周日", time: "04:30 - 10:00", place: "罗湖 · 梧桐山", distance: "12.0km", price: 79, capacity: 25, joined: 18,
        avatars: ["阿", "K", "丸", "蓉", "豆", "九", "冯", "陈", "周", "吴", "郑", "孙", "钱", "顾", "林", "猫", "图", "卡"],
        highlights: ["资深领队 + 收队", "看日出云海", "全程对讲机保障"],
        includes: ["领队与保险", "对讲机", "能量补给"], desc: "夜爬看日出，登顶那一刻全值了。需一定体力，新手请量力，装备清单报名后发群。" },
      { id: "o2", cat: "露营", title: "西涌海边露营 · 听海入眠", cover: "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=600&q=70",
        tags: ["露营", "海边"], organizer: { name: "海风", badge: "海", views: 980 },
        date: "06-27 周六", time: "16:00 - 次日 09:00", place: "大鹏 · 西涌", distance: "42km", price: 198, capacity: 20, joined: 13,
        avatars: ["林", "M", "猫", "卡", "图", "九", "顾", "钱", "孙", "阿", "K", "丸", "蓉"],
        highlights: ["海景营位 + 天幕", "海鲜烧烤 + 篝火", "看星星听海浪"],
        includes: ["营地装备", "晚餐烧烤", "早餐"], desc: "在海边搭帐篷过夜，傍晚烧烤、夜里篝火、清晨看日出。装备餐食全包，拎包入住。" },
      { id: "o3", cat: "溯溪", title: "清凉溯溪 · 七娘山秘境", cover: "https://images.unsplash.com/photo-1623874228601-f4193c7b1818?w=600&q=70",
        tags: ["溯溪", "戏水"], organizer: { name: "溪哥", badge: "溪", views: 654 },
        date: "06-29 周一", time: "08:30 - 15:00", place: "大鹏 · 七娘山", distance: "48km", price: 138, capacity: 16, joined: 7,
        avatars: ["丸", "蓉", "豆", "九", "冯", "陈", "周"],
        highlights: ["山涧戏水超清凉", "专业领队 + 安全绳", "天然滑梯 + 跳水潭"],
        includes: ["溯溪装备", "领队与保险", "午餐"], desc: "夏天就要玩水！溯溪穿越山涧，清凉刺激。需穿溯溪鞋（可租），不会游泳也能玩。" },
      { id: "o4", cat: "海岛", title: "杨梅坑骑行 + 海岛跳岛", cover: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600&q=70",
        tags: ["骑行", "海岛"], organizer: { name: "阿浪", badge: "浪", views: 845 },
        date: "06-28 周日", time: "09:00 - 16:00", place: "大鹏 · 杨梅坑", distance: "45km", price: 158, capacity: 18, joined: 10,
        avatars: ["阿", "K", "蓉", "豆", "九", "冯", "陈", "周", "吴", "郑"],
        highlights: ["最美海岸线骑行", "快艇跳岛 + 浮潜", "海鲜午餐"],
        includes: ["单车租赁", "快艇 + 浮潜", "午餐"], desc: "骑行《美人鱼》取景地海岸线，再坐快艇跳岛浮潜。一天玩遍山海，出片拉满。" },
    ],
  },

};
