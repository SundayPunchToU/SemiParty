const mockData = require("./utils/mock-data");

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
      openid: "",
      userInfo: null,
      statusBarHeight,
      navBarHeight,
      capsuleTop: capsule.top,
      capsuleHeight: capsule.height,
      userProfile: mockData.userProfile,
    };

    this.initCloud();
  },

  initCloud() {
    if (!wx.cloud) {
      console.warn("wx.cloud unavailable, mock mode enabled");
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
      console.warn("cloud login failed, mock mode fallback", error);
    }
  },
});
