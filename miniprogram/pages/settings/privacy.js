const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    navCapsuleInsetRight: 12,
    items: {
      allowStrangerMsg: true,
      showOnline: true,
      allowRecommend: true,
      anonymousDefault: false,
      historyVisible: false,
    },
  },

  onLoad() {
    this.setData({ ...getNavMetrics() });
  },

  onToggle(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    console.log("privacy setting changed", key, value);
    this.setData({ [`items.${key}`]: value });
  },

  goBlockList() {
    wx.showToast({ title: "暂未开放", icon: "none" });
  },

  goBack() {
    wx.navigateBack();
  },
});
