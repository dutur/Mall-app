import { request } from "../../request/index2.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
import { login } from "../../utils/asyncWx.js";
Page({
  data: {

  },
  onLoad: function (options) {

  },
  //获取用户信息
  async handleGetUserInfo(e){
    try{
      //1.获取用户信息
      const { encryptedData, rawData, iv, signature } = e.detail;
      //2.获取小程序登录成功后的code
      const { code } = await login();
      const loginParams = { encryptedData, rawData, iv, signature, code };
      console.log('code的值：' + code);
      //3.发送请求  获取用户的token
      const res = await request({ url: "/users/wxlogin", data: loginParams, method: "post" });
      //4.把token存入缓存中,同时跳转回上一个页面
      wx.setStorageSync("token", token);
      wx.navigateBack({
        delta: 1
      });
    }catch(error){
      console.log(error);
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})