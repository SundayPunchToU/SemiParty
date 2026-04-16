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

  return {
    success: true,
    message: "SemiCircle seed data initialized",
  };
};
