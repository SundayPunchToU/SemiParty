const mockData = require("./mock-data");
const { deepClone } = require("./util");

const PAGE_SIZE = 20;

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function canUseCloud() {
  return typeof wx !== "undefined" && !!wx.cloud;
}

function getDb() {
  return wx.cloud.database();
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

async function ensureLogin() {
  const app = getApp();
  if (!canUseCloud()) {
    return {
      openid: "",
      user: null,
    };
  }

  if (app.globalData.openid) {
    return {
      openid: app.globalData.openid,
      user: app.globalData.userInfo,
    };
  }

  const res = await wx.cloud.callFunction({
    name: "login",
  });
  const { openid, user } = res.result || {};
  app.globalData.openid = openid || "";
  app.globalData.userInfo = user || null;
  if (user) {
    app.globalData.userProfile = user;
  }

  return { openid, user };
}

async function withMockFallback(cloudTask, mockTask) {
  if (!canUseCloud()) {
    return mockTask();
  }

  try {
    return await cloudTask();
  } catch (error) {
    console.warn("cloud api failed, fallback to mock", error);
    return mockTask();
  }
}

module.exports = {
  async login() {
    return withMockFallback(
      async () => ensureLogin(),
      async () => {
        await delay(50);
        return {
          openid: "mock_openid",
          user: deepClone(mockData.userProfile),
        };
      }
    );
  },

  async updateUser(field, value) {
    return withMockFallback(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "updateUser",
          data: { field, value },
        });
        getApp().globalData.userInfo = res.result.data;
        getApp().globalData.userProfile = res.result.data;
        return res.result;
      },
      async () => {
        await delay();
        return { success: true, data: deepClone(mockData.userProfile) };
      }
    );
  },

  async getUserProfile() {
    return withMockFallback(
      async () => {
        const { openid } = await ensureLogin();
        const res = await getDb().collection("users").where({ openid }).limit(1).get();
        const data = res.data[0] || null;
        if (data) {
          getApp().globalData.userInfo = data;
          getApp().globalData.userProfile = data;
        }
        return data;
      },
      async () => {
        await delay(60);
        return deepClone(mockData.userProfile);
      }
    );
  },

  async getNewsList(arg1 = "recommend", arg2 = 1) {
    const { category, sort, page, pageSize } = normalizeNewsArgs(arg1, arg2);
    return withMockFallback(
      async () => {
        let query = getDb().collection("news");
        if (category !== "all" && category !== "recommend") {
          query = query.where({ category });
        }
        if (category === "hot") {
          query = query.where({ isHot: true });
        }
        const res = await query
          .orderBy(sort, "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();
        return { data: res.data, hasMore: res.data.length === pageSize };
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
    return withMockFallback(
      async () => {
        const res = await getDb().collection("news").doc(id).get();
        wx.cloud.callFunction({
          name: "recordView",
          data: { type: "news", targetId: id },
        });
        return res.data;
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
    return withMockFallback(
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
        return { data: res.data, hasMore: res.data.length === pageSize };
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
    return withMockFallback(
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
    return withMockFallback(
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
    return withMockFallback(
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
    return withMockFallback(
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
    return withMockFallback(
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
    return withMockFallback(
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
    return withMockFallback(
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

    return withMockFallback(
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
        const data = options.keyword
          ? res.data.filter((item) => {
              const source = `${item.title}${item.company}${item.city}${(item.tags || []).join("")}`.toLowerCase();
              return source.includes(options.keyword.toLowerCase());
            })
          : res.data;
        return { data, hasMore: res.data.length === options.pageSize };
      },
      async () => {
        await delay(100);
        const list =
          options.category === "all"
            ? mockData.jobList
            : mockData.jobList.filter((item) => item.category === options.category);
        return { data: deepClone(list), hasMore: false };
      }
    );
  },

  async getJobDetail(id) {
    return withMockFallback(
      async () => {
        const res = await getDb().collection("jobs").doc(id).get();
        wx.cloud.callFunction({
          name: "recordView",
          data: { type: "job", targetId: id },
        });
        return res.data;
      },
      async () => deepClone(mockData.jobList.find((item) => item.id === id) || mockData.jobList[0])
    );
  },

  async applyJob(jobId) {
    return withMockFallback(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "applyJob",
          data: { jobId },
        });
        return res.result;
      },
      async () => ({ success: true, duplicated: false })
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

    return withMockFallback(
      async () => {
        const _ = getDb().command;
        const res = await getDb()
          .collection("talents")
          .where({ status: _.neq("closed") })
          .orderBy("updatedAt", "desc")
          .skip((options.page - 1) * options.pageSize)
          .limit(options.pageSize)
          .get();
        const data = options.keyword
          ? res.data.filter((item) => {
              const source = `${item.nameDesensitized || ""}${item.school || ""}${item.currentRole || ""}${item.targetRole || ""}${(item.tags || []).join("")}`.toLowerCase();
              return source.includes(options.keyword.toLowerCase());
            })
          : res.data;
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
        return { data: deepClone(list), hasMore: false };
      }
    );
  },

  async getTalentDetail(id) {
    return withMockFallback(
      async () => {
        const res = await getDb().collection("talents").doc(id).get();
        return res.data;
      },
      async () => deepClone(mockData.talentList.find((item) => item.id === id) || mockData.talentList[0])
    );
  },

  async getChatList(type = "private") {
    return withMockFallback(
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
        return { data: res.data };
      },
      async () => {
        await delay(100);
        return {
          data: deepClone(mockData.chatList.filter((item) => item.type === type)),
        };
      }
    );
  },

  async getMessages(chatId, page = 1, pageSize = 50) {
    return withMockFallback(
      async () => {
        const res = await getDb()
          .collection("messages")
          .where({ chatId })
          .orderBy("createdAt", "desc")
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();
        return { data: res.data.reverse(), hasMore: res.data.length === pageSize };
      },
      async () => ({ data: [], hasMore: false })
    );
  },

  async sendMessage(chatId, content, type = "text") {
    return withMockFallback(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "sendMessage",
          data: { chatId, content, type },
        });
        return res.result;
      },
      async () => ({ success: true })
    );
  },

  async createChat(targetUid) {
    return withMockFallback(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "createChat",
          data: { targetUid, type: "private" },
        });
        return res.result;
      },
      async () => ({ success: true, chatId: `mock_chat_${Date.now()}` })
    );
  },

  watchMessages(chatId, onChange) {
    if (!canUseCloud()) {
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
          onChange(snapshot.docs);
        },
        onError(err) {
          console.error("watchMessages failed", err);
        },
      });
  },

  async getFavorites({ type = "all", page = 1, pageSize = 20 } = {}) {
    return withMockFallback(
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
    return withMockFallback(
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
    return withMockFallback(
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
    return withMockFallback(
      async () => {
        const res = await wx.cloud.callFunction({
          name: "search",
          data: { keyword, type, page },
        });
        return res.result;
      },
      async () => ({ success: true, data: [], hasMore: false })
    );
  },
};
