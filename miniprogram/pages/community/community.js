const api = require("../../utils/api");
const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    activeTopicId: "hot",
    topics: [],
    posts: [],
    page: 1,
    hasMore: true,
    loading: false,
    loadingMore: false,
    todayPostCount: 0,
    onlineCount: 0,
  },

  onLoad() {
    this.setData(getNavMetrics());
    this.bootstrap();
  },

  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    const app = getApp();
    if (app.globalData.communityNeedsRefresh) {
      app.globalData.communityNeedsRefresh = false;
      this.bootstrap();
    }
  },

  async bootstrap() {
    await Promise.all([this.loadTeaRoomMeta(), this.loadTopics()]);
    await this.loadPosts(true);
  },

  async onPullDownRefresh() {
    await this.bootstrap();
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    if (!this.data.hasMore || this.data.loading || this.data.loadingMore) {
      return;
    }
    this.setData({ loadingMore: true });
    await this.loadPosts(false);
  },

  async loadTeaRoomMeta() {
    try {
      const result = await api.getTeaRoomInfo();
      this.setData({
        todayPostCount: result.todayPostCount || 0,
        onlineCount: result.onlineCount || 0,
      });
    } catch (error) {
      console.error("loadTeaRoomMeta failed", error);
    }
  },

  async loadTopics() {
    try {
      const result = await api.getTeaRoomTopics();
      const topics = [{ topicId: "hot", topicName: "全部" }].concat(result.data || []);
      const activeExists = topics.some((item) => item.topicId === this.data.activeTopicId);
      this.setData({
        topics,
        activeTopicId: activeExists ? this.data.activeTopicId : "hot",
      });
    } catch (error) {
      console.error("loadTopics failed", error);
      this.setData({
        topics: [{ topicId: "hot", topicName: "全部" }],
        activeTopicId: "hot",
      });
    }
  },

  async loadPosts(reset = false) {
    const page = reset ? 1 : this.data.page;
    this.setData({ loading: reset });
    try {
      const result = await api.getPostsByTopic({
        topicId: this.data.activeTopicId,
        page,
        size: 10,
      });
      const posts = reset ? (result.data || []) : this.data.posts.concat(result.data || []);
      this.setData({
        posts,
        page: page + 1,
        hasMore: !!result.hasMore,
        loading: false,
        loadingMore: false,
      });
    } catch (error) {
      console.error("loadPosts failed", error);
      this.setData({ loading: false, loadingMore: false });
      wx.showToast({ title: "帖子加载失败", icon: "none" });
    }
  },

  onSearchTap() {
    wx.navigateTo({ url: "/pages/search/search" });
  },

  async onTopicTap(event) {
    const topicId = event.currentTarget.dataset.topicid;
    if (!topicId || topicId === this.data.activeTopicId) {
      return;
    }
    this.setData({
      activeTopicId: topicId,
      posts: [],
      page: 1,
      hasMore: true,
    });
    await this.loadPosts(true);
  },

  openPostDetail(event) {
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${event.detail.id}` });
  },

  openComment(event) {
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${event.detail.id}&focus=comment` });
  },

  handleCreatePost() {
    wx.navigateTo({ url: "/pages/post-create/post-create" });
  },

  handleShare() {
    wx.showToast({ title: "请使用右上角转发", icon: "none" });
  },

  async handleLike(event) {
    const { id, liked } = event.detail;
    try {
      await api.toggleLike("post", id);
    } catch (error) {
      console.error("toggleLike failed", error);
      wx.showToast({ title: liked ? "点赞失败" : "取消失败", icon: "none" });
    }
  },
});
