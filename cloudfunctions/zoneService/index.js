const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const TEA_ROOM_TOPICS = [
  { topicId: "hot", topicName: "热门", sortOrder: 100 },
  { topicId: "tech-help", topicName: "#技术求助", sortOrder: 95 },
  { topicId: "cmp", topicName: "#CMP", sortOrder: 90 },
  { topicId: "finfet", topicName: "#FinFET", sortOrder: 85 },
  { topicId: "litho", topicName: "#光刻", sortOrder: 80 },
  { topicId: "night-shift", topicName: "#夜班日常", sortOrder: 75 },
  { topicId: "canteen", topicName: "#食堂测评", sortOrder: 70 },
  { topicId: "commute", topicName: "#通勤吐槽", sortOrder: 65 },
  { topicId: "gossip", topicName: "#行业八卦", sortOrder: 60 },
  { topicId: "job-hop", topicName: "#跳槽故事", sortOrder: 55 },
  { topicId: "salary", topicName: "#薪资爆料", sortOrder: 50 },
  { topicId: "interview", topicName: "#面经分享", sortOrder: 45 },
  { topicId: "fall-recruit", topicName: "#秋招进展", sortOrder: 40 },
  { topicId: "smic", topicName: "#中芯国际", sortOrder: 35 },
  { topicId: "cxmt", topicName: "#长鑫存储", sortOrder: 30 },
];

async function getTeaRoomTopics() {
  const res = await db.collection("tea_room_topics").orderBy("sortOrder", "desc").get();
  if (res.data.length) {
    return { topics: res.data };
  }
  return { topics: TEA_ROOM_TOPICS };
}

async function seedTopics() {
  const existing = await db.collection("tea_room_topics").limit(1).get();
  if (existing.data.length) {
    return;
  }

  for (const topic of TEA_ROOM_TOPICS) {
    await db.collection("tea_room_topics").add({
      data: {
        ...topic,
        postCount: 0,
        createdAt: db.serverDate(),
      },
    });
  }
}

exports.main = async (event) => {
  switch (event.action) {
    case "getTeaRoomTopics":
      return getTeaRoomTopics();
    case "seed":
      await seedTopics();
      return { success: true };
    default:
      throw new Error(`unknown action: ${event.action}`);
  }
};
