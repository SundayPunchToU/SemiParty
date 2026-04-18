const { getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    darkMode: true,
  },

  onLoad() {
    this.setData({ ...getNavMetrics() });
  },

  goBack() {
    wx.navigateBack();
  },

  goPrivacy() {
    console.log("跳转到隐私设置");
    wx.navigateTo({ url: "/pages/settings/privacy" });
  },

  goNotification() {
    console.log("跳转到通知设置");
    wx.navigateTo({ url: "/pages/settings/notification" });
  },

  onDarkModeChange(e) {
    console.log("深色模式变更", e.detail.value);
    this.setData({ darkMode: e.detail.value });
  },

  handleFontSize() {
    console.log("字体大小选择");
    wx.showToast({ title: "待接入", icon: "none" });
  },

  handleClearCache() {
    console.log("清除缓存");
    wx.showModal({
      title: "清除缓存",
      content: "确定清除所有缓存数据吗？",
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: "缓存已清除", icon: "none" });
        }
      }
    });
  },

  handleFeedback() {
    console.log("意见反馈");
    wx.showToast({ title: "待接入", icon: "none" });
  },

  handleAbout() {
    console.log("关于芯社区");
    wx.showToast({ title: "芯社区 v2.0.0", icon: "none" });
  },

  handleCheckUpdate() {
    console.log("检查更新");
    wx.showToast({ title: "已是最新版本", icon: "none" });
  },

  handleLogout() {
    wx.showModal({
      title: "提示",
      content: "确定退出登录吗？",
      confirmColor: "#FF4D4F",
      success: (res) => {
        if (res.confirm) {
          console.log("退出登录");
          wx.showToast({ title: "已退出登录", icon: "none" });
        }
      }
    });
  },
});
