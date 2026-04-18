/**
 * 社区页专区 Mock 数据
 * ⚠️ 此文件保留备用，社区页已在 Step 2.5 切换为 API 数据源
 * 保留原因：方便回滚和调试、其他开发者参考数据格式、未来可能用于离线模式或测试
 */

const myZones = [
  { zoneId: "smic", zoneName: "中芯国际", hasNew: true },
  { zoneId: "process-eng", zoneName: "工艺工程师", hasNew: false },
  { zoneId: "cmp", zoneName: "CMP技术", hasNew: true },
  { zoneId: "campus", zoneName: "校园求职", hasNew: true },
  { zoneId: "tea-room", zoneName: "晶圆茶水间", hasNew: false },
];

const zoneCategories = [
  { key: "company", name: "🏢 公司" },
  { key: "role", name: "🔧 工种" },
  { key: "tech", name: "🧪 技术" },
  { key: "campus", name: "🎓 校园" },
  { key: "supply", name: "📦 供应链" },
  { key: "region", name: "📍 地区" },
];

const zonesByCategory = {
  company: [
    { zoneId: "smic", zoneName: "中芯国际", memberCount: "12.5k", todayPosts: 128, isJoined: true },
    { zoneId: "cxmt", zoneName: "长鑫存储", memberCount: "15.1k", todayPosts: 203, isJoined: false },
    { zoneId: "ymtc", zoneName: "长江存储", memberCount: "13.8k", todayPosts: 176, isJoined: false },
    { zoneId: "naura", zoneName: "北方华创", memberCount: "6.8k", todayPosts: 56, isJoined: false },
    { zoneId: "amec", zoneName: "中微半导体", memberCount: "4.1k", todayPosts: 28, isJoined: false },
  ],
  role: [
    { zoneId: "process-eng", zoneName: "工艺工程师", memberCount: "18.3k", todayPosts: 234, isJoined: true },
    { zoneId: "equip-eng", zoneName: "机械工程师", memberCount: "14.6k", todayPosts: 178, isJoined: false },
    { zoneId: "eda-eng", zoneName: "软件工程师", memberCount: "7.2k", todayPosts: 89, isJoined: false },
    { zoneId: "yield", zoneName: "EDA工程师", memberCount: "6.5k", todayPosts: 56, isJoined: false },
    { zoneId: "packaging", zoneName: "封测工程师", memberCount: "8.9k", todayPosts: 93, isJoined: false },
    { zoneId: "integration", zoneName: "整合工程师", memberCount: "5.1k", todayPosts: 42, isJoined: false },
    { zoneId: "purchase", zoneName: "采购", memberCount: "4.3k", todayPosts: 31, isJoined: false },
    { zoneId: "hr-zone", zoneName: "HR", memberCount: "6.7k", todayPosts: 78, isJoined: false },
    { zoneId: "quality", zoneName: "品质工程师", memberCount: "3.9k", todayPosts: 24, isJoined: false },
    { zoneId: "scm", zoneName: "供应链管理", memberCount: "3.2k", todayPosts: 18, isJoined: false },
  ],
  tech: [
    { zoneId: "finfet", zoneName: "FinFET", memberCount: "11.2k", todayPosts: 145, isJoined: false },
    { zoneId: "gaa", zoneName: "GAA", memberCount: "8.7k", todayPosts: 112, isJoined: false },
    { zoneId: "cmp", zoneName: "CMP", memberCount: "6.3k", todayPosts: 67, isJoined: true },
    { zoneId: "dfm", zoneName: "DFM", memberCount: "4.8k", todayPosts: 38, isJoined: false },
    { zoneId: "hbm", zoneName: "HBM", memberCount: "9.5k", todayPosts: 134, isJoined: false },
    { zoneId: "adv-pkg", zoneName: "先进封装", memberCount: "10.1k", todayPosts: 156, isJoined: false },
    { zoneId: "sic-gan", zoneName: "SiC/GaN", memberCount: "7.6k", todayPosts: 89, isJoined: false },
    { zoneId: "litho", zoneName: "光刻", memberCount: "8.4k", todayPosts: 98, isJoined: false },
    { zoneId: "metrology", zoneName: "量测", memberCount: "4.2k", todayPosts: 29, isJoined: false },
    { zoneId: "thin-film", zoneName: "薄膜沉积", memberCount: "5.7k", todayPosts: 45, isJoined: false },
    { zoneId: "etch", zoneName: "刻蚀", memberCount: "6.1k", todayPosts: 52, isJoined: false },
    { zoneId: "implant", zoneName: "离子注入", memberCount: "3.8k", todayPosts: 21, isJoined: false },
  ],
  campus: [
    { zoneId: "intern", zoneName: "实习交流", memberCount: "12.3k", todayPosts: 189, isJoined: false },
    { zoneId: "campus-recruit", zoneName: "校园招聘", memberCount: "15.6k", todayPosts: 245, isJoined: true },
    { zoneId: "interview-exp", zoneName: "面经分享", memberCount: "11.8k", todayPosts: 167, isJoined: false },
    { zoneId: "advisor", zoneName: "导师评价", memberCount: "4.5k", todayPosts: 34, isJoined: false },
    { zoneId: "thesis", zoneName: "论文讨论", memberCount: "5.2k", todayPosts: 41, isJoined: false },
    { zoneId: "abroad", zoneName: "留学申请", memberCount: "3.1k", todayPosts: 23, isJoined: false },
  ],
  supply: [
    { zoneId: "equip-buy", zoneName: "设备采购", memberCount: "5.8k", todayPosts: 67, isJoined: false },
    { zoneId: "material", zoneName: "材料供应", memberCount: "4.3k", todayPosts: 45, isJoined: false },
    { zoneId: "spare-parts", zoneName: "备件询盘", memberCount: "3.6k", todayPosts: 38, isJoined: false },
    { zoneId: "alternatives", zoneName: "替代方案", memberCount: "6.2k", todayPosts: 52, isJoined: false },
    { zoneId: "supplier-review", zoneName: "供应商评价", memberCount: "4.7k", todayPosts: 31, isJoined: false },
  ],
  region: [
    { zoneId: "shanghai", zoneName: "上海", memberCount: "22.3k", todayPosts: 345, isJoined: false },
    { zoneId: "wuxi", zoneName: "无锡", memberCount: "12.8k", todayPosts: 178, isJoined: false },
    { zoneId: "hefei", zoneName: "合肥", memberCount: "14.5k", todayPosts: 213, isJoined: false },
    { zoneId: "wuhan", zoneName: "武汉", memberCount: "13.2k", todayPosts: 198, isJoined: false },
    { zoneId: "shenzhen", zoneName: "深圳", memberCount: "11.6k", todayPosts: 156, isJoined: false },
    { zoneId: "xian", zoneName: "西安", memberCount: "8.4k", todayPosts: 98, isJoined: false },
    { zoneId: "suzhou", zoneName: "苏州", memberCount: "9.7k", todayPosts: 123, isJoined: false },
    { zoneId: "beijing", zoneName: "北京", memberCount: "10.3k", todayPosts: 134, isJoined: false },
    { zoneId: "chengdu", zoneName: "成都", memberCount: "7.1k", todayPosts: 78, isJoined: false },
    { zoneId: "dalian", zoneName: "大连", memberCount: "5.6k", todayPosts: 45, isJoined: false },
  ],
};

module.exports = {
  myZones,
  zoneCategories,
  zonesByCategory,
};
