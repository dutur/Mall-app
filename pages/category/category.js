import { request } from "../../request/index.js";
Page({
  data: {
    //左侧的菜单数据
    leftMenuList: [],
    //右侧的商品数据
    rightContent: [],
    //被点击的左侧的菜单
    currentIndex: 0,
    //右侧内容的滚动条距离顶部的距离
    scrollTop: 0
  },
  //分类接口的返回数据
  Cates: [],
  onLoad: function (options) {
    // web中的本地存储和小程序中的本地存储的区别
    // 1.写代码的方式不一样了
    // web：localStorage.setItem("key", "value") localStorage.getItem("key")
    // 小程序：wx.setStorageSync("key", "data") wx.getStorageSync(key)("key")
    // 2.存储的时候,有没有做类型转换
    // web：不管存入的是什么类型的数据,最终都会先调用下toString(),把数据变成了字符串,再存入进去
    // 小程序：不存在类型转换这个操作,存入的是什么类型的数据，拿到的数据类型就是什么

    // 1.先判断以下本地存储中有没有旧的数据
    // {time: Data.now(),data:[...]}
    // 2.没有旧数据,直接发送请求
    // 3.有旧的数据,同时旧的数据没有过期的话就使用本地存储中的旧数据即可
    //1.获取本地存储中的数据,(小程序中也是存在本地存储技术的)
    const Cates = wx.getStorageSync("cates");
    //2.判断
    if (!Cates) {
      //不存在,就发送请求获取数据
      this.getCates();
    } else {
      //有旧的数据，定义过期时间，10s改成5分钟
      if (Date.now() - Cates.time > 500000 * 10) {
        //重新发送请求
        this.getCates();
      } else {
        //可以使用旧的数据
        this.Cates = Cates.data;
        let leftMenuList = this.Cates.map(v => v.cat_name);
        let rightContent = this.Cates[0].children;
        this.setData({
          leftMenuList,
          rightContent
        })
      }
    }
  },
  //获取分类数据
  getCates(){
    request({
      url: '/categories'
    }).then(res => {
      this.Cates = res.data.message;

      // 把接口的数据存入到本地存储中
      wx.setStorageSync("cates", {time: Date.now(), data:this.Cates});

      //构造左侧的菜单数据
      let leftMenuList = this.Cates.map(v => v.cat_name);
      //构造右侧的商品数据
      let rightContent = this.Cates[0].children;
      this.setData({
        leftMenuList,
        rightContent
      })
    })
  },
  //左侧内容的点击事件
  handleItemTap(e){
    // 1.获取当前被点击的标题身上的索引
    // 2.给data中的currentIndex赋值
    const {index} = e.currentTarget.dataset;
    let  rightContent = this.Cates[index].children;
    //重新设置  右侧内容的scroll-view的标签距离顶部的距离
    this.setData({
      currentIndex: index,
      rightContent,
      scrollTop: 0
    })
  }
})