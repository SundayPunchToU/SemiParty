const api = require("../../utils/api");
const { getNavMetrics } = require("../../utils/util");

const SORT_OPTIONS = [
  { key: "reply", label: "最新回复" },
  { key: "latest", label: "最新发布" },
  { key: "comment", label: "评论最多" },
  { key: "like", label: "点赞最多" },
];

const PINNED_TAG_MAP = {
  discuss: "讨论",
  qa: "问答",
  recruit: "招聘",
  interview: "面经",
  paper: "论文",
  demand: "供需",
  project: "项目",
  news: "资讯",
  life: "生活",
  inquiry: "询盘",
  chat: "闲聊",
};

function mapSortKey(sortKey) {
  if (sortKey === "like") {
    return "hot";
  }
  if (sortKey === "comment") {
    return "reply";
  }
  return sortKey || "latest";
}

function normalizePinnedPosts(posts = []) {
  return posts.map((item) => ({
    postId: item.id || item._id,
    title: item.title || String(item.content || "").slice(0, 40),
    tag: PINNED_TAG_MAP[item.contentType] || "置顶",
  }));
}

Page({
  data: {
    statusBarHeight: 24,
    navBarHeight: 44,
    capsuleHeight: 32,
    navCapsuleInsetRight: 16,
    navTop: 0,
    zoneId: "",
    zone: null,
    loading: true,
    loadError: false,
    headerOpacity: 1,
    headerHeight: 360,
    navBgOpacity: 0,
    showNavTitle: false,
    tabs: [],
    activeTab: "all",
    sortOptions: SORT_OPTIONS,
    sortIndex: 0,
    currentSort: "reply",
    posts: [],
    page: 1,
    hasMore: true,
    loadingMore: false,
    pinnedPosts: [],
    showPinned: false,
    tabCache: {},
    isEmpty: false,
  },

  onLoad(options = {}) {
    const zoneId = options.zoneId || options.id || "";
    if (!zoneId) {
      this.setData({ loading: false, loadError: true });
      return;
    }

    const metrics = getNavMetrics();
    this.setData({
      zoneId,
      statusBarHeight: metrics.statusBarHeight,
      navBarHeight: metrics.navBarHeight,
      capsuleHeight: metrics.capsuleHeight,
      navCapsuleInsetRight: metrics.navCapsuleInsetRight,
      navTop: metrics.statusBarHeight,
    });
    this.loadZoneData();
  },

  onShow() {
    const app = getApp();
    if (app.globalData.communityNeedsRefresh) {
      app.globalData.communityNeedsRefresh = false;
      this.setData({ tabCache: {} });
      this.loadZoneData(true);
    }
  },

  async loadZoneData(refreshOnly = false) {
    if (!refreshOnly) {
      this.setData({ loading: true, loadError: false });
    }

    try {
      const [zone, pinnedResult] = await Promise.all([
        api.getZoneDetail(this.data.zoneId),
        api.getZonePinned(this.data.zoneId),
      ]);

      if (!zone) {
        this.setData({ loading: false, loadError: true });
        wx.showToast({ title: "专区不存在", icon: "none" });
        return;
      }

      const tabs = Array.isArray(zone.tabs) && zone.tabs.length ? zone.tabs : [{ tabKey: "all", tabName: "全部" }];
      const activeTab = tabs.find((item) => item.tabKey === this.data.activeTab)
        ? this.data.activeTab
        : tabs[0].tabKey;
      const pinnedPosts = normalizePinnedPosts(pinnedResult.data || []);

      this.setData({
        zone,
        tabs,
        activeTab,
        pinnedPosts,
        showPinned: activeTab === "all" && pinnedPosts.length > 0,
        loading: false,
        loadError: false,
      });

      await this.loadPosts(true);
    } catch (error) {
      console.error("loadZoneData failed", error);
      this.setData({ loading: false, loadError: true });
    }
  },

  async loadPosts(reset = false) {
    const { zoneId, activeTab, currentSort, tabCache } = this.data;
    const cacheKey = `${activeTab}_${currentSort}`;

    if (reset && tabCache[cacheKey]) {
      this.setData({
        posts: tabCache[cacheKey].data,
        page: tabCache[cacheKey].page,
        hasMore: tabCache[cacheKey].hasMore,
        isEmpty: tabCache[cacheKey].data.length === 0,
        loadingMore: false,
      });
      return;
    }

    if (reset) {
      this.setData({ posts: [], page: 1, hasMore: true, isEmpty: false, loadingMore: false });
    }

    const nextPage = this.data.page;
    try {
      const result = await api.getZonePosts({
        zoneId,
        tab: activeTab,
        sort: mapSortKey(currentSort),
        page: nextPage,
        size: 10,
      });
      const allPosts = reset ? result.data : this.data.posts.concat(result.data);
      const nextState = {
        posts: allPosts,
        page: nextPage + 1,
        hasMore: result.hasMore,
        isEmpty: allPosts.length === 0,
        loadingMore: false,
      };

      this.setData(nextState);
      this.setData({
        tabCache: {
          ...tabCache,
          [cacheKey]: {
            data: allPosts,
            page: nextPage + 1,
            hasMore: result.hasMore,
          },
        },
      });
    } catch (error) {
      console.error("loadPosts failed", error);
      this.setData({ loadingMore: false });
      wx.showToast({ title: "帖子加载失败", icon: "none" });
    }
  },

  onPageScroll(event) {
    const scrollTop = event.scrollTop;
    const headerHeight = 360;
    const progress = Math.min(scrollTop / headerHeight, 1);

    this.setData({
      headerOpacity: Math.max(0, 1 - progress * 1.5),
      headerHeight: headerHeight * (1 - progress),
      navBgOpacity: Math.min(progress * 2, 1),
      showNavTitle: progress >= 0.85,
    });
  },

  onTabChange(event) {
    const tabKey = event.currentTarget.dataset.key;
    if (tabKey === this.data.activeTab) {
      return;
    }

    this.setData({
      activeTab: tabKey,
      showPinned: tabKey === "all" && this.data.pinnedPosts.length > 0,
    });
    this.loadPosts(true);
  },

  onSortChange(event) {
    const index = Number(event.detail.value || 0);
    const nextSort = SORT_OPTIONS[index].key;
    if (nextSort === this.data.currentSort) {
      return;
    }

    this.setData({
      sortIndex: index,
      currentSort: nextSort,
    });
    this.loadPosts(true);
  },

  async onPullDownRefresh() {
    this.setData({ tabCache: {} });
    await this.loadZoneData(true);
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) {
      return;
    }
    this.setData({ loadingMore: true });
    await this.loadPosts();
  },

  async onJoinZone() {
    if (this.data.zone?.isJoined) {
      return;
    }

    try {
      await api.joinZone(this.data.zoneId);
      this.setData({
        "zone.isJoined": true,
        "zone.memberCount": Number(this.data.zone.memberCount || 0) + 1,
      });
      getApp().globalData.communityNeedsRefresh = true;
      wx.showToast({ title: "加入成功", icon: "success" });
    } catch (error) {
      wx.showToast({ title: "加入失败，请重试", icon: "none" });
    }
  },

  onLeaveZone() {
    if (!this.data.zone?.isJoined) {
      return;
    }

    wx.showModal({
      title: "提示",
      content: "确定退出该专区吗？",
      confirmColor: "#FF4D4F",
      success: async (res) => {
        if (!res.confirm) {
          return;
        }

        try {
          await api.leaveZone(this.data.zoneId);
          this.setData({
            "zone.isJoined": false,
            "zone.memberCount": Math.max(0, Number(this.data.zone.memberCount || 0) - 1),
          });
          getApp().globalData.communityNeedsRefresh = true;
          wx.showToast({ title: "已退出", icon: "success" });
        } catch (error) {
          wx.showToast({ title: "退出失败，请重试", icon: "none" });
        }
      },
    });
  },

  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/community/community" }) });
  },

  onSearchTap() {
    wx.navigateTo({ url: `/pages/search/search?zoneId=${this.data.zoneId}` });
  },

  onMoreTap() {},

  onShareZone() {
    wx.showToast({ title: "分享能力待接入", icon: "none" });
  },

  onPostTap(event) {
    const postId = event.detail.id;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${postId}` });
  },

  onPinnedTap(event) {
    const postId = event.currentTarget.dataset.postid;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${postId}` });
  },

  onFabTap() {
    wx.navigateTo({ url: `/pages/post-create/post-create?zoneId=${this.data.zoneId}` });
  },

  onEmptyAction() {
    wx.navigateTo({ url: `/pages/post-create/post-create?zoneId=${this.data.zoneId}` });
  },
});
