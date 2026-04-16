const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

const TOPIC_CATEGORY_MAP = {
  求职交流: "job",
  工艺讨论: "tech",
  薪资爆料: "career",
  行业八卦: "hot",
  秋招进展: "job",
  设备选型: "tech",
};

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const userRes = await db.collection("users").where({ openid: OPENID }).limit(1).get();

  if (!userRes.data.length) {
    throw new Error("user not found");
  }

  const user = userRes.data[0];
  const content = (event.content || "").trim();
  if (!content) {
    throw new Error("content is required");
  }

  const postData = {
    uid: OPENID,
    category: event.category || TOPIC_CATEGORY_MAP[event.topic] || "hot",
    author: {
      uid: OPENID,
      name: event.anonymous ? "匿名用户" : user.nickName,
      avatarText: event.anonymous ? "匿" : (user.avatarText || user.nickName?.slice(0, 1) || "U"),
      avatarBg: user.avatarBg || "#DCE8FF",
      avatarColor: user.avatarColor || "#165DC6",
      title: event.anonymous ? "匿名发布" : `${user.title || ""}${user.company ? ` · ${user.company}` : ""}`,
    },
    content,
    topic: event.topic
      ? {
          text: event.topic,
          type: event.topicType || "blue",
        }
      : null,
    images: event.images || [],
    location: event.location || "",
    anonymous: !!event.anonymous,
    likes: 0,
    comments: 0,
    shares: 0,
    likedOpenids: [],
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  };

  const createRes = await db.collection("posts").add({
    data: postData,
  });

  await db.collection("users").doc(user._id).update({
    data: {
      "stats.posts": _.inc(1),
      updatedAt: db.serverDate(),
    },
  });

  return {
    success: true,
    data: {
      _id: createRes._id,
      ...postData,
    },
  };
};
