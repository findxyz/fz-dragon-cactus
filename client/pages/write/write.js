var qcloud = require('../../vendor/wafer2-client-sdk/index');

var config = require('../../config');

var util = require('../../utils/util.js');

var helper = require('../common/common.js');

var postRiddle = function(me) {
    util.showBusy('正在请求');
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
            util.showSuccess('谜题发布成功');
            me.setData({
                question: "",
                answer: ""
            });
            console.log('request success', result);
        },
        fail(error) {
            util.showModel('请求失败', error);
            me.setData({
                show: "show"
            });
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
        this.setData(helper.getLoggedInfo());
    },

    changeRoomId: function(e) {
        this.setData({
            roomId: e.detail.value
        });
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
        helper.helpRequest(this, postRiddle);
    },

    reAuthHandler: function(result) {
        helper.reAuthHandler(this, result);
    }
});