const interactionMessages = [
  {
    id: "int-1",
    type: "reply",
    user: { nickname: "李工", avatar: null, role: "设备工程师" },
    content: "回复了你的帖子",
    targetTitle: "N+1 良率爬坡速度大家觉得怎么样？",
    time: "10分钟前",
  },
  {
    id: "int-2",
    type: "like",
    user: { nickname: "王工", avatar: null, role: "工艺工程师" },
    content: "王工、张工等 8 人赞了你的帖子",
    targetTitle: "CMP Pad 寿命异常排查记录",
    time: "30分钟前",
    likeCount: 8,
  },
  {
    id: "int-3",
    type: "mention",
    user: { nickname: "赵工", avatar: null, role: "良率分析师" },
    content: "在 #CMP 话题下提到了你",
    targetTitle: "",
    time: "1小时前",
  },
  {
    id: "int-4",
    type: "best",
    user: { nickname: "系统", avatar: null, role: "" },
    content: "你的帖子被推荐了",
    targetTitle: "FinFET 工艺节点对比：N5 vs N3",
    time: "2小时前",
  },
  {
    id: "int-5",
    type: "reply",
    user: { nickname: "匿名用户", avatar: null, role: "" },
    content: "回复了你的帖子",
    targetTitle: "今天夜班食堂终于换了新菜单",
    time: "3小时前",
  },
];

const privateChatList = [
  { chatId: "chat-001", user: { userId: "u101", nickname: "Linda Chen", avatar: null, role: "HR", company: "长江存储" }, lastMessage: "您好，看到了您的简历，想聊聊工艺整合岗的机会。", lastMessageTime: "10:32", unreadCount: 2, isPinned: true },
  { chatId: "chat-002", user: { userId: "u102", nickname: "王工", avatar: null, role: "设备工程师", company: "中芯国际" }, lastMessage: "那个 CMP Pad 备件型号我帮你查了，是 IC1010。", lastMessageTime: "昨天", unreadCount: 0, isPinned: false },
  { chatId: "chat-003", user: { userId: "u103", nickname: "张教授", avatar: null, role: "博导", company: "清华大学" }, lastMessage: "论文修改意见已发邮箱，注意第三章数据。", lastMessageTime: "昨天", unreadCount: 1, isPinned: false },
  { chatId: "chat-004", user: { userId: "u104", nickname: "赵工", avatar: null, role: "良率分析师", company: "华虹半导体" }, lastMessage: "defect map 分析脚本发给你了。", lastMessageTime: "周一", unreadCount: 0, isPinned: false },
  { chatId: "chat-005", user: { userId: "u105", nickname: "小刘", avatar: null, role: "在校学生", company: "复旦大学" }, lastMessage: "学长好，想请教中芯工艺岗面试流程。", lastMessageTime: "周一", unreadCount: 3, isPinned: false },
  { chatId: "chat-006", user: { userId: "u106", nickname: "采购张姐", avatar: null, role: "采购经理", company: "中芯国际" }, lastMessage: "Applied Materials 说备件要 8 周交期，能等吗？", lastMessageTime: "上周", unreadCount: 0, isPinned: false },
  { chatId: "chat-007", user: { userId: "u107", nickname: "Mike Wang", avatar: null, role: "FAE", company: "ASML" }, lastMessage: "下周二上午可以安排 on-site support。", lastMessageTime: "上周", unreadCount: 0, isPinned: false },
  { chatId: "chat-008", user: { userId: "u108", nickname: "陈工", avatar: null, role: "整合工程师", company: "长江存储" }, lastMessage: "128 层 HAR etch 方案有兴趣了解吗？", lastMessageTime: "上周", unreadCount: 0, isPinned: false },
  { chatId: "chat-009", user: { userId: "u109", nickname: "SemiParty 小助手", avatar: null, role: "官方", company: "SemiParty" }, lastMessage: "恭喜你成为本周优质创作者。", lastMessageTime: "2周前", unreadCount: 0, isPinned: false },
  { chatId: "chat-010", user: { userId: "u110", nickname: "何总", avatar: null, role: "部门总监", company: "北方华创" }, lastMessage: "项目合作的事我和领导汇报了，下周回复。", lastMessageTime: "2周前", unreadCount: 0, isPinned: false },
];

const systemNotifications = [
  { id: "notif-001", type: "announcement", title: "SemiParty 版本更新", content: "茶水间、招聘、企业信息已经切到统一入口。", time: "今天 09:00", isRead: false },
  { id: "notif-002", type: "audit", title: "帖子审核通过", content: "你的帖子已通过审核并发布。", time: "昨天", isRead: false },
  { id: "notif-003", type: "activity", title: "线上活动提醒", content: "本周四 20:00 有一场半导体从业者线上分享。", time: "3天前", isRead: true },
  { id: "notif-004", type: "audit", title: "评论已被删除", content: "你的一条评论因违规被删除。", time: "上周", isRead: true },
  { id: "notif-005", type: "system", title: "账号安全提醒", content: "检测到新设备登录，如非本人请及时修改密码。", time: "2周前", isRead: true },
];

module.exports = {
  interactionMessages,
  privateChatList,
  systemNotifications,
};
