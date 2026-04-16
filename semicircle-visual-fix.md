# 芯圈 SemiCircle — 视觉比例与间距优化指令

> 本文档用于优化已有微信小程序前端的视觉呈现。请逐条对照执行，不要改变页面结构和功能逻辑，只调整样式。

---

## 〇、核心问题诊断

当前版本存在以下视觉问题：
1. **全局间距过大**：padding/margin 数值普遍偏高，单屏可见内容太少
2. **元素尺寸失调**：图标、头像、按钮、标签都偏大，比例不协调
3. **Tab 标签过于厚重**：使用了描边胶囊按钮样式，视觉噪音大
4. **信息密度不足**：首页一屏只能看到 1.5 条新闻，广场一屏只能看到 1.5 条帖子，消息页只显示 3 条——这对于一个信息流应用是致命的
5. **头像方形问题**：消息页头像显示为方形而非设计中的圆形/圆角

---

## 一、全局样式修改 (`app.wxss`)

### 1.1 缩小全局基础字号和间距变量

将以下变量替换为更紧凑的值：

```css
page {
  /* 字号系统——整体缩小一档 */
  --font-xs: 20rpx;    /* 保持不变 */
  --font-sm: 22rpx;    /* 保持不变 */
  --font-base: 24rpx;  /* 原 26rpx → 24rpx */
  --font-md: 26rpx;    /* 原 28rpx → 26rpx */
  --font-lg: 30rpx;    /* 原 32rpx → 30rpx */
  --font-xl: 34rpx;    /* 原 36rpx → 34rpx */
  --font-xxl: 40rpx;   /* 原 44rpx → 40rpx */

  /* 圆角系统 */
  --radius-sm: 6rpx;   /* 原 8rpx */
  --radius-md: 12rpx;  /* 原 16rpx */
  --radius-lg: 16rpx;  /* 原 24rpx → 明显缩小 */
  --radius-full: 999rpx;
}
```

### 1.2 通用组件类调整

```css
/* 容器内边距从 32rpx 缩至 24rpx */
.container { padding: 0 24rpx; }

/* 卡片内边距缩小 */
.card {
  padding: 20rpx 24rpx;   /* 原 28rpx 32rpx */
  margin-bottom: 16rpx;   /* 原 20rpx */
}

/* 头像尺寸全面缩小 */
.avatar-sm { width: 52rpx; height: 52rpx; font-size: 20rpx; }   /* 原 64rpx */
.avatar-md { width: 68rpx; height: 68rpx; font-size: 24rpx; }   /* 原 80rpx */
.avatar-lg { width: 100rpx; height: 100rpx; font-size: 36rpx; } /* 原 120rpx */

/* 标签尺寸缩紧 */
.tag {
  font-size: 20rpx;
  padding: 2rpx 10rpx;    /* 原 4rpx 14rpx */
  border-radius: 4rpx;
  line-height: 1.5;
}

/* section 标题间距缩小 */
.section-title {
  font-size: 28rpx;       /* 原 --font-lg(32rpx) */
  margin-bottom: 12rpx;   /* 原 20rpx */
}

/* 角标缩小 */
.badge {
  min-width: 32rpx;       /* 原 36rpx */
  height: 32rpx;
  border-radius: 16rpx;
  font-size: 18rpx;       /* 原 --font-xs */
  padding: 0 8rpx;
}
```

---

## 二、首页资讯页修改 (`pages/home/`)

### 2.1 搜索栏

```css
.search-bar {
  padding: 12rpx 20rpx;      /* 原 16rpx 24rpx 左右，整体偏大 */
  margin-bottom: 16rpx;      /* 原 24rpx+ */
  border-radius: 12rpx;      /* 原偏大 */
  font-size: 24rpx;          /* 原偏大 */
  height: auto;              /* 去除固定高度，让 padding 决定 */
}
.search-bar .icon {
  width: 28rpx;              /* 原 32rpx+ */
  height: 28rpx;
}
```

### 2.2 人才市场横幅——大幅缩小

这是当前页面最突出的比例问题，横幅太高太抢眼，应该压缩为一个紧凑的入口条：

```css
.job-banner {
  padding: 16rpx 20rpx;      /* 原 28rpx 32rpx，大幅缩小 */
  margin-bottom: 16rpx;      /* 原 24rpx+ */
  border-radius: 12rpx;      /* 原偏大 */
  gap: 16rpx;                /* 原 24rpx */
}
.job-banner-icon {
  width: 60rpx;              /* 原 88rpx，缩小约 30% */
  height: 60rpx;
  border-radius: 12rpx;
}
.job-banner-icon image,
.job-banner-icon .icon {
  width: 30rpx;              /* 图标同步缩小 */
  height: 30rpx;
}
.job-banner-title {
  font-size: 26rpx;          /* 原 28-30rpx */
  margin-bottom: 0;          /* 去除标题和副文案之间的多余间距 */
}
.job-banner-desc {
  font-size: 20rpx;          /* 原 22rpx+ */
  margin-top: 2rpx;
}
```

### 2.3 金刚区（4 宫格）——图标和间距全面缩小

```css
.quick-nav {
  margin-bottom: 16rpx;      /* 原 24rpx+ */
  gap: 0;                    /* 去除 grid gap，用 item 自身 padding 控制 */
}
.quick-item {
  padding: 8rpx 4rpx;        /* 原 20rpx 8rpx，大幅缩小 */
  gap: 6rpx;                 /* 图标和文字间距 */
}
.quick-icon {
  width: 64rpx;              /* 原 80rpx，缩小 20% */
  height: 64rpx;
  border-radius: 16rpx;
  font-size: 24rpx;          /* 原 28rpx+ */
}
.quick-item text {
  font-size: 20rpx;          /* 原 22rpx */
}
```

### 2.4 二级 Tab 切换条——从胶囊按钮改为下划线样式

**当前问题**：Tab 使用了带描边/填充的胶囊按钮样式，视觉权重太高，与专业简洁的定位不符。

**改为经典下划线 Tab 样式**：

```css
/* 删除 Tab 按钮的 border/background/border-radius */
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1rpx solid var(--color-border);
  margin-bottom: 16rpx;     /* 原 20rpx+ */
  padding: 0;
}
.tab-item {
  padding: 12rpx 24rpx;     /* 原偏大 */
  font-size: 26rpx;         /* 原偏大 */
  color: var(--color-text-secondary);
  border: none;             /* 删除描边 */
  background: none;         /* 删除背景 */
  border-radius: 0;         /* 删除圆角 */
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s;
}
.tab-item.active {
  color: var(--color-primary);
  font-weight: 600;
  border-bottom-color: var(--color-primary);
  background: none;         /* 确保选中态也没有背景 */
}
```

**WXML 改动**：如果当前 Tab 是用 `<button>` 实现的，改为 `<view>` 标签，去除按钮的默认样式干扰。

### 2.5 新闻卡片

```css
.news-card {
  padding: 16rpx 0;          /* 原 24rpx 0 */
}
.news-card .title {
  font-size: 28rpx;          /* 原 30rpx+ */
  line-height: 1.4;          /* 原 1.5+ */
  margin-bottom: 6rpx;       /* 原 8rpx+ */
}
.news-card .meta {
  font-size: 20rpx;          /* 原 22rpx */
  gap: 12rpx;                /* 原 16rpx */
}
.news-card .tags {
  gap: 8rpx;                 /* 标签之间的间距 */
  margin-bottom: 6rpx;       /* 原 12rpx */
}
```

---

## 三、广场社区页修改 (`pages/community/`)

### 3.1 页面标题

```css
.page-title {
  font-size: 40rpx;          /* 原 44rpx+ */
  margin-bottom: 12rpx;      /* 原 20rpx+ */
  padding: 0 24rpx;
}
```

### 3.2 话题标签横滑区

```css
.topic-scroll {
  margin-bottom: 12rpx;      /* 原 20rpx+ */
  padding: 0 24rpx;
}
.topic-tag {
  font-size: 20rpx;          /* 原 22rpx+ */
  padding: 4rpx 12rpx;       /* 原 8rpx 16rpx */
  margin-right: 12rpx;       /* 原 16rpx */
  border-radius: 4rpx;
}
```

### 3.3 帖子卡片——这是优化重点

```css
.post-card {
  padding: 16rpx 24rpx;      /* 原 24rpx 32rpx */
}

/* 头部：头像 + 作者信息 */
.post-header {
  gap: 12rpx;                /* 原 20rpx */
  margin-bottom: 10rpx;     /* 原 16rpx */
}
.post-header .avatar {
  width: 60rpx;              /* 原 72rpx-80rpx，明显偏大 */
  height: 60rpx;
  border-radius: 12rpx;     /* 如果是方形头像改为小圆角 */
  font-size: 22rpx;
}
.post-header .author-name {
  font-size: 26rpx;          /* 原 28rpx */
}
.post-header .author-title {
  font-size: 20rpx;          /* 原 22rpx */
}

/* 帖子正文 */
.post-body {
  font-size: 26rpx;          /* 原 28rpx */
  line-height: 1.5;          /* 原 1.6 */
  margin-bottom: 10rpx;     /* 原 16rpx */
}

/* 话题标签 */
.post-topic {
  margin-bottom: 8rpx;      /* 原 12rpx+ */
}

/* 操作栏 */
.post-actions {
  gap: 32rpx;                /* 原 40rpx */
  font-size: 22rpx;          /* 原 24rpx */
  padding-top: 8rpx;        /* 原 12rpx */
}
.post-actions .icon {
  width: 28rpx;              /* 原 32rpx+ */
  height: 28rpx;
}

/* 帖子时间 */
.post-time {
  font-size: 20rpx;
  color: var(--color-text-tertiary);
  margin-top: 4rpx;
}
```

### 3.4 FAB 浮动按钮

```css
.fab {
  width: 88rpx;              /* 原 96rpx */
  height: 88rpx;
  bottom: 140rpx;            /* 确保不被 tabBar 遮挡 */
  right: 28rpx;
  border-radius: 50%;
}
.fab .icon {
  width: 36rpx;
  height: 36rpx;
}
```

---

## 四、消息页修改 (`pages/message/`)

### 4.1 消息列表项——间距大幅缩紧

```css
.chat-item {
  padding: 16rpx 24rpx;      /* 原 24rpx 32rpx */
  gap: 16rpx;                /* 原 24rpx */
}

/* 头像修复：确保圆形 */
.chat-item .avatar {
  width: 76rpx;              /* 原 88rpx */
  height: 76rpx;
  border-radius: 50%;        /* ← 关键修复！强制圆形 */
  overflow: hidden;
  flex-shrink: 0;
}
/* 群组头像用圆角方形区分 */
.chat-item .avatar.group {
  border-radius: 16rpx;      /* 群组专用圆角方形 */
}

.chat-item .name {
  font-size: 28rpx;          /* 原 30rpx */
}
.chat-item .preview {
  font-size: 22rpx;          /* 原 24rpx */
  margin-top: 4rpx;          /* 原 8rpx */
}
.chat-item .time {
  font-size: 20rpx;
}
```

### 4.2 消息页 Tab 同样改为下划线样式

与首页 Tab 保持一致，不使用胶囊按钮。应用上面第 2.4 节同样的 `.tab-bar` / `.tab-item` 样式。

---

## 五、我的页修改 (`pages/profile/`)

### 5.1 个人名片区

```css
.profile-header {
  padding: 20rpx 0 24rpx;   /* 原 32rpx 0 40rpx */
}
.profile-header .avatar {
  width: 100rpx;             /* 原 120rpx+，缩小 */
  height: 100rpx;
  margin-bottom: 12rpx;     /* 原 20rpx */
}
.profile-header .name {
  font-size: 34rpx;          /* 原 36rpx */
}
.profile-header .title {
  font-size: 24rpx;
  margin-top: 4rpx;
}
.profile-header .status-tag {
  margin-top: 10rpx;        /* 原 16rpx */
  padding: 4rpx 16rpx;      /* 原 8rpx 20rpx */
  font-size: 22rpx;
}
```

### 5.2 数据统计栏

```css
.stats-row {
  gap: 12rpx;                /* 原 16rpx */
  margin-bottom: 24rpx;     /* 原 40rpx */
}
.stats-item {
  padding: 16rpx 0;          /* 原 20rpx+ */
  border-radius: 12rpx;
}
.stats-item .number {
  font-size: 36rpx;          /* 原 40rpx+ */
}
.stats-item .label {
  font-size: 20rpx;
  margin-top: 2rpx;
}
```

### 5.3 菜单列表

```css
.menu-section {
  margin-bottom: 16rpx;     /* 原 24rpx+ */
}
.menu-section-title {
  font-size: 22rpx;
  margin-bottom: 8rpx;      /* 原 12rpx+ */
  padding-left: 4rpx;
}
.menu-item {
  padding: 18rpx 16rpx;     /* 原 24rpx 24rpx */
  gap: 16rpx;                /* 原 24rpx */
}
.menu-icon {
  width: 52rpx;              /* 原 64rpx */
  height: 52rpx;
  border-radius: 12rpx;
  font-size: 22rpx;          /* 原 28rpx */
}
.menu-item .label {
  font-size: 26rpx;          /* 原 28rpx */
}
.menu-item .desc {
  font-size: 20rpx;          /* 原 22rpx */
  margin-top: 2rpx;
}
```

---

## 六、全局修改清单速查

| 修改项 | 原值 | 新值 | 影响范围 |
|--------|------|------|----------|
| 容器 padding | 32rpx | 24rpx | 全局 |
| 卡片 padding | 28rpx 32rpx | 20rpx 24rpx | 全局 |
| Tab 样式 | 胶囊描边按钮 | 文字+下划线 | 首页、广场、消息 |
| 人才横幅高度 | ~120rpx+ | ~76rpx | 首页 |
| 金刚区图标 | 80rpx | 64rpx | 首页 |
| 帖子头像 | 72-80rpx | 60rpx | 广场 |
| 消息头像 | 88rpx | 76rpx | 消息 |
| 消息头像形状 | 方形 | 圆形(私聊)/圆角方形(群组) | 消息 |
| 个人头像 | 120rpx+ | 100rpx | 我的 |
| 菜单图标 | 64rpx | 52rpx | 我的 |
| 新闻卡片间距 | 24rpx | 16rpx | 首页 |
| 帖子卡片间距 | 24rpx | 16rpx | 广场 |
| 基础字号 | 28rpx | 26rpx | 全局 |

---

## 七、优化后的预期效果

完成以上修改后，各页面的单屏可见内容量应达到：

| 页面 | 优化前 | 优化后目标 |
|------|--------|------------|
| 首页 | 搜索+横幅+金刚区+1.5条新闻 | 搜索+横幅+金刚区+Tab+2.5~3条新闻 |
| 广场 | 标题+Tab+话题+1.5条帖子 | 标题+Tab+话题+2.5~3条帖子 |
| 消息 | 标题+Tab+3条消息 | 标题+Tab+5~6条消息 |
| 我的 | 名片+统计+2个菜单项 | 名片+统计+4~5个菜单项 |

---

## 八、执行顺序建议

1. **先改 `app.wxss` 全局变量和通用类**——这会立刻让所有页面整体收紧
2. **再改 Tab 组件样式**——从胶囊改为下划线，消除最大的视觉违和感
3. **逐页微调**：首页 → 广场 → 消息 → 我的
4. **最后在模拟器中逐页检查**，确保没有元素挤压重叠，如有则局部微调

请严格按照以上数值修改，修改后在微信开发者工具的 iPhone 6/7/8（375×667）模拟器中验证比例是否协调。
