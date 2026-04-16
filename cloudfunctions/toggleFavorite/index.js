const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

function getCollectionByType(targetType) {
  const mapping = {
    news: "news",
    post: "posts",
    job: "jobs",
    talent: "talents",
  };
  return mapping[targetType] || "";
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { targetType, targetId, targetSummary = {} } = event;

  if (!targetType || !targetId) {
    throw new Error("targetType and targetId are required");
  }

  const favoriteCollection = db.collection("favorites");
  const existing = await favoriteCollection
    .where({ uid: OPENID, targetType, targetId })
    .limit(1)
    .get();

  if (existing.data.length) {
    await favoriteCollection.doc(existing.data[0]._id).remove();
    const sourceCollection = getCollectionByType(targetType);
    if (sourceCollection) {
      try {
        await db.collection(sourceCollection).doc(targetId).update({
          data: {
            favorites: _.inc(-1),
            updatedAt: db.serverDate(),
          },
        });
      } catch (error) {
        console.warn("favorite decrement skipped", error);
      }
    }

    return {
      success: true,
      favorited: false,
    };
  }

  await favoriteCollection.add({
    data: {
      uid: OPENID,
      targetType,
      targetId,
      targetSummary,
      createdAt: db.serverDate(),
    },
  });

  const sourceCollection = getCollectionByType(targetType);
  if (sourceCollection) {
    try {
      await db.collection(sourceCollection).doc(targetId).update({
        data: {
          favorites: _.inc(1),
          updatedAt: db.serverDate(),
        },
      });
    } catch (error) {
      console.warn("favorite increment skipped", error);
    }
  }

  return {
    success: true,
    favorited: true,
  };
};
