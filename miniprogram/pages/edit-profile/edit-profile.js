const { getNavMetrics } = require("../../utils/util");
const api = require("../../utils/api");

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
    loading: false,
    saving: false,
    form: {
      nickname: "",
      bio: "",
      company: "",
      city: "",
    },
    roleOptions: ROLE_OPTIONS,
    expOptions: EXP_OPTIONS,
    roleIndex: 0,
    expIndex: 0,
    original: null,
  },

  async onLoad() {
    this.setData({ ...getNavMetrics(), loading: true });
    try {
      const profile = await api.getUserProfile();
      this._applyProfile(profile || {});
    } catch (error) {
      console.error("load profile failed", error);
      wx.showToast({ title: error.message || "资料加载失败", icon: "none" });
      this._cacheOriginal();
    } finally {
      this.setData({ loading: false });
    }
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

  _buildSnapshot(nextState = {}) {
    const form = nextState.form || this.data.form;
    const roleIndex =
      nextState.roleIndex !== undefined ? nextState.roleIndex : this.data.roleIndex;
    const expIndex =
      nextState.expIndex !== undefined ? nextState.expIndex : this.data.expIndex;

    return JSON.stringify({
      form,
      roleIndex,
      expIndex,
    });
  },

  _cacheOriginal() {
    this.setData({
      original: this._buildSnapshot(),
      hasChanged: false,
    });
  },

  _applyProfile(profile) {
    const roleIndex = Math.max(
      this.data.roleOptions.findIndex((item) => item.name === (profile.role || profile.title || "")),
      0
    );
    const expIndex = Math.max(
      this.data.expOptions.findIndex((item) => item.name === (profile.experience || "")),
      0
    );

    this.setData({
      form: {
        nickname: profile.nickname || profile.nickName || "",
        bio: profile.bio || "",
        company: profile.company || "",
        city: profile.city || "",
      },
      roleIndex,
      expIndex,
    }, () => this._cacheOriginal());
  },

  _checkChanged() {
    const current = this._buildSnapshot();
    this.setData({ hasChanged: current !== this.data.original });
  },

  async handleSave() {
    if (!this.data.hasChanged || this.data.saving) return;

    const nickname = this.data.form.nickname.trim();
    if (!nickname) {
      wx.showToast({ title: "请填写昵称", icon: "none" });
      return;
    }

    const role = this.data.roleOptions[this.data.roleIndex]?.name || "";
    const experience = this.data.expOptions[this.data.expIndex]?.name || "";
    const payload = {
      nickname,
      nickName: nickname,
      bio: this.data.form.bio.trim(),
      company: this.data.form.company.trim(),
      city: this.data.form.city.trim(),
      role,
      title: role,
      experience,
      avatarText: nickname.slice(0, 1),
    };

    this.setData({ saving: true });
    try {
      await api.updateUser(payload);
      this.setData({
        form: {
          ...this.data.form,
          nickname,
          bio: payload.bio,
          company: payload.company,
          city: payload.city,
        },
      }, () => this._cacheOriginal());
      wx.showToast({ title: "保存成功", icon: "success" });
      setTimeout(() => wx.navigateBack(), 500);
    } catch (error) {
      console.error("save profile failed", error);
      wx.showToast({ title: error.message || "保存失败", icon: "none" });
    } finally {
      this.setData({ saving: false });
    }
  },

  onChangeAvatar() {
    console.log("选择头像");
    wx.showToast({ title: "待接入", icon: "none" });
  },

  goBack() {
    wx.navigateBack();
  },
});
