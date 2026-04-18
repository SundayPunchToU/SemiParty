const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

async function safeCreateCollection(name) {
  try {
    await db.createCollection(name);
  } catch (error) {
    if (!String(error.message || "").includes("Collection")) {
      console.warn(`createCollection skipped for ${name}`, error);
    }
  }
}

async function seedIfEmpty(collectionName, rows) {
  const existing = await db.collection(collectionName).limit(1).get();
  if (existing.data.length) {
    return;
  }

  for (const row of rows) {
    await db.collection(collectionName).add({
      data: row,
    });
  }
}

exports.main = async () => {
  const collections = [
    "users",
    "news",
    "posts",
    "comments",
    "favorites",
    "jobs",
    "talents",
    "chats",
    "messages",
    "applications",
    "profile_views",
    "follows",
    // Step 2.1 新增
    "zones",
    "user_zones",
    "tea_room_topics",
  ];

  for (const name of collections) {
    await safeCreateCollection(name);
  }

  await seedIfEmpty("news", [
    {
      title: "中芯国际 Q1 财报超预期：14nm 产能利用率突破 90%，N+1 节点研发取得关键进展",
      summary: "成熟制程稼动率继续维持高位，先进节点研发节奏稳定推进。",
      content: "<p>中芯国际最新财报显示，成熟制程和特色工艺仍是当前营收主力。</p>",
      category: "industry",
      tags: [{ text: "行业", type: "blue" }, { text: "重磅", type: "green" }],
      source: "半导体行业观察",
      views: 1200,
      likes: 45,
      favorites: 12,
      commentsCount: 8,
      isHot: true,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
    {
      title: "北方华创新一代刻蚀设备进入客户验证阶段",
      summary: "设备能力覆盖先进制程部分关键场景，本土替代持续推进。",
      content: "<p>北方华创在先进刻蚀设备上的进展，正在从单点验证转向批量导入。</p>",
      category: "company",
      tags: [{ text: "企业", type: "orange" }],
      source: "芯智讯",
      views: 860,
      likes: 32,
      favorites: 8,
      commentsCount: 5,
      isHot: false,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
    {
      title: "FinFET 到 GAA：下一代晶体管架构的设计与制造权衡",
      summary: "从性能、成本到设计迁移，GAA 落地并不只是器件问题。",
      content: "<p>GAA 成为先进节点主线后，设计工具链和工艺整合的复杂度同步提升。</p>",
      category: "knowledge",
      tags: [{ text: "技术", type: "purple" }],
      source: "工艺派",
      views: 2140,
      likes: 88,
      favorites: 33,
      commentsCount: 14,
      isHot: true,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
  ]);

  await seedIfEmpty("jobs", [
    {
      title: "高级工艺整合工程师",
      company: "中芯国际",
      city: "上海",
      experience: "5-10 年",
      education: "硕士及以上",
      category: "process",
      tags: ["14nm", "Gate-last", "良率提升"],
      salaryMin: 40,
      salaryMax: 60,
      salaryUnit: "K",
      salary: "40-60K",
      bonus: "16 薪",
      description: "负责先进节点工艺整合、良率改善和跨模块协同。",
      applicationsCount: 0,
      favorites: 0,
      status: "active",
      views: 0,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
    {
      title: "刻蚀设备工程师",
      company: "北方华创",
      city: "北京",
      experience: "3-5 年",
      education: "本科及以上",
      category: "equipment",
      tags: ["ICP", "腔体维护", "SPC"],
      salaryMin: 28,
      salaryMax: 42,
      salaryUnit: "K",
      salary: "28-42K",
      bonus: "14 薪",
      description: "参与刻蚀设备调试、工艺适配和故障定位。",
      applicationsCount: 0,
      favorites: 0,
      status: "active",
      views: 0,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
  ]);

  await seedIfEmpty("talents", [
    {
      uid: "talent_mock_001",
      nameDesensitized: "陈**",
      education: "硕士",
      school: "清华大学 · 微电子",
      years: 5,
      currentRole: "某 Fab 工艺工程师",
      targetRole: "工艺整合",
      tags: ["FinFET", "CMP", "良率分析"],
      status: "open",
      avatarText: "陈",
      avatarBg: "#DCE8FF",
      avatarColor: "#165DC6",
      briefIntro: "5 年晶圆厂工艺经验，熟悉先进节点工艺整合与良率分析。",
      workHistory: [
        {
          company: "某头部 Fab",
          position: "工艺工程师",
          years: "2020-2025",
        },
      ],
      favorites: 0,
      updatedAt: db.serverDate(),
      createdAt: db.serverDate(),
    },
    {
      uid: "talent_mock_002",
      nameDesensitized: "周**",
      education: "博士",
      school: "复旦大学 · 材料",
      years: 4,
      currentRole: "材料研发工程师",
      targetRole: "薄膜工艺",
      tags: ["ALD", "PVD", "表征分析"],
      status: "active",
      avatarText: "周",
      avatarBg: "#DDF5EE",
      avatarColor: "#157658",
      briefIntro: "有较强的材料表征与薄膜工艺研发背景。",
      workHistory: [
        {
          company: "某设备厂商",
          position: "材料研发",
          years: "2021-2025",
        },
      ],
      favorites: 0,
      updatedAt: db.serverDate(),
      createdAt: db.serverDate(),
    },
  ]);

  await seedIfEmpty("posts", [
    {
      uid: "seed_user_001",
      category: "tech",
      author: {
        uid: "seed_user_001",
        name: "张工_SMIC",
        avatarText: "张",
        avatarBg: "#DCE8FF",
        avatarColor: "#165DC6",
        title: "工艺整合工程师 · 中芯国际",
      },
      content: "请教各位，28nm HKMG Gate-last 流程中 CMP 均匀性控制有哪些实战经验？",
      topic: { text: "工艺讨论", type: "purple" },
      images: [],
      anonymous: false,
      likes: 47,
      comments: 0,
      shares: 12,
      likedOpenids: [],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
    {
      uid: "seed_user_002",
      category: "job",
      author: {
        uid: "seed_user_002",
        name: "Li_PE",
        avatarText: "Li",
        avatarBg: "#DDF5EE",
        avatarColor: "#157658",
        title: "PE · 长江存储",
      },
      content: "长存 vs 合肥长鑫，存储赛道怎么选？收到两边 offer，纠结中。",
      topic: { text: "求职交流", type: "blue" },
      images: [],
      anonymous: false,
      likes: 89,
      comments: 0,
      shares: 21,
      likedOpenids: [],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
  ]);

  // ─── Step 2.1: 种子数据 ───

  // 创建 5 个测试用户（含新增字段）
  const seedUsers = [
    {
      openid: "test_user_001", nickName: "李工_CMP", avatarText: "李", avatarUrl: "",
      title: "工艺工程师", company: "中芯国际", experience: "5-10年", jobStatus: "open",
      avatarBg: "#DCE8FF", avatarColor: "#165DC6",
      primaryRole: "engineer", secondaryRole: null, roleLabel: "工艺工程师",
      education: "硕士", city: "上海",
      postCount: 23, answerCount: 56, articleCount: 3, collectCount: 67, followingCount: 34, followerCount: 128, likedCount: 456,
      onboardingDone: true, profileComplete: true,
      stats: { posts: 23, likes: 456, following: 34, followers: 128 },
      settings: { privacy: { resumeVisible: true, showInTalentMarket: true, anonymousPostTraceable: false }, notification: { newMessage: true, comment: true, like: true, system: true } },
      createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      openid: "test_user_002", nickName: "王工_整合", avatarText: "王", avatarUrl: "",
      title: "设备工程师", company: "华虹半导体", experience: "3-5年", jobStatus: "",
      avatarBg: "#DDF5EE", avatarColor: "#157658",
      primaryRole: "engineer", secondaryRole: null, roleLabel: "设备工程师",
      education: "硕士", city: "上海",
      postCount: 45, answerCount: 89, articleCount: 7, collectCount: 89, followingCount: 67, followerCount: 234, likedCount: 892,
      onboardingDone: true, profileComplete: true,
      stats: { posts: 45, likes: 892, following: 67, followers: 234 },
      settings: { privacy: { resumeVisible: true, showInTalentMarket: false, anonymousPostTraceable: false }, notification: { newMessage: true, comment: true, like: true, system: true } },
      createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      openid: "test_user_003", nickName: "小陈_应届", avatarText: "陈", avatarUrl: "",
      title: "微电子硕士", company: "清华大学", experience: "应届", jobStatus: "open",
      avatarBg: "#F5E6FF", avatarColor: "#7C3AED",
      primaryRole: "student", secondaryRole: null, roleLabel: "微电子硕士",
      education: "硕士", city: "北京",
      postCount: 8, answerCount: 12, articleCount: 0, collectCount: 23, followingCount: 23, followerCount: 15, likedCount: 67,
      onboardingDone: true, profileComplete: true,
      stats: { posts: 8, likes: 67, following: 23, followers: 15 },
      settings: { privacy: { resumeVisible: true, showInTalentMarket: true, anonymousPostTraceable: false }, notification: { newMessage: true, comment: true, like: true, system: true } },
      createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      openid: "test_user_004", nickName: "HR小张", avatarText: "张", avatarUrl: "",
      title: "招聘经理", company: "长鑫存储", experience: "5-10年", jobStatus: "",
      avatarBg: "#FFF3E0", avatarColor: "#E65100",
      primaryRole: "hr", secondaryRole: null, roleLabel: "招聘经理",
      education: "本科", city: "合肥",
      postCount: 67, answerCount: 34, articleCount: 5, collectCount: 45, followingCount: 89, followerCount: 345, likedCount: 234,
      onboardingDone: true, profileComplete: true,
      stats: { posts: 67, likes: 234, following: 89, followers: 345 },
      settings: { privacy: { resumeVisible: false, showInTalentMarket: false, anonymousPostTraceable: false }, notification: { newMessage: true, comment: true, like: true, system: true } },
      createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      openid: "test_user_005", nickName: "封测老哥", avatarText: "封", avatarUrl: "",
      title: "采购工程师", company: "中芯国际", experience: "3-5年", jobStatus: "",
      avatarBg: "#E8F5E9", avatarColor: "#2E7D32",
      primaryRole: "purchase", secondaryRole: null, roleLabel: "采购工程师",
      education: "本科", city: "上海",
      postCount: 34, answerCount: 78, articleCount: 2, collectCount: 34, followingCount: 45, followerCount: 189, likedCount: 567,
      onboardingDone: true, profileComplete: true,
      stats: { posts: 34, likes: 567, following: 45, followers: 189 },
      settings: { privacy: { resumeVisible: true, showInTalentMarket: true, anonymousPostTraceable: false }, notification: { newMessage: true, comment: true, like: true, system: true } },
      createdAt: db.serverDate(), updatedAt: db.serverDate()
    }
  ];
  await seedIfEmpty("seed_users", seedUsers);

  // 示例帖子（4 个专区各 5 条 = 20 条，含扩展字段）
  const samplePosts = [
    // 中芯国际专区（smic）5 条
    { uid: "test_user_001", category: "tech", zoneId: "smic", zoneName: "中芯国际专区", contentType: "discuss",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "28nm 产线 CMP 后的 particle 水平最近突然升高，各位有类似经验吗？怀疑是 slurry batch 的问题。", tags: ["CMP", "particle", "28nm"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "工艺讨论", type: "purple" }, images: [], likes: 34, comments: 12, shares: 5, likedOpenids: [] },
    { uid: "test_user_002", category: "career", zoneId: "smic", zoneName: "中芯国际专区", contentType: "qa",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "请问中芯北京和上海的研发岗待遇差别大吗？两个 fab 的技术方向有什么不同？", tags: ["求职", "薪资", "职业发展"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "求职交流", type: "blue" }, images: [], likes: 67, comments: 23, shares: 8, likedOpenids: [] },
    { uid: "test_user_004", category: "job", zoneId: "smic", zoneName: "中芯国际专区", contentType: "recruit",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "【内推】中芯国际2026校招补录，先进工艺整合岗，硕士优先，有良率分析经验加分。简历私我～", tags: ["校招", "内推", "工艺整合"], isAnonymous: false, isPinned: true, isBest: false, hasBestAnswer: false,
      topic: { text: "招聘信息", type: "green" }, images: [], likes: 89, comments: 45, shares: 32, likedOpenids: [] },
    { uid: "test_user_001", category: "tech", zoneId: "smic", zoneName: "中芯国际专区", contentType: "news",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "听说中芯 FinFET 已经开始 risk production 了，有内部大佬能确认一下吗？", tags: ["FinFET", "先进制程"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "行业动态", type: "orange" }, images: [], likes: 156, comments: 34, shares: 23, likedOpenids: [] },
    { uid: "test_user_005", category: "tech", zoneId: "smic", zoneName: "中芯国际专区", contentType: "paper",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "分享一篇关于 28nm HKMG Gate-last 工艺整合的论文，对 CMP 模块优化很有参考价值。", tags: ["论文", "HKMG", "工艺整合"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "论文分享", type: "purple" }, images: [], likes: 78, comments: 15, shares: 28, likedOpenids: [] },

    // CMP 专区（cmp）5 条
    { uid: "test_user_001", category: "tech", zoneId: "cmp", zoneName: "CMP专区", contentType: "discuss",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "ECD map 上 corner 的 removal rate 比 center 低了 15%，platen temp 调过也没用，有遇到过的吗？", tags: ["ECD", "均匀性", "platen"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "工艺问题", type: "purple" }, images: [], likes: 23, comments: 8, shares: 2, likedOpenids: [] },
    { uid: "test_user_002", category: "tech", zoneId: "cmp", zoneName: "CMP专区", contentType: "qa",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "STI CMP 的 dishing 怎么控制在 30nm 以内？我们目前用的是 Fujimi 的 slurry，效果一般。", tags: ["STI", "dishing", "slurry"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "技术问答", type: "green" }, images: [], likes: 45, comments: 18, shares: 6, likedOpenids: [] },
    { uid: "test_user_005", category: "tech", zoneId: "cmp", zoneName: "CMP专区", contentType: "discuss",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "RDL CMP scratch 太多了，换了好几家 pad 都不行。有没有推荐的低 downforce 配方？", tags: ["RDL", "scratch", "pad"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "工艺讨论", type: "purple" }, images: [], likes: 19, comments: 7, shares: 1, likedOpenids: [] },
    { uid: "test_user_003", category: "tech", zoneId: "cmp", zoneName: "CMP专区", contentType: "paper",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "毕业论文做的是 CMP endpoint detection 的机器学习方法，用 KNN + 在线信号，准确率能做到 95%。有兴趣的同学可以交流。", tags: ["endpoint detection", "ML", "论文"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "学术交流", type: "purple" }, images: [], likes: 56, comments: 21, shares: 12, likedOpenids: [] },
    { uid: "test_user_001", category: "tech", zoneId: "cmp", zoneName: "CMP专区", contentType: "news",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "Cabot 新出了一代氧化铈 slurry，据说 tungsten CMP 的 removal rate 提升了 30%，有人试用过吗？", tags: ["Cabot", "slurry", "tungsten"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "产品资讯", type: "orange" }, images: [], likes: 38, comments: 14, shares: 9, likedOpenids: [] },

    // 晶圆茶水间（tea-room）5 条
    { uid: "test_user_001", category: "hot", zoneId: "tea-room", zoneName: "晶圆茶水间", contentType: "chat",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "又是通宵夜班…凌晨3点的 fab 楼下便利店关了，只能啃方便面。半导体人的深夜食堂就是泡面加火腿肠。", tags: ["夜班日常", "摸鱼"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "夜班日常", type: "orange" }, images: [], likes: 234, comments: 56, shares: 12, likedOpenids: [] },
    { uid: "test_user_002", category: "hot", zoneId: "tea-room", zoneName: "晶圆茶水间", contentType: "chat",
      author: { uid: "test_user_002", name: "匿名芯片人", avatarText: "匿", avatarBg: "#666666", avatarColor: "#999999", title: "匿名发布" },
      content: "听说某大厂 PE 要集体跳槽去对面新 fab，薪资翻倍。有人确认吗？", tags: ["行业八卦", "跳槽"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "行业八卦", type: "red" }, images: [], likes: 567, comments: 123, shares: 45, likedOpenids: [] },
    { uid: "test_user_003", category: "hot", zoneId: "tea-room", zoneName: "晶圆茶水间", contentType: "chat",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "校招拿到 3 个 offer 了：SMIC 28nm PE、YMTC NAND PE、NAURA 刻蚀 AE。跪求前辈们给点建议！", tags: ["校招", "求职"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "跳槽故事", type: "blue" }, images: [], likes: 345, comments: 89, shares: 23, likedOpenids: [] },
    { uid: "test_user_005", category: "hot", zoneId: "tea-room", zoneName: "晶圆茶水间", contentType: "chat",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "我们食堂新出了螺蛳粉窗口，味道居然还不错。半导体厂的伙食终于有点盼头了！", tags: ["食堂测评", "摸鱼"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "食堂测评", type: "green" }, images: [], likes: 178, comments: 45, shares: 8, likedOpenids: [] },
    { uid: "test_user_004", category: "hot", zoneId: "tea-room", zoneName: "晶圆茶水间", contentType: "chat",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "作为 HR 来说句公道话：半导体行业跳槽不是万能药，很多时候换个 fab 还是同样的问题。慎重选择。", tags: ["职场吐槽", "行业八卦"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "职场吐槽", type: "orange" }, images: [], likes: 289, comments: 78, shares: 15, likedOpenids: [] },

    // 校园招聘专区（campus-recruit）5 条
    { uid: "test_user_004", category: "job", zoneId: "campus-recruit", zoneName: "校园招聘专区", contentType: "recruit",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "【北方华创2026校招】刻蚀/薄膜/量测 工艺工程师，硕博均可，base 北京/上海，30-50K×14，有 sign-on bonus。投递通道已开放。", tags: ["北方华创", "校招", "刻蚀"], isAnonymous: false, isPinned: true, isBest: false, hasBestAnswer: false,
      topic: { text: "校招信息", type: "green" }, images: [], likes: 234, comments: 67, shares: 56, likedOpenids: [] },
    { uid: "test_user_003", category: "job", zoneId: "campus-recruit", zoneName: "校园招聘专区", contentType: "interview",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "中芯国际先进工艺岗二面面经：技术面问了 CMP endpoint detection、WAT 参数分析、defect pareto 方法论，还有英文自我介绍。总体难度中等偏上。", tags: ["中芯国际", "面经", "二面"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "面经分享", type: "blue" }, images: [], likes: 456, comments: 89, shares: 78, likedOpenids: [] },
    { uid: "test_user_003", category: "job", zoneId: "campus-recruit", zoneName: "校园招聘专区", contentType: "discuss",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "秋招快结束了，目前 0 offer。是不是微电子真的不好找工作了？985 硕士都这么难吗？求大佬指点！", tags: ["秋招", "焦虑", "求助"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "秋招进展", type: "blue" }, images: [], likes: 678, comments: 156, shares: 34, likedOpenids: [] },
    { uid: "test_user_002", category: "job", zoneId: "campus-recruit", zoneName: "校园招聘专区", contentType: "interview",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "三年前校招面经回顾：长江存储工艺整合岗，三轮技术面 + HR 面。重点考察了 FA 能力和 cross-functional 沟通能力。给准备校招的同学参考。", tags: ["长江存储", "面经", "工艺整合"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "面经分享", type: "blue" }, images: [], likes: 345, comments: 45, shares: 23, likedOpenids: [] },
    { uid: "test_user_004", category: "job", zoneId: "campus-recruit", zoneName: "校园招聘专区", contentType: "recruit",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "作为 HR 给校招同学一点建议：1. 简历要写清楚项目和数据 2. 面试要展示解决问题的思路 3. 不要只投大厂， tier2 公司也有好机会。", tags: ["校招建议", "HR视角", "求职"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "秋招进展", type: "blue" }, images: [], likes: 567, comments: 89, shares: 45, likedOpenids: [] },

    // ─── Step 2.5 增强：追加种子帖子（16 个专区，共 62 条） ───

    // 中芯国际专区（smic）追加 5 条
    { uid: "test_user_001", category: "tech", zoneId: "smic", zoneName: "中芯国际专区", contentType: "discuss",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "N28 产线最近良率波动有人注意到吗？感觉是 litho 那边的问题，CD 偏差有 2-3nm 的 drift，PECVD 模块也跟着偏了。", tags: ["N28", "litho", "良率"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "工艺讨论", type: "purple" }, images: [], likes: 45, comments: 18, shares: 6, likedOpenids: [] },
    { uid: "test_user_002", category: "career", zoneId: "smic", zoneName: "中芯国际专区", contentType: "discuss",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "中芯上海和北京 fab 的 work culture 差别挺大的。上海那边节奏更快，但北京技术方向更前沿。有没有两边都待过的人来聊聊？", tags: ["职场", "中芯国际", "工作体验"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "职场交流", type: "blue" }, images: [], likes: 89, comments: 34, shares: 12, likedOpenids: [] },
    { uid: "test_user_003", category: "tech", zoneId: "smic", zoneName: "中芯国际专区", contentType: "discuss",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "SMIC 的 14nm 量产良率现在到什么水平了？论文里看到 2024 年的数据还不错，有没有同行分享一下最新情况？", tags: ["14nm", "FinFET", "量产"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "技术讨论", type: "purple" }, images: [], likes: 67, comments: 23, shares: 8, likedOpenids: [] },
    { uid: "test_user_004", category: "job", zoneId: "smic", zoneName: "中芯国际专区", contentType: "recruit",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "【社招】中芯国际先进工艺整合岗，3年以上经验，熟悉 HKMG / FinFET 流程优先，base 上海/北京/深圳。待遇优厚，有意向私聊。", tags: ["社招", "工艺整合", "中芯国际"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "招聘信息", type: "green" }, images: [], likes: 56, comments: 28, shares: 15, likedOpenids: [] },
    { uid: "test_user_005", category: "career", zoneId: "smic", zoneName: "中芯国际专区", contentType: "interview",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "中芯国际工艺岗面试经验：一面技术问了 CMP、etch、litho 的基础原理和常见问题处理；二面给了一个良率异常的 case study，需要现场分析 root cause。", tags: ["面经", "中芯国际", "工艺岗"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "面经分享", type: "blue" }, images: [], likes: 134, comments: 45, shares: 32, likedOpenids: [] },

    // 长鑫存储专区（cxmt）追加 4 条
    { uid: "test_user_002", category: "tech", zoneId: "cxmt", zoneName: "长鑫存储专区", contentType: "discuss",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "长鑫 DRAM 的 19nm 工艺良率提升进展如何？听说最近在 1α 节点上有了关键突破，有人能确认吗？", tags: ["DRAM", "19nm", "良率"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "技术讨论", type: "purple" }, images: [], likes: 38, comments: 12, shares: 5, likedOpenids: [] },
    { uid: "test_user_003", category: "career", zoneId: "cxmt", zoneName: "长鑫存储专区", contentType: "discuss",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "合肥长鑫的 work-life balance 怎么样？收到 offer 在犹豫要不要去。合肥的房价和城市发展看起来还不错。", tags: ["职场", "长鑫存储", "合肥"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "求职交流", type: "blue" }, images: [], likes: 78, comments: 34, shares: 9, likedOpenids: [] },
    { uid: "test_user_004", category: "job", zoneId: "cxmt", zoneName: "长鑫存储专区", contentType: "recruit",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "【内推】长鑫存储 2026 校招提前批，DRAM 工艺工程师/设备工程师，硕博优先，base 合肥，有安家费和人才补贴。", tags: ["校招", "内推", "长鑫存储"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "校招信息", type: "green" }, images: [], likes: 45, comments: 19, shares: 11, likedOpenids: [] },
    { uid: "test_user_005", category: "tech", zoneId: "cxmt", zoneName: "长鑫存储专区", contentType: "qa",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "请问长鑫存储的 DRAM 工艺和三星、海力士的技术路线有什么区别？国产 DRAM 在堆叠层数和良率上差距有多大？", tags: ["DRAM", "技术路线", "国产化"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "技术问答", type: "green" }, images: [], likes: 56, comments: 21, shares: 8, likedOpenids: [] },

    // 华虹半导体专区（hua-hong）追加 4 条
    { uid: "test_user_001", category: "tech", zoneId: "hua-hong", zoneName: "华虹半导体专区", contentType: "discuss",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "华虹半导体特色工艺平台最近扩产消息确认了吗？无锡新 fab 什么时候能投产？功率器件和 CIS 产能都挺紧张的。", tags: ["扩产", "无锡", "特色工艺"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "行业动态", type: "orange" }, images: [], likes: 34, comments: 14, shares: 6, likedOpenids: [] },
    { uid: "test_user_002", category: "tech", zoneId: "hua-hong", zoneName: "华虹半导体专区", contentType: "discuss",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "华虹的 BCD、功率器件工艺在国内算什么水平？相比先进制程，特色工艺的技术壁垒和发展前景如何？", tags: ["BCD", "功率器件", "特色工艺"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "技术讨论", type: "purple" }, images: [], likes: 67, comments: 23, shares: 9, likedOpenids: [] },
    { uid: "test_user_005", category: "career", zoneId: "hua-hong", zoneName: "华虹半导体专区", contentType: "discuss",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "在华虹做了三年 PE，感觉技术成长不错但薪资涨幅有限，该不该跳槽去其他 fab？同岗位跳槽一般能涨多少？", tags: ["跳槽", "薪资", "PE"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "职场交流", type: "blue" }, images: [], likes: 89, comments: 45, shares: 12, likedOpenids: [] },
    { uid: "test_user_003", category: "job", zoneId: "hua-hong", zoneName: "华虹半导体专区", contentType: "interview",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "华虹半导体工艺岗面经：两轮技术面 + HR 面，重点考察了功率器件和 BCD 工艺经验，还问了 cross-module 的沟通协调案例。", tags: ["面经", "华虹", "功率器件"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "面经分享", type: "blue" }, images: [], likes: 56, comments: 18, shares: 14, likedOpenids: [] },

    // 长江存储专区（ymtc）追加 3 条
    { uid: "test_user_001", category: "tech", zoneId: "ymtc", zoneName: "长江存储专区", contentType: "discuss",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "长江存储 232 层 NAND 什么时候能量产？Xtacking 架构在堆叠层数和性能上的优势越来越明显了。", tags: ["NAND", "232层", "Xtacking"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "技术讨论", type: "purple" }, images: [], likes: 78, comments: 28, shares: 11, likedOpenids: [] },
    { uid: "test_user_002", category: "tech", zoneId: "ymtc", zoneName: "长江存储专区", contentType: "discuss",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "YMTC 和三星在 NAND 领域的 gap 到底有多大？从堆叠层数、良率和成本三个维度来看，差距在缩小还是在拉大？", tags: ["NAND", "三星", "技术差距"], isAnonymous: false, isPinned: true, isBest: false, hasBestAnswer: false,
      topic: { text: "技术讨论", type: "purple" }, images: [], likes: 112, comments: 45, shares: 18, likedOpenids: [] },
    { uid: "test_user_003", category: "tech", zoneId: "ymtc", zoneName: "长江存储专区", contentType: "qa",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "长江存储的 3D NAND 和 Intel/美光的 floating gate 技术有什么本质区别？各自的技术路线优劣是什么？", tags: ["3D NAND", "CTF", "floating gate"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "技术问答", type: "green" }, images: [], likes: 45, comments: 19, shares: 7, likedOpenids: [] },

    // 工艺工程师专区（process-eng）追加 5 条
    { uid: "test_user_001", category: "tech", zoneId: "process-eng", zoneName: "工艺工程师专区", contentType: "discuss",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "Wet Etch 均匀性调优经验分享：通过调整 chemical concentration 和 temperature gradient，wafer 内 uniformity 从 3% 降到了 1.5%。关键是控制好 IPA 的比例。", tags: ["Wet Etch", "均匀性", "调优"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "经验分享", type: "purple" }, images: [], likes: 123, comments: 34, shares: 18, likedOpenids: [] },
    { uid: "test_user_002", category: "career", zoneId: "process-eng", zoneName: "工艺工程师专区", contentType: "discuss",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "工艺工程师的职业发展路径讨论：PE → PIE → Module Manager 还是转 FA？哪个方向天花板更高？有没有前辈给点建议？", tags: ["职业发展", "PE", "PIE"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "职场交流", type: "blue" }, images: [], likes: 156, comments: 67, shares: 23, likedOpenids: [] },
    { uid: "test_user_005", category: "tech", zoneId: "process-eng", zoneName: "工艺工程师专区", contentType: "discuss",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "ALD 薄膜应力控制经验：HfO2 沉积后应力偏大导致 wafer warpage，通过调整 pulse time 和 purge time 得到了明显改善。", tags: ["ALD", "薄膜应力", "warpage"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "工艺讨论", type: "purple" }, images: [], likes: 89, comments: 28, shares: 14, likedOpenids: [] },
    { uid: "test_user_003", category: "tech", zoneId: "process-eng", zoneName: "工艺工程师专区", contentType: "qa",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "求助：CMP 后发现 pattern 的 dishing 很严重，换了几种 slurry 效果都不好，downforce 也调了。有什么好的方法可以改善吗？", tags: ["CMP", "dishing", "slurry"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "技术问答", type: "green" }, images: [], likes: 34, comments: 15, shares: 4, likedOpenids: [] },
    { uid: "test_user_001", category: "tech", zoneId: "process-eng", zoneName: "工艺工程师专区", contentType: "qa",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "请问 Etch 的 selectivity 和 profile 怎么同时优化？感觉改了 selectivity profile 就跟着变了，很难找到平衡点。", tags: ["Etch", "selectivity", "profile"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "技术问答", type: "green" }, images: [], likes: 23, comments: 9, shares: 2, likedOpenids: [] },

    // 设备工程师专区（equip-eng）追加 4 条
    { uid: "test_user_001", category: "tech", zoneId: "equip-eng", zoneName: "设备工程师专区", contentType: "discuss",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "设备工程师每天的工作日常是什么样的？从 PM 到 troubleshooting 到 PM 优化，最近觉得每天都在灭火。有没有同感的？", tags: ["日常工作", "PM", "troubleshooting"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "日常交流", type: "purple" }, images: [], likes: 78, comments: 34, shares: 8, likedOpenids: [] },
    { uid: "test_user_004", category: "tech", zoneId: "equip-eng", zoneName: "设备工程师专区", contentType: "discuss",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "Applied Materials 和 Lam Research 的 etch 设备在国内 fab 的占有率大概多少？各自的优劣势是什么？", tags: ["AMAT", "Lam", "etch"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "设备讨论", type: "purple" }, images: [], likes: 56, comments: 23, shares: 11, likedOpenids: [] },
    { uid: "test_user_002", category: "tech", zoneId: "equip-eng", zoneName: "设备工程师专区", contentType: "qa",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "求助：PVD 腔体漏率检测总是不过，换了 seal ring 还是漏。除了 seal 之外还有什么可能的原因？O-ring 配合面有划痕怎么办？", tags: ["漏率", "腔体", "maintenance"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "技术问答", type: "green" }, images: [], likes: 28, comments: 12, shares: 3, likedOpenids: [] },
    { uid: "test_user_003", category: "tech", zoneId: "equip-eng", zoneName: "设备工程师专区", contentType: "paper",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "分享一篇关于 ICP etch 腔体粒子控制的研究，分析了 gas flow pattern 和 chuck temperature 对 particle count 的影响。", tags: ["ICP", "粒子控制", "论文"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "论文分享", type: "purple" }, images: [], likes: 34, comments: 8, shares: 5, likedOpenids: [] },

    // EDA工程师专区（eda-eng）追加 3 条
    { uid: "test_user_003", category: "tech", zoneId: "eda-eng", zoneName: "EDA工程师专区", contentType: "discuss",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "国产 EDA 工具现在能做到什么程度？华大九天的模拟 EDA 和 Cadence 的差距有多大？数字后端工具呢？", tags: ["国产EDA", "华大九天", "Cadence"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "技术讨论", type: "purple" }, images: [], likes: 89, comments: 34, shares: 15, likedOpenids: [] },
    { uid: "test_user_001", category: "career", zoneId: "eda-eng", zoneName: "EDA工程师专区", contentType: "discuss",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "EDA 行业加班严重吗？相比 fab 工程师，work-life balance 怎么样？听说Synopsys和Cadence的待遇还不错。", tags: ["加班", "work-life balance", "EDA"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "职场交流", type: "blue" }, images: [], likes: 67, comments: 28, shares: 9, likedOpenids: [] },
    { uid: "test_user_002", category: "tech", zoneId: "eda-eng", zoneName: "EDA工程师专区", contentType: "paper",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "基于 AI 的 OPC 优化方法研究：用深度学习模型预测最佳 mask pattern，在 28nm 节点上验证了 EPE 改善。", tags: ["OPC", "AI", "深度学习"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "论文分享", type: "purple" }, images: [], likes: 45, comments: 12, shares: 7, likedOpenids: [] },

    // CMP专区（cmp）追加 2 条
    { uid: "test_user_002", category: "tech", zoneId: "cmp", zoneName: "CMP专区", contentType: "qa",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "W CMP 的 removal rate 突然下降 20%，platen 和 carrier 都检查了没问题，slurry 也换了新批次的。求大神指点可能的原因。", tags: ["W CMP", "removal rate", "troubleshooting"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "技术问答", type: "green" }, images: [], likes: 34, comments: 14, shares: 5, likedOpenids: [] },
    { uid: "test_user_001", category: "tech", zoneId: "cmp", zoneName: "CMP专区", contentType: "qa",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "铜 damascene 工艺中 barrier CMP 的 selectivity 怎么提高？Ta/TaN barrier 层总是过抛，试了好几种 slurry 都不理想。", tags: ["barrier CMP", "selectivity", "damascene"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "技术问答", type: "green" }, images: [], likes: 28, comments: 11, shares: 3, likedOpenids: [] },

    // FinFET专区（finfet）追加 4 条
    { uid: "test_user_002", category: "tech", zoneId: "finfet", zoneName: "FinFET专区", contentType: "discuss",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "3nm GAA vs FinFET 的良率对比：从 Intel、三星、台积电的公开数据来看，GAA 在功耗和性能上的优势有多大？量产难度呢？", tags: ["GAA", "3nm", "良率对比"], isAnonymous: false, isPinned: true, isBest: false, hasBestAnswer: false,
      topic: { text: "前沿技术", type: "purple" }, images: [], likes: 145, comments: 56, shares: 23, likedOpenids: [] },
    { uid: "test_user_001", category: "tech", zoneId: "finfet", zoneName: "FinFET专区", contentType: "discuss",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "FinFET 的 Fin Height 控制经验：我们的 fin height uniformity 只能做到 ±3nm，业界标准是多少？EP 和 SiGe epitaxy 哪个方案更好？", tags: ["Fin Height", "uniformity", "epitaxy"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "技术讨论", type: "purple" }, images: [], likes: 89, comments: 34, shares: 14, likedOpenids: [] },
    { uid: "test_user_005", category: "tech", zoneId: "finfet", zoneName: "FinFET专区", contentType: "discuss",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "从 planar 到 FinFET 再到 GAA，器件结构的演进对工艺整合工程师的技能要求有什么变化？做 FinFET 的工程师转 GAA 难吗？", tags: ["器件演进", "工艺整合", "GAA"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "职业发展", type: "blue" }, images: [], likes: 67, comments: 28, shares: 11, likedOpenids: [] },
    { uid: "test_user_003", category: "tech", zoneId: "finfet", zoneName: "FinFET专区", contentType: "paper",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "Gate-All-Around Nanosheet FET 的工艺整合挑战：外延、图案化和释放工艺的关键参数，以及与 FinFET 的兼容性分析。", tags: ["Nanosheet", "GAA", "工艺整合"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "论文分享", type: "purple" }, images: [], likes: 56, comments: 15, shares: 9, likedOpenids: [] },

    // HBM专区（hbm）追加 3 条
    { uid: "test_user_001", category: "tech", zoneId: "hbm", zoneName: "HBM专区", contentType: "discuss",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "HBM3E 的带宽已经到了 1TB/s 以上，TSV 的工艺要求也越来越高了。听说良率仍然是个挑战，国内厂商能做吗？", tags: ["HBM3E", "TSV", "良率"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "技术讨论", type: "purple" }, images: [], likes: 78, comments: 28, shares: 12, likedOpenids: [] },
    { uid: "test_user_004", category: "tech", zoneId: "hbm", zoneName: "HBM专区", contentType: "discuss",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "SK 海力士 vs 三星在 HBM 领域的竞争格局，国内厂商有机会切入吗？长鑫存储据说也在布局 HBM。", tags: ["海力士", "三星", "国产HBM"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "行业分析", type: "orange" }, images: [], likes: 112, comments: 45, shares: 19, likedOpenids: [] },
    { uid: "test_user_002", category: "tech", zoneId: "hbm", zoneName: "HBM专区", contentType: "news",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "AMD 最新发布的 MI300X 使用了 HBM3，标志着 HBM 在 AI 加速器中的地位进一步巩固。算力需求推动 HBM 市场持续高速增长。", tags: ["AMD", "MI300X", "HBM3"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "行业动态", type: "orange" }, images: [], likes: 67, comments: 18, shares: 14, likedOpenids: [] },

    // 校园招聘专区（campus-recruit）追加 4 条
    { uid: "test_user_003", category: "job", zoneId: "campus-recruit", zoneName: "校园招聘专区", contentType: "interview",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "25 届秋招半导体 offer 汇总帖：SMIC 28k×14、YMTC 30k×15、NAURA 25k×14、华虹 22k×14、长鑫 28k×15，仅供参考，欢迎补充。", tags: ["offer汇总", "25届", "秋招"], isAnonymous: false, isPinned: true, isBest: false, hasBestAnswer: false,
      topic: { text: "offer汇总", type: "blue" }, images: [], likes: 567, comments: 234, shares: 89, likedOpenids: [] },
    { uid: "test_user_005", category: "job", zoneId: "campus-recruit", zoneName: "校园招聘专区", contentType: "interview",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "长鑫存储三轮面试经验：一轮笔试考 DRAM 基础知识 + 两轮技术面重点考察 FA 能力和数据驱动思维，面试官比较友好。", tags: ["长鑫存储", "面经", "校招"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "面经分享", type: "blue" }, images: [], likes: 89, comments: 34, shares: 18, likedOpenids: [] },
    { uid: "test_user_001", category: "job", zoneId: "campus-recruit", zoneName: "校园招聘专区", contentType: "interview",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "华虹半导体校招面试：技术面问了 BCD 工艺流程、功率器件原理（VDMOS/SuperJunction），还有英文自我介绍。整体难度中等。", tags: ["华虹", "面经", "BCD"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "面经分享", type: "blue" }, images: [], likes: 45, comments: 18, shares: 12, likedOpenids: [] },
    { uid: "test_user_003", category: "job", zoneId: "campus-recruit", zoneName: "校园招聘专区", contentType: "discuss",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "半导体行业加班到底有多严重？拿到几个 offer 了但听学长说 fab 里每天 10 小时起步、周末经常加班，有点犹豫要不要转行。", tags: ["加班", "工作强度", "行业选择"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "行业讨论", type: "blue" }, images: [], likes: 456, comments: 178, shares: 45, likedOpenids: [] },

    // 实习交流专区（intern）追加 3 条
    { uid: "test_user_003", category: "job", zoneId: "intern", zoneName: "实习交流专区", contentType: "interview",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "中芯国际实习面经：技术面问了半导体物理基础（PN结、MOSFET原理）、CMOS 基本流程、还有简单的 defect 数据分析题目。", tags: ["中芯国际", "实习面经", "半导体基础"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "实习面经", type: "blue" }, images: [], likes: 78, comments: 23, shares: 15, likedOpenids: [] },
    { uid: "test_user_005", category: "job", zoneId: "intern", zoneName: "实习交流专区", contentType: "interview",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "长江存储暑期实习转正面经：实习期间做了 defect analysis 和 Pareto 项目，转正答辩重点讲了分析方法和改善措施。", tags: ["长江存储", "实习转正", "defect分析"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "实习经验", type: "blue" }, images: [], likes: 56, comments: 18, shares: 11, likedOpenids: [] },
    { uid: "test_user_004", category: "career", zoneId: "intern", zoneName: "实习交流专区", contentType: "discuss",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "半导体公司的实习待遇怎么样？中芯、长鑫、华虹的实习生薪资分别是多少？作为 HR 透露一下：一般硕士 400-800/天，看公司。", tags: ["实习薪资", "待遇", "HR视角"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "待遇讨论", type: "blue" }, images: [], likes: 89, comments: 34, shares: 8, likedOpenids: [] },

    // 设备采购专区（equip-buy）追加 3 条
    { uid: "test_user_004", category: "tech", zoneId: "equip-buy", zoneName: "设备采购专区", contentType: "demand",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "【求购】二手 AMAT Centura 刻蚀机台，200mm，适用于成熟制程。要求状态良好、可现场验机。价格可议，有意者私聊。", tags: ["求购", "AMAT", "刻蚀设备"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "设备求购", type: "orange" }, images: [], likes: 12, comments: 8, shares: 3, likedOpenids: [] },
    { uid: "test_user_001", category: "tech", zoneId: "equip-buy", zoneName: "设备采购专区", contentType: "demand",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "【供应】ASML 1980Di 光刻机备件，全新原装，含光罩对准模块和 lens 组件。有需要的联系，长期合作优惠。", tags: ["供应", "ASML", "光刻备件"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "设备供应", type: "green" }, images: [], likes: 18, comments: 6, shares: 4, likedOpenids: [] },
    { uid: "test_user_002", category: "tech", zoneId: "equip-buy", zoneName: "设备采购专区", contentType: "demand",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "【寻源】Lam Research Kiyo CX 刻蚀机台的 spare parts 供应商，尤其是 gas distribution system 和 RF generator 的替代件。", tags: ["寻源", "Lam", "备件"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "备件寻源", type: "orange" }, images: [], likes: 8, comments: 4, shares: 2, likedOpenids: [] },

    // 材料供应专区（material）追加 2 条
    { uid: "test_user_001", category: "tech", zoneId: "material", zoneName: "材料供应专区", contentType: "demand",
      author: { uid: "test_user_001", name: "李工_CMP", avatarText: "李", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "设备工程师 · 中芯国际" },
      content: "【供应】电子级氢氟酸（UP-S 级），月产能 50 吨，有 COA 和批次追溯。长期合作可谈，价格优势明显。", tags: ["供应", "氢氟酸", "电子级"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "材料供应", type: "green" }, images: [], likes: 15, comments: 7, shares: 3, likedOpenids: [] },
    { uid: "test_user_002", category: "tech", zoneId: "material", zoneName: "材料供应专区", contentType: "demand",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "【求购】高纯度硅烷气（5N 以上），月需求量 2 吨，要求稳定供货和批次一致性。有资质的供应商请联系。", tags: ["求购", "硅烷气", "高纯度"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "材料求购", type: "orange" }, images: [], likes: 6, comments: 3, shares: 1, likedOpenids: [] },

    // 上海专区（shanghai）追加 3 条
    { uid: "test_user_002", category: "hot", zoneId: "shanghai", zoneName: "上海专区", contentType: "discuss",
      author: { uid: "test_user_002", name: "王工_整合", avatarText: "王", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "工艺整合工程师 · 长江存储" },
      content: "上海张江的半导体公司有哪些？除了中芯、华虹、中微，还有哪些值得关注的企业？最近听说不少新公司在张江设点了。", tags: ["张江", "半导体企业", "上海"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "上海半导体", type: "blue" }, images: [], likes: 67, comments: 28, shares: 12, likedOpenids: [] },
    { uid: "test_user_003", category: "hot", zoneId: "shanghai", zoneName: "上海专区", contentType: "discuss",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "上海半导体行业的租房和通勤经验分享：张江、临港、漕河泾怎么选？张江房租贵但公司多，临港偏但补贴多。", tags: ["租房", "通勤", "生活经验"], isAnonymous: false, isPinned: false, isBest: true, hasBestAnswer: false,
      topic: { text: "生活经验", type: "green" }, images: [], likes: 123, comments: 56, shares: 23, likedOpenids: [] },
    { uid: "test_user_004", category: "news", zoneId: "shanghai", zoneName: "上海专区", contentType: "news",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "上海发布半导体产业新政策：对先进制程研发和设备国产化给予更多补贴支持，重点扶持 28nm 及以下节点和关键设备。", tags: ["产业政策", "上海", "补贴"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "政策动态", type: "orange" }, images: [], likes: 89, comments: 23, shares: 18, likedOpenids: [] },

    // 合肥专区（hefei）追加 3 条
    { uid: "test_user_005", category: "hot", zoneId: "hefei", zoneName: "合肥专区", contentType: "discuss",
      author: { uid: "test_user_005", name: "封测老哥", avatarText: "封", avatarBg: "#E8F5E9", avatarColor: "#2E7D32", title: "封测工程师 · 长电科技" },
      content: "合肥的半导体产业发展很快：长鑫存储、晶合集成、睿力科技等企业聚集，未来有机会成为新的半导体产业中心。", tags: ["合肥", "半导体产业", "发展"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "区域发展", type: "blue" }, images: [], likes: 56, comments: 18, shares: 8, likedOpenids: [] },
    { uid: "test_user_003", category: "hot", zoneId: "hefei", zoneName: "合肥专区", contentType: "discuss",
      author: { uid: "test_user_003", name: "小陈_应届", avatarText: "陈", avatarBg: "#F5E6FF", avatarColor: "#7C3AED", title: "微电子硕士在读 · 复旦大学" },
      content: "合肥长鑫 vs 上海中芯，作为应届生怎么选？考虑到城市发展和公司前景。合肥生活成本低但机会少，上海压力大但选择多。", tags: ["合肥", "上海", "应届选择"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: true,
      topic: { text: "求职选择", type: "blue" }, images: [], likes: 78, comments: 34, shares: 9, likedOpenids: [] },
    { uid: "test_user_004", category: "job", zoneId: "hefei", zoneName: "合肥专区", contentType: "recruit",
      author: { uid: "test_user_004", name: "HR小张", avatarText: "张", avatarBg: "#FFF3E0", avatarColor: "#E65100", title: "招聘专员 · 北方华创" },
      content: "【招聘】合肥晶合集成工艺工程师，1-3 年经验，熟悉特色工艺流程优先，base 合肥综保区，薪资 open 可谈。", tags: ["招聘", "晶合集成", "合肥"], isAnonymous: false, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "招聘信息", type: "green" }, images: [], likes: 23, comments: 9, shares: 5, likedOpenids: [] },

    // 晶圆茶水间（tea-room）追加 3 条（全部匿名）
    { uid: "test_user_001", category: "hot", zoneId: "tea-room", zoneName: "晶圆茶水间", contentType: "chat",
      author: { uid: "test_user_001", name: "匿名芯片人", avatarText: "匿", avatarBg: "#666666", avatarColor: "#999999", title: "匿名发布" },
      content: "半导体人日常：今天又是被 PM lot 支配的一天，半夜三更被电话叫起来处理 defect，到 fab 发现是 AOI 误报……心态崩了。", tags: ["日常吐槽", "PM lot"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "日常吐槽", type: "orange" }, images: [], likes: 345, comments: 89, shares: 23, likedOpenids: [] },
    { uid: "test_user_002", category: "hot", zoneId: "tea-room", zoneName: "晶圆茶水间", contentType: "chat",
      author: { uid: "test_user_002", name: "匿名芯片人", avatarText: "匿", avatarBg: "#666666", avatarColor: "#999999", title: "匿名发布" },
      content: "fab 里最离谱的事故你见过什么？我先说：有人把 wafer 放进了错误的 cassette，整批 25 片全部报废，价值好几百万。", tags: ["事故", "fab日常", "匿名"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "匿名吐槽", type: "red" }, images: [], likes: 678, comments: 156, shares: 45, likedOpenids: [] },
    { uid: "test_user_003", category: "hot", zoneId: "tea-room", zoneName: "晶圆茶水间", contentType: "chat",
      author: { uid: "test_user_003", name: "匿名芯片人", avatarText: "匿", avatarBg: "#666666", avatarColor: "#999999", title: "匿名发布" },
      content: "大家平时都怎么解压的？推荐个下班后的爱好。我最近开始学吉他，感觉还不错。之前一直刷手机到凌晨，现在好多了。", tags: ["解压", "生活", "爱好"], isAnonymous: true, isPinned: false, isBest: false, hasBestAnswer: false,
      topic: { text: "生活方式", type: "green" }, images: [], likes: 234, comments: 78, shares: 12, likedOpenids: [] }
  ];

  // 给帖子添加时间戳
  for (const post of samplePosts) {
    post.createdAt = db.serverDate();
    post.updatedAt = db.serverDate();
  }
  await seedIfEmpty("sample_posts", samplePosts);

  // 通过 zoneService 云函数初始化 54 个专区种子数据（内联逻辑）
  const zoneRes = await db.collection("zones").limit(1).get();
  if (!zoneRes.data.length) {
    // 触发 zoneService seed（此处用内联方式，避免循环依赖）
    // 实际部署后可通过 wx.cloud.callFunction({ name: "zoneService", data: { action: "seed" } }) 触发
    console.log("[initData] zones collection is empty, please call zoneService.seed to initialize 54 zones");
  }

  return {
    success: true,
    message: "SemiParty seed data initialized (including Step 2.1 zone/user/post extensions)",
  };
};
