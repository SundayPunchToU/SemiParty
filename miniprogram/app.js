const mockData = require("./utils/mock-data");
const { DEV_USE_MOCK } = require("./utils/config");
const api = require("./utils/api");

const MOCK_STATE_STORAGE_KEY = "semi_party_mock_state";

function createDefaultUnreadSummary() {
  return {
    privateUnread: 0,
    groupUnread: 0,
    totalUnread: 0,
    hasUnread: false,
  };
}

function createDefaultMockState() {
  const chats = mockData.chatList.map((item) => ({ ...item }));
  const chatMessages = {};

  chats.forEach((item) => {
    chatMessages[item.id] = [];
  });

  return {
    appliedJobs: {},
    chats,
    chatMessages,
  };
}

function normalizeMockState(rawState) {
  const defaultState = createDefaultMockState();
  if (!rawState || typeof rawState !== "object") {
    return defaultState;
  }

  const chats = Array.isArray(rawState.chats)
    ? rawState.chats.map((item) => ({ ...item }))
    : defaultState.chats;
  const chatMessages = rawState.chatMessages && typeof rawState.chatMessages === "object"
    ? { ...rawState.chatMessages }
    : {};

  chats.forEach((item) => {
    if (!Array.isArray(chatMessages[item.id])) {
      chatMessages[item.id] = [];
    }
  });

  return {
    appliedJobs:
      rawState.appliedJobs && typeof rawState.appliedJobs === "object"
        ? { ...rawState.appliedJobs }
        : {},
    chats,
    chatMessages,
  };
}

function getStatusBarHeight() {
  try {
    if (typeof wx.getWindowInfo === "function") {
      const windowInfo = wx.getWindowInfo();
      if (windowInfo && windowInfo.statusBarHeight) {
        return windowInfo.statusBarHeight;
      }
    }
  } catch (error) {
    console.warn("getWindowInfo unavailable", error);
  }

  try {
    const systemInfo = wx.getSystemInfoSync();
    return systemInfo.statusBarHeight || 24;
  } catch (error) {
    console.warn("getSystemInfoSync unavailable", error);
    return 24;
  }
}

function getWindowWidth() {
  try {
    if (typeof wx.getWindowInfo === "function") {
      const windowInfo = wx.getWindowInfo();
      if (windowInfo && windowInfo.windowWidth) {
        return windowInfo.windowWidth;
      }
    }
  } catch (error) {
    console.warn("getWindowInfo width unavailable", error);
  }

  try {
    const systemInfo = wx.getSystemInfoSync();
    return systemInfo.windowWidth || 375;
  } catch (error) {
    console.warn("getSystemInfoSync width unavailable", error);
    return 375;
  }
}

App({
  onLaunch() {
    const statusBarHeight = getStatusBarHeight();
    const windowWidth = getWindowWidth();
    let capsule = {
      top: statusBarHeight + 8,
      left: windowWidth - 96,
      width: 88,
      height: 32,
    };

    try {
      capsule = wx.getMenuButtonBoundingClientRect();
    } catch (error) {
      console.warn("capsule rect unavailable", error);
    }

    const navBarHeight =
      (capsule.top - statusBarHeight) * 2 + capsule.height;
    const navCapsuleInsetRight = Math.max(
      16,
      Math.round(windowWidth - (capsule.left || windowWidth - 96) + 8)
    );

    this.globalData = {
      brandName: "芯圈 SemiParty",
      cloudReady: false,
      cloudEnvId: "cloud1-5g7efswaf4780b4c",
      useMock: DEV_USE_MOCK,
      openid: "",
      userInfo: null,
      statusBarHeight,
      navBarHeight,
      capsuleTop: capsule.top,
      capsuleHeight: capsule.height,
      navCapsuleInsetRight,
      userProfile: mockData.userProfile,
      mockState: this.loadMockState(),
      unreadSummary: createDefaultUnreadSummary(),
    };

    this.initCloud();
    if (this.globalData.useMock) {
      this.refreshUnreadSummary();
    }
  },

  loadMockState() {
    try {
      const rawState = wx.getStorageSync(MOCK_STATE_STORAGE_KEY);
      return normalizeMockState(rawState);
    } catch (error) {
      console.warn("loadMockState failed", error);
      return createDefaultMockState();
    }
  },

  saveMockState(nextState) {
    const normalized = normalizeMockState(nextState);
    if (this.globalData) {
      this.globalData.mockState = normalized;
    }

    try {
      wx.setStorageSync(MOCK_STATE_STORAGE_KEY, normalized);
    } catch (error) {
      console.warn("saveMockState failed", error);
    }

    return normalized;
  },

  syncCurrentTabBar() {
    try {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && typeof currentPage.getTabBar === "function") {
        const tabBar = currentPage.getTabBar();
        if (tabBar && typeof tabBar.setData === "function") {
          tabBar.setData({
            "list[2].unreadCount": this.globalData.unreadSummary.totalUnread || 0,
          });
        }
      }
    } catch (error) {
      console.warn("syncCurrentTabBar failed", error);
    }
  },

  updateUnreadSummary(summary = {}) {
    this.globalData.unreadSummary = {
      ...createDefaultUnreadSummary(),
      ...summary,
    };
    this.syncCurrentTabBar();
    return this.globalData.unreadSummary;
  },

  resetMockState() {
    const nextState = createDefaultMockState();
    this.saveMockState(nextState);
    return nextState;
  },

  initCloud() {
    if (this.globalData.useMock) {
      console.info("mock mode enabled, skip cloud bootstrap");
      return;
    }

    if (!wx.cloud) {
      console.warn("wx.cloud unavailable");
      return;
    }

    const config = {
      traceUser: true,
    };

    if (this.globalData.cloudEnvId) {
      config.env = this.globalData.cloudEnvId;
    }

    wx.cloud.init(config);
    this.globalData.cloudReady = true;
    this.bootstrapSession();
  },

  async bootstrapSession() {
    if (!this.globalData.cloudReady) {
      return;
    }

    try {
      const res = await wx.cloud.callFunction({
        name: "login",
      });
      const { openid, user } = res.result || {};
      this.globalData.openid = openid || "";
      this.globalData.userInfo = user || null;
      if (user) {
        this.globalData.userProfile = user;
      }
    } catch (error) {
      console.warn("cloud login failed", error);
    } finally {
      this.refreshUnreadSummary();
    }
  },

  async refreshUnreadSummary() {
    try {
      const summary = await api.getUnreadSummary();
      this.updateUnreadSummary(summary);
      return summary;
    } catch (error) {
      console.warn("refreshUnreadSummary failed", error);
      return this.updateUnreadSummary(createDefaultUnreadSummary());
    }
  },
});
