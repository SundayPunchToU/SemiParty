const api = require("../../utils/api");
const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    navBarHeight: 44,
    job: null,
    loading: false,
    applying: false,
  },

  async onLoad(options) {
    this.setData({
      ...getNavMetrics(),
    });

    const id = options.id || "";
    if (!id) {
      wx.showToast({ title: "缺少岗位信息", icon: "none" });
      return;
    }

    await this.loadDetail(id);
  },

  async loadDetail(id) {
    this.setData({ loading: true });
    try {
      const job = await api.getJobDetail(id);
      this.setData({
        job,
        loading: false,
      });
    } catch (error) {
      console.error("load job detail failed", error);
      this.setData({ loading: false });
      wx.showToast({
        title: error.message || "岗位加载失败",
        icon: "none",
      });
    }
  },

  async handleApply() {
    const jobId = this.data.job?.id;
    if (!jobId || this.data.applying) {
      return;
    }

    this.setData({ applying: true });
    try {
      await api.login();
      const result = await api.applyJob(jobId);
      wx.showToast({
        title: result.duplicated ? "已投递过该岗位" : "投递成功",
        icon: "none",
      });
    } catch (error) {
      console.error("apply job from detail failed", error);
      wx.showToast({
        title: error.message || "投递失败",
        icon: "none",
      });
    } finally {
      this.setData({ applying: false });
    }
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.navigateTo({ url: "/pages/job-market/job-market" });
      },
    });
  },
});
