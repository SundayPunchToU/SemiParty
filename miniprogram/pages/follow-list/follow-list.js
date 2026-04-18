const { getNavMetrics } = require("../../utils/util");
const { myFollowing, myFollowers } = require("../../mock/profileData");

// TODO: GET /api/user/follow?type=following|followers&page=
Page({
  data: {
    statusBarHeight: 24,
    activeType: "following",
    followingList: [],
    followerList: [],
  },

  onLoad(options) {
    const type = options.type || "following";
    this.setData({
      ...getNavMetrics(),
      activeType: type,
      followingList: myFollowing.map(u => ({ ...u, _followed: true })),
      followerList: myFollowers.map(u => ({ ...u, _followed: u.isFollowedBack })),
    });
  },

  onTabChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ activeType: type });
  },

  onUserTap(e) {
    console.log("查看用户主页", e.currentTarget.dataset.id);
  },

  onToggleFollow(e) {
    // TODO: POST /api/user/follow { targetUserId }
    const { uid, index, list } = e.currentTarget.dataset;
    console.log("切换关注", uid);
    const field = `${list}List[${index}]._followed`;
    this.setData({ [field]: !this.data[list + "List"][index]._followed });
  },

  goBack() {
    wx.navigateBack();
  },
});
