// pages/goods_list/goods_list.js
// 用户上滑页面  滚动条触底  开始加载下一页数据  
//   1.找到滚动条触底事件  onReachBottom
//   2.判断还有没有下一月数据
      // 2.1获取到总页数  只有总条数
          // 总页数 = Math.ceil(总条数 / 页容量  pagesize)
          // 总页数 = Math.ceil(23 / 10) = 3
      // 2.2获取到当前的页码 pagenum
      // 2.3判断一下  当前的页码是否大于等于 总页数
      // 表示  没有下一页数据
//   3.假如没有下一页数据  弹出一个提示
//   4.假如还有下一页数据  来加载下一页数据
      // 4.1当前的页码++  4.2重新发送请求 4.3数据请求回来  要对data中的数组进行拼接，而不是替换
      // 5.下拉刷新事件  5.1触发下拉刷新事件(需要在当前页面的json文件开启一个配置项,找到 触发下拉刷新的事件) 5.2重置数据数组  5.3重置页码  设置为1  5.4重新发送请求  5.5数据请求回来，需要手动的关闭 等待效果
import { request } from "../../request/index.js";
Page({
  data: {
    tabs: [
      {
        id: 0,
        value: '综合',
        isActive: true
      },
      {
        id: 1,
        value: '销量',
        isActive: false
      },
      {
        id: 2,
        value: '价格',
        isActive: false
      }
    ],
    goodsList: []
  },
  //接口要的参数(因为商品列表页需要些商品当前的参数)
  QueryParams:{
    query: "",  //关键字
    cid: "",    //分类id
    pagenum: 1, //当前页码
    pagesize: 10 //页容量
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // onload是一个页面加载函数,当页面加载的时候,就执行的函数,当我们点击分类的图标时,就已经有了当前商品列表的参数了,因为每个商品的商品列表页都不同，卖电视的列表里总不能出现卖内衣的吧，所以在每个列表页里添加了参数好进行分辨
    console.log(options);
    this.QueryParams.cid = options.cid || "";
    this.QueryParams.query = options.query || "";
    this.getGoodList();
  },
  getGoodList() {
    request({ url: '/goods/search', data:this.QueryParams })
      .then(result => {
        console.log(result);
        //获取总条数
        const total = result.data.message.total;
        //计算总页数=(总条数 / 页容量)
        this.totalPages = Math.ceil(total / this.QueryParams.pagesize)
        this.setData({
          //拼接了数组
          goodsList: [...this.data.goodsList,...result.data.message.goods]
        })
      })
      //关闭下拉刷新的窗口 如果没有调用下拉刷新的窗口，直接关闭也不会报错
      wx.stopPullDownRefresh();
  },
  //标题点击事件  从子组件传递过来
  handleTabsItemChange(e){
    //1.获取被点击的标题索引
    const {index} = e.detail;
    //2.修改源数组
    let {tabs} = this.data;
    tabs.forEach((v,i) => i === index?v.isActive=true:v.isActive=false)
    //3.赋值到data中
    this.setData({
      tabs
    })
  },
  //页面下滑 滚动条触底事件
  onReachBottom: function () {
    //1.判断还有没有下一页数据
    if(this.QueryParams.pagenum >= this.totalPages){
      //没有下一页数据
      wx.showToast({
        title: '没有下一页数据了',
      })
    }else{
      //还有下一页数据
      this.QueryParams.pagenum++;
      this.getGoodList();
    }
  },
  //下拉刷新事件
  onPullDownRefresh(){
    //1.重置数组
    this.setData({
      goodsList:[]
    })
    //2.重置页码
    this.QueryParams.pagenum = 1;
    //3.发送请求
    this.getGoodList();
  }
})