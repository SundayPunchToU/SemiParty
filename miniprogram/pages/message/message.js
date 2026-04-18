const api = require("../../utils/api");
const { messageTabs } = require("../../utils/constants");
const { getNavMetrics } = require("../../utils/util");
// === STEP 1.6 修改开始：引入互动 mock 数据 ===
const { interactionMessages } = require("../../utils/mock-interaction-data");
// === STEP 1.6 修改结束 ===
// === STEP 1.6 增强 修改开始：引入私聊/群组/通知 mock 数据 ===
const { privateChatList, groupChatList, systemNotifications } = require("../../utils/mock-interaction-data");
// === STEP 1.6 增强 修改结束 ===

// === STEP 1.6 增强 修改开始：通知类型图标映射 ===
const notifTypeConfig = {
  announcement: { emoji: "📢", bg: "#1E3A5F" },
  zone: { emoji: "🏠", bg: "#1A5F3E" },
  audit: { emoji: "✅", bg: "#5F4A1A" },
  activity: { emoji: "🎉", bg: "#3E1A5F" },
  system: { emoji: "⚙️", bg: "#3A3A3A" },
};
// === STEP 1.6 增强 修改结束 ===

// === STEP 1.6 增强 II 修改开始：左滑按钮配置 ===
// 3 按钮模式：标为已读/未读 + 置顶/取消 + 删除
const BTN_W = 128; // 每个按钮 64dp = 128rpx
const SWIPE_W_3 = BTN_W * 3; // 384rpx
const SWIPE_W_2 = BTN_W * 2; // 256rpx
// === STEP 1.6 增强 II 修改结束 ===

Page({
  data: {
    statusBarHeight: 24,
    brandName: "芯圈 SemiParty",
    tabs: messageTabs,
    // === STEP 1.6 修改开始：默认选中互动 Tab ===
    activeTab: "interaction",
    interactionList: interactionMessages,
    // === STEP 1.6 修改结束 ===
    // === STEP 1.6 增强 修改开始：私聊/群组/通知列表数据 ===
    privateList: [],
    groupList: [],
    notificationList: [],
    // === STEP 1.6 增强 修改结束 ===
    // === STEP 1.6 增强 II 修改开始：左滑状态 ===
    swipeOpenId: "",       // 当前展开左滑菜单的 item id
    swipeXMap: {},         // { itemId: translateX } 动态偏移量
    // === STEP 1.6 增强 II 修改结束 ===
    chatList: []
  },

  onLoad() {
    this.setData({
      ...getNavMetrics()
    });
    // === STEP 1.6 增强 修改开始：用 mock 数据初始化列表 ===
    this._initMockLists();
    this._updateTabBarBadge();
    // === STEP 1.6 增强 修改结束 ===
  },

  onShow() {
    // === STEP 1.1 修改开始：同步自定义 TabBar 选中状态 ===
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    // === STEP 1.1 修改结束 ===
    // === STEP 1.6 增强 修改开始：刷新角标 ===
    this._updateTabBarBadge();
    // === STEP 1.6 增强 修改结束 ===
  },

  // === STEP 1.6 增强 修改开始：mock 数据初始化 + 置顶排序 ===
  _initMockLists() {
    const sortedPrivate = [...privateChatList].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    const sortedGroup = [...groupChatList].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    const notifList = systemNotifications.map(n => ({
      ...n,
      typeEmoji: notifTypeConfig[n.type] ? notifTypeConfig[n.type].emoji : "⚙️",
      typeBg: notifTypeConfig[n.type] ? notifTypeConfig[n.type].bg : "#3A3A3A",
    }));
    // === STEP 1.6 增强 II 修改开始：互动列表追加 isRead/isPinned 字段 ===
    const interactionList = interactionMessages.map(item => ({
      ...item,
      isRead: false,
      isPinned: false,
    }));
    // === STEP 1.6 增强 II 修改结束 ===
    this.setData({
      privateList: sortedPrivate,
      groupList: sortedGroup,
      notificationList: notifList,
      interactionList: interactionList,
    });
  },

  _updateTabBarBadge() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      const privateUnread = this.data.privateList.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      const groupUnread = this.data.groupList.reduce((sum, g) => sum + (g.unreadCount || 0), 0);
      const total = privateUnread + groupUnread;
      this.getTabBar().setData({ "list[2].unreadCount": total });
    }
  },
  // === STEP 1.6 增强 修改结束 ===

  // === STEP 1.6 增强 II 修改开始：左滑手势处理 ===

  // 获取当前 Tab 对应的列表名
  _getListKey() {
    const tab = this.data.activeTab;
    const map = { private: "privateList", group: "groupList", interaction: "interactionList", system: "notificationList" };
    return map[tab] || "";
  },

  // 获取当前 Tab 的按钮宽度
  _getSwipeWidth() {
    return this.data.activeTab === "system" ? SWIPE_W_2 : SWIPE_W_3;
  },

  // 关闭当前展开的左滑菜单
  _closeSwipe() {
    const openId = this.data.swipeOpenId;
    if (!openId) return;
    const mapKey = {};
    mapKey[`swipeXMap.${openId}`] = 0;
    this.setData({ swipeOpenId: "", ...mapKey });
  },

  _handleTouchStart(e) {
    const itemId = e.currentTarget.dataset.id;
    const touch = e.touches[0];
    this._swipeState = { itemId, startX: touch.clientX, startY: touch.clientY, moved: false };
  },

  _handleTouchMove(e) {
    if (!this._swipeState) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this._swipeState.startX;
    const dy = touch.clientY - this._swipeState.startY;

    // 竖向滑动不处理
    if (Math.abs(dy) > Math.abs(dx) && !this._swipeState.moved) return;
    this._swipeState.moved = true;

    // 阻止冒泡，防止页面滚动
    if (Math.abs(dx) > 10) {
      // 只阻止水平滑动时的页面滚动
    }

    const maxW = this._getSwipeWidth();
    let x = dx;
    // 限制范围
    if (x > 0) x = 0;
    if (x < -maxW) x = -maxW;

    const mapKey = {};
    mapKey[`swipeXMap.${this._swipeState.itemId}`] = x;
    this.setData(mapKey);
  },

  _handleTouchEnd(e) {
    if (!this._swipeState) return;
    const state = this._swipeState;
    this._swipeState = null;
    if (!state.moved) {
      // 没有真正移动，视为点击
      this._closeSwipe();
      return;
    }

    const openId = this.data.swipeOpenId;
    const currentX = this.data.swipeXMap[state.itemId] || 0;
    const maxW = this._getSwipeWidth();
    const mapKey = {};

    if (state.itemId === openId) {
      // 当前展开项，如果滑回去就关闭
      if (currentX > -maxW * 0.3) {
        mapKey[`swipeXMap.${state.itemId}`] = 0;
        mapKey.swipeOpenId = "";
      }
    } else {
      // 新的项
      if (Math.abs(currentX) > maxW * 0.3) {
        // 先关闭旧的
        if (openId) {
          mapKey[`swipeXMap.${openId}`] = 0;
        }
        mapKey[`swipeXMap.${state.itemId}`] = -maxW;
        mapKey.swipeOpenId = state.itemId;
      } else {
        mapKey[`swipeXMap.${state.itemId}`] = 0;
      }
    }
    this.setData(mapKey);
  },

  // 点击主内容区关闭左滑
  _onSwipeContentTap(e) {
    // 如果有展开的菜单，点击时先关闭
    if (this.data.swipeOpenId) {
      this._closeSwipe();
      return;
    }
  },
  // === STEP 1.6 增强 II 修改结束 ===

  async loadChats() {
    try {
      const result = await api.getChatList(this.data.activeTab);
      this.setData({
        chatList: result.data
      });
    } catch (error) {
      console.error("loadChats failed", error);
      wx.showToast({ title: "会话加载失败", icon: "none" });
    }
  },

  async handleTabChange(event) {
    const nextTab = event.currentTarget.dataset.key;
    if (nextTab === this.data.activeTab) {
      return;
    }
    // === STEP 1.6 增强 II 修改开始：切换 Tab 时关闭左滑菜单 ===
    this._closeSwipe();
    // === STEP 1.6 增强 II 修改结束 ===
    this.setData({ activeTab: nextTab });
  },

  openChat(event) {
    const item = event.detail.item;
    if (!item || !item.id) {
      wx.showToast({ title: "会话信息异常", icon: "none" });
      return;
    }

    wx.navigateTo({
      url: `/pages/chat-detail/chat-detail?chatId=${item.id}&title=${encodeURIComponent(item.name || "会话")}`
    });
  },

  // === STEP 1.6 修改开始：互动消息点击事件 ===
  onInteractionTap(event) {
    const targetTitle = event.currentTarget.dataset.title;
    console.log("跳转到帖子", targetTitle);
  },
  // === STEP 1.6 修改结束 ===

  // === STEP 1.6 增强 修改开始：私聊点击 ===
  onPrivateTap(event) {
    const chatId = event.currentTarget.dataset.chatid;
    console.log("打开私聊", chatId);
  },
  // === STEP 1.6 增强 修改结束 ===

  // === STEP 1.6 增强 修改开始：群组点击 ===
  onGroupTap(event) {
    const groupId = event.currentTarget.dataset.groupid;
    console.log("打开群组", groupId);
  },
  // === STEP 1.6 增强 修改结束 ===

  // === STEP 1.6 增强 修改开始：通知点击标记已读 ===
  onNotifTap(event) {
    const notifId = event.currentTarget.dataset.notifid;
    const list = this.data.notificationList;
    const index = list.findIndex(n => n.id === notifId);
    if (index === -1) return;
    if (list[index].isRead) return;
    const key = `notificationList[${index}].isRead`;
    this.setData({ [key]: true });
  },
  // === STEP 1.6 增强 修改结束 ===

  // === STEP 1.6 增强 II 修改开始：长按操作菜单 ===

  _showActionSheet(itemId) {
    const tab = this.data.activeTab;
    const listKey = this._getListKey();
    const list = this.data[listKey];
    const item = list.find(i => this._getItemId(i) === itemId);
    if (!item) return;

    const isRead = this._isItemRead(item);
    const isPinned = item.isPinned || false;
    const hasPin = tab !== "system";

    const itemList = [];
    if (hasPin) {
      itemList.push(isPinned ? "📌 取消置顶" : "📌 置顶");
    }
    itemList.push(isRead ? "✉️ 标为未读" : "✉️ 标为已读");
    itemList.push("🗑️ 删除");

    const that = this;
    wx.showActionSheet({
      itemList: itemList,
      itemColor: "#ffffff",
      success(res) {
        const tapIndex = res.tapIndex;
        // 调整 tapIndex 以匹配功能
        let actionIndex = tapIndex;
        if (hasPin && actionIndex === 0) {
          that._doTogglePin(itemId);
        } else if ((!hasPin && actionIndex === 0) || (hasPin && actionIndex === 1)) {
          if (isRead) {
            that._doMarkUnread(itemId);
          } else {
            that._doMarkRead(itemId);
          }
        } else {
          that._doDelete(itemId);
        }
      }
    });
  },

  onLongPressItem(event) {
    const itemId = event.currentTarget.dataset.id;
    this._closeSwipe();
    this._showActionSheet(itemId);
  },
  // === STEP 1.6 增强 II 修改结束 ===

  // === STEP 1.6 增强 II 修改开始：操作方法（左滑按钮 + 长按菜单复用） ===

  _getItemId(item) {
    return item.chatId || item.groupId || item.id || "";
  },

  _isItemRead(item) {
    const tab = this.data.activeTab;
    if (tab === "system") return item.isRead;
    if (tab === "interaction") return item.isRead;
    return (item.unreadCount || 0) === 0;
  },

  _doMarkRead(itemId) {
    const tab = this.data.activeTab;
    const listKey = this._getListKey();
    const list = this.data[listKey];
    const index = list.findIndex(i => this._getItemId(i) === itemId);
    if (index === -1) return;

    const mapKey = {};
    if (tab === "system") {
      mapKey[`${listKey}[${index}].isRead`] = true;
    } else if (tab === "interaction") {
      mapKey[`${listKey}[${index}].isRead`] = true;
    } else {
      mapKey[`${listKey}[${index}].unreadCount`] = 0;
    }
    this.setData({ ...mapKey, swipeOpenId: "", [`swipeXMap.${itemId}`]: 0 });
    this._updateTabBarBadge();
    wx.showToast({ title: "已标为已读", icon: "none" });
  },

  _doMarkUnread(itemId) {
    const tab = this.data.activeTab;
    const listKey = this._getListKey();
    const list = this.data[listKey];
    const index = list.findIndex(i => this._getItemId(i) === itemId);
    if (index === -1) return;

    const mapKey = {};
    if (tab === "system") {
      mapKey[`${listKey}[${index}].isRead`] = false;
    } else if (tab === "interaction") {
      mapKey[`${listKey}[${index}].isRead`] = false;
    } else {
      mapKey[`${listKey}[${index}].unreadCount`] = 1;
    }
    this.setData({ ...mapKey, swipeOpenId: "", [`swipeXMap.${itemId}`]: 0 });
    this._updateTabBarBadge();
    wx.showToast({ title: "已标为未读", icon: "none" });
  },

  _doTogglePin(itemId) {
    const listKey = this._getListKey();
    const list = this.data[listKey];
    const index = list.findIndex(i => this._getItemId(i) === itemId);
    if (index === -1) return;

    const newPinned = !list[index].isPinned;
    this.setData({ [`${listKey}[${index}].isPinned`]: newPinned });

    // 重新排序：置顶在前
    const tab = this.data.activeTab;
    const sortKey = tab === "interaction" ? "interactionList" : (tab === "private" ? "privateList" : "groupList");
    const sorted = [...this.data[sortKey]].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    this.setData({ [sortKey]: sorted, swipeOpenId: "", [`swipeXMap.${itemId}`]: 0 });
    wx.showToast({ title: newPinned ? "已置顶" : "已取消置顶", icon: "none" });
  },

  _doDelete(itemId) {
    const tab = this.data.activeTab;
    const confirmText = tab === "system" ? "确定删除该通知？" : "确定删除该对话？";

    wx.showModal({
      title: "提示",
      content: confirmText,
      confirmColor: "#E84040",
      success: (res) => {
        if (!res.confirm) return;
        const listKey = this._getListKey();
        const list = this.data[listKey].filter(i => this._getItemId(i) !== itemId);
        this.setData({
          [listKey]: list,
          swipeOpenId: "",
          [`swipeXMap.${itemId}`]: 0,
        });
        this._updateTabBarBadge();
        wx.showToast({ title: "已删除", icon: "none" });
      }
    });
  },

  // 左滑按钮点击事件
  onSwipeBtnTap(event) {
    const action = event.currentTarget.dataset.action;
    const itemId = event.currentTarget.dataset.id;
    switch (action) {
      case "read": {
        const listKey = this._getListKey();
        const list = this.data[listKey];
        const item = list.find(i => this._getItemId(i) === itemId);
        if (!item) return;
        if (this._isItemRead(item)) {
          this._doMarkUnread(itemId);
        } else {
          this._doMarkRead(itemId);
        }
        break;
      }
      case "pin":
        this._doTogglePin(itemId);
        break;
      case "delete":
        this._doDelete(itemId);
        break;
    }
  },
  // === STEP 1.6 增强 II 修改结束 ===
});
