const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { chatId } = event;

  if (!chatId) {
    throw new Error("chatId is required");
  }

  const chatRef = db.collection("chats").doc(chatId);
  const chatRes = await chatRef.get();
  const chat = chatRes.data;

  if (!chat) {
    throw new Error("chat not found");
  }

  const participants = chat.participants || [];
  if (!participants.includes(OPENID)) {
    throw new Error("permission denied");
  }

  const unreadMap = {
    ...(chat.unreadMap || {}),
    [OPENID]: 0,
  };

  await chatRef.update({
    data: {
      unreadMap,
    },
  });

  return {
    success: true,
    unreadMap,
  };
};
