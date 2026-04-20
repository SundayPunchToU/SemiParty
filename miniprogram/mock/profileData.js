const myProfile = {
  userId: "u-self",
  nickname: "晶圆小王",
  avatar: null,
  role: "工艺工程师",
  company: "中芯国际",
  experience: "5 年经验",
  bio: "关注先进制程、工艺整合和求职交流。",
  joinedDate: "2023-06-15",
  stats: {
    postCount: 23,
    followerCount: 156,
    followingCount: 48,
    likeReceivedCount: 1280,
    favoriteCount: 67,
  },
  badges: [
    { id: "b1", name: "优质创作者", icon: "优" },
    { id: "b2", name: "活跃讨论者", icon: "聊" },
    { id: "b3", name: "百赞作者", icon: "赞" },
  ],
};

const myPosts = [
  {
    postId: "mp-001",
    title: "N+1 良率爬坡速度大家怎么看？",
    contentType: "discuss",
    topicName: "工艺经验",
    likeCount: 47,
    commentCount: 12,
    viewCount: 890,
    createdAt: "2026-04-18 09:30:00",
    isBest: true,
  },
  {
    postId: "mp-002",
    title: "CMP Pad 寿命异常排查记录",
    contentType: "discuss",
    topicName: "设备运维",
    likeCount: 89,
    commentCount: 23,
    viewCount: 1560,
    createdAt: "2026-04-15 21:10:00",
  },
  {
    postId: "mp-003",
    title: "最近食堂新菜值得排队吗？",
    contentType: "life",
    topicName: "职场生活",
    likeCount: 34,
    commentCount: 67,
    viewCount: 2340,
    createdAt: "2026-04-12 12:15:00",
    isAnonymous: true,
  },
  {
    postId: "mp-004",
    title: "FinFET 节点对比：N5 和 N3 的取舍",
    contentType: "discuss",
    topicName: "行业观察",
    likeCount: 156,
    commentCount: 34,
    viewCount: 3450,
    createdAt: "2026-04-10 20:00:00",
    isBest: true,
  },
];

const myFavorites = [
  {
    postId: "fav-001",
    title: "先进封装 CoWoS 与 InFO 怎么选？",
    author: { nickname: "封测老哥", role: "封测工程师" },
    topicName: "封装测试",
    likeCount: 234,
    commentCount: 56,
    savedAt: "1 天前",
  },
  {
    postId: "fav-002",
    title: "Cadence DRC 引擎经验总结",
    author: { nickname: "刘工", role: "EDA 工程师" },
    topicName: "工具生态",
    likeCount: 178,
    commentCount: 45,
    savedAt: "3 天前",
  },
  {
    postId: "fav-003",
    title: "25 届秋招 offer 对比汇总",
    author: { nickname: "小刘", role: "在校学生" },
    topicName: "求职招聘",
    likeCount: 345,
    commentCount: 123,
    savedAt: "1 周前",
  },
];

const myFollowing = [
  { userId: "u201", nickname: "李工", role: "设备工程师", company: "中芯国际", postCount: 23, isFollowed: true },
  { userId: "u204", nickname: "王工", role: "工艺工程师", company: "长鑫存储", postCount: 45, isFollowed: true },
  { userId: "u206", nickname: "封测老哥", role: "封测工程师", company: "长电科技", postCount: 67, isFollowed: true },
];

const myFollowers = [
  { userId: "u301", nickname: "小陈", role: "在校学生", company: "复旦大学", isFollowedBack: true },
  { userId: "u302", nickname: "张工", role: "良率分析师", company: "华虹半导体", isFollowedBack: false },
  { userId: "u303", nickname: "Mike Wang", role: "FAE", company: "ASML", isFollowedBack: true },
];

const myViewHistory = [
  { postId: "vh-001", title: "ASML EUV 最新交付情况", topicName: "行业观察", viewedAt: "今天 14:30" },
  { postId: "vh-002", title: "中芯国际 2026 年调薪方案讨论", topicName: "职场生活", viewedAt: "今天 10:15" },
  { postId: "vh-003", title: "HBM3e 良率提升路径分析", topicName: "行业观察", viewedAt: "昨天 22:00" },
  { postId: "vh-004", title: "设备工程师转工艺值得吗？", topicName: "工艺经验", viewedAt: "昨天 18:30" },
];

const CONTENT_TYPE_MAP = {
  discuss: "讨论",
  qa: "问答",
  interview: "面经",
  recruit: "招聘",
  paper: "论文",
  demand: "需求",
  news: "资讯",
  chat: "闲聊",
  life: "生活",
};

module.exports = { myProfile, myPosts, myFavorites, myFollowing, myFollowers, myViewHistory, CONTENT_TYPE_MAP };
