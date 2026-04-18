const { getNavMetrics } = require("../../utils/util");
const { myProfile } = require("../../mock/profileData");

const ROLE_OPTIONS = [
  { key: "process", name: "工艺工程师" },
  { key: "equipment", name: "设备工程师" },
  { key: "yield", name: "良率分析师" },
  { key: "pi", name: "整合工程师" },
  { key: "test", name: "封测工程师" },
  { key: "eda", name: "EDA工程师" },
  { key: "quality", name: "品质工程师" },
  { key: "fae", name: "FAE" },
  { key: "hr", name: "HR" },
  { key: "purchase", name: "采购经理" },
  { key: "director", name: "技术总监" },
  { key: "student", name: "在校学生" },
  { key: "other", name: "其他" },
];

const EXP_OPTIONS = [
  { key: "in_school", name: "在校" },
  { key: "lt1", name: "1年以内" },
  { key: "1-3", name: "1-3年" },
  { key: "3-5", name: "3-5年" },
  { key: "5-10", name: "5-10年" },
  { key: "10+", name: "10年+" },
];

Page({
  data: {
    statusBarHeight: 24,
    hasChanged: false,
    form: {
      nickname: myProfile.nickname,
      bio: myProfile.bio,
      company: myProfile.company,
      city: "",
    },
    roleOptions: ROLE_OPTIONS,
    expOptions: EXP_OPTIONS,
    roleIndex: 0,
    expIndex: 4,
    original: null,
  },

  onLoad() {
    this.setData({ ...getNavMetrics() });
    // TODO: GET /api/user/profile → fill form
    const original = JSON.stringify(this.data.form);
    this.setData({ original });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`form.${field}`]: value });
    this._checkChanged();
  },

  onRolePick(e) {
    this.setData({ roleIndex: Number(e.detail.value) });
    this._checkChanged();
  },

  onExpPick(e) {
    this.setData({ expIndex: Number(e.detail.value) });
    this._checkChanged();
  },

  _checkChanged() {
    const current = JSON.stringify(this.data.form);
    this.setData({ hasChanged: current !== this.data.original });
  },

  handleSave() {
    if (!this.data.hasChanged) return;
    // TODO: PUT /api/user/profile
    const formData = {
      ...this.data.form,
      role: this.data.roleOptions[this.data.roleIndex].name,
      experience: this.data.expOptions[this.data.expIndex].name,
    };
    console.log("保存资料", formData);
    wx.showToast({ title: "保存成功", icon: "success" });
    setTimeout(() => wx.navigateBack(), 800);
  },

  onChangeAvatar() {
    console.log("选择头像");
    wx.showToast({ title: "待接入", icon: "none" });
  },

  goBack() {
    wx.navigateBack();
  },
});
