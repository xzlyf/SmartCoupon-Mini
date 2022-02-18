// pags/search/search.js
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        parameter: [{
            id: 1,
            name: '淘宝',
            checked: true
        }, {
            id: 2,
            name: '京东',
            checked: false
        }, {
            id: 3,
            name: '拼多多',
            checked: false
        }],
        typeId: 1, //选中的搜索模式，默认淘宝
        currentId: 1, //当前搜索模式
        //显示控制
        hotTagShowView: false,
        historyTagShowView: false,
        tagShowView: true,
        //相关词
        historyWords: [],
        hotWord: [],
        searchText: '',
        // 商品实体
        goodsTbData: {}, //淘宝、天猫
        goodsJdData: {}, //jd商品
        pageNum: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //获取搜索记录词
        var temp = wx.getStorageSync(app.globalData.save_history_word)
        if (temp != "") {
            this.setData({
                "historyWords": temp,
                "historyTagShowView": true
            })
        }
        //获取热搜词
        this.getHotTag()
    },
    /**
     * input输入框文本
     */
    searchText: function (t) {
        this.setData({
            searchText: t.detail.value
        })
    },
    /**
     * tag点击事件
     */
    historyTag: function (t) {
        this.setData({
            "searchText": t.target.dataset['tag']
        })
    },
    /**
     * 获取热门搜索词
     */
    getHotTag: function () {
        var self = this
        var now = Date.parse(new Date())
        var hotWordUpdate = wx.getStorageSync(app.globalData.save_hot_tag_update)
        if (hotWordUpdate != 0 || now - hotWordUpdate <= 7200000) {
            // console.log('走缓存')
            self.tidyHotTag()
            return
        }
        // console.log('走网络')
        wx.request({
            url: app.globalData.appServerByDataokeRelay,
            method: 'GET',
            data: {
                api: '/api/category/get-top100',
                appKey: app.globalData.appKeyByDataoke,
                version: 'v1.0.0'
            },
            success: function (res) {
                if (res.statusCode != 200) {
                    return
                }
                if (res.data.code != 0) {
                    return
                }
                var hotWords = res.data.data.hotWords
                //存储缓存
                wx.setStorage({
                    key: app.globalData.save_hot_tag_data,
                    data: hotWords,
                    success: function () {
                        self.tidyHotTag()
                    }
                })
                wx.setStorage({
                    key: app.globalData.save_hot_tag_update,
                    data: now,
                })

            },
        })
    },
    /**
     * 从缓存热门词库中随机抽取n个热门词进行显示
     */
    tidyHotTag: function () {
        var hotWord = wx.getStorageSync(app.globalData.save_hot_tag_data)
        var length = hotWord.length
        // Math.floor(Math.random() * (end - start) + start)//获取指定范围随机数
        var temp = []
        for (var i = 0; i < 20; i++) {
            temp.push(hotWord[Math.floor(Math.random() * (length - 0) + 0)])
        }
        this.setData({
            'hotWord': temp,
            'hotTagShowView': true
        })
    },
    /**
     * 搜索函数
     */
    toSearch: function () {
        if (this.data.searchText == '') {
            wx.showToast({
                title: '请先输入要搜索的商品',
                icon: 'none'
            })
            return
        }
        //在数组第一位插入
        this.data.historyWords.splice(0, 0, this.data.searchText)
        if (this.data.historyWords.length >= 15) {
            this.data.historyWords.pop()
        }
        wx.setStorageSync(app.globalData.save_history_word, this.data.historyWords)
        this.setData({
            "historyWords": this.data.historyWords,
            "historyTagShowView": true,
            "tagShowView": false
        })

        //清空展示数据
        wx.showLoading({
            title: '正在搜索...',
        })
        this.setData({
            goodsTbData: {},
            pageNum: 0
        })
        this.getSearch()

    },
    /**
     * 搜索模式切换点击事件
     */
    parameterTap: function (e) {
        var that = this
        var this_checked = e.currentTarget.dataset.id
        var parameterList = this.data.parameter
        for (var i = 0; i < parameterList.length; i++) {
            if (parameterList[i].id == this_checked) {
                parameterList[i].checked = true; //当前点击的位置为true即选中
            } else {
                parameterList[i].checked = false; //其他的位置为false
            }
        }
        that.setData({
            parameter: parameterList,
            typeId: this_checked
        })
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
     * 超级搜索-淘宝天猫
     * @param{String} word 搜索词 
     */
    getSearch: function () {
        var self = this;
        self.data.pageNum++
        wx.showLoading({
            title: '正在搜索...',
        })
        switch (self.data.typeId) {
            case 1:
                console.log("搜淘宝")
                self.data.currentId = 1
                this.searchByTaobao(self)
                break
            case 2:
                console.log("搜京东")
                self.data.currentId = 2
                this.searchByJD(self)
                break
            case 3:
                console.log("搜拼多多")
                self.data.currentId = 3
                break
        }
    },

    /**
     * 淘宝天猫搜索
     */
    searchByTaobao: function (self) {
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
                keyWords: self.data.searchText,
                hasCoupon: 1 //1有券，默认全部
            },
            success: function (res) {
                wx.hideLoading()
                if (res.statusCode != 200) {
                    wx.showToast({
                        title: 'API异常',
                        duration: 2500
                    })
                    self.data.pageNum-- //请求失败，复原页数
                    return
                }
                if (res.data.code != 0) {
                    wx.showModal({
                        showCancel: false,
                        title: "异常",
                        content: res.data.msg
                    })
                    self.data.pageNum-- //请求失败，复原页数
                    return
                }
                var data = res.data.data

                if (self.data.pageNum == 1) {
                    self.setData({
                        goodsTbData: data,
                    })
                } else {
                    //获取原始列表
                    var old = self.data.goodsTbData;
                    //获取新列表
                    var arr = data.list;
                    //新列表数据与原列表数据合并
                    var newArr = old.list.concat(arr);
                    old.list = newArr
                    self.setData({
                        goodsTbData: old,
                    })
                }

            },
            fail: function (ex) {
                wx.hideLoading()
                wx.showModal({
                    showCancel: false,
                    title: "网络错误",
                    content: "当前与服务器网络通信失败\r\n请检查网络后重试"
                })
                self.data.pageNum-- //请求失败，复原页数
                return
            }
        })
    },

    /**
     * 京东联盟搜索
     */
    searchByJD: function (self) {
        wx.request({
            url: app.globalData.appServerByDataokeRelay,
            method: 'GET',
            data: {
                api: "/api/dels/jd/goods/search",
                appKey: app.globalData.appKeyByDataoke,
                version: "v1.0.0",
                pageId: self.data.pageNum,
                pageSize: 20,
                isCoupon: 1, //1有优惠券，默认全部
                keyword: self.data.searchText,
                // owner:"g",//g自营，p代销
            },
            success: function (res) {
                wx.hideLoading()
                if (res.statusCode != 200) {
                    wx.showToast({
                        title: 'API异常',
                        duration: 2500
                    })
                    self.data.pageNum-- //请求失败，复原页数
                    return
                }
                if (res.data.code != 0) {
                    wx.showModal({
                        showCancel: false,
                        title: "异常",
                        content: res.data.msg
                    })
                    self.data.pageNum-- //请求失败，复原页数
                    return
                }
                var data = res.data.data
                //如果没有主图随便拿一张图片顶上


                //分页数据追加数组末尾
                if (self.data.pageNum == 1) {
                    self.setData({
                        goodsJdData: data,
                    })
                } else {
                    //获取原始列表
                    var old = self.data.goodsJdData;
                    //获取新列表
                    var arr = data.list;
                    //新列表数据与原列表数据合并
                    var newArr = old.list.concat(arr);
                    old.list = newArr
                    self.setData({
                        goodsJdData: old,
                    })
                }
            },
            fail: function (ex) {
                wx.hideLoading()
            }
        })
    },


    /**
     * 跳转商品详情页
     * @param goodsId  淘宝商品Id
     */
    toGoodsDetail: function (v) {
        //商品单品详情数据，详情页不再新请求详情数据
        // this.data.goodsTbData.list[v.currentTarget.dataset.index]
        //序列化数据进行传输给详情页，先json编码然后url在此编码传输

        switch (this.data.currentId) {
            case 1:
                var bean = encodeURIComponent(JSON.stringify(this.data.goodsTbData.list[v.currentTarget.dataset.index]))
                wx.navigateTo({
                    url: '../goodsDetail/goodsDetail?bean=' + bean,
                })
                break
            case 2:
                var bean = encodeURIComponent(JSON.stringify(this.data.goodsJdData.list[v.currentTarget.dataset.index]))
                wx.navigateTo({
                    url:"../goodsJdDetail/jdDetail?bean="+bean
                })
                break
            case 3:
                break
        }


    },
})