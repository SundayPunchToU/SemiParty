const api = require("../../utils/api");
const { profileStatuses } = require("../../utils/constants");
const { getNavMetrics } = require("../../utils/util");

const menuGroups = [
  {
    title: "求职管理",
    items: [
      { id: "resume", icon: "R", bg: "#dce8ff", color: "#165dc6", name: "我的简历", desc: "在线简历 · 已完善 85%" },
      { id: "delivery", icon: "D", bg: "#ddf5ee", color: "#157658", name: "投递记录", desc: "3 个岗位进行中" },
      { id: "viewed", icon: "W", bg: "#ecebff", color: "#5951d9", name: "谁看过我", desc: "12 位 HR/猎头近 7 天浏览" },
      { id: "status", icon: "S", bg: "#fdf0d8", color: "#9d6615", name: "求职状态", desc: "当前：在看机会" }
    ]
  },
  {
    title: "社区相关",
    items: [
      { id: "favorite", icon: "C", bg: "#353430", color: "#f7f4ef", name: "我的收藏", desc: "文章 · 帖子 · 岗位" },
      { id: "history", icon: "H", bg: "#353430", color: "#f7f4ef", name: "浏览历史", desc: "最近读过与浏览内容" }
    ]
  }
];

Page({
  data: {
    statusBarHeight: 24,
    brandName: "芯圈 SemiParty",
    profile: null,
    statusConfig: null,
    menuGroups
  },

  async onLoad() {
    const profile = await api.getUserProfile();
    this.setData({
      ...getNavMetrics(),
      profile,
      statusConfig: this.getStatusConfig(profile.jobStatus)
    });
  },

  getStatusConfig(statusKey) {
    // 兼容旧数据：如果传入的是中文 label 而非 key，也能匹配
    return (
      profileStatuses.find((item) => item.key === statusKey) ||
      profileStatuses.find((item) => item.label === statusKey) ||
      profileStatuses[0]
    );
  },

  handleStatusChange() {
    wx.showActionSheet({
      itemList: profileStatuses.map((item) => item.label),
      success: ({ tapIndex }) => {
        const selected = profileStatuses[tapIndex];
        const prevKey = this.data.profile.jobStatus;
        const prevConfig = this.data.statusConfig;

        // 乐观更新 UI
        this.setData({
          "profile.jobStatus": selected.key,
          statusConfig: selected
        });

        // 持久化到云端
        api.updateUser("jobStatus", selected.key).catch(() => {
          // 回滚
          this.setData({
            "profile.jobStatus": prevKey,
            statusConfig: prevConfig
          });
          wx.showToast({ title: "状态保存失败，请重试", icon: "none" });
        });
      }
    });
  },

  handleMenuTap(event) {
    const { name } = event.currentTarget.dataset;
    wx.showToast({ title: `${name} 待接入`, icon: "none" });
  }
});
