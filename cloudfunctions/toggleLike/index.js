const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

function getCollectionByTargetType(targetType) {
  const mapping = {
    news: "news",
    post: "posts",
    comment: "comments",
  };

  if (!mapping[targetType]) {
    throw new Error(`unsupported targetType: ${targetType}`);
  }

  return mapping[targetType];
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { targetType, targetId } = event;

  if (!targetType || !targetId) {
    throw new Error("targetType and targetId are required");
  }

  const collection = getCollectionByTargetType(targetType);
  const targetRes = await db.collection(collection).doc(targetId).get();
  const target = targetRes.data;
  const likedOpenids = target.likedOpenids || [];
  const hasLiked = likedOpenids.includes(OPENID);

  await db.collection(collection).doc(targetId).update({
    data: {
      likedOpenids: hasLiked ? _.pull(OPENID) : _.push([OPENID]),
      likes: _.inc(hasLiked ? -1 : 1),
      updatedAt: db.serverDate(),
    },
  });

  if (targetType === "post" && target.uid && target.uid !== OPENID) {
    const ownerRes = await db.collection("users").where({ openid: target.uid }).limit(1).get();
    if (ownerRes.data.length) {
      await db.collection("users").doc(ownerRes.data[0]._id).update({
        data: {
          "stats.likes": _.inc(hasLiked ? -1 : 1),
          updatedAt: db.serverDate(),
        },
      });
    }
  }

  return {
    success: true,
    liked: !hasLiked,
    likes: Math.max(0, (target.likes || 0) + (hasLiked ? -1 : 1)),
  };
};
