import { conn, tableName } from "./sqlconnection.js";


export async function getDbChat(chatobj) {
    const promisedata = new Promise((resolve, reject) => {
        conn.query(`SELECT * FROM chatroom WHERE chatroomid=?`, [chatobj.roomid], (err, result) => {
            if (err) reject(err);
            resolve(result);
        })

    });
    const result = await promisedata;
    return result;
}

export async function updateMessagetoDb(nchatobj) {
    console.log("17", nchatobj);
    const promisedata = new Promise((resolve, reject) => {
        conn.query(`UPDATE chatroom SET messages=? WHERE chatroomid=?`, [nchatobj.messages, nchatobj.roomid], (err, result) => {
            if (err) reject(err);
            resolve(result);
        })

    });
    const result = await promisedata;
    return result;
    // console.log("26",result);
};

