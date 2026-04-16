const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

function getCounterField(targetType) {
  if (targetType === "news") {
    return "commentsCount";
  }

  return "comments";
}

function getTargetCollection(targetType) {
  if (targetType === "news") {
    return "news";
  }

  if (targetType === "post") {
    return "posts";
  }

  throw new Error(`unsupported targetType: ${targetType}`);
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { targetType, targetId, content, parentId = "", replyTo = "" } = event;

  if (!targetType || !targetId || !(content || "").trim()) {
    throw new Error("targetType, targetId and content are required");
  }

  const userRes = await db.collection("users").where({ openid: OPENID }).limit(1).get();
  if (!userRes.data.length) {
    throw new Error("user not found");
  }

  const user = userRes.data[0];
  const commentData = {
    targetType,
    targetId,
    parentId,
    replyTo,
    uid: OPENID,
    author: {
      uid: OPENID,
      name: user.nickName,
      avatarText: user.avatarText || user.nickName?.slice(0, 1) || "U",
      avatarBg: user.avatarBg || "#DCE8FF",
      avatarColor: user.avatarColor || "#165DC6",
    },
    content: content.trim(),
    likes: 0,
    likedOpenids: [],
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  };

  const createRes = await db.collection("comments").add({
    data: commentData,
  });

  if (!parentId) {
    const collection = getTargetCollection(targetType);
    const counterField = getCounterField(targetType);
    await db.collection(collection).doc(targetId).update({
      data: {
        [counterField]: _.inc(1),
        updatedAt: db.serverDate(),
      },
    });
  }

  return {
    success: true,
    data: {
      _id: createRes._id,
      ...commentData,
    },
  };
};
