Component({
  properties: {
    item: {
      type: Object,
      value: null
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent("cardtap", { id: this.properties.item.id });
    },
    handleApply() {
      this.triggerEvent("apply", { id: this.properties.item.id });
    }
  }
});
