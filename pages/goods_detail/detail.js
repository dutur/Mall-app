// 1.发送请求获取数据
// 2.点击轮播图  预览大图
//   2.1给轮播图绑定点击事件
//   2.2调用小程序的api  previewImage
// 3.点击加入购物车
//   3.1先绑定点击事件
//   3.2获取缓存中的购物车数据  数组格式
//   3.3先判断  当前的产品是否存在购物车内
//   3.4已经存在  修改商品数据，执行购物车数量++，重新把购物车数组填充回缓存中
//   3.5不存在于购物车的数组中，直接给购物车数组添加一个新元素，新元素带上数量属性num，重新把购物车数组填充回缓存中
//   3.6弹出提示
import { request } from "../../request/index2.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({
  data: {
    // 存放商品的数据
    goodsDetail: {},
    //商品是否被收藏
    isCollect: false
  },
  //商品对象
  GoodsInfo:{},
  onShow: function () {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let options = currentPage.options;
    const {goods_id} = options;
    this.getGoodsDetail(goods_id);
  },
  //获取商品的详情数据
  async getGoodsDetail(goods_id) {
    const goodsDetail = await request({ url: "/goods/detail", data: { goods_id }});
    this.GoodsInfo = goodsDetail;
    //1.获取缓存中的商品收藏的数组
    let collect = wx.getStorageSync("collect") || [];
    //2.判断当前商品是否被收藏
    let isCollect = collect.some(v => v.goods_id === this.GoodsInfo.goods_id);
    this.setData({
      goodsDetail: {
        goods_name: goodsDetail.goods_name,
        goods_price: goodsDetail.goods_price,
        // iphone部分手机 不识别 webp图片格式 
        // 最好找到后台 让他进行修改 
        // 临时自己改 确保后台存在 1.webp => 1.jpg 
        goods_introduce: goodsDetail.goods_introduce.replace(/\.webp/g, '.jpg'),
        pics: goodsDetail.pics
      },
      isCollect
    })
  },
  //点击轮播图，放大预览
  handlePreviewImage(e){
    //1.先构造要预览的图片数组
    const urls = this.GoodsInfo.pics.map(v=>v.pics_mid);
    //2.接收传递过来的图片url
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current,
      urls
    })
  },
  //加入购物车的函数
  handleCartAdd(){
    //1.获取缓存中的购物车 数组格式,可以以空数组的形式存进本地缓存中
    let cart = wx.getStorageSync("cart")||[];
    //2.判断 商品对象是否存在于购物车数组中,当你清除缓存后或第一次点击时,cart这个数组是没有任何东西的
    let index = cart.findIndex(v => v.goods_id === this.GoodsInfo.goods_id)
    if(index === -1){
      //3.不存在,第一次添加,这个商品的数量为1,且在购物车页面看的时候是默认被选中的
      this.GoodsInfo.num = 1;
      this.GoodsInfo.checked = 1;
      cart.push(this.GoodsInfo);
    }else{
      //4.已经存在购物车数据  执行 num++
      cart[index].num++;
    }
    //5.把购物车重新添加回缓存中,第一个是本地缓存中指定的名称，第二个是需要存储的内容
    wx.setStorageSync("cart", cart);
    //6.弹窗提示
    wx.showToast({
      title: '加入成功',
      icon: 'success',
      //true 防止用户  手抖  疯狂点击按钮
      mask: true
    })
  },
  //商品详情页的收藏
  handleCollect(){
    let isCollect = false;
    //1.获取缓存中的商品收藏数组
    let collect = wx.getStorageSync("collect") || [];
    //2.判断该商品是否被收藏过
    let index = collect.findIndex(v => v.goods_id === this.GoodsInfo.goods_id);
    //3.当index != -1时,已经收藏过
    if(index !== -1){
      //能找到  代表已经收藏过了  在数组中删除该商品
      collect.splice(index, 1);
      isCollect = false;
      wx.showToast({
        title: '取消成功',
        success: 'success',
        mask: true
      })
    }else{
      //没有收藏过
      collect.push(this.GoodsInfo);
      isCollect = true;
      wx.showToast({
        title: '收藏成功',
        success: 'success',
        mask: true
      })
    }
    //4.把数组存入进缓存中
    wx.setStorageSync("collect", collect);
    //修改data当中的属性  isCollect
    this.setData({
      isCollect
    })
  }
})