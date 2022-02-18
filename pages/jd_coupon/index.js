// pages/testpage/test.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        couponLink: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //调用方法 
        // var url = encodeURIComponent("https://coupon.m.jd.com/coupons/show.action?linkKey=AAROH_xIpeffAs_-naABEFoefPZKeMeEf8dS7-zHsQIYRH3tELbGqHBdCiSCp_CAO9tdP1H-j4llZ0-tpaS0tqJsjC3SiQ")
        // wx.navigateTo({
        //   url: '../jd_coupon/index?couponLink='+url,
        // })



        var link = decodeURIComponent(options.couponLink)
        this.setData({
            couponLink:link
        })
    },

})