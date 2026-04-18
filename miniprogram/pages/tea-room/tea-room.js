const { getNavMetrics } = require("../../utils/util");

const MOCK_TOPICS = [
  { topicId: "hot", name: "🔥热门" },
  { topicId: "night-shift", name: "🌙夜班日常" },
  { topicId: "cafeteria", name: "🍜食堂测评" },
  { topicId: "commute", name: "🚌通勤吐槽" },
  { topicId: "workplace", name: "💼厂区生活" },
  { topicId: "gossip", name: "🍵行业八卦" },
  { topicId: "salary", name: "💰薪资吐槽" },
  { topicId: "overtime", name: "⏰加班那些事" },
  { topicId: "otd", name: "🚀OTD见闻" },
  { topicId: "tooling", name: "🔧设备日常" },
  { topicId: "newbie", name: "🌱新人求助" },
  { topicId: "funny", name: "😂开心一刻" },
];

const MOCK_MEMBER_COUNT = 50000;
const MOCK_ONLINE_COUNT = 1200;

function getMockPosts(topicId, page) {
  const mockData = require("../../utils/mock-data");
  const { postList } = mockData;
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const sliced = postList.slice(start, end).map(p => {
    const randomTopic = MOCK_TOPICS[Math.floor(Math.random() * (MOCK_TOPICS.length - 1)) + 1];
    return {
      ...p,
      zoneId: "tea-room",
      zoneName: "",
      contentType: "chat",
      title: p.title || p.content.slice(0, 40),
      tags: [{ text: randomTopic.name, id: randomTopic.topicId }],
    };
  });
  return {
    data: sliced,
    hasMore: end < postList.length,
  };
}

Page({
  data: {
    statusBarHeight: 24,
    capsuleHeight: 32,
    navCapsuleInsetRight: 16,
    // Zone info
    memberCount: MOCK_MEMBER_COUNT,
    onlineCount: MOCK_ONLINE_COUNT,
    // Topics
    topics: MOCK_TOPICS,
    activeTopicId: "hot",
    // Posts
    posts: [],
    page: 1,
    hasMore: true,
    loadingMore: false,
    // Topic cache
    topicCache: {},
    // Empty
    isEmpty: false,
    // Header collapse
    headerHeight: 200,
    headerOpacity: 1,
    topicStickyTop: 0,
  },

  onLoad() {
    const metrics = getNavMetrics();
    const topicStickyTop = metrics.statusBarHeight + metrics.capsuleHeight;
    this.setData({
      statusBarHeight: metrics.statusBarHeight,
      capsuleHeight: metrics.capsuleHeight,
      navCapsuleInsetRight: metrics.navCapsuleInsetRight,
      topicStickyTop,
    });
    this.loadPosts(true);
  },

  async loadPosts(reset = false) {
    const { activeTopicId, topicCache } = this.data;
    const cacheKey = activeTopicId;

    if (reset) {
      const cached = topicCache[cacheKey];
      if (cached) {
        this.setData({
          posts: cached.data,
          page: cached.page,
          hasMore: cached.hasMore,
          isEmpty: cached.data.length === 0,
          loadingMore: false,
        });
        return;
      }
      this.setData({ posts: [], page: 1, hasMore: true, isEmpty: false, loadingMore: false });
    }

    const nextPage = this.data.page;
    try {
      const result = getMockPosts(activeTopicId, nextPage);
      const newPosts = result.data;
      const allPosts = reset ? newPosts : this.data.posts.concat(newPosts);
      this.setData({
        posts: allPosts,
        page: nextPage + 1,
        hasMore: result.hasMore,
        isEmpty: allPosts.length === 0,
        loadingMore: false,
      });

      if (reset) {
        topicCache[cacheKey] = { data: allPosts, page: nextPage + 1, hasMore: result.hasMore };
      } else if (topicCache[cacheKey]) {
        topicCache[cacheKey].data = allPosts;
        topicCache[cacheKey].page = nextPage + 1;
        topicCache[cacheKey].hasMore = result.hasMore;
      }
      this.setData({ topicCache });
    } catch (error) {
      console.error("loadPosts failed", error);
      this.setData({ loadingMore: false });
    }
  },

  onPageScroll(e) {
    const scrollTop = e.scrollTop;
    const headerFullHeight = 200;
    const progress = Math.min(scrollTop / headerFullHeight, 1);
    const headerHeight = headerFullHeight * (1 - progress);
    const headerOpacity = Math.max(0, 1 - progress * 1.5);
    this.setData({ headerHeight, headerOpacity });
  },

  onTopicTap(event) {
    const topicId = event.currentTarget.dataset.topicid;
    if (topicId === this.data.activeTopicId) return;
    this.setData({ activeTopicId: topicId });
    this.loadPosts(true);
  },

  async onPullDownRefresh() {
    await this.loadPosts(true);
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ loadingMore: true });
    await this.loadPosts();
  },

  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/community/community" }) });
  },

  onSearchTap() {
    console.log("茶水间搜索");
  },

  onMoreTap() {
    console.log("茶水间更多");
  },

  onPostTap(event) {
    const postId = event.detail.id;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${postId}` });
  },

  onFabTap() {
    wx.navigateTo({ url: "/pages/post-create/post-create?zoneId=tea-room&isAnonymous=true" });
  },

  onEmptyAction() {
    console.log("来发第一条动态吧");
  },
});
