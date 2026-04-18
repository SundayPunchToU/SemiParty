const api = require("../../utils/api");
const { formatRelative, getNavMetrics, formatCount } = require("../../utils/util");
const { mockComments, postAttachments } = require("../../mock/commentData");

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

const FILE_ICON_MAP = {
  pdf: "📄",
  xlsx: "📊", xls: "📊", csv: "📊",
  docx: "📝", doc: "📝",
  pptx: "📙", ppt: "📙",
  zip: "📦", rar: "📦",
  jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️"
};

const relatedPosts = [
  { id: "rel-1", title: "N+2 节点工艺方案对比分析", commentCount: 89, likeCount: 234 },
  { id: "rel-2", title: "良率爬坡阶段的常见 killer defect 分析", commentCount: 56, likeCount: 178 },
  { id: "rel-3", title: "良率掉了 5% 怎么快速排查？", commentCount: 34, likeCount: 112 },
];

function getFileIcon(fileType) {
  if (!fileType) return "📎";
  return FILE_ICON_MAP[fileType.toLowerCase()] || "📎";
}

function _deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

Page({
  data: {
    statusBarHeight: 24,
    post: null,
    publishTime: "",
    focusComment: false,
    zoneName: "芯社区",
    zoneId: "",
    typeLabel: "讨论",
    typeBg: "#2196F3",
    typeColor: "#FFFFFF",
    authorRole: "",
    authorExperience: "",
    postZoneName: "",
    viewCount: 0,
    relatedPosts,
    // 附件
    postAttachments: [],
    // 评论系统
    commentList: [],
    commentSort: "latest",
    totalCommentCount: 0,
    expandedComments: {},
    expandedFloorContent: {},
    // 底部输入栏
    inputExpanded: false,
    inputValue: "",
    replyTarget: null,
    isAnonymous: false,
    // 帖子互动
    postLiked: false,
    postFavorited: false,
  },

  _postAuthorUserId: "",

  async onLoad(options) {
    this.setData({
      ...getNavMetrics(),
      focusComment: options.focus === "comment"
    });

    try {
      const post = await api.getPostDetail(options.id);
      const ct = CONTENT_TYPE_MAP[post.contentType] || CONTENT_TYPE_MAP.discuss;
      const author = post.author || {};
      const title = author.title || "";
      const parts = title.split("·").map(s => s.trim());
      const role = parts[0] || "";
      const experience = author.experience || "";
      this._postAuthorUserId = author.userId || "";

      // 处理附件图标
      const atts = (postAttachments || []).map(a => ({
        ...a,
        icon: getFileIcon(a.fileType)
      }));

      // 初始化评论
      const comments = _deepClone(mockComments);
      const totalCommentCount = this._calcTotalCount(comments);

      // 处理评论附件图标
      comments.forEach(c => {
        if (c.attachments && c.attachments.length) {
          c.attachments = c.attachments.map(a => ({ ...a, icon: getFileIcon(a.fileType) }));
        }
      });

      this.setData({
        post,
        publishTime: formatRelative(post.createdAt),
        zoneName: post.zoneName || "芯社区",
        zoneId: post.zoneId || "",
        typeLabel: ct.label,
        typeBg: ct.bg,
        typeColor: ct.color,
        authorRole: role,
        authorExperience: experience,
        postZoneName: post.zoneName || "",
        viewCount: post.views || 0,
        postAttachments: atts,
        commentList: comments,
        totalCommentCount
      });

      this.loadComments(options.id);
    } catch (error) {
      console.error("load post detail failed", error);
      wx.showToast({ title: error.message || "帖子加载失败", icon: "none" });
    }
  },

  _calcTotalCount(comments) {
    let count = comments.length;
    (comments || []).forEach(c => {
      count += (c.replies && c.replies.length) || 0;
    });
    return count;
  },

  async loadComments(postId) {
    try {
      const result = await api.getComments("post", postId, 1);
      // 保留本地 mock 评论，远程结果备用
    } catch (e) {
      // 静默处理
    }
  },

  goBack() {
    wx.navigateBack({
      fail() { wx.switchTab({ url: "/pages/community/community" }); }
    });
  },

  onZoneTap() {
    console.log("跳转到专区", this.data.zoneId);
  },

  onRelatedPostTap(e) {
    console.log("跳转到相关帖子", e.currentTarget.dataset.id);
  },

  // ===== 附件下载 =====
  onDownloadAttachment(e) {
    const fileId = e.currentTarget.dataset.fileid;
    console.log("下载附件", fileId);
    wx.showToast({ title: "下载功能待接入", icon: "none" });
  },

  // ===== 图片预览 =====
  onPreviewImage(e) {
    const url = e.currentTarget.dataset.url;
    const index = e.currentTarget.dataset.index;
    console.log("预览图片", index, url);
  },

  // ===== 评论排序 =====
  onSortChange(e) {
    const sort = e.currentTarget.dataset.sort;
    if (sort === this.data.commentSort) return;
    let list = this.data.commentList;
    if (sort === "hottest") {
      list = [...list].sort((a, b) => b.likeCount - a.likeCount);
    } else {
      list = [...list].sort((a, b) => a.floor - b.floor);
    }
    this.setData({ commentSort: sort, commentList: list });
  },

  // ===== 评论展开/折叠（内容 > 6行） =====
  toggleFloorContent(e) {
    const floor = e.currentTarget.dataset.floor;
    const key = "expandedFloorContent." + floor;
    this.setData({ [key]: !this.data.expandedFloorContent[floor] });
  },

  // ===== 楼中楼展开/折叠 =====
  toggleReplies(e) {
    const floor = e.currentTarget.dataset.floor;
    const key = "expandedComments." + floor;
    this.setData({ [key]: !this.data.expandedComments[floor] });
  },

  // ===== 主楼点赞 =====
  onLikeComment(e) {
    const idx = e.currentTarget.dataset.idx;
    const key = "commentList[" + idx + "]";
    const c = this.data.commentList[idx];
    const liked = !c.isLiked;
    const count = liked ? c.likeCount + 1 : c.likeCount - 1;
    this.setData({
      [key + ".isLiked"]: liked,
      [key + ".likeCount"]: count
    });
  },

  // ===== 楼中楼点赞 =====
  onLikeReply(e) {
    const { cidx, ridx } = e.currentTarget.dataset;
    const rKey = "commentList[" + cidx + "].replies[" + ridx + "]";
    const r = this.data.commentList[cidx].replies[ridx];
    const liked = !r.isLiked;
    this.setData({
      [rKey + ".isLiked"]: liked,
      [rKey + ".likeCount"]: liked ? r.likeCount + 1 : r.likeCount - 1
    });
  },

  // ===== 回复评论（主楼或楼中楼） =====
  onReplyTo(e) {
    const { nickname, commentid, replyid } = e.currentTarget.dataset;
    this.setData({
      inputExpanded: true,
      replyTarget: { nickname, commentId: commentid, replyId: replyid || null },
      inputValue: ""
    });
  },

  // ===== 长按主楼评论 =====
  onLongPressComment(e) {
    const { commentid } = e.currentTarget.dataset;
    wx.showActionSheet({
      itemList: ["💬 回复", "📋 复制文字", "⚠️ 举报"],
      success: (res) => {
        const idx = this.data.commentList.findIndex(c => c.commentId === commentid);
        if (idx === -1) return;
        const c = this.data.commentList[idx];
        if (res.tapIndex === 0) {
          this.setData({ inputExpanded: true, replyTarget: { nickname: c.author.nickname, commentId: c.commentId, replyId: null } });
        } else if (res.tapIndex === 1) {
          wx.setClipboardData({ data: c.content });
        } else if (res.tapIndex === 2) {
          console.log("举报评论", commentid);
        }
      }
    });
  },

  // ===== 长按楼中楼回复 =====
  onLongPressReply(e) {
    const { cidx, ridx } = e.currentTarget.dataset;
    const reply = this.data.commentList[cidx].replies[ridx];
    wx.showActionSheet({
      itemList: ["回复", "复制文字", "举报"],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.setData({ inputExpanded: true, replyTarget: { nickname: reply.author.nickname, commentId: reply.replyId, replyId: reply.replyId } });
        } else if (res.tapIndex === 1) {
          wx.setClipboardData({ data: reply.content });
        } else if (res.tapIndex === 2) {
          console.log("举报回复", reply.replyId);
        }
      }
    });
  },

  // ===== 底部输入栏 =====
  onInputFocus() {
    this.setData({ inputExpanded: true, inputValue: "" });
  },

  onInputBlur() {
    // 不自动收起，让用户手动取消
  },

  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  onCancelInput() {
    this.setData({ inputExpanded: false, inputValue: "", replyTarget: null });
  },

  toggleAnonymous() {
    this.setData({ isAnonymous: !this.data.isAnonymous });
  },

  onPublishComment() {
    const { inputValue, isAnonymous, replyTarget, commentList, post } = this.data;
    if (!inputValue.trim()) return;

    if (replyTarget && replyTarget.replyId) {
      // 楼中楼回复
      const cIdx = commentList.findIndex(c => c.commentId === replyTarget.commentId);
      if (cIdx === -1) return;
      const newReply = {
        replyId: "r-new-" + Date.now(),
        author: { userId: "me", nickname: isAnonymous ? "匿名芯片人" : "我", avatar: null, role: isAnonymous ? "" : "芯片工程师" },
        content: inputValue.trim(),
        replyTo: { userId: "", nickname: replyTarget.nickname },
        likeCount: 0,
        isLiked: false,
        createdAt: "刚刚"
      };
      const replies = [...commentList[cIdx].replies, newReply];
      const replyCount = (commentList[cIdx].replyCount || 0) + 1;
      const totalCommentCount = this.data.totalCommentCount + 1;
      this.setData({
        ["commentList[" + cIdx + "].replies"]: replies,
        ["commentList[" + cIdx + "].replyCount"]: replyCount,
        totalCommentCount,
        inputExpanded: false,
        inputValue: "",
        replyTarget: null
      });
    } else {
      // 新主楼评论
      const maxFloor = commentList.reduce((m, c) => Math.max(m, c.floor || 0), 0);
      const newComment = {
        commentId: "c-new-" + Date.now(),
        floor: maxFloor + 1,
        author: { userId: "me", nickname: isAnonymous ? "匿名芯片人" : "我", avatar: null, role: isAnonymous ? "" : "芯片工程师", experience: "" },
        content: inputValue.trim(),
        images: [],
        attachments: [],
        likeCount: 0,
        isLiked: false,
        replyCount: 0,
        createdAt: "刚刚",
        replies: [],
        isNew: true
      };
      const newList = [...commentList, newComment];
      const totalCommentCount = this.data.totalCommentCount + 1;
      this.setData({
        commentList: newList,
        totalCommentCount,
        inputExpanded: false,
        inputValue: "",
        replyTarget: null
      });
    }

    wx.showToast({ title: "评论成功", icon: "success" });
  },

  // ===== 帖子点赞/收藏 =====
  togglePostLike() {
    const liked = !this.data.postLiked;
    this.setData({ postLiked: liked });
    wx.showToast({ title: liked ? "已点赞" : "取消点赞", icon: "none" });
  },

  togglePostFavorite() {
    const faved = !this.data.postFavorited;
    this.setData({ postFavorited: faved });
    wx.showToast({ title: faved ? "已收藏" : "取消收藏", icon: "none" });
  },

  onSharePost() {
    console.log("分享帖子");
    wx.showToast({ title: "分享功能待接入", icon: "none" });
  },

  onLoadMoreComments() {
    console.log("加载更多评论");
    wx.showToast({ title: "已加载全部评论", icon: "none" });
  },

  onCommentImageTap(e) {
    console.log("预览评论图片", e.currentTarget.dataset.url);
  },

  // 点击楼中楼整条 → 回复此人
  onTapReplyItem(e) {
    const { cidx, ridx } = e.currentTarget.dataset;
    const reply = this.data.commentList[cidx].replies[ridx];
    this.setData({
      inputExpanded: true,
      replyTarget: { nickname: reply.author.nickname, commentId: this.data.commentList[cidx].commentId, replyId: reply.replyId },
      inputValue: "回复 " + reply.author.nickname + "："
    });
  },

  handleAction(event) {
    wx.showToast({
      title: `${event.currentTarget.dataset.name} 待接入`,
      icon: "none"
    });
  }
});
