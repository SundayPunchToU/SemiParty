const api = require("../../utils/api");
const mockData = require("../../utils/mock-data");
const { homeTabs } = require("../../utils/constants");
const { deepClone, getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    navBarHeight: 44,
    brandName: "芯圈 SemiCircle",
    tabs: homeTabs,
    activeTab: "recommend",
    quickNavList: [],
    banner: null,
    newsList: [],
    page: 1,
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    const metrics = getNavMetrics();
    this.setData({
      ...metrics,
      quickNavList: deepClone(mockData.quickNavList),
      banner: deepClone(mockData.homeBanner)
    });
    this.loadNews(true);
  },

  async loadNews(reset = false) {
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
    wx.showToast({ title: "搜索页待接入", icon: "none" });
  },

  handleQuickNav(event) {
    wx.showToast({
      title: `${event.detail.item.label} 待接入`,
      icon: "none"
    });
  },

  async handleTabChange(event) {
    const nextTab = event.currentTarget.dataset.key;
    if (nextTab === this.data.activeTab) {
      return;
    }

    this.setData({
      activeTab: nextTab,
      newsList: [],
      page: 1,
      hasMore: true
    });
    await this.loadNews(true);
  },

  openJobMarket() {
    wx.navigateTo({ url: "/pages/job-market/job-market" });
  },

  openArticle(event) {
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${event.detail.id}`
    });
  }
});
