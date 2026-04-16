# 芯圈 SemiCircle — 微信小程序前端开发指令

> 本文档是一份完整的 AI 编程提示词，请直接喂给 Claude Code 执行。目标：生成一个**可直接运行**的微信小程序前端项目，后端云开发后期补齐，当前所有数据用 Mock 填充。

---

## 一、项目概述

### 1.1 产品定位
芯圈（SemiCircle）是一款**半导体行业垂直社交平台**微信小程序，核心功能：
- 行业资讯聚合（新闻 / 知识分享 / 企业动态 / 研报）
- 类虎扑/贴吧的开放社区（求职交流 / 技术讨论 / 职场吐槽 / 薪资爆料）
- 即时通讯（私聊 / 群组 / 系统通知）
- 人才市场双向通道（求职者找工作 + HR/猎头找人才）
- 个人中心（简历管理 / 求职状态 / 社区数据）

### 1.2 技术栈
- **框架**：微信小程序原生开发（WXML + WXSS + JS），不使用第三方框架
- **样式方案**：WXSS + CSS 变量统一主题管理
- **状态管理**：getApp().globalData + 页面 data（后期可迁移 MobX）
- **数据**：当前阶段全部使用 Mock 数据，所有 Mock 数据集中放在 `/utils/mock-data.js`
- **后端预留**：所有数据请求封装在 `/utils/api.js`，当前返回 Mock 数据，后期替换为云开发调用
- **图标方案**：使用微信小程序内置 icon 组件 + 自定义 SVG 转 base64 或 iconfont

### 1.3 目录结构
```
semicircle/
├── app.js                    # 全局逻辑、globalData
├── app.json                  # 全局配置、tabBar、pages 注册
├── app.wxss                  # 全局样式、CSS 变量、通用类
├── project.config.json
│
├── pages/
│   ├── home/                 # Tab 1：资讯首页
│   │   ├── home.wxml
│   │   ├── home.wxss
│   │   ├── home.js
│   │   └── home.json
│   ├── community/            # Tab 2：广场社区
│   │   ├── community.wxml
│   │   ├── community.wxss
│   │   ├── community.js
│   │   └── community.json
│   ├── message/              # Tab 3：消息
│   │   ├── message.wxml
│   │   ├── message.wxss
│   │   ├── message.js
│   │   └── message.json
│   ├── profile/              # Tab 4：我的
│   │   ├── profile.wxml
│   │   ├── profile.wxss
│   │   ├── profile.js
│   │   └── profile.json
│   ├── job-market/           # 人才市场（非 Tab 页，从首页跳入）
│   │   ├── job-market.wxml
│   │   ├── job-market.wxss
│   │   ├── job-market.js
│   │   └── job-market.json
│   ├── article-detail/       # 文章详情页
│   │   ├── article-detail.wxml
│   │   ├── article-detail.wxss
│   │   ├── article-detail.js
│   │   └── article-detail.json
│   ├── post-detail/          # 帖子详情页
│   │   ├── post-detail.wxml
│   │   ├── post-detail.wxss
│   │   ├── post-detail.js
│   │   └── post-detail.json
│   └── post-create/          # 发帖页
│       ├── post-create.wxml
│       ├── post-create.wxss
│       ├── post-create.js
│       └── post-create.json
│
├── components/               # 自定义组件
│   ├── news-card/            # 新闻卡片组件
│   ├── post-card/            # 社区帖子卡片组件
│   ├── job-card/             # 岗位卡片组件
│   ├── talent-card/          # 人才卡片组件
│   ├── chat-item/            # 消息列表项组件
│   ├── topic-tag/            # 话题标签组件
│   ├── search-bar/           # 搜索栏组件
│   ├── quick-nav/            # 金刚区组件
│   ├── tab-bar-custom/       # （备用）如果需要自定义 tabBar
│   └── empty-state/          # 空状态占位组件
│
├── utils/
│   ├── mock-data.js          # 所有 Mock 数据集中存放
│   ├── api.js                # 数据请求层（当前返回 Mock，后期替换云函数）
│   ├── util.js               # 工具函数（时间格式化、数字处理等）
│   └── constants.js          # 常量定义（枚举、配置项）
│
└── static/                   # 静态资源
    ├── icons/                # 图标文件
    └── images/               # 占位图片
```

---

## 二、全局配置

### 2.1 app.json
```json
{
  "pages": [
    "pages/home/home",
    "pages/community/community",
    "pages/message/message",
    "pages/profile/profile",
    "pages/job-market/job-market",
    "pages/article-detail/article-detail",
    "pages/post-detail/post-detail",
    "pages/post-create/post-create"
  ],
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#185FA5",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/home/home",
        "text": "资讯",
        "iconPath": "static/icons/home.png",
        "selectedIconPath": "static/icons/home-active.png"
      },
      {
        "pagePath": "pages/community/community",
        "text": "广场",
        "iconPath": "static/icons/community.png",
        "selectedIconPath": "static/icons/community-active.png"
      },
      {
        "pagePath": "pages/message/message",
        "text": "消息",
        "iconPath": "static/icons/message.png",
        "selectedIconPath": "static/icons/message-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "static/icons/profile.png",
        "selectedIconPath": "static/icons/profile-active.png"
      }
    ]
  },
  "window": {
    "navigationBarBackgroundColor": "#FFFFFF",
    "navigationBarTitleText": "芯圈",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#F5F5F5",
    "backgroundTextStyle": "dark"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

### 2.2 app.wxss — 全局主题变量和通用样式
```css
/* ============ 设计系统 ============ */

page {
  --color-primary: #185FA5;
  --color-primary-light: #E6F1FB;
  --color-primary-dark: #0C447C;

  --color-success: #0F6E56;
  --color-success-light: #E1F5EE;

  --color-warning: #854F0B;
  --color-warning-light: #FAEEDA;

  --color-danger: #E24B4A;
  --color-danger-light: #FCEBEB;

  --color-purple: #534AB7;
  --color-purple-light: #EEEDFE;

  --color-coral: #993C1D;
  --color-coral-light: #FAECE7;

  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F7F7F8;
  --color-bg-page: #F5F5F5;

  --color-text-primary: #1A1A1A;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  --color-text-placeholder: #CCCCCC;

  --color-border: #F0F0F0;
  --color-border-dark: #E5E5E5;

  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-full: 999rpx;

  --font-xs: 20rpx;
  --font-sm: 22rpx;
  --font-base: 26rpx;
  --font-md: 28rpx;
  --font-lg: 32rpx;
  --font-xl: 36rpx;
  --font-xxl: 44rpx;

  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-size: var(--font-md);
  color: var(--color-text-primary);
  background-color: var(--color-bg-page);
}

/* ============ 通用类 ============ */
.container { padding: 0 32rpx; }
.flex-row { display: flex; flex-direction: row; align-items: center; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }

.text-primary { color: var(--color-text-primary); }
.text-secondary { color: var(--color-text-secondary); }
.text-tertiary { color: var(--color-text-tertiary); }
.text-brand { color: var(--color-primary); }
.text-bold { font-weight: 600; }

.bg-white { background-color: var(--color-bg-primary); }
.bg-page { background-color: var(--color-bg-page); }

.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.divider {
  height: 1rpx;
  background: var(--color-border);
  margin: 0;
}

.avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.avatar-sm { width: 64rpx; height: 64rpx; font-size: var(--font-sm); }
.avatar-md { width: 80rpx; height: 80rpx; font-size: var(--font-md); }
.avatar-lg { width: 120rpx; height: 120rpx; font-size: var(--font-xl); }

.tag {
  display: inline-block;
  font-size: var(--font-xs);
  padding: 4rpx 14rpx;
  border-radius: 6rpx;
  font-weight: 500;
  line-height: 1.6;
}

.tag-blue    { background: var(--color-primary-light); color: var(--color-primary); }
.tag-green   { background: var(--color-success-light); color: var(--color-success); }
.tag-orange  { background: var(--color-warning-light); color: var(--color-warning); }
.tag-purple  { background: var(--color-purple-light);  color: var(--color-purple); }
.tag-coral   { background: var(--color-coral-light);   color: var(--color-coral); }
.tag-red     { background: var(--color-danger-light);   color: var(--color-danger); }

.section-title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-more {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
  font-weight: 400;
}

.badge {
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  background: var(--color-danger);
  color: #FFFFFF;
  font-size: var(--font-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
}

/* 安全区域适配 */
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

---

## 三、各页面详细设计规范

### 3.1 Tab 1 — 资讯首页 (`pages/home/home`)

#### 页面结构（从上到下）

**① 搜索栏**
- 圆角矩形，灰色背景 `var(--color-bg-secondary)`，左侧搜索图标，placeholder 文字："搜索行业新闻、技术文章…"
- 点击跳转到搜索页（当前阶段可以只做样式，跳转逻辑留空）

**② 人才市场入口横幅**
- 横跨全宽的渐变卡片，从 `#E6F1FB` 到 `#E1F5EE` 的 135 度渐变
- 左侧：蓝色圆角方块图标（内含人才图标），右侧：标题"人才市场 — 求职·招聘双通道" + 副文案显示实时数据"432个在招岗位 · 1,280位活跃候选人"
- 点击 `wx.navigateTo` 跳转到 `/pages/job-market/job-market`

**③ 金刚区（4 宫格快捷入口）**
- 4 列等宽 grid：行业快讯（蓝）、知识库（绿）、企业动态（橙）、研报精选（紫）
- 每个 item：色块圆角方形图标 40rpx + 下方文字标签
- 使用 `components/quick-nav/` 组件封装

**④ 二级 Tab 切换条**
- 横向滚动的标签栏：推荐 | 行业新闻 | 知识分享 | 企业动态
- 选中态：文字变蓝 + 底部 2rpx 蓝色下划线
- 切换 tab 刷新下方内容列表

**⑤ 内容信息流**
- 每条新闻卡片（使用 `components/news-card/`）：
  - 顶部：1~2 个彩色标签（行业/技术/企业/知识/重磅）
  - 中部：标题文字（最多 2 行，超出省略）
  - 底部：来源 · 时间 · 阅读数
- 卡片之间用 1rpx 分割线隔开
- 点击跳转到 `article-detail` 页面

#### Mock 数据示例（news-card）
```javascript
{
  id: "news_001",
  tags: [
    { text: "行业", type: "blue" },
    { text: "重磅", type: "green" }
  ],
  title: "中芯国际 Q1 财报超预期：14nm 产能利用率突破 90%，N+1 节点研发取得关键进展",
  source: "半导体行业观察",
  time: "2h ago",
  views: 1200,
  category: "industry"   // 用于二级 tab 筛选
}
```

---

### 3.2 Tab 2 — 广场社区 (`pages/community/community`)

#### 页面结构

**① 页面标题**
- 大字标题"广场"

**② 二级 Tab 切换条**
- 热门 | 求职交流 | 技术讨论 | 职场吐槽
- 样式同首页 Tab

**③ 热门话题横滑区**
- 横向滚动的话题标签列表，使用 `scroll-view` 横向滚动
- 话题样式：`# 秋招进展`（蓝）、`# 薪资爆料`（橙）、`# 工艺讨论`（紫）、`# 设备选型`（绿）、`# 行业八卦`（珊瑚色）
- 点击话题标签可以筛选下方帖子

**④ 帖子信息流**
- 每个帖子卡片（`components/post-card/`）：
  - 头部：头像 + 昵称 + 身份标签（如"工艺整合工程师 · 中芯国际"）
  - 正文：帖子内容（最多显示 3 行，超出截断加"展开"）
  - 话题标签：如 `# 工艺讨论`
  - 底部操作栏：点赞数 · 评论数 · 分享
- 卡片间 1rpx 分割线

**⑤ 浮动发帖按钮（FAB）**
- 固定在右下角（距底部 tabBar 上方 180rpx，距右 32rpx）
- 蓝色圆形，48rpx 半径，白色 + 号图标
- 点击跳转到 `post-create` 发帖页
- **特别注意**：需要设置 `position: fixed` 并考虑安全区域

#### Mock 数据示例（post-card）
```javascript
{
  id: "post_001",
  author: {
    name: "张工_SMIC",
    avatar_text: "张",
    avatar_bg: "#E6F1FB",
    avatar_color: "#185FA5",
    title: "工艺整合工程师 · 中芯国际"
  },
  content: "请教各位大佬，28nm HKM Gate-last 流程中 CMP 均匀性控制的经验？最近良率波动比较大，怀疑是 CMP 那步的问题。有没有遇到过类似情况的？",
  topic: { text: "工艺讨论", type: "purple" },
  likes: 47,
  comments: 23,
  isAnonymous: false,
  createdAt: "2025-04-16T08:00:00Z"
}
```

---

### 3.3 Tab 3 — 消息 (`pages/message/message`)

#### 页面结构

**① 页面标题**
- "消息"

**② 三级 Tab**
- 私聊 | 群组 | 系统通知
- 切换显示不同消息类型

**③ 消息列表**
- 每条消息项（`components/chat-item/`）：
  - 左侧：头像（个人头像用圆形 + 首字母/文字；群组用圆角方形 + "群"字标识）
  - 中部：名称 + 最后一条消息预览（单行截断）
  - 右上：时间戳
  - 右侧：未读数红色角标（如有）

**④ 消息类型区分**
| 类型 | 头像样式 | 角标颜色 | 示例 |
|------|----------|----------|------|
| HR/猎头主动联系 | 圆形，蓝/紫底 | 红色数字 | "SMIC 招聘官" |
| 技术群组 | 圆角方形，绿底 | 红色数字 | "刻蚀工艺交流群" |
| 秋招互助群 | 圆角方形，橙底 | 红色数字 | "2026 秋招互助群" |
| 个人私聊 | 圆形 | 红色数字 | "王博_清华微电子" |
| 猎头 | 圆形，紫底 | 无 | "Sarah_猎头" |

#### Mock 数据示例
```javascript
{
  id: "chat_001",
  type: "private",          // "private" | "group" | "system"
  name: "SMIC 招聘官",
  avatar_text: "HR",
  avatar_bg: "#E6F1FB",
  avatar_color: "#185FA5",
  avatar_shape: "circle",   // "circle" | "rounded"
  lastMessage: "您好，看到您的简历对 PE 岗位很匹配，方便聊聊吗？",
  time: "10:32",
  unread: 1
}
```

---

### 3.4 Tab 4 — 我的 (`pages/profile/profile`)

#### 页面结构

**① 个人名片区**
- 居中布局：大头像（120rpx 圆形）+ 用户名 + 职称/经验
- 重要：**求职状态胶囊**——绿色圆角胶囊显示"在看机会"，左侧有绿色小圆点
- 状态可选值：`在看机会`（绿）| `主动求职`（蓝）| `暂不考虑`（灰）
- 点击胶囊可弹出选择器切换状态

**② 数据统计栏**
- 3 列等宽 grid：发帖数 / 获赞数 / 关注数
- 每格：大数字 + 下方灰色标签

**③ 菜单列表 — 求职管理**
- 节标题："求职管理"
- 4 个菜单项，每项：左侧色块图标 + 标题 + 描述 + 右箭头
  - 我的简历（蓝）：描述"在线简历 · 已完善 85%"
  - 投递记录（绿）：描述"3 个岗位进行中"
  - 谁看过我（紫）：描述"12 位 HR/猎头近 7 天浏览"
  - 求职状态（橙）：描述"当前：在看机会"

**④ 菜单列表 — 社区相关**
- 我的收藏：描述"文章 · 帖子 · 岗位"
- 浏览历史
- 我的群组：描述"4 个群组"

**⑤ 菜单列表 — 设置**
- 隐私与安全
- 通知设置

---

### 3.5 人才市场页 (`pages/job-market/job-market`)

#### 页面结构

**这是一个非 Tab 页**，通过 `wx.navigateTo` 从首页横幅进入，顶部有返回箭头。

**① 页面标题**
- "人才市场" + 副标题"求职 · 招聘双向通道"

**② 双面切换器（Segmented Control）**
- 两个等宽按钮：`找工作` | `找人才`
- 容器：灰色背景圆角矩形
- 选中态：白色背景 + 蓝色文字 + 轻微投影
- 切换时平滑过渡动画（用 `transition`）

**③-A 找工作视图**

当选中"找工作"时显示：

- **搜索栏**：placeholder "岗位名称、公司、关键词"
- **热门筛选标签**：横向排列的可点击标签（工艺 / 设计 / 封测 / 设备 / EDA / 材料），选中态加边框
- **岗位卡片列表**（`components/job-card/`）：
  - 职位名称（加粗）
  - 公司 · 城市 · 经验要求
  - 技能标签（灰色小 tag）
  - 薪资范围（蓝色加粗，如"40-60K · 16薪"）
  - 卡片有边框，圆角，hover 态边框变深

**③-B 找人才视图**

当选中"找人才"时显示：

- **搜索栏**：placeholder "搜索人才：技能、经验、学校…"
- **人才卡片列表**（`components/talent-card/`）：
  - 头像 + 姓名（脱敏，如"刘 **"）+ 学历
  - 学校
  - 经验描述：X 年经验 · 当前职位 · 期望方向
  - 技能标签 + 求职状态标签
  - 底部：可点击"主动沟通"按钮

#### Mock 数据示例
```javascript
// 岗位数据
{
  id: "job_001",
  title: "高级工艺整合工程师",
  company: "中芯国际",
  city: "上海",
  experience: "5-10年",
  tags: ["14nm", "Gate-last", "良率提升"],
  salary: "40-60K",
  bonus: "16薪",
  category: "process"     // 用于筛选
}

// 人才数据
{
  id: "talent_001",
  name: "刘 **",
  education: "硕士",
  school: "清华大学 · 微电子",
  years: 5,
  currentRole: "某 Fab 工艺工程师",
  targetRole: "工艺整合",
  tags: ["FinFET", "CMP", "良率分析"],
  status: "在看机会",       // "在看机会" | "主动求职" | "暂不考虑"
  avatar_text: "刘",
  avatar_bg: "#E6F1FB",
  avatar_color: "#185FA5"
}
```

---

### 3.6 文章详情页 (`pages/article-detail/article-detail`)

- 自定义导航栏（返回 + 分享按钮）
- 标题区：大标题 + 来源 + 发布时间 + 阅读数
- 正文区：富文本 `<rich-text>` 渲染（Mock 阶段用几段 HTML 字符串模拟）
- 底部操作栏：fixed 定位，包含 点赞 / 收藏 / 评论 / 分享

### 3.7 帖子详情页 (`pages/post-detail/post-detail`)

- 顶部：作者信息卡片（头像 + 名称 + 身份 + 关注按钮）
- 正文区：帖子全文
- 评论区：评论列表，每条评论包含头像、昵称、内容、时间、点赞
- 底部输入栏：fixed 定位，输入框 + 发送按钮

### 3.8 发帖页 (`pages/post-create/post-create`)

- 顶部导航：取消 | 发布按钮（蓝色）
- 正文输入：`<textarea>` 多行输入，placeholder "分享你的想法…"
- 话题选择器：点击弹出话题列表（底部弹出 popup）
- 匿名开关：`<switch>` 组件，开启后隐藏个人身份
- 图片上传：最多 9 张，网格展示

---

## 四、组件设计规范

### 4.1 news-card 组件
```
Properties:
  - item: Object (新闻数据对象)

Events:
  - bindtap → navigateTo article-detail?id=xxx
```

### 4.2 post-card 组件
```
Properties:
  - item: Object (帖子数据对象)
  - showTopic: Boolean (是否显示话题标签，默认 true)

Events:
  - bindtap → navigateTo post-detail?id=xxx
  - bindlike → 触发点赞动画 + 更新数据
  - bindcomment → navigateTo post-detail?id=xxx&focus=comment
  - bindshare → 触发分享
```

### 4.3 job-card 组件
```
Properties:
  - item: Object (岗位数据)

Events:
  - bindtap → 展开岗位详情（或跳转详情页）
  - bindapply → 投递简历（当前阶段 showToast 提示"功能开发中"）
```

### 4.4 talent-card 组件
```
Properties:
  - item: Object (人才数据)

Events:
  - bindcontact → 发起沟通（跳转消息页或 showToast 提示）
```

### 4.5 chat-item 组件
```
Properties:
  - item: Object (消息数据)

Events:
  - bindtap → 进入聊天详情（当前阶段 showToast 提示"功能开发中"）
```

---

## 五、交互与动效规范

### 5.1 页面切换
- Tab 切换使用微信原生 tabBar，无需自定义动画
- 非 Tab 页使用 `wx.navigateTo` 跳转，默认右滑入场

### 5.2 下拉刷新
- 首页、广场页开启下拉刷新（json 中 `"enablePullDownRefresh": true`）
- 刷新时展示系统 loading 动画

### 5.3 滚动加载
- 信息流触底加载更多，使用 `onReachBottom` 生命周期
- 加载态：列表底部显示"加载中…"
- 无更多数据态："没有更多了"

### 5.4 点赞动效
- 点赞时数字 +1，图标变为实心 + 蓝色，轻微缩放动画（`transform: scale(1.2)` → `scale(1)`，200ms）

### 5.5 浮动按钮
- 广场页的 FAB 按钮在滚动时稍微缩小为圆点（可选优化）
- 点击时有按压缩放反馈

---

## 六、Mock 数据规范

所有 Mock 数据统一放在 `utils/mock-data.js`，导出以下数据集：

```javascript
module.exports = {
  // 首页-新闻列表
  newsList: [ /* 至少 8 条，覆盖所有 category */ ],

  // 广场-帖子列表
  postList: [ /* 至少 6 条，覆盖不同话题 */ ],

  // 消息列表
  chatList: [ /* 至少 6 条，混合私聊/群组/系统 */ ],

  // 人才市场-岗位
  jobList: [ /* 至少 5 条 */ ],

  // 人才市场-人才库
  talentList: [ /* 至少 4 条 */ ],

  // 用户个人信息
  userProfile: {
    name: "陈工",
    avatar_text: "陈",
    title: "工艺整合工程师",
    experience: "5 年经验",
    jobStatus: "在看机会",    // "在看机会" | "主动求职" | "暂不考虑"
    stats: { posts: 23, likes: 156, following: 89 }
  },

  // 话题列表
  topicList: [
    { id: "t1", text: "秋招进展", type: "blue" },
    { id: "t2", text: "薪资爆料", type: "orange" },
    { id: "t3", text: "工艺讨论", type: "purple" },
    { id: "t4", text: "设备选型", type: "green" },
    { id: "t5", text: "行业八卦", type: "coral" }
  ],

  // 金刚区入口
  quickNavList: [
    { id: "q1", icon: "IC", label: "行业快讯", bg: "#E6F1FB", color: "#185FA5" },
    { id: "q2", icon: "K",  label: "知识库",   bg: "#E1F5EE", color: "#0F6E56" },
    { id: "q3", icon: "F",  label: "企业动态", bg: "#FAEEDA", color: "#854F0B" },
    { id: "q4", icon: "R",  label: "研报精选", bg: "#EEEDFE", color: "#534AB7" }
  ]
};
```

---

## 七、API 封装规范

`utils/api.js` 统一封装数据请求，当前返回 Mock 数据，后期替换云开发：

```javascript
const mockData = require('./mock-data');

// 模拟网络延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  // 获取新闻列表
  async getNewsList(category = 'recommend', page = 1) {
    await delay();
    const filtered = category === 'recommend'
      ? mockData.newsList
      : mockData.newsList.filter(n => n.category === category);
    return { data: filtered, hasMore: false };
  },

  // 获取帖子列表
  async getPostList(topic = 'hot', page = 1) {
    await delay();
    return { data: mockData.postList, hasMore: false };
  },

  // 获取消息列表
  async getChatList(type = 'all') {
    await delay();
    const filtered = type === 'all'
      ? mockData.chatList
      : mockData.chatList.filter(c => c.type === type);
    return { data: filtered };
  },

  // 获取岗位列表
  async getJobList(category = 'all') {
    await delay();
    return { data: mockData.jobList };
  },

  // 获取人才列表
  async getTalentList(keyword = '') {
    await delay();
    return { data: mockData.talentList };
  },

  // 获取用户信息
  async getUserProfile() {
    await delay(100);
    return mockData.userProfile;
  }
};
```

---

## 八、关键实现注意事项

### 8.1 样式相关
- 全部使用 `rpx` 作为尺寸单位，确保多设备适配
- 颜色全部引用 CSS 变量，不要硬编码 hex 值（方便后期换肤/暗色模式）
- 列表类页面注意底部安全区域（iPhone 底部横条），使用 `padding-bottom: env(safe-area-inset-bottom)`
- tabBar 遮挡问题：列表页底部加 `padding-bottom: 120rpx` 防止最后一条内容被遮挡

### 8.2 性能相关
- 长列表使用虚拟列表或分页加载，避免一次性渲染过多节点
- 图片使用 `lazy-load` 属性延迟加载
- 组件使用 `Component` 方式定义，开启 `addGlobalClass: true` 以继承全局样式

### 8.3 后端预留
- 所有 `api.js` 方法签名保持不变，后期只需将内部实现替换为 `wx.cloud.callFunction`
- 数据结构保持一致，云数据库 collection 名称与 Mock 数据 key 对应：
  - `news` → newsList
  - `posts` → postList
  - `chats` → chatList
  - `jobs` → jobList
  - `talents` → talentList
  - `users` → userProfile

### 8.4 tabBar 图标
- 需要生成 8 个图标文件（4 个默认态 + 4 个选中态）
- 尺寸 81×81 px，格式 PNG，放在 `static/icons/` 下
- 如果无法生成真实图标文件，可以使用文字占位，在 `app.json` 中注释说明后期替换
- **推荐方案**：使用 Canvas 绘制简单的线框图标并导出为 PNG

### 8.5 需要生成的完整文件清单
请确保以下所有文件都被创建且可运行：
1. `app.js` / `app.json` / `app.wxss`
2. 8 个页面（每个含 .wxml / .wxss / .js / .json 共 4 个文件）
3. 至少 5 个核心组件（news-card / post-card / job-card / talent-card / chat-item）
4. `utils/mock-data.js` / `utils/api.js` / `utils/util.js` / `utils/constants.js`
5. tabBar 图标文件（至少用占位文件）
6. `project.config.json`

---

## 九、验收标准

完成后请自查：
1. 微信开发者工具中编译无报错
2. 四个 Tab 可以正常切换，页面内容完整渲染
3. 首页人才市场横幅点击可跳转到人才市场页
4. 人才市场页"找工作"/"找人才"切换正常
5. 广场页发帖按钮 FAB 正确显示且不被 tabBar 遮挡
6. 所有列表可滚动，不卡顿
7. 组件化良好，无重复代码
8. Mock 数据内容真实合理，体现半导体行业特色
9. 整体视觉风格简洁专业，蓝色主色调统一，间距/字号/圆角一致
