const hotSearchWords = [
  { rank: 1, word: "中芯国际 调薪", hot: true },
  { rank: 2, word: "N3 良率", hot: true },
  { rank: 3, word: "CMP scratch 排查", hot: false },
  { rank: 4, word: "25 届秋招 offer", hot: true },
  { rank: 5, word: "ASML EUV", hot: false },
  { rank: 6, word: "长鑫存储 扩产", hot: false },
  { rank: 7, word: "工艺转设备", hot: false },
  { rank: 8, word: "CoWoS 产能", hot: false },
];

const searchResultPosts = [
  {
    postId: "sp-001",
    title: "N+1 良率爬坡速度大家怎么看？",
    content: "最近我们线上的良率爬坡节奏偏慢，想看看其他 fab 的经验。",
    author: { nickname: "李工", role: "设备工程师" },
    topicName: "工艺经验",
    likeCount: 47,
    commentCount: 12,
    time: "2 小时前",
    matchHighlight: "良率爬坡",
  },
  {
    postId: "sp-002",
    title: "CMP Pad 寿命异常排查记录",
    content: "分享一个 pad 寿命异常案例，从参数漂移到耗材批次做了完整排查。",
    author: { nickname: "赵工", role: "工艺工程师" },
    topicName: "设备运维",
    likeCount: 89,
    commentCount: 23,
    time: "5 小时前",
    matchHighlight: "CMP Pad",
  },
  {
    postId: "sp-003",
    title: "25 届半导体秋招 offer 汇总",
    content: "整理一份今年秋招的薪资和岗位数据，欢迎补充。",
    author: { nickname: "匿名用户", role: "" },
    topicName: "求职招聘",
    likeCount: 234,
    commentCount: 89,
    time: "1 天前",
    matchHighlight: "秋招 offer",
  },
];

const searchResultUsers = [
  { userId: "u201", nickname: "李工", role: "设备工程师", company: "中芯国际", postCount: 23, followerCount: 156 },
  { userId: "u204", nickname: "王工", role: "工艺工程师", company: "长鑫存储", postCount: 45, followerCount: 312 },
  { userId: "u206", nickname: "封测老哥", role: "封测工程师", company: "长电科技", postCount: 67, followerCount: 489 },
];

module.exports = { hotSearchWords, searchResultPosts, searchResultUsers };
