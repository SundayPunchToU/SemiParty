const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

async function findUserByUidOrOpenid(uidOrOpenid) {
  const byOpenid = await db.collection("users").where({ openid: uidOrOpenid }).limit(1).get();
  if (byOpenid.data.length) {
    return byOpenid.data[0];
  }

  const byUid = await db.collection("users").where({ uid: uidOrOpenid }).limit(1).get();
  return byUid.data[0] || null;
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { targetUid, type = "private" } = event;

  if (!targetUid) {
    throw new Error("targetUid is required");
  }

  const currentUser = await findUserByUidOrOpenid(OPENID);
  const targetUser = await findUserByUidOrOpenid(targetUid);

  if (!targetUser) {
    throw new Error("chat participants not found");
  }

  const targetOpenid = targetUser.openid;
  const existing = await db.collection("chats").where({ type }).limit(100).get();
  const matched = existing.data.find((item) => {
    const participants = item.participants || [];
    return participants.includes(OPENID) && participants.includes(targetOpenid);
  });

  if (matched) {
    return {
      success: true,
      chatId: matched._id,
      existed: true,
      data: matched,
    };
  }

  if (!currentUser) {
    throw new Error("chat participants not found");
  }

  const data = {
    type,
    participants: [OPENID, targetOpenid],
    participantProfiles: [
      {
        uid: OPENID,
        name: currentUser.nickName || currentUser.nickname || "我",
        avatarText: currentUser.avatarText || "我",
      },
      {
        uid: targetOpenid,
        name: targetUser.nickName || targetUser.nickname || "候选人",
        avatarText: targetUser.avatarText || "聊",
      },
    ],
    lastMessage: "",
    lastMessageAt: db.serverDate(),
    unreadMap: {
      [OPENID]: 0,
      [targetOpenid]: 0,
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
