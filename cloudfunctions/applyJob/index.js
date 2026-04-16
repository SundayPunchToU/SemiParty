const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { jobId } = event;

  if (!jobId) {
    throw new Error("jobId is required");
  }

  const applicationCollection = db.collection("applications");
  const existing = await applicationCollection
    .where({ applicantUid: OPENID, jobId })
    .limit(1)
    .get();

  if (existing.data.length) {
    return {
      success: true,
      duplicated: true,
      data: existing.data[0],
    };
  }

  const jobRes = await db.collection("jobs").doc(jobId).get();
  const job = jobRes.data;
  const userRes = await db.collection("users").where({ openid: OPENID }).limit(1).get();
  if (!userRes.data.length) {
    throw new Error("user not found");
  }

  const record = {
    applicantUid: OPENID,
    applicantName: userRes.data[0].nickName,
    jobId,
    jobTitle: job.title,
    company: job.company,
    status: "pending",
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  };

  const createRes = await applicationCollection.add({
    data: record,
  });

  await db.collection("jobs").doc(jobId).update({
    data: {
      applicationsCount: _.inc(1),
      updatedAt: db.serverDate(),
    },
  });

  return {
    success: true,
    duplicated: false,
    data: {
      _id: createRes._id,
      ...record,
    },
  };
};
