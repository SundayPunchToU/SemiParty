const api = require("../../utils/api");
const { getNavMetrics } = require("../../utils/util");

const SEARCH_TABS = [
  { key: "all", label: "全部" },
  { key: "news", label: "资讯" },
  { key: "post", label: "帖子" },
  { key: "job", label: "岗位" },
  { key: "talent", label: "人才" },
];

function withSubtitle(item = {}) {
  return {
    ...item,
    subtitle:
      item.company ||
      item.source ||
      item.school ||
      item.topicName ||
      item.zoneName ||
      (item.topic && item.topic.text) ||
      item.targetRole ||
      "",
  };
}

Page({
  data: {
    statusBarHeight: 24,
    navBarHeight: 44,
    keyword: "",
    activeType: "all",
    tabs: SEARCH_TABS,
    groupedResults: null,
    listResults: [],
    searched: false,
    loading: false,
  },

  onLoad(options) {
    const keyword = options.keyword || "";
    this.setData({
      ...getNavMetrics(),
      keyword,
    });
    if (keyword.trim()) {
      this.handleSearch();
    }
  },

  handleInput(event) {
    this.setData({ keyword: event.detail.value });
  },

  async handleSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      wx.showToast({ title: "请输入关键词", icon: "none" });
      return;
    }

    this.setData({
      loading: true,
      searched: true,
    });

    try {
      const result = await api.search(keyword, this.data.activeType, 1);
      if (this.data.activeType === "all") {
        const groupedResults = {
          news: (result.data?.news || []).map(withSubtitle),
          posts: (result.data?.posts || []).map(withSubtitle),
          jobs: (result.data?.jobs || []).map(withSubtitle),
          talents: (result.data?.talents || []).map(withSubtitle),
        };
        this.setData({
          groupedResults,
          listResults: [],
          loading: false,
        });
        return;
      }

      this.setData({
        groupedResults: null,
        listResults: (result.data || []).map(withSubtitle),
        loading: false,
      });
    } catch (error) {
      console.error("search failed", error);
      this.setData({ loading: false });
      wx.showToast({
        title: error.message || "搜索失败",
        icon: "none",
      });
    }
  },

  async handleTabChange(event) {
    const activeType = event.currentTarget.dataset.key;
    if (!activeType || activeType === this.data.activeType) {
      return;
    }

    this.setData({ activeType });
    if (this.data.keyword.trim()) {
      await this.handleSearch();
    }
  },

  openResult(event) {
    const { type, id } = event.currentTarget.dataset;
    if (type === "news") {
      wx.navigateTo({ url: `/pages/article-detail/article-detail?id=${id}` });
      return;
    }
    if (type === "post") {
      wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}` });
      return;
    }
    if (type === "job") {
      wx.navigateTo({ url: `/pages/job-detail/job-detail?id=${id}` });
      return;
    }
    wx.navigateTo({ url: `/pages/talent-detail/talent-detail?id=${id}` });
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: "/pages/home/home" });
      },
    });
  },
});
