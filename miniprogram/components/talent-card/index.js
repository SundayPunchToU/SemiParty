Component({
  properties: {
    item: {
      type: Object,
      value: null,
      observer(value) {
        if (!value) {
          return;
        }

        let statusClass = "tag-orange";
        if (value.status === "主动求职") {
          statusClass = "tag-blue";
        } else if (value.status === "在看机会") {
          statusClass = "tag-green";
        }

        this.setData({ statusClass });
      }
    },
    loading: {
      type: Boolean,
      value: false
    }
  },
  data: {
    statusClass: "tag-orange"
  },
  methods: {
    handleTap() {
      this.triggerEvent("cardtap", { id: this.properties.item.id });
    },
    handleContact() {
      if (this.properties.loading) {
        return;
      }
      this.triggerEvent("contact", { id: this.properties.item.id });
    }
  }
});
