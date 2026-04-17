const api = require("../../utils/api");
const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    navBarHeight: 44,
    talent: null,
    introText: "",
    loading: false,
    contacting: false,
  },

  async onLoad(options) {
    this.setData({
      ...getNavMetrics(),
    });

    const id = options.id || "";
    if (!id) {
      wx.showToast({ title: "缺少人才信息", icon: "none" });
      return;
    }

    await this.loadDetail(id);
  },

  async loadDetail(id) {
    this.setData({ loading: true });
    try {
      const talent = await api.getTalentDetail(id);
      this.setData({
        talent,
        introText: talent.briefIntro
          ? `期望岗位：${talent.targetRole || "待补充"}；${talent.briefIntro}`
          : `期望岗位：${talent.targetRole || "待补充"}。当前简介尚未补充，可先发起沟通了解。`,
        loading: false,
      });
    } catch (error) {
      console.error("load talent detail failed", error);
      this.setData({ loading: false });
      wx.showToast({
        title: error.message || "人才加载失败",
        icon: "none",
      });
    }
  },

  async handleContact() {
    const talent = this.data.talent;
    if (!talent || this.data.contacting) {
      return;
    }

    this.setData({ contacting: true });
    try {
      await api.login();
      const result = await api.createChat(
        talent.uid || talent.openid || talent.id
      );
      wx.navigateTo({
        url: `/pages/chat-detail/chat-detail?chatId=${result.chatId}&title=${encodeURIComponent(talent.name || "聊天")}`,
      });
    } catch (error) {
      console.error("create chat from talent detail failed", error);
      wx.showToast({
        title: error.message || "发起聊天失败",
        icon: "none",
      });
    } finally {
      this.setData({ contacting: false });
    }
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.navigateTo({ url: "/pages/job-market/job-market" });
      },
    });
  },
});
