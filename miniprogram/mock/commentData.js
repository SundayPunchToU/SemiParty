// mock/commentData.js
// ⚠️ 后续步骤会复用，独立文件存放

const mockComments = [
  {
    commentId: "c-001",
    floor: 1,
    author: { userId: "u201", nickname: "李工", avatar: null, role: "设备工程师", experience: "5年" },
    content: "良率爬坡这块确实是个系统工程，我们线上之前也遇到过类似问题，最后发现是 CMP 后清洗不够干净导致的 defect 偏高。建议先跑一轮 defect pareto 看看 top killer 是什么。",
    images: [],
    attachments: [],
    likeCount: 47,
    isLiked: false,
    replyCount: 3,
    createdAt: "2小时前",
    replies: [
      {
        replyId: "r-001",
        author: { userId: "u202", nickname: "赵工", avatar: null, role: "良率分析师" },
        content: "同意楼上，我们 N+1 爬坡期 top killer 就是 CMP scratch，后来换了 pad 型号才解决。",
        replyTo: { userId: "u201", nickname: "李工" },
        likeCount: 12,
        isLiked: false,
        createdAt: "1小时前",
      },
      {
        replyId: "r-002",
        author: { userId: "u203", nickname: "匿名芯片人", avatar: null, role: "" },
        content: "请问换的哪个型号的 pad？IC1010 还是 IC1000？",
        replyTo: { userId: "u202", nickname: "赵工" },
        likeCount: 3,
        isLiked: false,
        createdAt: "45分钟前",
      },
      {
        replyId: "r-003",
        author: { userId: "u202", nickname: "赵工", avatar: null, role: "良率分析师" },
        content: "IC1010，配合 Cabot 的 slurry 效果不错，scratch 降了一个数量级。",
        replyTo: { userId: "u203", nickname: "匿名芯片人" },
        likeCount: 8,
        isLiked: false,
        createdAt: "30分钟前",
      },
    ],
  },
  {
    commentId: "c-002",
    floor: 2,
    author: { userId: "u204", nickname: "王工", avatar: null, role: "工艺工程师", experience: "8年" },
    content: "我们的经验是爬坡期不要急着提 throughput，先把 baseline yield 稳住。另外 WAT 的 spec 可以适当放宽一点，后面再逐步收紧。",
    images: [],
    attachments: [
      { fileId: "att-001", fileName: "良率爬坡SOP_v2.pdf", fileSize: "2.3 MB", fileType: "pdf" },
    ],
    likeCount: 89,
    isLiked: true,
    replyCount: 5,
    createdAt: "1小时前",
    replies: [
      {
        replyId: "r-004",
        author: { userId: "u205", nickname: "小陈", avatar: null, role: "在校学生" },
        content: "王工这个 SOP 文档太有用了，收藏了！请问 WAT spec 一般放宽多少合适？",
        replyTo: null,
        likeCount: 5,
        isLiked: false,
        createdAt: "50分钟前",
      },
      {
        replyId: "r-005",
        author: { userId: "u204", nickname: "王工", avatar: null, role: "工艺工程师" },
        content: "看具体 parameter，一般 Vth 可以放 ±10%，Ron 放 ±15%，具体还是要看你们的 product spec。",
        replyTo: { userId: "u205", nickname: "小陈" },
        likeCount: 15,
        isLiked: false,
        createdAt: "40分钟前",
      },
    ],
  },
  {
    commentId: "c-003",
    floor: 3,
    author: { userId: "u206", nickname: "封测老哥", avatar: null, role: "封测工程师", experience: "10年+" },
    content: "前道良率上不去，后道更难受。我们这边 CP yield 掉了 2%，封装后 FT yield 直接掉了 5%。\n\n附一张我们最近的 yield trend，大家参考：",
    images: ["placeholder_yield_trend.png"],
    attachments: [
      { fileId: "att-002", fileName: "FT_Yield_Trend_Q4.xlsx", fileSize: "856 KB", fileType: "xlsx" },
      { fileId: "att-003", fileName: "CP_vs_FT_对比分析.pdf", fileSize: "1.1 MB", fileType: "pdf" },
    ],
    likeCount: 156,
    isLiked: false,
    replyCount: 8,
    createdAt: "45分钟前",
    replies: [
      {
        replyId: "r-006",
        author: { userId: "u207", nickname: "品质小张", avatar: null, role: "品质工程师" },
        content: "这个 CP 到 FT 的 yield loss 也太大了，是不是有 package stress 相关的失效？",
        replyTo: null,
        likeCount: 7,
        isLiked: false,
        createdAt: "35分钟前",
      },
      {
        replyId: "r-007",
        author: { userId: "u206", nickname: "封测老哥", avatar: null, role: "封测工程师" },
        content: "对，FA 下来主要是 wire bond 相关的 open/short，跟前道 pad metal 质量有关。",
        replyTo: { userId: "u207", nickname: "品质小张" },
        likeCount: 11,
        isLiked: false,
        createdAt: "25分钟前",
      },
    ],
  },
  {
    commentId: "c-004",
    floor: 4,
    author: { userId: "u208", nickname: "光刻小妹", avatar: null, role: "工艺工程师", experience: "3年" },
    content: "新人冒昧问一下，良率爬坡期一般要多久才算正常？我们线刚量产3个月，yield 还在 60% 左右徘徊……",
    images: [],
    attachments: [],
    likeCount: 23,
    isLiked: false,
    replyCount: 2,
    createdAt: "20分钟前",
    replies: [
      {
        replyId: "r-008",
        author: { userId: "u204", nickname: "王工", avatar: null, role: "工艺工程师" },
        content: "看节点和产品复杂度。成熟节点半年到一年，先进节点一两年都正常。60% 在初期不算差，关键是 trend 要持续向上。",
        replyTo: null,
        likeCount: 31,
        isLiked: false,
        createdAt: "15分钟前",
      },
    ],
  },
  {
    commentId: "c-005",
    floor: 5,
    author: { userId: "u209", nickname: "系统", avatar: null, role: "" },
    content: "💡 本帖已被设为 [CMP技术专区] 精华帖",
    images: [],
    attachments: [],
    likeCount: 0,
    isLiked: false,
    replyCount: 0,
    createdAt: "10分钟前",
    isSystem: true,
    replies: [],
  },
];

// 帖子正文附件 mock
const postAttachments = [
  { fileId: "post-att-001", fileName: "N+1节点良率分析报告.pdf", fileSize: "4.2 MB", fileType: "pdf", downloadCount: 128 },
  { fileId: "post-att-002", fileName: "Defect_Pareto_数据.xlsx", fileSize: "1.8 MB", fileType: "xlsx", downloadCount: 67 },
  { fileId: "post-att-003", fileName: "工艺参数对比表.docx", fileSize: "523 KB", fileType: "docx", downloadCount: 45 },
];

module.exports = {
  mockComments,
  postAttachments
};
