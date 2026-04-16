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

        this.setData({
          relativeTime: formatRelative(value.createdAt),
          likeCount: value.likes || 0,
          liked: false
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
      this.setData({
        liked,
        likeCount: this.properties.item.likes + (liked ? 1 : 0)
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
