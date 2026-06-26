/* 找房小程序配置 —— 换城市/换业务只改这份
 *
 * 两种模式共用骨架：搜索/地图/地铁找房 → 房源详情 → 预约看房(手机号登录) → 在线咨询/签约。
 *   mode      "二手房" | "租房"（影响价格单位与文案）
 *   priceUnit "万" | "元/月"
 *   filters   区域 / 价格 / 户型 筛选项
 *   districts 地图找房用：每个板块在示意地图上的位置(x%,y%)，气泡显示均价由房源算
 *   subway    地铁找房用：线路(名/色/站点)
 *   listings  房源：户型/面积/朝向/楼层/小区/标签/经纪人/所属板块与地铁站/地图坐标(mx,my %)
 */
window.REALTY_CONFIGS = {

  buy: {
    theme: { accent: "#fa5741" },
    brand: "安家找房", city: "上海", mode: "二手房", priceUnit: "万",
    filters: {
      regions: ["全部", "徐汇", "静安", "浦东", "杨浦", "闵行"],
      prices: ["不限", "300万以下", "300-500万", "500-800万", "800万以上"],
      rooms: ["不限", "1室", "2室", "3室", "4室+"],
    },
    districts: [
      { name: "徐汇", mx: 30, my: 62 }, { name: "静安", mx: 46, my: 40 },
      { name: "浦东", mx: 72, my: 56 }, { name: "杨浦", mx: 60, my: 26 }, { name: "闵行", mx: 22, my: 82 },
    ],
    subway: {
      lines: [
        { name: "1号线", color: "#e3002b", stations: ["徐家汇", "衡山路", "常熟路", "陕西南路", "人民广场", "上海火车站"] },
        { name: "2号线", color: "#8cc220", stations: ["中山公园", "静安寺", "南京西路", "人民广场", "陆家嘴", "世纪大道"] },
        { name: "10号线", color: "#c6afd4", stations: ["虹桥路", "上海图书馆", "陕西南路", "新天地", "五角场", "同济大学"] },
      ],
    },
    listings: [
      { id: "h1", region: "徐汇", district: "徐汇", subwayStations: ["徐家汇", "衡山路"], mx: 30, my: 62,
        title: "衡山路 精装两房 满五唯一 看房方便", community: "建岚公寓",
        cover: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=70",
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=70", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=70"],
        price: 698, unitPrice: 98000, rooms: "2室1厅", area: 71, floor: "中楼层/6层", orient: "朝南", year: 2008,
        tags: ["满五唯一", "精装修", "近地铁"], features: ["地铁 5 分钟", "南北通透", "随时看房"],
        desc: "业主诚心出售，户型方正南北通透，精装保养好，临近徐家汇商圈，地铁 1/9/11 号线。",
        agent: { name: "王磊", badge: "王", rating: 4.9, sales: 128 } },
      { id: "h2", region: "静安", district: "静安", subwayStations: ["静安寺", "南京西路"], mx: 46, my: 40,
        title: "静安寺核心 经典三房 商圈环抱", community: "静安丽舍",
        cover: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=70",
        images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=70"],
        price: 1280, unitPrice: 132000, rooms: "3室2厅", area: 97, floor: "高楼层/18层", orient: "朝南", year: 2012,
        tags: ["地铁口", "商圈", "高楼层"], features: ["双地铁", "视野开阔", "品牌物业"],
        desc: "静安寺顶级地段，三房两卫，高区采光极佳，商场公园环绕，稀缺好房。",
        agent: { name: "李娜", badge: "李", rating: 4.8, sales: 96 } },
      { id: "h3", region: "浦东", district: "浦东", subwayStations: ["陆家嘴", "世纪大道"], mx: 72, my: 56,
        title: "陆家嘴 一线江景 高区豪装大平层", community: "滨江一号",
        cover: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=70",
        images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=70"],
        price: 3200, unitPrice: 185000, rooms: "4室2厅", area: 173, floor: "高楼层/42层", orient: "朝南", year: 2016,
        tags: ["江景", "豪装", "大平层"], features: ["一线江景", "豪华装修", "5A 物业"],
        desc: "陆家嘴滨江豪宅，270° 江景，顶级装修拎包入住，圈层私密。",
        agent: { name: "张伟", badge: "张", rating: 5.0, sales: 64 } },
      { id: "h4", region: "杨浦", district: "杨浦", subwayStations: ["五角场", "同济大学"], mx: 60, my: 26,
        title: "五角场 学区两房 总价友好 诚售", community: "国和苑",
        cover: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=70",
        images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=70"],
        price: 458, unitPrice: 76000, rooms: "2室1厅", area: 60, floor: "低楼层/6层", orient: "朝南", year: 2005,
        tags: ["学区", "总价低", "近商圈"], features: ["对口小学", "五角场商圈", "总价友好"],
        desc: "五角场成熟社区，对口优质学区，总价友好适合刚需，地铁 10 号线。",
        agent: { name: "陈静", badge: "陈", rating: 4.7, sales: 142 } },
      { id: "h5", region: "徐汇", district: "徐汇", subwayStations: ["上海图书馆", "衡山路"], mx: 34, my: 58,
        title: "高安路 花园洋房 复式三房 闹中取静", community: "高安花园",
        cover: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600&q=70",
        images: ["https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600&q=70"],
        price: 1880, unitPrice: 145000, rooms: "3室2厅", area: 129, floor: "复式/2层", orient: "朝南", year: 1998,
        tags: ["花园洋房", "复式", "稀缺"], features: ["独立花园", "复式格局", "梧桐街区"],
        desc: "衡复风貌区花园洋房，带独立小花园，复式三房，闹中取静，极具收藏价值。",
        agent: { name: "王磊", badge: "王", rating: 4.9, sales: 128 } },
      { id: "h6", region: "闵行", district: "闵行", subwayStations: ["虹桥路"], mx: 22, my: 82,
        title: "莘庄 满二两房 拎包入住 性价比高", community: "春申景城",
        cover: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=70",
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=70"],
        price: 388, unitPrice: 52000, rooms: "2室2厅", area: 74, floor: "中楼层/11层", orient: "朝南", year: 2010,
        tags: ["满二", "性价比", "近地铁"], features: ["地铁 5 号线", "社区成熟", "拎包入住"],
        desc: "莘庄成熟大社区，两房两卫户型实用，满二省税，性价比之选。",
        agent: { name: "李娜", badge: "李", rating: 4.8, sales: 96 } },
    ],
  },

  rent: {
    theme: { accent: "#1a9c6b" },
    brand: "安家租房", city: "上海", mode: "租房", priceUnit: "元/月",
    filters: {
      regions: ["全部", "徐汇", "静安", "浦东", "杨浦", "闵行"],
      prices: ["不限", "3000以下", "3000-5000", "5000-8000", "8000以上"],
      rooms: ["不限", "整租", "合租", "1室", "2室"],
    },
    districts: [
      { name: "徐汇", mx: 30, my: 62 }, { name: "静安", mx: 46, my: 40 },
      { name: "浦东", mx: 72, my: 56 }, { name: "杨浦", mx: 60, my: 26 }, { name: "闵行", mx: 22, my: 82 },
    ],
    subway: {
      lines: [
        { name: "1号线", color: "#e3002b", stations: ["徐家汇", "衡山路", "常熟路", "人民广场", "上海火车站"] },
        { name: "2号线", color: "#8cc220", stations: ["中山公园", "静安寺", "南京西路", "陆家嘴", "世纪大道"] },
        { name: "10号线", color: "#c6afd4", stations: ["虹桥路", "上海图书馆", "新天地", "五角场"] },
      ],
    },
    listings: [
      { id: "r1", region: "徐汇", district: "徐汇", subwayStations: ["徐家汇"], mx: 30, my: 62,
        title: "徐家汇 整租一室 精装 拎包入住", community: "汇成新苑",
        cover: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=70",
        images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=70"],
        price: 6500, unitPrice: 0, rooms: "整租·1室", area: 48, floor: "中楼层/12层", orient: "朝南", year: 2015,
        tags: ["整租", "精装", "近地铁"], features: ["地铁 3 分钟", "拎包入住", "押一付一可谈"],
        desc: "徐家汇商圈整租一室，精装家电齐全，拎包入住，随时看房。",
        agent: { name: "王磊", badge: "王", rating: 4.9, sales: 128 } },
      { id: "r2", region: "静安", district: "静安", subwayStations: ["静安寺", "南京西路"], mx: 46, my: 40,
        title: "静安寺 合租主卧 带独卫 室友友好", community: "静安丽舍",
        cover: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=70",
        images: ["https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=70"],
        price: 3800, unitPrice: 0, rooms: "合租·主卧", area: 18, floor: "高楼层/16层", orient: "朝南", year: 2013,
        tags: ["合租", "独卫", "地铁口"], features: ["带独立卫生间", "公区宽敞", "管家服务"],
        desc: "静安寺合租主卧带独卫，室友素质高，公区干净，近双地铁。",
        agent: { name: "李娜", badge: "李", rating: 4.8, sales: 96 } },
      { id: "r3", region: "浦东", district: "浦东", subwayStations: ["世纪大道", "陆家嘴"], mx: 72, my: 56,
        title: "世纪大道 整租两房 看江 高区", community: "滨江一号",
        cover: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&q=70",
        images: ["https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&q=70"],
        price: 12000, unitPrice: 0, rooms: "整租·2室", area: 89, floor: "高楼层/35层", orient: "朝南", year: 2016,
        tags: ["整租", "江景", "高区"], features: ["一线江景", "豪华装修", "5A 物业"],
        desc: "陆家嘴整租两房，高区看江，豪装家电全，品质租住之选。",
        agent: { name: "张伟", badge: "张", rating: 5.0, sales: 64 } },
      { id: "r4", region: "杨浦", district: "杨浦", subwayStations: ["五角场"], mx: 60, my: 26,
        title: "五角场 整租一室 总价友好 近大学", community: "国和苑",
        cover: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=600&q=70",
        images: ["https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=600&q=70"],
        price: 4200, unitPrice: 0, rooms: "整租·1室", area: 42, floor: "低楼层/5层", orient: "朝南", year: 2008,
        tags: ["整租", "性价比", "近高校"], features: ["五角场商圈", "生活方便", "可短租"],
        desc: "五角场整租一室，临近高校与商圈，生活便利，性价比高。",
        agent: { name: "陈静", badge: "陈", rating: 4.7, sales: 142 } },
    ],
  },

};
