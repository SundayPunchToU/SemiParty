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

        const app = getApp();
        const openid = (app && app.globalData && app.globalData.openid) || "";
        const likedOpenids = value.likedOpenids || [];
        const liked = openid ? likedOpenids.includes(openid) : false;

        this.setData({
          relativeTime: formatRelative(value.createdAt),
          likeCount: value.likes || value.likeCount || 0,
          liked,
          topicText: value.topicName || value.zoneName || (value.topic && value.topic.text) || "",
        });
      },
    },
  },

  data: {
    relativeTime: "",
    likeCount: 0,
    liked: false,
    topicText: "",
  },

  methods: {
    handleTap() {
      this.triggerEvent("cardtap", { id: this.properties.item.id });
    },

    handleLike() {
      const liked = !this.data.liked;
      const baseLikes = this.properties.item.likes || this.properties.item.likeCount || 0;
      const app = getApp();
      const openid = (app && app.globalData && app.globalData.openid) || "";
      const likedOpenids = this.properties.item.likedOpenids || [];
      const wasLiked = openid ? likedOpenids.includes(openid) : false;
      let likeCount = baseLikes;

      if (liked) {
        likeCount = wasLiked ? baseLikes : baseLikes + 1;
      } else {
        likeCount = wasLiked ? baseLikes - 1 : baseLikes;
      }

      this.setData({
        liked,
        likeCount: Math.max(0, likeCount),
      });
      this.triggerEvent("like", { id: this.properties.item.id, liked });
    },

    handleComment() {
      this.triggerEvent("comment", { id: this.properties.item.id });
    },

    handleShare() {
      this.triggerEvent("share", { id: this.properties.item.id });
    },
  },
});
