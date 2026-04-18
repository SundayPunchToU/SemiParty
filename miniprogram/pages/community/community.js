const api = require("../../utils/api");
const mockData = require("../../utils/mock-data");
const { communityTabs } = require("../../utils/constants");
const { deepClone, getNavMetrics } = require("../../utils/util");

// === STEP 2.5：分类 Tab 数据保持前端常量（不再从 mock 文件 import） ===
const zoneCategories = [
  { key: "company", name: "🏢 公司" },
  { key: "role", name: "🔧 工种" },
  { key: "tech", name: "🧪 技术" },
  { key: "campus", name: "🎓 校园" },
  { key: "supply", name: "📦 供应链" },
  { key: "region", name: "📍 地区" },
];

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
    loadingMore: false,
    // === STEP 2.5：社区页专区导航数据（从 API 获取） ===
    myZones: [],
    zoneCategories: zoneCategories,
    activeCategory: "company",
    currentZoneList: [],
    hasMyZones: false,
    zoneListLoading: false,
    teaRoomOnlineCount: "- -",
    teaRoomTodayPosts: "- -",
  },

  // Zone list cache by category
  _zoneCache: {},

  onLoad() {
    const metrics = getNavMetrics();
    this.setData({
      ...metrics,
      topics: deepClone(mockData.topicList)
    });
    this.loadPosts(true);
    this.loadTeaRoomInfo();
    this.loadMyZones();
    this.loadZoneListByCategory(this.data.activeCategory);
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    const app = getApp();
    if (app.globalData.communityNeedsRefresh) {
      app.globalData.communityNeedsRefresh = false;
      this.loadPosts(true);
      this.loadMyZones();
    }
  },

  // ── Step 2.5：API data methods ──
  async loadTeaRoomInfo() {
    try {
      const result = await api.getTeaRoomInfo();
      const memberCount = result.memberCount || 0;
      const todayPostCount = result.todayPostCount || 0;
      const onlineCount = Math.floor(memberCount * 0.03);
      this.setData({
        teaRoomOnlineCount: onlineCount > 0 ? onlineCount.toLocaleString() : "- -",
        teaRoomTodayPosts: todayPostCount > 0 ? todayPostCount.toLocaleString() : "- -",
      });
    } catch (e) {
      console.error("loadTeaRoomInfo failed", e);
    }
  },

  async loadMyZones() {
    try {
      const result = await api.getUserZones();
      const zones = (result.zones || []).map(z => ({
        zoneId: z.zoneId,
        zoneName: z.zoneName,
        hasNew: z.hasNewContent || false,
      }));
      this.setData({ myZones: zones, hasMyZones: zones.length > 0 });
    } catch (e) {
      console.error("loadMyZones failed", e);
    }
  },

  async loadZoneListByCategory(category, forceRefresh = false) {
    if (this._zoneCache[category] && !forceRefresh) {
      this.setData({ currentZoneList: this._zoneCache[category], zoneListLoading: false });
      return;
    }
    this.setData({ zoneListLoading: true });
    try {
      const result = await api.getZoneListByCategory(category, 1, 50);
      const zones = (result.zones || []).map(z => ({
        zoneId: z.zoneId,
        zoneName: z.zoneName,
        memberCount: this._formatMemberCount(z.memberCount || 0),
        todayPosts: z.todayPostCount || z.todayPosts || 0,
        isJoined: z.isJoined || false,
      }));
      this._zoneCache[category] = zones;
      this.setData({ currentZoneList: zones, zoneListLoading: false });
    } catch (e) {
      console.error("loadZoneListByCategory failed", e);
      this.setData({ zoneListLoading: false });
    }
  },

  _formatMemberCount(count) {
    if (typeof count === "string") return count;
    if (count >= 10000) return (count / 10000).toFixed(1).replace(/\.0$/, "") + "w";
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(count);
  },

  applyTopicFilter(list) {
    if (!this.data.activeTopic) {
      return list;
    }
    return list.filter((item) => item.topic.text === this.data.activeTopic);
  },

  async loadPosts(reset = false) {
    const nextPage = reset ? 1 : this.data.page;
    try {
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
    } catch (error) {
      console.error("loadPosts failed", error);
      this.setData({ loadingMore: false });
      wx.showToast({
        title: error.message || "帖子加载失败",
        icon: "none"
      });
    }
  },

  async onPullDownRefresh() {
    await Promise.all([
      this.loadPosts(true),
      this.loadTeaRoomInfo(),
      this.loadMyZones(),
      this.loadZoneListByCategory(this.data.activeCategory, true),
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
  },

  onSearchTap() {
    console.log("搜索");
  },

  goToTeaRoom() {
    wx.navigateTo({ url: "/pages/tea-room/tea-room" });
  },

  onCategoryTap(event) {
    const key = event.currentTarget.dataset.key;
    if (key === this.data.activeCategory) return;
    this.setData({
      activeCategory: key,
      currentZoneList: [],
    });
    this.loadZoneListByCategory(key);
  },

  onZoneTap(event) {
    const zoneId = event.currentTarget.dataset.zoneid;
    wx.navigateTo({ url: `/pages/zone-detail/zone-detail?zoneId=${zoneId}` });
  },

  async onJoinToggle(event) {
    const zoneId = event.currentTarget.dataset.zoneid;
    const list = this.data.currentZoneList;
    const index = list.findIndex(z => z.zoneId === zoneId);
    if (index === -1) return;

    const isJoined = list[index].isJoined;

    if (isJoined) {
      // Leave zone: show confirm dialog
      const zoneName = list[index].zoneName;
      const confirmed = await new Promise((resolve) => {
        wx.showModal({
          title: "提示",
          content: `确定退出「${zoneName}」专区？`,
          confirmColor: "#FF4D4F",
          success: (res) => resolve(res.confirm),
        });
      });
      if (!confirmed) return;

      try {
        await api.leaveZone(zoneId);
        const key = `currentZoneList[${index}].isJoined`;
        this.setData({ [key]: false });
        this.loadMyZones();
      } catch (e) {
        wx.showToast({ title: "操作失败，请重试", icon: "none" });
      }
    } else {
      // Join zone
      try {
        await api.joinZone(zoneId);
        const key = `currentZoneList[${index}].isJoined`;
        this.setData({ [key]: true });
        this.loadMyZones();
      } catch (e) {
        wx.showToast({ title: "加入失败，请重试", icon: "none" });
      }
    }
  },

  onViewAllZones() {
    console.log("查看全部专区");
  },

  onGoDiscover() {
    console.log("去看看");
  },

  onCreateZone() {
    wx.navigateTo({ url: "/pages/create-zone/create-zone" });
  },
});
