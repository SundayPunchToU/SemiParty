/**
 * 消息页「互动」Tab Mock 数据
 * ⚠️ 后续步骤会复用和扩展这份数据
 */

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
    content: "王工、张工 等 8 人赞了你的帖子",
    targetTitle: "CMP Pad 寿命异常排查记录",
    time: "30分钟前",
    likeCount: 8,
  },
  {
    id: "int-3",
    type: "mention",
    user: { nickname: "赵工", avatar: null, role: "良率分析师" },
    content: "在 [CMP技术专区] 提到了你",
    targetTitle: "",
    time: "1小时前",
  },
  {
    id: "int-4",
    type: "best",
    user: { nickname: "系统", avatar: null, role: "" },
    content: "你的帖子被设为精华",
    targetTitle: "FinFET 工艺节点对比：N5 vs N3",
    time: "2小时前",
  },
  {
    id: "int-5",
    type: "reply",
    user: { nickname: "匿名芯片人", avatar: null, role: "" },
    content: "回复了你的帖子",
    targetTitle: "今天夜班食堂终于换了新菜单",
    time: "3小时前",
  },
];

// === STEP 1.6 增强 修改开始：私聊/群组/通知 Mock 数据 ===

const privateChatList = [
  { chatId: "chat-001", user: { userId: "u101", nickname: "Linda Chen", avatar: null, role: "HR", company: "长鑫存储" }, lastMessage: "您好，看到您的简历，想聊聊工艺整合岗的机会", lastMessageTime: "10:32", unreadCount: 2, isPinned: true },
  { chatId: "chat-002", user: { userId: "u102", nickname: "王工", avatar: null, role: "设备工程师", company: "中芯国际" }, lastMessage: "那个 CMP Pad 备件型号我帮你查了，是 IC1010", lastMessageTime: "昨天", unreadCount: 0, isPinned: false },
  { chatId: "chat-003", user: { userId: "u103", nickname: "张教授", avatar: null, role: "博导", company: "清华大学" }, lastMessage: "论文修改意见已发邮箱，注意第三章数据", lastMessageTime: "昨天", unreadCount: 1, isPinned: false },
  { chatId: "chat-004", user: { userId: "u104", nickname: "赵工", avatar: null, role: "良率分析师", company: "华虹半导体" }, lastMessage: "defect map 分析脚本分享给你了", lastMessageTime: "周一", unreadCount: 0, isPinned: false },
  { chatId: "chat-005", user: { userId: "u105", nickname: "小刘", avatar: null, role: "在校学生", company: "复旦大学" }, lastMessage: "学长好！想请教中芯工艺岗面试流程？", lastMessageTime: "周一", unreadCount: 3, isPinned: false },
  { chatId: "chat-006", user: { userId: "u106", nickname: "采购张姐", avatar: null, role: "采购经理", company: "中芯国际" }, lastMessage: "Applied Materials 说备件要8周交期，能等吗？", lastMessageTime: "上周", unreadCount: 0, isPinned: false },
  { chatId: "chat-007", user: { userId: "u107", nickname: "Mike Wang", avatar: null, role: "FAE", company: "ASML" }, lastMessage: "下周二上午可以安排 on-site support", lastMessageTime: "上周", unreadCount: 0, isPinned: false },
  { chatId: "chat-008", user: { userId: "u108", nickname: "陈工", avatar: null, role: "整合工程师", company: "长江存储" }, lastMessage: "128层 HAR etch 方案有兴趣了解吗？", lastMessageTime: "上周", unreadCount: 0, isPinned: false },
  { chatId: "chat-009", user: { userId: "u109", nickname: "芯社区小助手", avatar: null, role: "官方", company: "芯社区" }, lastMessage: "恭喜您成为 CMP 技术专区优质创作者！", lastMessageTime: "2周前", unreadCount: 0, isPinned: false },
  { chatId: "chat-010", user: { userId: "u110", nickname: "何总", avatar: null, role: "部门总监", company: "北方华创" }, lastMessage: "项目合作的事我和领导汇报了，下周回复", lastMessageTime: "2周前", unreadCount: 0, isPinned: false },
];

const groupChatList = [
  { groupId: "grp-001", groupName: "CMP 技术交流群", memberCount: 128, lastSender: "李工", lastMessage: "有人遇到过 W-CMP 后表面划伤吗？", lastMessageTime: "15分钟前", unreadCount: 12, isPinned: true },
  { groupId: "grp-002", groupName: "中芯国际同事圈", memberCount: 256, lastSender: "匿名", lastMessage: "今年年终奖大家拿了几个月？", lastMessageTime: "32分钟前", unreadCount: 28, isPinned: true },
  { groupId: "grp-003", groupName: "25届半导体秋招群", memberCount: 512, lastSender: "小王", lastMessage: "华虹 offer 发了吗？有人收到吗", lastMessageTime: "1小时前", unreadCount: 45, isPinned: false },
  { groupId: "grp-004", groupName: "上海半导体人脉圈", memberCount: 389, lastSender: "张工", lastMessage: "张江新开了家不错的餐厅推荐", lastMessageTime: "2小时前", unreadCount: 5, isPinned: false },
  { groupId: "grp-005", groupName: "工艺工程师互助群", memberCount: 198, lastSender: "赵工", lastMessage: "有人做过 HKMG reliability 测试吗？", lastMessageTime: "3小时前", unreadCount: 0, isPinned: false },
  { groupId: "grp-006", groupName: "先进封装技术群", memberCount: 167, lastSender: "陈工", lastMessage: "TSMC CoWoS 产能瓶颈大家怎么看？", lastMessageTime: "5小时前", unreadCount: 0, isPinned: false },
  { groupId: "grp-007", groupName: "半导体设备采购群", memberCount: 89, lastSender: "采购张姐", lastMessage: "TEL 的 etch 设备最近有人询过价吗？", lastMessageTime: "昨天", unreadCount: 0, isPinned: false },
  { groupId: "grp-008", groupName: "EDA/IC设计交流群", memberCount: 145, lastSender: "刘工", lastMessage: "Synopsys 新版 ICC2 升级了吗？bug多不多", lastMessageTime: "昨天", unreadCount: 0, isPinned: false },
  { groupId: "grp-009", groupName: "合肥半导体圈", memberCount: 234, lastSender: "何工", lastMessage: "长鑫新产线在招人，有内推吗？", lastMessageTime: "周二", unreadCount: 0, isPinned: false },
  { groupId: "grp-010", groupName: "SiC/GaN 三代半群", memberCount: 76, lastSender: "孙工", lastMessage: "碳化硅衬底 micropipe 国产差距还大吗？", lastMessageTime: "上周", unreadCount: 0, isPinned: false },
];

const systemNotifications = [
  { id: "notif-001", type: "announcement", title: "芯社区 2.0 版本上线公告", content: "全新专区功能上线，快来加入你的圈子！", time: "今天 09:00", isRead: false },
  { id: "notif-002", type: "zone", title: "[CMP技术专区] 版规更新", content: "新增问答分类，鼓励分享实战经验", time: "昨天", isRead: false },
  { id: "notif-003", type: "audit", title: "帖子审核通过", content: "《N+1 良率爬坡速度…》已通过审核并发布", time: "昨天", isRead: true },
  { id: "notif-004", type: "activity", title: "🎉 半导体峰会线上直播", content: "12月15日 14:00 多位行业大咖分享，立即预约", time: "3天前", isRead: true },
  { id: "notif-005", type: "audit", title: "评论已被删除", content: "你在晶圆茶水间的评论因违规已被删除", time: "上周", isRead: true },
  { id: "notif-006", type: "announcement", title: "创作者激励计划上线", content: "优质创作者将获得专属标识和流量扶持", time: "上周", isRead: true },
  { id: "notif-007", type: "system", title: "账号安全提醒", content: "检测到新设备登录，如非本人请修改密码", time: "2周前", isRead: true },
];

// === STEP 1.6 增强 修改结束 ===

module.exports = {
  interactionMessages,
  privateChatList,
  groupChatList,
  systemNotifications,
};
