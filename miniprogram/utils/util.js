function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}

function formatCount(value) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1).replace(".0", "")}w`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".0", "")}k`;
  }

  return `${value}`;
}

function formatRelative(dateText) {
  if (!dateText) {
    return "";
  }

  const date = new Date(dateText);
  const diff = Date.now() - date.getTime();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / (10 * 60 * 1000)))}0m ago`;
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
    navBarHeight: app.globalData.navBarHeight
  };
}

module.exports = {
  deepClone,
  formatCount,
  formatRelative,
  getNavMetrics
};
