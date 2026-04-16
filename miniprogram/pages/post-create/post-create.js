const api = require("../../utils/api");
const mockData = require("../../utils/mock-data");
const { deepClone, getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    content: "",
    topics: [],
    selectedTopic: "",
    anonymous: false,
    images: []
  },

  onLoad() {
    this.setData({
      ...getNavMetrics(),
      topics: deepClone(mockData.topicList),
      selectedTopic: mockData.topicList[0].text
    });
  },

  handleInput(event) {
    this.setData({ content: event.detail.value });
  },

  handleTopicSelect(event) {
    this.setData({
      selectedTopic: event.currentTarget.dataset.text
    });
  },

  handleAnonymousChange(event) {
    this.setData({ anonymous: event.detail.value });
  },

  handleAddImage() {
    wx.showToast({ title: "图片上传待接入", icon: "none" });
  },

  async handlePublish() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: "先写点内容", icon: "none" });
      return;
    }

    await api.createPost({
      content: this.data.content,
      topic: this.data.selectedTopic,
      anonymous: this.data.anonymous
    });

    wx.showToast({ title: "发布成功", icon: "success" });
    setTimeout(() => {
      wx.navigateBack({
        fail() {
          wx.switchTab({ url: "/pages/community/community" });
        }
      });
    }, 300);
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: "/pages/community/community" });
      }
    });
  }
});
