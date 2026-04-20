const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

function normalizeTags(tags = []) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") return String(item.text || item.label || item.name || "").trim();
      return "";
    })
    .filter(Boolean)
    .slice(0, 5);
}

function buildAuthor(user, openid, isAnonymous) {
  const nickname = isAnonymous ? "匿名用户" : user.nickName || "SemiParty 用户";
  const titleParts = [user.roleLabel || user.title || "", user.company || ""].filter(Boolean);
  return {
    userId: openid,
    uid: openid,
    nickname,
    name: nickname,
    avatar: user.avatarUrl || user.avatar || "",
    avatarUrl: user.avatarUrl || user.avatar || "",
    avatarText: isAnonymous ? "匿" : user.avatarText || nickname.slice(0, 1) || "U",
    avatarBg: user.avatarBg || "#DCE8FF",
    avatarColor: user.avatarColor || "#165DC6",
    roleLabel: user.roleLabel || "",
    role: user.roleLabel || "",
    company: user.company || "",
    title: isAnonymous ? "匿名发布" : titleParts.join(" · "),
    experience: user.experience || "",
  };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const topicId = event.topicId === undefined ? undefined : String(event.topicId || "").trim();
  const contentType = String(event.contentType || "chat").trim() || "chat";
  const title = String(event.title || "").trim();
  const content = String(event.content || "").trim();
  const tags = normalizeTags(event.tags);
  const isAnonymous = Boolean(event.isAnonymous);

  if (topicId === undefined) {
    throw new Error("topicId is required");
  }

  if (!content) {
    throw new Error("content is required");
  }

  const userRes = await db.collection("users").where({ openid: OPENID }).limit(1).get();
  if (!userRes.data.length) {
    throw new Error("user not found");
  }

  let topicName = "";
  let topicDoc = null;
  if (topicId) {
    const topicRes = await db.collection("tea_room_topics").where({ topicId }).limit(1).get();
    if (!topicRes.data.length) {
      throw new Error("topic not found");
    }
    topicDoc = topicRes.data[0];
    topicName = topicDoc.topicName || "";
  }

  const user = userRes.data[0];
  const author = buildAuthor(user, OPENID, isAnonymous);
  const now = db.serverDate();

  const postData = {
    uid: OPENID,
    userId: OPENID,
    topicId: topicId || "",
    topicName,
    contentType,
    title,
    content,
    tags,
    topic: topicName ? { text: topicName, type: "blue" } : null,
    isAnonymous,
    anonymous: isAnonymous,
    images: [],
    location: "",
    author,
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    likes: 0,
    comments: 0,
    views: 0,
    shares: 0,
    likedOpenids: [],
    createdAt: now,
    updatedAt: now,
  };

  const createRes = await db.collection("posts").add({ data: postData });

  const tasks = [
    db.collection("users").doc(user._id).update({
      data: {
        postCount: _.inc(1),
        "stats.posts": _.inc(1),
        updatedAt: now,
      },
    }).catch(() => null),
  ];

  if (topicDoc) {
    tasks.push(
      db.collection("tea_room_topics").doc(topicDoc._id).update({
        data: {
          postCount: _.inc(1),
        },
      }).catch(() => null)
    );
  }

  await Promise.all(tasks);

  return {
    success: true,
    data: {
      _id: createRes._id,
      id: createRes._id,
      ...postData,
    },
  };
};
