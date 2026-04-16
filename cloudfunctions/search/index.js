const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

const PAGE_SIZE = 20;

function containsKeyword(record, keyword, fields) {
  const source = fields
    .map((field) => {
      const value = record[field];
      if (Array.isArray(value)) {
        return value.join(" ");
      }
      if (typeof value === "object" && value) {
        return JSON.stringify(value);
      }
      return value || "";
    })
    .join(" ")
    .toLowerCase();

  return source.includes(keyword.toLowerCase());
}

async function searchCollection(collectionName, keyword, fields, page) {
  const res = await db.collection(collectionName).limit(100).get();
  const filtered = res.data.filter((item) => containsKeyword(item, keyword, fields));
  const start = (page - 1) * PAGE_SIZE;
  const data = filtered.slice(start, start + PAGE_SIZE);

  return {
    data,
    hasMore: start + PAGE_SIZE < filtered.length,
  };
}

exports.main = async (event) => {
  const keyword = (event.keyword || "").trim();
  const type = event.type || "all";
  const page = Number(event.page || 1);

  if (!keyword) {
    return {
      success: true,
      data: [],
      hasMore: false,
    };
  }

  if (type === "news") {
    return searchCollection("news", keyword, ["title", "summary", "content", "source"], page);
  }

  if (type === "post") {
    return searchCollection("posts", keyword, ["content", "category", "topic"], page);
  }

  if (type === "job") {
    return searchCollection("jobs", keyword, ["title", "company", "city", "description", "tags"], page);
  }

  if (type === "talent") {
    return searchCollection("talents", keyword, ["nameDesensitized", "school", "currentRole", "targetRole", "tags"], page);
  }

  const [news, posts, jobs, talents] = await Promise.all([
    searchCollection("news", keyword, ["title", "summary", "content", "source"], 1),
    searchCollection("posts", keyword, ["content", "category", "topic"], 1),
    searchCollection("jobs", keyword, ["title", "company", "city", "description", "tags"], 1),
    searchCollection("talents", keyword, ["nameDesensitized", "school", "currentRole", "targetRole", "tags"], 1),
  ]);

  return {
    success: true,
    data: {
      news: news.data,
      posts: posts.data,
      jobs: jobs.data,
      talents: talents.data,
    },
    hasMore: false,
  };
};
