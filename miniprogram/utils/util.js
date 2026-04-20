function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}

function formatCount(value) {
  const num = Number(value || 0);
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1).replace(".0", "")}w`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(".0", "")}k`;
  }

  return `${num}`;
}

function parseSafeDate(dateText) {
  if (!dateText) {
    return null;
  }
  const date = new Date(dateText);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRelative(dateText) {
  const date = parseSafeDate(dateText);
  if (!date) {
    return typeof dateText === "string" ? dateText : "";
  }

  const diff = Date.now() - date.getTime();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  if (diff < hour) {
    const minutes = Math.max(1, Math.floor(diff / (10 * 60 * 1000)));
    return `${minutes}0m ago`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}h ago`;
  }

  if (diff < day * 7) {
    return `${Math.floor(diff / day)}天前`;
  }

  return `${date.getMonth() + 1}-${date.getDate()}`;
}

function getNavMetrics() {
  const app = getApp();
  return {
    brandName: app.globalData.brandName,
    statusBarHeight: app.globalData.statusBarHeight,
    navBarHeight: app.globalData.navBarHeight,
    capsuleHeight: app.globalData.capsuleHeight,
    navCapsuleInsetRight: app.globalData.navCapsuleInsetRight,
  };
}

function formatChatTime(dateText) {
  const date = parseSafeDate(dateText);
  if (!date) {
    return typeof dateText === "string" ? dateText : "";
  }

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "昨天";
  }

  return `${date.getMonth() + 1}-${date.getDate()}`;
}

module.exports = {
  deepClone,
  formatCount,
  formatRelative,
  formatChatTime,
  getNavMetrics,
};
