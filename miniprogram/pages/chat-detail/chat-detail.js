const api = require("../../utils/api");
const { formatChatTime, getNavMetrics } = require("../../utils/util");

Page({
  data: {
    statusBarHeight: 24,
    navBarHeight: 44,
    chatId: "",
    title: "聊天",
    currentUid: "",
    messages: [],
    lastMessageId: "",
    inputValue: "",
    loading: false,
    sending: false,
    watchHandler: null,
  },

  async onLoad(options) {
    const chatId = options.chatId || "";
    this.setData({
      ...getNavMetrics(),
      chatId,
      title: decodeURIComponent(options.title || "聊天"),
    });

    if (!chatId) {
      wx.showToast({ title: "缺少 chatId", icon: "none" });
      setTimeout(() => this.goBack(), 300);
      return;
    }

    try {
      const loginResult = await api.login();
      this.setData({
        currentUid: loginResult.openid || getApp().globalData.openid || "",
      });
      await this.loadMessages();
      await api.markChatRead(chatId);
      this.bindWatch();
    } catch (error) {
      console.error("chat detail init failed", error);
      wx.showToast({
        title: error.message || "聊天初始化失败",
        icon: "none",
      });
    }
  },

  onUnload() {
    if (this.data.watchHandler && this.data.watchHandler.close) {
      this.data.watchHandler.close();
    }
  },

  async loadMessages() {
    this.setData({ loading: true });
    try {
      const result = await api.getMessages(this.data.chatId);
      const messages = (result.data || []).map((item) => ({
        ...item,
        displayTime: formatChatTime(item.createdAt),
        isMine: item.senderUid === this.data.currentUid,
      }));
      this.setData({
        messages,
        lastMessageId: messages.length ? `msg_${messages[messages.length - 1].id}` : "",
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false });
      throw error;
    }
  },

  bindWatch() {
    try {
      const watchHandler = api.watchMessages(this.data.chatId, (docs) => {
        const messages = (docs || []).map((item) => ({
          ...item,
          displayTime: formatChatTime(item.createdAt),
          isMine: item.senderUid === this.data.currentUid,
        }));
        this.setData({
          messages,
          lastMessageId: messages.length ? `msg_${messages[messages.length - 1].id}` : "",
        });
      });
      this.setData({ watchHandler });
    } catch (error) {
      console.warn("bindWatch failed", error);
    }
  },

  handleInput(event) {
    this.setData({
      inputValue: event.detail.value,
    });
  },

  async handleSend() {
    const content = this.data.inputValue.trim();
    if (!content || this.data.sending) {
      if (!content) {
        wx.showToast({ title: "不能发送空消息", icon: "none" });
      }
      return;
    }

    this.setData({ sending: true });
    try {
      await api.sendMessage(this.data.chatId, content, "text");
      this.setData({
        inputValue: "",
        sending: false,
      });
      await this.loadMessages();
      await api.markChatRead(this.data.chatId);
    } catch (error) {
      console.error("send message failed", error);
      this.setData({ sending: false });
      wx.showToast({
        title: error.message || "发送失败",
        icon: "none",
      });
    }
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: "/pages/message/message" });
      },
    });
  },
});
