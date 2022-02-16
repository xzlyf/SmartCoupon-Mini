// pages/goodsDetail/goodsDetail.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //轮播图配置
        autoplay: true,
        interval: 5000,
        duration: 1200,
        //视图控制
        showGiftView: false,
        showModal: false,
        secretText: "",
        id: "",
        detail: {},
        pics: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //传授传入的商品id
        this.data.id = options.id
        this.getGoodsDetail();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 获取商品详情
     */
    getGoodsDetail: function () {
        var self = this
        wx.request({
            url: app.globalData.appServerByDataokeRelay,
            method: 'GET',
            data: {
                api: '/api/goods/get-goods-details',
                appKey: app.globalData.appKeyByDataoke,
                version: 'v1.2.3',
                id: self.data.id
            },
            success: function (res) {
                var data = res.data.data
                //手动获取图片展示图
                var picsArry = []
                picsArry.push(data.mainPic)
                picsArry.push(data.marketingMainPic)
                var imgsArrays = data.imgs.split(',')
                if (imgsArrays.length > 0) {
                    picsArry = picsArry.concat(imgsArrays)
                }

                if (data.specialText.length > 0) {
                    self.data.showGiftView = true
                }
                self.setData({
                    detail: data,
                    pics: picsArry,
                    showGiftView: self.data.showGiftView
                })
                console.log(self.data.detail)

            },
            fail: function (ex) {
                wx.showModal({
                    title: "错误",
                    content: "当前与服务器通信异常，\r\n请检查网络后重试",
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateBack({
                                delta: 1,
                            })
                        }
                    }
                })
            }
        })
    },
    /**
     * 高效转链
     */
    couponClick: function (v) {
        var goodsId = v.currentTarget.dataset.goodsid
        var self = this
        wx.showLoading({
            title: '正在获取优惠券，稍安勿躁...',
            mask: true
        })
        wx.request({
            url: app.globalData.appServerByDataokeRelay,
            method: 'GET',
            data: {
                api: "/api/tb-service/get-privilege-link",
                appKey: app.globalData.appKeyByDataoke,
                version: "v1.3.1",
                goodsId: goodsId
            },
            success: function (res) {
                wx.hideLoading()
                console.log(res)
                if (res.statusCode != 200) {
                    wx.showToast({
                        title: 'API异常',
                        icon: 'error'
                    })
                    return;
                }
                if (res.data.code != 0) {
                    wx.showModal({
                        title: "商品异常",
                        content: res.data.msg,
                        showCancel: false,
                    })
                    return;
                }

                var data = res.data.data
                self.setData({
                    showModal: true,
                    secretText: data.longTpwd
                })
            },
            fail: function (ex) {
                wx.hideLoading()
                wx.showModal({
                    title: "错误",
                    content: "当前与服务器通信异常，\r\n请检查网络后重试",
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateBack({
                                delta: 1,
                            })
                        }
                    }
                })
            }
        })
    },

    /**
     * 点击遮罩层自动取消对话框
     */
    cancelMask:function(){
        this.setData({
            showModal:false,
            secretText:''
        })
    },
    /**
     * 复制到剪贴板
     */
    okBtn:function(v){
        var self = this;
        wx.setClipboardData({
          data: 'v.currentTarget.dataset.secret',
          complete:function(){
            self.setData({
                  showModal:false,
                  secretText:''
              })
          }
        })
    }

})