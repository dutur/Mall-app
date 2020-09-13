// pages/feedback/feedback.js
Page({
  data: {
    tabs: [
      {
        id: 0,
        value: '体验问题',
        isActive: true
      },
      {
        id: 1,
        value: '商品、商家投诉',
        isActive: false
      }
    ],
    //被选中的图片路径，以数组的形式存放
    chooseImgs: [],
    //文本域的内容
    textVal: "",
  },
  //外网的图片的路径数组
  UpLoadImgs: [],
  //配合tabs的使用
  handleTabsItemChange(e) {
    //1.获取被点击的标题索引
    const { index } = e.detail;
    //2.修改源数组
    let { tabs } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false)
    //3.赋值到data中
    this.setData({
      tabs
    })
  },
  //点击"+"选择图片
  handleChooseImg(){
    //2.调用内置的选择图片的api
    wx.chooseImage({
      //同时选中的图片的数量
      count: 9,
      //图片的格式 原图 压缩
      sizeType: ['original', 'compressed'],
      //图片的来源 相册  照相机
      sourceType: ['album', 'camera'],
      success: (result) => {
        this.setData({
          //图片数组  进行拼接
          chooseImgs: [...this.data.chooseImgs,...result.tempFilePaths]
        })
      }
    });
  },
  //点击自定义图片组件
  handleRemoveImg(e){
    //2.获取被点击的组件的索引
    const {index} = e.currentTarget.dataset;
    //3.获取data中的图片数组
    let {chooseImgs} = this.data;
    //4.删除元素
    chooseImgs.splice(index,1);
    this.setData({
      chooseImgs
    })
  },
  //文本域的输入事件
  handleTextInput(e){
    this.setData({
      textVal: e.detail.value
    })
  },
  //提交按钮的点击事件
  handleFormSubmit(){
    //1.获取文本域的内容
    const {textVal, chooseImgs} = this.data;
    //2.合法性的验证
    if(!textVal.trim()){
      //不合法
      wx.showToast({
        title: '请不要提交空白的内容',
        icon: 'none',
        mask: true
      });
      return;
    }
    //3.准备上传图片  到专门的图片服务器
    //上传图片的api不支持多个文件同时上传  蠢笨方法：遍历数组，挨个上传
    wx.showLoading({
      title: '正在上传中',
      mask: true
    })

    //判断有没有需要上传的图片数组
    if(chooseImgs.length != 0){
      chooseImgs.forEach((v, i) => {
        wx.uploadFile({
          //图片要上传到哪里的路径
          url: 'https://images.ac.cn/Home/Index/UploadAction/',
          //被上传文件的路径
          filePath: v,
          //上传的文件的名称，后台来获取对应的文件  名字可自定义
          name: 'file',
          //顺带的文本信息
          formData: {},
          success: (result) => {
            console.log(result);
            let url = JSON.parse(result.data).url;
            this.UpLoadImgs.push(url);
            console.log(this.UpLoadImgs);

            //所有的图片都上传完毕了才触发
            if (i === chooseImgs.length - 1) {
              wx.hideLoading();
              console.log("数据全部提交到后台了");
              //数据提交成功,重置页面
              this.setData({
                textVal: "",
                chooseImgs: []
              })
              //返回上一个页面
              wx.navigateBack({
                delta: 1
              })
            }
          }
        });
      })
    }else{
      wx.hideLoading();
      console.log('只是提交了文本');
      wx.navigateBack({
        delta: 1
      })
    }
  }
})