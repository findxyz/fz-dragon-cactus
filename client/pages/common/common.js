var qcloud = require('../../vendor/wafer2-client-sdk/index');

var config = require('../../config');

var util = require('../../utils/util.js');

/*
wxml 需要增加重新授权的 html 片段
     <view class="weui-btn-area">
        <button class="weui-btn" type="primary" open-type="getUserInfo" bindgetuserinfo="reAuthHandler" class="{{authShow}}">重新授权</button>
     </view>
js   需要增加 logged userInfo authShow 属性
     并增加一个 userInfoHandler 方法处理授权后的登录
css  需要增加 authShow authHidden 样式
*/
var helpLogin = function(pager, realRequest) {
    qcloud.login({
        success(result) {
            if (result) {
                util.showSuccess('登录成功');
                setLoggedInfo(pager, true, result, "authHidden");
                realRequest(pager);
            } else {
                helpGetUserInfo(pager, realRequest);
            }
        },
        fail(error) {
            util.showModel('登录失败', error);
            setLoggedInfo(pager, false, null, "authShow");
            console.log('登录失败', error);
        }
    });
};

var helpGetUserInfo = function(pager, request) {
    qcloud.request({
        url: config.service.requestUrl,
        login: true,
        success(result) {
            wx.hideToast();
            setLoggedInfo(pager, true, result.data.data, "authHidden");
            if (request) {
                request(pager);
            }
        },
        fail(error) {
            wx.hideToast();
            setLoggedInfo(pager, false, null, "authShow");
            console.log('request fail', error);
        }
    });
}

var helpRequest = function(pager, realRequest, noLogin) {
    if (!noLogin) {
        if (!getLoggedInfo().logged) {
            helpLogin(pager, realRequest);
            return;
        }
    }
    realRequest(pager);
};

var reAuthHandler = function(pager, result, request) {
    if (result.detail.rawData) {
        util.showBusy("正在登录");
        if (request) {
            helpLogin(pager, request);
        } else {
            helpLogin(pager, function() {});
        }
    }
}

var getLoggedInfo = function() {
    var loggedInfo = {
        logged: false,
        authShow: "authHidden",
        userInfo: null
    };

    try {
        if (wx.getStorageSync('logged')) {
            loggedInfo.logged = wx.getStorageSync('logged');
        }
        if (wx.getStorageSync('authShow')) {
            loggedInfo.authShow = wx.getStorageSync('authShow');
        }
        if (wx.getStorageSync('userInfo')) {
            loggedInfo.userInfo = wx.getStorageSync('userInfo');
        }
    } catch (e) {
        console.log(e);
    }
    return loggedInfo;
}

var setLoggedInfo = function(pager, isLogin, userInfo, authShow) {
    console.log("setLoggedInfo: ", isLogin, userInfo, authShow);
    pager.setData({
        authShow: authShow,
        logged: isLogin,
        userInfo: userInfo
    });
    try {
        wx.setStorageSync('logged', isLogin);
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('authShow', authShow);
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    helpRequest: helpRequest,
    reAuthHandler: reAuthHandler,
    getLoggedInfo: getLoggedInfo,
    helpGetUserInfo: helpGetUserInfo
};