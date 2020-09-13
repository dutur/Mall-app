/*
1.先给按钮绑定点击事件
2.调用小程序内置api，获取用户的收货地址，wx.chooseAddress
3.获取用户对小程序所授予获取地址的权限状态scope   wx.getSetting来判断状态
  3.1假设用户点击获取收货地址的提示框，点击确认  authSetting  scope.address
  scrope值为true
  3.2假设用户点击获取收货地址的是点击取消键
  scope值为false
  3.3假设用户从来没有调用过收货地址的api
  scope值为undefined
    3.3.1诱导用户自己打开授权设置页面 当用户重新给与 获取地址权限的时候
    3.3.2获取收货地址
    4.把获取到的收货地址存入到本地存储中
5.页面加载完毕后
  5.1获取本地存储中的地址数据
  5.2把数据设置给data中的一个变量里
6.onShow  6.1获取缓存中的购物车数组 6.2把购物车数组填充到data里
7.总价格和总数量  7.1都需要商品被选中 才能用来计算 7.2获取购物车数组  7.3遍历  7.4判断商品是否被选中
7.5总价格 += 商品的单价 * 商品的数量  7.6总数量 += 商品的数量  7.7把计算后的价格和数量设置在data中
8.商品的选中 8.1绑定change事件 8.2获取到被修改的商品对象  8.3商品对象的选中状态取反  8.4重新填充回data中和缓存中
8.5重新计算全选，总价格和总数量
9全选和反选  9.1全选复选框要绑定事件 9.2获取data中的全选变量  allChecked 9.3直接取反  allChecked = ！allChecked
9.4遍历购物车数组 让里面的商品选中状态跟随  allChecked改变而改变
9.5把购物车数组和allchecked重新设置回data
10.商品数量的编辑  + - 按钮绑定同一个点击事件  区分的关键  自定义属性
 */
import { getSetting, chooseAddress, openSetting, showModal, showToast} from '../../utils/asyncWx.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({
  data: {
    address:{},
    cart:[],
    allChecked: false,
    totalPrice: 0,
    totalNum: 0
  },
  onShow(){//监听页面显示的时候
    //1.获取缓存中的收货地址的信息
    const address = wx.getStorageSync("address");
    //1.获取缓存中的购物车数据
    const cart = wx.getStorageSync("cart")||[];

    this.setData({address});
    this.setCart(cart);
  },
  //点击收货地址
  async handleChooseAdress(){
    try {
      //1.获取权限状态
      const res1 = await getSetting();
      // 获取权限状态的过程中，发现一些属性名很怪异的时候，可以使用[]形式来获取属性值
      //在点击按钮的时候，无论是点击取消还是授权，都会有scope.address的值，要么是true，要么是false
      const scopeAddress = res1.authSetting['scope.address'];
      //2.判断权限状态
      if (scopeAddress === false) {
        // 为false的话，重新获取用户的授权结果
        await openSetting();
      }
      //4.调用获取收货地址的api
      let address = await chooseAddress();
      address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo;
      //5.存入到缓存中
      wx.setStorageSync("address", address);
    } catch (error) {
      console.log(error);
    }
  },
  //商品的选中
  handleItemChange(e){
    //1.获取被修改的商品的id
    const goods_id = e.currentTarget.dataset.id;
    //2.获取购物车数组
    let {cart} = this.data;
    //3.找到被修改的商品对象
    let index = cart.findIndex(v => v.goods_id === goods_id);
    //4.选中状态取反
    cart[index].checked = !cart[index].checked;
    this.setCart(cart);
  },
  //设置购物车状态的同时  重新计算 底部工具栏的数据 全选 总价格和购买的数量
  setCart(cart){
    let allChecked = true;
    //1.总价格 总数量
    let totalPrice = 0; 
    let totalNum = 0;
    cart.forEach(v => {
      if (v.checked) {
        totalPrice += v.num * v.goods_price;
        totalNum += v.num;
      } else {
        allChecked = false;
      }
    })
    //判断数组是否为空
    allChecked = cart.length != 0 ? allChecked : false;
    this.setData({
      cart,  
      totalPrice, totalNum, allChecked
    })
    wx.setStorageSync("cart", cart);
  },
  //商品的全选功能
  handleItemAllCheck(){
    //1.获取data中的数据
    let {cart, allChecked} = this.data;
    //2.修改值
    allChecked = !allChecked;
    //3.循环修改cart数组的商品选中状态
    cart.forEach(v => v.checked = allChecked);
    //4.把修改后的值填充回data或缓存中
    this.setCart(cart);
  },
  // 商品数量的编辑功能
  async handleItemNumEdit(e){
    //1.获取传递过来的参数
    const {operation,id} = e.currentTarget.dataset;
    //2.获取购物车数组
    let {cart} = this.data;
    //3.找到需要修改的商品的索引
    const index = cart.findIndex(v => v.goods_id === id);
    //4.判断是否要执行删除
    if(cart[index].num === 1 && operation === -1){
      //4.1弹窗提示(旧版,但也能实现相应的效果)
      // wx.showModal({
      //   title: '提示',
      //   content: '您是否要删除当前商品',
      //   success :(res) =>{
      //     if(res.confirm){
      //       cart.splice(index, 1);
      //       this.setCart(cart);
      //     }else if(res.cancel){
      //       console.log('用户点击取消');
      //     }
      //   }
      // })
      const res = await showModal({content: '您是否要删除当前商品?'});
      if (res.confirm) {
        cart.splice(index, 1);
        this.setCart(cart);
      }
    }else{
      //5.进行修改数量
      cart[index].num += operation;
      //6.设置回缓存和data里
      this.setCart(cart);
    }
  },
  //购物车页面的结算功能
  async handlePay(){
    //1.判断收货地址
    const {address, totalNum} = this.data;
    if(!address.userName){
      await showToast({title: "您还没有选择收货地址呢"});
      return;
    }
    //2.判断用户有没有选购商品
    if(totalNum === 0){
      await showToast({title: '您还没有选购商品呢'});
      return;
    }
    //3.跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/pay',
    })
  }
})