# SemiParty（芯圈）

> 仓库名：SemiParty　｜　产品名：芯圈　｜　定位：半导体行业垂类社区 + 招聘小程序

## 项目简介

芯圈是一款面向半导体从业者的微信小程序，提供行业资讯、社区交流、人才市场（求职/招聘双通道）和即时消息等核心功能。

## 当前功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 资讯首页 | ✅ 基本可用 | 新闻信息流，分类 Tab，下拉刷新，触底加载 |
| 社区广场 | ✅ 基本可用 | 帖子流，话题筛选，发帖，点赞，评论跳转 |
| 人才市场 | ✅ 基本可用 | 找工作/找人才双模式，关键词搜索，行业筛选 |
| 消息列表 | 🚧 骨架完成 | 私聊/群组/系统通知 Tab，聊天页待接入 |
| 个人中心 | ✅ 基本可用 | 求职状态切换并持久化，菜单入口待接入 |
| 文章详情 | ✅ 基本可用 | 富文本渲染，互动操作待接入 |
| 帖子详情 | 🚧 骨架完成 | 评论区展示待完善 |

## 技术栈

- **框架**：原生微信小程序（非 Taro / uni-app）
- **后端**：微信云开发（云函数 + 云数据库）
- **数据策略**：`withMockFallback` 双通道——云端优先，云不可用时自动降级 Mock
- **样式**：全局 CSS 变量体系（深色主题），`app.wxss` 统一定义

## 目录结构

```
SemiParty/
├── miniprogram/
│   ├── app.js / app.json / app.wxss   # 入口、路由、全局样式
│   ├── pages/                          # 8 个页面（4 Tab + 4 子页面）
│   ├── components/                     # 8 个自定义组件
│   └── utils/
│       ├── api.js          # 数据请求层（云函数 + Mock 双通道）
│       ├── mock-data.js    # 全量 Mock 数据
│       ├── constants.js    # 枚举常量（Tab、筛选项、状态）
│       └── util.js         # 工具函数
├── cloudfunctions/                     # 14 个云函数
│   ├── login / updateUser / createPost / addComment
│   ├── toggleLike / toggleFollow / toggleFavorite
│   ├── applyJob / recordView / search
│   ├── sendMessage / createChat / initData
│   └── aiCoach（空，待实现）
└── docs/
    └── CLOUD_BACKEND_SETUP.md          # 云开发环境配置指南
```

## 云开发依赖

项目依赖微信云开发环境，需在 [微信云开发控制台](https://console.cloud.tencent.com/tcb) 创建环境后：

1. 将环境 ID 填入 `miniprogram/envList.js` 的 `envList` 数组
2. 在云开发控制台创建以下数据库集合：
   `users` / `news` / `posts` / `comments` / `jobs` / `talents` / `chats` / `messages` / `favorites` / `applications` / `profile_views`
3. 上传所有云函数（`cloudfunctions/` 下各目录）

详见 `docs/CLOUD_BACKEND_SETUP.md`。

## 本地开发方式

1. 用**微信开发者工具**打开本仓库根目录
2. AppID 已配置为 `wxbed07cc169eb7598`，无需修改
3. 若未配置云环境，所有数据自动走 Mock 降级，页面可正常预览
4. 云函数调试：右键对应云函数目录 → 上传并部署

## 当前阶段说明（MVP）

当前处于 **MVP 阶段**，核心页面骨架和 UI 已完成，云开发后端接口已实现但尚未绑定真实云环境。以下功能为占位 Toast（`待接入`）：

- 搜索页、金刚区入口
- 聊天详情页
- 图片上传（发帖）
- 投递简历 / 主动沟通
- 个人中心菜单项（简历、投递记录、谁看过我等）

## 下一步计划

- [ ] 配置真实云开发环境，打通数据闭环
- [ ] 实现聊天详情页（实时消息已有云函数支撑）
- [ ] 接入图片上传（云存储）
- [ ] 完善帖子详情评论区（`addComment` 云函数已就绪）
- [ ] 投递简历 / 主动沟通功能（`applyJob` / `createChat` 云函数已就绪）
- [ ] AI 教练模块（`aiCoach` 云函数目录待实现）

