const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    navCapsuleInsetRight: 12,
    items: {
      comment: true,
      like: true,
      mention: true,
      newFollower: true,
      privateMsg: true,
      system: true,
      dnd: false,
    },
  },

  onLoad() {
    this.setData({ ...getNavMetrics() });
  },

  onToggle(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    console.log("notification setting changed", key, value);
    this.setData({ [`items.${key}`]: value });
  },

  onPickDndTime() {
    wx.showToast({ title: "暂未开放", icon: "none" });
  },

  goBack() {
    wx.navigateBack();
  },
});
