const newsList = [
  {
    id: "news_001",
    tags: [
      { text: "行业", type: "blue" },
      { text: "重磅", type: "green" }
    ],
    title: "中芯国际 Q1 财报超预期：14nm 产能利用率突破 90%，N+1 节点研发取得关键进展",
    source: "半导体行业观察",
    time: "2026-04-16T08:00:00+08:00",
    views: 1200,
    category: "industry",
    content:
      "<p>中芯国际在最新季度财报中披露，成熟制程维持高稼动率，14nm 产线连续两个季度提升产能利用率。</p><p>公司同时表示，面向车规与工业控制的客户订单保持稳定，先进封装与特色工艺需求也在同步增长。</p><p>管理层强调，研发节奏将继续围绕良率、IP 生态和交付效率展开，以降低客户导入门槛。</p>"
  },
  {
    id: "news_002",
    tags: [{ text: "企业", type: "orange" }],
    title: "北方华创发布新一代 12 英寸刻蚀设备，良率对标国际一线水平",
    source: "芯智讯",
    time: "2026-04-16T06:10:00+08:00",
    views: 856,
    category: "company",
    content:
      "<p>北方华创发布新一代 12 英寸刻蚀设备，重点覆盖逻辑与存储的高深宽比结构场景。</p><p>根据发布会信息，新设备在腔体稳定性、颗粒控制与维护周期方面都有明显提升。</p>"
  },
  {
    id: "news_003",
    tags: [{ text: "技术", type: "purple" }],
    title: "FinFET 到 GAA：三星 vs 台积电下一代晶体管架构路线深度对比",
    source: "工艺派",
    time: "2026-04-16T05:30:00+08:00",
    views: 2143,
    category: "knowledge",
    content:
      "<p>GAA 正在成为先进制程的新主线，但不同厂商在 nanosheet 宽度控制、接触电阻和设计生态上的方案差异明显。</p><p>本文从工艺复杂度、成本与设计迁移三个维度做了对比。</p>"
  },
  {
    id: "news_004",
    tags: [
      { text: "知识", type: "mint" },
      { text: "EDA", type: "blue" }
    ],
    title: "DFM 为什么越来越重要：从热点图到签核闭环，先进节点设计方法在变化",
    source: "EDA Frontline",
    time: "2026-04-15T21:00:00+08:00",
    views: 633,
    category: "knowledge",
    content:
      "<p>在先进节点，设计与制造协同正从签核环节前移到版图规划与工艺窗口评估阶段。</p><p>DFM 工具链正在由孤立工具演变为贯穿设计流的基础能力。</p>"
  },
  {
    id: "news_005",
    tags: [{ text: "行业", type: "blue" }],
    title: "国产功率半导体需求回暖，车规 SiC 模块供应链进入验证加速期",
    source: "新材料在线",
    time: "2026-04-15T18:20:00+08:00",
    views: 977,
    category: "industry",
    content:
      "<p>随着新能源车和储能系统扩产，SiC 模块封装、衬底与测试环节同步受益。</p><p>业内判断，下半年将进入新一轮验证放量窗口。</p>"
  },
  {
    id: "news_006",
    tags: [{ text: "企业", type: "orange" }],
    title: "长江存储扩招先进封装与良率团队，研发岗位向工艺整合倾斜",
    source: "半导体招聘内参",
    time: "2026-04-15T15:00:00+08:00",
    views: 1432,
    category: "company",
    content:
      "<p>长江存储近期面向封装整合、失效分析、设备工程等方向释放多个岗位，强调跨模块协同能力。</p>"
  },
  {
    id: "news_007",
    tags: [{ text: "推荐", type: "green" }],
    title: "一图看懂 CoWoS、InFO 与 FOPLP：先进封装三条主线的能力边界",
    source: "封装技术评论",
    time: "2026-04-15T13:40:00+08:00",
    views: 1840,
    category: "recommend",
    content:
      "<p>不同先进封装方案在带宽、散热、成本与供应链成熟度上的差异，决定了它们适配的芯片类型和量产节奏。</p>"
  },
  {
    id: "news_008",
    tags: [{ text: "趋势", type: "coral" }],
    title: "半导体设备本土替代进入深水区：从单点突破转向产线协同验证",
    source: "设备前沿",
    time: "2026-04-15T09:10:00+08:00",
    views: 1105,
    category: "recommend",
    content:
      "<p>设备替代不再只比单机参数，越来越多客户开始要求配套工艺包、售后响应与长期稳定性。</p>"
  }
];

const topicList = [
  { id: "topic_1", text: "秋招进展", type: "blue" },
  { id: "topic_2", text: "薪资爆料", type: "orange" },
  { id: "topic_3", text: "工艺讨论", type: "purple" },
  { id: "topic_4", text: "设备选型", type: "mint" },
  { id: "topic_5", text: "行业八卦", type: "coral" }
];

const postList = [
  {
    id: "post_001",
    category: "tech",
    author: {
      name: "张工_SMIC",
      avatarText: "张",
      avatarBg: "#dce8ff",
      avatarColor: "#185ec7",
      title: "工艺整合工程师 · 中芯国际"
    },
    content:
      "请教各位，28nm HKMG Gate-last 流程中 CMP 均匀性控制的经验？最近良率波动比较大，怀疑是 CMP 那步的问题。有没遇到过类似情况的？",
    topic: { text: "工艺讨论", type: "purple" },
    likes: 47,
    comments: 23,
    shares: 12,
    createdAt: "2026-04-16T09:10:00+08:00",
    commentsList: [
      {
        id: "c_001",
        user: "李老师",
        avatarText: "李",
        avatarBg: "#ddf5ee",
        avatarColor: "#12745a",
        content: "先拆模块看 blanket 与 product wafer 的趋势差异，通常先查 pad life 和 slurry 切换点。",
        likes: 8,
        time: "20 分钟前"
      },
      {
        id: "c_002",
        user: "Ming_FA",
        avatarText: "M",
        avatarBg: "#ecebff",
        avatarColor: "#5951d9",
        content: "如果是中心边缘分布突然变差，也要留意 retain ring 损耗和 platen 温控。",
        likes: 3,
        time: "12 分钟前"
      }
    ]
  },
  {
    id: "post_002",
    category: "job",
    author: {
      name: "Li_PE",
      avatarText: "Li",
      avatarBg: "#ddf5ee",
      avatarColor: "#12745a",
      title: "PE · 长江存储"
    },
    content:
      "长存 vs 合肥长鑫，存储赛道怎么选？本人 3 年 DRAM 经验，收到两边的 offer，纠结中。长存 232 层技术路线更激进，但合肥这边给的 package 更好，大家怎么看？",
    topic: { text: "求职交流", type: "blue" },
    likes: 89,
    comments: 56,
    shares: 21,
    createdAt: "2026-04-16T08:20:00+08:00",
    commentsList: [
      {
        id: "c_003",
        user: "匿名用户",
        avatarText: "匿",
        avatarBg: "#fdf0d8",
        avatarColor: "#a0691b",
        content: "如果你更看重简历含金量，长存更有话题；如果要短期现金流，长鑫可能更稳。",
        likes: 6,
        time: "35 分钟前"
      }
    ]
  },
  {
    id: "post_003",
    category: "career",
    author: {
      name: "匿名用户",
      avatarText: "王",
      avatarBg: "#fdf0d8",
      avatarColor: "#a05d18",
      title: "匿名发布"
    },
    content:
      "爆料一下，北方华创今年校招起薪调了，硕士 base 25k+ 签字费另算。不过加班强度也上去了，据说 PVD 事业部最近经常到 10 点……",
    topic: { text: "薪资爆料", type: "orange" },
    likes: 133,
    comments: 78,
    shares: 38,
    createdAt: "2026-04-15T20:00:00+08:00",
    commentsList: []
  },
  {
    id: "post_004",
    category: "hot",
    author: {
      name: "猎头Mia",
      avatarText: "猎",
      avatarBg: "#ecebff",
      avatarColor: "#5751d8",
      title: "芯片猎头 · 上海"
    },
    content:
      "最近 7nm 设计验证和版图工程师需求突然多起来了，尤其是 DDR PHY、SerDes 相关方向。感觉今年下半年高端设计岗位会比去年更热。",
    topic: { text: "行业八卦", type: "coral" },
    likes: 71,
    comments: 14,
    shares: 9,
    createdAt: "2026-04-15T17:30:00+08:00",
    commentsList: []
  },
  {
    id: "post_005",
    category: "tech",
    author: {
      name: "封测阿杜",
      avatarText: "杜",
      avatarBg: "#dbf4ee",
      avatarColor: "#257e66",
      title: "封装测试开发 · OSAT"
    },
    content:
      "CoWoS 的良率问题最近有新的公开资料吗？我们在做热循环实验，芯粒间互连的应力模型感觉和早期论文不太一致。",
    topic: { text: "设备选型", type: "mint" },
    likes: 58,
    comments: 19,
    shares: 11,
    createdAt: "2026-04-15T15:20:00+08:00",
    commentsList: []
  },
  {
    id: "post_006",
    category: "job",
    author: {
      name: "陈工_求职",
      avatarText: "陈",
      avatarBg: "#dce8ff",
      avatarColor: "#165dc6",
      title: "工艺整合工程师 · 5 年经验"
    },
    content:
      "最近在看机会，主方向是良率提升与失效分析，也能带一点跨模块整合。想问下现在上海和苏州 Fab 的工艺整合岗位面试重点差异大吗？",
    topic: { text: "秋招进展", type: "blue" },
    likes: 36,
    comments: 17,
    shares: 5,
    createdAt: "2026-04-15T12:40:00+08:00",
    commentsList: []
  }
];

const chatList = [
  {
    id: "chat_001",
    type: "private",
    name: "SMIC 招聘官",
    avatarText: "HR",
    avatarBg: "#dce8ff",
    avatarColor: "#185ec7",
    avatarShape: "circle",
    lastMessage: "您好，看到您的简历对 PE 岗位很匹配，方便聊一下吗？",
    time: "10:32",
    unread: 1,
    // === STEP 1.6 修改开始：私聊联系人追加 role 字段 ===
    role: "HR",
    // === STEP 1.6 修改结束 ===
  },
  {
    id: "chat_002",
    type: "group",
    name: "刻蚀工艺交流群",
    avatarText: "群",
    avatarBg: "#dbf4ee",
    avatarColor: "#22765d",
    avatarShape: "rounded",
    lastMessage: "[李工] ICP 的射频匹配网络参数大家一般怎么调？",
    time: "09:45",
    unread: 12
  },
  {
    id: "chat_003",
    type: "private",
    name: "Sarah_猎头",
    avatarText: "猎",
    avatarBg: "#ecebff",
    avatarColor: "#5751d8",
    avatarShape: "rounded",
    lastMessage: "华为海思有个 7nm 设计岗位，薪资 open，感兴趣吗？",
    time: "昨天",
    unread: 0,
    // === STEP 1.6 修改开始：私聊联系人追加 role 字段 ===
    role: "猎头",
    // === STEP 1.6 修改结束 ===
  },
  {
    id: "chat_004",
    type: "group",
    name: "2026 秋招互助群",
    avatarText: "群",
    avatarBg: "#fdf0d8",
    avatarColor: "#a06a18",
    avatarShape: "rounded",
    lastMessage: "[匿名] 有人拿到华虹的 offer 了吗？流程走到哪一步了？",
    time: "昨天",
    unread: 38
  },
  {
    id: "chat_005",
    type: "private",
    name: "王博_清华微电子",
    avatarText: "王",
    avatarBg: "#fbe9df",
    avatarColor: "#a55a31",
    avatarShape: "circle",
    lastMessage: "那篇 FinFET 的 paper 我发你邮箱了，注意看里面的 parasitic 分析。",
    time: "周一",
    unread: 0,
    // === STEP 1.6 修改开始：私聊联系人追加 role 字段 ===
    role: "研发工程师",
    // === STEP 1.6 修改结束 ===
  },
  {
    id: "chat_006",
    type: "group",
    name: "封装测试技术群",
    avatarText: "群",
    avatarBg: "#353430",
    avatarColor: "#efeae1",
    avatarShape: "rounded",
    lastMessage: "[赵工] CoWoS 的良率问题最近有什么进展没？",
    time: "周日",
    unread: 0
  },
  {
    id: "chat_007",
    type: "system",
    name: "系统通知",
    avatarText: "系",
    avatarBg: "#dce8ff",
    avatarColor: "#185ec7",
    avatarShape: "rounded",
    lastMessage: "你的简历已被 2 位招聘方浏览，建议补充最近项目经历。",
    time: "08:15",
    unread: 2
  }
];

const jobList = [
  {
    id: "job_001",
    title: "高级工艺整合工程师",
    company: "中芯国际",
    city: "上海",
    experience: "5-10 年",
    tags: ["14nm", "Gate-last", "良率提升"],
    salary: "40-60K",
    bonus: "16 薪",
    category: "process"
  },
  {
    id: "job_002",
    title: "存储器版图设计工程师",
    company: "长江存储",
    city: "武汉",
    experience: "3-5 年",
    tags: ["DRAM", "Layout", "DDR PHY"],
    salary: "35-55K",
    bonus: "15 薪",
    category: "design"
  },
  {
    id: "job_003",
    title: "先进封装工艺开发",
    company: "通富微电",
    city: "苏州",
    experience: "3-8 年",
    tags: ["CoWoS", "RDL", "热应力"],
    salary: "30-45K",
    bonus: "14 薪",
    category: "package"
  },
  {
    id: "job_004",
    title: "刻蚀设备工程师",
    company: "北方华创",
    city: "北京",
    experience: "2-6 年",
    tags: ["Etch", "腔体维护", "SPC"],
    salary: "28-42K",
    bonus: "14 薪",
    category: "equipment"
  },
  {
    id: "job_005",
    title: "EDA 应用工程师",
    company: "华大九天",
    city: "南京",
    experience: "3-7 年",
    tags: ["DFM", "Signoff", "脚本开发"],
    salary: "32-48K",
    bonus: "15 薪",
    category: "eda"
  }
];

const talentList = [
  {
    id: "talent_001",
    uid: "mock_talent_001",
    name: "陈**",
    education: "硕士",
    school: "清华大学 · 微电子",
    years: 5,
    currentRole: "某 Fab 工艺工程师",
    targetRole: "工艺整合",
    tags: ["FinFET", "CMP", "良率分析"],
    status: "在看机会",
    avatarText: "陈",
    avatarBg: "#dce8ff",
    avatarColor: "#165dc6"
  },
  {
    id: "talent_002",
    uid: "mock_talent_002",
    name: "周**",
    education: "博士",
    school: "复旦大学 · 材料",
    years: 4,
    currentRole: "材料研发工程师",
    targetRole: "薄膜工艺",
    tags: ["ALD", "PVD", "表征分析"],
    status: "主动求职",
    avatarText: "周",
    avatarBg: "#ddf5ee",
    avatarColor: "#157658"
  },
  {
    id: "talent_003",
    uid: "mock_talent_003",
    name: "林**",
    education: "硕士",
    school: "上海交大 · 集成电路",
    years: 6,
    currentRole: "封装开发工程师",
    targetRole: "先进封装整合",
    tags: ["CoWoS", "TSV", "热仿真"],
    status: "在看机会",
    avatarText: "林",
    avatarBg: "#ecebff",
    avatarColor: "#5951d9"
  },
  {
    id: "talent_004",
    uid: "mock_talent_004",
    name: "何**",
    education: "本科",
    school: "西电 · 微电子",
    years: 3,
    currentRole: "设备工程师",
    targetRole: "工艺设备协同",
    tags: ["Etch", "故障诊断", "SPC"],
    status: "暂不考虑",
    avatarText: "何",
    avatarBg: "#fdf0d8",
    avatarColor: "#9d6615"
  }
];

const userProfile = {
  name: "陈工",
  avatarText: "陈",
  title: "工艺整合工程师 · 5 年经验",
  experience: "5 年经验",
  jobStatus: "open",
  stats: { posts: 23, likes: 156, following: 89 }
};

const quickNavList = [
  { id: "q1", icon: "IC", label: "行业快讯", bg: "#dce8ff", color: "#165dc6" },
  { id: "q2", icon: "K", label: "知识库", bg: "#ddf5ee", color: "#157658" },
  { id: "q3", icon: "F", label: "企业动态", bg: "#fdf0d8", color: "#9d6615" },
  { id: "q4", icon: "R", label: "研报精选", bg: "#ecebff", color: "#5951d9" }
];

const homeBanner = {
  title: "人才市场 － 求职 · 招聘双通道",
  subtitle: "432 个在招岗位 · 1,280 位活跃候选人"
};

module.exports = {
  newsList,
  postList,
  chatList,
  jobList,
  talentList,
  userProfile,
  topicList,
  quickNavList,
  homeBanner
};
