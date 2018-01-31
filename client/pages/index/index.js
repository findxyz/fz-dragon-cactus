var qcloud = require('../../vendor/wafer2-client-sdk/index');

var config = require('../../config');

var util = require('../../utils/util.js');

var helper = require('../common/common.js');

var page = 1;

var over = false;

var riddleLoad = function(that) {

    if (over) {
        return false;
    }

    that.setData({
        loadStatus: "loading"
    });

    qcloud.request({
        url: config.service.riddleUrl,
        login: false,
        data: {
            pageSize: 10,
            pageNo: page,
            roomId: that.data.roomId
        },
        success: function(res) {

            wx.stopPullDownRefresh();

            var riddleRows = res.data.data;
            var rows = that.data.rows;

            for (let i = 0; i < riddleRows.length; i++) {
                rows.push(riddleRows[i]);
            }

            that.setData({
                rows: rows
            });

            page++;

            if (riddleRows.length === 0) {
                over = true;
                that.setData({
                    loadStatus: "done"
                });
            } else {
                that.setData({
                    loadStatus: "hidden"
                });
            }
        },
        fail: function(error) {
            wx.stopPullDownRefresh();

            console.log(error);
        }
    });
};

Page({
    data: {
        logged: false,
        userInfo: null,
        authShow: 'authHidden',
        roomId: "",
        loadStatus: "none",
        rows: []
    },

    changeRoomId: function(e) {
        this.setData({
            roomId: e.detail.value
        });
    },

    onShow: function() {
        page = 1;
        over = false;
        this.setData({
            rows: []
        });
        this.setData(helper.getLoggedInfo());
        helper.helpRequest(this, riddleLoad, true);
    },

    onPullDownRefresh: function() {
        page = 1;
        over = false;
        this.setData({
            rows: []
        });
        helper.helpRequest(this, riddleLoad, true);
    },

    onReachBottom: function() {
        helper.helpRequest(this, riddleLoad, true);
    },

    reAuthHandler: function(result) {
        helper.reAuthHandler(this, result);
    }
});