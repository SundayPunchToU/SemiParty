const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    items: {
      comment: true,
      like: true,
      mention: true,
      newFollower: true,
      privateMsg: true,
      groupMsg: true,
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
    // TODO: POST /api/user/settings { key, value }
    console.log("通知设置变更", key, value);
    this.setData({ [`items.${key}`]: value });
  },

  onPickDndTime() {
    console.log("选择免打扰时段");
    wx.showToast({ title: "待接入", icon: "none" });
  },

  goBack() {
    wx.navigateBack();
  },
});
