/* 原生小程序读取的配置（与浏览器预览 configs.js 同结构）。
 * 换行业：把这份换成对应行业的配置即可（陪诊/民宿/挂号/家政/月嫂…）。
 */
module.exports = {
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
      desc: "陪诊师陪同挂号、候诊、就诊、缴费、取药，全程协助沟通。",
      options: [{ label: "时长", values: ["半天 3 小时", "加钟 +1 小时"] }] },
    { id: "p2", cat: "pz", name: "全天陪诊", price: 358, unit: "/次", tags: ["6小时", "含跨院"],
      thumb: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=500&q=80",
      desc: "适合检查多、需跨科室或跨院的就诊安排，全天专属陪诊师协助。",
      options: [{ label: "陪诊师", values: ["普通陪诊师", "资深陪诊师 +80"] }] },
    { id: "p3", cat: "dl", name: "代取报告", price: 88, unit: "/次", tags: ["免排队"],
      thumb: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=500&q=80",
      desc: "代为排队取检查/化验报告并寄送或线上发给您。" },
    { id: "p4", cat: "dl", name: "代办手续", price: 128, unit: "/次", tags: ["住院/转诊"],
      thumb: "https://images.unsplash.com/photo-1554734867-bf3c00a49371?auto=format&fit=crop&w=500&q=80",
      desc: "代办住院登记、转诊、医保等手续，熟悉流程少跑腿。" },
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
      { key: "age", label: "就诊人年龄", type: "stepper", min: 1, max: 120, value: 60 },
    ],
  },
  contact: { rows: [{ k: "客服电话", v: "400-120-0000" }, { k: "服务城市", v: "全国 30+ 城市" }] },
};
