const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

async function getRecommendFeed(event) {
  const { page = 1, size = 20 } = event;
  const skip = (page - 1) * size;

  const countRes = await db.collection("posts").count();
  const postsRes = await db.collection("posts")
    .orderBy("likes", "desc")
    .orderBy("createdAt", "desc")
    .skip(skip)
    .limit(size)
    .get();

  return { posts: postsRes.data, total: countRes.total, page, size };
}

async function getRelatedPosts(event) {
  const { postId, limit = 3 } = event;
  const postRes = await db.collection("posts").doc(postId).get();
  if (!postRes.data) throw new Error("post not found");

  const post = postRes.data;
  const query = { _id: _.neq(postId) };
  if (post.topicId) query.topicId = post.topicId;
  if (post.contentType) query.contentType = post.contentType;

  const postsRes = await db.collection("posts")
    .where(query)
    .orderBy("likes", "desc")
    .limit(limit)
    .get();

  return { posts: postsRes.data };
}

exports.main = async (event) => {
  switch (event.action) {
    case "recommendFeed":
      return getRecommendFeed(event);
    case "relatedPosts":
      return getRelatedPosts(event);
    default:
      throw new Error(`unknown action: ${event.action}`);
  }
};
