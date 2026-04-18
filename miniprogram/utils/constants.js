module.exports = {
  homeTabs: [
    { key: "recommend", label: "推荐" },
    // === STEP 1.2 修改开始：Tab 文字改造 ===
    { key: "industry", label: "资讯" },
    { key: "knowledge", label: "关注" },
    { key: "company", label: "茶水间" },
    // === STEP 1.2 修改结束 ===
  ],
  communityTabs: [
    { key: "hot", label: "热门" },
    { key: "job", label: "求职交流" },
    { key: "tech", label: "技术讨论" },
    { key: "career", label: "职场吐槽" },
  ],
  // === STEP 1.6 修改开始：重排 Tab 顺序 + 新增互动 Tab ===
  messageTabs: [
    { key: "interaction", label: "互动" },
    { key: "private", label: "私聊" },
    { key: "group", label: "群组" },
    { key: "system", label: "通知" },
  ],
  // === STEP 1.6 修改结束 ===
  jobMarketModes: [
    { key: "job", label: "找工作" },
    { key: "talent", label: "找人才" },
  ],
  jobFilters: [
    { key: "all", label: "全部" },
    { key: "process", label: "工艺" },
    { key: "design", label: "设计" },
    { key: "package", label: "封测" },
    { key: "equipment", label: "设备" },
    { key: "eda", label: "EDA" },
    { key: "material", label: "材料" }
  ],
  profileStatuses: [
    { key: "open", label: "在看机会", dot: "#3bd39c", bg: "#ddf5ee", color: "#157658" },
    { key: "active", label: "主动求职", dot: "#2a7fff", bg: "#dce8ff", color: "#165dc6" },
    { key: "closed", label: "暂不考虑", dot: "#8f8a81", bg: "#ece7de", color: "#5f5b54" }
  ]
};
