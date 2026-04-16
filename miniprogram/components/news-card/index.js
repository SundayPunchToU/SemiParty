const { formatCount, formatRelative } = require("../../utils/util");

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
          viewCount: formatCount(value.views || 0),
          relativeTime: formatRelative(value.time)
        });
      }
    }
  },
  data: {
    viewCount: "0",
    relativeTime: ""
  },
  methods: {
    handleTap() {
      this.triggerEvent("cardtap", { id: this.properties.item.id });
    }
  }
});
