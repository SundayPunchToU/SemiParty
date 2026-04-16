const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { targetUid, type = "private" } = event;

  if (!targetUid) {
    throw new Error("targetUid is required");
  }

  const existing = await db.collection("chats").where({ type }).limit(100).get();
  const matched = existing.data.find((item) => {
    const participants = item.participants || [];
    return participants.includes(OPENID) && participants.includes(targetUid);
  });

  if (matched) {
    return {
      success: true,
      chatId: matched._id,
      existed: true,
      data: matched,
    };
  }

  const userRes = await db.collection("users").where({ openid: OPENID }).limit(1).get();
  const targetRes = await db.collection("users").where({ openid: targetUid }).limit(1).get();

  if (!userRes.data.length || !targetRes.data.length) {
    throw new Error("chat participants not found");
  }

  const data = {
    type,
    participants: [OPENID, targetUid],
    participantProfiles: [
      {
        uid: OPENID,
        name: userRes.data[0].nickName,
        avatarText: userRes.data[0].avatarText,
      },
      {
        uid: targetUid,
        name: targetRes.data[0].nickName,
        avatarText: targetRes.data[0].avatarText,
      },
    ],
    lastMessage: "",
    unreadMap: {
      [OPENID]: 0,
      [targetUid]: 0,
    },
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  };

  const createRes = await db.collection("chats").add({
    data,
  });

  return {
    success: true,
    chatId: createRes._id,
    existed: false,
    data: {
      _id: createRes._id,
      ...data,
    },
  };
};
