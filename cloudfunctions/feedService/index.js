const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// ─── 推荐流 ───
async function getRecommendFeed(event) {
  const { page = 1, size = 20 } = event;
  const skip = (page - 1) * size;

  // 混排逻辑：按 likes + 时间权重排序
  const countRes = await db.collection("posts").where({ contentType: _.neq(null) }).count();
  const postsRes = await db.collection("posts")
    .where({ contentType: _.neq(null) })
    .orderBy("likes", "desc")
    .orderBy("createdAt", "desc")
    .skip(skip)
    .limit(size)
    .get();

  return { posts: postsRes.data, total: countRes.total, page, size };
}

// ─── 关注流 ───
async function getFollowingFeed(event, openid) {
  const { page = 1, size = 20 } = event;
  const skip = (page - 1) * size;

  const joinRes = await db.collection("user_zones").where({ userId: openid }).field({ zoneId: true }).get();
  if (!joinRes.data.length) return { posts: [], total: 0, page, size };

  const zoneIds = joinRes.data.map(j => j.zoneId);
  const query = { zoneId: _.in(zoneIds) };
  const countRes = await db.collection("posts").where(query).count();
  const postsRes = await db.collection("posts")
    .where(query)
    .orderBy("createdAt", "desc")
    .skip(skip)
    .limit(size)
    .get();

  return { posts: postsRes.data, total: countRes.total, page, size };
}

// ─── 相关推荐帖子 ───
async function getRelatedPosts(event) {
  const { postId, limit = 3 } = event;

  // 先获取原帖信息
  const postRes = await db.collection("posts").doc(postId).get();
  if (!postRes.data) throw new Error("post not found");
  const post = postRes.data;

  // 构建查询：同专区 + 排除自身
  const query = { _id: _.neq(postId) };
  if (post.zoneId) query.zoneId = post.zoneId;
  if (post.contentType) query.contentType = post.contentType;

  const postsRes = await db.collection("posts")
    .where(query)
    .orderBy("likes", "desc")
    .limit(limit)
    .get();

  return { posts: postsRes.data };
}

// ─── Main ───
exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();

  switch (event.action) {
    case "recommendFeed": return await getRecommendFeed(event);
    case "followingFeed": return await getFollowingFeed(event, OPENID);
    case "relatedPosts": return await getRelatedPosts(event);
    default: throw new Error("unknown action: " + event.action);
  }
};
