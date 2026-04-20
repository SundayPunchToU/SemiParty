const api = require("../../utils/api");
const { messageTabs } = require("../../utils/constants");
const { getNavMetrics } = require("../../utils/util");

let interactionMock = {};
try {
  interactionMock = require("../../utils/mock-interaction-data");
} catch (error) {
  console.warn("mock interaction data unavailable", error);
}

const {
  interactionMessages = [],
  privateChatList = [],
  systemNotifications = [],
} = interactionMock;

const NOTIF_STYLE_MAP = {
  announcement: { emoji: "公", bg: "#3B82F6" },
  audit: { emoji: "审", bg: "#F59E0B" },
  activity: { emoji: "活", bg: "#10B981" },
  system: { emoji: "系", bg: "#6B7280" },
};

const BTN_W = 128;
const SWIPE_W_3 = BTN_W * 3;
const SWIPE_W_2 = BTN_W * 2;

function sortPinnedFirst(list = []) {
  return [...list].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
}

function mapPrivateChatItem(item = {}) {
  const nickname = item.name || item.user?.nickname || item.user?.nickName || "会话";
  return {
    chatId: item.chatId || item.id || "",
    user: {
      nickname,
      role: item.role || item.user?.role || "",
    },
    lastMessage: item.lastMessage || "暂无消息",
    lastMessageTime: item.time || item.lastMessageTime || "",
    unreadCount: Number(item.unreadCount || item.unread || 0),
    isPinned: Boolean(item.isPinned),
  };
}

function mapNotificationItem(item = {}) {
  const type = item.type || "system";
  const config = NOTIF_STYLE_MAP[type] || NOTIF_STYLE_MAP.system;
  const unreadCount = Number(item.unreadCount || item.unread || 0);
  return {
    id: item.id || item.chatId || "",
    type,
    title: item.title || item.name || "系统通知",
    content: item.content || item.lastMessage || "暂无通知",
    time: item.time || "",
    isRead: item.isRead !== undefined ? !!item.isRead : unreadCount === 0,
    typeEmoji: config.emoji,
    typeBg: config.bg,
  };
}

Page({
  data: {
    statusBarHeight: 24,
    tabs: messageTabs,
    activeTab: "interaction",
    interactionList: [],
    privateList: [],
    notificationList: [],
    swipeOpenId: "",
    swipeXMap: {},
  },

  onLoad() {
    this.setData(getNavMetrics());
    this.initMockLists();
    this.loadRemoteLists();
  },

  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    this.updateTabBarBadge();
    this.loadRemoteLists();
  },

  initMockLists() {
    this.setData({
      interactionList: interactionMessages.map((item) => ({
        ...item,
        isRead: !!item.isRead,
        isPinned: !!item.isPinned,
      })),
      privateList: sortPinnedFirst(privateChatList.map(mapPrivateChatItem)),
      notificationList: systemNotifications.map(mapNotificationItem),
    });
  },

  async loadRemoteLists() {
    try {
      const [privateRes, systemRes] = await Promise.all([
        api.getChatList("private"),
        api.getChatList("system"),
      ]);

      const nextData = {};
      const realPrivate = (privateRes.data || []).map(mapPrivateChatItem).filter((item) => item.chatId);
      const realSystem = (systemRes.data || []).map(mapNotificationItem).filter((item) => item.id);

      if (realPrivate.length) {
        nextData.privateList = sortPinnedFirst(realPrivate);
      }
      if (realSystem.length) {
        nextData.notificationList = realSystem;
      }

      if (Object.keys(nextData).length) {
        this.setData(nextData);
      }
    } catch (error) {
      console.warn("loadRemoteLists failed", error);
    } finally {
      this.updateTabBarBadge();
    }
  },

  updateTabBarBadge() {
    if (typeof this.getTabBar !== "function" || !this.getTabBar()) {
      return;
    }
    const privateUnread = this.data.privateList.reduce((sum, item) => sum + (item.unreadCount || 0), 0);
    this.getTabBar().setData({ "list[2].unreadCount": privateUnread });
  },

  handleTabChange(event) {
    const nextTab = event.currentTarget.dataset.key;
    if (!nextTab || nextTab === this.data.activeTab) {
      return;
    }
    this.closeSwipe();
    this.setData({ activeTab: nextTab });
  },

  getListKey() {
    const map = {
      interaction: "interactionList",
      private: "privateList",
      system: "notificationList",
    };
    return map[this.data.activeTab] || "";
  },

  getSwipeWidth() {
    return this.data.activeTab === "system" ? SWIPE_W_2 : SWIPE_W_3;
  },

  getItemId(item) {
    return item.chatId || item.id || "";
  },

  isItemRead(item) {
    if (this.data.activeTab === "private") {
      return Number(item.unreadCount || 0) === 0;
    }
    return !!item.isRead;
  },

  closeSwipe() {
    const openId = this.data.swipeOpenId;
    if (!openId) {
      return;
    }
    this.setData({
      swipeOpenId: "",
      [`swipeXMap.${openId}`]: 0,
    });
  },

  onTouchStart(event) {
    const itemId = event.currentTarget.dataset.id;
    const touch = event.touches[0];
    this._swipeState = {
      itemId,
      startX: touch.clientX,
      startY: touch.clientY,
      moved: false,
    };
  },

  onTouchMove(event) {
    if (!this._swipeState) {
      return;
    }
    const touch = event.touches[0];
    const dx = touch.clientX - this._swipeState.startX;
    const dy = touch.clientY - this._swipeState.startY;
    if (Math.abs(dy) > Math.abs(dx) && !this._swipeState.moved) {
      return;
    }
    this._swipeState.moved = true;
    const maxW = this.getSwipeWidth();
    let nextX = dx;
    if (nextX > 0) {
      nextX = 0;
    }
    if (nextX < -maxW) {
      nextX = -maxW;
    }
    this.setData({ [`swipeXMap.${this._swipeState.itemId}`]: nextX });
  },

  onTouchEnd() {
    if (!this._swipeState) {
      return;
    }
    const state = this._swipeState;
    this._swipeState = null;
    if (!state.moved) {
      this.closeSwipe();
      return;
    }

    const itemId = state.itemId;
    const currentX = this.data.swipeXMap[itemId] || 0;
    const openId = this.data.swipeOpenId;
    const maxW = this.getSwipeWidth();
    const nextData = {};

    if (Math.abs(currentX) > maxW * 0.3) {
      if (openId && openId !== itemId) {
        nextData[`swipeXMap.${openId}`] = 0;
      }
      nextData[`swipeXMap.${itemId}`] = -maxW;
      nextData.swipeOpenId = itemId;
    } else {
      nextData[`swipeXMap.${itemId}`] = 0;
      if (openId === itemId) {
        nextData.swipeOpenId = "";
      }
    }

    this.setData(nextData);
  },

  onInteractionTap(event) {
    if (this.data.swipeOpenId) {
      this.closeSwipe();
      return;
    }
    const title = event.currentTarget.dataset.title || "";
    if (title) {
      wx.navigateTo({ url: `/pages/search/search?keyword=${encodeURIComponent(title)}` });
    }
  },

  onPrivateTap(event) {
    if (this.data.swipeOpenId) {
      this.closeSwipe();
      return;
    }
    const chatId = event.currentTarget.dataset.chatid;
    const title = event.currentTarget.dataset.name || "会话";
    if (!chatId) {
      return;
    }
    wx.navigateTo({
      url: `/pages/chat-detail/chat-detail?chatId=${chatId}&title=${encodeURIComponent(title)}`,
    });
  },

  onNotifTap(event) {
    if (this.data.swipeOpenId) {
      this.closeSwipe();
      return;
    }
    const notifId = event.currentTarget.dataset.notifid;
    const list = this.data.notificationList;
    const index = list.findIndex((item) => item.id === notifId);
    if (index === -1) {
      return;
    }
    this.setData({ [`notificationList[${index}].isRead`]: true });
  },

  onLongPressItem(event) {
    const itemId = event.currentTarget.dataset.id;
    if (!itemId) {
      return;
    }
    this.closeSwipe();
    this.showActionSheet(itemId);
  },

  showActionSheet(itemId) {
    const listKey = this.getListKey();
    const list = this.data[listKey];
    const item = list.find((entry) => this.getItemId(entry) === itemId);
    if (!item) {
      return;
    }

    const actions = [];
    if (this.data.activeTab !== "system") {
      actions.push(item.isPinned ? "取消置顶" : "置顶");
    }
    actions.push(this.isItemRead(item) ? "标为未读" : "标为已读");
    actions.push("删除");

    wx.showActionSheet({
      itemList: actions,
      success: (result) => {
        const tapIndex = result.tapIndex;
        const hasPin = this.data.activeTab !== "system";
        if (hasPin && tapIndex === 0) {
          this.togglePin(itemId);
          return;
        }
        if ((hasPin && tapIndex === 1) || (!hasPin && tapIndex === 0)) {
          if (this.isItemRead(item)) {
            this.markUnread(itemId);
          } else {
            this.markRead(itemId);
          }
          return;
        }
        this.deleteItem(itemId);
      },
    });
  },

  markRead(itemId) {
    const listKey = this.getListKey();
    const list = this.data[listKey];
    const index = list.findIndex((item) => this.getItemId(item) === itemId);
    if (index === -1) {
      return;
    }
    if (this.data.activeTab === "private") {
      this.setData({ [`${listKey}[${index}].unreadCount`]: 0 });
    } else {
      this.setData({ [`${listKey}[${index}].isRead`]: true });
    }
    this.closeSwipe();
    this.updateTabBarBadge();
  },

  markUnread(itemId) {
    const listKey = this.getListKey();
    const list = this.data[listKey];
    const index = list.findIndex((item) => this.getItemId(item) === itemId);
    if (index === -1) {
      return;
    }
    if (this.data.activeTab === "private") {
      this.setData({ [`${listKey}[${index}].unreadCount`]: 1 });
    } else {
      this.setData({ [`${listKey}[${index}].isRead`]: false });
    }
    this.closeSwipe();
    this.updateTabBarBadge();
  },

  togglePin(itemId) {
    const listKey = this.getListKey();
    const list = this.data[listKey];
    const nextList = sortPinnedFirst(
      list.map((item) =>
        this.getItemId(item) === itemId
          ? { ...item, isPinned: !item.isPinned }
          : item
      )
    );
    this.setData({
      [listKey]: nextList,
      swipeOpenId: "",
      [`swipeXMap.${itemId}`]: 0,
    });
  },

  deleteItem(itemId) {
    const listKey = this.getListKey();
    this.setData({
      [listKey]: this.data[listKey].filter((item) => this.getItemId(item) !== itemId),
      swipeOpenId: "",
      [`swipeXMap.${itemId}`]: 0,
    });
    this.updateTabBarBadge();
  },

  onSwipeBtnTap(event) {
    const action = event.currentTarget.dataset.action;
    const itemId = event.currentTarget.dataset.id;
    if (!itemId) {
      return;
    }
    if (action === "read") {
      const list = this.data[this.getListKey()];
      const item = list.find((entry) => this.getItemId(entry) === itemId);
      if (!item) {
        return;
      }
      if (this.isItemRead(item)) {
        this.markUnread(itemId);
      } else {
        this.markRead(itemId);
      }
      return;
    }
    if (action === "pin") {
      this.togglePin(itemId);
      return;
    }
    if (action === "delete") {
      this.deleteItem(itemId);
    }
  },
});
