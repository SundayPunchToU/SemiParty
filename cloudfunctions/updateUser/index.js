const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

function normalizeUpdate(field, value, payload) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return {
      ...payload,
      updatedAt: db.serverDate(),
    };
  }

  if (!field) {
    throw new Error("field is required");
  }

  return {
    [field]: value,
    updatedAt: db.serverDate(),
  };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const userCollection = db.collection("users");
  const existing = await userCollection.where({ openid: OPENID }).limit(1).get();

  if (!existing.data.length) {
    throw new Error("user not found");
  }

  const updateData = normalizeUpdate(event.field, event.value, event.payload);
  await userCollection.doc(existing.data[0]._id).update({
    data: updateData,
  });

  const latest = await userCollection.doc(existing.data[0]._id).get();
  return {
    success: true,
    data: latest.data,
  };
};
