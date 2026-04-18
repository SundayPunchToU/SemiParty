const api = require("../../utils/api");
const { deepClone, getNavMetrics } = require("../../utils/util");
const { myZones } = require("../../utils/mock-zone-data");

const CONTENT_TYPE_MAP = {
  discuss: { key: "discuss", label: "讨论" },
  qa: { key: "qa", label: "问答" },
  recruit: { key: "recruit", label: "招聘" },
  interview: { key: "interview", label: "面经" },
  paper: { key: "paper", label: "论文" },
  demand: { key: "demand", label: "供需" },
  project: { key: "project", label: "项目" },
  news: { key: "news", label: "资讯" },
  life: { key: "life", label: "生活" },
  inquiry: { key: "inquiry", label: "询盘" },
  chat: { key: "chat", label: "闲聊" },
};

const ZONE_TABS_MAP = {
  company: ["discuss", "qa", "recruit", "news"],
  role: ["discuss", "qa", "recruit", "news"],
  tech: ["discuss", "qa", "paper", "project"],
  campus: ["discuss", "qa", "recruit", "interview"],
  supply: ["discuss", "demand", "recruit", "news"],
  region: ["discuss", "qa", "recruit", "news"],
  special: ["chat"],
};

const MY_ZONE_LIST = [
  { zoneId: "tea-room", zoneName: "☕ 晶圆茶水间", category: "special" },
  ...myZones.map(z => ({ zoneId: z.zoneId, zoneName: z.zoneName, category: "unknown" })),
];

Page({
  data: {
    statusBarHeight: 24,
    capsuleHeight: 32,
    navCapsuleInsetRight: 16,
    // Zone selection
    selectedZone: null,
    selectedZoneName: "",
    showZonePlaceholder: true,
    showZonePicker: false,
    myZones: MY_ZONE_LIST,
    recentZones: [],
    searchKeyword: "",
    // Content type
    contentTypes: [],
    selectedContentType: "",
    isTeaRoom: false,
    // Title & content
    title: "",
    content: "",
    titlePlaceholder: "请输入标题",
    titleRequired: true,
    // Topics
    topics: [],
    topicInput: "",
    showTopicInput: false,
    maxTopics: 5,
    // Anonymous
    anonymous: false,
    // Images (preserved from original)
    images: [],
    // Publish state
    canPublish: false,
    publishing: false,
    hasContent: false,
  },

  onLoad(options) {
    const metrics = getNavMetrics();
    const zoneId = options.zoneId || "";
    const isAnonymous = options.isAnonymous === "true";
    const contentType = options.contentType || "";
    const showZonePicker = options.showZonePicker === "true";

    let selectedZone = null;
    let selectedZoneName = "";
    let showZonePlaceholder = true;
    let isTeaRoom = false;
    let contentTypes = [];
    let selectedContentType = "";
    let anonymous = false;
    let titlePlaceholder = "请输入标题";
    let titleRequired = true;
    let editorMinHeight = "400rpx";

    if (zoneId) {
      const found = MY_ZONE_LIST.find(z => z.zoneId === zoneId);
      if (found) {
        selectedZone = found;
        selectedZoneName = found.zoneName;
        showZonePlaceholder = false;
        isTeaRoom = zoneId === "tea-room";
        contentTypes = this._buildContentTypes(found.category || "company", isTeaRoom);
        selectedContentType = contentTypes.length > 0 ? contentTypes[0].key : "";
      }
    }

    if (isTeaRoom) {
      anonymous = true;
      titlePlaceholder = "标题（选填，想到什么就写什么）";
      titleRequired = false;
    }

    // Handle contentType parameter (Step 2.4 增强)
    if (contentType === "article") {
      titlePlaceholder = "请输入文章标题";
      titleRequired = true;
      editorMinHeight = "800rpx";
      if (contentTypes.length === 0) {
        contentTypes = this._buildContentTypes("company", false);
      }
      selectedContentType = "discuss";
    } else if (contentType === "qa") {
      titlePlaceholder = "请输入你的问题";
      titleRequired = true;
      if (contentTypes.length === 0) {
        contentTypes = this._buildContentTypes("company", false);
      }
      selectedContentType = "qa";
    }

    if (isTeaRoom) {
      anonymous = true;
    }

    // Load recent zones from local storage
    let recentZones = [];
    try {
      const stored = wx.getStorageSync("recent_post_zones") || [];
      recentZones = stored.slice(0, 3);
    } catch (e) {}

    this.setData({
      ...metrics,
      selectedZone,
      selectedZoneName,
      showZonePlaceholder,
      isTeaRoom,
      contentTypes,
      selectedContentType,
      anonymous,
      titlePlaceholder,
      titleRequired,
      editorMinHeight,
      recentZones,
      showZonePicker,
    });
  },

  _buildContentTypes(category, isTeaRoom) {
    if (isTeaRoom) {
      return [{ key: "chat", label: "闲聊" }];
    }
    const tabKeys = ZONE_TABS_MAP[category] || ZONE_TABS_MAP.company;
    return tabKeys
      .map(key => CONTENT_TYPE_MAP[key])
      .filter(Boolean);
  },

  _checkCanPublish() {
    const { selectedZone, content, title, titleRequired, selectedContentType } = this.data;
    const hasZone = !!selectedZone;
    const hasContent = content.trim().length > 0;
    const hasTitle = !titleRequired || title.trim().length > 0;
    const canPublish = hasZone && hasContent && hasTitle;
    this.setData({ canPublish, hasContent });
  },

  // ── Zone picker ──
  openZonePicker() {
    this.setData({ showZonePicker: true, searchKeyword: "" });
  },

  closeZonePicker() {
    this.setData({ showZonePicker: false });
  },

  onSearchInput(event) {
    this.setData({ searchKeyword: event.detail.value });
  },

  selectZone(event) {
    const zoneId = event.currentTarget.dataset.zoneid;
    const zone = MY_ZONE_LIST.find(z => z.zoneId === zoneId);
    if (!zone) return;
    this._applyZone(zone);
  },

  _applyZone(zone) {
    const isTeaRoom = zone.zoneId === "tea-room";
    const contentTypes = this._buildContentTypes(zone.category || "company", isTeaRoom);
    const selectedContentType = contentTypes.length > 0 ? contentTypes[0].key : "";

    this.setData({
      selectedZone: zone,
      selectedZoneName: zone.zoneName,
      showZonePlaceholder: false,
      showZonePicker: false,
      isTeaRoom,
      contentTypes,
      selectedContentType,
      titlePlaceholder: isTeaRoom ? "标题（选填，想到什么就写什么）" : "请输入标题",
      titleRequired: !isTeaRoom,
      anonymous: isTeaRoom ? true : this.data.anonymous,
    });
    this._checkCanPublish();
  },

  goToCommunityFromPicker() {
    this.setData({ showZonePicker: false });
    wx.switchTab({ url: "/pages/community/community" });
  },

  // ── Content type selection ──
  onContentTypeTap(event) {
    const key = event.currentTarget.dataset.key;
    if (key === this.data.selectedContentType) return;
    this.setData({ selectedContentType: key });
  },

  // ── Title & content input ──
  onTitleInput(event) {
    this.setData({ title: event.detail.value });
    this._checkCanPublish();
  },

  handleInput(event) {
    this.setData({ content: event.detail.value });
    this._checkCanPublish();
  },

  // ── Topic tags ──
  toggleTopicInput() {
    this.setData({ showTopicInput: !this.data.showTopicInput, topicInput: "" });
  },

  onTopicInput(event) {
    this.setData({ topicInput: event.detail.value });
  },

  addTopic() {
    const { topicInput, topics, maxTopics } = this.data;
    const text = topicInput.trim().replace(/^#/, "");
    if (!text) return;
    if (topics.length >= maxTopics) {
      wx.showToast({ title: `最多${maxTopics}个话题`, icon: "none" });
      return;
    }
    if (topics.find(t => t === text)) {
      wx.showToast({ title: "话题已添加", icon: "none" });
      return;
    }
    this.setData({
      topics: [...topics, text],
      topicInput: "",
      showTopicInput: false,
    });
  },

  removeTopic(event) {
    const index = event.currentTarget.dataset.index;
    const topics = [...this.data.topics];
    topics.splice(index, 1);
    this.setData({ topics });
  },

  // ── Anonymous toggle ──
  handleAnonymousChange(event) {
    this.setData({ anonymous: event.detail.value });
  },

  // ── Images (preserved from original) ──
  handleAddImage() {
    wx.showToast({ title: "图片上传待接入", icon: "none" });
  },

  // ── Attachment ──
  handleAddAttachment() {
    console.log("添加附件");
  },

  // ── Navigation ──
  goBack() {
    const { title, content, topics } = this.data;
    const hasUnsaved = title.trim() || content.trim() || topics.length > 0;
    if (hasUnsaved) {
      wx.showModal({
        title: "提示",
        content: "有未保存的内容，确定退出吗？",
        confirmColor: "#FF4D4F",
        success: (res) => {
          if (res.confirm) {
            this._doGoBack();
          }
        },
      });
      return;
    }
    this._doGoBack();
  },

  _doGoBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/community/community" }) });
  },

  // ── Publish ──
  async handlePublish() {
    if (this.data.publishing) return;
    if (!this.data.canPublish) return;

    const { selectedZone, selectedContentType, title, content, topics, anonymous } = this.data;

    this.setData({ publishing: true });
    try {
      await api.createPost({
        zoneId: selectedZone.zoneId,
        contentType: selectedContentType,
        title: title.trim(),
        content: content.trim(),
        tags: topics,
        isAnonymous: anonymous,
      });

      // Save recent zone
      this._saveRecentZone(selectedZone.zoneId);

      getApp().globalData.communityNeedsRefresh = true;
      wx.showToast({ title: "发布成功", icon: "success" });
      setTimeout(() => {
        this._doGoBack();
      }, 300);
    } catch (e) {
      wx.showToast({ title: "发布失败，请重试", icon: "none" });
    } finally {
      this.setData({ publishing: false });
    }
  },

  _saveRecentZone(zoneId) {
    try {
      let stored = wx.getStorageSync("recent_post_zones") || [];
      stored = stored.filter(id => id !== zoneId);
      stored.unshift(zoneId);
      stored = stored.slice(0, 3);
      wx.setStorageSync("recent_post_zones", stored);
    } catch (e) {}
  },
});
