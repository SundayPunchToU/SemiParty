const cloud = require("wx-server-sdk");
const { ROLE_MODULES, PRIMARY_ROLES, EXPERIENCE_OPTIONS } = require("../config/roleModules");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

// 不允许用户通过 profile 接口修改的字段
const PROTECTED_FIELDS = [
  "postCount", "answerCount", "articleCount", "collectCount",
  "followingCount", "followerCount", "likedCount",
  "onboardingDone", "profileComplete",
  "openid", "_id", "_openid", "createdAt",
  "stats", "resume", "settings",
];

// 允许更新的可变字段
const EDITABLE_FIELDS = [
  "nickname", "avatar", "avatarUrl",
  "primaryRole", "secondaryRole", "roleLabel",
  "company", "experience", "education", "city",
  "title", "jobStatus", "avatarBg", "avatarColor", "avatarText",
];

async function getOrCreateUser(openid) {
  const res = await db.collection("users").where({ openid }).limit(1).get();
  if (res.data.length) return res.data[0];
  return null;
}

// ── Action: getProfile ──
async function getProfile(openid) {
  const user = await getOrCreateUser(openid);
  if (!user) return { success: false, error: "用户不存在" };

  return {
    success: true,
    data: {
      userId: openid,
      nickname: user.nickName || "",
      avatar: user.avatarUrl || "",
      primaryRole: user.primaryRole || null,
      secondaryRole: user.secondaryRole || null,
      roleLabel: user.roleLabel || null,
      company: user.company || null,
      experience: user.experience || null,
      education: user.education || null,
      city: user.city || null,
      postCount: user.postCount || 0,
      answerCount: user.answerCount || 0,
      articleCount: user.articleCount || 0,
      collectCount: user.collectCount || 0,
      followingCount: user.followingCount || 0,
      followerCount: user.followerCount || 0,
      likedCount: user.likedCount || 0,
      onboardingDone: user.onboardingDone || false,
      profileComplete: user.profileComplete || false,
      createdAt: user.createdAt,
    },
  };
}

// ── Action: updateProfile ──
async function updateProfile(openid, event) {
  const user = await getOrCreateUser(openid);
  if (!user) return { success: false, error: "用户不存在" };

  const updateData = { updatedAt: db.serverDate() };
  let hasProfileField = false;
  const profileFields = [
    "primaryRole", "secondaryRole", "roleLabel",
    "company", "experience", "education", "city",
  ];

  for (const key of EDITABLE_FIELDS) {
    if (event[key] !== undefined) {
      updateData[key] = event[key];
      if (profileFields.includes(key)) hasProfileField = true;
    }
  }

  // nickName 兼容 nickname 传入
  if (event.nickname !== undefined) {
    updateData.nickName = event.nickname;
  }

  // 如果传入了 primaryRole 且不为 null，标记引导完成
  if (event.primaryRole && event.primaryRole !== null) {
    updateData.onboardingDone = true;
  }

  // 检查资料完善度
  if (hasProfileField) {
    updateData.profileComplete = !!(
      user.primaryRole || event.primaryRole
    ) && !!(
      user.company || event.company
    );
  }

  await db.collection("users").doc(user._id).update({ data: updateData });

  return getProfile(openid);
}

// ── Action: onboarding ──
async function handleOnboarding(openid, event) {
  const user = await getOrCreateUser(openid);
  if (!user) return { success: false, error: "用户不存在" };

  if (!event.primaryRole) {
    return { success: false, error: "primaryRole 为必填项" };
  }

  const profileUpdate = {
    primaryRole: event.primaryRole,
    onboardingDone: true,
    updatedAt: db.serverDate(),
  };

  if (event.roleLabel) profileUpdate.roleLabel = event.roleLabel;
  if (event.company) profileUpdate.company = event.company;
  if (event.experience) profileUpdate.experience = event.experience;
  if (event.city) profileUpdate.city = event.city;

  // 检查资料完善度
  profileUpdate.profileComplete = !!(event.company);

  await db.collection("users").doc(user._id).update({ data: profileUpdate });

  // 批量加入专区
  const joinedZones = [];
  if (Array.isArray(event.joinZoneIds) && event.joinZoneIds.length > 0) {
    for (const zoneId of event.joinZoneIds) {
      // 检查是否已加入
      const existing = await db.collection("user_zones").where({
        openid,
        zoneId,
      }).limit(1).get();

      if (existing.data.length === 0) {
        await db.collection("user_zones").add({
          data: {
            openid,
            zoneId,
            joinedAt: db.serverDate(),
          },
        });
        // memberCount +1
        await db.collection("zones").where({ zoneId }).update({
          data: { memberCount: _.inc(1) },
        }).catch(() => {});
      }

      // 获取专区信息
      const zoneRes = await db.collection("zones").where({ zoneId }).limit(1).get();
      if (zoneRes.data.length) {
        joinedZones.push(zoneRes.data[0]);
      }
    }
  }

  const profile = await getProfile(openid);

  return {
    success: true,
    data: {
      profile: profile.data,
      joinedZones,
    },
  };
}

// ── Action: getRoleModules ──
async function getRoleModules(openid) {
  const user = await getOrCreateUser(openid);

  const role = (user && user.primaryRole) || "other";
  const modules = ROLE_MODULES[role] || ROLE_MODULES.other;

  return {
    success: true,
    data: {
      role,
      modules: modules.map(({ key, name, icon }) => ({ key, name, icon })),
    },
  };
}

// ── Action: getConfig ──
async function getConfig() {
  return {
    success: true,
    data: {
      roles: PRIMARY_ROLES,
      experienceOptions: EXPERIENCE_OPTIONS,
    },
  };
}

// ── Main Entry ──
exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action } = event;

  switch (action) {
    case "getProfile":
      return getProfile(OPENID);
    case "updateProfile":
      return updateProfile(OPENID, event);
    case "onboarding":
      return handleOnboarding(OPENID, event);
    case "getRoleModules":
      return getRoleModules(OPENID);
    case "getConfig":
      return getConfig();
    default:
      return { success: false, error: `未知 action: ${action}` };
  }
};
