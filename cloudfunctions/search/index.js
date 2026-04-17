const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

const PAGE_SIZE = 20;
const CHUNK_SIZE = 40;
const DEFAULT_SCAN_LIMIT = 160;
const SEARCH_CONFIG = {
  news: {
    collection: "news",
    fields: ["title", "summary", "content", "source"],
  },
  post: {
    collection: "posts",
    fields: ["content", "category", "topic"],
  },
  job: {
    collection: "jobs",
    fields: ["title", "company", "city", "description", "tags"],
  },
  talent: {
    collection: "talents",
    fields: ["name", "nameDesensitized", "school", "currentRole", "targetRole", "tags"],
  },
};

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

async function scanCollectionForKeyword(type, keyword, page, options = {}) {
  const config = SEARCH_CONFIG[type];
  if (!config) {
    return {
      data: [],
      hasMore: false,
    };
  }

  const requiredMatches = Math.max(1, page) * PAGE_SIZE;
  const maxMatches = options.maxMatches || requiredMatches;
  const scanLimit = options.scanLimit || DEFAULT_SCAN_LIMIT;
  const matched = [];
  let scanned = 0;
  let hasMoreSource = true;

  while (scanned < scanLimit && hasMoreSource && matched.length < maxMatches) {
    const batch = await db
      .collection(config.collection)
      .skip(scanned)
      .limit(CHUNK_SIZE)
      .get();

    const docs = batch.data || [];
    if (!docs.length) {
      hasMoreSource = false;
      break;
    }

    docs.forEach((item) => {
      if (containsKeyword(item, keyword, config.fields)) {
        matched.push(item);
      }
    });

    scanned += docs.length;
    hasMoreSource = docs.length === CHUNK_SIZE;
  }

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  return {
    data: matched.slice(start, end),
    hasMore: matched.length > end || (hasMoreSource && scanned < scanLimit),
  };
}

exports.main = async (event) => {
  const keyword = (event.keyword || "").trim();
  const type = event.type || "all";
  const page = Number(event.page || 1);

  if (!keyword) {
    return {
      success: true,
      data: type === "all" ? { news: [], posts: [], jobs: [], talents: [] } : [],
      hasMore: false,
    };
  }

  if (type === "news" || type === "post" || type === "job" || type === "talent") {
    const result = await scanCollectionForKeyword(type, keyword, page);
    return {
      success: true,
      data: result.data,
      hasMore: result.hasMore,
    };
  }

  const [news, post, job, talent] = await Promise.all([
    scanCollectionForKeyword("news", keyword, 1, { maxMatches: 6, scanLimit: 80 }),
    scanCollectionForKeyword("post", keyword, 1, { maxMatches: 6, scanLimit: 80 }),
    scanCollectionForKeyword("job", keyword, 1, { maxMatches: 6, scanLimit: 80 }),
    scanCollectionForKeyword("talent", keyword, 1, { maxMatches: 6, scanLimit: 80 }),
  ]);

  return {
    success: true,
    data: {
      news: news.data,
      posts: post.data,
      jobs: job.data,
      talents: talent.data,
    },
    hasMore: false,
  };
};
