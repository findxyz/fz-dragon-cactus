/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://jotddoci.qcloud.la';

var config = {

    service: {
        host,
        loginUrl: `${host}/weapp/login`,
        requestUrl: `${host}/weapp/user`,
        riddleUrl: `${host}/weapp/riddle`,
        questionUrl: `${host}/weapp/question`,
        answerUrl: `${host}/weapp/answer`
    }
};

module.exports = config;