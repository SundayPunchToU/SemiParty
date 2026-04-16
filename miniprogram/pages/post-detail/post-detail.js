const api = require("../../utils/api");
const { formatRelative, getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    post: null,
    publishTime: ""
  },

  async onLoad(options) {
    const post = await api.getPostDetail(options.id);
    this.setData({
      ...getNavMetrics(),
      post,
      publishTime: formatRelative(post.createdAt)
    });
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: "/pages/community/community" });
      }
    });
  },

  handleAction(event) {
    wx.showToast({
      title: `${event.currentTarget.dataset.name} 待接入`,
      icon: "none"
    });
  }
});
