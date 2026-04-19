const mockData = require("./mock-data");
const { deepClone, formatChatTime } = require("./util");

const PAGE_SIZE = 20;
const SEARCH_TYPES = ["all", "news", "post", "job", "talent"];
const JOB_STATUS_LABELS = {
  open: "在看机会",
  active: "主动求职",
  closed: "暂不考虑",
};

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function canUseCloud() {
  return typeof wx !== "undefined" && !!wx.cloud;
}

function getDb() {
  return wx.cloud.database();
}

function getAppState() {
  const app = getApp();
  if (!app.globalData.mockState) {
    app.globalData.mockState = app.loadMockState
      ? app.loadMockState()
      : {
          appliedJobs: {},
          chats: deepClone(mockData.chatList),
          chatMessages: {},
        };
  }
  return app.globalData;
}

function shouldUseMock() {
  const appState = getAppState();
  return !canUseCloud() || !!appState.useMock;
}

function shouldFallbackToMockOnError(error) {
  const message = String(error?.errMsg || error?.message || error || "");
  return (
    message.includes("-501000") ||
    message.includes("-504002") ||
    message.includes("-502005") ||
    /functionname parameter could not be found/i.test(message) ||
    /function not found/i.test(message) ||
    /timeout/i.test(message) ||
    /database collection not exists/i.test(message) ||
    /resourcenotfound/i.test(message) ||
    /db or table not exist/i.test(message)
  );
}

async function execute(cloudTask, mockTask, options = {}) {
  const { fallbackOnCloudError = false } = options;
  if (shouldUseMock()) {
    return mockTask();
  }

  try {
    return await cloudTask();
  } catch (error) {
    if (fallbackOnCloudError && typeof mockTask === "function" && shouldFallbackToMockOnError(error)) {
      console.warn("cloud task unavailable, fallback to mock", error);
      return mockTask();
    }
    throw error;
  }
}

function paginate(list, page = 1, pageSize = 4) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: deepClone(list.slice(start, end)),
    hasMore: end < list.length,
  };
}

function normalizeNewsArgs(arg1, arg2) {
  if (typeof arg1 === "object" && arg1 !== null) {
    return {
      category: arg1.category || "recommend",
      sort: arg1.sort || "createdAt",
      page: arg1.page || 1,
      pageSize: arg1.pageSize || PAGE_SIZE,
    };
  }

  return {
    category: arg1 || "recommend",
    sort: "createdAt",
    page: arg2 || 1,
    pageSize: PAGE_SIZE,
  };
}

function normalizePostArgs(arg1, arg2) {
  if (typeof arg1 === "object" && arg1 !== null) {
    return {
      category: arg1.category || "hot",
      topic: arg1.topic || "",
      page: arg1.page || 1,
      pageSize: arg1.pageSize || PAGE_SIZE,
    };
  }

  return {
    category: arg1 || "hot",
    topic: "",
    page: arg2 || 1,
    pageSize: PAGE_SIZE,
  };
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getPrimaryTag(tags = []) {
  if (!Array.isArray(tags) || !tags.length) {
    return null;
  }

  const first = tags[0];
  if (typeof first === "string") {
    return { text: first, type: "blue" };
  }

  if (first && typeof first === "object") {
    const text = String(first.text || first.label || first.name || "").trim();
    if (!text) {
      return null;
    }
    return {
      text,
      type: first.type || "blue",
    };
  }

  return null;
}

function normalizeTags(tags = [], topic = null) {
  if (Array.isArray(tags) && tags.length > 0) {
    return tags
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }
        if (item && typeof item === "object") {
          return String(item.text || item.label || item.name || "").trim();
        }
        return "";
      })
      .filter(Boolean);
  }

  if (topic && typeof topic === "object" && topic.text) {
    return [String(topic.text).trim()].filter(Boolean);
  }

  return [];
}

function extractPostTitle(record = {}, content = "") {
  const explicitTitle = String(record.title || "").trim();
  if (explicitTitle) {
    return explicitTitle;
  }

  const source = String(content || "").replace(/\s+/g, " ").trim();
  if (!source) {
    return "";
  }

  return source.slice(0, 36);
}

function normalizePostAuthor(record = {}, isAnonymous = false) {
  const nickname =
    record.nickname ||
    record.name ||
    record.nickName ||
    (isAnonymous ? "匿名用户" : "用户");
  const avatar = record.avatar || record.avatarUrl || "";
  const avatarText =
    record.avatarText ||
    (nickname ? String(nickname).slice(0, 1) : "U");
  const company = record.company || "";
  const roleLabel = record.roleLabel || record.role || "";
  const titleText = record.title || "";

  return {
    userId: record.userId || record.uid || record.openid || "",
    uid: record.uid || record.userId || record.openid || "",
    nickname,
    name: nickname,
    avatar,
    avatarUrl: avatar,
    avatarText,
    avatarBg: record.avatarBg || "#DCE8FF",
    avatarColor: record.avatarColor || "#165DC6",
    roleLabel,
    role: roleLabel,
    company,
    title: titleText,
    experience: record.experience || "",
  };
}

function normalizePost(record) {
  if (!record) {
    return null;
  }

  const content = String(record.content || "").trim();
  const tags = normalizeTags(record.tags, record.topic);
  const topic = record.topic || getPrimaryTag(tags);
  const isAnonymous = Boolean(
    record.isAnonymous !== undefined ? record.isAnonymous : record.anonymous
  );
  const author = normalizePostAuthor(record.author || {}, isAnonymous);
  const title = extractPostTitle(record, content);
  const likeCount = safeNumber(record.likeCount, safeNumber(record.likes, 0));
  const commentCount = safeNumber(record.commentCount, safeNumber(record.comments, 0));
  const viewCount = safeNumber(record.viewCount, safeNumber(record.views, 0));
  const zoneId = record.zoneId || "";
  const zoneName = record.zoneName || "";
  const contentType = record.contentType || "discuss";
  const id = record._id || record.id;

  return {
    ...record,
    _id: id,
    id,
    uid: record.uid || author.uid || author.userId || "",
    userId: record.userId || author.userId || author.uid || "",
    zoneId,
    zoneName,
    contentType,
    category: record.category || "hot",
    title,
    content,
    tags,
    topic,
    isAnonymous,
    anonymous: isAnonymous,
    author,
    likeCount,
    commentCount,
    viewCount,
    likes: likeCount,
    comments: commentCount,
    views: viewCount,
    likedOpenids: Array.isArray(record.likedOpenids) ? record.likedOpenids : [],
    commentsList: Array.isArray(record.commentsList) ? record.commentsList : [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt || record.createdAt,
  };
}

const ZONE_TAB_FALLBACK_MAP = {
  company: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "qa", tabName: "问答" },
    { tabKey: "recruit", tabName: "招聘" },
    { tabKey: "news", tabName: "资讯" },
    { tabKey: "best", tabName: "精华" },
  ],
  role: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "qa", tabName: "问答" },
    { tabKey: "recruit", tabName: "招聘" },
    { tabKey: "news", tabName: "资讯" },
    { tabKey: "best", tabName: "精华" },
  ],
  tech: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "qa", tabName: "问答" },
    { tabKey: "paper", tabName: "论文" },
    { tabKey: "project", tabName: "项目" },
    { tabKey: "best", tabName: "精华" },
  ],
  campus: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "qa", tabName: "问答" },
    { tabKey: "recruit", tabName: "校招" },
    { tabKey: "interview", tabName: "面经" },
    { tabKey: "best", tabName: "精华" },
  ],
  supply: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "demand", tabName: "供需" },
    { tabKey: "recruit", tabName: "招聘" },
    { tabKey: "news", tabName: "资讯" },
    { tabKey: "best", tabName: "精华" },
  ],
  region: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "qa", tabName: "问答" },
    { tabKey: "recruit", tabName: "招聘" },
    { tabKey: "news", tabName: "资讯" },
    { tabKey: "best", tabName: "精华" },
  ],
  special: [
    { tabKey: "hot", tabName: "热门" },
    { tabKey: "all", tabName: "全部" },
  ],
};

const TEA_ROOM_TOPIC_FALLBACKS = [
  { topicId: "hot", topicName: "热门" },
  { topicId: "night-shift", topicName: "#夜班日常" },
  { topicId: "canteen", topicName: "#食堂测评" },
  { topicId: "commute", topicName: "#通勤吐槽" },
  { topicId: "gossip", topicName: "#行业八卦" },
  { topicId: "fab-life", topicName: "#厂区生活" },
  { topicId: "job-hop", topicName: "#跳槽故事" },
];

function normalizeZoneTab(tab = {}) {
  const tabKey = tab.tabKey || tab.key || "";
  const tabName = tab.tabName || tab.name || tab.label || "";
  return {
    tabKey,
    tabName,
  };
}

function getZoneTabFallback(category = "company") {
  return deepClone(ZONE_TAB_FALLBACK_MAP[category] || ZONE_TAB_FALLBACK_MAP.company);
}

function normalizeZone(record) {
  if (!record) {
    return null;
  }

  const zoneId = record.zoneId || record._id || record.id || "";
  const category = record.category || (zoneId === "tea-room" ? "special" : "company");
  const tabs =
    Array.isArray(record.tabs) && record.tabs.length
      ? record.tabs.map(normalizeZoneTab).filter((item) => item.tabKey)
      : getZoneTabFallback(category);

  return {
    ...record,
    id: zoneId,
    zoneId,
    zoneName: record.zoneName || record.name || "",
    zoneDesc: record.zoneDesc || record.description || "",
    zoneIcon: record.zoneIcon || record.icon || "",
    zoneBanner: record.zoneBanner || record.banner || "",
    category,
    memberCount: safeNumber(record.memberCount),
    todayPostCount: safeNumber(record.todayPostCount, safeNumber(record.todayPosts, 0)),
    totalPostCount: safeNumber(record.totalPostCount),
    isJoined: Boolean(record.isJoined),
    isSpecial: Boolean(record.isSpecial || category === "special" || zoneId === "tea-room"),
    tabs,
    pinnedPosts: Array.isArray(record.pinnedPosts) ? record.pinnedPosts : [],
    hasNewContent: Boolean(
      record.hasNewContent !== undefined ? record.hasNewContent : record.hasNew
    ),
    joinedAt: record.joinedAt || null,
    status: record.status || "active",
  };
}

function normalizeTeaRoomTopic(topic = {}) {
  const topicId = topic.topicId || topic.id || topic.key || "";
  const topicName = topic.topicName || topic.name || topic.label || "";
  return {
    ...topic,
    topicId,
    topicName,
    name: topicName,
    postCount: safeNumber(topic.postCount),
  };
}

function getMockZoneCatalog() {
  const zoneData = require("./mock-zone-data");
  const catalog = Object.entries(zoneData.zonesByCategory || {}).flatMap(([category, list]) =>
    (list || []).map((zone) =>
      normalizeZone({
        ...zone,
        category,
      })
    )
  );

  if (!catalog.find((item) => item.zoneId === "tea-room")) {
    catalog.unshift(
      normalizeZone({
        zoneId: "tea-room",
        zoneName: "晶圆茶水间",
        zoneDesc: "半导体从业者的轻社交讨论区",
        category: "special",
        memberCount: 50000,
        todayPostCount: 320,
        totalPostCount: 18500,
      })
    );
  }

  return catalog;
}

function getMockZoneById(zoneId) {
  return getMockZoneCatalog().find((item) => item.zoneId === zoneId) || null;
}

function getMockUserZoneList() {
  const zoneData = require("./mock-zone-data");
  const zoneMap = getMockZoneCatalog().reduce((acc, zone) => {
    acc[zone.zoneId] = zone;
    return acc;
  }, {});

  return (zoneData.myZones || []).map((item) =>
    normalizeZone({
      ...(zoneMap[item.zoneId] || {}),
      ...item,
      zoneId: item.zoneId,
      zoneName: item.zoneName || zoneMap[item.zoneId]?.zoneName || "",
    })
  );
}

function resolveMockZoneByCategory(category) {
  return getMockZoneCatalog().filter((item) => item.category === category);
}

function sortPosts(list, sort) {
  const factor = sort === "hot" ? "likeCount" : sort === "reply" ? "commentCount" : "createdAt";
  const getSortValue = (item) => {
    if (factor === "createdAt") {
      return new Date(item.createdAt || 0).getTime();
    }
    return safeNumber(item[factor], 0);
  };
  return list.slice().sort((left, right) => getSortValue(right) - getSortValue(left));
}

function getMockZonePostResult({ zoneId, tab = "all", sort = "latest", page = 1, size = 20 }) {
  const zone = getMockZoneById(zoneId) || normalizeZone({ zoneId });
  const topicSeeds = TEA_ROOM_TOPIC_FALLBACKS.slice(1);
  const basePosts = deepClone(mockData.postList)
    .map((item, index) => {
      const fallbackTopic = topicSeeds[index % topicSeeds.length] || TEA_ROOM_TOPIC_FALLBACKS[0];
      const sourceTags = Array.isArray(item.tags) && item.tags.length ? item.tags : [];
      const tags =
        zoneId === "tea-room"
          ? [fallbackTopic.topicName]
          : sourceTags.length
          ? sourceTags
          : item.topic?.text
          ? [item.topic.text]
          : [];

      const contentType =
        zoneId === "tea-room"
          ? "chat"
          : tab !== "all" && tab !== "best" && tab !== "hot"
          ? tab
          : item.contentType || "discuss";

      return normalizePost({
        ...item,
        _id: item._id || item.id || `${zoneId}_mock_${index}`,
        id: item._id || item.id || `${zoneId}_mock_${index}`,
        zoneId,
        zoneName: zone.zoneName,
        category: zone.category,
        contentType,
        tags,
        isBest: index % 4 === 0,
      });
    })
    .filter(Boolean);

  let list = basePosts;
  if (tab === "best") {
    list = list.filter((item) => item.isBest);
  } else if (tab !== "all" && tab !== "hot") {
    list = list.filter((item) => item.contentType === tab);
  }

  const sorted = sortPosts(list, sort);
  const start = (page - 1) * size;
  const data = sorted.slice(start, start + size);

  return {
    posts: data,
    total: sorted.length,
    page,
    size,
  };
}

function createEmptyUnreadSummary() {
  return {
    privateUnread: 0,
    groupUnread: 0,
    totalUnread: 0,
    hasUnread: false,
  };
}

function getLiveTabBar() {
  try {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && typeof currentPage.getTabBar === "function") {
      return currentPage.getTabBar();
    }
  } catch (error) {
    console.warn("get live tabbar failed", error);
  }
  return null;
}

function publishUnreadSummary(summary = createEmptyUnreadSummary()) {
  const appState = getAppState();
  appState.unreadSummary = {
    ...createEmptyUnreadSummary(),
    ...summary,
  };

  const tabBar = getLiveTabBar();
  if (tabBar && typeof tabBar.setData === "function") {
    tabBar.setData({
      "list[2].unreadCount": appState.unreadSummary.totalUnread || 0,
    });
  }

  return appState.unreadSummary;
}

function normalizeJob(record) {
  if (!record) {
    return null;
  }

  const salary =
    record.salary ||
    (record.salaryMin && record.salaryMax
      ? `${record.salaryMin}-${record.salaryMax}${record.salaryUnit || "K"}`
      : "");

  return {
    id: record._id || record.id,
    uid: record.uid || record.openid || record._id || record.id,
    title: record.title || "",
    company: record.company || "",
    city: record.city || "",
    experience: record.experience || "",
    education: record.education || "",
    tags: record.tags || [],
    salary,
    bonus: record.bonus || "",
    category: record.category || "all",
    description: record.description || "",
    applicationsCount: record.applicationsCount || 0,
    status: record.status || "active",
  };
}

function normalizeTalent(record) {
  if (!record) {
    return null;
  }

  const status = JOB_STATUS_LABELS[record.status] || record.status || "在看机会";

  return {
    id: record._id || record.id,
    uid: record.uid || record.openid || record._id || record.id,
    name: record.name || record.nameDesensitized || "候选人",
    education: record.education || "",
    school: record.school || "",
    years: record.years || 0,
    currentRole: record.currentRole || "",
    targetRole: record.targetRole || "",
    tags: record.tags || [],
    status,
    avatarText: record.avatarText || "人",
    avatarBg: record.avatarBg || "#DCE8FF",
    avatarColor: record.avatarColor || "#165DC6",
    briefIntro: record.briefIntro || "",
  };
}

function normalizeUserProfile(record) {
  if (!record) {
    return null;
  }

  const nickname = record.nickname || record.nickName || record.name || "用户";
  const role = record.role || record.roleLabel || record.primaryRole || "";
  const bio = record.bio || record.summary || "";
  const experience = record.experience || "";
  const stats = record.stats || {};

  return {
    ...record,
    nickname,
    nickName: record.nickName || nickname,
    role,
    bio,
    experience,
    avatarText: record.avatarText || nickname.slice(0, 1) || "U",
    title:
      record.title && experience
        ? `${record.title} · ${experience}`
        : record.title || "",
    jobStatus: JOB_STATUS_LABELS[record.jobStatus] || record.jobStatus || "在看机会",
    stats: {
      postCount: stats.postCount || record.postCount || 0,
      followerCount: stats.followerCount || record.followerCount || 0,
      followingCount: stats.followingCount || record.followingCount || 0,
      likeReceivedCount: stats.likeReceivedCount || record.likedCount || 0,
      favoriteCount: stats.favoriteCount || record.collectCount || 0,
      ...stats,
    },
    joinedZones: record.joinedZones || [],
    badges: record.badges || [],
  };
}

function normalizeChat(record, currentUid = "") {
  if (!record) {
    return null;
  }

  if (!record.participants) {
    const unreadCount = safeNumber(record.unreadCount, safeNumber(record.unread, 0));
    return {
      ...record,
      id: record.id || record._id,
      chatId: record.chatId || record.id || record._id,
      unread: unreadCount,
      unreadCount,
    };
  }

  const otherProfile =
    (record.participantProfiles || []).find((item) => item.uid !== currentUid) ||
    (record.participantProfiles || [])[0] ||
    {};

  const unreadMap = record.unreadMap || {};
  const unread = safeNumber(unreadMap[currentUid], 0);
  const avatarShape = record.type === "group" || record.type === "system" ? "rounded" : "circle";

  return {
    id: record._id || record.id,
    chatId: record._id || record.id,
    type: record.type || "private",
    name: otherProfile.name || (record.type === "system" ? "系统通知" : "新会话"),
    avatarText: otherProfile.avatarText || (record.type === "group" ? "群" : record.type === "system" ? "系" : "聊"),
    avatarBg: otherProfile.avatarBg || (record.type === "group" ? "#DBF4EE" : "#DCE8FF"),
    avatarColor: otherProfile.avatarColor || (record.type === "group" ? "#157658" : "#165DC6"),
    avatarShape,
    lastMessage: record.lastMessage || "暂无消息",
    time: formatChatTime(record.lastMessageAt || record.updatedAt || record.createdAt),
    unread,
    unreadCount: unread,
    participantProfiles: record.participantProfiles || [],
  };
}

function normalizeMessage(record) {
  return {
    id: record._id || record.id,
    chatId: record.chatId,
    senderUid: record.senderUid,
    content: record.content || "",
    type: record.type || "text",
    createdAt: record.createdAt,
  };
}

async function ensureLogin() {
  const appState = getAppState();
  if (shouldUseMock()) {
    if (!appState.openid) {
      appState.openid = "mock_openid";
      appState.userInfo = normalizeUserProfile({
        ...mockData.userProfile,
        openid: "mock_openid",
      });
    }
    return {
      openid: appState.openid,
      user: appState.userInfo,
    };
  }

  if (appState.openid) {
    return {
      openid: appState.openid,
      user: appState.userInfo,
    };
  }

  const res = await wx.cloud.callFunction({
    name: "login",
  });
  const { openid, user } = res.result || {};
  appState.openid = openid || "";
  appState.userInfo = normalizeUserProfile(user);
  if (user) {
    appState.userProfile = normalizeUserProfile(user);
  }

  return { openid, user: appState.userInfo };
}

function getMockState() {
  const appState = getAppState();
  if (!appState.mockState) {
    appState.mockState = getApp().loadMockState
      ? getApp().loadMockState()
      : {
          appliedJobs: {},
          chats: deepClone(mockData.chatList),
          chatMessages: {},
        };
  }
  return appState.mockState;
}

function persistMockState() {
  const app = getApp();
  const state = getMockState();
  if (app.saveMockState) {
    app.saveMockState(state);
  }
  return state;
}

function getMockTalentByUid(targetUid) {
  return mockData.talentList.find((item) => item.uid === targetUid) || null;
}

function createMockChatRecord(targetUid) {
  const state = getMockState();
  const existing = state.chats.find((item) => item.targetUid === targetUid);
  if (existing) {
    return { chatId: existing.id, existed: true, data: existing };
  }

  const talent = getMockTalentByUid(targetUid);
  const chatId = `mock_chat_${Date.now()}`;
  const chat = {
    id: chatId,
    type: "private",
    name: talent ? talent.name : "候选人",
    avatarText: talent ? talent.avatarText : "聊",
    avatarBg: talent ? talent.avatarBg : "#DCE8FF",
    avatarColor: talent ? talent.avatarColor : "#165DC6",
    avatarShape: "circle",
    lastMessage: "你已发起新的沟通",
    time: "刚刚",
    unread: 0,
    targetUid,
  };
  state.chats.unshift(chat);
  state.chatMessages[chatId] = [];
  persistMockState();

  return { chatId, existed: false, data: chat };
}

function markMockChatRead(chatId) {
  const state = getMockState();
  const chat = state.chats.find((item) => item.id === chatId);
  if (chat) {
    chat.unread = 0;
    persistMockState();
  }
  return chat;
}

function searchMockList(list, keyword, fields) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return list.filter((item) => {
    const source = fields
      .map((field) => {
        const value = item[field];
        if (Array.isArray(value)) {
          return value.join(" ");
        }
        if (value && typeof value === "object") {
          return JSON.stringify(value);
        }
        return value || "";
      })
      .join(" ")
      .toLowerCase();
    return source.includes(normalized);
  });
}

module.exports = {
  async login() {
    return ensureLogin();
  },

  async updateUser(field, value) {
    const isPatchObject = field && typeof field === "object" && !Array.isArray(field);
    const payload = isPatchObject ? field : { [field]: value };

    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "updateUser",
          data: isPatchObject ? { payload } : { field, value },
        });
        const data = normalizeUserProfile(res.result.data);
        getAppState().userInfo = data;
        getAppState().userProfile = data;
        return { ...res.result, data };
      },
      async () => {
        await delay();
        const current = normalizeUserProfile(getAppState().userProfile || mockData.userProfile);
        const profile = normalizeUserProfile({
          ...current,
          ...payload,
        });
        getAppState().userInfo = profile;
        getAppState().userProfile = profile;
        return { success: true, data: profile };
      },
      { fallbackOnCloudError: true }
    );
  },

  async getUserProfile() {
    return execute(
      async () => {
        const { openid } = await ensureLogin();
        const res = await getDb().collection("users").where({ openid }).limit(1).get();
        const data = normalizeUserProfile(res.data[0] || null);
        if (data) {
          getAppState().userInfo = data;
          getAppState().userProfile = data;
        }
        return data;
      },
      async () => {
        await delay(60);
        const data = normalizeUserProfile({
          ...mockData.userProfile,
          openid: "mock_openid",
        });
        getAppState().userInfo = data;
        getAppState().userProfile = data;
        return data;
      },
      { fallbackOnCloudError: true }
    );
  },

  async getMyPosts({ page = 1, pageSize = 20 } = {}) {
    return execute(
      async () => {
        const { openid } = await ensureLogin();
        const db = getDb();
        let res = await db
          .collection("posts")
          .where({ uid: openid })
          .orderBy("createdAt", "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();

        if (!res.data.length) {
          res = await db
            .collection("posts")
            .where({ userId: openid })
            .orderBy("createdAt", "desc")
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .get();
        }

        return {
          data: res.data.map(normalizePost).filter(Boolean),
          hasMore: res.data.length === pageSize,
        };
      },
      async () => {
        await delay(60);
        const { myPosts = [] } = require("../mock/profileData");
        return {
          data: myPosts
            .map((item, index) =>
              normalizePost({
                ...item,
                _id: item.postId || `mock_my_post_${index}`,
                id: item.postId || `mock_my_post_${index}`,
              })
            )
            .filter(Boolean),
          hasMore: false,
        };
      },
      { fallbackOnCloudError: true }
    );
  },


  async getNewsList(arg1 = "recommend", arg2 = 1) {
    const { category, sort, page, pageSize } = normalizeNewsArgs(arg1, arg2);
    return execute(
      async () => {
        const db = getDb();
        const _ = db.command;
        let query = db.collection("news").where({ _id: _.neq(null) });
        if (category === "hot") {
          query = query.where({ _id: _.neq(null), isHot: true });
        } else if (category !== "all" && category !== "recommend") {
          query = query.where({ _id: _.neq(null), category });
        }
        const res = await query
          .orderBy(sort, "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();
        return { data: res.data.map((item) => ({ ...item, id: item._id || item.id })), hasMore: res.data.length === pageSize };
      },
      async () => {
        await delay();
        const list =
          category === "recommend"
            ? mockData.newsList
            : mockData.newsList.filter((item) => item.category === category);
        const result = paginate(list, page);
        // === STEP 1.4 修改开始：为推荐流数据追加新字段 ===
        const zoneNames = ["中芯国际专区", "华虹半导体专区", "长鑫存储专区", "CMP技术专区", "工艺工程师专区", "校园求职专区", "晶圆茶水间", "EDA专区", "先进封装专区", "供应链专区"];
        const contentTypes = ["discuss", "news", "qa", "interview", "paper", "recruit", "demand", "chat"];
        const roles = ["工艺工程师", "设备工程师", "EDA工程师", "良率分析师", "封测工程师", "HR", "采购经理", "在校学生", "技术总监"];
        const experiences = ["应届", "1年", "3年", "5年", "8年", "10年+"];
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        result.data = result.data.map((item) => ({
          ...item,
          zoneName: pick(zoneNames),
          contentType: pick(contentTypes),
          isAnonymous: Math.random() < 0.15,
          author: {
            name: item.source || "芯社区用户",
            avatarText: (item.source || "U").charAt(0),
            avatarBg: "#dce8ff",
            avatarColor: "#165dc6",
            role: pick(roles),
            experience: pick(experiences)
          }
        }));
        // === STEP 1.4 修改结束 ===
        return result;
      },
      { fallbackOnCloudError: true }
    );
  },

  async getArticleDetail(id) {
    return execute(
      async () => {
        const res = await getDb().collection("news").doc(id).get();
        wx.cloud.callFunction({
          name: "recordView",
          data: { type: "news", targetId: id },
        });
        return { ...res.data, id: res.data._id || res.data.id };
      },
      async () => {
        await delay(80);
        return deepClone(
          mockData.newsList.find((item) => item.id === id) || mockData.newsList[0]
        );
      },
      { fallbackOnCloudError: true }
    );
  },

  async getPostList(arg1 = "hot", arg2 = 1) {
    const { category, topic, page, pageSize } = normalizePostArgs(arg1, arg2);
    return execute(
      async () => {
        const db = getDb();
        const _ = db.command;
        const filter = {};
        if (category !== "hot") {
          filter.category = category;
        }
        if (topic) {
          filter["topic.text"] = topic;
        }
        let query = db.collection("posts").where({ _id: _.neq(null) });
        if (Object.keys(filter).length) {
          query = query.where({
            _id: _.neq(null),
            ...filter,
          });
        }
        const res = await query
          .orderBy("createdAt", "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();
        return {
          data: res.data.map(normalizePost).filter(Boolean),
          hasMore: res.data.length === pageSize,
        };
      },
      async () => {
        await delay();
        const list =
          category === "hot"
            ? mockData.postList
            : mockData.postList.filter((item) => item.category === category);
        const result = paginate(list, page);
        return {
          ...result,
          data: result.data.map(normalizePost).filter(Boolean),
        };
      },
      { fallbackOnCloudError: true }
    );
  },

  async getPostDetail(id) {
    return execute(
      async () => {
        const postRes = await getDb().collection("posts").doc(id).get();
        const commentsRes = await getDb()
          .collection("comments")
          .where({ targetType: "post", targetId: id, parentId: "" })
          .orderBy("createdAt", "desc")
          .limit(20)
          .get();
        return {
          ...postRes.data,
          id: postRes.data._id || postRes.data.id,
          commentsList: commentsRes.data,
        };
      },
      async () => {
        await delay(80);
        return deepClone(
          mockData.postList.find((item) => item.id === id) || mockData.postList[0]
        );
      }
    ).then((post) => normalizePost(post));
  },

  async createPost(data) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "createPost",
          data,
        });
        return {
          ...res.result,
          data: normalizePost(res.result?.data),
        };
      },
      async () => {
        await delay(120);
        let zoneName = "";
        let category = "hot";
        if (data.zoneId) {
          try {
            const zoneData = require("./mock-zone-data");
            const allZones = Object.entries(zoneData.zonesByCategory || {}).flatMap(([zoneCategory, list]) =>
              (list || []).map((zone) => ({ ...zone, _category: zoneCategory }))
            );
            const found = allZones.find(z => z.zoneId === data.zoneId);
            if (found) {
              zoneName = found.zoneName;
              category = found._category || category;
            }
            if (data.zoneId === "tea-room") zoneName = "晶圆茶水间";
          } catch (e) {}
        }
        if (data.zoneId === "tea-room") {
          zoneName = "茶水间";
          category = "special";
        }
        const mockId = `post_${Date.now()}`;
        const createdAt = new Date().toISOString();
        return {
          success: true,
          data: normalizePost({
            _id: mockId,
            id: mockId,
            ...data,
            zoneName,
            category,
            contentType: data.contentType || "discuss",
            tags: Array.isArray(data.tags) ? data.tags : [],
            author: {
              userId: "mock_openid",
              uid: "mock_openid",
              nickname: data.isAnonymous ? "匿名用户" : "SemiParty 用户",
              name: data.isAnonymous ? "匿名用户" : "SemiParty 用户",
              avatarText: data.isAnonymous ? "匿" : "S",
              avatarBg: "#DCE8FF",
              avatarColor: "#165DC6",
              title: data.isAnonymous ? "匿名发布" : "社区成员",
            },
            isAnonymous: !!data.isAnonymous,
            likeCount: 0,
            commentCount: 0,
            viewCount: 0,
            likes: 0,
            comments: 0,
            views: 0,
            createdAt,
            updatedAt: createdAt,
          }),
        };
      }
    );
  },

  async getComments({ targetType, targetId, sort = "createdAt", page = 1, pageSize = 50 } = {}) {
    return execute(
      async () => {
        const db = getDb();
        const orderField = sort === "hot" ? "likes" : "createdAt";
        const res = await db
          .collection("comments")
          .where({ targetType, targetId, parentId: "" })
          .orderBy(orderField, "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();

        for (const comment of res.data) {
          const replies = await db
            .collection("comments")
            .where({ parentId: comment._id })
            .orderBy("createdAt", "asc")
            .limit(10)
            .get();
          comment.replies = replies.data;
        }

        return { data: res.data, hasMore: res.data.length === pageSize };
      },
      async () => ({ data: [], hasMore: false })
    );
  },

  async addComment(data) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "addComment",
          data,
        });
        return res.result;
      },
      async () => ({ success: true, data })
    );
  },

  async toggleLike(targetType, targetId) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "toggleLike",
          data: { targetType, targetId },
        });
        return res.result;
      },
      async () => ({ success: true, liked: true })
    );
  },

  async toggleFollow(targetUid) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "toggleFollow",
          data: { targetUid },
        });
        return res.result;
      },
      async () => ({ success: true, followed: true })
    );
  },

  async toggleFavorite(targetType, targetId, targetSummary = {}) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "toggleFavorite",
          data: { targetType, targetId, targetSummary },
        });
        return res.result;
      },
      async () => ({ success: true, favorited: true })
    );
  },

  async getJobList(arg = "all") {
    const options =
      typeof arg === "object"
        ? {
            category: arg.category || "all",
            keyword: arg.keyword || "",
            page: arg.page || 1,
            pageSize: arg.pageSize || PAGE_SIZE,
          }
        : {
            category: arg || "all",
            keyword: "",
            page: 1,
            pageSize: PAGE_SIZE,
          };

    return execute(
      async () => {
        const filter = { status: "active" };
        if (options.category !== "all") {
          filter.category = options.category;
        }
        const res = await getDb()
          .collection("jobs")
          .where(filter)
          .orderBy("createdAt", "desc")
          .skip((options.page - 1) * options.pageSize)
          .limit(options.pageSize)
          .get();
        const normalized = res.data.map(normalizeJob).filter(Boolean);
        const data = options.keyword
          ? normalized.filter((item) => {
              const source = `${item.title}${item.company}${item.city}${item.tags.join("")}`.toLowerCase();
              return source.includes(options.keyword.toLowerCase());
            })
          : normalized;
        return { data, hasMore: res.data.length === options.pageSize };
      },
      async () => {
        await delay(100);
        const list =
          options.category === "all"
            ? mockData.jobList
            : mockData.jobList.filter((item) => item.category === options.category);
        return { data: deepClone(list).map(normalizeJob), hasMore: false };
      }
    );
  },

  async getJobDetail(id) {
    return execute(
      async () => {
        const res = await getDb().collection("jobs").doc(id).get();
        wx.cloud.callFunction({
          name: "recordView",
          data: { type: "job", targetId: id },
        });
        return normalizeJob(res.data);
      },
      async () => normalizeJob(mockData.jobList.find((item) => item.id === id) || mockData.jobList[0])
    );
  },

  async applyJob(jobId) {
    return execute(
      async () => {
        await ensureLogin();
        const res = await wx.cloud.callFunction({
          name: "applyJob",
          data: { jobId },
        });
        return res.result;
      },
      async () => {
        await ensureLogin();
        await delay(120);
        const state = getMockState();
        if (state.appliedJobs[jobId]) {
          return { success: true, duplicated: true };
        }
        state.appliedJobs[jobId] = true;
        persistMockState();
        return { success: true, duplicated: false };
      }
    );
  },

  async getTalentList(arg = "") {
    const options =
      typeof arg === "object"
        ? {
            keyword: arg.keyword || "",
            page: arg.page || 1,
            pageSize: arg.pageSize || PAGE_SIZE,
          }
        : {
            keyword: arg || "",
            page: 1,
            pageSize: PAGE_SIZE,
          };

    return execute(
      async () => {
        const _ = getDb().command;
        const res = await getDb()
          .collection("talents")
          .where({ status: _.neq("closed") })
          .orderBy("updatedAt", "desc")
          .skip((options.page - 1) * options.pageSize)
          .limit(options.pageSize)
          .get();
        const normalized = res.data.map(normalizeTalent).filter(Boolean);
        const data = options.keyword
          ? normalized.filter((item) => {
              const source = `${item.name}${item.school}${item.currentRole}${item.targetRole}${item.tags.join("")}`.toLowerCase();
              return source.includes(options.keyword.toLowerCase());
            })
          : normalized;
        return { data, hasMore: res.data.length === options.pageSize };
      },
      async () => {
        await delay(100);
        const normalized = options.keyword.trim().toLowerCase();
        const list = normalized
          ? mockData.talentList.filter((item) => {
              const source = `${item.name}${item.school}${item.currentRole}${item.targetRole}${item.tags.join("")}`.toLowerCase();
              return source.includes(normalized);
            })
          : mockData.talentList;
        return { data: deepClone(list).map(normalizeTalent), hasMore: false };
      }
    );
  },

  async getTalentDetail(id) {
    return execute(
      async () => {
        const res = await getDb().collection("talents").doc(id).get();
        return normalizeTalent(res.data);
      },
      async () => normalizeTalent(mockData.talentList.find((item) => item.id === id) || mockData.talentList[0])
    );
  },

  async getChatList(type = "private") {
    return execute(
      async () => {
        const { openid } = await ensureLogin();
        const filter = { participants: openid };
        if (type === "private") {
          filter.type = "private";
        } else if (type === "group") {
          filter.type = "group";
        } else if (type === "system") {
          filter.type = "system";
        }

        const res = await getDb()
          .collection("chats")
          .where(filter)
          .orderBy("updatedAt", "desc")
          .limit(50)
          .get();
        return { data: res.data.map((item) => normalizeChat(item, openid)).filter(Boolean) };
      },
      async () => {
        await ensureLogin();
        await delay(100);
        const state = getMockState();
        return {
          data: state.chats
            .filter((item) => item.type === type)
            .map((item) => normalizeChat(item))
            .filter(Boolean),
        };
      }
    );
  },

  async getUnreadSummary() {
    try {
      const [privateRes, groupRes] = await Promise.all([
        module.exports.getChatList("private"),
        module.exports.getChatList("group"),
      ]);
      const privateUnread = (privateRes.data || []).reduce(
        (sum, item) => sum + safeNumber(item.unreadCount, item.unread),
        0
      );
      const groupUnread = (groupRes.data || []).reduce(
        (sum, item) => sum + safeNumber(item.unreadCount, item.unread),
        0
      );
      return publishUnreadSummary({
        privateUnread,
        groupUnread,
        totalUnread: privateUnread + groupUnread,
        hasUnread: privateUnread + groupUnread > 0,
      });
    } catch (error) {
      console.warn("getUnreadSummary failed", error);
      return publishUnreadSummary(createEmptyUnreadSummary());
    }
  },

  async getMessages(chatId, page = 1, pageSize = 50) {
    return execute(
      async () => {
        const res = await getDb()
          .collection("messages")
          .where({ chatId })
          .orderBy("createdAt", "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();
        return { data: res.data.reverse().map(normalizeMessage), hasMore: res.data.length === pageSize };
      },
      async () => {
        await delay(80);
        const state = getMockState();
        const list = state.chatMessages[chatId] || [];
        return { data: deepClone(list), hasMore: false };
      }
    );
  },

  async sendMessage(chatId, content, type = "text") {
    return execute(
      async () => {
        await ensureLogin();
        const res = await wx.cloud.callFunction({
          name: "sendMessage",
          data: { chatId, content, type },
        });
        module.exports.getUnreadSummary().catch(() => {});
        return res.result;
      },
      async () => {
        const { openid } = await ensureLogin();
        const state = getMockState();
        if (!chatId) {
          throw new Error("chatId is required");
        }
        const message = {
          id: `mock_message_${Date.now()}`,
          chatId,
          senderUid: openid,
          content,
          type,
          createdAt: new Date().toISOString(),
        };
        const currentMessages = state.chatMessages[chatId] || [];
        currentMessages.push(message);
        state.chatMessages[chatId] = currentMessages;
        const chat = state.chats.find((item) => item.id === chatId);
        if (chat) {
          chat.lastMessage = content;
          chat.time = "刚刚";
          chat.unread = 0;
          const nextChats = state.chats.filter((item) => item.id !== chatId);
          nextChats.unshift(chat);
          state.chats = nextChats;
        }
        persistMockState();
        await delay(80);
        module.exports.getUnreadSummary().catch(() => {});
        return { success: true, data: message };
      }
    );
  },

  async createChat(targetUid) {
    return execute(
      async () => {
        await ensureLogin();
        const res = await wx.cloud.callFunction({
          name: "createChat",
          data: { targetUid, type: "private" },
        });
        module.exports.getUnreadSummary().catch(() => {});
        return res.result;
      },
      async () => {
        await ensureLogin();
        await delay(100);
        if (!targetUid) {
          throw new Error("targetUid is required");
        }
        const result = {
          success: true,
          ...createMockChatRecord(targetUid),
        };
        module.exports.getUnreadSummary().catch(() => {});
        return {
          ...result,
        };
      }
    );
  },

  watchMessages(chatId, onChange) {
    if (shouldUseMock()) {
      return {
        close() {},
      };
    }

    return getDb()
      .collection("messages")
      .where({ chatId })
      .orderBy("createdAt", "asc")
      .watch({
        onChange(snapshot) {
          onChange(snapshot.docs.map(normalizeMessage));
        },
        onError(err) {
          console.error("watchMessages failed", err);
        },
      });
  },

  async markChatRead(chatId) {
    return execute(
      async () => {
        if (!chatId) {
          throw new Error("chatId is required");
        }
        await ensureLogin();
        const res = await wx.cloud.callFunction({
          name: "markChatRead",
          data: { chatId },
        });
        module.exports.getUnreadSummary().catch(() => {});
        return res.result;
      },
      async () => {
        await delay(60);
        markMockChatRead(chatId);
        module.exports.getUnreadSummary().catch(() => {});
        return { success: true };
      }
    );
  },

  resetMockState() {
    const app = getApp();
    if (app.resetMockState) {
      app.resetMockState();
      module.exports.getUnreadSummary().catch(() => {});
      return { success: true };
    }

    getAppState().mockState = {
      appliedJobs: {},
      chats: deepClone(mockData.chatList),
      chatMessages: {},
    };
    module.exports.getUnreadSummary().catch(() => {});
    return { success: true };
  },

  async getFavorites({ type = "all", page = 1, pageSize = 20 } = {}) {
    return execute(
      async () => {
        const { openid } = await ensureLogin();
        const filter = { uid: openid };
        if (type !== "all") {
          filter.targetType = type;
        }
        const res = await getDb()
          .collection("favorites")
          .where(filter)
          .orderBy("createdAt", "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();
        return { data: res.data, hasMore: res.data.length === pageSize };
      },
      async () => ({ data: [], hasMore: false })
    );
  },

  async getApplications({ status = "all", page = 1, pageSize = 20 } = {}) {
    return execute(
      async () => {
        const { openid } = await ensureLogin();
        const filter = { applicantUid: openid };
        if (status !== "all") {
          filter.status = status;
        }
        const res = await getDb()
          .collection("applications")
          .where(filter)
          .orderBy("createdAt", "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();
        return { data: res.data, hasMore: res.data.length === pageSize };
      },
      async () => ({ data: [], hasMore: false })
    );
  },

  async getProfileVisitors(page = 1, pageSize = 20) {
    return execute(
      async () => {
        const { openid } = await ensureLogin();
        const res = await getDb()
          .collection("profile_views")
          .where({ targetUid: openid })
          .orderBy("createdAt", "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();
        return { data: res.data, hasMore: res.data.length === pageSize };
      },
      async () => ({ data: [], hasMore: false })
    );
  },

  async search(keyword, type = "all", page = 1) {
    const normalizedType = SEARCH_TYPES.includes(type) ? type : "all";
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "search",
          data: { keyword, type: normalizedType, page },
        });
        const result = res.result || {};
        if (normalizedType === "all") {
          return {
            success: true,
            data: {
              news: (result.data?.news || []).map((item) => ({ ...item, id: item._id || item.id })),
              posts: (result.data?.posts || []).map(normalizePost).filter(Boolean),
              jobs: (result.data?.jobs || []).map(normalizeJob).filter(Boolean),
              talents: (result.data?.talents || []).map(normalizeTalent).filter(Boolean),
            },
            hasMore: result.hasMore || false,
          };
        }

        if (normalizedType === "news") {
          return {
            success: true,
            data: (result.data || []).map((item) => ({ ...item, id: item._id || item.id })),
            hasMore: result.hasMore || false,
          };
        }

        if (normalizedType === "post") {
          return {
            success: true,
            data: (result.data || []).map(normalizePost).filter(Boolean),
            hasMore: result.hasMore || false,
          };
        }

        if (normalizedType === "job") {
          return {
            success: true,
            data: (result.data || []).map(normalizeJob).filter(Boolean),
            hasMore: result.hasMore || false,
          };
        }

        return {
          success: true,
          data: (result.data || []).map(normalizeTalent).filter(Boolean),
          hasMore: result.hasMore || false,
        };
      },
      async () => {
        await delay(100);
        const news = searchMockList(mockData.newsList, keyword, ["title", "source", "content"]);
        const posts = searchMockList(mockData.postList, keyword, ["content", "category"]).map(normalizePost).filter(Boolean);
        const jobs = searchMockList(mockData.jobList, keyword, ["title", "company", "city", "tags"]).map(normalizeJob);
        const talents = searchMockList(mockData.talentList, keyword, ["name", "school", "currentRole", "targetRole", "tags"]).map(normalizeTalent);

        if (normalizedType === "all") {
          return {
            success: true,
            data: { news, posts, jobs, talents },
            hasMore: false,
          };
        }

        const mapping = {
          news,
          post: posts,
          job: jobs,
          talent: talents,
        };

        return {
          success: true,
          data: mapping[normalizedType] || [],
          hasMore: false,
        };
      }
    );
  },

  // ── Step 2.5：Zone API methods ──
  async getTeaRoomInfo() {
    return module.exports.getZoneDetail("tea-room");
  },

  async getUserZones() {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({ name: "zoneService", data: { action: "getUserZones" } });
        return {
          ...(res.result || {}),
          zones: (res.result?.zones || []).map(normalizeZone).filter(Boolean),
        };
      },
      async () => {
        await delay(100);
        return { zones: getMockUserZoneList() };
      },
      { fallbackOnCloudError: true }
    );
  },

  async getZoneListByCategory(category, page = 1, size = 20) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({ name: "zoneService", data: { action: "getZoneList", category, page, size } });
        return {
          ...(res.result || {}),
          zones: (res.result?.zones || []).map(normalizeZone).filter(Boolean),
        };
      },
      async () => {
        await delay(100);
        const list = resolveMockZoneByCategory(category);
        return { zones: list, total: list.length, page, size };
      },
      { fallbackOnCloudError: true }
    );
  },

  async getZoneDetail(zoneId) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "zoneService",
          data: { action: "getZoneDetail", zoneId },
        });
        return normalizeZone(res.result);
      },
      async () => {
        await delay(80);
        return normalizeZone(getMockZoneById(zoneId));
      },
      { fallbackOnCloudError: true }
    );
  },

  async getZonePosts({ zoneId, tab = "all", sort = "latest", page = 1, size = PAGE_SIZE } = {}) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "zoneService",
          data: { action: "getZonePosts", zoneId, tab, sort, page, size },
        });
        const total = safeNumber(res.result?.total);
        return {
          data: (res.result?.posts || []).map(normalizePost).filter(Boolean),
          total,
          page,
          size,
          hasMore: page * size < total,
        };
      },
      async () => {
        await delay(100);
        const result = getMockZonePostResult({ zoneId, tab, sort, page, size });
        return {
          data: result.posts,
          total: result.total,
          page,
          size,
          hasMore: page * size < result.total,
        };
      },
      { fallbackOnCloudError: true }
    );
  },

  async getZonePinned(zoneId) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "zoneService",
          data: { action: "getZonePinned", zoneId },
        });
        return {
          data: (res.result?.posts || []).map(normalizePost).filter(Boolean),
        };
      },
      async () => {
        await delay(80);
        const result = getMockZonePostResult({ zoneId, tab: "best", sort: "latest", page: 1, size: 3 });
        return {
          data: result.posts,
        };
      },
      { fallbackOnCloudError: true }
    );
  },

  async getTeaRoomTopics() {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "zoneService",
          data: { action: "getTeaRoomTopics" },
        });
        return {
          data: (res.result?.topics || []).map(normalizeTeaRoomTopic).filter((item) => item.topicId),
        };
      },
      async () => {
        await delay(80);
        return {
          data: TEA_ROOM_TOPIC_FALLBACKS.map(normalizeTeaRoomTopic),
        };
      },
      { fallbackOnCloudError: true }
    );
  },

  async joinZone(zoneId) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({ name: "zoneService", data: { action: "joinZone", zoneId } });
        return res.result;
      },
      async () => {
        await delay(120);
        return { success: true, message: "加入成功" };
      },
      { fallbackOnCloudError: true }
    );
  },

  async leaveZone(zoneId) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({ name: "zoneService", data: { action: "leaveZone", zoneId } });
        return res.result;
      },
      async () => {
        await delay(120);
        return { success: true, message: "退出成功" };
      },
      { fallbackOnCloudError: true }
    );
  },
};
