const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
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
    // TODO: POST /api/user/settings { key, value }
    console.log("隐私设置变更", key, value);
    this.setData({ [`items.${key}`]: value });
  },

  goBlockList() {
    console.log("跳转黑名单管理");
    wx.showToast({ title: "待接入", icon: "none" });
  },

  goBack() {
    wx.navigateBack();
  },
});
