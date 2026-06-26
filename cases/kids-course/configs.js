/* 互动课程平台配置 —— 换课程只改这份
 * 课程 → 单元 → 课时 → 步骤(step)。步骤类型：
 *   teach   讲解卡（大图 + 语音）
 *   count   数一数（显示 n 个东西，选个数）
 *   compare 比多少（左右两组，选哪边多 / 一样多）
 *   choose  选一选（题面 + 选项）
 *   gen     由引擎按规则生成算术题（见课时的 gen 字段）
 * 把这套换成「拼音 / 健身(Keep) / 英语」等课程，只要按同样结构换内容。
 */
window.COURSE_CONFIG = {
  brand: "小步课堂",
  courses: [
    {
      id: "math10", title: "数学启蒙 · 10 以内", subtitle: "数数 · 比多少 · 加减法", color: "#4a7bf7",
      level: "5-6 岁", icon: "calculator", cover: "123",
      units: [
        {
          title: "第一关 · 数一数", lessons: [
            { id: "m1", title: "认识 1–5", icon: "star", steps: [
              { type: "teach", prompt: "我们先来数小苹果！一个一个数：1、2、3。", say: "我们先来数小苹果，一个一个数，一，二，三。", kind: "apple", count: 3 },
              { type: "count", prompt: "数一数，有几个星星？", say: "数一数，有几个星星？", kind: "star", count: 4 },
              { type: "count", prompt: "数一数，有几个气球？", say: "数一数，有几个气球？", kind: "balloon", count: 2 },
              { type: "count", prompt: "数一数，有几个小鱼？", say: "数一数，有几条小鱼？", kind: "fish", count: 5 },
            ] },
            { id: "m2", title: "认识 6–10", icon: "star", steps: [
              { type: "teach", prompt: "数字越来越大啦，我们数到 6、7、8！", say: "数字越来越大啦，我们数到六、七、八。", kind: "candy", count: 6 },
              { type: "count", prompt: "数一数，有几颗糖？", say: "数一数，有几颗糖？", kind: "candy", count: 7 },
              { type: "count", prompt: "数一数，有几个苹果？", say: "数一数，有几个苹果？", kind: "apple", count: 9 },
              { type: "count", prompt: "数一数，有几颗星星？", say: "数一数，有几颗星星？", kind: "star", count: 10 },
            ] },
          ],
        },
        {
          title: "第二关 · 比多少", lessons: [
            { id: "m3", title: "谁更多？", icon: "chart", steps: [
              { type: "teach", prompt: "哪边的东西多，我们就说哪边「更多」。", say: "哪边的东西多，我们就说哪边更多。", kind: "apple", count: 3 },
              { type: "compare", prompt: "哪边的苹果更多？", say: "哪边的苹果更多？", left: { kind: "apple", count: 3 }, right: { kind: "apple", count: 5 }, answer: "right" },
              { type: "compare", prompt: "哪边的星星更多？", say: "哪边的星星更多？", left: { kind: "star", count: 6 }, right: { kind: "star", count: 4 }, answer: "left" },
              { type: "compare", prompt: "两边一样多吗？", say: "两边一样多吗？", left: { kind: "fish", count: 4 }, right: { kind: "fish", count: 4 }, answer: "equal" },
            ] },
          ],
        },
        {
          title: "第三关 · 加法", lessons: [
            { id: "m4", title: "加法入门", icon: "plus", steps: [
              { type: "teach", prompt: "把两堆合在一起，就是「加法」。2 个加 1 个，一共 3 个！", say: "把两堆合在一起，就是加法。二个加一个，一共三个。", kind: "apple", count: 3 },
              { type: "arith", a: 2, b: 1, op: "+" },
              { type: "arith", a: 3, b: 2, op: "+" },
              { type: "arith", a: 4, b: 3, op: "+" },
            ] },
            { id: "m5", title: "10 以内加法练习", icon: "plus", gen: { type: "add", max: 10, n: 6 } },
          ],
        },
        {
          title: "第四关 · 减法", lessons: [
            { id: "m6", title: "减法入门", icon: "edit", steps: [
              { type: "teach", prompt: "吃掉一些、拿走一些，就是「减法」。3 个拿走 1 个，还剩 2 个！", say: "拿走一些，就是减法。三个拿走一个，还剩两个。", kind: "candy", count: 2 },
              { type: "arith", a: 3, b: 1, op: "-" },
              { type: "arith", a: 5, b: 2, op: "-" },
              { type: "arith", a: 6, b: 4, op: "-" },
            ] },
            { id: "m7", title: "10 以内减法练习", icon: "edit", gen: { type: "sub", max: 10, n: 6 } },
          ],
        },
      ],
    },
    {
      id: "shape", title: "趣味形状与比较", subtitle: "认形状 · 找规律 · 比大小", color: "#19b36b",
      level: "4-6 岁", icon: "grid", cover: "▲●■",
      units: [
        {
          title: "认识形状", lessons: [
            { id: "s1", title: "这是什么形状？", icon: "grid", steps: [
              { type: "teach", prompt: "圆形像太阳，方形像饼干，三角形像小山。", say: "圆形像太阳，方形像饼干，三角形像小山。", kind: "shapes", count: 3 },
              { type: "choose", prompt: "哪个是圆形？", say: "哪个是圆形？", options: ["○ 圆形", "□ 方形", "△ 三角形"], answer: 0 },
              { type: "choose", prompt: "哪个是三角形？", say: "哪个是三角形？", options: ["□ 方形", "△ 三角形", "○ 圆形"], answer: 1 },
            ] },
          ],
        },
        {
          title: "比大小", lessons: [
            { id: "s2", title: "谁大谁小", icon: "chart", steps: [
              { type: "teach", prompt: "数字越往后越大：5 比 3 大，3 比 5 小。", say: "数字越往后越大，五比三大。", kind: "star", count: 5 },
              { type: "choose", prompt: "哪个数字更大？", say: "哪个数字更大？", options: ["3", "7"], answer: 1 },
              { type: "choose", prompt: "哪个数字更小？", say: "哪个数字更小？", options: ["2", "6"], answer: 0 },
            ] },
          ],
        },
      ],
    },
  ],
};
