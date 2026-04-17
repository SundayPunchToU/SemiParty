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

async function execute(cloudTask, mockTask) {
  if (shouldUseMock()) {
    return mockTask();
  }

  return cloudTask();
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

  return {
    ...record,
    avatarText: record.avatarText || record.nickName?.slice(0, 1) || "U",
    title:
      record.title && record.experience
        ? `${record.title} · ${record.experience}`
        : record.title || "",
    jobStatus: JOB_STATUS_LABELS[record.jobStatus] || record.jobStatus || "在看机会",
  };
}

function normalizeChat(record, currentUid = "") {
  if (!record) {
    return null;
  }

  if (!record.participants) {
    return {
      ...record,
      id: record.id || record._id,
    };
  }

  const otherProfile =
    (record.participantProfiles || []).find((item) => item.uid !== currentUid) ||
    (record.participantProfiles || [])[0] ||
    {};

  const unreadMap = record.unreadMap || {};
  const unread = unreadMap[currentUid] || 0;
  const avatarShape = record.type === "group" || record.type === "system" ? "rounded" : "circle";

  return {
    id: record._id || record.id,
    type: record.type || "private",
    name: otherProfile.name || (record.type === "system" ? "系统通知" : "新会话"),
    avatarText: otherProfile.avatarText || (record.type === "group" ? "群" : record.type === "system" ? "系" : "聊"),
    avatarBg: otherProfile.avatarBg || (record.type === "group" ? "#DBF4EE" : "#DCE8FF"),
    avatarColor: otherProfile.avatarColor || (record.type === "group" ? "#157658" : "#165DC6"),
    avatarShape,
    lastMessage: record.lastMessage || "暂无消息",
    time: formatChatTime(record.lastMessageAt || record.updatedAt || record.createdAt),
    unread,
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
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "updateUser",
          data: { field, value },
        });
        const data = normalizeUserProfile(res.result.data);
        getAppState().userInfo = data;
        getAppState().userProfile = data;
        return { ...res.result, data };
      },
      async () => {
        await delay();
        const profile = normalizeUserProfile(mockData.userProfile);
        getAppState().userInfo = profile;
        getAppState().userProfile = profile;
        return { success: true, data: profile };
      }
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
      }
    );
  },

  async getNewsList(arg1 = "recommend", arg2 = 1) {
    const { category, sort, page, pageSize } = normalizeNewsArgs(arg1, arg2);
    return execute(
      async () => {
        let query = getDb().collection("news");
        if (category === "hot") {
          query = query.where({ isHot: true });
        } else if (category !== "all" && category !== "recommend") {
          query = query.where({ category });
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
        return paginate(list, page);
      }
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
      }
    );
  },

  async getPostList(arg1 = "hot", arg2 = 1) {
    const { category, topic, page, pageSize } = normalizePostArgs(arg1, arg2);
    return execute(
      async () => {
        const filter = {};
        if (category !== "hot") {
          filter.category = category;
        }
        if (topic) {
          filter["topic.text"] = topic;
        }
        const res = await getDb()
          .collection("posts")
          .where(filter)
          .orderBy("createdAt", "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();
        return {
          data: res.data.map((item) => ({ ...item, id: item._id || item.id })),
          hasMore: res.data.length === pageSize,
        };
      },
      async () => {
        await delay();
        const list =
          category === "hot"
            ? mockData.postList
            : mockData.postList.filter((item) => item.category === category);
        return paginate(list, page);
      }
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
    );
  },

  async createPost(data) {
    return execute(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "createPost",
          data,
        });
        return res.result;
      },
      async () => {
        await delay(120);
        return {
          success: true,
          data: {
            id: `post_${Date.now()}`,
            ...data,
          },
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
          data: state.chats.filter((item) => item.type === type).map((item) => ({ ...item })),
        };
      }
    );
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
        return res.result;
      },
      async () => {
        await ensureLogin();
        await delay(100);
        if (!targetUid) {
          throw new Error("targetUid is required");
        }
        return {
          success: true,
          ...createMockChatRecord(targetUid),
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
        return res.result;
      },
      async () => {
        await delay(60);
        markMockChatRead(chatId);
        return { success: true };
      }
    );
  },

  resetMockState() {
    const app = getApp();
    if (app.resetMockState) {
      app.resetMockState();
      return { success: true };
    }

    getAppState().mockState = {
      appliedJobs: {},
      chats: deepClone(mockData.chatList),
      chatMessages: {},
    };
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
              posts: (result.data?.posts || []).map((item) => ({ ...item, id: item._id || item.id })),
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
            data: (result.data || []).map((item) => ({ ...item, id: item._id || item.id })),
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
        const posts = searchMockList(mockData.postList, keyword, ["content", "category"]);
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
};
