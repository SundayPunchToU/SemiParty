Component({
  properties: {
    placeholder: {
      type: String,
      value: "搜索"
    },
    value: {
      type: String,
      value: ""
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent("searchtap");
    },
    handleInput(event) {
      this.triggerEvent("change", { value: event.detail.value });
    }
  }
});
