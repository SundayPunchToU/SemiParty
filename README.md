# SemiParty

面向半导体行业的微信小程序，定位是“资讯 + 社区 + 招聘/求职 + 私聊沟通”。

当前仓库不是从零开始的脚手架，而是一个已经有主要页面骨架和视觉稿落地的模板项目。本轮调整的目标是：在不推倒重写的前提下，把几个 P0 核心闭环从占位态补成“最小可用”。

## 1. 当前产品范围

已存在页面：

- `pages/home/home`：资讯首页，含分类切换、热点列表、人才市场入口、搜索入口
- `pages/community/community`：广场帖子流、话题筛选、发帖入口
- `pages/message/message`：消息会话列表
- `pages/profile/profile`：个人主页、求职状态切换、个人菜单
- `pages/job-market/job-market`：人才市场，支持 `job` / `talent` 双模式
- `pages/article-detail/article-detail`：资讯详情
- `pages/post-detail/post-detail`：帖子详情
- `pages/post-create/post-create`：发帖页
- `pages/search/search`：最小可用搜索页
- `pages/chat-detail/chat-detail`：最小可用私聊详情页
- `pages/job-detail/job-detail`：最小岗位详情承接页
- `pages/talent-detail/talent-detail`：最小人才详情承接页

当前已打通的最小闭环：

- 首页搜索入口可以进入搜索页并调用 `api.search`
- 搜索结果里的岗位/人才可以进入最小详情页
- 人才市场 `job` 模式可以真实调用 `api.applyJob(jobId)`
- 人才市场 `talent` 模式可以真实调用 `api.createChat(targetUid)` 并进入聊天页
- 消息列表可以进入聊天详情页
- 聊天详情页可以拉取消息、发送文本消息，并在可用时挂载 `watchMessages`
- 个人页求职状态切换会调用 `api.updateUser`

仍然是占位或部分完成的能力：

- 聊天能力仅支持最小文本私聊，不含群聊、图片、已读、撤回
- 文章详情和帖子详情的互动按钮仍有占位
- 个人中心菜单大部分还是占位入口
- 搜索云函数已从固定全量拉取改为按集合分批扫描，但仍不是最终版

## 2. 本轮修复重点

本轮改动只覆盖最小必要范围：

- 打通人才市场的投递 / 建联闭环
- 新增最小聊天详情页承接 `chatId`
- 将 `api.js` 的 mock fallback 从“云端异常时静默降级”改为“显式开关控制”
- 接入首页搜索入口与搜索页
- 为核心入口补基础错误提示，避免云端异常时页面无反馈
- 重写 README，便于后续协作

## 3. 目录结构

```text
.
├─ miniprogram/
│  ├─ app.js                  # 小程序入口，云初始化、全局 mock 开关、全局态
│  ├─ app.json                # 页面路由与 tabBar
│  ├─ components/             # UI 组件（资讯卡片、帖子卡片、职位卡片、人才卡片、会话项等）
│  ├─ pages/                  # 页面目录
│  └─ utils/
│     ├─ api.js               # 统一数据访问层，负责 cloud / mock 分流
│     ├─ config.js            # 开发期开关，例如 DEV_USE_MOCK
│     ├─ constants.js         # 页面 tab、筛选项等常量
│     ├─ mock-data.js         # 本地 mock 数据
│     └─ util.js              # 工具函数
├─ cloudfunctions/            # 云函数目录
├─ docs/                      # 现有云开发部署文档
├─ semicircle-prompt.md
├─ semicircle-visual-fix.md
└─ semicircle-full-interactive-cloud.md
```

## 4. 运行方式

### 4.1 Mock / Cloud 配置

当前使用一个非常轻量的显式开关：

- 文件：`miniprogram/utils/config.js`
- 配置项：`DEV_USE_MOCK`

默认值：

```js
const DEV_USE_MOCK = false;
```

`app.js` 会在启动时把它挂到：

- `app.globalData.useMock`

同时初始化一份仅用于本地 mock 的内存态：

- `app.globalData.mockState.appliedJobs`
- `app.globalData.mockState.chats`
- `app.globalData.mockState.chatMessages`

这些状态会同步写入本地 storage，便于开发态复现投递、会话和消息。

### 4.2 Mock 行为矩阵

| 场景 | 是否使用 mock | 行为 |
| --- | --- | --- |
| `wx.cloud` 不存在 | 是 | 直接使用 mock |
| `wx.cloud` 存在，且 `DEV_USE_MOCK=true` | 是 | 强制使用 mock |
| `wx.cloud` 存在，且 `DEV_USE_MOCK=false` | 否 | 走云端；云端报错直接抛给页面层 |

这意味着：

- 开发时如果想完全脱离云环境，可以手动把 `DEV_USE_MOCK` 打开
- 关闭 mock 后，如果云函数报错，错误不会再被偷偷吞掉
- 页面层需要自己处理失败态；本轮只给核心入口补了最小提示

### 4.3 本地开发建议

1. 用微信开发者工具打开仓库根目录
2. 检查 `miniprogram/envList.js` 是否已配置可用云环境
3. 根据当前需求设置 `miniprogram/utils/config.js`：
   - 当前默认：`DEV_USE_MOCK = false`
   - 如需本地 mock 联调：`DEV_USE_MOCK = true`
4. 如需云端联调，上传 `cloudfunctions/` 下已接入的函数

## 5. 核心模块说明

### 5.1 资讯

- 首页通过 `api.getNewsList(tab, page)` 获取列表
- 文章详情通过 `api.getArticleDetail(id)` 获取
- 首页搜索框现在会进入 `pages/search/search`

### 5.2 社区

- 广场通过 `api.getPostList(tab, page)` 拉取帖子
- 点赞通过 `api.toggleLike("post", id)`
- 帖子详情通过 `api.getPostDetail(id)` 与 `api.getComments("post", postId, page)`
- 发帖通过 `api.createPost(payload)`

### 5.3 人才市场

- `job` 模式：调用 `api.getJobList(filter)` 获取岗位
- `talent` 模式：调用 `api.getTalentList(keyword)` 获取候选人
- 投递：`api.applyJob(jobId)`
- 建联：`api.createChat(targetUid)`

兼容策略：

- 云端人才数据优先读取 `uid` / `openid`
- mock 人才数据已补充稳定 `uid`
- 如果个别旧数据仍缺失，页面层会用 `uid || openid || id` 兜底映射

### 5.4 消息

- 会话列表：`api.getChatList(type)`
- 聊天详情：`api.getMessages(chatId)`
- 发送文本：`api.sendMessage(chatId, content, "text")`
- 会话已读：`api.markChatRead(chatId)`
- 实时监听：`api.watchMessages(chatId, onChange)`

当前 `chat-detail` 只实现最小文本私聊能力，不做复杂 IM。

### 5.5 搜索

- 搜索页统一走 `api.search(keyword, type, page)`
- `type=all` 时返回对象：`{ news, posts, jobs, talents }`
- `type!=all` 时返回数组

当前前台只做基础展示，不做联想、历史、排序与复杂筛选。

## 6. 云函数清单

当前仓库可见的云函数目录如下：

| 云函数 | 用途 | 当前前台接入情况 |
| --- | --- | --- |
| `login` | 获取当前用户 `openid` 与基础用户信息 | 已接入 |
| `updateUser` | 更新用户资料字段，如求职状态 | 已接入 |
| `createPost` | 发帖 | 已接入 |
| `addComment` | 新增评论 | 底层存在，前台未完整接入 |
| `toggleLike` | 点赞/取消点赞 | 已接入帖子点赞 |
| `toggleFollow` | 关注/取消关注 | 底层存在，前台未完整接入 |
| `toggleFavorite` | 收藏/取消收藏 | 底层存在，前台未完整接入 |
| `applyJob` | 投递岗位 | 已接入 |
| `recordView` | 记录浏览/查看行为 | 预留 |
| `search` | 搜索资讯/帖子/岗位/人才 | 已接入，算法仍较粗糙 |
| `sendMessage` | 发送消息 | 已接入 |
| `createChat` | 创建或复用私聊会话 | 已接入 |
| `markChatRead` | 将当前用户在会话中的未读数置零 | 已接入 |
| `initData` | 初始化数据 | 运维/开发辅助 |
| `aiCoach` | AI 教练相关 | 目录存在，未接入 |
| `dietData` | 非当前业务核心目录 | 未接入 |
| `quickstartFunctions` | 云开发示例目录 | 未接入 |
| `agent-thincoach-9g85cgql7c081b7c` | 非当前主链路目录 | 未接入 |

## 7. 主要数据集合建议结构

下面不是强约束 schema，而是当前前端与云函数联调时的建议字段集合。字段可以扩展，但尽量保持这些核心语义不变。

### 7.1 `users`

```js
{
  _id,
  openid,
  uid,              // 可选，若使用自定义 uid 建议全局稳定
  nickname,
  avatarUrl,
  title,
  company,
  city,
  experienceYears,
  skills: [],
  jobStatus,        // "open" / "watching" / "not-looking" 等，建议统一 key
  intro,
  createdAt,
  updatedAt
}
```

### 7.2 `posts`

```js
{
  _id,
  authorId,
  authorName,
  authorAvatar,
  topic,
  content,
  images: [],
  likeCount,
  commentCount,
  likedBy: [],
  createdAt,
  updatedAt
}
```

### 7.3 `comments`

```js
{
  _id,
  targetType,       // "post" / "article"
  targetId,
  authorId,
  authorName,
  content,
  createdAt
}
```

### 7.4 `news`

```js
{
  _id,
  title,
  summary,
  cover,
  category,
  source,
  views,
  content,
  tags: [],
  createdAt
}
```

### 7.5 `jobs`

```js
{
  _id,
  companyId,
  companyName,
  title,
  city,
  salary,
  experience,
  education,
  tags: [],
  description,
  recruiterUid,
  createdAt,
  updatedAt
}
```

### 7.6 `talents`

```js
{
  _id,
  uid,              // 推荐保留；前台联系能力优先使用
  openid,           // 云端若直接用 openid 也可
  name,
  avatar,
  title,
  company,
  city,
  experienceYears,
  skills: [],
  intro,
  status,
  createdAt,
  updatedAt
}
```

### 7.7 `chats`

```js
{
  _id,
  type,             // "private"
  participantIds: [],
  participantProfiles: [],
  lastMessage,
  lastMessageType,
  lastMessageAt,
  unreadMap: {},
  createdAt,
  updatedAt
}
```

### 7.8 `messages`

```js
{
  _id,
  chatId,
  senderUid,
  receiverUid,
  content,
  type,             // "text"
  createdAt
}
```

### 7.9 `favorites`

```js
{
  _id,
  userId,
  targetType,       // "news" / "post" / "job"
  targetId,
  createdAt
}
```

### 7.10 `applications`

```js
{
  _id,
  jobId,
  candidateUid,
  recruiterUid,
  status,           // "submitted" / "reviewing" / "rejected" / "accepted"
  createdAt,
  updatedAt
}
```

### 7.11 `follows`

```js
{
  _id,
  followerUid,
  targetUid,
  createdAt
}
```

### 7.12 `profile_views`

```js
{
  _id,
  viewerUid,
  targetUid,
  source,           // "job-market" / "community" / "search" 等
  createdAt
}
```

## 8. 当前已实现 / 未实现

### 已实现

- 资讯列表与详情基本浏览
- 广场帖子列表、话题筛选、发帖
- 帖子点赞
- 人才市场岗位列表 / 人才列表展示
- 岗位投递最小闭环
- 从人才卡片发起私聊最小闭环
- 消息列表进入聊天详情
- 聊天详情文本发送
- 个人页求职状态保存
- 搜索最小闭环

### 未实现或待完善

- 岗位详情页、人才详情页
- 搜索高级能力
- 评论发布前台完整入口
- 收藏、关注、浏览记录前台完整入口
- 多媒体消息
- 未读数精细化更新
- 简历系统与投递状态看板

## 9. 推荐的下一阶段开发顺序

建议继续按“小步可验证”推进：

1. 把 `chat-detail` 的消息监听和未读数同步补完整
2. 给 `job` / `talent` 搜索结果补详情页或最小承接页
3. 打通帖子评论发布与列表刷新
4. 把个人中心中的“投递记录 / 谁看过我 / 我的收藏”接到真实数据
5. 重构搜索云函数，去掉全量拉取再内存过滤
6. 明确用户、人才、招聘方三类身份字段，统一 `uid/openid` 语义

## 10. 已知技术债

- `api.js` 仍承担较多数据整形职责，后续可以按领域拆分
- mock 数据与云端真实集合字段尚未完全一一对齐
- 一些旧页面仍有占位 toast，业务闭环尚未全部打通
- 目前大量页面依赖页面层手动处理错误，没有统一错误边界
- 搜索与聊天仍是 MVP 级实现，性能和状态一致性都需要后续加强
- 仓库内存在非主链路云函数目录，后续需要清理或明确归属

## 11. 本轮新增/关键文件

本轮为最小闭环新增或重点修改的文件：

- `miniprogram/utils/config.js`
- `miniprogram/utils/api.js`
- `miniprogram/pages/search/*`
- `miniprogram/pages/chat-detail/*`
- `miniprogram/pages/job-detail/*`
- `miniprogram/pages/talent-detail/*`
- `miniprogram/pages/job-market/job-market.js`
- `miniprogram/pages/message/message.js`
- `miniprogram/pages/home/home.js`
- `miniprogram/utils/mock-data.js`

这些改动都围绕三件事：

- 显式控制 mock 与 cloud 的行为边界
- 打通投递 / 建联 / 私聊的最小业务链路
- 给首页搜索补一个真正可进入、可返回结果的页面
