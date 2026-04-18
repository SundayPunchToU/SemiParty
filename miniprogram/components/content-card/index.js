// === STEP 1.4 新增：ContentCard 组件 ===
const { formatCount, formatRelative } = require("../../utils/util");

const CONTENT_TYPE_MAP = {
  discuss:   { label: "讨论", bg: "#2196F3", color: "#FFFFFF" },
  news:      { label: "资讯", bg: "#78909C", color: "#FFFFFF" },
  qa:        { label: "问答", bg: "#4CAF50", color: "#FFFFFF" },
  interview: { label: "面经", bg: "#FF9800", color: "#FFFFFF" },
  paper:     { label: "论文", bg: "#9C27B0", color: "#FFFFFF" },
  recruit:   { label: "招聘", bg: "#FFC107", color: "#333333" },
  demand:    { label: "供需", bg: "#F44336", color: "#FFFFFF" },
  chat:      { label: "闲聊", bg: "#8D6E63", color: "#FFFFFF" }
};

Component({
  properties: {
    item: { type: Object, value: null },
    showZoneName: { type: Boolean, value: true },
    showContentType: { type: Boolean, value: true },
    showTopicTag: { type: Boolean, value: false }
  },

  observers: {
    "item": function (item) {
      if (!item) return;
      const ct = CONTENT_TYPE_MAP[item.contentType] || CONTENT_TYPE_MAP.discuss;
      const author = item.author || {};
      this.setData({
        typeLabel: ct.label,
        typeBg: ct.bg,
        typeColor: ct.color,
        displayName: item.isAnonymous ? "匿名芯片人" : (author.name || item.source || "芯社区用户"),
        avatarText: item.isAnonymous ? "匿" : (author.avatarText || (item.source || "U").charAt(0)),
        avatarBg: item.isAnonymous ? "#666666" : (author.avatarBg || "#dce8ff"),
        avatarColor: item.isAnonymous ? "#999999" : (author.avatarColor || "#165dc6"),
        roleLabel: item.isAnonymous ? "" : (author.role || ""),
        relativeTime: formatRelative(item.time || item.createdAt),
        viewCount: formatCount(item.views || 0),
        commentCount: formatCount(item.comments || item.commentCount || 0),
        likeCount: formatCount(item.likes || item.likeCount || 0)
      });
    }
  },

  data: {
    typeLabel: "讨论",
    typeBg: "#2196F3",
    typeColor: "#FFFFFF",
    displayName: "",
    avatarText: "U",
    avatarBg: "#dce8ff",
    avatarColor: "#165dc6",
    roleLabel: "",
    relativeTime: "",
    viewCount: "0",
    commentCount: "0",
    likeCount: "0"
  },

  methods: {
    handleTap() {
      this.triggerEvent("cardtap", { id: this.properties.item.id });
    }
  }
});
