/* 720° 全景看房（VR 实景样板间）配置 —— 换楼盘 / 换场景只改这份
 *
 * 结构：
 *   title       顶部标题
 *   agent       置业顾问 { name, badge }
 *   projects    楼盘列表 [{ id, name, tint }]  tint=该楼盘的色调（叠在全景上做不同氛围）
 *   groups      区域/户型 [{ id, name, scenes:[ scene ] }]
 *   scene:
 *     id,name   场景 id 与名称（缩略图、标题用）
 *     feature   主墙上的标识文字（如「LOGO 墙」）
 *     palette   该场景配色（天花/墙/地/采光/点缀）
 *     hotspots  热点 [{ to:目标场景id, yaw:方向(弧度), label }] —— 点击在全景里走到下一个场景
 *
 * 正式上线把「手续生成的房间」换成客户实拍的 equirectangular 720° 全景图即可（viewer 同样的球面贴图）。
 */
window.VR_CONFIG = {
  title: "新房实景样板间",
  agent: { name: "置业顾问 · 小林", badge: "林" },

  projects: [
    { id: "p1", name: "树高晶宸", tint: "rgba(202,164,106,.10)" },
    { id: "p2", name: "嘉禾华宸府", tint: "rgba(120,150,190,.12)" },
    { id: "p3", name: "江岸铂悦府", tint: "rgba(150,170,150,.12)" },
    { id: "p4", name: "人居西悦云", tint: "rgba(190,150,160,.12)" },
  ],

  groups: [
    {
      id: "public", name: "公区",
      scenes: [
        { id: "gate", name: "大门", feature: "CLOUD MANSION",
          palette: { ceil: "#2f2418", ceil2: "#5b4630", wall: "#c9bca2", wall2: "#a8997c", floor: "#d8d2c4", floor2: "#aaa28f", accent: "#caa46a", light: "#fff3da" },
          hotspots: [{ to: "unit", yaw: 1.15, label: "单元门" }, { to: "elevator", yaw: -1.5, label: "电梯厅" }] },
        { id: "unit", name: "单元门", feature: "1 栋 2 单元",
          palette: { ceil: "#26282a", ceil2: "#3f4346", wall: "#b9bcc0", wall2: "#9a9ea3", floor: "#cfd2d4", floor2: "#a6abb0", accent: "#8fb0c8", light: "#eef4f8" },
          hotspots: [{ to: "gate", yaw: 0.1, label: "返回大门" }, { to: "elevator", yaw: -1.8, label: "电梯厅" }] },
        { id: "elevator", name: "电梯厅", feature: "ELEVATOR HALL",
          palette: { ceil: "#1f2326", ceil2: "#394049", wall: "#aeb6bd", wall2: "#8b949c", floor: "#3b3f44", floor2: "#23262a", accent: "#c0a062", light: "#fbf0d4" },
          hotspots: [{ to: "unit", yaw: 1.6, label: "单元门" }, { to: "kids", yaw: -0.9, label: "儿童区" }] },
        { id: "kids", name: "儿童区", feature: "KIDS LAND",
          palette: { ceil: "#cfe7f2", ceil2: "#a7d3e6", wall: "#ffe6c2", wall2: "#ffd29a", floor: "#bfe3c4", floor2: "#9ad0a3", accent: "#ff8a5c", light: "#ffffff" },
          hotspots: [{ to: "elevator", yaw: 2.2, label: "电梯厅" }, { to: "garden", yaw: -0.6, label: "中庭花园" }] },
        { id: "garden", name: "中庭花园", feature: "CENTRAL GARDEN",
          palette: { ceil: "#bfe0ff", ceil2: "#8ec4f5", wall: "#cdd9c0", wall2: "#a9bd97", floor: "#9fb98a", floor2: "#7f9c6b", accent: "#6fae57", light: "#ffffff" },
          hotspots: [{ to: "kids", yaw: 1.9, label: "儿童区" }, { to: "gate", yaw: -1.2, label: "大门" }] },
      ],
    },
    {
      id: "t103", name: "103㎡ 户型",
      scenes: [
        { id: "living", name: "客厅", feature: "LIVING ROOM",
          palette: { ceil: "#efe9df", ceil2: "#d9d1c2", wall: "#e7ddcb", wall2: "#ccbfa6", floor: "#caa877", floor2: "#a8895d", accent: "#c08a4a", light: "#fff6e6" },
          hotspots: [{ to: "master", yaw: 1.3, label: "主卧" }, { to: "kitchen", yaw: -1.4, label: "厨房" }] },
        { id: "master", name: "主卧", feature: "MASTER BEDROOM",
          palette: { ceil: "#efe6e6", ceil2: "#dac9c9", wall: "#e6d6d2", wall2: "#cbb3ad", floor: "#b89274", floor2: "#94715a", accent: "#b07b86", light: "#fff2f0" },
          hotspots: [{ to: "living", yaw: -1.7, label: "客厅" }] },
        { id: "kitchen", name: "厨房", feature: "KITCHEN",
          palette: { ceil: "#eef0ef", ceil2: "#d3d8d6", wall: "#dde3e2", wall2: "#bcc5c3", floor: "#9aa0a2", floor2: "#787e80", accent: "#6fa0a0", light: "#f4faf9" },
          hotspots: [{ to: "living", yaw: 1.5, label: "客厅" }] },
      ],
    },
    {
      id: "t119", name: "119㎡ 户型",
      scenes: [
        { id: "living2", name: "客厅", feature: "LIVING ROOM",
          palette: { ceil: "#f0ece3", ceil2: "#ddd4c5", wall: "#ece2d0", wall2: "#d2c4ab", floor: "#bfa074", floor2: "#9c8159", accent: "#b98a52", light: "#fff7ea" },
          hotspots: [{ to: "dining", yaw: 1.2, label: "餐厅" }, { to: "balcony", yaw: -1.3, label: "阳台" }] },
        { id: "dining", name: "餐厅", feature: "DINING",
          palette: { ceil: "#efe8e0", ceil2: "#dccfbe", wall: "#e3d8c6", wall2: "#c7b69d", floor: "#b59a72", floor2: "#927a57", accent: "#a98a55", light: "#fff5e8" },
          hotspots: [{ to: "living2", yaw: -1.6, label: "客厅" }] },
        { id: "balcony", name: "阳台", feature: "BALCONY",
          palette: { ceil: "#cfe6ff", ceil2: "#a8caf0", wall: "#dde6ec", wall2: "#bcccd6", floor: "#b6a88f", floor2: "#94886f", accent: "#5fa0c8", light: "#ffffff" },
          hotspots: [{ to: "living2", yaw: 1.7, label: "客厅" }] },
      ],
    },
  ],
};
