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
    talentList: [],
    applyingJobId: "",
    contactingTalentId: ""
  },

  async onLoad(options = {}) {
    this.setData({
      ...getNavMetrics()
    });
    if (options.company) {
      this.setData({ keyword: decodeURIComponent(options.company) });
    }
    await Promise.all([this.loadJobs(), this.loadTalents()]);
  },

  async loadJobs() {
    try {
      const result = await api.getJobList(this.data.activeFilter);
      const keyword = this.data.keyword.trim().toLowerCase();
      const jobList = keyword
        ? result.data.filter((item) => {
            const source = `${item.title}${item.company}${item.city}${(item.tags || []).join("")}`.toLowerCase();
            return source.includes(keyword);
          })
        : result.data;
      this.setData({ jobList });
    } catch (error) {
      console.error("loadJobs failed", error);
      wx.showToast({ title: "岗位加载失败", icon: "none" });
    }
  },

  async loadTalents() {
    try {
      const result = await api.getTalentList(this.data.keyword);
      this.setData({ talentList: result.data });
    } catch (error) {
      console.error("loadTalents failed", error);
      wx.showToast({ title: "人才加载失败", icon: "none" });
    }
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

  async handleApply(event) {
    const jobId = event.detail.id;
    if (!jobId || this.data.applyingJobId) {
      return;
    }

    this.setData({ applyingJobId: jobId });
    try {
      await api.login();
      const result = await api.applyJob(jobId);
      wx.showToast({
        title: result.duplicated ? "该岗位已投递" : "投递成功",
        icon: "none",
      });
    } catch (error) {
      console.error("apply job failed", error);
      wx.showToast({
        title: error.message || "投递失败，请稍后重试",
        icon: "none",
      });
    } finally {
      this.setData({ applyingJobId: "" });
    }
  },

  openJobDetail(event) {
    const id = event.detail.id;
    if (!id) {
      return;
    }

    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${id}`,
    });
  },

  openTalentDetail(event) {
    const id = event.detail.id;
    if (!id) {
      return;
    }

    wx.navigateTo({
      url: `/pages/talent-detail/talent-detail?id=${id}`,
    });
  },

  async handleContact(event) {
    const talentId = event.detail.id;
    if (!talentId || this.data.contactingTalentId) {
      return;
    }

    const talent = this.data.talentList.find((item) => item.id === talentId);
    const targetUid = talent && (talent.uid || talent.openid || talent.id);
    if (!targetUid) {
      wx.showToast({ title: "候选人信息缺失", icon: "none" });
      return;
    }

    this.setData({ contactingTalentId: talentId });
    try {
      await api.login();
      const result = await api.createChat(targetUid);
      const chatId = result.chatId || (result.data && result.data._id) || "";
      if (!chatId) {
        throw new Error("chatId missing");
      }
      wx.navigateTo({
        url: `/pages/chat-detail/chat-detail?chatId=${chatId}&title=${encodeURIComponent(talent.name || "候选人")}`,
      });
    } catch (error) {
      console.error("create chat failed", error);
      wx.showToast({
        title: error.message || "发起私聊失败",
        icon: "none",
      });
    } finally {
      this.setData({ contactingTalentId: "" });
    }
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: "/pages/home/home" });
      }
    });
  }
});
