Component({
  properties: {
    item: {
      type: Object,
      value: null
    },
    loading: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent("cardtap", { id: this.properties.item.id });
    },
    handleApply() {
      if (this.properties.loading) {
        return;
      }
      this.triggerEvent("apply", { id: this.properties.item.id });
    }
  }
});
