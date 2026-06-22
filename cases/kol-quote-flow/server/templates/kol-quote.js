/* 模板：KOL 报价
 *
 * 一个「模板」= 要抽哪些字段 + 怎么抽（提示词）+ 字段对应飞书哪列。
 * 换个行业（询盘/简历/发票/工单…）只要再加一个这样的文件，引擎不用动。
 * 这正是把「KOL 报价」这个单点需求，变成可复用产品的关键。
 */
export default {
  id: "kol-quote",
  name: "KOL 报价",

  // 每个字段：key（程序用）/ label（界面显示）/ type / desc（喂给模型）/ feishu（飞书列名）/ required
  fields: [
    { key: "kol_name",      label: "KOL",        type: "text",   feishu: "KOL",        desc: "KOL 名称或账号名", required: true },
    { key: "platform",      label: "平台",        type: "text",   feishu: "平台",        desc: "平台，如 YouTube / Instagram / TikTok / X", required: true },
    { key: "handle",        label: "主页/Handle", type: "text",   feishu: "主页/Handle", desc: "主页链接或 @handle，没有则留空" },
    { key: "followers",     label: "粉丝量",      type: "text",   feishu: "粉丝量",      desc: "粉丝量，保留原文（如 1.2M / 850k），不要换算" },
    { key: "price",         label: "报价",        type: "number", feishu: "报价",        desc: "报价金额，只取数字；多档取最低，完整报价写进备注", required: true },
    { key: "currency",      label: "币种",        type: "text",   feishu: "币种",        desc: "币种，如 USD / EUR / GBP，未写默认 USD", required: true },
    { key: "deliverables",  label: "合作形式",    type: "text",   feishu: "合作形式",    desc: "交付内容，如 1 integrated video + 2 stories" },
    { key: "timeline",      label: "可上线时间",  type: "text",   feishu: "可上线时间",  desc: "可上线时间或周期，没有则留空" },
    { key: "contact_email", label: "联系邮箱",    type: "text",   feishu: "联系邮箱",    desc: "联系邮箱，优先正文里写明的" },
    { key: "notes",         label: "备注",        type: "text",   feishu: "备注",        desc: "其他要点，一句话；含多档报价原文" },
  ],

  systemPrompt: `你是海外 KOL 营销团队的助理。用户会发来一封 KOL（网红/达人）的合作或报价邮件，
请从中抽取结构化信息。要求：
- 只依据邮件内容，不要编造；缺失就留空字符串，price 缺失用 0。
- price 只保留数字；遇区间或多档取最低一档，把完整报价写进 notes。
- platform 用平台英文名；followers 保留原始写法不换算。`,
};
