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
      userOpenId: that.data.userInfo ? that.data.userInfo.openId : '0'
    },
    success: function(res) {

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

      wx.stopPullDownRefresh();
    },
    fail: function(error) {
      wx.stopPullDownRefresh();

      console.log(error);
    }
  });
};

var copyRoomNo = function(that) {
  qcloud.request({
    url: config.service.copyUrl,
    login: true,
    success: function(res) {
      var roomNo = res.data.data;
      wx.setClipboardData({
        data: roomNo,
        success: function() {
          util.showSuccess('复制成功');
        }
      });
    },
    fail: function(error) {
      util.showModel('提示', error);
      console.log(error);
    }
  });
}

// pages/mine/mine.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logged: false,
    userInfo: null,
    authShow: 'authHidden',
    loadStatus: "none",
    rows: [],
    canIUseClipboard: wx.canIUse('setClipboardData')
  },

  delRiddle: function(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    util.showBusy('正在请求');
    helper.helpRequest(this, function(that) {
      qcloud.request({
        url: config.service.questionUrl,
        method: "POST",
        login: true,
        data: {
          id: id
        },
        success: function(res) {
          if (res.data.data) {
            util.showSuccess('删除成功');
            that.onShow();
          }
        },
        fail: function(error) {
          util.showModel('提示', error);
          console.log(error);
        }
      });
    });
  },

  getUserInfo: function() {
    helper.helpRequest(this, helper.helpGetUserInfo);
  },

  copyNo: function(e) {
    util.showBusy('正在请求');
    helper.helpRequest(this, copyRoomNo);
  },

  gotoRoom: function(e) {
    wx.setStorageSync('riddleRefresh', true);
    wx.setStorageSync('roomId', e.currentTarget.dataset.roomId);
    console.log("gotoRoom: " + e.currentTarget.dataset.roomId);
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData(helper.getLoggedInfo());
    page = 1;
    over = false;
    this.setData({
      rows: []
    });
    helper.helpRequest(this, riddleLoad, true);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  reAuthHandler: function(result) {
    helper.reAuthHandler(this, result, this.getUserInfo);
  }
})