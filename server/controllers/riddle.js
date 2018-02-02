const {
    mysql
} = require('../qcloud');
const md5 = require('md5');

var mysqlTool = require('mysql');

async function post(ctx) {
    let riddle = ctx.request.body;
    let userInfo = ctx.state.$wxInfo.userinfo;
    if (userInfo) {
        if (riddle.question && riddle.answer) {
            let savedRoomId = null;
            if (riddle.roomId) {
                let roomSql = "SELECT id FROM t_riddle_room WHERE id = " + mysqlTool.escape(riddle.roomId);
                let roomData = await mysql.raw(roomSql);
                if (roomData[0].length > 0) {
                    savedRoomId = riddle.roomId;
                }
            }
            let savedRiddle = {
                question: riddle.question,
                answer: riddle.answer,
                question_man_open_id: userInfo.openId,
                room_id: savedRoomId
            };
            ctx.state.data = await mysql('t_riddle').insert(savedRiddle);
        } else {
            ctx.state.code = -1;
        }
    } else {
        ctx.state.code = -1;
    }
}

async function get(ctx) {
    var pageSize = ctx.query.pageSize;
    var pageNo = ctx.query.pageNo;
    var roomId = ctx.query.roomId;
    var userOpenId = ctx.query.userOpenId;
    let rows = [];
    let riddleSql = `
        SELECT
        r.id,
        r.question,
        r.answer,
        r.room_id AS roomId,
        r.question_man_open_id AS questionManOpenId,
        r.answer_man_open_id AS answerManOpenId,
        s.user_info AS userInfo,
        sa.user_info AS answerUserInfo,
        sr.user_info AS roomUserInfo
        FROM t_riddle r
        INNER JOIN cSessionInfo s ON r.question_man_open_id = s.open_id
        LEFT JOIN cSessionInfo sa ON r.answer_man_open_id = sa.open_id 
        LEFT JOIN t_riddle_room rr ON r.room_id = rr.id
        LEFT JOIN cSessionInfo sr ON rr.owner_open_id = sr.open_id
        `;
    riddleSql += "WHERE 1=1 ";
    if (userOpenId) {
        riddleSql += "AND (r.question_man_open_id = " + mysqlTool.escape(userOpenId) + " OR r.answer_man_open_id = " + mysqlTool.escape(userOpenId) + ") ";
    } else {
        if (roomId) {
            riddleSql += "AND r.room_id = " + mysqlTool.escape(roomId) + " ";
        } else {
            riddleSql += "AND (r.room_id IS NULL OR r.room_id = '') ";
        }
    }
    riddleSql += "ORDER BY id DESC LIMIT " + mysqlTool.escape(((pageNo - 1) * pageSize)) + ", " + mysqlTool.escape(pageSize * 1);

    let riddleData = await mysql.raw(riddleSql);
    if (riddleData[0].length > 0) {
        rows = riddleData[0];
        for (let i = 0; i < rows.length; i++) {
            let userInfo = JSON.parse(rows[i].userInfo);
            rows[i].nickName = userInfo.nickName;
            rows[i].headImg = userInfo.avatarUrl;
            if (rows[i].answerUserInfo) {
                let answerUserInfo = JSON.parse(rows[i].answerUserInfo);
                rows[i].answerNickName = answerUserInfo.nickName;
                rows[i].answerHeadImg = answerUserInfo.avatarUrl;
            }
            if (rows[i].roomUserInfo) {
                let roomUserInfo = JSON.parse(rows[i].roomUserInfo);
                rows[i].roomNickName = roomUserInfo.nickName;
            }
        }
    }
    ctx.state.data = rows
}

module.exports = {
    post,
    get
}