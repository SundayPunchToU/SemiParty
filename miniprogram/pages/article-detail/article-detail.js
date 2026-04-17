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
    this.setData({
      ...getNavMetrics()
    });

    try {
      const article = await api.getArticleDetail(options.id);
      this.setData({
        article,
        viewCount: formatCount(article.views),
        publishTime: formatRelative(article.time)
      });
    } catch (error) {
      console.error("load article detail failed", error);
      wx.showToast({
        title: error.message || "文章加载失败",
        icon: "none"
      });
    }
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
