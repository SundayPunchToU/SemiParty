Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/home/home",
        text: "首页",
        iconPath: "/images/icons/home.png",
        selectedIconPath: "/images/icons/home-active.png"
      },
      {
        pagePath: "/pages/community/community",
        text: "社区",
        iconPath: "/images/icons/business.png",
        selectedIconPath: "/images/icons/business-active.png",
        dot: false
      },
      {
        pagePath: "/pages/message/message",
        text: "消息",
        iconPath: "/images/icons/examples.png",
        selectedIconPath: "/images/icons/examples-active.png",
        badge: ""
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        iconPath: "/images/icons/usercenter.png",
        selectedIconPath: "/images/icons/usercenter-active.png"
      }
    ]
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.list[index];
      wx.switchTab({ url: item.pagePath });
    }
  }
});
