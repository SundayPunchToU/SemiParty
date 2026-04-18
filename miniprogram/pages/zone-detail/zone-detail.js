const api = require("../../utils/api");
const { deepClone, getNavMetrics, formatCount } = require("../../utils/util");

const SORT_OPTIONS = [
  { key: "reply", label: "最新回复" },
  { key: "latest", label: "最新发布" },
  { key: "comment", label: "最多评论" },
  { key: "like", label: "最多点赞" },
];

const ZONE_TABS_MAP = {
  company: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "qa", tabName: "问答" },
    { tabKey: "recruit", tabName: "招聘" },
    { tabKey: "news", tabName: "资讯" },
    { tabKey: "best", tabName: "精华" },
  ],
  role: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "qa", tabName: "问答" },
    { tabKey: "recruit", tabName: "招聘" },
    { tabKey: "news", tabName: "资讯" },
    { tabKey: "best", tabName: "精华" },
  ],
  tech: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "qa", tabName: "问答" },
    { tabKey: "paper", tabName: "论文" },
    { tabKey: "project", tabName: "项目" },
    { tabKey: "best", tabName: "精华" },
  ],
  campus: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "qa", tabName: "问答" },
    { tabKey: "recruit", tabName: "校招" },
    { tabKey: "interview", tabName: "面经" },
    { tabKey: "best", tabName: "精华" },
  ],
  supply: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "demand", tabName: "供需" },
    { tabKey: "recruit", tabName: "招聘" },
    { tabKey: "news", tabName: "资讯" },
    { tabKey: "best", tabName: "精华" },
  ],
  region: [
    { tabKey: "all", tabName: "全部" },
    { tabKey: "discuss", tabName: "讨论" },
    { tabKey: "qa", tabName: "问答" },
    { tabKey: "recruit", tabName: "招聘" },
    { tabKey: "news", tabName: "资讯" },
    { tabKey: "best", tabName: "精华" },
  ],
  special: [
    { tabKey: "hot", tabName: "热门" },
    { tabKey: "all", tabName: "全部" },
  ],
};

// Mock zone detail for local development
function getMockZoneDetail(zoneId) {
  const zones = require("../../utils/mock-zone-data");
  const { zonesByCategory, myZones } = zones;
  const allZones = Object.values(zonesByCategory).flat();
  const zone = allZones.find(z => z.zoneId === zoneId);
  if (!zone) return null;

  // Derive category from zoneId matching zonesByCategory
  let category = "company";
  for (const [cat, list] of Object.entries(zonesByCategory)) {
    if (list.find(z => z.zoneId === zoneId)) {
      category = cat;
      break;
    }
  }
  // Special case
  if (zoneId === "tea-room") category = "special";

  const joinedZone = myZones.find(z => z.zoneId === zoneId);
  return {
    zoneId: zone.zoneId,
    zoneName: zone.zoneName,
    zoneDesc: `${zone.zoneName}相关讨论与交流社区`,
    zoneIcon: null,
    zoneBanner: null,
    category: category,
    memberCount: parseInt(zone.memberCount) || 0,
    todayPostCount: zone.todayPosts || 0,
    totalPostCount: (parseInt(zone.memberCount) || 0) * 3,
    isJoined: !!zone.isJoined,
    tabs: ZONE_TABS_MAP[category] || ZONE_TABS_MAP.company,
    pinnedPosts: [
      { postId: "pin_001", title: `${zone.zoneName}社区公约与发帖规范`, tag: "公告" },
      { postId: "pin_002", title: `${zone.zoneName}常见问题汇总（新人必读）`, tag: "公告" },
      { postId: "pin_003", title: "关于近期社区秩序整治的说明", tag: "精华" },
    ],
    status: "active",
  };
}

function getMockZonePosts(zoneId, tab, sort, page) {
  const mockData = require("../../utils/mock-data");
  const { postList } = mockData;
  const totalCount = postList.length;
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const sliced = postList.slice(start, end).map(p => ({
    ...p,
    zoneId: zoneId,
    zoneName: "",
    contentType: tab === "qa" ? "qa" : (tab === "recruit" || tab === "interview" ? "recruit" : p.contentType || "discuss"),
    title: p.title || p.content.slice(0, 40),
  }));
  return {
    data: sliced,
    hasMore: end < totalCount,
  };
}

Page({
  data: {
    statusBarHeight: 24,
    navBarHeight: 44,
    capsuleHeight: 32,
    navCapsuleInsetRight: 16,
    navTop: 0,
    // Page params
    zoneId: "",
    // Zone detail
    zone: null,
    loading: true,
    loadError: false,
    // Header collapse
    headerExpanded: true,
    headerOpacity: 1,
    headerHeight: 360,
    navBgOpacity: 0,
    showNavTitle: false,
    // Tabs
    tabs: [],
    activeTab: "all",
    // Sort
    sortOptions: SORT_OPTIONS,
    sortIndex: 0,
    currentSort: "reply",
    // Posts
    posts: [],
    page: 1,
    hasMore: true,
    loadingMore: false,
    // Pinned posts
    pinnedPosts: [],
    showPinned: false,
    // Tab cache
    tabCache: {},
    // Empty state
    isEmpty: false,
  },

  _scrollTimer: null,

  onLoad(options) {
    const zoneId = options.zoneId || options.id || "";
    if (!zoneId) {
      this.setData({ loading: false, loadError: true });
      return;
    }
    const metrics = getNavMetrics();
    const navTop = metrics.statusBarHeight;
    this.setData({
      zoneId,
      statusBarHeight: metrics.statusBarHeight,
      navBarHeight: metrics.navBarHeight,
      capsuleHeight: metrics.capsuleHeight,
      navCapsuleInsetRight: metrics.navCapsuleInsetRight,
      navTop,
    });
    this.loadZoneDetail();
  },

  async loadZoneDetail() {
    try {
      const zone = getMockZoneDetail(this.data.zoneId);
      if (!zone) {
        this.setData({ loading: false, loadError: true });
        wx.showToast({ title: "专区不存在", icon: "none" });
        return;
      }
      const tabs = zone.tabs || [];
      const activeTab = tabs.length > 0 ? tabs[0].tabKey : "all";
      const pinnedPosts = zone.pinnedPosts || [];
      const showPinned = activeTab === "all" && pinnedPosts.length > 0;

      this.setData({
        zone,
        tabs,
        activeTab,
        pinnedPosts,
        showPinned,
        loading: false,
      });
      this.loadPosts(true);
    } catch (error) {
      console.error("loadZoneDetail failed", error);
      this.setData({ loading: false, loadError: true });
    }
  },

  async loadPosts(reset = false) {
    const { zoneId, activeTab, currentSort, tabCache } = this.data;
    const cacheKey = `${activeTab}_${currentSort}`;
    const cached = tabCache[cacheKey];

    if (reset) {
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
      const result = getMockZonePosts(zoneId, activeTab, currentSort, nextPage);
      const newPosts = result.data;
      const allPosts = reset ? newPosts : this.data.posts.concat(newPosts);
      const updated = {
        posts: allPosts,
        page: nextPage + 1,
        hasMore: result.hasMore,
        isEmpty: allPosts.length === 0,
        loadingMore: false,
      };
      this.setData(updated);

      // Update cache
      if (reset) {
        tabCache[cacheKey] = { data: allPosts, page: nextPage + 1, hasMore: result.hasMore };
      } else {
        if (tabCache[cacheKey]) {
          tabCache[cacheKey].data = allPosts;
          tabCache[cacheKey].page = nextPage + 1;
          tabCache[cacheKey].hasMore = result.hasMore;
        }
      }
      this.setData({ tabCache });
    } catch (error) {
      console.error("loadPosts failed", error);
      this.setData({ loadingMore: false });
    }
  },

  // ── Scroll handling for header collapse ──
  onPageScroll(e) {
    const scrollTop = e.scrollTop;
    const headerHeight = 360;
    const threshold = headerHeight;
    const progress = Math.min(scrollTop / threshold, 1);

    const headerOpacity = Math.max(0, 1 - progress * 1.5);
    const navBgOpacity = Math.min(progress * 2, 1);
    const showNavTitle = progress >= 0.85;

    this.setData({
      headerOpacity,
      headerHeight: headerHeight * (1 - progress),
      navBgOpacity,
      showNavTitle,
    });
  },

  // ── Tab switching ──
  onTabChange(event) {
    const tabKey = event.currentTarget.dataset.key;
    if (tabKey === this.data.activeTab) return;

    const pinnedPosts = this.data.zone.pinnedPosts || [];
    const showPinned = tabKey === "all" && pinnedPosts.length > 0;

    this.setData({
      activeTab: tabKey,
      showPinned,
    });
    this.loadPosts(true);
  },

  // ── Sort picker ──
  onSortChange(event) {
    const index = event.detail.value;
    const sort = SORT_OPTIONS[index].key;
    if (sort === this.data.currentSort) return;
    this.setData({
      sortIndex: index,
      currentSort: sort,
    });
    this.loadPosts(true);
  },

  // ── Pull down refresh ──
  async onPullDownRefresh() {
    await this.loadPosts(true);
    wx.stopPullDownRefresh();
  },

  // ── Reach bottom ──
  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ loadingMore: true });
    await this.loadPosts();
  },

  // ── Join / Leave zone ──
  onJoinZone() {
    const { zone } = this.data;
    if (zone.isJoined) return;
    this.setData({
      "zone.isJoined": true,
      "zone.memberCount": zone.memberCount + 1,
    });
    wx.showToast({ title: "加入成功", icon: "success" });
  },

  onLeaveZone() {
    const { zone } = this.data;
    if (!zone.isJoined) return;
    wx.showModal({
      title: "提示",
      content: "确定退出该专区？",
      confirmColor: "#FF4D4F",
      success: (res) => {
        if (res.confirm) {
          this.setData({
            "zone.isJoined": false,
            "zone.memberCount": zone.memberCount - 1,
          });
          wx.showToast({ title: "已退出", icon: "success" });
        }
      },
    });
  },

  // ── Navigation ──
  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/community/community" }) });
  },

  onSearchTap() {
    console.log("专区搜索");
  },

  onMoreTap() {
    console.log("专区更多操作");
  },

  onShareZone() {
    console.log("分享专区", this.data.zoneId);
  },

  // ── Post navigation ──
  onPostTap(event) {
    const postId = event.detail.id;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${postId}` });
  },

  onPinnedTap(event) {
    const postId = event.currentTarget.dataset.postid;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${postId}` });
  },

  // ── FAB ──
  onFabTap() {
    wx.navigateTo({ url: `/pages/post-create/post-create?zoneId=${this.data.zoneId}` });
  },

  // ── Empty state ──
  onEmptyAction() {
    wx.navigateTo({ url: `/pages/post-create/post-create?zoneId=${this.data.zoneId}` });
  },
});
