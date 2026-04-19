const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

function normalizeTags(tags = []) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }
      if (item && typeof item === "object") {
        return String(item.text || item.label || item.name || "").trim();
      }
      return "";
    })
    .filter(Boolean)
    .slice(0, 5);
}

function buildAuthor(user, openid, isAnonymous) {
  const nickname = isAnonymous ? "匿名用户" : (user.nickName || "SemiParty 用户");
  const titleParts = [user.roleLabel || user.title || "", user.company || ""].filter(Boolean);
  const title = isAnonymous ? "匿名发布" : titleParts.join(" 路 ");
  const avatar = user.avatarUrl || user.avatar || "";

  return {
    userId: openid,
    uid: openid,
    nickname,
    name: nickname,
    avatar,
    avatarUrl: avatar,
    avatarText: isAnonymous ? "匿" : (user.avatarText || nickname.slice(0, 1) || "U"),
    avatarBg: user.avatarBg || "#DCE8FF",
    avatarColor: user.avatarColor || "#165DC6",
    roleLabel: user.roleLabel || "",
    role: user.roleLabel || "",
    company: user.company || "",
    title,
    experience: user.experience || "",
  };
}

function buildTopic(tags = []) {
  if (!tags.length) {
    return null;
  }

  return {
    text: tags[0],
    type: "blue",
  };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const zoneId = String(event.zoneId || "").trim();
  const contentType = String(event.contentType || "discuss").trim() || "discuss";
  const title = String(event.title || "").trim();
  const content = String(event.content || "").trim();
  const tags = normalizeTags(event.tags);
  const isAnonymous = Boolean(event.isAnonymous);

  if (!zoneId) {
    throw new Error("zoneId is required");
  }

  if (!content) {
    throw new Error("content is required");
  }

  const [userRes, zoneRes] = await Promise.all([
    db.collection("users").where({ openid: OPENID }).limit(1).get(),
    db.collection("zones").where({ zoneId }).limit(1).get(),
  ]);

  if (!userRes.data.length) {
    throw new Error("user not found");
  }

  if (!zoneRes.data.length) {
    throw new Error("zone not found");
  }

  const user = userRes.data[0];
  const zone = zoneRes.data[0];
  const author = buildAuthor(user, OPENID, isAnonymous);
  const topic = buildTopic(tags);
  const now = db.serverDate();

  const postData = {
    uid: OPENID,
    userId: OPENID,
    zoneId,
    zoneName: zone.zoneName || "",
    category: zone.category || "hot",
    contentType,
    title,
    content,
    tags,
    topic,
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

  const createRes = await db.collection("posts").add({
    data: postData,
  });

  await Promise.all([
    db.collection("zones").doc(zone._id).update({
      data: {
        totalPostCount: _.inc(1),
        updatedAt: now,
      },
    }).catch(() => null),
    db.collection("users").doc(user._id).update({
      data: {
        postCount: _.inc(1),
        "stats.posts": _.inc(1),
        updatedAt: now,
      },
    }).catch(() => null),
  ]);

  return {
    success: true,
    data: {
      _id: createRes._id,
      id: createRes._id,
      ...postData,
    },
  };
};
