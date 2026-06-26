/* 健身跟练 App 配置 —— 换计划只改这份
 * plan → actions(动作序列)。动作：
 *   name 名称, pose 姿势(决定跟练时的小人动画), dur 秒数, reps 显示次数(可选), rest 之后休息秒数, tip 要领
 * pose 可选：jumpingjack 开合跳 / highknee 高抬腿 / squat 深蹲 / plank 平板 / pushup 俯卧撑 /
 *           climber 登山跑 / situp 卷腹 / twist 转体 / stretch 拉伸 / rest 休息
 */
window.FITNESS_CONFIG = {
  brand: "轻燃健身",
  plans: [
    {
      id: "hiit", title: "燃脂 HIIT · 7 分钟", color: "#ff5a36", level: "入门",
      target: "燃脂", parts: "全身", kcal: 95, equipment: "无需器械",
      desc: "无器械高效燃脂，跟着节奏做，每个动作之间有休息，新手也能坚持下来。",
      actions: [
        { name: "开合跳", pose: "jumpingjack", dur: 30, rest: 10, tip: "手脚同时打开合拢，落地轻一点" },
        { name: "高抬腿", pose: "highknee", dur: 30, rest: 10, tip: "膝盖抬到腰高，核心收紧" },
        { name: "深蹲", pose: "squat", dur: 30, reps: 15, rest: 15, tip: "屁股向后坐，膝盖别超过脚尖" },
        { name: "登山跑", pose: "climber", dur: 30, rest: 10, tip: "撑稳肩膀，膝盖快速交替向前" },
        { name: "平板支撑", pose: "plank", dur: 30, rest: 10, tip: "身体一条线，别塌腰别撅屁股" },
        { name: "原地小跳", pose: "jumpingjack", dur: 30, rest: 0, tip: "放松节奏，把心率稳下来" },
      ],
    },
    {
      id: "core", title: "核心塑形 · 腹肌雕刻", color: "#7b61ff", level: "进阶",
      target: "塑形", parts: "核心/腹部", kcal: 78, equipment: "瑜伽垫",
      desc: "针对腹部与核心，练出线条。动作偏慢，注意发力感，量力而行。",
      actions: [
        { name: "卷腹", pose: "situp", dur: 30, reps: 12, rest: 12, tip: "用腹部带起上半身，别用脖子" },
        { name: "平板支撑", pose: "plank", dur: 40, rest: 15, tip: "全程收紧核心，均匀呼吸" },
        { name: "俄罗斯转体", pose: "twist", dur: 30, reps: 20, rest: 12, tip: "左右转体，眼睛跟着手走" },
        { name: "深蹲", pose: "squat", dur: 30, reps: 15, rest: 12, tip: "下蹲到大腿与地面平行" },
        { name: "登山跑", pose: "climber", dur: 30, rest: 0, tip: "收尾冲刺，保持节奏" },
      ],
    },
    {
      id: "stretch", title: "拉伸放松 · 睡前 5 分钟", color: "#1fae8c", level: "入门",
      target: "拉伸", parts: "全身", kcal: 28, equipment: "无需器械",
      desc: "睡前舒缓拉伸，放松紧绷的身体，每个动作慢慢来、深呼吸。",
      actions: [
        { name: "颈部拉伸", pose: "stretch", dur: 30, rest: 5, tip: "缓慢侧倾，感受颈侧拉伸" },
        { name: "体侧拉伸", pose: "stretch", dur: 30, rest: 5, tip: "手臂上举向一侧延展" },
        { name: "站立前屈", pose: "stretch", dur: 40, rest: 5, tip: "膝盖微弯，让上身自然垂下" },
        { name: "婴儿式放松", pose: "stretch", dur: 40, rest: 0, tip: "跪坐前趴，额头贴地，深呼吸" },
      ],
    },
  ],
};
