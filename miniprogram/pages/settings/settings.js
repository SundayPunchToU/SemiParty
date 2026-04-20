const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    navCapsuleInsetRight: 12,
    capsuleHeight: 44,
    darkMode: true,
  },

  onLoad() {
    this.setData({ ...getNavMetrics() });
  },

  goBack() {
    wx.navigateBack();
  },

  goPrivacy() {
    wx.navigateTo({ url: "/pages/settings/privacy" });
  },

  goNotification() {
    wx.navigateTo({ url: "/pages/settings/notification" });
  },

  onDarkModeChange(e) {
    this.setData({ darkMode: !!e.detail.value });
  },

  handleFontSize() {
    wx.showToast({ title: "暂未开放", icon: "none" });
  },

  handleClearCache() {
    wx.showModal({
      title: "清除缓存",
      content: "确定清除本地缓存吗？",
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: "缓存已清除", icon: "none" });
        }
      },
    });
  },

  handleFeedback() {
    wx.showToast({ title: "反馈入口筹备中", icon: "none" });
  },

  handleAbout() {
    wx.showToast({ title: "SemiParty v2.0.0", icon: "none" });
  },

  handleCheckUpdate() {
    wx.showToast({ title: "当前已是最新版本", icon: "none" });
  },

  handleLogout() {
    wx.showModal({
      title: "退出登录",
      content: "确定退出当前账号吗？",
      confirmColor: "#ef4444",
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: "已退出登录", icon: "none" });
        }
      },
    });
  },
});
