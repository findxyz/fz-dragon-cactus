const {
    mysql
} = require('../qcloud');
const md5 = require('md5');

var mysqlTool = require('mysql');

async function post(ctx) {
    let riddle = ctx.request.body;
    let userInfo = ctx.state.$wxInfo.userinfo;
    let result = {};
    let resOk = false;
    if (userInfo) {
        if (riddle.id && riddle.answer) {
            // todo 校验通过后更新谜题答案
            let riddleSql = `
                SELECT
                r.answer,
                r.question_man_open_id AS questionManOpenId,
                r.answer_man_open_id AS answerManOpenId
                FROM t_riddle r
            `;
            riddleSql += "WHERE 1=1 AND r.id = " + mysqlTool.escape(riddle.id) + " ";

            let riddleData = await mysql.raw(riddleSql);
            if (riddleData[0].length > 0) {
                rows = riddleData[0];
                if (rows.length > 0) {
                    let r = rows[0];
                    if (r.questionManOpenId === userInfo.openId) {
                        result.success = false;
                        result.message = "禁止裁判员答题";
                    } else if (r.answerManOpenId) {
                        result.success = false;
                        result.refresh = true;
                        result.message = "抱歉，该谜题已被破解...";
                    } else if (r.answer !== riddle.answer) {
                        result.success = false;
                        result.message = "不是这个答案，再想想...";
                    } else {
                        // todo 更新谜题答题者
                        let riddleUpSql = "UPDATE t_riddle SET answer_man_open_id = " + mysqlTool.escape(userInfo.openId) + " ";
                        riddleUpSql += "WHERE 1=1 AND id = " + mysqlTool.escape(riddle.id);
                        let upRes = await mysql.raw(riddleUpSql);
                        result.success = true;
                        result.refresh = true;
                    }
                    resOk = true;
                    ctx.state.data = result;
                }
            }
        }
    }
    if (!resOk) {
        ctx.state.code = -1;
    }
}

module.exports = {
    post
}