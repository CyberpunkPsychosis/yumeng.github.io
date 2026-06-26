/* 经纪人工作台 · 演示数据（正式接后端后由 API 提供）
 * 可配置：换公司/团队/城市改这里即可。
 */
window.AGENT_DATA = {
  company: "安家地产 · 徐汇门店",
  me: { id: "a1", name: "王磊", badge: "王", role: "店长", team: "徐汇一组" },
  regions: ["徐汇", "静安", "浦东", "杨浦", "闵行"],

  // 经纪人 + 本月业绩
  agents: [
    { id: "a1", name: "王磊", badge: "王", team: "徐汇一组", gmv: 1280, deals: 4, views: 38, newList: 12, calls: 156 },
    { id: "a2", name: "李娜", badge: "李", team: "徐汇一组", gmv: 980, deals: 3, views: 31, newList: 9, calls: 132 },
    { id: "a3", name: "张伟", badge: "张", team: "徐汇二组", gmv: 1640, deals: 2, views: 22, newList: 6, calls: 98 },
    { id: "a4", name: "陈静", badge: "陈", team: "徐汇二组", gmv: 760, deals: 5, views: 44, newList: 15, calls: 178 },
    { id: "a5", name: "刘洋", badge: "刘", team: "徐汇一组", gmv: 540, deals: 2, views: 27, newList: 8, calls: 110 },
    { id: "a6", name: "赵敏", badge: "赵", team: "徐汇二组", gmv: 420, deals: 1, views: 19, newList: 5, calls: 76 },
  ],

  // 业绩来源构成（用于分配统计）
  sources: [
    { name: "线上端口", value: 42 }, { name: "门店到访", value: 23 },
    { name: "老客转介", value: 19 }, { name: "小程序", value: 16 },
  ],

  // 房源
  listings: [
    { id: "h1", community: "建岚公寓", region: "徐汇", rooms: "2室1厅", area: 71, floor: "中楼层/6层", orient: "朝南", price: 698, status: "在售", agent: "王磊", source: "线上端口", tags: ["满五唯一", "近地铁"], date: "06-20", phone: "138****1111" },
    { id: "h2", community: "静安丽舍", region: "静安", rooms: "3室2厅", area: 97, floor: "高楼层/18层", orient: "朝南", price: 1280, status: "在售", agent: "李娜", source: "门店到访", tags: ["地铁口", "商圈"], date: "06-18", phone: "139****2222" },
    { id: "h3", community: "滨江一号", region: "浦东", rooms: "4室2厅", area: 173, floor: "高楼层/42层", orient: "朝南", price: 3200, status: "已成交", agent: "张伟", source: "老客转介", tags: ["江景", "豪装"], date: "06-10", phone: "137****3333" },
    { id: "h4", community: "国和苑", region: "杨浦", rooms: "2室1厅", area: 60, floor: "低楼层/6层", orient: "朝南", price: 458, status: "在售", agent: "陈静", source: "小程序", tags: ["学区", "总价低"], date: "06-22", phone: "136****4444" },
    { id: "h5", community: "高安花园", region: "徐汇", rooms: "3室2厅", area: 129, floor: "复式/2层", orient: "朝南", price: 1880, status: "在售", agent: "王磊", source: "线上端口", tags: ["花园洋房", "稀缺"], date: "06-15", phone: "138****5555" },
    { id: "h6", community: "春申景城", region: "闵行", rooms: "2室2厅", area: 74, floor: "中楼层/11层", orient: "朝南", price: 388, status: "下架", agent: "刘洋", source: "门店到访", tags: ["满二", "性价比"], date: "06-08", phone: "135****6666" },
  ],

  // 客源
  clients: [
    { id: "c1", name: "周先生", phone: "138****8801", region: "徐汇", budget: "600-800万", rooms: "2室", status: "跟进中", agent: "王磊", level: "A", last: "06-23",
      follows: [{ date: "06-23", text: "电话沟通，下周末有空看房，重点看建岚公寓" }, { date: "06-20", text: "微信发了 3 套房源，对衡山路那套感兴趣" }] },
    { id: "c2", name: "吴女士", phone: "139****8802", region: "静安", budget: "1000-1500万", rooms: "3室", status: "已带看", agent: "李娜", level: "A", last: "06-22",
      follows: [{ date: "06-22", text: "带看静安丽舍，比较满意，回去和家人商量" }] },
    { id: "c3", name: "郑先生", phone: "137****8803", region: "杨浦", budget: "400-500万", rooms: "2室", status: "新", agent: "陈静", level: "B", last: "06-24",
      follows: [{ date: "06-24", text: "小程序留资，预算友好，适合国和苑" }] },
    { id: "c4", name: "孙女士", phone: "136****8804", region: "浦东", budget: "3000万以上", rooms: "4室", status: "已成交", agent: "张伟", level: "A", last: "06-10",
      follows: [{ date: "06-10", text: "成交滨江一号，办理过户中" }] },
    { id: "c5", name: "钱先生", phone: "135****8805", region: "闵行", budget: "300-400万", rooms: "2室", status: "战败", agent: "刘洋", level: "C", last: "06-12",
      follows: [{ date: "06-12", text: "预算不足，暂缓购房" }] },
  ],
};
