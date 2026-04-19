const { getNavMetrics, formatRelative } = require("../../utils/util");
const api = require("../../utils/api");
const { myProfile, myFavorites, myViewHistory, CONTENT_TYPE_MAP } = require("../../mock/profileData");

const CONTENT_TABS = [
  { key: "posts", label: "我的帖子" },
  { key: "favorites", label: "我的收藏" },
  { key: "history", label: "浏览历史" },
];

function mapTypeLabel(contentType) {
  return CONTENT_TYPE_MAP[contentType] || contentType || "动态";
}

function mapProfile(profile = {}, posts = [], favorites = []) {
  return {
    ...myProfile,
    ...profile,
    nickname: profile.nickname || profile.nickName || myProfile.nickname,
    stats: {
      ...myProfile.stats,
      ...(profile.stats || {}),
      postCount: posts.length || profile.stats?.postCount || profile.postCount || myProfile.stats.postCount,
      favoriteCount:
        favorites.length || profile.stats?.favoriteCount || profile.collectCount || myProfile.stats.favoriteCount,
    },
  };
}

function mapPostItem(item = {}) {
  return {
    ...item,
    postId: item.postId || item.id || item._id || "",
    contentTypeLabel: mapTypeLabel(item.contentType),
    createdAtText: formatRelative(item.createdAt) || item.createdAt || "",
    likeCount: Number(item.likeCount || item.likes || 0),
    commentCount: Number(item.commentCount || item.comments || 0),
    viewCount: Number(item.viewCount || item.views || 0),
  };
}

function mapFavoriteItem(item = {}) {
  const summary = item.targetSummary || {};
  return {
    ...item,
    postId: item.targetId || item.postId || "",
    title: summary.title || item.title || "未命名内容",
    topicName: summary.topicName || item.topicName || summary.zoneName || item.zoneName || "SemiParty",
    likeCount: Number(summary.likeCount || item.likeCount || 0),
    commentCount: Number(summary.commentCount || item.commentCount || 0),
    savedAt: formatRelative(item.createdAt) || item.savedAt || "刚刚",
    author: {
      nickname:
        summary.authorName ||
        summary.nickname ||
        item.author?.nickname ||
        item.author?.nickName ||
        "SemiParty 用户",
    },
  };
}

function mapHistoryItem(item = {}) {
  return {
    ...item,
    postId: item.postId || item.targetId || item.id || "",
    viewedAt: formatRelative(item.createdAt) || item.viewedAt || "刚刚",
    topicName: item.topicName || item.zoneName || "SemiParty",
  };
}

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
    loading: false,
  },

  async onLoad() {
    this.setData({ ...getNavMetrics() });
    await this.loadProfileAssets();
  },

  async onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    await this.loadProfileAssets();
  },

  async loadProfileAssets() {
    this.setData({ loading: true });
    try {
      const [profile, postsRes, favoritesRes] = await Promise.all([
        api.getUserProfile(),
        api.getMyPosts(),
        api.getFavorites({ type: "post" }),
      ]);

      const posts = (postsRes?.data || []).map(mapPostItem);
      const favorites = (favoritesRes?.data || []).map(mapFavoriteItem);
      const history = (myViewHistory || []).map(mapHistoryItem);

      this.setData({
        profile: mapProfile(profile || {}, posts, favorites),
        myPosts: posts,
        myFavorites: favorites,
        myHistory: history,
      });
    } catch (error) {
      console.error("load profile assets failed", error);
      wx.showToast({ title: error.message || "个人主页加载失败", icon: "none" });
      this._loadFallbackData();
    } finally {
      this.setData({ loading: false });
    }
  },

  _loadFallbackData() {
    const fallbackPosts = require("../../mock/profileData").myPosts || [];
    this.setData({
      profile: myProfile,
      myPosts: fallbackPosts.map(mapPostItem),
      myFavorites: [...myFavorites],
      myHistory: [...myViewHistory].map(mapHistoryItem),
    });
  },

  onTabChange(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeTab) return;
    this.setData({ activeTab: key });
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
    } else if (tab === "posts" || tab === "favorites") {
      this.setData({ activeTab: tab });
    }
  },

  onPostTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      wx.showToast({ title: "帖子信息异常", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}` });
  },

  goEditProfile() {
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
    wx.showToast({ title: "已清空本地记录", icon: "none" });
  },

  handleMenuTap(e) {
    const name = e.currentTarget.dataset.name;
    wx.showToast({ title: `${name} 待接入`, icon: "none" });
  },

  handleLogout() {
    wx.showModal({
      title: "提示",
      content: "确定退出登录吗？",
      confirmColor: "#FF4D4F",
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: "已退出登录", icon: "none" });
        }
      },
    });
  },
});
