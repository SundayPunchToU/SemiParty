const api = require("../../utils/api");
const { messageTabs } = require("../../utils/constants");
const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    brandName: "芯圈 SemiParty",
    tabs: messageTabs,
    activeTab: "private",
    chatList: []
  },

  onLoad() {
    this.setData({
      ...getNavMetrics()
    });
    this.loadChats();
  },

  onShow() {
    this.loadChats();
  },

  async loadChats() {
    try {
      const result = await api.getChatList(this.data.activeTab);
      this.setData({
        chatList: result.data
      });
    } catch (error) {
      console.error("loadChats failed", error);
      wx.showToast({ title: "会话加载失败", icon: "none" });
    }
  },

  async handleTabChange(event) {
    const nextTab = event.currentTarget.dataset.key;
    if (nextTab === this.data.activeTab) {
      return;
    }

    this.setData({ activeTab: nextTab });
    await this.loadChats();
  },

  openChat(event) {
    const item = event.detail.item;
    if (!item || !item.id) {
      wx.showToast({ title: "会话信息异常", icon: "none" });
      return;
    }

    wx.navigateTo({
      url: `/pages/chat-detail/chat-detail?chatId=${item.id}&title=${encodeURIComponent(item.name || "会话")}`
    });
  }
});
