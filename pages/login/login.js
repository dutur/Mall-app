// pages/login/login.js
Page({
  data: {

  },
  onLoad: function (options) {

  },
  handleGetUserInfo(e){
    console.log(e);
    const {userInfo} = e.detail;
    wx.setStorageSync("userinfo", userInfo);
    wx.navigateBack({
      delta: 1
    })
  }
})