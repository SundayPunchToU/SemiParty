const api = require("../../utils/api");
const mockData = require("../../utils/mock-data");
const { communityTabs } = require("../../utils/constants");
const { deepClone, getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    brandName: "芯圈 SemiParty",
    tabs: communityTabs,
    activeTab: "hot",
    topics: [],
    activeTopic: "",
    posts: [],
    sourcePosts: [],
    page: 1,
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    const metrics = getNavMetrics();
    this.setData({
      ...metrics,
      topics: deepClone(mockData.topicList)
    });
    this.loadPosts(true);
  },

  onShow() {
    // 发帖成功返回后刷新列表
    const app = getApp();
    if (app.globalData.communityNeedsRefresh) {
      app.globalData.communityNeedsRefresh = false;
      this.loadPosts(true);
    }
  },

  applyTopicFilter(list) {
    if (!this.data.activeTopic) {
      return list;
    }

    return list.filter((item) => item.topic.text === this.data.activeTopic);
  },

  async loadPosts(reset = false) {
    const nextPage = reset ? 1 : this.data.page;
    const result = await api.getPostList(this.data.activeTab, nextPage);
    const sourcePosts = reset
      ? result.data
      : this.data.sourcePosts.concat(result.data);

    this.setData({
      sourcePosts,
      posts: this.applyTopicFilter(sourcePosts),
      page: nextPage + 1,
      hasMore: result.hasMore,
      loadingMore: false
    });
  },

  async onPullDownRefresh() {
    await this.loadPosts(true);
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) {
      return;
    }

    this.setData({ loadingMore: true });
    await this.loadPosts();
  },

  async handleTabChange(event) {
    const nextTab = event.currentTarget.dataset.key;
    if (nextTab === this.data.activeTab) {
      return;
    }

    this.setData({
      activeTab: nextTab,
      activeTopic: "",
      posts: [],
      sourcePosts: [],
      page: 1,
      hasMore: true
    });
    await this.loadPosts(true);
  },

  handleTopicTap(event) {
    const nextTopic = event.currentTarget.dataset.text;
    const activeTopic = this.data.activeTopic === nextTopic ? "" : nextTopic;
    this.setData({
      activeTopic,
      posts: this.applyTopicFilter(this.data.sourcePosts)
    });
  },

  openPostDetail(event) {
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?id=${event.detail.id}`
    });
  },

  openComment(event) {
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?id=${event.detail.id}&focus=comment`
    });
  },

  handleShare() {
    wx.showToast({ title: "分享能力待接入", icon: "none" });
  },

  async handleLike(event) {
    const { id, liked } = event.detail;
    try {
      await api.toggleLike("post", id);
    } catch (e) {
      wx.showToast({ title: liked ? "点赞失败" : "取消失败", icon: "none" });
    }
  },

  handleCreatePost() {
    wx.navigateTo({ url: "/pages/post-create/post-create" });
  }
});
