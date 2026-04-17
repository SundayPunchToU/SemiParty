const mockData = require("./utils/mock-data");
const { DEV_USE_MOCK } = require("./utils/config");

const MOCK_STATE_STORAGE_KEY = "semi_party_mock_state";

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

App({
  onLaunch() {
    const systemInfo = wx.getSystemInfoSync();
    let capsule = {
      top: (systemInfo.statusBarHeight || 24) + 8,
      height: 32,
    };

    try {
      capsule = wx.getMenuButtonBoundingClientRect();
    } catch (error) {
      console.warn("capsule rect unavailable", error);
    }

    const statusBarHeight = systemInfo.statusBarHeight || 24;
    const navBarHeight =
      (capsule.top - statusBarHeight) * 2 + capsule.height;

    this.globalData = {
      brandName: "芯圈 SemiParty",
      cloudReady: false,
      cloudEnvId: "",
      useMock: DEV_USE_MOCK,
      openid: "",
      userInfo: null,
      statusBarHeight,
      navBarHeight,
      capsuleTop: capsule.top,
      capsuleHeight: capsule.height,
      userProfile: mockData.userProfile,
      mockState: this.loadMockState(),
    };

    this.initCloud();
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

  resetMockState() {
    const nextState = createDefaultMockState();
    this.saveMockState(nextState);
    return nextState;
  },

  initCloud() {
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
    }
  },
});
