// pages/user/user.js
Page({
  data: {
    userinfo: {},
    //被收藏的商品数量
    collectNums: 0
  },
  onShow: function (options) {
    const userinfo = wx.getStorageSync("userinfo");
    const collect = wx.getStorageSync("collect")|| [];
    this.setData({userinfo, collectNums:collect.length});
  }
})