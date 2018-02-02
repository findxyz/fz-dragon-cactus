// pages/answer/answer.js
var qcloud = require('../../vendor/wafer2-client-sdk/index');

var config = require('../../config');

var util = require('../../utils/util.js');

var helper = require('../common/common.js');

var getQuestion = function(that) {

  qcloud.request({
    url: config.service.questionUrl,
    login: true,
    data: {
      riddleId: that.data.riddleId
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

      wx.hideToast();
    },
    fail: function(error) {
      wx.hideToast();
      console.log(error);
    }
  });
}

var answerRiddle = function(that) {

  if (!that.data.answer) {
    util.showModel('提示', "您还没有填写答案");
    return false;
  }

  qcloud.request({
    url: config.service.answerUrl,
    method: "POST",
    login: true,
    data: {
      id: that.data.riddleId,
      answer: that.data.answer
    },
    success: function(res) {
      var result = res.data.data;
      if (result.success) {
        wx.showModal({
          title: '恭喜',
          content: '您是该谜题的首位猜中者',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              wx.navigateBack();
            }
          }
        });
      } else {
        util.showModel('提示', result.message);
      }
      if (result.refresh) {
        wx.setStorageSync('riddleRefresh', true);
      }
      wx.hideToast();
    },
    fail: function(error) {
      wx.hideToast();
      console.log(error);
    }
  });
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logged: false,
    userInfo: null,
    authShow: 'authHidden',
    riddleId: null,
    rows: [],
    answer: ""
  },

  reAuthHandler: function(result) {
    helper.reAuthHandler(this, result, getQuestion);
  },

  doAnswerRiddle: function() {
    util.showBusy('正在加载');
    helper.helpRequest(this, answerRiddle);
  },

  changeAnswer: function(e) {
    this.setData({
      answer: e.detail.value
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      riddleId: options.riddleId
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    util.showBusy('正在加载');
    helper.helpRequest(this, getQuestion);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData(helper.getLoggedInfo());
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})