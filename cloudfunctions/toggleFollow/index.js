const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { targetUid } = event;

  if (!targetUid) {
    throw new Error("targetUid is required");
  }

  if (targetUid === OPENID) {
    throw new Error("cannot follow self");
  }

  const followCollection = db.collection("follows");
  const existing = await followCollection
    .where({ uid: OPENID, targetUid })
    .limit(1)
    .get();

  const sourceUser = await db.collection("users").where({ openid: OPENID }).limit(1).get();
  const targetUser = await db.collection("users").where({ openid: targetUid }).limit(1).get();

  if (!sourceUser.data.length || !targetUser.data.length) {
    throw new Error("user not found");
  }

  if (existing.data.length) {
    await followCollection.doc(existing.data[0]._id).remove();
    await db.collection("users").doc(sourceUser.data[0]._id).update({
      data: {
        "stats.following": _.inc(-1),
        updatedAt: db.serverDate(),
      },
    });
    await db.collection("users").doc(targetUser.data[0]._id).update({
      data: {
        "stats.followers": _.inc(-1),
        updatedAt: db.serverDate(),
      },
    });

    return {
      success: true,
      followed: false,
    };
  }

  await followCollection.add({
    data: {
      uid: OPENID,
      targetUid,
      createdAt: db.serverDate(),
    },
  });
  await db.collection("users").doc(sourceUser.data[0]._id).update({
    data: {
      "stats.following": _.inc(1),
      updatedAt: db.serverDate(),
    },
  });
  await db.collection("users").doc(targetUser.data[0]._id).update({
    data: {
      "stats.followers": _.inc(1),
      updatedAt: db.serverDate(),
    },
  });

  return {
    success: true,
    followed: true,
  };
};
