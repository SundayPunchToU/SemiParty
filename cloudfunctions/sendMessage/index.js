const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { chatId, content, type = "text" } = event;

  if (!chatId || !content) {
    throw new Error("chatId and content are required");
  }

  const chatRes = await db.collection("chats").doc(chatId).get();
  const chat = chatRes.data;
  const participants = chat.participants || [];

  if (!participants.includes(OPENID)) {
    throw new Error("permission denied");
  }

  const messageData = {
    chatId,
    senderUid: OPENID,
    type,
    content,
    readBy: [OPENID],
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  };

  const createRes = await db.collection("messages").add({
    data: messageData,
  });

  const unreadMap = { ...(chat.unreadMap || {}) };
  participants.forEach((uid) => {
    unreadMap[uid] = uid === OPENID ? 0 : (unreadMap[uid] || 0) + 1;
  });

  await db.collection("chats").doc(chatId).update({
    data: {
      lastMessage: type === "image" ? "[image]" : String(content).slice(0, 80),
      unreadMap,
      updatedAt: db.serverDate(),
    },
  });

  return {
    success: true,
    data: {
      _id: createRes._id,
      ...messageData,
    },
  };
};
