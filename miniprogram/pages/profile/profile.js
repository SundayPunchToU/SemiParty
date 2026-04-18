const { getNavMetrics } = require("../../utils/util");
const { myProfile, myPosts, myFavorites, myViewHistory, CONTENT_TYPE_MAP } = require("../../mock/profileData");

const CONTENT_TABS = [
  { key: "posts", label: "我的帖子" },
  { key: "favorites", label: "我的收藏" },
  { key: "history", label: "浏览历史" },
];

Page({
  data: {
    statusBarHeight: 24,
    navCapsuleInsetRight: 12,
    capsuleHeight: 44,
    profile: myProfile,
    contentTabs: CONTENT_TABS,
    activeTab: "posts",
    myPosts: [],
    myFavorites: [],
    myHistory: [],
  },

  onLoad() {
    this.setData({ ...getNavMetrics() });
    this._loadTabData("posts");
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  _loadTabData(tab) {
    const typeLabel = (t) => CONTENT_TYPE_MAP[t] || t;
    if (tab === "posts") {
      this.setData({
        myPosts: myPosts.map(p => ({ ...p, contentTypeLabel: typeLabel(p.contentType) })),
      });
    } else if (tab === "favorites") {
      this.setData({ myFavorites: [...myFavorites] });
    } else if (tab === "history") {
      this.setData({ myHistory: [...myViewHistory] });
    }
  },

  onTabChange(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeTab) return;
    this.setData({ activeTab: key });
    this._loadTabData(key);
  },

  formatCount(n) {
    if (n == null) return "0";
    if (n >= 10000) return (n / 10000).toFixed(1) + "w";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(n);
  },

  onStatTap(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === "followers") {
      wx.navigateTo({ url: "/pages/follow-list/follow-list?type=followers" });
    } else if (tab === "following") {
      wx.navigateTo({ url: "/pages/follow-list/follow-list?type=following" });
    } else if (tab === "posts") {
      this.setData({ activeTab: "posts" });
      this._loadTabData("posts");
    } else if (tab === "favorites") {
      this.setData({ activeTab: "favorites" });
      this._loadTabData("favorites");
    }
  },

  onPostTap(e) {
    // TODO: GET /api/users/:userId/posts?page=
    console.log("查看帖子", e.currentTarget.dataset.id);
  },

  onZoneTap(e) {
    console.log("跳转专区", e.currentTarget.dataset.id);
  },

  goEditProfile() {
    console.log("编辑资料");
    wx.navigateTo({ url: "/pages/edit-profile/edit-profile" });
  },

  goSettings() {
    wx.navigateTo({ url: "/pages/settings/settings" });
  },

  goCommunity() {
    wx.switchTab({ url: "/pages/community/community" });
  },

  goFollowList(e) {
    const type = e.currentTarget.dataset.type || "following";
    wx.navigateTo({ url: `/pages/follow-list/follow-list?type=${type}` });
  },

  clearHistory() {
    this.setData({ myHistory: [] });
    console.log("清空浏览历史");
    wx.showToast({ title: "已清空", icon: "none" });
  },

  handleMenuTap(e) {
    const name = e.currentTarget.dataset.name;
    console.log("跳转到", name);
    wx.showToast({ title: `${name} 待接入`, icon: "none" });
  },

  handleLogout() {
    wx.showModal({
      title: "提示",
      content: "确定退出登录吗？",
      confirmColor: "#FF4D4F",
      success: (res) => {
        if (res.confirm) {
          console.log("退出登录");
          // TODO: POST /api/user/logout
          wx.showToast({ title: "已退出登录", icon: "none" });
        }
      }
    });
  },
});
