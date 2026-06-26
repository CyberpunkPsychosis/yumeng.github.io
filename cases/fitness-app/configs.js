/* 轻燃健身 App 配置 —— Keep 式，内容更全
 * courses 课程(含动作序列) / series 多日训练计划 / feed 社区动态 / categories 运动分类 / user 我的数据
 * pose 决定跟练时小人动画：jumpingjack/highknee/squat/plank/pushup/climber/situp/twist/stretch
 */
window.FITNESS_CONFIG = {
  brand: "轻燃健身",
  user: {
    name: "运动的阿亮", badge: "亮", motto: "今天也要动一动",
    stats: { weekMin: 126, weekKcal: 1480, weekDays: 4, streak: 6, totalDays: 38 },
    doneDays: [1, 3, 4, 6, 8, 9, 11, 13, 14, 16, 18, 20, 22, 23, 25],
    badges: [
      { name: "连续打卡 7 天", pose: "highknee", got: true },
      { name: "累计 30 次", pose: "squat", got: true },
      { name: "早起鸟", pose: "stretch", got: true },
      { name: "燃脂达人", pose: "jumpingjack", got: false },
      { name: "核心王者", pose: "plank", got: false },
      { name: "百日坚持", pose: "climber", got: false },
    ],
  },
  categories: [
    { name: "燃脂", pose: "jumpingjack" }, { name: "力量", pose: "squat" }, { name: "核心", pose: "plank" },
    { name: "拉伸", pose: "stretch" }, { name: "跑步", pose: "highknee" }, { name: "操课", pose: "climber" },
    { name: "瑜伽", pose: "stretch" }, { name: "热身", pose: "highknee" },
  ],
  recommend: ["hiit", "core", "morning"],

  courses: [
    {
      id: "hiit", title: "燃脂 HIIT · 7 分钟", color: "#ff5a36", level: "入门", cat: "燃脂",
      target: "燃脂", parts: "全身", kcal: 95, equipment: "无需器械", plays: 128400, rating: 4.9, suit: "想快速出汗的你",
      desc: "无器械高效燃脂，跟着节奏做，每个动作之间有休息，新手也能坚持下来。",
      actions: [
        { name: "开合跳", pose: "jumpingjack", dur: 30, rest: 10, tip: "手脚同时打开合拢，落地轻一点" },
        { name: "高抬腿", pose: "highknee", dur: 30, rest: 10, tip: "膝盖抬到腰高，核心收紧" },
        { name: "深蹲", pose: "squat", dur: 30, reps: 15, rest: 15, tip: "屁股向后坐，膝盖别超过脚尖" },
        { name: "登山跑", pose: "climber", dur: 30, rest: 10, tip: "撑稳肩膀，膝盖快速交替向前" },
        { name: "平板支撑", pose: "plank", dur: 30, rest: 10, tip: "身体一条线，别塌腰别撅屁股" },
        { name: "原地小跳", pose: "jumpingjack", dur: 30, rest: 0, tip: "放松节奏，把心率稳下来" },
      ],
      reviews: [{ u: "燃**", stars: 5, t: "出汗超多，七分钟刚刚好！" }, { u: "新**", stars: 5, t: "新手也跟得下来，有休息不会累垮。" }],
    },
    {
      id: "core", title: "核心塑形 · 腹肌雕刻", color: "#7b61ff", level: "进阶", cat: "核心",
      target: "塑形", parts: "核心/腹部", kcal: 78, equipment: "瑜伽垫", plays: 86200, rating: 4.8, suit: "想练出马甲线",
      desc: "针对腹部与核心，练出线条。动作偏慢，注意发力感，量力而行。",
      actions: [
        { name: "卷腹", pose: "situp", dur: 30, reps: 12, rest: 12, tip: "用腹部带起上半身，别用脖子" },
        { name: "平板支撑", pose: "plank", dur: 40, rest: 15, tip: "全程收紧核心，均匀呼吸" },
        { name: "俄罗斯转体", pose: "twist", dur: 30, reps: 20, rest: 12, tip: "左右转体，眼睛跟着手走" },
        { name: "深蹲", pose: "squat", dur: 30, reps: 15, rest: 12, tip: "下蹲到大腿与地面平行" },
        { name: "登山跑", pose: "climber", dur: 30, rest: 0, tip: "收尾冲刺，保持节奏" },
      ],
      reviews: [{ u: "马**", stars: 5, t: "练完核心很有感觉，坚持两周有线条了。" }],
    },
    {
      id: "stretch", title: "拉伸放松 · 睡前 5 分钟", color: "#1fae8c", level: "入门", cat: "拉伸",
      target: "拉伸", parts: "全身", kcal: 28, equipment: "无需器械", plays: 203500, rating: 4.9, suit: "久坐与睡前放松",
      desc: "睡前舒缓拉伸，放松紧绷的身体，每个动作慢慢来、深呼吸。",
      actions: [
        { name: "颈部拉伸", pose: "stretch", dur: 30, rest: 5, tip: "缓慢侧倾，感受颈侧拉伸" },
        { name: "体侧拉伸", pose: "stretch", dur: 30, rest: 5, tip: "手臂上举向一侧延展" },
        { name: "站立前屈", pose: "stretch", dur: 40, rest: 5, tip: "膝盖微弯，让上身自然垂下" },
        { name: "婴儿式放松", pose: "stretch", dur: 40, rest: 0, tip: "跪坐前趴，额头贴地，深呼吸" },
      ],
      reviews: [{ u: "睡**", stars: 5, t: "睡前拉一拉，睡得更香了。" }],
    },
    {
      id: "power", title: "上肢力量 · 手臂塑形", color: "#ff8f1f", level: "进阶", cat: "力量",
      target: "力量", parts: "胸/肩/手臂", kcal: 88, equipment: "瑜伽垫", plays: 64100, rating: 4.7, suit: "想练线条与力量",
      desc: "无器械上肢力量训练，俯卧撑与支撑组合，练出紧致手臂与肩背。",
      actions: [
        { name: "标准俯卧撑", pose: "pushup", dur: 30, reps: 12, rest: 15, tip: "身体一条线，下放到大臂平行" },
        { name: "平板支撑", pose: "plank", dur: 40, rest: 15, tip: "收紧核心，肩膀稳住" },
        { name: "登山跑", pose: "climber", dur: 30, rest: 12, tip: "撑稳上肢，快速交替" },
        { name: "宽距俯卧撑", pose: "pushup", dur: 30, reps: 10, rest: 0, tip: "手略宽于肩，练胸更明显" },
      ],
      reviews: [{ u: "臂**", stars: 4, t: "有点强度，量力而行，效果不错。" }],
    },
    {
      id: "morning", title: "晨间唤醒 · 5 分钟", color: "#2f9bff", level: "入门", cat: "热身",
      target: "热身", parts: "全身", kcal: 42, equipment: "无需器械", plays: 152300, rating: 4.8, suit: "起床后唤醒身体",
      desc: "温和的全身唤醒，激活身体、提振精神，开启元气满满的一天。",
      actions: [
        { name: "原地踏步", pose: "highknee", dur: 30, rest: 8, tip: "轻松踏步，唤醒身体" },
        { name: "开合跳", pose: "jumpingjack", dur: 30, rest: 8, tip: "节奏轻快，让心率上来" },
        { name: "体侧拉伸", pose: "stretch", dur: 30, rest: 8, tip: "向两侧延展，打开身体" },
        { name: "深蹲", pose: "squat", dur: 30, reps: 12, rest: 0, tip: "唤醒下肢，收尾放松" },
      ],
      reviews: [{ u: "晨**", stars: 5, t: "早起跟一遍，一天都精神！" }],
    },
    {
      id: "dance", title: "燃脂操课 · 全身燃烧", color: "#ff4f8b", level: "进阶", cat: "操课", target: "燃脂",
      parts: "全身", kcal: 132, equipment: "无需器械", plays: 98700, rating: 4.7, suit: "想跟着节奏嗨练",
      desc: "跟着节奏的全身操课，高强度燃脂，动感十足，挥汗如雨。",
      actions: [
        { name: "开合跳", pose: "jumpingjack", dur: 40, rest: 10, tip: "跟上节奏，全程不停" },
        { name: "高抬腿", pose: "highknee", dur: 40, rest: 10, tip: "膝盖抬高，摆臂带动" },
        { name: "登山跑", pose: "climber", dur: 40, rest: 12, tip: "核心收紧，快速交替" },
        { name: "深蹲跳", pose: "squat", dur: 30, rest: 10, tip: "蹲下起跳，落地缓冲" },
        { name: "原地小跳", pose: "jumpingjack", dur: 30, rest: 0, tip: "放松节奏收尾" },
      ],
      reviews: [{ u: "嗨**", stars: 5, t: "像跳舞一样，不知不觉就练完了。" }],
    },
  ],

  series: [
    {
      id: "fat21", title: "21 天减脂计划", color: "#ff5a36", weeks: 3, joined: 12400,
      desc: "循序渐进的三周减脂，隔天训练 + 拉伸恢复，坚持下来体感明显。",
      days: [
        { label: "第 1 天", courseId: "hiit" }, { label: "第 2 天", courseId: "stretch" }, { label: "第 3 天", courseId: "core" },
        { label: "第 4 天", rest: true }, { label: "第 5 天", courseId: "dance" }, { label: "第 6 天", courseId: "morning" }, { label: "第 7 天", courseId: "stretch" },
      ],
    },
    {
      id: "start7", title: "0 基础入门 · 7 天", color: "#2f9bff", weeks: 1, joined: 28600,
      desc: "专为新手设计的一周入门，强度温和，帮你养成运动习惯。",
      days: [
        { label: "第 1 天", courseId: "morning" }, { label: "第 2 天", courseId: "stretch" }, { label: "第 3 天", courseId: "hiit" },
        { label: "第 4 天", rest: true }, { label: "第 5 天", courseId: "morning" }, { label: "第 6 天", courseId: "core" }, { label: "第 7 天", courseId: "stretch" },
      ],
    },
  ],

  feed: [
    { id: "f1", user: "燃脂少女", badge: "燃", time: "10 分钟前", text: "打卡第 18 天！今天 HIIT 出了好多汗，马甲线有内味了 💪", color: "#ff5a36", metric: { label: "燃脂 HIIT · 7 分钟", value: "95 千卡" }, likes: 32, comments: 6, liked: false },
    { id: "f2", user: "晨跑老王", badge: "王", time: "1 小时前", text: "晨间唤醒 + 拉伸，连续打卡一周啦，整个人状态都不一样了。", color: "#2f9bff", metric: { label: "晨间唤醒 · 5 分钟", value: "42 千卡" }, likes: 58, comments: 12, liked: true },
    { id: "f3", user: "瑜伽小鹿", badge: "鹿", time: "今天 08:20", text: "睡前拉伸真的好用，分享给同样久坐的姐妹们～", color: "#1fae8c", metric: { label: "拉伸放松 · 睡前 5 分钟", value: "28 千卡" }, likes: 21, comments: 3, liked: false },
  ],
};
