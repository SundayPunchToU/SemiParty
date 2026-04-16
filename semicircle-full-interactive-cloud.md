# 芯圈 SemiCircle — 全交互打通 + 云开发后端完整构建指令

> 本文档分两大部分：Part A 补全所有页面和交互路由，Part B 构建完整的云开发后端并将前端接入。请按顺序执行。

---

# Part A：补全页面与交互路由

## A1. 需要新增的页面清单

在现有页面基础上，新增以下页面。每个页面都需要创建完整的 4 个文件（.wxml / .wxss / .js / .json）。

```
pages/
├── search/search                     # 搜索页（全局搜索）
├── news-list/news-list               # 分类资讯列表页（行业快讯/知识库/企业动态/研报精选）
├── article-detail/article-detail     # 文章详情页（已有，确保完善）
├── post-detail/post-detail           # 帖子详情页（已有，确保完善）
├── post-create/post-create           # 发帖页（已有，确保完善）
├── job-market/job-market             # 人才市场页（已有）
├── job-detail/job-detail             # 岗位详情页（新增）
├── talent-detail/talent-detail       # 人才详情页（新增，HR/猎头视角）
├── chat-detail/chat-detail           # 聊天详情页（新增）
├── resume/resume                     # 我的简历页（新增）
├── application-history/application-history  # 投递记录页（新增）
├── profile-visitors/profile-visitors # 谁看过我（新增）
├── favorites/favorites               # 我的收藏页（新增）
├── browse-history/browse-history     # 浏览历史页（新增）
├── my-groups/my-groups               # 我的群组页（新增）
├── settings/settings                 # 设置页（隐私与安全 + 通知合并）
└── user-profile/user-profile         # 他人主页（点击帖子作者头像进入）
```

**务必在 `app.json` 的 `pages` 数组中注册所有新页面。**

---

## A2. 每个可点击元素的路由映射表

以下是完整的点击交互清单。每一行都必须实现，不允许出现点击无反应或仅 showToast 的情况（除非明确标注）。

### 首页（home）

| 可点击元素 | 触发动作 | 目标 |
|-----------|---------|------|
| 搜索栏 | `wx.navigateTo` | `/pages/search/search` |
| 人才市场横幅 | `wx.navigateTo` | `/pages/job-market/job-market` |
| 金刚区 - 行业快讯 | `wx.navigateTo` | `/pages/news-list/news-list?category=industry` |
| 金刚区 - 知识库 | `wx.navigateTo` | `/pages/news-list/news-list?category=knowledge` |
| 金刚区 - 企业动态 | `wx.navigateTo` | `/pages/news-list/news-list?category=company` |
| 金刚区 - 研报精选 | `wx.navigateTo` | `/pages/news-list/news-list?category=report` |
| Tab 切换（推荐/行业新闻/知识分享/企业） | 页面内切换 | 筛选当前列表数据，不跳页 |
| "更多 >" | `wx.navigateTo` | `/pages/news-list/news-list?category=hot` |
| 每条新闻卡片 | `wx.navigateTo` | `/pages/article-detail/article-detail?id={{item.id}}` |

### 广场（community）

| 可点击元素 | 触发动作 | 目标 |
|-----------|---------|------|
| Tab 切换（热门/求职交流/技术讨论/职场吐槽） | 页面内切换 | 按 category 筛选帖子列表 |
| 话题标签（# 秋招进展 等） | 页面内切换 | 按 topic 筛选帖子列表 |
| 帖子卡片整体区域 | `wx.navigateTo` | `/pages/post-detail/post-detail?id={{item.id}}` |
| 帖子 - 作者头像/昵称 | `wx.navigateTo` | `/pages/user-profile/user-profile?uid={{item.author.uid}}` |
| 帖子 - 点赞按钮 | 云函数调用 | 切换点赞状态，更新数字，图标变色 |
| 帖子 - 评论按钮 | `wx.navigateTo` | `/pages/post-detail/post-detail?id={{item.id}}&focus=comment` |
| 帖子 - 分享按钮 | `wx.showShareMenu` | 触发微信分享面板 |
| 右下角 FAB 发帖按钮 | `wx.navigateTo` | `/pages/post-create/post-create` |

### 消息（message）

| 可点击元素 | 触发动作 | 目标 |
|-----------|---------|------|
| Tab 切换（私聊/群组/系统通知） | 页面内切换 | 按 type 筛选消息列表 |
| 任意消息列表项 | `wx.navigateTo` | `/pages/chat-detail/chat-detail?chatId={{item.id}}&type={{item.type}}` |

### 我的（profile）

| 可点击元素 | 触发动作 | 目标 |
|-----------|---------|------|
| 头像区域 | 弹出 `wx.showActionSheet` | 选项：更换头像 / 编辑资料 |
| 求职状态胶囊 | 弹出 `wx.showActionSheet` | 选项：在看机会 / 主动求职 / 暂不考虑，选择后更新数据库 |
| 发帖数 | `wx.navigateTo` | `/pages/user-profile/user-profile?uid=self&tab=posts` |
| 获赞数 | 无跳转 | 仅展示 |
| 关注数 | `wx.navigateTo` | `/pages/user-profile/user-profile?uid=self&tab=following` |
| 我的简历 | `wx.navigateTo` | `/pages/resume/resume` |
| 投递记录 | `wx.navigateTo` | `/pages/application-history/application-history` |
| 谁看过我 | `wx.navigateTo` | `/pages/profile-visitors/profile-visitors` |
| 求职状态（菜单项） | 弹出 `wx.showActionSheet` | 同上 |
| 我的收藏 | `wx.navigateTo` | `/pages/favorites/favorites` |
| 浏览历史 | `wx.navigateTo` | `/pages/browse-history/browse-history` |
| 我的群组 | `wx.navigateTo` | `/pages/my-groups/my-groups` |
| 隐私与安全 | `wx.navigateTo` | `/pages/settings/settings?tab=privacy` |
| 通知设置 | `wx.navigateTo` | `/pages/settings/settings?tab=notification` |

### 人才市场（job-market）

| 可点击元素 | 触发动作 | 目标 |
|-----------|---------|------|
| 找工作/找人才 切换 | 页面内切换 | 切换两个列表视图 |
| 筛选标签（工艺/设计/封测…） | 页面内切换 | 按 category 筛选岗位列表 |
| 岗位卡片 | `wx.navigateTo` | `/pages/job-detail/job-detail?id={{item.id}}` |
| 人才卡片 | `wx.navigateTo` | `/pages/talent-detail/talent-detail?id={{item.id}}` |
| 人才卡片 - 主动沟通按钮 | `wx.navigateTo` | `/pages/chat-detail/chat-detail?targetUid={{item.uid}}&type=recruit` |

---

## A3. 各新增页面的设计规范

### search（搜索页）

```
结构：
- 顶部：搜索输入框（自动聚焦） + 取消按钮
- 热门搜索：标签云（从数据库读取热词）
- 搜索历史：最近 10 条，右上角"清空"按钮
- 搜索结果：Tab 切换（全部/资讯/帖子/岗位/人才），结果列表复用对应组件

功能：
- 输入时做 300ms 防抖，然后调用云函数搜索
- 搜索结果分类展示
- 点击结果项跳转到对应详情页
- 搜索词写入用户搜索历史（存云数据库）
```

### news-list（分类资讯列表页）

```
接收参数：category（industry/knowledge/company/report/hot）

结构：
- 自定义导航栏：返回箭头 + 分类标题（如"行业快讯"）
- 筛选条：最新 / 最热 / 本周 / 本月
- 新闻列表：复用 news-card 组件
- 下拉刷新 + 触底加载

功能：
- 根据 category 参数从云数据库 news collection 中查询
- 支持按 time/views 排序
```

### article-detail（文章详情页，完善）

```
接收参数：id

结构：
- 自定义导航栏：返回 + 分享按钮
- 文章标题（大字）
- 元信息行：来源 · 发布时间 · 阅读数
- 正文区：rich-text 渲染（从数据库读取 HTML 内容字符串）
- 相关推荐：底部 2-3 篇推荐文章卡片
- 底部操作栏（fixed）：点赞 ❤️ | 收藏 ⭐ | 评论 💬 | 转发 ↗

功能：
- 进入页面时调用云函数增加阅读计数（views +1）
- 点赞/收藏状态持久化到数据库
- 评论按钮点击展开评论区（底部弹出半屏）
- 转发触发微信分享
```

### post-detail（帖子详情页，完善）

```
接收参数：id, focus（可选，值为 "comment" 时自动聚焦评论输入框）

结构：
- 作者信息区：头像 + 昵称 + 身份 + 关注按钮
- 帖子正文（完整显示，不截断）
- 图片展示区（如有图片，九宫格可预览大图）
- 话题标签
- 操作数据：X 赞 · X 评论 · X 分享 · 发布时间
- 评论区：
  - 排序切换：最热 / 最新
  - 评论列表：头像 + 昵称 + 内容 + 时间 + 点赞
  - 支持楼中楼回复（缩进展示子评论）
- 底部输入栏（fixed）：输入框 + 发送按钮

功能：
- 关注作者 → 写入 follows collection
- 发评论 → 写入 comments collection + 帖子评论数 +1
- 楼中楼回复 → 点击评论时输入框 placeholder 变为 "回复 @xxx"
- 评论点赞 → 同帖子点赞逻辑
```

### post-create（发帖页，完善）

```
结构：
- 顶部：取消（返回） | 标题"发帖" | 发布按钮（蓝色，内容为空时灰色禁用）
- 文本输入区：textarea，placeholder "分享你的想法…"，最大 2000 字
- 字数统计：右下角实时显示 "xx/2000"
- 话题选择器：点击 "+ 添加话题" 弹出话题选择半屏弹窗
- 图片上传区：最多 9 张，3×3 网格，最后一格为 + 号添加按钮
- 选项栏：
  - 匿名发布：switch 开关
  - 所在位置：可选是否显示（调用 wx.getLocation）

功能：
- 发布 → 调用云函数将帖子写入 posts collection
- 图片 → 上传到云存储，获取 fileID 存入帖子数据
- 发布成功后 wx.navigateBack 并刷新广场列表
```

### job-detail（岗位详情页，新增）

```
接收参数：id

结构：
- 顶部：职位名称 + 薪资（大字蓝色）
- 公司信息卡片：公司名 + logo + 行业 + 规模 + 城市
- 岗位信息：
  - 经验要求 / 学历要求 / 工作地点
  - 技能标签
- 职位描述：多段文字（岗位职责 + 任职要求）
- 公司其他岗位：横向滚动卡片
- 底部操作栏（fixed）：收藏按钮 + "立即投递"蓝色大按钮

功能：
- 投递 → 调用云函数写入 applications collection，同时更新岗位的投递计数
- 已投递状态 → 按钮变为灰色"已投递"
- 收藏 → 写入用户 favorites
```

### talent-detail（人才详情页，新增）

```
接收参数：id

结构：
- 头像 + 姓名（脱敏）+ 学历 + 学校
- 求职状态标签
- 个人简介段落
- 工作经历时间线（公司 + 职位 + 时间段 + 简述）
- 技能标签
- 底部操作栏：收藏 + "主动沟通"蓝色按钮

功能：
- 主动沟通 → 创建或打开聊天会话，跳转 chat-detail
```

### chat-detail（聊天详情页，新增）

```
接收参数：chatId（已有会话）或 targetUid + type（新建会话）

结构：
- 自定义导航栏：返回 + 对方名称 + 更多(...)
- 消息列表：
  - 自己的消息靠右（蓝色气泡）
  - 对方的消息靠左（灰色气泡）
  - 时间分隔线（每隔 5 分钟显示一次时间）
  - 支持文字消息和图片消息
- 底部输入栏：
  - 文本输入框
  - 图片发送按钮（调用 wx.chooseImage）
  - 发送按钮

功能：
- 使用云数据库 watch 实现实时消息推送
- 发送消息 → 写入 messages collection
- 进入会话 → 清除该会话的未读计数
- 新建会话 → 先在 chats collection 中创建记录
```

### resume（我的简历页，新增）

```
结构：
- 基本信息区：姓名、性别、年龄、手机、邮箱、城市（均可编辑）
- 求职意向：期望职位、期望城市、期望薪资、到岗时间
- 教育经历：学校 + 专业 + 学历 + 时间段（支持添加多条）
- 工作经历：公司 + 职位 + 时间段 + 工作描述（支持添加多条）
- 项目经历：项目名 + 角色 + 描述（支持添加多条）
- 技能标签：可添加/删除
- 自我评价：textarea
- 底部：保存按钮

功能：
- 数据存入 users collection 的 resume 子字段
- 完善度百分比实时计算（填了几个模块 / 总模块数）
```

### application-history（投递记录页，新增）

```
结构：
- Tab：全部 / 待查看 / 已读 / 面试中 / 不合适
- 每条记录：岗位名 + 公司 + 投递时间 + 状态标签
- 点击跳转岗位详情

功能：
- 从 applications collection 查询当前用户的投递记录
```

### profile-visitors（谁看过我，新增）

```
结构：
- 访客列表：头像 + 名称 + 身份/公司 + 浏览时间
- 标识 HR/猎头 身份

功能：
- 从 profile_views collection 查询
```

### favorites（我的收藏，新增）

```
结构：
- Tab：文章 / 帖子 / 岗位
- 对应列表，复用各自的 card 组件
- 左滑删除收藏

功能：
- 从 favorites collection 按 type 查询
```

### browse-history / my-groups / settings

```
browse-history：
- 按日期分组的浏览历史列表（今天/昨天/更早）
- 复用 news-card 和 post-card 组件

my-groups：
- 群组列表：群头像 + 群名 + 成员数 + 最后活跃时间
- 点击进入 chat-detail

settings：
- 接收参数 tab（privacy/notification）
- 隐私设置：谁能看我的简历 / 是否出现在人才市场 / 匿名帖关联设置
- 通知设置：新消息通知 / 评论通知 / 点赞通知 / 系统通知
- 每项使用 switch 组件
- 数据存入 users collection 的 settings 子字段
```

### user-profile（他人主页，新增）

```
接收参数：uid, tab（可选，posts/following）

结构：
- 头部：头像 + 昵称 + 身份 + 关注按钮
- 数据栏：发帖 / 获赞 / 关注 / 粉丝
- Tab：帖子 / 回复 / 收藏（仅本人可见）
- 帖子列表

功能：
- uid=self 时展示自己的主页（含收藏 tab）
- 关注/取关 → 写入 follows collection
```

---

## A4. 更新 app.json pages 数组

```json
{
  "pages": [
    "pages/home/home",
    "pages/community/community",
    "pages/message/message",
    "pages/profile/profile",
    "pages/search/search",
    "pages/news-list/news-list",
    "pages/article-detail/article-detail",
    "pages/post-detail/post-detail",
    "pages/post-create/post-create",
    "pages/job-market/job-market",
    "pages/job-detail/job-detail",
    "pages/talent-detail/talent-detail",
    "pages/chat-detail/chat-detail",
    "pages/resume/resume",
    "pages/application-history/application-history",
    "pages/profile-visitors/profile-visitors",
    "pages/favorites/favorites",
    "pages/browse-history/browse-history",
    "pages/my-groups/my-groups",
    "pages/settings/settings",
    "pages/user-profile/user-profile"
  ]
}
```

---

# Part B：云开发后端完整构建

## B1. 云开发环境初始化

### 在 app.js 中初始化云环境

```javascript
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库');
      return;
    }
    wx.cloud.init({
      env: 'semicircle-prod',  // 替换为你的实际云环境 ID
      traceUser: true
    });
  },
  globalData: {
    userInfo: null,
    openid: null
  }
});
```

### 在 project.config.json 中添加云函数目录

```json
{
  "cloudfunctionRoot": "cloudfunctions/",
  "miniprogramRoot": "miniprogram/"
}
```

项目根目录下创建 `cloudfunctions/` 文件夹，与 `miniprogram/` 平级。

---

## B2. 数据库 Collection 设计

### 总共需要创建以下 12 个 collection：

在云开发控制台中依次创建，或通过初始化脚本创建。

---

### 2.1 `users` — 用户表

```javascript
{
  _id: "openid 自动生成",
  openid: "用户openid",
  nickName: "陈工",
  avatarText: "陈",          // 文字头像（未上传真实头像时使用）
  avatarUrl: "",             // 真实头像 fileID
  title: "工艺整合工程师",
  company: "中芯国际",
  experience: "5年",
  jobStatus: "open",         // "open"=在看机会 | "active"=主动求职 | "closed"=暂不考虑
  stats: {
    posts: 0,
    likes: 0,
    following: 0,
    followers: 0
  },
  resume: {
    basicInfo: { name: "", gender: "", age: 0, phone: "", email: "", city: "" },
    jobIntent: { position: "", city: "", salary: "", availableDate: "" },
    education: [],           // [{ school, major, degree, startDate, endDate }]
    workHistory: [],         // [{ company, position, startDate, endDate, description }]
    projects: [],            // [{ name, role, description }]
    skills: [],              // ["FinFET", "CMP", ...]
    selfIntro: "",
    completeness: 0          // 0-100 百分比
  },
  settings: {
    resumeVisibility: "all",  // "all" | "hr_only" | "hidden"
    showInTalentMarket: true,
    pushNewMessage: true,
    pushComment: true,
    pushLike: true,
    pushSystem: true
  },
  searchHistory: [],          // 最近搜索词，最多 20 条
  createdAt: "ServerDate",
  updatedAt: "ServerDate"
}
```

### 2.2 `news` — 资讯/文章表

```javascript
{
  _id: "自动生成",
  title: "中芯国际 Q1 财报超预期...",
  summary: "摘要文字，用于列表展示",
  content: "<p>富文本 HTML 内容</p>",  // rich-text 渲染
  category: "industry",      // "industry" | "knowledge" | "company" | "report"
  tags: [
    { text: "行业", type: "blue" },
    { text: "重磅", type: "green" }
  ],
  source: "半导体行业观察",
  coverImage: "",            // 封面图 fileID（可选）
  views: 0,
  likes: 0,
  favorites: 0,
  commentsCount: 0,
  isHot: true,               // 是否热点
  createdAt: "ServerDate",
  updatedAt: "ServerDate"
}
```

### 2.3 `posts` — 社区帖子表

```javascript
{
  _id: "自动生成",
  authorUid: "用户openid",
  // 冗余存储作者信息，避免联表查询
  authorInfo: {
    nickName: "张工_SMIC",
    avatarText: "张",
    avatarUrl: "",
    title: "工艺整合工程师 · 中芯国际"
  },
  content: "帖子正文内容...",
  images: [],                // 图片 fileID 数组
  topic: { id: "t3", text: "工艺讨论", type: "purple" },
  category: "tech",          // "hot" | "job" | "tech" | "vent"
  isAnonymous: false,
  location: "",              // 可选位置
  likes: 0,
  comments: 0,
  shares: 0,
  likedBy: [],               // 点赞用户 openid 数组（小规模适用）
  createdAt: "ServerDate",
  updatedAt: "ServerDate"
}
```

### 2.4 `comments` — 评论表

```javascript
{
  _id: "自动生成",
  targetType: "post",        // "post" | "news"
  targetId: "帖子或文章的_id",
  authorUid: "openid",
  authorInfo: {
    nickName: "李工",
    avatarText: "李",
    title: "PE · 长江存储"
  },
  content: "评论内容",
  parentId: "",              // 楼中楼：父评论 _id，顶级评论为空
  replyTo: "",               // 回复对象的昵称（楼中楼用）
  likes: 0,
  likedBy: [],
  createdAt: "ServerDate"
}
```

### 2.5 `jobs` — 岗位表

```javascript
{
  _id: "自动生成",
  title: "高级工艺整合工程师",
  company: "中芯国际",
  companyLogo: "",           // fileID
  city: "上海",
  experience: "5-10年",
  education: "硕士及以上",
  category: "process",       // "process" | "design" | "test" | "equipment" | "eda" | "material"
  tags: ["14nm", "Gate-last", "良率提升"],
  salaryMin: 40,
  salaryMax: 60,
  salaryUnit: "K",
  bonus: "16薪",
  description: "岗位职责：...\n任职要求：...",
  publisherUid: "HR的openid",
  applicationsCount: 0,
  status: "active",          // "active" | "closed"
  createdAt: "ServerDate",
  updatedAt: "ServerDate"
}
```

### 2.6 `talents` — 人才市场展示表

```javascript
{
  _id: "自动生成",
  uid: "用户openid",
  // 脱敏信息
  nameDesensitized: "刘 **",
  education: "硕士",
  school: "清华大学 · 微电子",
  years: 5,
  currentRole: "某 Fab 工艺工程师",
  targetRole: "工艺整合",
  tags: ["FinFET", "CMP", "良率分析"],
  status: "open",
  avatarText: "刘",
  avatarBg: "#E6F1FB",
  avatarColor: "#185FA5",
  briefIntro: "个人简介...",
  workHistory: [],           // 简化版工作经历
  updatedAt: "ServerDate"
}
```

### 2.7 `chats` — 会话表

```javascript
{
  _id: "自动生成",
  type: "private",           // "private" | "group"
  participants: ["openid_a", "openid_b"],  // 私聊2人，群聊多人
  // 群组专用字段
  groupName: "",
  groupAvatar: "",
  // 通用字段
  lastMessage: {
    content: "最后一条消息文字",
    senderUid: "openid",
    timestamp: "ServerDate"
  },
  unreadCount: {             // 每个参与者的未读数
    "openid_a": 0,
    "openid_b": 1
  },
  createdAt: "ServerDate",
  updatedAt: "ServerDate"
}
```

### 2.8 `messages` — 消息表

```javascript
{
  _id: "自动生成",
  chatId: "所属会话_id",
  senderUid: "openid",
  senderInfo: {
    nickName: "张工",
    avatarText: "张"
  },
  type: "text",              // "text" | "image" | "system"
  content: "消息内容",       // text=文字, image=fileID, system=系统提示文字
  createdAt: "ServerDate"
}
```

### 2.9 `follows` — 关注关系表

```javascript
{
  _id: "自动生成",
  followerUid: "关注者openid",
  followingUid: "被关注者openid",
  createdAt: "ServerDate"
}
```

### 2.10 `favorites` — 收藏表

```javascript
{
  _id: "自动生成",
  uid: "openid",
  targetType: "news",        // "news" | "post" | "job"
  targetId: "目标_id",
  // 冗余存储摘要信息，列表展示用
  targetSummary: {
    title: "...",
    source: "...",
    // 根据 type 存不同的摘要字段
  },
  createdAt: "ServerDate"
}
```

### 2.11 `applications` — 投递记录表

```javascript
{
  _id: "自动生成",
  applicantUid: "求职者openid",
  jobId: "岗位_id",
  jobSummary: {
    title: "高级工艺整合工程师",
    company: "中芯国际",
    salary: "40-60K"
  },
  status: "pending",         // "pending" | "viewed" | "interviewing" | "rejected" | "accepted"
  createdAt: "ServerDate",
  updatedAt: "ServerDate"
}
```

### 2.12 `profile_views` — 简历浏览记录

```javascript
{
  _id: "自动生成",
  viewerUid: "浏览者openid",
  viewerInfo: {
    nickName: "HR_小王",
    title: "SMIC 招聘经理",
    isHR: true
  },
  targetUid: "被浏览者openid",
  createdAt: "ServerDate"
}
```

---

## B3. 数据库权限规则

在云开发控制台为每个 collection 设置安全规则：

```json
// users — 仅创建者可读写自己的记录
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}

// news — 所有人可读，仅管理员（通过云函数）可写
{
  "read": true,
  "write": false
}

// posts — 所有人可读，创建者可写自己的帖子
{
  "read": true,
  "write": "doc._openid == auth.openid"
}

// comments — 所有人可读，创建者可写
{
  "read": true,
  "write": "doc._openid == auth.openid"
}

// jobs — 所有人可读，仅云函数可写
{
  "read": true,
  "write": false
}

// talents — 所有人可读，仅创建者+云函数可写
{
  "read": true,
  "write": "doc.uid == auth.openid"
}

// chats — 仅参与者可读写
{
  "read": "auth.openid in doc.participants",
  "write": "auth.openid in doc.participants"
}

// messages — 仅会话参与者可读，发送者可写
{
  "read": true,
  "write": "doc.senderUid == auth.openid"
}

// follows / favorites / applications / profile_views
// 创建者可读写自己的记录
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

**注意：** 敏感操作（点赞计数、投递记录状态变更等）通过云函数执行，不依赖前端直接写入，防止数据篡改。

---

## B4. 云函数清单

在 `cloudfunctions/` 目录下创建以下云函数，每个云函数是一个独立文件夹，包含 `index.js` 和 `package.json`。

### 4.1 `login` — 用户登录/注册

```javascript
// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // 查询用户是否存在
  const userRes = await db.collection('users').where({ openid }).get();

  if (userRes.data.length === 0) {
    // 新用户，创建记录
    const newUser = {
      openid,
      nickName: '',
      avatarText: '',
      avatarUrl: '',
      title: '',
      company: '',
      experience: '',
      jobStatus: 'closed',
      stats: { posts: 0, likes: 0, following: 0, followers: 0 },
      resume: {
        basicInfo: { name: '', gender: '', age: 0, phone: '', email: '', city: '' },
        jobIntent: { position: '', city: '', salary: '', availableDate: '' },
        education: [],
        workHistory: [],
        projects: [],
        skills: [],
        selfIntro: '',
        completeness: 0
      },
      settings: {
        resumeVisibility: 'all',
        showInTalentMarket: true,
        pushNewMessage: true,
        pushComment: true,
        pushLike: true,
        pushSystem: true
      },
      searchHistory: [],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    };
    await db.collection('users').add({ data: newUser });
    return { isNew: true, userInfo: newUser };
  }

  return { isNew: false, userInfo: userRes.data[0] };
};
```

### 4.2 `updateUser` — 更新用户信息

```javascript
// cloudfunctions/updateUser/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { field, value } = event;  // field: 要更新的字段路径, value: 新值

  // 白名单校验，只允许更新特定字段
  const allowedFields = [
    'nickName', 'avatarText', 'avatarUrl', 'title', 'company',
    'experience', 'jobStatus', 'resume', 'settings', 'searchHistory'
  ];

  const topField = field.split('.')[0];
  if (!allowedFields.includes(topField)) {
    return { success: false, error: '不允许更新该字段' };
  }

  await db.collection('users').where({ openid }).update({
    data: { [field]: value, updatedAt: db.serverDate() }
  });

  return { success: true };
};
```

### 4.3 `toggleLike` — 点赞/取消点赞

```javascript
// cloudfunctions/toggleLike/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { targetType, targetId } = event;  // targetType: "post" | "comment"

  const collection = targetType === 'post' ? 'posts' : 'comments';
  const doc = await db.collection(collection).doc(targetId).get();
  const isLiked = doc.data.likedBy.includes(openid);

  if (isLiked) {
    // 取消点赞
    await db.collection(collection).doc(targetId).update({
      data: {
        likes: _.inc(-1),
        likedBy: _.pull(openid)
      }
    });
  } else {
    // 点赞
    await db.collection(collection).doc(targetId).update({
      data: {
        likes: _.inc(1),
        likedBy: _.push(openid)
      }
    });
  }

  return { success: true, isLiked: !isLiked };
};
```

### 4.4 `createPost` — 发帖

```javascript
// cloudfunctions/createPost/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { content, images, topic, category, isAnonymous, location } = event;

  // 获取作者信息
  const userRes = await db.collection('users').where({ openid }).get();
  const user = userRes.data[0];

  const post = {
    authorUid: openid,
    authorInfo: isAnonymous ? {
      nickName: '匿名用户',
      avatarText: '匿',
      avatarUrl: '',
      title: '匿名发布'
    } : {
      nickName: user.nickName,
      avatarText: user.avatarText,
      avatarUrl: user.avatarUrl,
      title: `${user.title} · ${user.company}`
    },
    content,
    images: images || [],
    topic: topic || null,
    category: category || 'hot',
    isAnonymous,
    location: location || '',
    likes: 0,
    comments: 0,
    shares: 0,
    likedBy: [],
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const res = await db.collection('posts').add({ data: post });

  // 更新用户发帖数
  await db.collection('users').where({ openid }).update({
    data: { 'stats.posts': _.inc(1) }
  });

  return { success: true, postId: res._id };
};
```

### 4.5 `addComment` — 发评论

```javascript
// cloudfunctions/addComment/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { targetType, targetId, content, parentId, replyTo } = event;

  const userRes = await db.collection('users').where({ openid }).get();
  const user = userRes.data[0];

  const comment = {
    targetType,
    targetId,
    authorUid: openid,
    authorInfo: {
      nickName: user.nickName,
      avatarText: user.avatarText,
      title: `${user.title} · ${user.company}`
    },
    content,
    parentId: parentId || '',
    replyTo: replyTo || '',
    likes: 0,
    likedBy: [],
    createdAt: db.serverDate()
  };

  await db.collection('comments').add({ data: comment });

  // 更新目标的评论计数
  const targetCollection = targetType === 'post' ? 'posts' : 'news';
  const countField = targetType === 'post' ? 'comments' : 'commentsCount';
  await db.collection(targetCollection).doc(targetId).update({
    data: { [countField]: _.inc(1) }
  });

  return { success: true };
};
```

### 4.6 `applyJob` — 投递简历

```javascript
// cloudfunctions/applyJob/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { jobId } = event;

  // 检查是否已投递
  const existing = await db.collection('applications')
    .where({ applicantUid: openid, jobId })
    .count();

  if (existing.total > 0) {
    return { success: false, error: '已投递过该岗位' };
  }

  // 获取岗位摘要
  const job = await db.collection('jobs').doc(jobId).get();

  await db.collection('applications').add({
    data: {
      applicantUid: openid,
      jobId,
      jobSummary: {
        title: job.data.title,
        company: job.data.company,
        salary: `${job.data.salaryMin}-${job.data.salaryMax}${job.data.salaryUnit}`
      },
      status: 'pending',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });

  // 岗位投递数+1
  await db.collection('jobs').doc(jobId).update({
    data: { applicationsCount: _.inc(1) }
  });

  return { success: true };
};
```

### 4.7 `toggleFollow` — 关注/取关

```javascript
// cloudfunctions/toggleFollow/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { targetUid } = event;

  const existing = await db.collection('follows')
    .where({ followerUid: openid, followingUid: targetUid })
    .get();

  if (existing.data.length > 0) {
    // 取关
    await db.collection('follows').doc(existing.data[0]._id).remove();
    await db.collection('users').where({ openid }).update({
      data: { 'stats.following': _.inc(-1) }
    });
    await db.collection('users').where({ openid: targetUid }).update({
      data: { 'stats.followers': _.inc(-1) }
    });
    return { success: true, isFollowing: false };
  } else {
    // 关注
    await db.collection('follows').add({
      data: { followerUid: openid, followingUid: targetUid, createdAt: db.serverDate() }
    });
    await db.collection('users').where({ openid }).update({
      data: { 'stats.following': _.inc(1) }
    });
    await db.collection('users').where({ openid: targetUid }).update({
      data: { 'stats.followers': _.inc(1) }
    });
    return { success: true, isFollowing: true };
  }
};
```

### 4.8 `toggleFavorite` — 收藏/取消收藏

```javascript
// cloudfunctions/toggleFavorite/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { targetType, targetId, targetSummary } = event;

  const existing = await db.collection('favorites')
    .where({ uid: openid, targetType, targetId })
    .get();

  if (existing.data.length > 0) {
    await db.collection('favorites').doc(existing.data[0]._id).remove();
    // 目标收藏数 -1
    const col = targetType === 'news' ? 'news' : targetType === 'post' ? 'posts' : 'jobs';
    await db.collection(col).doc(targetId).update({ data: { favorites: _.inc(-1) } });
    return { success: true, isFavorited: false };
  } else {
    await db.collection('favorites').add({
      data: { uid: openid, targetType, targetId, targetSummary, createdAt: db.serverDate() }
    });
    const col = targetType === 'news' ? 'news' : targetType === 'post' ? 'posts' : 'jobs';
    await db.collection(col).doc(targetId).update({ data: { favorites: _.inc(1) } });
    return { success: true, isFavorited: true };
  }
};
```

### 4.9 `sendMessage` — 发送消息

```javascript
// cloudfunctions/sendMessage/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { chatId, content, type } = event;  // type: "text" | "image"

  // 获取发送者信息
  const userRes = await db.collection('users').where({ openid }).get();
  const user = userRes.data[0];

  // 写入消息
  await db.collection('messages').add({
    data: {
      chatId,
      senderUid: openid,
      senderInfo: {
        nickName: user.nickName,
        avatarText: user.avatarText
      },
      type: type || 'text',
      content,
      createdAt: db.serverDate()
    }
  });

  // 更新会话的 lastMessage 和对方未读数
  const chat = await db.collection('chats').doc(chatId).get();
  const otherParticipants = chat.data.participants.filter(p => p !== openid);

  const unreadUpdate = {};
  otherParticipants.forEach(p => {
    unreadUpdate[`unreadCount.${p}`] = _.inc(1);
  });

  await db.collection('chats').doc(chatId).update({
    data: {
      lastMessage: {
        content: type === 'image' ? '[图片]' : content,
        senderUid: openid,
        timestamp: db.serverDate()
      },
      ...unreadUpdate,
      updatedAt: db.serverDate()
    }
  });

  return { success: true };
};
```

### 4.10 `createChat` — 创建新会话

```javascript
// cloudfunctions/createChat/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { targetUid, type } = event;  // type: "private" | "recruit"

  // 检查是否已有会话
  const existing = await db.collection('chats')
    .where({
      type: 'private',
      participants: _.all([openid, targetUid])
    })
    .get();

  if (existing.data.length > 0) {
    return { success: true, chatId: existing.data[0]._id, isNew: false };
  }

  // 创建新会话
  const res = await db.collection('chats').add({
    data: {
      type: 'private',
      participants: [openid, targetUid],
      groupName: '',
      groupAvatar: '',
      lastMessage: {
        content: '',
        senderUid: '',
        timestamp: db.serverDate()
      },
      unreadCount: { [openid]: 0, [targetUid]: 0 },
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });

  return { success: true, chatId: res._id, isNew: true };
};
```

### 4.11 `search` — 全局搜索

```javascript
// cloudfunctions/search/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { keyword, type, page = 1, pageSize = 20 } = event;

  const skip = (page - 1) * pageSize;
  const regex = db.RegExp({ regexp: keyword, options: 'i' });

  let results = {};

  if (!type || type === 'news') {
    const news = await db.collection('news')
      .where({ title: regex })
      .orderBy('createdAt', 'desc')
      .skip(skip).limit(pageSize).get();
    results.news = news.data;
  }

  if (!type || type === 'post') {
    const posts = await db.collection('posts')
      .where({ content: regex })
      .orderBy('createdAt', 'desc')
      .skip(skip).limit(pageSize).get();
    results.posts = posts.data;
  }

  if (!type || type === 'job') {
    const jobs = await db.collection('jobs')
      .where(db.command.or([{ title: regex }, { company: regex }]))
      .orderBy('createdAt', 'desc')
      .skip(skip).limit(pageSize).get();
    results.jobs = jobs.data;
  }

  if (!type || type === 'talent') {
    const talents = await db.collection('talents')
      .where(db.command.or([{ tags: regex }, { targetRole: regex }]))
      .skip(skip).limit(pageSize).get();
    results.talents = talents.data;
  }

  // 记录搜索词
  await db.collection('users').where({ openid }).update({
    data: {
      searchHistory: db.command.unshift(keyword)
    }
  });

  return { success: true, results };
};
```

### 4.12 `recordView` — 记录浏览（文章阅读数+简历浏览）

```javascript
// cloudfunctions/recordView/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { type, targetId } = event;  // type: "news" | "profile"

  if (type === 'news') {
    await db.collection('news').doc(targetId).update({
      data: { views: _.inc(1) }
    });
  }

  if (type === 'profile') {
    // 获取浏览者信息
    const userRes = await db.collection('users').where({ openid }).get();
    const user = userRes.data[0];

    await db.collection('profile_views').add({
      data: {
        viewerUid: openid,
        viewerInfo: {
          nickName: user.nickName,
          title: `${user.title} · ${user.company}`,
          isHR: user.title.includes('HR') || user.title.includes('招聘') || user.title.includes('猎头')
        },
        targetUid: targetId,
        createdAt: db.serverDate()
      }
    });
  }

  return { success: true };
};
```

---

## B5. 改造 `utils/api.js` — 接入云开发

将原来返回 Mock 数据的 api.js 完全改造为调用云开发：

```javascript
// utils/api.js
const db = wx.cloud.database();
const _ = db.command;

module.exports = {

  // ===== 用户相关 =====
  async login() {
    return wx.cloud.callFunction({ name: 'login' }).then(res => res.result);
  },

  async updateUser(field, value) {
    return wx.cloud.callFunction({
      name: 'updateUser',
      data: { field, value }
    }).then(res => res.result);
  },

  async getUserProfile() {
    const openid = getApp().globalData.openid;
    const res = await db.collection('users').where({ openid }).get();
    return res.data[0] || null;
  },

  // ===== 资讯相关 =====
  async getNewsList({ category = 'all', sort = 'createdAt', page = 1, pageSize = 20 } = {}) {
    let query = db.collection('news');
    if (category !== 'all' && category !== 'recommend') {
      query = query.where({ category });
    }
    if (category === 'hot') {
      query = query.where({ isHot: true });
    }
    const res = await query
      .orderBy(sort, 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    return { data: res.data, hasMore: res.data.length === pageSize };
  },

  async getNewsDetail(id) {
    const res = await db.collection('news').doc(id).get();
    // 记录阅读
    wx.cloud.callFunction({ name: 'recordView', data: { type: 'news', targetId: id } });
    return res.data;
  },

  // ===== 帖子相关 =====
  async getPostList({ category = 'hot', topic = '', page = 1, pageSize = 20 } = {}) {
    let filter = {};
    if (category !== 'hot') filter.category = category;
    if (topic) filter['topic.id'] = topic;

    const res = await db.collection('posts')
      .where(filter)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    return { data: res.data, hasMore: res.data.length === pageSize };
  },

  async getPostDetail(id) {
    return (await db.collection('posts').doc(id).get()).data;
  },

  async createPost(data) {
    return wx.cloud.callFunction({ name: 'createPost', data }).then(r => r.result);
  },

  // ===== 评论相关 =====
  async getComments({ targetType, targetId, sort = 'createdAt', page = 1, pageSize = 50 } = {}) {
    const res = await db.collection('comments')
      .where({ targetType, targetId, parentId: '' })
      .orderBy(sort === 'hot' ? 'likes' : 'createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    // 获取楼中楼子评论
    for (let comment of res.data) {
      const replies = await db.collection('comments')
        .where({ parentId: comment._id })
        .orderBy('createdAt', 'asc')
        .limit(10)
        .get();
      comment.replies = replies.data;
    }

    return { data: res.data, hasMore: res.data.length === pageSize };
  },

  async addComment(data) {
    return wx.cloud.callFunction({ name: 'addComment', data }).then(r => r.result);
  },

  // ===== 互动相关 =====
  async toggleLike(targetType, targetId) {
    return wx.cloud.callFunction({
      name: 'toggleLike',
      data: { targetType, targetId }
    }).then(r => r.result);
  },

  async toggleFollow(targetUid) {
    return wx.cloud.callFunction({
      name: 'toggleFollow',
      data: { targetUid }
    }).then(r => r.result);
  },

  async toggleFavorite(targetType, targetId, targetSummary) {
    return wx.cloud.callFunction({
      name: 'toggleFavorite',
      data: { targetType, targetId, targetSummary }
    }).then(r => r.result);
  },

  // ===== 人才市场 =====
  async getJobList({ category = 'all', keyword = '', page = 1, pageSize = 20 } = {}) {
    let filter = { status: 'active' };
    if (category !== 'all') filter.category = category;

    let query = db.collection('jobs').where(filter);
    const res = await query
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    return { data: res.data, hasMore: res.data.length === pageSize };
  },

  async getJobDetail(id) {
    return (await db.collection('jobs').doc(id).get()).data;
  },

  async applyJob(jobId) {
    return wx.cloud.callFunction({ name: 'applyJob', data: { jobId } }).then(r => r.result);
  },

  async getTalentList({ keyword = '', page = 1, pageSize = 20 } = {}) {
    const res = await db.collection('talents')
      .where({ status: _.neq('closed') })
      .orderBy('updatedAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    return { data: res.data, hasMore: res.data.length === pageSize };
  },

  async getTalentDetail(id) {
    return (await db.collection('talents').doc(id).get()).data;
  },

  // ===== 消息相关 =====
  async getChatList({ type = 'all' } = {}) {
    const openid = getApp().globalData.openid;
    let filter = { participants: openid };
    if (type === 'private') filter.type = 'private';
    if (type === 'group') filter.type = 'group';

    const res = await db.collection('chats')
      .where(filter)
      .orderBy('updatedAt', 'desc')
      .limit(50)
      .get();
    return { data: res.data };
  },

  async getMessages(chatId, page = 1, pageSize = 50) {
    const res = await db.collection('messages')
      .where({ chatId })
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    return { data: res.data.reverse(), hasMore: res.data.length === pageSize };
  },

  async sendMessage(chatId, content, type = 'text') {
    return wx.cloud.callFunction({
      name: 'sendMessage',
      data: { chatId, content, type }
    }).then(r => r.result);
  },

  async createChat(targetUid) {
    return wx.cloud.callFunction({
      name: 'createChat',
      data: { targetUid, type: 'private' }
    }).then(r => r.result);
  },

  // 实时消息监听
  watchMessages(chatId, onChange) {
    return db.collection('messages')
      .where({ chatId })
      .orderBy('createdAt', 'asc')
      .watch({
        onChange(snapshot) {
          onChange(snapshot.docs);
        },
        onError(err) {
          console.error('消息监听出错', err);
        }
      });
  },

  // ===== 收藏/历史/投递 =====
  async getFavorites({ type = 'all', page = 1, pageSize = 20 } = {}) {
    const openid = getApp().globalData.openid;
    let filter = { uid: openid };
    if (type !== 'all') filter.targetType = type;

    const res = await db.collection('favorites')
      .where(filter)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    return { data: res.data, hasMore: res.data.length === pageSize };
  },

  async getApplications({ status = 'all', page = 1, pageSize = 20 } = {}) {
    const openid = getApp().globalData.openid;
    let filter = { applicantUid: openid };
    if (status !== 'all') filter.status = status;

    const res = await db.collection('applications')
      .where(filter)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    return { data: res.data, hasMore: res.data.length === pageSize };
  },

  async getProfileVisitors(page = 1, pageSize = 20) {
    const openid = getApp().globalData.openid;
    const res = await db.collection('profile_views')
      .where({ targetUid: openid })
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    return { data: res.data, hasMore: res.data.length === pageSize };
  },

  // ===== 搜索 =====
  async search(keyword, type, page = 1) {
    return wx.cloud.callFunction({
      name: 'search',
      data: { keyword, type, page }
    }).then(r => r.result);
  }
};
```

---

## B6. 数据库初始化种子数据

创建一个云函数 `initData` 用于首次填充测试数据。这个云函数只需运行一次：

```javascript
// cloudfunctions/initData/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  // ---- 资讯种子数据 ----
  const newsData = [
    {
      title: '中芯国际 Q1 财报超预期：14nm 产能利用率突破 90%，N+1 节点研发取得关键进展',
      summary: '中芯国际发布2025年Q1财报，营收同比增长28%...',
      content: '<h2>核心看点</h2><p>中芯国际2025年第一季度营收达到...</p>',
      category: 'industry',
      tags: [{ text: '行业', type: 'blue' }, { text: '重磅', type: 'green' }],
      source: '半导体行业观察', views: 1200, likes: 45, favorites: 12,
      commentsCount: 8, isHot: true, createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      title: '北方华创发布新一代 12 英寸刻蚀设备，良率对标国际一线水平',
      summary: '北方华创最新12英寸ICP刻蚀机通过客户验证...',
      content: '<p>北方华创正式发布其自主研发的新一代12英寸等离子刻蚀设备...</p>',
      category: 'company',
      tags: [{ text: '企业', type: 'orange' }],
      source: '芯智讯', views: 856, likes: 32, favorites: 8,
      commentsCount: 5, isHot: false, createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      title: 'FinFET 到 GAA：三星 vs 台积电下一代晶体管架构路线深度对比',
      summary: '两大晶圆代工巨头在先进制程的技术路线选择...',
      content: '<p>随着FinFET架构逐渐逼近物理极限...</p>',
      category: 'knowledge',
      tags: [{ text: '技术', type: 'purple' }],
      source: '摩尔精英', views: 2300, likes: 89, favorites: 45,
      commentsCount: 23, isHot: true, createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      title: '从零理解 Chiplet：先进封装技术 UCIe 协议详解与产业链全景',
      summary: 'Chiplet技术正在重新定义芯片设计的方法论...',
      content: '<p>Chiplet（小芯片）技术通过将不同功能模块...</p>',
      category: 'knowledge',
      tags: [{ text: '知识', type: 'green' }],
      source: '半导体工程师社区', views: 1800, likes: 67, favorites: 34,
      commentsCount: 15, isHot: false, createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      title: '韦尔股份收购案尘埃落定：CIS 赛道格局将如何重塑？',
      summary: '韦尔股份完成对欧洲图像传感器公司的收购...',
      content: '<p>经过长达18个月的跨国并购审查...</p>',
      category: 'industry',
      tags: [{ text: '行业', type: 'blue' }],
      source: '集微网', views: 960, likes: 28, favorites: 15,
      commentsCount: 11, isHot: false, createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      title: '2025 全球半导体设备市场报告：中国大陆采购额连续三年居首',
      summary: 'SEMI最新报告显示中国大陆半导体设备采购额...',
      content: '<p>国际半导体产业协会SEMI发布...</p>',
      category: 'report',
      tags: [{ text: '研报', type: 'purple' }],
      source: 'SEMI', views: 1500, likes: 55, favorites: 40,
      commentsCount: 7, isHot: true, createdAt: db.serverDate(), updatedAt: db.serverDate()
    }
  ];

  for (const item of newsData) {
    await db.collection('news').add({ data: item });
  }

  // ---- 岗位种子数据 ----
  const jobsData = [
    {
      title: '高级工艺整合工程师', company: '中芯国际', city: '上海',
      experience: '5-10年', education: '硕士及以上', category: 'process',
      tags: ['14nm', 'Gate-last', '良率提升'],
      salaryMin: 40, salaryMax: 60, salaryUnit: 'K', bonus: '16薪',
      description: '岗位职责：\n1. 负责14nm及以下节点工艺整合\n2. 良率提升与缺陷分析\n3. 跨部门协调工艺优化\n\n任职要求：\n1. 微电子相关硕士及以上\n2. 5年以上Fab工艺经验\n3. 熟悉FEOL/BEOL工艺流程',
      applicationsCount: 0, status: 'active',
      createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      title: '刻蚀设备研发工程师', company: '北方华创', city: '北京',
      experience: '3-5年', education: '硕士及以上', category: 'equipment',
      tags: ['ICP', '12英寸', '等离子体'],
      salaryMin: 30, salaryMax: 50, salaryUnit: 'K', bonus: '15薪',
      description: '岗位职责：\n1. 参与ICP刻蚀设备的研发\n2. 等离子体工艺开发\n\n任职要求：\n1. 等离子体物理相关专业\n2. 3年以上设备研发经验',
      applicationsCount: 0, status: 'active',
      createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      title: '数字 IC 设计工程师', company: '海思半导体', city: '深圳',
      experience: '3-8年', education: '硕士及以上', category: 'design',
      tags: ['RTL', '7nm', 'ARM'],
      salaryMin: 50, salaryMax: 80, salaryUnit: 'K', bonus: '16薪',
      description: '岗位职责：\n1. 负责SoC数字前端设计\n2. RTL编码与验证\n\n任职要求：\n1. 熟练掌握Verilog/SystemVerilog\n2. 有7nm及以下流片经验优先',
      applicationsCount: 0, status: 'active',
      createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      title: 'EDA 算法工程师', company: '华大九天', city: '北京',
      experience: '3-5年', education: '博士优先', category: 'eda',
      tags: ['布局布线', 'P&R', 'C++'],
      salaryMin: 45, salaryMax: 70, salaryUnit: 'K', bonus: '14薪',
      description: '岗位职责：\n1. 参与EDA工具核心算法开发\n\n任职要求：\n1. 计算机或微电子博士优先\n2. 熟悉布局布线算法',
      applicationsCount: 0, status: 'active',
      createdAt: db.serverDate(), updatedAt: db.serverDate()
    },
    {
      title: '封装工艺工程师', company: '长电科技', city: '无锡',
      experience: '2-5年', education: '本科及以上', category: 'test',
      tags: ['先进封装', 'FC-BGA', 'SiP'],
      salaryMin: 20, salaryMax: 35, salaryUnit: 'K', bonus: '13薪',
      description: '岗位职责：\n1. 先进封装工艺开发\n2. 产品良率分析\n\n任职要求：\n1. 材料或微电子相关专业\n2. 熟悉先进封装技术',
      applicationsCount: 0, status: 'active',
      createdAt: db.serverDate(), updatedAt: db.serverDate()
    }
  ];

  for (const item of jobsData) {
    await db.collection('jobs').add({ data: item });
  }

  // ---- 人才种子数据 ----
  const talentsData = [
    {
      uid: 'talent_mock_001', nameDesensitized: '刘 **', education: '硕士',
      school: '清华大学 · 微电子', years: 5, currentRole: '某 Fab 工艺工程师',
      targetRole: '工艺整合', tags: ['FinFET', 'CMP', '良率分析'], status: 'open',
      avatarText: '刘', avatarBg: '#E6F1FB', avatarColor: '#185FA5',
      briefIntro: '5年晶圆厂工艺经验，熟悉先进节点工艺整合流程。',
      workHistory: [{ company: '某头部Fab', position: '工艺工程师', years: '2020-2025' }],
      updatedAt: db.serverDate()
    },
    {
      uid: 'talent_mock_002', nameDesensitized: '赵 **', education: '博士',
      school: '中科院微电子所', years: 8, currentRole: '设备商研发总监',
      targetRole: '技术VP', tags: ['PVD', 'CVD', '团队管理'], status: 'active',
      avatarText: '赵', avatarBg: '#EEEDFE', avatarColor: '#534AB7',
      briefIntro: '8年半导体设备研发经验，带领过30人团队。',
      workHistory: [{ company: '某设备厂商', position: '研发总监', years: '2017-2025' }],
      updatedAt: db.serverDate()
    },
    {
      uid: 'talent_mock_003', nameDesensitized: '陈 **', education: '硕士',
      school: '复旦大学 · 集成电路', years: 2, currentRole: 'IC 设计工程师',
      targetRole: '高级设计', tags: ['数字前端', 'SoC', 'Verilog'], status: 'open',
      avatarText: '陈', avatarBg: '#E1F5EE', avatarColor: '#0F6E56',
      briefIntro: '2年IC设计经验，参与过多款SoC芯片项目。',
      workHistory: [{ company: '某芯片设计公司', position: 'IC设计工程师', years: '2023-2025' }],
      updatedAt: db.serverDate()
    }
  ];

  for (const item of talentsData) {
    await db.collection('talents').add({ data: item });
  }

  return { success: true, message: '种子数据初始化完成' };
};
```

---

## B7. 每个云函数的 package.json 模板

每个云函数文件夹下都需要一个 `package.json`：

```json
{
  "name": "函数名",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

---

## B8. 执行顺序与验收清单

### 执行顺序：

1. **在 `app.json` 中注册所有新页面**
2. **创建所有新页面文件**（每页 4 个文件），页面内容按 A3 节规范实现
3. **逐页检查路由映射表**（A2 节），确保所有 `bindtap` 事件绑定正确的跳转逻辑
4. **创建 `cloudfunctions/` 目录**，逐个创建 12 个云函数
5. **改造 `utils/api.js`** 为 B5 节的云开发版本
6. **在云开发控制台创建 12 个 collection**，设置权限规则
7. **运行 `initData` 云函数**填充种子数据
8. **逐页测试所有交互**

### 验收清单：

- [ ] 首页：搜索栏点击 → 搜索页；横幅 → 人才市场；金刚区 4 个入口各自跳转正确；新闻点击 → 详情页
- [ ] 广场：帖子点击 → 详情页；头像点击 → 个人主页；点赞有动效；评论跳转正确；FAB → 发帖页
- [ ] 消息：列表项点击 → 聊天详情页；实时消息监听正常
- [ ] 我的：所有菜单项跳转正确；求职状态切换写入数据库
- [ ] 人才市场：岗位卡片 → 岗位详情；人才卡片 → 人才详情；投递/沟通按钮功能正常
- [ ] 发帖：可选话题、上传图片、匿名开关；发布后广场列表刷新
- [ ] 聊天：发送文字消息；对方通过 watch 实时收到
- [ ] 搜索：输入关键词可搜到资讯/帖子/岗位/人才
- [ ] 所有数据来自云数据库，不再使用 Mock 数据
