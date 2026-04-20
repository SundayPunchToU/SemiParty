const api = require("../../utils/api");
const { formatRelative, getNavMetrics } = require("../../utils/util");
const { mockComments, postAttachments } = require("../../mock/commentData");

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

const FILE_ICON_MAP = {
  pdf: "PDF",
  xlsx: "XLS",
  xls: "XLS",
  csv: "CSV",
  docx: "DOC",
  doc: "DOC",
  pptx: "PPT",
  ppt: "PPT",
  zip: "ZIP",
  rar: "RAR",
  jpg: "IMG",
  jpeg: "IMG",
  png: "IMG",
  gif: "IMG",
  webp: "IMG",
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function getFileIcon(fileType) {
  if (!fileType) {
    return "FILE";
  }
  return FILE_ICON_MAP[String(fileType).toLowerCase()] || "FILE";
}

function normalizeCommentAuthor(author = {}, anonymous = false) {
  const nickname = author.nickname || author.name || (anonymous ? "匿名用户" : "SemiParty 用户");
  return {
    userId: author.userId || author.uid || "",
    nickname,
    avatarText: author.avatarText || nickname.slice(0, 1) || "U",
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
    topicName: "",
    typeLabel: "讨论",
    typeBg: "#2196F3",
    typeColor: "#FFFFFF",
    authorRole: "",
    authorExperience: "",
    postTopicName: "",
    viewCount: 0,
    relatedPosts: [],
    postAttachments: [],
    commentList: [],
    commentSort: "latest",
    totalCommentCount: 0,
    expandedComments: {},
    expandedFloorContent: {},
    inputExpanded: false,
    inputValue: "",
    replyTarget: null,
    isAnonymous: false,
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
      focusComment: options.focus === "comment",
    });

    try {
      const loginResult = await api.login().catch(() => null);
      const currentOpenid = loginResult?.openid || getApp().globalData.openid || "";
      const post = await api.getPostDetail(options.id);
      const contentType = CONTENT_TYPE_MAP[post.contentType] || CONTENT_TYPE_MAP.discuss;
      const author = post.author || {};
      const title = author.title || "";
      const parts = title.split("·").map((item) => item.trim()).filter(Boolean);
      this._postAuthorUserId = author.userId || author.uid || "";

      let postFavorited = false;
      try {
        const favoritesRes = await api.getFavorites({ type: "post", page: 1, pageSize: 100 });
        postFavorited = (favoritesRes.data || []).some((item) => item.targetId === post.id);
      } catch (error) {}

      const attachmentList = (postAttachments || []).map((item) => ({
        ...item,
        icon: getFileIcon(item.fileType),
      }));

      this.setData({
        post,
        publishTime: formatRelative(post.createdAt),
        topicName: post.topicName || post.zoneName || "",
        typeLabel: contentType.label,
        typeBg: contentType.bg,
        typeColor: contentType.color,
        authorRole: parts[0] || author.role || "",
        authorExperience: author.experience || parts.slice(1).join(" · "),
        postTopicName: post.topicName || post.zoneName || "",
        viewCount: post.views || post.viewCount || 0,
        postAttachments: attachmentList,
        postLiked: currentOpenid ? (post.likedOpenids || []).includes(currentOpenid) : false,
        postFavorited,
        authorFollowed: !!(author.isFollowed || author.followed),
        isOwnPost: !!currentOpenid && currentOpenid === this._postAuthorUserId,
      });

      await this.loadComments(post.id || post._id);
      this.buildRelatedPosts();
    } catch (error) {
      console.error("load post detail failed", error);
      wx.showToast({ title: error.message || "帖子加载失败", icon: "none" });
    }
  },

  buildRelatedPosts() {
    const post = this.data.post;
    if (!post) {
      return;
    }
    api
      .getPostsByTopic({ topicId: post.topicId || "hot", page: 1, size: 4 })
      .then((result) => {
        const relatedPosts = (result.data || [])
          .filter((item) => item.id !== post.id)
          .slice(0, 3)
          .map((item) => ({
            id: item.id,
            title: item.title || item.content,
            commentCount: item.comments || item.commentCount || 0,
            likeCount: item.likes || item.likeCount || 0,
          }));
        this.setData({ relatedPosts });
      })
      .catch(() => {});
  },

  calcTotalCount(comments) {
    return (comments || []).reduce(
      (sum, item) => sum + 1 + ((item.replies && item.replies.length) || 0),
      0
    );
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
      if (remoteComments.length) {
        this.setData({
          commentList: remoteComments,
          totalCommentCount: this.calcTotalCount(remoteComments),
        });
        return;
      }
    } catch (error) {
      console.warn("loadComments fallback", error);
    }

    const comments = clone(mockComments).map((item, index) => normalizeCommentItem(item, index));
    comments.forEach((item) => {
      item.attachments = (item.attachments || []).map((attachment) => ({
        ...attachment,
        icon: getFileIcon(attachment.fileType),
      }));
    });
    this.setData({
      commentList: comments,
      totalCommentCount: this.calcTotalCount(comments),
    });
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: "/pages/community/community" });
      },
    });
  },

  onTopicTap() {
    if (!this.data.topicName) {
      return;
    }
    wx.navigateTo({
      url: `/pages/search/search?keyword=${encodeURIComponent(this.data.topicName)}`,
    });
  },

  onRelatedPostTap(event) {
    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}` });
  },

  onDownloadAttachment() {
    wx.showToast({ title: "当前版本暂不支持附件下载", icon: "none" });
  },

  onPreviewImage(event) {
    const url = event.currentTarget.dataset.url;
    const urls = (this.data.post && this.data.post.images) || [];
    if (!url || !urls.length) {
      return;
    }
    wx.previewImage({ current: url, urls });
  },

  onSortChange(event) {
    const sort = event.currentTarget.dataset.sort;
    if (!sort || sort === this.data.commentSort) {
      return;
    }
    this.setData({ commentSort: sort });
    if (this.data.post && (this.data.post.id || this.data.post._id)) {
      this.loadComments(this.data.post.id || this.data.post._id);
    }
  },

  toggleFloorContent(event) {
    const floor = event.currentTarget.dataset.floor;
    this.setData({
      [`expandedFloorContent.${floor}`]: !this.data.expandedFloorContent[floor],
    });
  },

  toggleReplies(event) {
    const floor = event.currentTarget.dataset.floor;
    this.setData({
      [`expandedComments.${floor}`]: !this.data.expandedComments[floor],
    });
  },

  onLikeComment(event) {
    const idx = event.currentTarget.dataset.idx;
    const item = this.data.commentList[idx];
    if (!item) {
      return;
    }
    const liked = !item.isLiked;
    this.setData({
      [`commentList[${idx}].isLiked`]: liked,
      [`commentList[${idx}].likeCount`]: Math.max(0, item.likeCount + (liked ? 1 : -1)),
    });
  },

  onLikeReply(event) {
    const cidx = event.currentTarget.dataset.cidx;
    const ridx = event.currentTarget.dataset.ridx;
    const reply = this.data.commentList[cidx]?.replies?.[ridx];
    if (!reply) {
      return;
    }
    const liked = !reply.isLiked;
    this.setData({
      [`commentList[${cidx}].replies[${ridx}].isLiked`]: liked,
      [`commentList[${cidx}].replies[${ridx}].likeCount`]: Math.max(0, reply.likeCount + (liked ? 1 : -1)),
    });
  },

  onReplyTo(event) {
    const nickname = event.currentTarget.dataset.nickname;
    const commentId = event.currentTarget.dataset.commentid;
    const replyId = event.currentTarget.dataset.replyid || null;
    this.setData({
      inputExpanded: true,
      replyTarget: { nickname, commentId, replyId },
      inputValue: "",
    });
  },

  onTapReplyItem(event) {
    const cidx = event.currentTarget.dataset.cidx;
    const ridx = event.currentTarget.dataset.ridx;
    const reply = this.data.commentList[cidx]?.replies?.[ridx];
    const comment = this.data.commentList[cidx];
    if (!reply || !comment) {
      return;
    }
    this.setData({
      inputExpanded: true,
      replyTarget: { nickname: reply.author.nickname, commentId: comment.commentId, replyId: reply.replyId },
      inputValue: "",
    });
  },

  onLongPressComment(event) {
    const commentId = event.currentTarget.dataset.commentid;
    const comment = this.data.commentList.find((item) => item.commentId === commentId);
    if (!comment) {
      return;
    }
    wx.showActionSheet({
      itemList: ["回复", "复制文字", "举报"],
      success: (result) => {
        if (result.tapIndex === 0) {
          this.setData({
            inputExpanded: true,
            replyTarget: { nickname: comment.author.nickname, commentId: comment.commentId, replyId: null },
          });
        } else if (result.tapIndex === 1) {
          wx.setClipboardData({ data: comment.content });
        } else {
          wx.showToast({ title: "举报入口后续开放", icon: "none" });
        }
      },
    });
  },

  onLongPressReply(event) {
    const cidx = event.currentTarget.dataset.cidx;
    const ridx = event.currentTarget.dataset.ridx;
    const reply = this.data.commentList[cidx]?.replies?.[ridx];
    const comment = this.data.commentList[cidx];
    if (!reply || !comment) {
      return;
    }
    wx.showActionSheet({
      itemList: ["回复", "复制文字", "举报"],
      success: (result) => {
        if (result.tapIndex === 0) {
          this.setData({
            inputExpanded: true,
            replyTarget: { nickname: reply.author.nickname, commentId: comment.commentId, replyId: reply.replyId },
          });
        } else if (result.tapIndex === 1) {
          wx.setClipboardData({ data: reply.content });
        } else {
          wx.showToast({ title: "举报入口后续开放", icon: "none" });
        }
      },
    });
  },

  onInputFocus() {
    this.setData({ inputExpanded: true });
  },

  onInputBlur() {},

  onInputChange(event) {
    this.setData({ inputValue: event.detail.value });
  },

  onCancelInput() {
    this.setData({
      inputExpanded: false,
      inputValue: "",
      replyTarget: null,
    });
  },

  toggleAnonymous() {
    this.setData({ isAnonymous: !this.data.isAnonymous });
  },

  async onPublishComment() {
    const post = this.data.post;
    const content = (this.data.inputValue || "").trim();
    const postId = post && (post.id || post._id);
    if (!content || !postId || this.data.commentSubmitting) {
      return;
    }

    this.setData({ commentSubmitting: true });
    try {
      await api.login();
      await api.addComment({
        targetType: "post",
        targetId: postId,
        content,
        parentId: this.data.replyTarget ? this.data.replyTarget.commentId || "" : "",
        replyTo: this.data.replyTarget && this.data.replyTarget.replyId ? this.data.replyTarget.replyId : "",
      });
      await this.loadComments(postId);
      this.setData({
        inputExpanded: false,
        inputValue: "",
        replyTarget: null,
      });
      wx.showToast({ title: "评论成功", icon: "success" });
    } catch (error) {
      console.error("publish comment failed", error);
      wx.showToast({ title: error.message || "评论失败", icon: "none" });
    } finally {
      this.setData({ commentSubmitting: false });
    }
  },

  async togglePostLike() {
    const post = this.data.post;
    const postId = post && (post.id || post._id);
    if (!postId || this.data.postActionLoading) {
      return;
    }
    this.setData({ postActionLoading: true });
    try {
      await api.login();
      const result = await api.toggleLike("post", postId);
      this.setData({
        postLiked: !!result.liked,
        "post.likes": Number(result.likes ?? post.likes ?? 0) || 0,
      });
    } catch (error) {
      wx.showToast({ title: error.message || "点赞失败", icon: "none" });
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
        authorName: post.author?.name || "SemiParty 用户",
        topicName: this.data.topicName || post.topicName || post.zoneName || "",
        likes: Number(post.likes || 0) || 0,
        comments: Number(post.comments || 0) || 0,
      });
      this.setData({ postFavorited: !!result.favorited });
      wx.showToast({ title: result.favorited ? "已收藏" : "已取消收藏", icon: "none" });
    } catch (error) {
      wx.showToast({ title: error.message || "收藏失败", icon: "none" });
    } finally {
      this.setData({ postActionLoading: false });
    }
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
      wx.showToast({ title: error.message || "关注失败", icon: "none" });
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
      success: (result) => {
        if (result.tapIndex === 0) {
          wx.setClipboardData({ data: this.data.post?.content || "" });
        } else {
          wx.showToast({ title: "举报入口后续开放", icon: "none" });
        }
      },
    });
  },

  onLoadMoreComments() {
    wx.showToast({ title: "当前已加载最新评论", icon: "none" });
  },

  onCommentImageTap(event) {
    const url = event.currentTarget.dataset.url;
    const commentIndex = event.currentTarget.dataset.commentIndex;
    const comment = this.data.commentList[commentIndex] || {};
    const urls = Array.isArray(comment.images) ? comment.images : [];
    if (!url || !urls.length) {
      return;
    }
    wx.previewImage({ current: url, urls });
  },

  onToolbarDisabledTap() {
    wx.showToast({ title: "当前版本暂不支持图片或附件评论", icon: "none" });
  },

  onShareAppMessage() {
    const post = this.data.post || {};
    return {
      title: post.title || (post.content || "SemiParty 社区讨论").slice(0, 28),
      path: `/pages/post-detail/post-detail?id=${post.id || post._id || ""}`,
    };
  },

  onShareTimeline() {
    const post = this.data.post || {};
    return {
      title: post.title || (post.content || "SemiParty 社区讨论").slice(0, 28),
      query: `id=${post.id || post._id || ""}`,
    };
  },
});
