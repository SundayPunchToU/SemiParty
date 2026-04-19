const api = require("../../utils/api");
const { getNavMetrics } = require("../../utils/util");

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

function createTeaRoomZone() {
  return {
    zoneId: "tea-room",
    zoneName: "晶圆茶水间",
    category: "special",
    tabs: [{ tabKey: "chat", tabName: "闲聊" }],
  };
}

function normalizeSelectableZone(zone) {
  if (!zone || !zone.zoneId) {
    return null;
  }

  return {
    zoneId: zone.zoneId,
    zoneName: zone.zoneName || "",
    category: zone.category || (zone.zoneId === "tea-room" ? "special" : "company"),
    tabs: Array.isArray(zone.tabs) ? zone.tabs : [],
    zoneDesc: zone.zoneDesc || "",
    memberCount: Number(zone.memberCount || 0),
  };
}

function resolvePresetContentType(contentType) {
  if (contentType === "article") {
    return "discuss";
  }
  if (contentType === "qa") {
    return "qa";
  }
  return contentType || "";
}

Page({
  data: {
    statusBarHeight: 24,
    capsuleHeight: 32,
    navCapsuleInsetRight: 16,
    selectedZone: null,
    selectedZoneName: "",
    showZonePlaceholder: true,
    showZonePicker: false,
    zoneLoading: false,
    myZones: [],
    recentZones: [],
    searchKeyword: "",
    contentTypes: [],
    selectedContentType: "",
    isTeaRoom: false,
    title: "",
    content: "",
    titlePlaceholder: "请输入标题",
    titleRequired: true,
    topics: [],
    topicInput: "",
    showTopicInput: false,
    maxTopics: 5,
    anonymous: false,
    images: [],
    canPublish: false,
    publishing: false,
    hasContent: false,
    editorMinHeight: "400rpx",
  },

  async onLoad(options = {}) {
    const metrics = getNavMetrics();
    const presetContentType = resolvePresetContentType(options.contentType);
    const showZonePicker = options.showZonePicker === "true";

    this.setData({
      ...metrics,
      showZonePicker,
      titlePlaceholder: presetContentType === "qa" ? "请输入你的问题" : "请输入标题",
      editorMinHeight: options.contentType === "article" ? "800rpx" : "400rpx",
    });

    await this.loadSelectableZones(options);
  },

  async loadSelectableZones(options = {}) {
    const requestedZoneId = options.zoneId || "";
    const forceAnonymous = options.isAnonymous === "true";
    const presetContentType = resolvePresetContentType(options.contentType);

    this.setData({ zoneLoading: true });
    try {
      const result = await api.getUserZones();
      const joinedZones = (result.zones || [])
        .map(normalizeSelectableZone)
        .filter(Boolean)
        .filter((item, index, list) => list.findIndex((zone) => zone.zoneId === item.zoneId) === index);

      const teaRoomZone = createTeaRoomZone();
      const zoneList = [
        teaRoomZone,
        ...joinedZones.filter((item) => item.zoneId !== teaRoomZone.zoneId),
      ];

      let selectedZone = zoneList.find((item) => item.zoneId === requestedZoneId) || null;
      if (requestedZoneId && !selectedZone) {
        const detail = await api.getZoneDetail(requestedZoneId);
        selectedZone = normalizeSelectableZone(detail);
        if (selectedZone) {
          zoneList.unshift(selectedZone);
        }
      }

      const recentZones = this._resolveRecentZones(zoneList);
      this.setData({
        myZones: zoneList,
        recentZones,
        zoneLoading: false,
      });

      if (selectedZone) {
        this._applyZone(selectedZone, { forceAnonymous, presetContentType });
      } else if (presetContentType) {
        this.setData({ selectedContentType: presetContentType });
      }
    } catch (error) {
      console.error("loadSelectableZones failed", error);
      this.setData({ zoneLoading: false });
      wx.showToast({ title: "专区加载失败", icon: "none" });
    }
  },

  _resolveRecentZones(zoneList) {
    const zoneMap = zoneList.reduce((acc, item) => {
      acc[item.zoneId] = item;
      return acc;
    }, {});

    try {
      const stored = wx.getStorageSync("recent_post_zones") || [];
      return stored.map((zoneId) => zoneMap[zoneId]).filter(Boolean).slice(0, 3);
    } catch (error) {
      return [];
    }
  },

  _buildContentTypes(zone) {
    const isTeaRoom = zone.zoneId === "tea-room" || zone.category === "special";
    if (isTeaRoom) {
      return [{ key: "chat", label: "闲聊" }];
    }

    const tabKeys = (zone.tabs || [])
      .map((item) => item.tabKey || item.key)
      .filter((key) => key && key !== "all" && key !== "best" && key !== "hot");
    const keys = tabKeys.length ? tabKeys : (ZONE_TABS_MAP[zone.category] || ZONE_TABS_MAP.company);

    return keys
      .map((key) => CONTENT_TYPE_MAP[key])
      .filter(Boolean)
      .filter((item, index, list) => list.findIndex((current) => current.key === item.key) === index);
  },

  _resolveSelectedContentType(contentTypes, presetContentType) {
    if (!contentTypes.length) {
      return "";
    }
    if (presetContentType && contentTypes.find((item) => item.key === presetContentType)) {
      return presetContentType;
    }
    return contentTypes[0].key;
  },

  _applyZone(zone, options = {}) {
    const isTeaRoom = zone.zoneId === "tea-room" || zone.category === "special";
    const contentTypes = this._buildContentTypes(zone);
    const selectedContentType = this._resolveSelectedContentType(contentTypes, options.presetContentType);
    const anonymous = isTeaRoom ? true : (options.forceAnonymous ? true : this.data.anonymous);

    this.setData({
      selectedZone: zone,
      selectedZoneName: zone.zoneName,
      showZonePlaceholder: false,
      showZonePicker: false,
      isTeaRoom,
      contentTypes,
      selectedContentType,
      titlePlaceholder: isTeaRoom ? "标题选填，想到什么就写什么" : this.data.titlePlaceholder,
      titleRequired: !isTeaRoom,
      anonymous,
    });
    this._checkCanPublish();
  },

  _checkCanPublish() {
    const { selectedZone, content, title, titleRequired } = this.data;
    const hasZone = !!selectedZone;
    const hasContent = content.trim().length > 0;
    const hasTitle = !titleRequired || title.trim().length > 0;
    this.setData({
      canPublish: hasZone && hasContent && hasTitle,
      hasContent,
    });
  },

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
    const zone = this.data.myZones.find((item) => item.zoneId === zoneId);
    if (!zone) {
      return;
    }
    this._applyZone(zone);
  },

  goToCommunityFromPicker() {
    this.setData({ showZonePicker: false });
    wx.switchTab({ url: "/pages/community/community" });
  },

  onContentTypeTap(event) {
    const key = event.currentTarget.dataset.key;
    if (key === this.data.selectedContentType) {
      return;
    }
    this.setData({ selectedContentType: key });
  },

  onTitleInput(event) {
    this.setData({ title: event.detail.value });
    this._checkCanPublish();
  },

  handleInput(event) {
    this.setData({ content: event.detail.value });
    this._checkCanPublish();
  },

  toggleTopicInput() {
    this.setData({ showTopicInput: !this.data.showTopicInput, topicInput: "" });
  },

  onTopicInput(event) {
    this.setData({ topicInput: event.detail.value });
  },

  addTopic() {
    const { topicInput, topics, maxTopics } = this.data;
    const text = topicInput.trim().replace(/^#/, "");
    if (!text) {
      return;
    }
    if (topics.length >= maxTopics) {
      wx.showToast({ title: `最多 ${maxTopics} 个话题`, icon: "none" });
      return;
    }
    if (topics.find((item) => item === text)) {
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

  handleAnonymousChange(event) {
    if (this.data.isTeaRoom) {
      this.setData({ anonymous: true });
      return;
    }
    this.setData({ anonymous: event.detail.value });
  },

  handleAddImage() {
    wx.showToast({ title: "图片上传待接入", icon: "none" });
  },

  handleAddAttachment() {
    wx.showToast({ title: "附件能力待接入", icon: "none" });
  },

  goBack() {
    const { title, content, topics } = this.data;
    const hasUnsaved = title.trim() || content.trim() || topics.length > 0;
    if (!hasUnsaved) {
      this._doGoBack();
      return;
    }

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
  },

  _doGoBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/community/community" }) });
  },

  async handlePublish() {
    if (this.data.publishing || !this.data.canPublish) {
      return;
    }

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

      this._saveRecentZone(selectedZone.zoneId);
      getApp().globalData.communityNeedsRefresh = true;
      wx.showToast({ title: "发布成功", icon: "success" });
      setTimeout(() => {
        this._doGoBack();
      }, 300);
    } catch (error) {
      console.error("createPost failed", error);
      const message = String(error?.message || "");
      let toast = "发布失败，请重试";
      if (message.includes("zone not found")) {
        toast = "专区未初始化，请先执行 seed";
      } else if (message.includes("content is required")) {
        toast = "请先填写正文内容";
      } else if (message.includes("title is required")) {
        toast = "请先填写标题";
      } else if (message) {
        toast = message;
      }
      wx.showToast({ title: toast, icon: "none" });
    } finally {
      this.setData({ publishing: false });
    }
  },

  _saveRecentZone(zoneId) {
    try {
      let stored = wx.getStorageSync("recent_post_zones") || [];
      stored = stored.filter((item) => item !== zoneId);
      stored.unshift(zoneId);
      wx.setStorageSync("recent_post_zones", stored.slice(0, 3));
      this.setData({
        recentZones: this._resolveRecentZones(this.data.myZones),
      });
    } catch (error) {}
  },
});
