// app.js

App({
    globalData: {
        appServerByDataoke: 'http://192.168.0.166:8080/dataoke',
        //大淘客api中转服务
        appServerByDataokeRelay: 'http://192.168.0.166:8080/dataoke/get',
        //大淘客appid
        appKeyByDataoke: '62071c6a93a33',


        //本地存储键值
        save_banner_update: 'banner-update',
        save_banner_data: 'banner-data',
        save_history_word: 'history-word',
        save_hot_tag_update: 'hot-tag-update',
        save_hot_tag_data: 'hot-tag-data',

        //nav导航栏位置信息
        navHeight: 0,
        navTop: 0,
        windowHeight: 0,
    },
    onLaunch: function (o) {
        var menuButtonObject = wx.getMenuButtonBoundingClientRect();
        wx.getSystemInfo({
            success: res => {
                var statusBarHeight = res.statusBarHeight,
                    navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
                    navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2 //导航高度
                this.globalData.navHeight = navHeight
                this.globalData.navTop = navTop
                this.globalData.windowHeight = res.windowHeight
            },
            fail(err) {
                console.log(err);
            }
        })
    }
})