const api = require("../../utils/api");
const mockData = require("../../utils/mock-data");
const { homeTabs } = require("../../utils/constants");
const { deepClone, getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    navBarHeight: 44,
    brandName: "芯圈 SemiParty",
    tabs: homeTabs,
    activeTab: "recommend",
    quickNavList: [],
    banner: null,
    newsList: [],
    page: 1,
    hasMore: true,
    loadingMore: false,
    // === STEP 1.2 修改开始：新增数据字段 ===
    swiperCurrent: 0,
    teaRoomTopics: ["🔥热门", "#夜班日常", "#食堂测评", "#通勤吐槽", "#行业八卦", "#厂区生活"],
    activeTeaRoomTopic: "🔥热门"
    // === STEP 1.2 修改结束 ===
  },

  // === STEP 1.3 修改开始：公告条和运营横幅数据 ===
  _initBannerList() {
    return [
      { id: "b1", bgColor: "#1E3A5F", text: "招聘季火热进行中" },
      { id: "b2", bgColor: "#3E1A5F", text: "半导体行业峰会报名" },
      { id: "b3", bgColor: "#1A5F3E", text: "芯社区新功能上线" }
    ];
  },

  _initShortcutList() {
    return [
      { id: "s1", icon: "🔥", label: "热门招聘" },
      { id: "s2", icon: "📚", label: "知识库" },
      { id: "s3", icon: "📦", label: "供需大厅" },
      { id: "s4", icon: "🎓", label: "校招专区" },
      { id: "s5", icon: "🏢", label: "企业主页" }
    ];
  },
  // === STEP 1.3 修改结束 ===

  onLoad() {
    const metrics = getNavMetrics();
    this.setData({
      ...metrics,
      // === STEP 1.3 修改开始：初始化轮播和快捷入口数据 ===
      bannerList: this._initBannerList(),
      shortcutList: this._initShortcutList(),
      showNotice: true
      // === STEP 1.3 修改结束 ===
    });
    this.loadNews(true);
  },

  // === STEP 1.1 修改开始：同步自定义 TabBar 选中状态 ===
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },
  // === STEP 1.1 修改结束 ===

  async loadNews(reset = false) {
    try {
      const nextPage = reset ? 1 : this.data.page;
      const result = await api.getNewsList(this.data.activeTab, nextPage);
      const newsList = reset
        ? result.data
        : this.data.newsList.concat(result.data);

      this.setData({
        newsList,
        page: nextPage + 1,
        hasMore: result.hasMore,
        loadingMore: false
      });
    } catch (error) {
      console.error("loadNews failed", error);
      this.setData({ loadingMore: false });
      wx.showToast({ title: "资讯加载失败", icon: "none" });
    }
  },

  async onPullDownRefresh() {
    await this.loadNews(true);
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) {
      return;
    }

    this.setData({ loadingMore: true });
    await this.loadNews();
  },

  handleSearch() {
    wx.navigateTo({ url: "/pages/search/search" });
  },

  handleQuickNav(event) {
    wx.showToast({
      title: `${event.detail.item.label} 待接入`,
      icon: "none"
    });
  },

  // === STEP 1.2 修改开始：Tab 切换联动 Swiper ===
  async handleTabChange(event) {
    const nextTab = event.currentTarget.dataset.key;
    if (nextTab === this.data.activeTab) {
      return;
    }

    const indexMap = { recommend: 0, industry: 1, knowledge: 2, company: 3 };
    const swiperIdx = indexMap[nextTab] !== undefined ? indexMap[nextTab] : 0;

    this.setData({
      activeTab: nextTab,
      swiperCurrent: swiperIdx
    });

    // 仅推荐和资讯 Tab 加载新闻数据
    if (nextTab === 'recommend' || nextTab === 'industry') {
      this.setData({
        newsList: [],
        page: 1,
        hasMore: true
      });
      await this.loadNews(true);
    } else {
      this.setData({ newsList: [] });
    }
  },
  // === STEP 1.2 修改结束 ===

  openJobMarket() {
    wx.navigateTo({ url: "/pages/job-market/job-market" });
  },

  openArticle(event) {
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${event.detail.id}`
    });
  },

  // === STEP 1.2 修改开始：Swiper 切换处理 ===
  onSwiperChange(event) {
    const current = event.detail.current;
    const indexToTab = ['recommend', 'industry', 'knowledge', 'company'];
    const nextTab = indexToTab[current];
    if (nextTab === this.data.activeTab) {
      return;
    }

    this.setData({
      swiperCurrent: current,
      activeTab: nextTab
    });

    if (nextTab === 'recommend' || nextTab === 'industry') {
      this.setData({
        newsList: [],
        page: 1,
        hasMore: true
      });
      this.loadNews(true);
    } else {
      this.setData({ newsList: [] });
    }
  },

  goToCommunity() {
    wx.switchTab({ url: '/pages/community/community' });
  },

  onTopicTap(event) {
    const topic = event.currentTarget.dataset.topic;
    this.setData({ activeTeaRoomTopic: topic });
  },

  onTeaRoomFabTap() {
    wx.navigateTo({ url: "/pages/post-create/post-create?zoneId=tea-room&isAnonymous=true" });
  },

  // === STEP 1.3 修改开始：公告条和运营横幅事件 ===
  closeNotice() {
    this.setData({ showNotice: false });
  },

  onNoticeTap() {
    console.log('点击公告');
  },

  onBannerChange(event) {
    this.setData({ bannerCurrent: event.detail.current });
  },

  onBannerTap(event) {
    const id = event.currentTarget.dataset.id;
    console.log('点击横幅', id);
  },

  onShortcutTap(event) {
    const label = event.currentTarget.dataset.label;
    console.log('点击了', label);
  }
  // === STEP 1.3 修改结束 ===
});
