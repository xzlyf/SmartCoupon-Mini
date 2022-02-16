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

                if(data.specialText.length>0){
                self.data.showGiftView = true
                }
                self.setData({
                    detail: data,
                    pics: picsArry,
                    showGiftView:self.data.showGiftView
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
    }
})