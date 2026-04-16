Component({
  properties: {
    item: {
      type: Object,
      value: null
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent("itemtap", { id: this.properties.item.id });
    }
  }
});
