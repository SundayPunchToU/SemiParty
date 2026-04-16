Component({
  properties: {
    list: {
      type: Array,
      value: []
    }
  },
  methods: {
    handleTap(event) {
      const index = event.currentTarget.dataset.index;
      this.triggerEvent("select", {
        item: this.properties.list[index]
      });
    }
  }
});
