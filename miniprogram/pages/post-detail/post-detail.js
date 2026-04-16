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
    const post = await api.getPostDetail(options.id);
    this.setData({
      ...getNavMetrics(),
      post,
      publishTime: formatRelative(post.createdAt),
      focusComment: options.focus === "comment"
    });
    this.loadComments(options.id);
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
