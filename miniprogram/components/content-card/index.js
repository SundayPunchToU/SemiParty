const { formatCount, formatRelative } = require("../../utils/util");

const CONTENT_TYPE_COLORS = {
  "讨论": { bg: "#2196F3", color: "#ffffff" },
  "资讯": { bg: "#78909C", color: "#ffffff" },
  "问答": { bg: "#4CAF50", color: "#ffffff" },
  "面经": { bg: "#FF9800", color: "#ffffff" },
  "论文": { bg: "#9C27B0", color: "#ffffff" },
  "招聘": { bg: "#FFC107", color: "#333333" },
  "供需": { bg: "#F44336", color: "#ffffff" },
  "项目": { bg: "#00BCD4", color: "#ffffff" },
  "闲聊": { bg: "#8D6E63", color: "#ffffff" }
};

Component({
  properties: {
    item: {
      type: Object,
      value: null,
      observer(value) {
        if (!value) return;
        const ct = CONTENT_TYPE_COLORS[value.contentType] || CONTENT_TYPE_COLORS["讨论"];
        const images = (value.images || []).slice(0, 3);
        this.setData({
          contentTypeColor: ct,
          displayName: value.isAnonymous ? "匿名芯片人" : (value.author && value.author.nickname) || "",
          displayRole: value.isAnonymous ? "" : (value.author && value.author.role) || "",
          relativeTime: formatRelative(value.createTime || value.createdAt || value.time),
          commentsText: formatCount(value.comments || value.commentCount || 0),
          likesText: formatCount(value.likes || value.likeCount || 0),
          images: images,
          hasBestAnswer: !!(value.contentType === "问答" && value.bestAnswer),
          supplyDemandPrefix: value.contentType === "供需"
            ? (value.supplyType === "supply" ? "[供应] " : "[求购] ")
            : ""
        });
      }
    }
  },
  data: {
    contentTypeColor: {},
    displayName: "",
    displayRole: "",
    relativeTime: "",
    commentsText: "0",
    likesText: "0",
    images: [],
    hasBestAnswer: false,
    supplyDemandPrefix: ""
  },
  methods: {
    handleCardTap() {
      this.triggerEvent("cardtap", { id: this.properties.item.id });
    },
    handleZoneTap() {
      const zone = this.properties.item.zoneName;
      if (zone) {
        this.triggerEvent("zonetap", { zoneName: zone, zoneId: this.properties.item.zoneId });
      }
    }
  }
});
