// pages/goodsJdDetail/jdDetail.js
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
        //URL解码后进行JSON解析获取传入的详情数据
        var data = JSON.parse(decodeURIComponent(options.bean))
        console.log(data)
    },

    /**
     * 通过传入的数据解析生成展示
     */
    getGoodsDetailByStorage: function (data) {

    },
})