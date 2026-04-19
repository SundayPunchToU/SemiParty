const api = require("../../utils/api");
const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    capsuleHeight: 32,
    navCapsuleInsetRight: 16,
    topics: [],
    selectedTopicId: "",
    selectedTopicName: "",
    content: "",
    isAnonymous: true,
    canPublish: false,
    publishing: false,
  },

  async onLoad() {
    this.setData({ ...getNavMetrics() });
    await this.loadTopics();
  },

  async loadTopics() {
    try {
      const res = await api.getTeaRoomTopics();
      const topics = res.data || [];
      const first = topics[0] || null;
      this.setData(
        {
          topics,
          selectedTopicId: first ? first.topicId : "",
          selectedTopicName: first ? first.topicName : "",
        },
        () => this.updateCanPublish()
      );
    } catch (error) {
      console.error("loadTopics failed", error);
      wx.showToast({ title: "话题加载失败", icon: "none" });
    }
  },

  onTopicTap(event) {
    const { id, name } = event.currentTarget.dataset;
    this.setData(
      {
        selectedTopicId: id || "",
        selectedTopicName: name || "",
      },
      () => this.updateCanPublish()
    );
  },

  handleContentInput(event) {
    this.setData({ content: event.detail.value }, () => this.updateCanPublish());
  },

  onAnonToggle(event) {
    this.setData({ isAnonymous: !!event.detail.value });
  },

  updateCanPublish() {
    this.setData({
      canPublish: !!this.data.content.trim() && !!this.data.selectedTopicId,
    });
  },

  goBack() {
    if (!this.data.content.trim()) {
      this.doGoBack();
      return;
    }

    wx.showModal({
      title: "提示",
      content: "有未发布的内容，确定退出吗？",
      confirmColor: "#FF4D4F",
      success: (res) => {
        if (res.confirm) {
          this.doGoBack();
        }
      },
    });
  },

  doGoBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: "/pages/community/community" });
      },
    });
  },

  async handlePublish() {
    if (!this.data.canPublish || this.data.publishing) {
      return;
    }

    this.setData({ publishing: true });
    try {
      await api.createPost({
        topicId: this.data.selectedTopicId,
        topicName: this.data.selectedTopicName,
        content: this.data.content.trim(),
        contentType: "chat",
        isAnonymous: this.data.isAnonymous,
        tags: [],
      });
      getApp().globalData.communityNeedsRefresh = true;
      wx.showToast({ title: "发布成功", icon: "success" });
      setTimeout(() => this.doGoBack(), 300);
    } catch (error) {
      console.error("createPost failed", error);
      wx.showToast({ title: error.message || "发布失败，请重试", icon: "none" });
    } finally {
      this.setData({ publishing: false });
    }
  },
});
