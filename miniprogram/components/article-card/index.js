const { formatRelative } = require("../../utils/util");

Component({
  properties: {
    item: {
      type: Object,
      value: null,
      observer(value) {
        if (!value) return;
        this.setData({ relativeTime: formatRelative(value.time) });
      }
    }
  },
  data: {
    relativeTime: ""
  },
  methods: {
    handleTap() {
      this.triggerEvent("cardtap", { id: this.properties.item.id });
    }
  }
});
