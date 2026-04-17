const api = require("../../utils/api");
const { formatRelative, getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    post: null,
    publishTime: "",
    focusComment: false,
    comments: []
  },

  async onLoad(options) {
    this.setData({
      ...getNavMetrics(),
      focusComment: options.focus === "comment"
    });

    try {
      const post = await api.getPostDetail(options.id);
      this.setData({
        post,
        publishTime: formatRelative(post.createdAt)
      });
      this.loadComments(options.id);
    } catch (error) {
      console.error("load post detail failed", error);
      wx.showToast({
        title: error.message || "帖子加载失败",
        icon: "none"
      });
    }
  },

  async loadComments(postId) {
    try {
      const result = await api.getComments("post", postId, 1);
      this.setData({ comments: result.data || [] });
    } catch (e) {
      // 评论加载失败静默处理，不影响帖子主体展示
    }
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
