/* ✏️ 服务预约小程序 · 多行业配置
 *
 * 一份配置 = 一个行业的完整小程序。流程(首页→详情→预约→确认)是模板内置的，
 * 换行业只改这里：主题色、服务项(items)、预约表单字段(booking)、文案。
 *
 * 字段说明见 README。所有 ¥ 价格、图片均为占位，正式用换成客户的。
 */
window.BOOKING_CONFIGS = {

  /* ============ 陪诊 ============ */
  peizhen: {
    theme: { mode: "light", accent: "#2f9e8f" },
    brand: "暖陪诊", tagline: "专业陪诊 · 全程陪同就医",
    unitLabel: "服务", bookCta: "立即预约",
    hero: {
      eyebrow: "CARE · COMPANION",
      title: "看病不慌\n全程有人陪",
      sub: "专业陪诊师陪同挂号、就诊、取药、办手续，让家人安心。",
      img: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=900&q=80",
    },
    categories: [{ id: "all", name: "全部" }, { id: "pz", name: "陪诊" }, { id: "dl", name: "代办" }],
    items: [
      { id: "p1", cat: "pz", name: "半天陪诊", price: 198, unit: "/次", tags: ["3小时", "1对1"],
        thumb: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=500&q=80",
        desc: "陪诊师陪同挂号、候诊、就诊、缴费、取药，全程协助沟通，照顾行动不便的家人。",
        options: [{ label: "时长", values: ["半天 3 小时", "加钟 +1 小时"] }] },
      { id: "p2", cat: "pz", name: "全天陪诊", price: 358, unit: "/次", tags: ["6小时", "含跨院"],
        thumb: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=500&q=80",
        desc: "适合检查多、需跨科室或跨院的就诊安排，全天专属陪诊师协助。",
        options: [{ label: "陪诊师", values: ["普通陪诊师", "资深陪诊师 +80"] }] },
      { id: "p3", cat: "dl", name: "代取报告", price: 88, unit: "/次", tags: ["免排队"],
        thumb: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=500&q=80",
        desc: "代为排队取检查/化验报告并寄送或线上发给您，省去来回奔波。" },
      { id: "p4", cat: "dl", name: "代办手续", price: 128, unit: "/次", tags: ["住院/转诊"],
        thumb: "https://images.unsplash.com/photo-1554734867-bf3c00a49371?auto=format&fit=crop&w=500&q=80",
        desc: "代办住院登记、转诊、医保等手续，熟悉流程、少跑冤枉路。" },
    ],
    steps: [
      { t: "下单预约", d: "选服务、填就诊信息" },
      { t: "匹配陪诊师", d: "就近安排专业陪诊师" },
      { t: "陪同就医", d: "全程协助、实时同步" },
      { t: "完成结算", d: "服务结束线上确认" },
    ],
    booking: {
      dateLabel: "就诊日期",
      slots: ["上午", "下午"],
      extra: [
        { key: "hospital", label: "就诊医院", type: "text" },
        { key: "patient", label: "就诊人年龄", type: "stepper", min: 1, max: 120, value: 60 },
      ],
    },
    contact: { rows: [{ k: "客服电话", v: "400-120-0000" }, { k: "服务城市", v: "全国 30+ 城市" }] },
  },

  /* ============ 民宿预订 ============ */
  minsu: {
    theme: { mode: "cream", accent: "#9c6b3f" },
    brand: "山海民宿", tagline: "山海之间 · 把日子过成诗",
    unitLabel: "房型", bookCta: "立即预订",
    hero: {
      eyebrow: "STAY · ESCAPE",
      title: "推开窗\n就是山与海",
      sub: "依山面海的设计民宿，让每一次出发都值得。",
      img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    },
    categories: [{ id: "all", name: "全部" }, { id: "std", name: "标准房" }, { id: "villa", name: "别墅" }],
    items: [
      { id: "m1", cat: "std", name: "海景大床房", price: 588, unit: "/晚", tags: ["35㎡", "一线海景"],
        thumb: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=500&q=80",
        desc: "落地窗一线海景，1.8m 大床，配观景阳台与下午茶。",
        options: [{ label: "床型", values: ["1.8m 大床", "两张 1.2m 单床"] }] },
      { id: "m2", cat: "std", name: "亲子家庭房", price: 768, unit: "/晚", tags: ["45㎡", "适合带娃"],
        thumb: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80",
        desc: "一大一小两床，配儿童洗漱与玩具角，带娃出行更省心。" },
      { id: "m3", cat: "villa", name: "庭院别墅", price: 1880, unit: "/晚", tags: ["独栋", "私汤"],
        thumb: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80",
        desc: "独栋两层带私家庭院与温泉，可住 4–6 人，适合家庭/朋友聚会。",
        options: [{ label: "入住人数", values: ["2–4 人", "5–6 人 +200"] }] },
    ],
    steps: [
      { t: "选房下单", d: "挑房型、定日期" },
      { t: "在线支付", d: "确认订单（演示）" },
      { t: "到店入住", d: "凭订单办理入住" },
    ],
    booking: {
      dateLabel: "入住日期",
      slots: ["14:00 后入住"],
      extra: [
        { key: "nights", label: "入住晚数", type: "stepper", min: 1, max: 30, value: 1 },
        { key: "guests", label: "入住人数", type: "stepper", min: 1, max: 8, value: 2 },
      ],
    },
    contact: { rows: [{ k: "预订电话", v: "0571-8888-0000" }, { k: "地址", v: "某省某市海湾路 1 号" }] },
  },

  /* ============ 医院挂号 ============ */
  guahao: {
    theme: { mode: "light", accent: "#1c7fd6" },
    brand: "便民挂号", tagline: "在线挂号 · 便捷就医",
    unitLabel: "医生", bookCta: "立即挂号",
    hero: {
      eyebrow: "ONLINE REGISTRATION",
      title: "在线挂号\n少排队少跑腿",
      sub: "覆盖各大科室专家号源，手机上就能预约。",
      img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
    },
    categories: [{ id: "all", name: "全部" }, { id: "nk", name: "内科" }, { id: "wk", name: "外科" }, { id: "ek", name: "儿科" }],
    items: [
      { id: "g1", cat: "nk", name: "王医生 · 主任医师", price: 50, unit: "/号", tags: ["心血管内科", "周一三五"],
        thumb: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80",
        desc: "从医 25 年，擅长高血压、冠心病等心血管常见病诊治。",
        options: [{ label: "号别", values: ["普通号 ¥50", "专家号 ¥100"] }] },
      { id: "g2", cat: "wk", name: "李医生 · 副主任医师", price: 40, unit: "/号", tags: ["普外科", "周二四"],
        thumb: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80",
        desc: "擅长甲状腺、乳腺及腹部常见外科疾病的微创治疗。" },
      { id: "g3", cat: "ek", name: "张医生 · 主治医师", price: 30, unit: "/号", tags: ["儿科", "每日出诊"],
        thumb: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80",
        desc: "擅长儿童呼吸道、消化道常见病与生长发育评估。" },
    ],
    steps: [
      { t: "选科室医生", d: "按科室找专家" },
      { t: "选号预约", d: "挑日期、上午/下午" },
      { t: "到院取号", d: "凭预约到院就诊" },
    ],
    booking: {
      dateLabel: "就诊日期",
      slots: ["上午", "下午"],
      extra: [
        { key: "type", label: "号别", type: "select", options: ["普通号", "专家号"] },
        { key: "first", label: "是否首诊", type: "select", options: ["首诊", "复诊"] },
      ],
    },
    contact: { rows: [{ k: "咨询电话", v: "12320" }, { k: "医院地址", v: "某市健康路 100 号" }] },
  },

  /* ============ 家政 ============ */
  jiazheng: {
    theme: { mode: "light", accent: "#2fa86a" },
    brand: "净家家政", tagline: "把家交给我们 · 干净如新",
    unitLabel: "服务", bookCta: "立即预约",
    hero: {
      eyebrow: "HOME · CLEANING",
      title: "回到家\n只想躺平",
      sub: "保洁、收纳、搬家一站搞定，阿姨持证上门。",
      img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
    },
    categories: [{ id: "all", name: "全部" }, { id: "clean", name: "保洁" }, { id: "move", name: "搬家" }],
    items: [
      { id: "j1", cat: "clean", name: "日常保洁", price: 39, unit: "/小时", tags: ["持证阿姨"],
        thumb: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=500&q=80",
        desc: "擦拭、拖地、厨卫清洁等日常打扫，按小时计费、灵活预约。",
        options: [{ label: "时长", values: ["2 小时", "3 小时", "4 小时"] }] },
      { id: "j2", cat: "clean", name: "深度开荒", price: 399, unit: "/次", tags: ["新房/年终"],
        thumb: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=500&q=80",
        desc: "新房开荒或年终大扫除，专业工具+团队，角角落落彻底清洁。" },
      { id: "j3", cat: "move", name: "小型搬家", price: 299, unit: "/次", tags: ["含搬运"],
        thumb: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=500&q=80",
        desc: "面包车 + 2 名师傅，含搬运上下楼，适合公寓/单间搬家。" },
    ],
    steps: [
      { t: "选服务下单", d: "选项目、填地址" },
      { t: "派单上门", d: "就近安排持证阿姨" },
      { t: "服务完成", d: "验收满意再确认" },
    ],
    booking: {
      dateLabel: "上门日期",
      slots: ["上午", "下午", "晚上"],
      extra: [
        { key: "area", label: "房屋面积(㎡)", type: "stepper", min: 20, max: 400, value: 80, step: 10 },
        { key: "rooms", label: "房间数", type: "stepper", min: 1, max: 6, value: 2 },
      ],
    },
    contact: { rows: [{ k: "预约电话", v: "400-666-0000" }, { k: "服务范围", v: "市区上门" }] },
  },

  /* ============ 月嫂 / 母婴 ============ */
  yuesao: {
    theme: { mode: "light", accent: "#d98aa0" },
    brand: "知心月嫂", tagline: "新手爸妈的安心后盾",
    unitLabel: "套餐", bookCta: "立即预约",
    hero: {
      eyebrow: "MATERNITY · CARE",
      title: "月子里\n有人替你扛",
      sub: "持证月嫂 / 育儿嫂上门，科学照护母婴。",
      img: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=900&q=80",
    },
    categories: [{ id: "all", name: "全部" }, { id: "ys", name: "月嫂" }, { id: "yr", name: "育儿嫂" }],
    items: [
      { id: "y1", cat: "ys", name: "金牌月嫂", price: 16800, unit: "/月", tags: ["26天", "5年经验"],
        thumb: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=500&q=80",
        desc: "负责产妇月子餐、伤口护理与新生儿喂养、抚触、观察，经验丰富。",
        options: [{ label: "级别", values: ["金牌", "钻石 +3000"] }] },
      { id: "y2", cat: "yr", name: "育儿嫂", price: 9800, unit: "/月", tags: ["0-3岁"],
        thumb: "https://images.unsplash.com/photo-1543248939-4296e1fea89b?auto=format&fit=crop&w=500&q=80",
        desc: "照护 0–3 岁宝宝的饮食起居、早教启蒙与生活习惯培养。" },
      { id: "y3", cat: "ys", name: "催乳通乳", price: 398, unit: "/次", tags: ["上门"],
        thumb: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=500&q=80",
        desc: "专业催乳师上门，缓解涨奶、堵奶，指导科学哺乳。" },
    ],
    steps: [
      { t: "选套餐预约", d: "选月嫂/育儿嫂" },
      { t: "面试匹配", d: "看资质、可面试" },
      { t: "上户服务", d: "签约后上门照护" },
    ],
    booking: {
      dateLabel: "预产期 / 上户日期",
      slots: ["全天住家"],
      extra: [
        { key: "level", label: "需求级别", type: "select", options: ["普通", "金牌", "钻石"] },
        { key: "months", label: "服务月数", type: "stepper", min: 1, max: 12, value: 1 },
      ],
    },
    contact: { rows: [{ k: "咨询电话", v: "400-999-0000" }, { k: "服务城市", v: "全国主要城市" }] },
  },
};
