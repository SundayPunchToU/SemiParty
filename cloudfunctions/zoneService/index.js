const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// ─── 分类元数据 ───
const CATEGORIES = [
  { key: "company", name: "公司", icon: "🏢" },
  { key: "role", name: "工种", icon: "🔧" },
  { key: "tech", name: "技术", icon: "🧪" },
  { key: "campus", name: "校园", icon: "🎓" },
  { key: "supply", name: "供应链", icon: "📦" },
  { key: "region", name: "地区", icon: "📍" }
];

// ─── 54 个专区种子数据 ───
const ZONE_SEEDS = [
  // 晶圆茶水间（特殊专区）
  {
    zoneId: "tea-room", zoneName: "晶圆茶水间",
    zoneDesc: "半导体人的深夜食堂——闲聊杂谈、厂区生活、通勤、食堂、夜班、职场吐槽、行业八卦",
    category: "special", isSpecial: true, sortOrder: 999, memberCount: 50000, todayPostCount: 320, totalPostCount: 18500,
    tabs: [{ tabKey: "hot", tabName: "🔥热门" }, { tabKey: "all", tabName: "全部" }],
    pinnedPosts: [], status: "active"
  },
  // 公司专区 10 个
  ...[
    { zoneId: "smic", zoneName: "中芯国际专区", zoneDesc: "SMIC从业者与关注者的讨论社区", category: "company", memberCount: 12500, sortOrder: 100 },
    { zoneId: "hua-hong", zoneName: "华虹半导体专区", zoneDesc: "华虹宏力从业者与关注者社区", category: "company", memberCount: 8200, sortOrder: 90 },
    { zoneId: "cxmt", zoneName: "长鑫存储专区", zoneDesc: "CXMT从业者与关注者社区", category: "company", memberCount: 15100, sortOrder: 95 },
    { zoneId: "ymtc", zoneName: "长江存储专区", zoneDesc: "YMTC从业者与关注者社区", category: "company", memberCount: 13800, sortOrder: 93 },
    { zoneId: "naura", zoneName: "北方华创专区", zoneDesc: "NAURA从业者与关注者社区", category: "company", memberCount: 6800, sortOrder: 80 },
    { zoneId: "asml", zoneName: "ASML专区", zoneDesc: "ASML从业者与关注者社区", category: "company", memberCount: 9400, sortOrder: 88 },
    { zoneId: "amat", zoneName: "应用材料专区", zoneDesc: "Applied Materials从业者与关注者社区", category: "company", memberCount: 5200, sortOrder: 75 },
    { zoneId: "amec", zoneName: "中微半导体专区", zoneDesc: "AMEC从业者与关注者社区", category: "company", memberCount: 4100, sortOrder: 70 },
    { zoneId: "acm", zoneName: "盛美上海专区", zoneDesc: "ACM Research从业者与关注者社区", category: "company", memberCount: 3500, sortOrder: 65 },
    { zoneId: "empyrean", zoneName: "华大九天专区", zoneDesc: "Empyrean从业者与关注者社区", category: "company", memberCount: 3800, sortOrder: 63 }
  ].map(z => ({
    ...z, zoneIcon: null, zoneBanner: null, isSpecial: false, todayPostCount: 0, totalPostCount: 0,
    tabs: [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "qa", tabName: "问答" }, { tabKey: "recruit", tabName: "招聘" }, { tabKey: "news", tabName: "资讯" }, { tabKey: "best", tabName: "精华" }],
    pinnedPosts: [], status: "active"
  })),
  // 工种专区 10 个
  ...[
    { zoneId: "process-eng", zoneName: "工艺工程师专区", zoneDesc: "半导体工艺工程师交流社区", category: "role", memberCount: 18300, sortOrder: 100 },
    { zoneId: "equip-eng", zoneName: "设备工程师专区", zoneDesc: "半导体设备工程师交流社区", category: "role", memberCount: 14600, sortOrder: 95 },
    { zoneId: "eda-eng", zoneName: "EDA工程师专区", zoneDesc: "EDA/IC设计工程师交流社区", category: "role", memberCount: 7200, sortOrder: 85 },
    { zoneId: "yield", zoneName: "良率分析专区", zoneDesc: "良率分析与改善工程师社区", category: "role", memberCount: 6500, sortOrder: 80 },
    { zoneId: "packaging", zoneName: "封测工程师专区", zoneDesc: "封装测试工程师交流社区", category: "role", memberCount: 8900, sortOrder: 82 },
    { zoneId: "integration", zoneName: "整合工程师专区", zoneDesc: "工艺整合工程师交流社区", category: "role", memberCount: 5100, sortOrder: 75 },
    { zoneId: "purchase", zoneName: "采购专区", zoneDesc: "半导体行业采购人员交流社区", category: "role", memberCount: 4300, sortOrder: 60 },
    { zoneId: "hr-zone", zoneName: "HR专区", zoneDesc: "半导体行业HR与招聘从业者社区", category: "role", memberCount: 6700, sortOrder: 70 },
    { zoneId: "quality", zoneName: "品质工程师专区", zoneDesc: "半导体品质与可靠性工程师社区", category: "role", memberCount: 3900, sortOrder: 55 },
    { zoneId: "scm", zoneName: "供应链管理专区", zoneDesc: "半导体供应链管理人员社区", category: "role", memberCount: 3200, sortOrder: 50 }
  ].map(z => ({
    ...z, zoneIcon: null, zoneBanner: null, isSpecial: false, todayPostCount: 0, totalPostCount: 0,
    tabs: [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "qa", tabName: "问答" }, { tabKey: "recruit", tabName: "招聘" }, { tabKey: "news", tabName: "资讯" }, { tabKey: "best", tabName: "精华" }],
    pinnedPosts: [], status: "active"
  })),
  // 技术专区 12 个
  ...[
    { zoneId: "finfet", zoneName: "FinFET专区", zoneDesc: "FinFET工艺技术讨论社区", category: "tech", memberCount: 11200, sortOrder: 100,
      tabs: [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "qa", tabName: "问答" }, { tabKey: "paper", tabName: "论文" }, { tabKey: "project", tabName: "项目" }, { tabKey: "best", tabName: "精华" }] },
    { zoneId: "gaa", zoneName: "GAA专区", zoneDesc: "Gate-All-Around全环绕栅极技术社区", category: "tech", memberCount: 8700, sortOrder: 98,
      tabs: [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "qa", tabName: "问答" }, { tabKey: "paper", tabName: "论文" }, { tabKey: "project", tabName: "项目" }, { tabKey: "best", tabName: "精华" }] },
    { zoneId: "cmp", zoneName: "CMP专区", zoneDesc: "化学机械抛光技术讨论社区", category: "tech", memberCount: 6300, sortOrder: 85 },
    { zoneId: "dfm", zoneName: "DFM专区", zoneDesc: "可制造性设计技术讨论社区", category: "tech", memberCount: 4800, sortOrder: 75 },
    { zoneId: "hbm", zoneName: "HBM专区", zoneDesc: "高带宽存储器技术讨论社区", category: "tech", memberCount: 9500, sortOrder: 95 },
    { zoneId: "adv-pkg", zoneName: "先进封装专区", zoneDesc: "先进封装技术讨论社区（Chiplet、CoWoS、InFO等）", category: "tech", memberCount: 10100, sortOrder: 93 },
    { zoneId: "sic-gan", zoneName: "SiC/GaN专区", zoneDesc: "碳化硅与氮化镓宽禁带半导体社区", category: "tech", memberCount: 7600, sortOrder: 88 },
    { zoneId: "litho", zoneName: "光刻专区", zoneDesc: "光刻工艺与设备技术讨论社区", category: "tech", memberCount: 8400, sortOrder: 90 },
    { zoneId: "metrology", zoneName: "量测专区", zoneDesc: "半导体量测与检测技术社区", category: "tech", memberCount: 4200, sortOrder: 65 },
    { zoneId: "thin-film", zoneName: "薄膜沉积专区", zoneDesc: "CVD/PVD/ALD薄膜沉积技术社区", category: "tech", memberCount: 5700, sortOrder: 72 },
    { zoneId: "etch", zoneName: "刻蚀专区", zoneDesc: "干法刻蚀与湿法刻蚀技术社区", category: "tech", memberCount: 6100, sortOrder: 78 },
    { zoneId: "implant", zoneName: "离子注入专区", zoneDesc: "离子注入工艺与设备技术社区", category: "tech", memberCount: 3800, sortOrder: 60 }
  ].map(z => ({
    ...z, zoneIcon: null, zoneBanner: null, isSpecial: false, todayPostCount: 0, totalPostCount: 0,
    tabs: z.tabs || [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "qa", tabName: "问答" }, { tabKey: "paper", tabName: "论文" }, { tabKey: "best", tabName: "精华" }],
    pinnedPosts: [], status: "active"
  })),
  // 校园专区 6 个
  ...[
    { zoneId: "intern", zoneName: "实习交流专区", zoneDesc: "半导体实习信息与经验分享", category: "campus", memberCount: 12300, sortOrder: 90,
      tabs: [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "interview", tabName: "面经" }, { tabKey: "intern", tabName: "实习" }, { tabKey: "best", tabName: "精华" }] },
    { zoneId: "campus-recruit", zoneName: "校园招聘专区", zoneDesc: "半导体行业校招信息汇总", category: "campus", memberCount: 15600, sortOrder: 100,
      tabs: [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "interview", tabName: "面经" }, { tabKey: "recruit", tabName: "校招" }, { tabKey: "best", tabName: "精华" }] },
    { zoneId: "interview-exp", zoneName: "面经分享专区", zoneDesc: "半导体行业面试经验分享", category: "campus", memberCount: 11800, sortOrder: 95,
      tabs: [{ tabKey: "all", tabName: "全部" }, { tabKey: "interview", tabName: "面经" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "best", tabName: "精华" }] },
    { zoneId: "advisor", zoneName: "导师评价专区", zoneDesc: "微电子/集成电路相关导师评价与信息", category: "campus", memberCount: 4500, sortOrder: 60 },
    { zoneId: "thesis", zoneName: "论文讨论专区", zoneDesc: "半导体相关学术论文讨论", category: "campus", memberCount: 5200, sortOrder: 65 },
    { zoneId: "abroad", zoneName: "留学申请专区", zoneDesc: "微电子相关留学申请交流", category: "campus", memberCount: 3100, sortOrder: 50 }
  ].map(z => ({
    ...z, zoneIcon: null, zoneBanner: null, isSpecial: false, todayPostCount: 0, totalPostCount: 0,
    tabs: z.tabs || [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "best", tabName: "精华" }],
    pinnedPosts: [], status: "active"
  })),
  // 供应链专区 5 个
  ...[
    { zoneId: "equip-buy", zoneName: "设备采购专区", zoneDesc: "半导体设备采购交流与供需对接", category: "supply", memberCount: 5800, sortOrder: 100,
      tabs: [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "demand", tabName: "供需" }, { tabKey: "inquiry", tabName: "询盘" }, { tabKey: "best", tabName: "精华" }] },
    { zoneId: "material", zoneName: "材料供应专区", zoneDesc: "半导体材料供应与采购交流", category: "supply", memberCount: 4300, sortOrder: 90 },
    { zoneId: "spare-parts", zoneName: "备件询盘专区", zoneDesc: "半导体设备备件询盘与供应", category: "supply", memberCount: 3600, sortOrder: 80 },
    { zoneId: "alternatives", zoneName: "替代方案专区", zoneDesc: "半导体材料与设备国产替代方案讨论", category: "supply", memberCount: 6200, sortOrder: 85 },
    { zoneId: "supplier-review", zoneName: "供应商评价专区", zoneDesc: "半导体供应商评价与推荐", category: "supply", memberCount: 4700, sortOrder: 75 }
  ].map(z => ({
    ...z, zoneIcon: null, zoneBanner: null, isSpecial: false, todayPostCount: 0, totalPostCount: 0,
    tabs: z.tabs || [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "demand", tabName: "供需" }, { tabKey: "inquiry", tabName: "询盘" }, { tabKey: "best", tabName: "精华" }],
    pinnedPosts: [], status: "active"
  })),
  // 地区专区 10 个
  ...[
    { zoneId: "shanghai", zoneName: "上海专区", zoneDesc: "上海半导体从业者交流社区", category: "region", memberCount: 22300, sortOrder: 100 },
    { zoneId: "wuxi", zoneName: "无锡专区", zoneDesc: "无锡半导体从业者交流社区", category: "region", memberCount: 12800, sortOrder: 85 },
    { zoneId: "hefei", zoneName: "合肥专区", zoneDesc: "合肥半导体从业者交流社区", category: "region", memberCount: 14500, sortOrder: 90 },
    { zoneId: "wuhan", zoneName: "武汉专区", zoneDesc: "武汉半导体从业者交流社区", category: "region", memberCount: 13200, sortOrder: 88 },
    { zoneId: "shenzhen", zoneName: "深圳专区", zoneDesc: "深圳半导体从业者交流社区", category: "region", memberCount: 11600, sortOrder: 82 },
    { zoneId: "xian", zoneName: "西安专区", zoneDesc: "西安半导体从业者交流社区", category: "region", memberCount: 8400, sortOrder: 70 },
    { zoneId: "suzhou", zoneName: "苏州专区", zoneDesc: "苏州半导体从业者交流社区", category: "region", memberCount: 9700, sortOrder: 75 },
    { zoneId: "beijing", zoneName: "北京专区", zoneDesc: "北京半导体从业者交流社区", category: "region", memberCount: 10300, sortOrder: 78 },
    { zoneId: "chengdu", zoneName: "成都专区", zoneDesc: "成都半导体从业者交流社区", category: "region", memberCount: 7100, sortOrder: 65 },
    { zoneId: "dalian", zoneName: "大连专区", zoneDesc: "大连半导体从业者交流社区", category: "region", memberCount: 5600, sortOrder: 55 }
  ].map(z => ({
    ...z, zoneIcon: null, zoneBanner: null, isSpecial: false, todayPostCount: 0, totalPostCount: 0,
    tabs: [{ tabKey: "all", tabName: "全部" }, { tabKey: "discuss", tabName: "讨论" }, { tabKey: "recruit", tabName: "招聘" }, { tabKey: "life", tabName: "生活" }, { tabKey: "best", tabName: "精华" }],
    pinnedPosts: [], status: "active"
  }))
];

// 茶水间话题种子
const TEA_ROOM_TOPICS = [
  { topicId: "hot", topicName: "🔥热门", postCount: 1234 },
  { topicId: "night-shift", topicName: "#夜班日常", postCount: 567 },
  { topicId: "canteen", topicName: "#食堂测评", postCount: 345 },
  { topicId: "commute", topicName: "#通勤吐槽", postCount: 289 },
  { topicId: "gossip", topicName: "#行业八卦", postCount: 456 },
  { topicId: "fab-life", topicName: "#厂区生活", postCount: 678 },
  { topicId: "job-hop", topicName: "#跳槽故事", postCount: 234 },
  { topicId: "slacking", topicName: "#今天摸鱼", postCount: 189 }
];

// ─── Helper ───
async function getUserJoinedZoneIds(openid) {
  const records = await getUserZoneJoinRecords(openid);
  return new Set(records.map(r => r.zoneId));
}

async function getUserZoneJoinRecords(openid) {
  const results = await Promise.all([
    db.collection("user_zones").where({ userId: openid }).get(),
    db.collection("user_zones").where({ openid }).get(),
    db.collection("user_zones").where({ uid: openid }).get(),
  ]);
  const deduped = {};

  results.forEach((res) => {
    (res.data || []).forEach((item) => {
      const key = item._id || `${item.zoneId}_${item.userId || item.openid || item.uid || openid}`;
      if (!deduped[key]) {
        deduped[key] = item;
      }
    });
  });

  return Object.values(deduped).sort((left, right) => {
    const leftTime = new Date(left.lastVisitedAt || left.joinedAt || 0).getTime();
    const rightTime = new Date(right.lastVisitedAt || right.joinedAt || 0).getTime();
    return rightTime - leftTime;
  });
}

async function attachIsJoined(zones, openid) {
  const joinedIds = await getUserJoinedZoneIds(openid);
  return zones.map(z => ({ ...z, isJoined: joinedIds.has(z.zoneId) }));
}

// ─── Actions ───

// 1. 获取分类列表
async function getCategories() {
  const categories = [];
  for (const cat of CATEGORIES) {
    const countRes = await db.collection("zones").where({ category: cat.key, status: "active" }).count();
    categories.push({ ...cat, zoneCount: countRes.total });
  }
  return { categories };
}

// 2. 获取专区列表（按分类分页）
async function getZoneList(event, openid) {
  const { category, page = 1, size = 20 } = event;
  const query = { status: "active" };
  if (category) query.category = category;

  const countRes = await db.collection("zones").where(query).count();
  const skip = (page - 1) * size;
  const listRes = await db.collection("zones").where(query)
    .orderBy("sortOrder", "desc").skip(skip).limit(size).get();

  const zones = await attachIsJoined(listRes.data, openid);
  return { zones, total: countRes.total, page, size };
}

// 3. 获取专区详情
async function getZoneDetail(event, openid) {
  const { zoneId } = event;
  const res = await db.collection("zones").where({ zoneId }).limit(1).get();
  if (!res.data.length) throw new Error("zone not found");
  const zones = await attachIsJoined(res.data, openid);
  return zones[0];
}

// 4. 获取专区帖子列表
async function getZonePosts(event) {
  const { zoneId, tab = "all", sort = "latest", page = 1, size = 20 } = event;
  const query = { zoneId };
  if (tab && tab !== "all") query.contentType = tab;
  if (tab === "best") { delete query.contentType; query.isBest = true; }

  const countRes = await db.collection("posts").where(query).count();
  const orderField = sort === "hot" ? "likes" : (sort === "reply" ? "comments" : "createdAt");
  const orderDir = sort === "latest" || sort === "reply" ? "desc" : "desc";
  const skip = (page - 1) * size;

  const postsRes = await db.collection("posts").where(query)
    .orderBy(orderField, orderDir).skip(skip).limit(size).get();

  return { posts: postsRes.data, total: countRes.total, page, size };
}

// 5. 获取专区置顶帖
async function getZonePinned(event) {
  const { zoneId } = event;
  const zoneRes = await db.collection("zones").where({ zoneId }).field({ pinnedPosts: true }).limit(1).get();
  if (!zoneRes.data.length) return { posts: [] };
  const pinnedIds = zoneRes.data[0].pinnedPosts || [];
  if (!pinnedIds.length) return { posts: [] };

  const postsRes = await db.collection("posts").where({ _id: _.in(pinnedIds) }).get();
  return { posts: postsRes.data };
}

// 6. 加入专区
async function joinZone(event, openid) {
  const { zoneId } = event;
  const existingRecords = await getUserZoneJoinRecords(openid);
  if (existingRecords.find((item) => item.zoneId === zoneId)) {
    return { success: true, message: "already joined" };
  }

  await db.collection("user_zones").add({
    data: {
      userId: openid,
      openid,
      uid: openid,
      zoneId,
      joinedAt: db.serverDate(),
      lastVisitedAt: null,
      hasNewContent: false,
    },
  });
  await db.collection("zones").where({ zoneId }).update({ data: { memberCount: _.inc(1), updatedAt: db.serverDate() } });
  return { success: true, message: "joined" };

  const existing = await db.collection("user_zones").where({ userId: openid, zoneId }).limit(1).get();
  if (existing.data.length) return { success: true, message: "已加入" };

  await db.collection("user_zones").add({ data: { userId: openid, zoneId, joinedAt: db.serverDate(), lastVisitedAt: null, hasNewContent: false } });
  await db.collection("zones").where({ zoneId }).update({ data: { memberCount: _.inc(1), updatedAt: db.serverDate() } });
  return { success: true, message: "加入成功" };
}

// 7. 退出专区
async function leaveZone(event, openid) {
  const { zoneId } = event;
  const existingRecords = (await getUserZoneJoinRecords(openid)).filter((item) => item.zoneId === zoneId);
  if (!existingRecords.length) {
    return { success: true, message: "not joined" };
  }

  for (const item of existingRecords) {
    if (item._id) {
      await db.collection("user_zones").doc(item._id).remove();
    }
  }
  await db.collection("zones").where({ zoneId }).update({ data: { memberCount: _.inc(-1), updatedAt: db.serverDate() } });
  return { success: true, message: "left" };

  const existing = await db.collection("user_zones").where({ userId: openid, zoneId }).limit(1).get();
  if (!existing.data.length) return { success: true, message: "未加入" };

  await db.collection("user_zones").doc(existing.data[0]._id).remove();
  await db.collection("zones").where({ zoneId }).update({ data: { memberCount: _.inc(-1), updatedAt: db.serverDate() } });
  return { success: true, message: "退出成功" };
}

// 8. 获取用户已加入的专区列表
async function getUserZones(openid) {
  const joinList = await getUserZoneJoinRecords(openid);
  if (!joinList.length) return { zones: [] };

  const zoneIds = joinList.map((item) => item.zoneId);
  const zoneRes = await db.collection("zones").where({ zoneId: _.in(zoneIds) }).field({
    zoneId: true,
    zoneName: true,
    zoneIcon: true,
    memberCount: true,
    category: true,
    zoneDesc: true,
    tabs: true
  }).get();
  const zoneMap = {};
  zoneRes.data.forEach((item) => {
    zoneMap[item.zoneId] = item;
  });

  return {
    zones: joinList.map((item) => ({
      zoneId: item.zoneId,
      zoneName: (zoneMap[item.zoneId] || {}).zoneName || "",
      zoneIcon: (zoneMap[item.zoneId] || {}).zoneIcon || null,
      category: (zoneMap[item.zoneId] || {}).category || "",
      zoneDesc: (zoneMap[item.zoneId] || {}).zoneDesc || "",
      memberCount: (zoneMap[item.zoneId] || {}).memberCount || 0,
      tabs: (zoneMap[item.zoneId] || {}).tabs || [],
      hasNewContent: item.hasNewContent,
      joinedAt: item.joinedAt
    }))
  };

  const joinRes = await db.collection("user_zones").where({ userId: openid }).orderBy("lastVisitedAt", "desc").get();
  if (!joinRes.data.length) return { zones: [] };

  const zoneIds = joinRes.data.map(j => j.zoneId);
  const zoneRes = await db.collection("zones").where({ zoneId: _.in(zoneIds) }).field({ zoneId: true, zoneName: true, zoneIcon: true, memberCount: true }).get();
  const zoneMap = {};
  zoneRes.data.forEach(z => { zoneMap[z.zoneId] = z; });

  const joinMap = {};
  joinRes.data.forEach(j => { joinMap[j.zoneId] = j; });

  const zones = joinRes.data.map(j => ({
    zoneId: j.zoneId,
    zoneName: (zoneMap[j.zoneId] || {}).zoneName || "",
    zoneIcon: (zoneMap[j.zoneId] || {}).zoneIcon || null,
    hasNewContent: j.hasNewContent,
    joinedAt: j.joinedAt
  }));
  return { zones };
}

// 9. 推荐专区
async function recommendZones(event, openid) {
  const { limit = 5 } = event;
  const joinedIds = await getUserJoinedZoneIds(openid);
  const query = joinedIds.size ? { zoneId: _.nin(Array.from(joinedIds)), status: "active" } : { status: "active" };
  const res = await db.collection("zones").where(query).orderBy("memberCount", "desc").limit(limit).get();
  const zones = await attachIsJoined(res.data, openid);
  return { zones };
}

// 10. 茶水间话题
async function getTeaRoomTopics() {
  return { topics: TEA_ROOM_TOPICS };
}

// ─── Seed helpers ───
async function seedZones() {
  const existing = await db.collection("zones").limit(1).get();
  if (existing.data.length) return;
  for (const zone of ZONE_SEEDS) {
    await db.collection("zones").add({ data: { ...zone, createdAt: db.serverDate(), updatedAt: db.serverDate() } });
  }
}

async function seedTeaRoomTopics() {
  const existing = await db.collection("tea_room_topics").limit(1).get();
  if (existing.data.length) return;
  for (const topic of TEA_ROOM_TOPICS) {
    await db.collection("tea_room_topics").add({ data: { ...topic, createdAt: db.serverDate() } });
  }
}

// ─── Main ───
exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();

  switch (event.action) {
    case "getCategories": return await getCategories();
    case "getZoneList": return await getZoneList(event, OPENID);
    case "getZoneDetail": return await getZoneDetail(event, OPENID);
    case "getZonePosts": return await getZonePosts(event);
    case "getZonePinned": return await getZonePinned(event);
    case "joinZone": return await joinZone(event, OPENID);
    case "leaveZone": return await leaveZone(event, OPENID);
    case "getUserZones": return await getUserZones(OPENID);
    case "recommendZones": return await recommendZones(event, OPENID);
    case "getTeaRoomTopics": return await getTeaRoomTopics();
    case "seed": await seedZones(); await seedTeaRoomTopics(); return { success: true, message: "zone seed data initialized" };
    default: throw new Error("unknown action: " + event.action);
  }
};
