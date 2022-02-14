// pags/search/search.js
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        //显示控制
        hotTagShowView: false,
        historyTagShowView: false,
        //相关词
        historyWord: [],
        hotWord: [],
        searchText: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //获取搜索记录词
        var temp = wx.getStorageSync(app.globalData.save_history_word)
        if (temp != "") {
            this.setData({
                "historyWord": temp,
                "historyTagShowView":true
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
            'hotTagShowView':true
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
        this.data.historyWord.splice(0, 0, this.data.searchText)
        if (this.data.historyWord.length >= 15) {
            this.data.historyWord.pop()
        }
        wx.setStorageSync(app.globalData.save_history_word, this.data.historyWord)
        this.setData({
            "historyWord": this.data.historyWord,
            "historyTagShowView":true
        })


    }



})