/**
 * 角色功能模块配置
 * Step 3.1 — 后端角色体系
 */

const ROLE_MODULES = {
  engineer: [
    { key: "resume", name: "我的简历", icon: "📋", description: "管理个人简历" },
    { key: "applied", name: "投递记录", icon: "📬", description: "查看已投递的职位" },
    { key: "projects", name: "我的项目", icon: "📂", description: "管理参与的项目" },
    { key: "papers", name: "我的论文", icon: "📄", description: "管理发布的论文" },
    { key: "bookmarks", name: "我的收藏夹", icon: "🔖", description: "收藏的内容" },
  ],
  student: [
    { key: "resume", name: "我的简历", icon: "📋", description: "管理个人简历" },
    { key: "applied", name: "投递记录", icon: "📬", description: "查看已投递的职位" },
    { key: "interview", name: "我的面经", icon: "📝", description: "管理发布的面经" },
    { key: "calendar", name: "校招日历", icon: "🎓", description: "校园招聘时间表" },
    { key: "bookmarks", name: "我的收藏", icon: "🔖", description: "收藏的内容" },
  ],
  hr: [
    { key: "companyPage", name: "公司主页管理", icon: "📋", description: "管理公司展示页" },
    { key: "jobs", name: "发布/管理职位", icon: "📝", description: "发布和管理招聘职位" },
    { key: "candidates", name: "候选人管理", icon: "👥", description: "管理沟通过的候选人" },
    { key: "analytics", name: "招聘数据看板", icon: "📊", description: "查看招聘效果数据" },
    { key: "talentPool", name: "收藏的人才", icon: "🔖", description: "收藏的人才简历" },
  ],
  purchase: [
    { key: "demands", name: "我的需求", icon: "📦", description: "管理发布的采购需求" },
    { key: "inquiries", name: "询盘记录", icon: "📋", description: "查看询盘历史" },
    { key: "suppliers", name: "供应商收藏", icon: "🏭", description: "收藏的供应商" },
    { key: "bookmarks", name: "我的收藏", icon: "🔖", description: "收藏的内容" },
  ],
  manager: [
    { key: "teamRecruit", name: "团队招聘", icon: "👥", description: "管理团队招聘需求" },
    { key: "intel", name: "行业情报", icon: "📊", description: "行业动态与竞争分析" },
    { key: "projects", name: "项目合作", icon: "🤝", description: "项目合作与对接" },
    { key: "bookmarks", name: "我的收藏", icon: "🔖", description: "收藏的内容" },
  ],
  other: [
    { key: "bookmarks", name: "我的收藏", icon: "🔖", description: "收藏的内容" },
    { key: "history", name: "浏览历史", icon: "👁️", description: "最近浏览的内容" },
  ],
};

const PRIMARY_ROLES = [
  { key: "engineer", name: "工程师/技术人员", icon: "🔧" },
  { key: "student", name: "在校学生", icon: "🎓" },
  { key: "hr", name: "HR/招聘", icon: "💼" },
  { key: "purchase", name: "采购/供应链", icon: "📦" },
  { key: "manager", name: "管理者", icon: "👔" },
  { key: "other", name: "其他/随便看看", icon: "👋" },
];

const EXPERIENCE_OPTIONS = [
  { key: "fresh", name: "应届" },
  { key: "1-3", name: "1-3年" },
  { key: "3-5", name: "3-5年" },
  { key: "5-10", name: "5-10年" },
  { key: "10+", name: "10年+" },
];

module.exports = { ROLE_MODULES, PRIMARY_ROLES, EXPERIENCE_OPTIONS };
