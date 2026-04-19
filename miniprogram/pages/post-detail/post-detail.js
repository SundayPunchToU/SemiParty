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

function normalizeCommentAuthor(author = {}, anonymous = false) {
  const nickname = author.nickname || author.name || (anonymous ? "匿名芯片人" : "芯社区用户");
  return {
    userId: author.userId || author.uid || "",
    nickname,
    avatarText: author.avatarText || String(nickname).slice(0, 1) || "U",
    avatarBg: author.avatarBg || "#DCE8FF",
    avatarColor: author.avatarColor || "#165DC6",
    role: author.role || author.title || "",
    experience: author.experience || "",
  };
}

function normalizeReplyItem(reply = {}) {
  return {
    ...reply,
    replyId: reply.replyId || reply._id || `reply_${Date.now()}`,
    author: normalizeCommentAuthor(reply.author, reply.isAnonymous),
    replyTo: reply.replyTo || null,
    likeCount: Number(reply.likeCount ?? reply.likes ?? 0) || 0,
    isLiked: false,
    createdAt: formatRelative(reply.createdAt) || reply.createdAt || "刚刚",
  };
}

function normalizeCommentItem(comment = {}, index = 0) {
  const replies = Array.isArray(comment.replies) ? comment.replies.map(normalizeReplyItem) : [];
  return {
    ...comment,
    commentId: comment.commentId || comment._id || `comment_${index}_${Date.now()}`,
    floor: comment.floor || index + 1,
    author: normalizeCommentAuthor(comment.author, comment.isAnonymous),
    likeCount: Number(comment.likeCount ?? comment.likes ?? 0) || 0,
    isLiked: false,
    replyCount: Number(comment.replyCount ?? replies.length ?? 0) || 0,
    replies,
    createdAt: formatRelative(comment.createdAt) || comment.createdAt || "刚刚",
    images: Array.isArray(comment.images) ? comment.images : [],
    attachments: Array.isArray(comment.attachments) ? comment.attachments : [],
  };
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
    authorFollowed: false,
    isOwnPost: false,
    commentSubmitting: false,
    postActionLoading: false,
  },

  _postAuthorUserId: "",

  async onLoad(options) {
    this.setData({
      ...getNavMetrics(),
      focusComment: options.focus === "comment"
    });

    try {
      const loginResult = await api.login().catch(() => null);
      const currentOpenid = loginResult?.openid || getApp().globalData.openid || "";
      const post = await api.getPostDetail(options.id);
      const ct = CONTENT_TYPE_MAP[post.contentType] || CONTENT_TYPE_MAP.discuss;
      const author = post.author || {};
      const title = author.title || "";
      const parts = title.split("·").map((s) => s.trim());
      const role = parts[0] || author.role || "";
      const experience = author.experience || "";
      this._postAuthorUserId = author.userId || author.uid || "";

      const atts = (postAttachments || []).map((a) => ({
        ...a,
        icon: getFileIcon(a.fileType)
      }));

      const comments = _deepClone(mockComments).map((item, index) => normalizeCommentItem(item, index));
      comments.forEach((c) => {
        if (c.attachments && c.attachments.length) {
          c.attachments = c.attachments.map((a) => ({ ...a, icon: getFileIcon(a.fileType) }));
        }
      });

      let postFavorited = false;
      try {
        const favoritesRes = await api.getFavorites({ type: "post", page: 1, pageSize: 100 });
        postFavorited = (favoritesRes.data || []).some((item) => item.targetId === post.id);
      } catch (e) {}

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
        viewCount: post.views || post.viewCount || 0,
        postAttachments: atts,
        commentList: comments,
        totalCommentCount: this._calcTotalCount(comments),
        postLiked: currentOpenid ? (post.likedOpenids || []).includes(currentOpenid) : false,
        postFavorited,
        authorFollowed: !!(author.isFollowed || author.followed),
        isOwnPost: !!currentOpenid && currentOpenid === this._postAuthorUserId,
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
      const result = await api.getComments({
        targetType: "post",
        targetId: postId,
        sort: this.data.commentSort === "hottest" ? "hot" : "createdAt",
        page: 1,
      });
      const remoteComments = (result.data || []).map((item, index) => normalizeCommentItem(item, index));
      if (!remoteComments.length) {
        return;
      }
      this.setData({
        commentList: remoteComments,
        totalCommentCount: this._calcTotalCount(remoteComments),
      });
    } catch (e) {
      console.warn("loadComments fallback", e);
    }
  },

  goBack() {
    wx.navigateBack({
      fail() { wx.switchTab({ url: "/pages/community/community" }); }
    });
  },

  onZoneTap() {
    if (!this.data.zoneId) {
      return;
    }
    wx.navigateTo({ url: `/pages/zone-detail/zone-detail?zoneId=${this.data.zoneId}` });
  },

  onRelatedPostTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}` });
  },

  // ===== 附件下载 =====
  onDownloadAttachment(e) {
    const fileId = e.currentTarget.dataset.fileid;
    console.log("下载附件", fileId);
    wx.showToast({ title: "当前版本暂不支持附件下载", icon: "none" });
  },

  // ===== 图片预览 =====
  onPreviewImage(e) {
    const { url } = e.currentTarget.dataset;
    const urls = (this.data.post && this.data.post.images) || [];
    if (!url || !urls.length) {
      return;
    }
    wx.previewImage({ current: url, urls });
  },

  // ===== 评论排序 =====
  onSortChange(e) {
    const sort = e.currentTarget.dataset.sort;
    if (sort === this.data.commentSort) return;
    this.setData({ commentSort: sort });
    if (this.data.post && (this.data.post.id || this.data.post._id)) {
      this.loadComments(this.data.post.id || this.data.post._id);
      return;
    }
    const list = sort === "hottest"
      ? [...this.data.commentList].sort((a, b) => b.likeCount - a.likeCount)
      : [...this.data.commentList].sort((a, b) => a.floor - b.floor);
    this.setData({ commentList: list });
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
    const comment = this.data.commentList[cidx];
    wx.showActionSheet({
      itemList: ["回复", "复制文字", "举报"],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.setData({
            inputExpanded: true,
            replyTarget: { nickname: reply.author.nickname, commentId: comment.commentId, replyId: reply.replyId }
          });
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

  async onPublishComment() {
    const { inputValue, replyTarget, post, commentSubmitting } = this.data;
    const content = (inputValue || "").trim();
    const postId = (post && (post.id || post._id)) || "";
    if (!content || !postId || commentSubmitting) {
      return;
    }

    this.setData({ commentSubmitting: true });
    try {
      await api.login();
      await api.addComment({
        targetType: "post",
        targetId: postId,
        content,
        parentId: replyTarget ? replyTarget.commentId || "" : "",
        replyTo: replyTarget && replyTarget.replyId ? replyTarget.replyId : "",
      });

      await this.loadComments(postId);
      this.setData({
        inputExpanded: false,
        inputValue: "",
        replyTarget: null,
        "post.comments": Number((this.data.post && this.data.post.comments) || 0) + 1,
      });
      wx.showToast({ title: "评论成功", icon: "success" });
    } catch (error) {
      console.error("publish comment failed", error);
      wx.showToast({
        title: error.message === "user not found" ? "请先初始化当前用户资料" : (error.message || "评论失败，请稍后重试"),
        icon: "none"
      });
    } finally {
      this.setData({ commentSubmitting: false });
    }
  },

  // ===== 帖子点赞/收藏 =====
  async togglePostLike() {
    const postId = this.data.post && (this.data.post.id || this.data.post._id);
    if (!postId || this.data.postActionLoading) {
      return;
    }
    this.setData({ postActionLoading: true });
    try {
      await api.login();
      const result = await api.toggleLike("post", postId);
      const liked = !!result.liked;
      const likes = Number(result.likes ?? this.data.post.likes ?? 0) || 0;
      this.setData({
        postLiked: liked,
        "post.likes": likes,
      });
    } catch (error) {
      wx.showToast({ title: error.message || "点赞失败，请稍后重试", icon: "none" });
    } finally {
      this.setData({ postActionLoading: false });
    }
  },

  async togglePostFavorite() {
    const post = this.data.post;
    const postId = post && (post.id || post._id);
    if (!postId || this.data.postActionLoading) {
      return;
    }
    this.setData({ postActionLoading: true });
    try {
      await api.login();
      const result = await api.toggleFavorite("post", postId, {
        title: post.title || (post.content || "").slice(0, 40),
        authorName: post.author?.name || "芯社区用户",
        zoneName: this.data.zoneName || post.zoneName || "",
        likes: Number(post.likes || 0) || 0,
        comments: Number(post.comments || 0) || 0,
      });
      this.setData({ postFavorited: !!result.favorited });
      wx.showToast({ title: result.favorited ? "已收藏" : "已取消收藏", icon: "none" });
    } catch (error) {
      wx.showToast({ title: error.message || "收藏失败，请稍后重试", icon: "none" });
    } finally {
      this.setData({ postActionLoading: false });
    }
  },

  onSharePost() {
    wx.showShareMenu({ withShareTicket: true, menus: ["shareAppMessage", "shareTimeline"] });
    wx.showToast({ title: "请使用右上角转发", icon: "none" });
  },

  onMoreTap() {
    wx.showActionSheet({
      itemList: ["复制帖子内容", "举报内容"],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({ data: this.data.post?.content || "" });
        }
        if (res.tapIndex === 1) {
          wx.showToast({ title: "举报入口将在后续版本开放", icon: "none" });
        }
      }
    });
  },

  onLoadMoreComments() {
    wx.showToast({ title: "当前已加载最新评论", icon: "none" });
  },

  onCommentImageTap(e) {
    const { url, commentIndex } = e.currentTarget.dataset;
    const comment = this.data.commentList[commentIndex] || {};
    const urls = Array.isArray(comment.images) ? comment.images : [];
    if (!url || !urls.length) {
      return;
    }
    wx.previewImage({ current: url, urls });
  },


  async onToggleFollow() {
    if (this.data.isOwnPost || !this._postAuthorUserId || this.data.postActionLoading) {
      return;
    }
    this.setData({ postActionLoading: true });
    try {
      await api.login();
      const result = await api.toggleFollow(this._postAuthorUserId);
      this.setData({ authorFollowed: !!result.followed });
      wx.showToast({ title: result.followed ? "已关注" : "已取消关注", icon: "none" });
    } catch (error) {
      wx.showToast({ title: error.message || "关注失败，请稍后重试", icon: "none" });
    } finally {
      this.setData({ postActionLoading: false });
    }
  },

  onToolbarDisabledTap() {
    wx.showToast({ title: "当前版本暂不支持图片/附件评论", icon: "none" });
  },

  onShareAppMessage() {
    const post = this.data.post || {};
    return {
      title: post.title || (post.content || "半导体社区讨论").slice(0, 28),
      path: `/pages/post-detail/post-detail?id=${post.id || post._id || ""}`,
    };
  },

  onShareTimeline() {
    const post = this.data.post || {};
    return {
      title: post.title || (post.content || "半导体社区讨论").slice(0, 28),
      query: `id=${post.id || post._id || ""}`,
    };
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
  }
});
