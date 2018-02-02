var qcloud = require('../../vendor/wafer2-client-sdk/index');

var config = require('../../config');

var util = require('../../utils/util.js');

var helper = require('../common/common.js');

var postRiddle = function(me) {

    if (!(me.data.question && me.data.answer)) {
        util.showModel('提示', "谜题尚不完全呢");
        return false;
    }
    qcloud.request({
        url: config.service.riddleUrl,
        login: true,
        method: 'POST',
        data: {
            'question': me.data.question,
            'answer': me.data.answer,
            'roomId': me.data.roomId
        },
        success(result) {
            me.setData({
                question: "",
                answer: ""
            });
            util.showSuccess('谜题发布成功');
            wx.setStorageSync('riddleRefresh', true);
            console.log('request success', result);
        },
        fail(error) {
            me.setData({
                show: "show"
            });
            util.showModel('请求失败', error);
            console.log('request fail', error);
        },
        complete() {
            console.log('request complete');
        }
    });
};

Page({
    data: {
        logged: false,
        userInfo: null,
        authShow: "authHidden",
        roomId: "",
        question: "",
        answer: ""
    },

    onShow: function() {
        if (wx.getStorageSync("roomId")) {
            this.setData({
                roomId: wx.getStorageSync("roomId")
            });
        } else {
            this.setData({
                roomId: ""
            });
        }
        this.setData(helper.getLoggedInfo());
    },

    clearRoomId: function() {
        this.setData({
            roomId: ""
        });
        wx.setStorageSync("roomId", "");
        wx.setStorageSync('riddleRefresh', true);
    },

    changeRoomId: function(e) {
        this.setData({
            roomId: e.detail.value
        });
        wx.setStorageSync("roomId", e.detail.value);
        wx.setStorageSync('riddleRefresh', true);
    },

    changeQuestion: function(e) {
        this.setData({
            question: e.detail.value
        });
    },

    changeAnswer: function(e) {
        this.setData({
            answer: e.detail.value
        });
    },

    doPostRiddle() {
        util.showBusy('正在请求');
        helper.helpRequest(this, postRiddle);
    },

    reAuthHandler: function(result) {
        helper.reAuthHandler(this, result);
    }
});