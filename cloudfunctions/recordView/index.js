const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

function getCollectionByType(type) {
  const mapping = {
    news: "news",
    post: "posts",
    job: "jobs",
    user: "users",
  };
  return mapping[type] || "";
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { type, targetId } = event;

  if (!type || !targetId) {
    throw new Error("type and targetId are required");
  }

  const collection = getCollectionByType(type);
  if (!collection) {
    throw new Error(`unsupported view type: ${type}`);
  }

  if (type === "user") {
    const existing = await db.collection("profile_views")
      .where({ viewerUid: OPENID, targetUid: targetId })
      .limit(1)
      .get();

    if (!existing.data.length) {
      await db.collection("profile_views").add({
        data: {
          viewerUid: OPENID,
          targetUid: targetId,
          createdAt: db.serverDate(),
        },
      });
    }

    return { success: true };
  }

  await db.collection(collection).doc(targetId).update({
    data: {
      views: _.inc(1),
      updatedAt: db.serverDate(),
    },
  });

  return { success: true };
};
