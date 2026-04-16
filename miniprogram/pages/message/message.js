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

  async loadChats() {
    const result = await api.getChatList(this.data.activeTab);
    this.setData({
      chatList: result.data
    });
  },

  async handleTabChange(event) {
    const nextTab = event.currentTarget.dataset.key;
    if (nextTab === this.data.activeTab) {
      return;
    }

    this.setData({ activeTab: nextTab });
    await this.loadChats();
  },

  openChat() {
    wx.showToast({ title: "聊天页待接入", icon: "none" });
  }
});
