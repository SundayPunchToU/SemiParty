const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const TEA_ROOM_TOPICS = [
  { topicId: "hot", topicName: "热门", sortOrder: 100 },
  { topicId: "tech-help", topicName: "#技术求助", sortOrder: 95 },
  { topicId: "cmp", topicName: "#CMP", sortOrder: 90 },
  { topicId: "finfet", topicName: "#FinFET", sortOrder: 85 },
  { topicId: "litho", topicName: "#光刻", sortOrder: 80 },
  { topicId: "night-shift", topicName: "#夜班日常", sortOrder: 75 },
  { topicId: "canteen", topicName: "#食堂测评", sortOrder: 70 },
  { topicId: "commute", topicName: "#通勤吐槽", sortOrder: 65 },
  { topicId: "gossip", topicName: "#行业八卦", sortOrder: 60 },
  { topicId: "job-hop", topicName: "#跳槽故事", sortOrder: 55 },
  { topicId: "salary", topicName: "#薪资爆料", sortOrder: 50 },
  { topicId: "interview", topicName: "#面经分享", sortOrder: 45 },
  { topicId: "fall-recruit", topicName: "#秋招进展", sortOrder: 40 },
  { topicId: "smic", topicName: "#中芯国际", sortOrder: 35 },
  { topicId: "cxmt", topicName: "#长鑫存储", sortOrder: 30 },
];

const COMPANY_SEEDS = [
  { _id: "smic", name: "中芯国际", logoText: "芯", description: "中国大陆先进晶圆代工企业。", industry: "晶圆代工", city: "上海", jobCount: 18, tags: ["逻辑制程", "特色工艺"], sortOrder: 100, createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { _id: "ymtc", name: "长江存储", logoText: "江", description: "国产 3D NAND 龙头企业。", industry: "存储芯片", city: "武汉", jobCount: 14, tags: ["NAND", "Xtacking"], sortOrder: 95, createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { _id: "cxmt", name: "长鑫存储", logoText: "鑫", description: "国产 DRAM 重点企业。", industry: "存储芯片", city: "合肥", jobCount: 16, tags: ["DRAM", "先进节点"], sortOrder: 90, createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { _id: "huahong", name: "华虹半导体", logoText: "华", description: "特色工艺代工厂。", industry: "晶圆代工", city: "上海/无锡", jobCount: 11, tags: ["BCD", "功率器件"], sortOrder: 85, createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { _id: "naura", name: "北方华创", logoText: "北", description: "本土半导体设备企业。", industry: "半导体设备", city: "北京", jobCount: 22, tags: ["刻蚀", "薄膜"], sortOrder: 80, createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { _id: "amec", name: "中微半导体", logoText: "微", description: "刻蚀与 MOCVD 设备厂商。", industry: "半导体设备", city: "上海", jobCount: 10, tags: ["刻蚀", "MOCVD"], sortOrder: 75, createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { _id: "asml", name: "ASML", logoText: "A", description: "全球光刻设备核心厂商。", industry: "半导体设备", city: "上海", jobCount: 8, tags: ["EUV", "光刻"], sortOrder: 70, createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { _id: "empyrean", name: "华大九天", logoText: "九", description: "国产 EDA 厂商。", industry: "EDA", city: "北京", jobCount: 9, tags: ["EDA", "IC设计"], sortOrder: 65, createdAt: db.serverDate(), updatedAt: db.serverDate() },
];

const SAMPLE_POSTS = [
  { uid: "seed_user_001", userId: "seed_user_001", topicId: "cmp", topicName: "#CMP", category: "tech", contentType: "discuss", content: "28nm 产线 CMP 的 removal rate 最近波动比较大，大家一般先查 slurry 还是 pad？", tags: ["CMP", "良率"], isAnonymous: false, anonymous: false, topic: { text: "#CMP", type: "blue" }, author: { uid: "seed_user_001", userId: "seed_user_001", nickname: "张工", name: "张工", avatarText: "张", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "工艺工程师 · 中芯国际" }, likeCount: 34, commentCount: 12, viewCount: 120, likes: 34, comments: 12, views: 120, shares: 3, likedOpenids: [], createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { uid: "seed_user_002", userId: "seed_user_002", topicId: "finfet", topicName: "#FinFET", category: "tech", contentType: "discuss", content: "FinFET 进入 3nm 后 parasitic 的约束明显更重，版图和工艺协同要提前多少？", tags: ["FinFET"], isAnonymous: false, anonymous: false, topic: { text: "#FinFET", type: "blue" }, author: { uid: "seed_user_002", userId: "seed_user_002", nickname: "李工", name: "李工", avatarText: "李", avatarBg: "#DDF5EE", avatarColor: "#157658", title: "整合工程师 · 长江存储" }, likeCount: 51, commentCount: 20, viewCount: 180, likes: 51, comments: 20, views: 180, shares: 5, likedOpenids: [], createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { uid: "seed_user_003", userId: "seed_user_003", topicId: "fall-recruit", topicName: "#秋招进展", category: "job", contentType: "chat", content: "今年校招流程大家走到哪一步了？华虹和长存的节奏差别大吗？", tags: ["秋招"], isAnonymous: true, anonymous: true, topic: { text: "#秋招进展", type: "blue" }, author: { uid: "seed_user_003", userId: "seed_user_003", nickname: "匿名用户", name: "匿名用户", avatarText: "匿", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "匿名发布" }, likeCount: 29, commentCount: 8, viewCount: 96, likes: 29, comments: 8, views: 96, shares: 2, likedOpenids: [], createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { uid: "seed_user_004", userId: "seed_user_004", topicId: "salary", topicName: "#薪资爆料", category: "career", contentType: "chat", content: "设备岗今年整体调薪幅度感觉一般，大家所在厂有明显变化吗？", tags: ["薪资"], isAnonymous: true, anonymous: true, topic: { text: "#薪资爆料", type: "blue" }, author: { uid: "seed_user_004", userId: "seed_user_004", nickname: "匿名用户", name: "匿名用户", avatarText: "匿", avatarBg: "#DCE8FF", avatarColor: "#165DC6", title: "匿名发布" }, likeCount: 67, commentCount: 24, viewCount: 230, likes: 67, comments: 24, views: 230, shares: 7, likedOpenids: [], createdAt: db.serverDate(), updatedAt: db.serverDate() },
  { uid: "seed_user_005", userId: "seed_user_005", topicId: "smic", topicName: "#中芯国际", category: "hot", contentType: "chat", content: "中芯近期先进制程招聘又在放量了，做整合和设备的可以关注一下。", tags: ["中芯国际"], isAnonymous: false, anonymous: false, topic: { text: "#中芯国际", type: "blue" }, author: { uid: "seed_user_005", userId: "seed_user_005", nickname: "王工", name: "王工", avatarText: "王", avatarBg: "#ECEBFF", avatarColor: "#5751D8", title: "设备工程师 · 上海" }, likeCount: 40, commentCount: 10, viewCount: 140, likes: 40, comments: 10, views: 140, shares: 4, likedOpenids: [], createdAt: db.serverDate(), updatedAt: db.serverDate() },
];

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
  if (existing.data.length) return;
  for (const row of rows) {
    await db.collection(collectionName).add({ data: row });
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
    "tea_room_topics",
    "companies",
  ];

  for (const name of collections) {
    await safeCreateCollection(name);
  }

  await seedIfEmpty("tea_room_topics", TEA_ROOM_TOPICS.map((item) => ({
    ...item,
    postCount: 0,
    createdAt: db.serverDate(),
  })));

  await seedIfEmpty("companies", COMPANY_SEEDS);

  await seedIfEmpty("news", [
    { title: "中芯国际 Q1 财报超预期，14nm 产能利用率继续抬升", summary: "成熟制程维持高稼动率，先进节点研发持续推进。", content: "<p>中芯国际披露最新季度经营数据，成熟制程与特色工艺仍是营收主力。</p>", category: "industry", tags: [{ text: "行业", type: "blue" }], source: "半导体行业观察", views: 1200, likes: 45, favorites: 12, commentsCount: 8, isHot: true, createdAt: db.serverDate(), updatedAt: db.serverDate() },
    { title: "北方华创新一代刻蚀设备进入客户端验证阶段", summary: "设备能力覆盖先进制程关键场景。", content: "<p>北方华创在先进刻蚀设备上的进展，正在从单点验证转向批量导入。</p>", category: "company", tags: [{ text: "企业", type: "orange" }], source: "芯智讯", views: 860, likes: 32, favorites: 8, commentsCount: 5, isHot: false, createdAt: db.serverDate(), updatedAt: db.serverDate() },
    { title: "FinFET 到 GAA：下一代晶体管架构的设计与制造权衡", summary: "从性能、成本到设计迁移，GAA 落地并不只是器件问题。", content: "<p>GAA 成为先进节点主线后，设计工具链和工艺整合复杂度同步提升。</p>", category: "knowledge", tags: [{ text: "技术", type: "purple" }], source: "工艺派", views: 2140, likes: 88, favorites: 33, commentsCount: 14, isHot: true, createdAt: db.serverDate(), updatedAt: db.serverDate() },
  ]);

  await seedIfEmpty("jobs", [
    { title: "高级工艺整合工程师", company: "中芯国际", city: "上海", experience: "5-10年", education: "硕士及以上", category: "process", tags: ["14nm", "Gate-last", "良率提升"], salaryMin: 40, salaryMax: 60, salaryUnit: "K", salary: "40-60K", bonus: "16薪", description: "负责先进节点工艺整合、良率改善和跨模块协同。", applicationsCount: 0, favorites: 0, status: "active", views: 0, createdAt: db.serverDate(), updatedAt: db.serverDate() },
    { title: "刻蚀设备工程师", company: "北方华创", city: "北京", experience: "3-5年", education: "本科及以上", category: "equipment", tags: ["ICP", "腔体维护", "SPC"], salaryMin: 28, salaryMax: 42, salaryUnit: "K", salary: "28-42K", bonus: "14薪", description: "参与刻蚀设备调试、工艺适配和故障定位。", applicationsCount: 0, favorites: 0, status: "active", views: 0, createdAt: db.serverDate(), updatedAt: db.serverDate() },
  ]);

  await seedIfEmpty("talents", [
    { uid: "talent_mock_001", nameDesensitized: "陈*", education: "硕士", school: "清华大学 · 微电子", years: 5, currentRole: "Fab 工艺工程师", targetRole: "工艺整合", tags: ["FinFET", "CMP", "良率分析"], status: "open", avatarText: "陈", avatarBg: "#DCE8FF", avatarColor: "#165DC6", briefIntro: "5 年晶圆厂工艺经验，熟悉先进节点工艺整合与良率分析。", workHistory: [{ company: "某头部 Fab", position: "工艺工程师", years: "2020-2025" }], favorites: 0, updatedAt: db.serverDate(), createdAt: db.serverDate() },
    { uid: "talent_mock_002", nameDesensitized: "吴*", education: "博士", school: "复旦大学 · 材料", years: 4, currentRole: "材料研发工程师", targetRole: "薄膜工艺", tags: ["ALD", "PVD", "表征分析"], status: "active", avatarText: "吴", avatarBg: "#DDF5EE", avatarColor: "#157658", briefIntro: "有较强的材料表征与薄膜工艺研发背景。", workHistory: [{ company: "某设备厂商", position: "材料研发", years: "2021-2025" }], favorites: 0, updatedAt: db.serverDate(), createdAt: db.serverDate() },
  ]);

  await seedIfEmpty("posts", SAMPLE_POSTS);

  return {
    success: true,
    collections,
    topicCount: TEA_ROOM_TOPICS.length,
    companyCount: COMPANY_SEEDS.length,
    postCount: SAMPLE_POSTS.length,
  };
};
