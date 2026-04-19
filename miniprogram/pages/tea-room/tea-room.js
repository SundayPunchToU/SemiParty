const api = require("../../utils/api");
const { getNavMetrics } = require("../../utils/util");

function normalizeTopicText(value = "") {
  return String(value).replace(/^#/, "").trim().toLowerCase();
}

function matchesTopic(post, topic) {
  if (!post || !topic || topic.topicId === "hot") {
    return true;
  }

  const topicText = normalizeTopicText(topic.topicName || topic.name || "");
  if (!topicText) {
    return true;
  }

  const tags = Array.isArray(post.tags) ? post.tags : [];
  const matchedTag = tags.find((item) => {
    const text =
      typeof item === "string"
        ? item
        : item && typeof item === "object"
        ? item.text || item.label || item.name || ""
        : "";
    return normalizeTopicText(text) === topicText;
  });

  if (matchedTag) {
    return true;
  }

  if (post.topic?.text && normalizeTopicText(post.topic.text) === topicText) {
    return true;
  }

  return false;
}

Page({
  data: {
    statusBarHeight: 24,
    capsuleHeight: 32,
    navCapsuleInsetRight: 16,
    memberCount: 0,
    onlineCount: 0,
    topics: [],
    activeTopicId: "hot",
    posts: [],
    sourcePosts: [],
    page: 1,
    hasMore: true,
    loadingMore: false,
    isEmpty: false,
    headerHeight: 200,
    headerOpacity: 1,
    topicStickyTop: 0,
  },

  onLoad() {
    const metrics = getNavMetrics();
    this.setData({
      statusBarHeight: metrics.statusBarHeight,
      capsuleHeight: metrics.capsuleHeight,
      navCapsuleInsetRight: metrics.navCapsuleInsetRight,
      topicStickyTop: metrics.statusBarHeight + metrics.capsuleHeight,
    });
    this.bootstrapTeaRoom();
  },

  onShow() {
    const app = getApp();
    if (app.globalData.communityNeedsRefresh) {
      app.globalData.communityNeedsRefresh = false;
      this.loadTeaRoomInfo();
      this.loadPosts(true);
    }
  },

  async bootstrapTeaRoom() {
    await Promise.all([
      this.loadTeaRoomInfo(),
      this.loadTopics(),
      this.loadPosts(true),
    ]);
  },

  async loadTeaRoomInfo() {
    try {
      const result = await api.getTeaRoomInfo();
      const memberCount = Number(result?.memberCount || 0);
      this.setData({
        memberCount,
        onlineCount: Math.max(0, Math.floor(memberCount * 0.03)),
      });
    } catch (error) {
      console.error("loadTeaRoomInfo failed", error);
    }
  },

  async loadTopics() {
    try {
      const result = await api.getTeaRoomTopics();
      const topics = (result.data || []).map((item) => ({
        topicId: item.topicId,
        name: item.topicName || item.name,
        topicName: item.topicName || item.name,
      }));

      this.setData({
        topics: topics.length ? topics : [{ topicId: "hot", name: "热门", topicName: "热门" }],
        activeTopicId: topics.find((item) => item.topicId === this.data.activeTopicId)
          ? this.data.activeTopicId
          : (topics[0]?.topicId || "hot"),
      });
    } catch (error) {
      console.error("loadTopics failed", error);
    }
  },

  getActiveTopic() {
    return this.data.topics.find((item) => item.topicId === this.data.activeTopicId) || null;
  },

  applyTopicFilter(list) {
    const activeTopic = this.getActiveTopic();
    const filtered = (list || []).filter((item) => matchesTopic(item, activeTopic));
    this.setData({
      posts: filtered,
      isEmpty: filtered.length === 0,
    });
  },

  async loadPosts(reset = false) {
    if (reset) {
      this.setData({
        sourcePosts: [],
        posts: [],
        page: 1,
        hasMore: true,
        isEmpty: false,
        loadingMore: false,
      });
    }

    const nextPage = this.data.page;
    try {
      const result = await api.getZonePosts({
        zoneId: "tea-room",
        tab: "all",
        sort: "latest",
        page: nextPage,
        size: 10,
      });
      const sourcePosts = reset ? result.data : this.data.sourcePosts.concat(result.data);
      this.setData({
        sourcePosts,
        page: nextPage + 1,
        hasMore: result.hasMore,
        loadingMore: false,
      });
      this.applyTopicFilter(sourcePosts);
    } catch (error) {
      console.error("loadPosts failed", error);
      this.setData({ loadingMore: false });
      wx.showToast({ title: "茶水间加载失败", icon: "none" });
    }
  },

  onPageScroll(event) {
    const scrollTop = event.scrollTop;
    const progress = Math.min(scrollTop / 200, 1);
    this.setData({
      headerHeight: 200 * (1 - progress),
      headerOpacity: Math.max(0, 1 - progress * 1.5),
    });
  },

  onTopicTap(event) {
    const topicId = event.currentTarget.dataset.topicid;
    if (topicId === this.data.activeTopicId) {
      return;
    }
    this.setData({ activeTopicId: topicId });
    this.applyTopicFilter(this.data.sourcePosts);
  },

  async onPullDownRefresh() {
    await Promise.all([
      this.loadTeaRoomInfo(),
      this.loadTopics(),
      this.loadPosts(true),
    ]);
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) {
      return;
    }
    this.setData({ loadingMore: true });
    await this.loadPosts();
  },

  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/community/community" }) });
  },

  onSearchTap() {
    wx.navigateTo({ url: "/pages/search/search?zoneId=tea-room" });
  },

  onMoreTap() {},

  onPostTap(event) {
    const postId = event.detail.id;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${postId}` });
  },

  onFabTap() {
    wx.navigateTo({ url: "/pages/post-create/post-create?zoneId=tea-room&isAnonymous=true" });
  },

  onEmptyAction() {
    this.onFabTap();
  },
});
