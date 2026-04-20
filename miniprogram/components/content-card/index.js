const { formatCount, formatRelative } = require("../../utils/util");

const CONTENT_TYPE_MAP = {
  discuss: { label: "讨论", bg: "#2196F3", color: "#FFFFFF" },
  news: { label: "资讯", bg: "#64748B", color: "#FFFFFF" },
  qa: { label: "问答", bg: "#16A34A", color: "#FFFFFF" },
  interview: { label: "面经", bg: "#F97316", color: "#FFFFFF" },
  paper: { label: "论文", bg: "#8B5CF6", color: "#FFFFFF" },
  recruit: { label: "招聘", bg: "#F59E0B", color: "#1F2937" },
  demand: { label: "供需", bg: "#EF4444", color: "#FFFFFF" },
  chat: { label: "茶水间", bg: "#8D6E63", color: "#FFFFFF" },
};

Component({
  properties: {
    item: { type: Object, value: null },
    showContentType: { type: Boolean, value: true },
    showTopicTag: { type: Boolean, value: false },
  },

  observers: {
    item(item) {
      if (!item) {
        return;
      }

      const contentType = CONTENT_TYPE_MAP[item.contentType] || CONTENT_TYPE_MAP.discuss;
      const author = item.author || {};
      const topicTagText =
        item.topicName ||
        item.zoneName ||
        (item.topic && item.topic.text) ||
        (Array.isArray(item.tags) && item.tags.length ? item.tags[0] : "");

      this.setData({
        typeLabel: contentType.label,
        typeBg: contentType.bg,
        typeColor: contentType.color,
        displayName: item.isAnonymous ? "匿名用户" : author.name || item.source || "SemiParty 用户",
        avatarText: item.isAnonymous ? "匿" : author.avatarText || (author.name || item.source || "S").charAt(0),
        avatarBg: item.isAnonymous ? "#666666" : author.avatarBg || "#DCE8FF",
        avatarColor: item.isAnonymous ? "#999999" : author.avatarColor || "#165DC6",
        roleLabel: item.isAnonymous ? "" : author.role || author.title || "",
        relativeTime: formatRelative(item.time || item.createdAt),
        commentCount: formatCount(item.comments || item.commentCount || 0),
        likeCount: formatCount(item.likes || item.likeCount || 0),
        topicTagText: String(topicTagText || "").replace(/^#/, ""),
      });
    },
  },

  data: {
    typeLabel: "讨论",
    typeBg: "#2196F3",
    typeColor: "#FFFFFF",
    displayName: "",
    avatarText: "S",
    avatarBg: "#DCE8FF",
    avatarColor: "#165DC6",
    roleLabel: "",
    relativeTime: "",
    commentCount: "0",
    likeCount: "0",
    topicTagText: "",
  },

  methods: {
    handleTap() {
      this.triggerEvent("cardtap", { id: this.properties.item.id });
    },
  },
});
