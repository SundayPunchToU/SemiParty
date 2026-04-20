Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/home/home",
        text: "首页",
        iconPath: "/images/icons/home.png",
        selectedIconPath: "/images/icons/home-active.png",
      },
      {
        pagePath: "/pages/community/community",
        text: "社区",
        iconPath: "/images/icons/business.png",
        selectedIconPath: "/images/icons/business-active.png",
      },
      {
        pagePath: "/pages/message/message",
        text: "消息",
        iconPath: "/images/icons/examples.png",
        selectedIconPath: "/images/icons/examples-active.png",
        unreadCount: 0,
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        iconPath: "/images/icons/usercenter.png",
        selectedIconPath: "/images/icons/usercenter-active.png",
      },
    ],
    showPostPanel: false,
    postActions: [
      { action: "default", title: "发帖", subtitle: "进入统一发帖页", icon: "帖" },
      { action: "article", title: "写文章", subtitle: "长内容预填", icon: "文" },
      { action: "qa", title: "提问题", subtitle: "问答预填", icon: "问" },
    ],
  },

  lifetimes: {
    attached() {
      this.syncFromApp();
    },
  },

  pageLifetimes: {
    show() {
      this.syncFromApp(true);
    },
  },

  methods: {
    syncFromApp(refreshUnread = false) {
      const app = getApp();
      if (!app || !app.globalData) {
        return;
      }

      const summary = app.globalData.unreadSummary || {};
      this.setData({
        "list[2].unreadCount": summary.totalUnread || summary.privateUnread || 0,
      });

      if (refreshUnread && typeof app.refreshUnreadSummary === "function") {
        app.refreshUnreadSummary();
      }
    },

    switchTab(event) {
      const { path } = event.currentTarget.dataset;
      if (!path) {
        return;
      }
      this.setData({ showPostPanel: false });
      wx.switchTab({ url: path });
    },

    openPostPanel() {
      this.setData({ showPostPanel: true });
    },

    closePostPanel() {
      this.setData({ showPostPanel: false });
    },

    preventBubble() {},

    handlePostAction(event) {
      const { action } = event.currentTarget.dataset;
      this.setData({ showPostPanel: false });

      switch (action) {
        case "article":
          wx.navigateTo({ url: "/pages/post-create/post-create?contentType=article" });
          break;
        case "qa":
          wx.navigateTo({ url: "/pages/post-create/post-create?contentType=qa" });
          break;
        default:
          wx.navigateTo({ url: "/pages/post-create/post-create" });
      }
    },
  },
});
