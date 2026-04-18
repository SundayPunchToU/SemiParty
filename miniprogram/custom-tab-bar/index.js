// === STEP 1.1 新增：自定义 TabBar 组件 ===
// === STEP 2.4 增强：新增中央凸起发帖按钮 + 发帖入口面板 ===
Component({
  data: {
    selected: 0,
    color: "#9B988F",
    selectedColor: "#2A7FFF",
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
        showRedDot: false
      },
      {
        pagePath: "/pages/message/message",
        text: "消息",
        iconPath: "/images/icons/examples.png",
        selectedIconPath: "/images/icons/examples-active.png",
        unreadCount: 0
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        iconPath: "/images/icons/usercenter.png",
        selectedIconPath: "/images/icons/usercenter-active.png"
      }
    ],
    showPostPanel: false,
    postCards: [
      { icon: "☕", title: "去茶水间唠唠", subtitle: "匿名闲聊·轻松", action: "tea-room" },
      { icon: "📝", title: "发帖到专区", subtitle: "选个圈子聊聊", action: "zone" },
      { icon: "📄", title: "写文章", subtitle: "深度分享·长文", action: "article" },
      { icon: "❓", title: "提个问题", subtitle: "求助大佬解惑", action: "qa" },
    ],
  },

  // === STEP 1.1 修改开始：角标和小红点状态管理 ===
  lifetimes: {
    attached() {
      this.setData({
        "list[1].showRedDot": true,
        "list[2].unreadCount": 5
      });
    }
  },
  // === STEP 1.1 修改结束 ===

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
    },

    // ── 中央发帖按钮 ──
    onCenterBtnTap() {
      this.setData({ showPostPanel: true });
    },

    closePostPanel() {
      this.setData({ showPostPanel: false });
    },

    onPostCardTap(e) {
      const action = e.currentTarget.dataset.action;
      this.setData({ showPostPanel: false });
      switch (action) {
        case "tea-room":
          wx.navigateTo({ url: "/pages/post-create/post-create?zoneId=tea-room&isAnonymous=true" });
          break;
        case "zone":
          wx.navigateTo({ url: "/pages/post-create/post-create?showZonePicker=true" });
          break;
        case "article":
          wx.navigateTo({ url: "/pages/post-create/post-create?contentType=article" });
          break;
        case "qa":
          wx.navigateTo({ url: "/pages/post-create/post-create?contentType=qa" });
          break;
      }
    },

    onOverlayTap() {
      this.setData({ showPostPanel: false });
    },

    preventBubble() {},
  }
});
