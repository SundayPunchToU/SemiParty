const { formatRelative } = require("../../utils/util");

Component({
  properties: {
    item: {
      type: Object,
      value: null,
      observer(value) {
        if (!value) {
          return;
        }

        // 根据 likedOpenids 判断当前用户是否已点赞
        const app = getApp();
        const openid = (app && app.globalData && app.globalData.openid) || "";
        const likedOpenids = value.likedOpenids || [];
        const liked = openid ? likedOpenids.includes(openid) : false;

        this.setData({
          relativeTime: formatRelative(value.createdAt),
          likeCount: value.likes || 0,
          liked
        });
      }
    }
  },
  data: {
    relativeTime: "",
    likeCount: 0,
    liked: false
  },
  methods: {
    handleTap() {
      this.triggerEvent("cardtap", { id: this.properties.item.id });
    },
    handleLike() {
      const liked = !this.data.liked;
      const baseLikes = this.properties.item.likes || 0;
      // 根据初始状态计算：如果原来已点赞 baseLikes 含本人，取消时 -1；如果原来未点赞，点赞时 +1
      const app = getApp();
      const openid = (app && app.globalData && app.globalData.openid) || "";
      const likedOpenids = this.properties.item.likedOpenids || [];
      const wasLiked = openid ? likedOpenids.includes(openid) : false;
      let likeCount;
      if (liked) {
        likeCount = wasLiked ? baseLikes : baseLikes + 1;
      } else {
        likeCount = wasLiked ? baseLikes - 1 : baseLikes;
      }

      this.setData({
        liked,
        likeCount: Math.max(0, likeCount)
      });
      this.triggerEvent("like", { id: this.properties.item.id, liked });
    },
    handleComment() {
      this.triggerEvent("comment", { id: this.properties.item.id });
    },
    handleShare() {
      this.triggerEvent("share", { id: this.properties.item.id });
    }
  }
});
