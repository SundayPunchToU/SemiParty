const api = require("../../utils/api");
const { formatCount, formatRelative, getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    article: null,
    viewCount: "",
    publishTime: ""
  },

  async onLoad(options) {
    const article = await api.getArticleDetail(options.id);
    this.setData({
      ...getNavMetrics(),
      article,
      viewCount: formatCount(article.views),
      publishTime: formatRelative(article.time)
    });
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: "/pages/home/home" });
      }
    });
  },

  handleAction(event) {
    wx.showToast({
      title: `${event.currentTarget.dataset.name} 功能待接入`,
      icon: "none"
    });
  }
});
