// mock/searchData.js
// 纯前端展示用，后续替换为 API 调用

const hotSearchWords = [
  { rank: 1, word: "中芯国际年终奖", hot: true },
  { rank: 2, word: "N3 良率", hot: true },
  { rank: 3, word: "CMP scratch 排查", hot: false },
  { rank: 4, word: "25届秋招 offer 对比", hot: true },
  { rank: 5, word: "ASML EUV 交付", hot: false },
  { rank: 6, word: "长鑫存储扩产", hot: false },
  { rank: 7, word: "工艺转设备值得吗", hot: false },
  { rank: 8, word: "CoWoS 产能瓶颈", hot: false },
  { rank: 9, word: "华虹 BCD 工艺", hot: false },
  { rank: 10, word: "半导体行业薪资", hot: true },
];

const searchResultPosts = [
  {
    postId: "sp-001", title: "N+1 良率爬坡速度大家觉得怎么样？",
    content: "最近我们线上 N+1 node 的良率爬坡有点慢，想看看其他 fab 的情况...",
    author: { nickname: "李工", role: "设备工程师" }, zoneName: "CMP技术专区",
    likeCount: 47, commentCount: 12, time: "2小时前",
    matchHighlight: "良率爬坡",
  },
  {
    postId: "sp-002", title: "CMP Pad 寿命异常排查记录",
    content: "分享一下最近遇到的 CMP pad 寿命异常问题，IC1010 用了不到 200 wafers...",
    author: { nickname: "赵工", role: "工艺工程师" }, zoneName: "CMP技术专区",
    likeCount: 89, commentCount: 23, time: "5小时前",
    matchHighlight: "CMP Pad",
  },
  {
    postId: "sp-003", title: "25届半导体秋招 offer 汇总帖",
    content: "汇总一下今年各家给的 offer 情况，欢迎补充...",
    author: { nickname: "匿名芯片人", role: "" }, zoneName: "校园招聘",
    likeCount: 234, commentCount: 89, time: "1天前",
    matchHighlight: "秋招 offer",
  },
  {
    postId: "sp-004", title: "FinFET 工艺节点对比：N5 vs N3",
    content: "从 fin pitch、gate length、metal layers 几个维度做个对比...",
    author: { nickname: "王工", role: "整合工程师" }, zoneName: "FinFET",
    likeCount: 156, commentCount: 34, time: "2天前",
    matchHighlight: "FinFET",
  },
  {
    postId: "sp-005", title: "中芯国际 2025 年工艺岗面试经验分享",
    content: "三轮面试，一面技术、二面主管、三面 HR，分享一下每轮的问题...",
    author: { nickname: "小刘", role: "在校学生" }, zoneName: "中芯国际",
    likeCount: 112, commentCount: 56, time: "3天前",
    matchHighlight: "中芯国际",
  },
  {
    postId: "sp-006", title: "Wet Etch 均匀性调优经验分享",
    content: "最近优化了一下 wet etch 的均匀性，从 3% 提升到了 1.5%...",
    author: { nickname: "陈工", role: "工艺工程师" }, zoneName: "工艺工程师",
    likeCount: 78, commentCount: 19, time: "4天前",
    matchHighlight: "Wet Etch",
  },
];

const searchResultZones = [
  { zoneId: "cmp", name: "CMP技术专区", memberCount: 1280, postCount: 356, description: "化学机械抛光技术交流" },
  { zoneId: "finfet", name: "FinFET", memberCount: 890, postCount: 234, description: "FinFET 工艺与器件讨论" },
  { zoneId: "smic", name: "中芯国际", memberCount: 2560, postCount: 1023, description: "SMIC 员工 & 求职者交流" },
  { zoneId: "campus-recruit", name: "校园招聘", memberCount: 3200, postCount: 567, description: "半导体校招信息汇总" },
];

const searchResultUsers = [
  { userId: "u201", nickname: "李工", role: "设备工程师", company: "中芯国际", postCount: 23, followerCount: 156 },
  { userId: "u204", nickname: "王工", role: "工艺工程师", company: "长鑫存储", postCount: 45, followerCount: 312 },
  { userId: "u206", nickname: "封测老哥", role: "封测工程师", company: "长电科技", postCount: 67, followerCount: 489 },
];

module.exports = { hotSearchWords, searchResultPosts, searchResultZones, searchResultUsers };
