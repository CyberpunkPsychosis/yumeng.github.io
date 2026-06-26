// 房产 VR 看房小程序配置（原生）—— 换中介 / 换楼盘改这份
module.exports = {
  agent: { city: "成都·温江", slogan: "致力于温江房产", name: "置业顾问 · 小林", desc: "买房避坑指南 / 科学选房逻辑" },
  // 首页功能宫格；type=tour 的进 720° 实景样板间（web-view 载入 H5 全景）
  features: [
    { icon: "plane", name: "温江新房航拍", type: "demo" },
    { icon: "home", name: "新房实景样板间", type: "tour" },
    { icon: "buildings", name: "二手小区全景拍摄", type: "tour" },
    { icon: "map", name: "全成都板块划分", type: "demo" },
    { icon: "calculator", name: "房贷计算器", type: "demo" },
    { icon: "cap", name: "温江公立小学", type: "demo" },
    { icon: "blueprint", name: "光华宸语施工图", type: "demo" },
    { icon: "blueprint", name: "九里台施工图", type: "demo" },
    { icon: "blueprint", name: "柳岸澜语施工图", type: "demo" },
    { icon: "book", name: "建发书香御府", type: "demo" },
  ],
  // H5 全景查看器地址（部署后的 GitHub Pages）；web-view 需在小程序后台配置业务域名
  h5tour: "https://cyberpunkpsychosis.github.io/yumeng.github.io/cases/vr-tour/index.html",
};
