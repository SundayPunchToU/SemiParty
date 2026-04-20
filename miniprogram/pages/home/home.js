const api = require("../../utils/api");
const { homeTabs } = require("../../utils/constants");
const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    navBarHeight: 44,
    tabs: homeTabs,
    activeTab: "news",
    newsList: [],
    jobList: [],
    companyList: [],
    loading: false,
    pageState: {
      news: { page: 1, hasMore: true, loadingMore: false },
      jobs: { page: 1, hasMore: true, loadingMore: false },
      companies: { page: 1, hasMore: true, loadingMore: false },
    },
  },

  onLoad() {
    this.setData(getNavMetrics());
    this.loadActiveTab(true);
  },

  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  async onPullDownRefresh() {
    await this.loadActiveTab(true);
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    const key = this.data.activeTab;
    const state = this.data.pageState[key];
    if (!state || !state.hasMore || state.loadingMore || this.data.loading) {
      return;
    }
    this.setData({ [`pageState.${key}.loadingMore`]: true });
    await this.loadActiveTab(false);
  },

  onSearchTap() {
    wx.navigateTo({ url: "/pages/search/search" });
  },

  async onTabTap(event) {
    const nextTab = event.currentTarget.dataset.key;
    if (!nextTab || nextTab === this.data.activeTab) {
      return;
    }
    this.setData({ activeTab: nextTab });
    const listKey = this.getListKey(nextTab);
    if (!this.data[listKey].length) {
      await this.loadActiveTab(true);
    }
  },

  getListKey(tabKey) {
    return tabKey === "jobs" ? "jobList" : tabKey === "companies" ? "companyList" : "newsList";
  },

  async loadActiveTab(reset = false) {
    const tabKey = this.data.activeTab;
    if (tabKey === "jobs") {
      await this.loadJobs(reset);
      return;
    }
    if (tabKey === "companies") {
      await this.loadCompanies(reset);
      return;
    }
    await this.loadNews(reset);
  },

  async loadNews(reset = false) {
    const page = reset ? 1 : this.data.pageState.news.page;
    this.setData({ loading: reset });
    try {
      const result = await api.getNewsList("recommend", page);
      const newsList = reset ? (result.data || []) : this.data.newsList.concat(result.data || []);
      this.setData({
        newsList,
        loading: false,
        "pageState.news.page": page + 1,
        "pageState.news.hasMore": !!result.hasMore,
        "pageState.news.loadingMore": false,
      });
    } catch (error) {
      console.error("loadNews failed", error);
      this.setData({
        loading: false,
        "pageState.news.loadingMore": false,
      });
      wx.showToast({ title: "资讯加载失败", icon: "none" });
    }
  },

  async loadJobs(reset = false) {
    const page = reset ? 1 : this.data.pageState.jobs.page;
    this.setData({ loading: reset });
    try {
      const result = await api.getJobList({ category: "all", page, pageSize: 10 });
      const jobList = reset ? (result.data || []) : this.data.jobList.concat(result.data || []);
      this.setData({
        jobList,
        loading: false,
        "pageState.jobs.page": page + 1,
        "pageState.jobs.hasMore": !!result.hasMore,
        "pageState.jobs.loadingMore": false,
      });
    } catch (error) {
      console.error("loadJobs failed", error);
      this.setData({
        loading: false,
        "pageState.jobs.loadingMore": false,
      });
      wx.showToast({ title: "岗位加载失败", icon: "none" });
    }
  },

  async loadCompanies(reset = false) {
    const page = reset ? 1 : this.data.pageState.companies.page;
    this.setData({ loading: reset });
    try {
      const result = await api.getCompanyList({ page, size: 10 });
      const companyList = reset
        ? (result.data || [])
        : this.data.companyList.concat(result.data || []);
      this.setData({
        companyList,
        loading: false,
        "pageState.companies.page": page + 1,
        "pageState.companies.hasMore": !!result.hasMore,
        "pageState.companies.loadingMore": false,
      });
    } catch (error) {
      console.error("loadCompanies failed", error);
      this.setData({
        loading: false,
        "pageState.companies.loadingMore": false,
      });
      wx.showToast({ title: "企业加载失败", icon: "none" });
    }
  },

  openArticle(event) {
    const id = event.detail.id;
    if (!id) {
      return;
    }
    wx.navigateTo({ url: `/pages/article-detail/article-detail?id=${id}` });
  },

  openJobDetail(event) {
    const id = event.detail.id;
    if (!id) {
      return;
    }
    wx.navigateTo({ url: `/pages/job-detail/job-detail?id=${id}` });
  },

  openCompany(event) {
    const company = event.currentTarget.dataset.company;
    if (!company) {
      return;
    }
    wx.navigateTo({
      url: `/pages/job-market/job-market?company=${encodeURIComponent(company)}`,
    });
  },

  async onApplyJob(event) {
    const jobId = event.detail.id;
    if (!jobId) {
      return;
    }
    try {
      await api.login();
      const result = await api.applyJob(jobId);
      wx.showToast({
        title: result.duplicated ? "已投递" : "投递成功",
        icon: "none",
      });
    } catch (error) {
      console.error("applyJob failed", error);
      wx.showToast({ title: error.message || "投递失败", icon: "none" });
    }
  },
});
