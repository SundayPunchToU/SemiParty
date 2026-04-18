const { getNavMetrics } = require("../../utils/util");

const categories = [
  { key: "company", name: "🏢 公司" },
  { key: "role", name: "🔧 工种" },
  { key: "tech", name: "🧪 技术" },
  { key: "campus", name: "🎓 校园" },
  { key: "supply", name: "📦 供应链" },
  { key: "region", name: "📍 地区" },
];

const contentTypes = [
  { key: "discuss", name: "讨论" },
  { key: "qa", name: "问答" },
  { key: "interview", name: "面经" },
  { key: "recruit", name: "招聘" },
  { key: "paper", name: "论文" },
  { key: "demand", name: "供需" },
  { key: "life", name: "生活" },
];

Page({
  data: {
    statusBarHeight: 24,
    capsuleHeight: 32,
    categories,
    contentTypes,
    form: {
      name: "",
      category: "",
      desc: "",
      reason: "",
      contentTypes: ["discuss"],
    },
    formValid: false,
    showSuccess: false,
  },

  onLoad() {
    const metrics = getNavMetrics();
    this.setData({
      statusBarHeight: metrics.statusBarHeight,
      capsuleHeight: metrics.capsuleHeight,
    });
  },

  _updateFormValid() {
    const { name, category, desc } = this.data.form;
    this.setData({ formValid: !!name && !!category && !!desc });
  },

  onNameInput(e) {
    this.setData({ "form.name": e.detail.value });
    this._updateFormValid();
  },

  onCategoryTap(e) {
    this.setData({ "form.category": e.currentTarget.dataset.key });
    this._updateFormValid();
  },

  onDescInput(e) {
    this.setData({ "form.desc": e.detail.value });
    this._updateFormValid();
  },

  onContentTypeTap(e) {
    const key = e.currentTarget.dataset.key;
    const list = this.data.form.contentTypes.slice();
    const idx = list.indexOf(key);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(key);
    }
    this.setData({ "form.contentTypes": list });
  },

  onReasonInput(e) {
    this.setData({ "form.reason": e.detail.value });
  },

  onUploadIcon() {
    console.log("上传专区图标");
  },

  onSubmit() {
    if (!this.data.formValid) return;
    console.log("提交专区申请", this.data.form);
    this.setData({ showSuccess: true });
  },

  onSuccessClose() {
    this.setData({ showSuccess: false });
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/community/community" }) });
  },

  goBack() {
    wx.navigateBack();
  },
});
