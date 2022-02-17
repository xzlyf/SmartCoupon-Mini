// pages/searchTarget/target.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchText:'',
        // 商品实体
        goodsData:{},
        pageNum:0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            searchText:options.keyword
        })
        this.getSearch()
    },

 /**
     * 页面上拉触底事件的处理函数
     * 可以在index.json的window选项中或页面配置中设置触发距离onReachBottomDistance。
     *在触发距离内滑动期间，本事件只会被触发一次。
     */
    onReachBottom: function () {
        this.getSearch()
    },

    /**
     * 通过搜索词搜索
     * @param{String} word 搜索词 
     */
    getSearch: function () {
        var self = this;
        self.data.pageNum++
        wx.showLoading({
            title: '正在搜索...',
        })
        wx.request({
            url: app.globalData.appServerByDataokeRelay,
            method: 'GET',
            data: {
                api: "/api/goods/list-super-goods",
                appKey: app.globalData.appKeyByDataoke,
                version: "v1.3.0",
                type: 0,
                pageId: self.data.pageNum,
                pageSize: 20,
                keyWords: self.data.searchText
            },
            success: function (res) {
                wx.hideLoading()
                if(res.statusCode!=200){
                    wx.showToast({
                      title: 'API异常',
                      duration:2500
                    })
                    self.data.pageNum-- //请求失败，复原页数
                    return
                }
                if(res.data.code!=0){
                    wx.showModal({
                        showCancel:false,
                        title:"异常",
                        content:res.data.msg
                    })
                    self.data.pageNum-- //请求失败，复原页数
                    return
                }
                var data = res.data.data
                // self.setData({
                //     goodsData:data
                // })

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
                wx.hideLoading()
                wx.showModal({
                    showCancel:false,
                    title:"网络错误",
                    content:"当前与服务器网络通信失败\r\n请检查网络后重试"
                })
                self.data.pageNum-- //请求失败，复原页数
                return
            }
        })
    }
})