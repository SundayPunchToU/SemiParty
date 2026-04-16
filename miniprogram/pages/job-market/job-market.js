const api = require("../../utils/api");
const { jobMarketModes, jobFilters } = require("../../utils/constants");
const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    navBarHeight: 44,
    modes: jobMarketModes,
    mode: "job",
    filters: jobFilters,
    activeFilter: "all",
    keyword: "",
    jobList: [],
    talentList: []
  },

  async onLoad() {
    this.setData({
      ...getNavMetrics()
    });
    await Promise.all([this.loadJobs(), this.loadTalents()]);
  },

  async loadJobs() {
    const result = await api.getJobList(this.data.activeFilter);
    const keyword = this.data.keyword.trim().toLowerCase();
    const jobList = keyword
      ? result.data.filter((item) => {
          const source = `${item.title}${item.company}${item.city}${item.tags.join("")}`.toLowerCase();
          return source.includes(keyword);
        })
      : result.data;
    this.setData({ jobList });
  },

  async loadTalents() {
    const result = await api.getTalentList(this.data.keyword);
    this.setData({ talentList: result.data });
  },

  async handleModeChange(event) {
    const mode = event.currentTarget.dataset.key;
    if (mode === this.data.mode) {
      return;
    }

    this.setData({ mode });
    if (mode === "job") {
      await this.loadJobs();
      return;
    }

    await this.loadTalents();
  },

  async handleFilterChange(event) {
    const activeFilter = event.currentTarget.dataset.key;
    this.setData({ activeFilter });
    await this.loadJobs();
  },

  async handleSearchChange(event) {
    this.setData({ keyword: event.detail.value });
    if (this.data.mode === "job") {
      await this.loadJobs();
      return;
    }

    await this.loadTalents();
  },

  handleApply() {
    wx.showToast({ title: "投递功能开发中", icon: "none" });
  },

  handleContact() {
    wx.showToast({ title: "沟通能力开发中", icon: "none" });
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: "/pages/home/home" });
      }
    });
  }
});
