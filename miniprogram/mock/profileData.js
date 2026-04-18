// mock/profileData.js

const myProfile = {
  userId: "u-self",
  nickname: "芯片小王子",
  avatar: null,
  role: "工艺工程师",
  company: "中芯国际",
  experience: "5年",
  bio: "专注 CMP 工艺 | N+1 良率爬坡中 | 欢迎交流",
  joinedDate: "2023-06-15",
  stats: {
    postCount: 23,
    followerCount: 156,
    followingCount: 48,
    likeReceivedCount: 1280,
    favoriteCount: 67,
  },
  badges: [
    { id: "b1", name: "优质创作者", icon: "✍️" },
    { id: "b2", name: "CMP专区活跃", icon: "🔬" },
    { id: "b3", name: "百赞达人", icon: "👍" },
  ],
  joinedZones: [
    { zoneId: "cmp", name: "CMP技术专区" },
    { zoneId: "smic", name: "中芯国际" },
    { zoneId: "process-eng", name: "工艺工程师" },
    { zoneId: "tea-room", name: "晶圆茶水间" },
    { zoneId: "campus-recruit", name: "校园招聘" },
  ],
};

const myPosts = [
  {
    postId: "mp-001", title: "N+1 良率爬坡速度大家觉得怎么样？",
    contentType: "discuss", zoneName: "CMP技术专区",
    likeCount: 47, commentCount: 12, viewCount: 890,
    createdAt: "2天前", isTop: false, isBest: true,
  },
  {
    postId: "mp-002", title: "CMP Pad 寿命异常排查记录",
    contentType: "discuss", zoneName: "CMP技术专区",
    likeCount: 89, commentCount: 23, viewCount: 1560,
    createdAt: "5天前", isTop: false, isBest: false,
  },
  {
    postId: "mp-003", title: "中芯食堂新菜单测评",
    contentType: "life", zoneName: "晶圆茶水间",
    likeCount: 34, commentCount: 67, viewCount: 2340,
    createdAt: "1周前", isTop: false, isBest: false,
    isAnonymous: true,
  },
  {
    postId: "mp-004", title: "FinFET 工艺节点对比：N5 vs N3",
    contentType: "discuss", zoneName: "FinFET",
    likeCount: 156, commentCount: 34, viewCount: 3450,
    createdAt: "2周前", isTop: false, isBest: true,
  },
  {
    postId: "mp-005", title: "求助：ALD 薄膜应力太大怎么处理？",
    contentType: "qa", zoneName: "工艺工程师",
    likeCount: 23, commentCount: 8, viewCount: 567,
    createdAt: "3周前", isTop: false, isBest: false,
  },
];

const myFavorites = [
  {
    postId: "fav-001", title: "先进封装 CoWoS 和 InFO 怎么选？",
    author: { nickname: "封测老哥", role: "封测工程师" },
    zoneName: "先进封装技术", likeCount: 234, commentCount: 56,
    savedAt: "1天前",
  },
  {
    postId: "fav-002", title: "华大九天和 Cadence 的 DRC 引擎对比",
    author: { nickname: "刘工", role: "EDA工程师" },
    zoneName: "EDA/IC设计", likeCount: 178, commentCount: 45,
    savedAt: "3天前",
  },
  {
    postId: "fav-003", title: "8寸线转12寸线技术栈差异大吗？",
    author: { nickname: "王工", role: "工艺工程师" },
    zoneName: "工艺工程师", likeCount: 67, commentCount: 23,
    savedAt: "1周前",
  },
  {
    postId: "fav-004", title: "25届秋招半导体 offer 汇总帖",
    author: { nickname: "小刘", role: "在校学生" },
    zoneName: "校园招聘", likeCount: 345, commentCount: 123,
    savedAt: "1周前",
  },
  {
    postId: "fav-005", title: "碳化硅衬底 micropipe density 国产 vs 进口",
    author: { nickname: "孙工", role: "材料工程师" },
    zoneName: "SiC/GaN 三代半", likeCount: 89, commentCount: 34,
    savedAt: "2周前",
  },
];

const myFollowing = [
  { userId: "u201", nickname: "李工", role: "设备工程师", company: "中芯国际", postCount: 23, isFollowed: true },
  { userId: "u204", nickname: "王工", role: "工艺工程师", company: "长鑫存储", postCount: 45, isFollowed: true },
  { userId: "u206", nickname: "封测老哥", role: "封测工程师", company: "长电科技", postCount: 67, isFollowed: true },
  { userId: "u208", nickname: "光刻小妹", role: "工艺工程师", company: "华虹半导体", postCount: 12, isFollowed: true },
  { userId: "u210", nickname: "半导体老兵", role: "技术总监", company: "北方华创", postCount: 89, isFollowed: true },
];

const myFollowers = [
  { userId: "u301", nickname: "小陈", role: "在校学生", company: "复旦大学", isFollowedBack: true },
  { userId: "u302", nickname: "张工", role: "良率分析师", company: "华虹半导体", isFollowedBack: false },
  { userId: "u303", nickname: "品质小张", role: "品质工程师", company: "长电科技", isFollowedBack: false },
  { userId: "u304", nickname: "Mike Wang", role: "FAE", company: "ASML", isFollowedBack: true },
  { userId: "u305", nickname: "实习生小李", role: "实习生", company: "长鑫存储", isFollowedBack: false },
  { userId: "u306", nickname: "采购张姐", role: "采购经理", company: "中芯国际", isFollowedBack: true },
];

const myViewHistory = [
  { postId: "vh-001", title: "ASML EUV 光刻机最新交付情况", zoneName: "设备采购", viewedAt: "今天 14:30" },
  { postId: "vh-002", title: "中芯国际 2025 年调薪方案讨论", zoneName: "中芯国际", viewedAt: "今天 10:15" },
  { postId: "vh-003", title: "HBM3e 良率提升路径分析", zoneName: "HBM", viewedAt: "昨天 22:00" },
  { postId: "vh-004", title: "半导体设备工程师转工艺值得吗？", zoneName: "晶圆茶水间", viewedAt: "昨天 18:30" },
  { postId: "vh-005", title: "Lam Research etch 设备常见故障排查", zoneName: "设备工程师", viewedAt: "前天" },
];

const CONTENT_TYPE_MAP = {
  discuss: "讨论", qa: "问答", interview: "面经", recruit: "招聘",
  paper: "论文", demand: "需求", news: "新闻", chat: "闲聊", life: "生活",
};

module.exports = { myProfile, myPosts, myFavorites, myFollowing, myFollowers, myViewHistory, CONTENT_TYPE_MAP };
