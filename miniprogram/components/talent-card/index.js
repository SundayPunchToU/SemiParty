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
    }
  },
  data: {
    statusClass: "tag-orange"
  },
  methods: {
    handleContact() {
      this.triggerEvent("contact", { id: this.properties.item.id });
    }
  }
});
