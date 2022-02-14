// index.js
const util = require('../../utils/TimeUtils.js')
const app = getApp();
Page({
    data: {
        //轮播图配置
        autoplay: true,
        interval: 5000,
        duration: 1200,
        //banner数据实体
        bannerData: {},
        //商品数据实体
        goodsData: {},
        pageNum: 0,
    },

    /**
     * 在页面创建时
     */
    onLoad: function (op) {
        this.getBannerData()
        this.getGoods()
    },
    /**
     * 页面上拉触底事件的处理函数
     * 可以在index.json的window选项中或页面配置中设置触发距离onReachBottomDistance。
     *在触发距离内滑动期间，本事件只会被触发一次。
     */
    onReachBottom: function () {
        console.log("出发")
        this.getGoods()
    },

    /**
     * 获取Banner数据
     */
    getBannerData: function () {
        //检查banner缓存情况,两个小时内不重复请求Banner数据
        var self = this
        var bannerUpdate = wx.getStorageSync(app.globalData.save_banner_update)
        var now = Date.parse(new Date())
        if (bannerUpdate != 0 || now - bannerUpdate <= 7200000) {
            // console.log('走缓存')
            this.setData({
                bannerData: wx.getStorageSync(app.globalData.save_banner_data)
            })
            return
        }
        // console.log('走网络')
        wx.request({
            url: app.globalData.appServerByDataokeRelay,
            method: 'GET',
            data: {
                api: '/api/goods/topic/carouse-list',
                appKey: app.globalData.appKeyByDataoke,
                version: 'v2.0.0'
            },
            success: function (res) {
                if (res.statusCode != 200) {
                    wx.showModal({
                        title: '错误',
                        content: 'http code = ' + res.statusCode,
                        showCancel: false
                    })
                    return
                }
                if (res.data.code != 0) {
                    wx.showModal({
                        title: '错误',
                        content: 'OpenApi Code=' + res.data.code + '\r\nMsg=' + res.data.msg,
                        showCancel: false
                    })
                    return
                }
                var data = res.data.data
                self.setData({
                    bannerData: data
                })
                //存储缓存数据
                var now = Date.parse(new Date())
                wx.setStorageSync(app.globalData.save_banner_data, data)
                wx.setStorageSync(app.globalData.save_banner_update, now)

            },
            fail: function (ex) {
                wx.showModal({
                    title: '网络错误',
                    content: "当前与服务器网络通信失败\r\n请检查网络后重试",
                    showCancel: false
                })
            }
        })
    },

    /**
     * 获取推荐商品
     */
    getGoods: function () {
        var self = this
        self.data.pageNum++
        wx.request({
            url: app.globalData.appServerByDataokeRelay,
            method: 'GET',
            data: {
                api: '/api/goods/singlePage/list-height-commission',
                appKey: app.globalData.appKeyByDataoke,
                version: 'v1.0.0',
                pageSize: 20,
                pageId: self.data.pageNum,
            },
            success: function (res) {
                if (res.statusCode != 200) {
                    wx.showToast({
                        title: '获取失败，请稍后重试',
                        icon: 'none',
                        duration: 2500,
                    })
                    self.data.pageNum-- //请求失败，复原页数
                    return
                }
                if (res.data.code != 0) {
                    wx.showModal({
                        title: '错误',
                        content: 'OpenApi Code=' + res.data.code + '\r\nMsg=' + res.data.msg,
                        showCancel: false
                    })
                    return
                }
                var data = res.data.data
                if (self.data.pageNum == 1) {
                    self.setData({
                        goodsData: data,
                    })
                } else {
                    //获取原始列表
                    var old = self.data.goodsData;
                    //获取新列表
                    var arr = data.list;
                    //新列表数据与原列表数据合并
                    var newArr = old.list.concat(arr);
                    old.list = newArr
                    self.setData({
                        goodsData: old,
                    })
                }
            },
            fail: function (ex) {
                wx.showModal({
                    title: '网络错误',
                    content: "当前与服务器网络通信失败\r\n请检查网络后重试",
                    showCancel: false
                })
            }
        })
    },

    /**
     * 跳转页面
     */
    toPage: function (view) {
        var id = view.target.id
        switch (id) {
            case 'searchBarText':
            case 'searchBar':
                wx.navigateTo({
                    url: '../search/search',
                })
                wx.setNavigationBarTitle({
                    title: '搜索',
                })
                break
        }
    },

    /**
     * 跳转商品详情页
     * @param goodsId  淘宝商品Id
     */
    toGoodsDetail:function(goodsId){
        //goodsId.currentTarget.dataset.id
        wx.navigateTo({
          url: '../goodsDetail/goodsDetail?id='+goodsId.currentTarget.dataset.id,
        })
    }

})