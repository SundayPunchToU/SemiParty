const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

function buildDefaultUser(openid) {
  return {
    openid,
    nickName: "陈工",
    avatarText: "陈",
    avatarUrl: "",
    title: "工艺整合工程师",
    company: "SemiParty",
    experience: "5年",
    jobStatus: "open",
    avatarBg: "#DCE8FF",
    avatarColor: "#165DC6",
    // 角色相关字段
    primaryRole: null,
    secondaryRole: null,
    roleLabel: null,
    education: null,
    city: null,
    // 内容统计字段
    postCount: 0,
    answerCount: 0,
    articleCount: 0,
    collectCount: 0,
    // 社交统计字段
    followingCount: 0,
    followerCount: 0,
    likedCount: 0,
    // 状态字段
    onboardingDone: false,
    profileComplete: false,
    stats: {
      posts: 0,
      likes: 0,
      following: 0,
      followers: 0,
    },
    resume: {
      basicInfo: {},
      jobIntent: {},
      education: [],
      workExperience: [],
      projects: [],
      skills: [],
      summary: "",
      completion: 0,
    },
    settings: {
      privacy: {
        resumeVisible: true,
        showInTalentMarket: true,
        anonymousPostTraceable: false,
      },
      notification: {
        newMessage: true,
        comment: true,
        like: true,
        system: true,
      },
    },
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  };
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const userCollection = db.collection("users");
  const existing = await userCollection.where({ openid: OPENID }).limit(1).get();

  if (existing.data.length) {
    return {
      success: true,
      openid: OPENID,
      user: existing.data[0],
    };
  }

  const user = buildDefaultUser(OPENID);
  const createRes = await userCollection.add({
    data: user,
  });

  return {
    success: true,
    openid: OPENID,
    user: {
      _id: createRes._id,
      ...user,
    },
  };
};
