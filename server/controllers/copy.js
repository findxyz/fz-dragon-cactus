const {
    mysql
} = require('../qcloud');
const md5 = require('md5');

var mysqlTool = require('mysql');

async function get(ctx) {

    let roomNo = "";
    let userInfo = ctx.state.$wxInfo.userinfo;
    if (userInfo) {
        let rows = [];
        let roomSql = "SELECT rr.id FROM t_riddle_room rr WHERE 1=1 ";
        roomSql += "AND rr.owner_open_id = " + mysqlTool.escape(userInfo.openId);

        let roomData = await mysql.raw(roomSql);
        if (roomData[0].length > 0) {
            rows = roomData[0];
            roomNo = rows[0].id;
        } else {
            let roomId = md5(userInfo.openId);
            let roomInSql = "INSERT INTO t_riddle_room(id, owner_open_id) VALUES(" + mysqlTool.escape(roomId) + ", " + mysqlTool.escape(userInfo.openId) + ") ";
            let inRes = await mysql.raw(roomInSql);
            roomNo = roomId;
        }
        ctx.state.data = roomNo;
    } else {
        ctx.state.code = -1;
    }

}

module.exports = {
    get
}