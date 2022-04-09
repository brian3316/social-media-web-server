
import { InsertInDb, MySqlPromise } from "../model/membermodel.js";
import { conn, tableName } from "../util/sqlconnection.js";
import { getDbChat, updateMessagetoDb } from "../util/sqlutil.js";



export function insertInto(req, res) {

    let { taskName, email, deadline } = req.body;

    console.log({ taskName, email, deadline });


    conn.query(`INSERT INTO ${tableName} (taskName, email,deadline) VALUES (?,?,?)`, [taskName, email, deadline], (err, result) => {
        if (err) throw err;

        res.send(result);

    });
    // conn.query('SELECT * FROM member', (err, result) => {
    //     if (err) throw err;
    //     res.send(result);


    // });

};

export async function insertMember(userinfo) {
    const { id, firstName, lastName, email, password, friends } = userinfo[0];

    const username = `${firstName} ${lastName}`;

    const query = `INSERT INTO member (id,email,password,name,friends) VALUES(${id},${email},${password},${username},${friends})`;
    try {
        await InsertInDb(query);
        res.send({ message: "success..." });

    } catch (error) {
        console.log(error);
    }
};
//
let msg = {

    createdAt: new Date(),
    senderid: '',
    receiverid: '',
    text: '',
    type: ''

};

//點擊之後獲取先前對話，並連接新的對話
let Messages = [];
export async function insertMessages(req, res) {
    // let { chatroomId } = req.body;
    // console.log(chatroomId);
    const chatroomid = ["13", "14", "15"];
    msg = { ...msg, senderid: chatroomid[0], receiverid: chatroomid[1], text: "Hello,World", type: "text" };
    Messages.push(msg);
    const myresult = await selectchatroom(JSON.stringify(chatroomid));
    if (myresult.length > 0) {
        res.send(myresult);
    } else {
        try {
            let data = [];
            await new Promise((resolve, reject) => {
                conn.query(`INSERT INTO chatroom VALUES(?,?)`, [JSON.stringify(chatroomid), JSON.stringify(Messages)], (err, result) => {
                    if (err) reject(err);
                    // console.log(...result);
                    // res.send(result);

                    resolve(result);
                });
            }).then((result) => {
                data = result;
                res.status(200).send({ data, message: "success..." });
            }).catch((err) => res.send({ err, message: 'error...' }));

            return data;
        } catch (error) {
            console.log(error);
        }
    };



};

export async function selectchatroom(chatroomid) {
    let data = [];
    await new Promise((resolve, reject) => {
        conn.query(`SELECT * FROM chatroom WHERE chatroomid = ?`, [chatroomid], (err, result) => {
            if (err) reject(err);
            // console.log(...result);
            // res.send(result);

            resolve(result);
        });
    }).then((result) => {
        data = result;
        // res.status(200).send({ data, message: "success..." });
    }).catch((err) => res.send({ err, message: 'error...' }));

    return data;
};



export async function selectUser(email) {

    try {
        const query = `SELECT * FROM member WHERE email = '${email}'`;

        const myresult = await MySqlPromise(query);

        return myresult;
    } catch (error) {
        console.log(error);
    }
};

export async function searchUser(req, res) {
    const searchvalue = req.query.searchvalue;
    if (searchvalue) {
        try {
            const querysyntax = `SELECT * FROM member WHERE name LIKE ?`;
            const result = await selectFromQuery(querysyntax, searchvalue);
            console.log(result);
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(400).send({ message: "error..." });

        }

    } else {
        res.status(400).send({ message: "error..." });
    }
};
export async function selectFromQuery(querysyntax, searchvalue) {
    try {
        const myPromise = new Promise((resolve, reject) => {
            conn.query(querysyntax, [`%${searchvalue}%`], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
        return myPromise;
    } catch (error) {
        console.log(error);
    }
}


export async function selectFromToken(token) {
    try {
        const myPromise = new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM member WHERE token = ?`, [token], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
        return myPromise;
    } catch (error) {
        console.log(error);
    }
}

export async function updateToken(email, accessToken) {
    // console.log(email, accessToken);
    try {
        const myPromies = new Promise((resolve, reject) => {
            conn.query(`UPDATE member SET token= ? ,isloggin = ? WHERE email= ?`, [accessToken, 1, email], (err, result) => {
                if (err) reject(false);
                // console.log(result);
                resolve(result);
            });
        });


        return myPromies;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function updateFriend(req, res) {
    let senderFriends = [];
    let receiverFriends = [];
    const { senderId, receiverId } = req.body;
    console.log(senderId, receiverId);

    if (senderId.trim() && receiverId.trim()) {
        await new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM member WHERE id =? OR id=? `, [senderId, receiverId], (err, result) => {
                if (err) reject(false);
                // console.log(result);

                // resolve(result);

                resolve([{
                    sender: {
                        id: result[0].id,
                        friends: JSON.parse(result[0].friends)
                    }
                }, {
                    receiver: {
                        id: result[1].id,
                        friends: JSON.parse(result[1].friends)
                    }
                }]);
            });
        }).then((result) => {
            // console.log(result[0].sender.friends);
            senderFriends = [...result[0].sender.friends, receiverId];
            receiverFriends = [...result[1].receiver.friends, senderId];
        }).catch((err) => console.log(err));
        console.log("senderF", senderFriends);
        console.log("receiverF", receiverFriends);
        //
        await new Promise((resolve, reject) => {
            conn.query(`UPDATE member SET friends = ? WHERE id=? `, [JSON.stringify(senderFriends), senderId], (err, result) => {
                if (err) reject(err);
                // console.log(result);

                resolve(result);
            });
        }).then(async (result) => {
            let data = [];
            await new Promise((resolve, reject) => {
                conn.query(`INSERT INTO chatroom VALUES(?,?)`, [JSON.stringify([senderId, receiverId]), JSON.stringify([])], (err, result) => {
                    if (err) reject(err);
                    // console.log(...result);
                    // res.send(result);

                    resolve(result);
                });
            }).then((result) => {
                data = result;
                res.status(200).send({ data, message: "success..." });
            }).catch((err) => res.send({ err, message: 'error...' }));
        });
        await new Promise((resolve, reject) => {
            conn.query(`UPDATE member SET friends = ? WHERE id=? `, [JSON.stringify(receiverFriends), receiverId], (err, result) => {
                if (err) reject(err);
                // console.log(result);

                resolve(result);
            });
        }).then((result) => res.status(200).send({ message: 'add friend success' })).catch((err) => console.log(err));

        // const sqlquery = "UPDATE member SET friends = CASE id WHEN ? THEN '?' WHEN ? THEN '?' END";



    } else {
        res.status(401).send({ message: 'senderId or receiverId is missing' });
    }

};

export async function updateMessages(req, res) {
    const reqobj = req.body;
    try {
        // const reqobj = {
        //     roomid: '["13","14"]',
        //     senderId: '13',
        //     senderName: 'brian lu',
        //     text: '測試訊息2',
        //     type: 'message',
        //     createAt: new Date()
        // };
        const dbchatmsg = await getDbChat(reqobj);
        const objdbmsg = dbchatmsg.find((item) => item.chatroomid === reqobj.roomid);
        const newMessages = [...JSON.parse(objdbmsg.messages), reqobj];
        await updateMessagetoDb({ roomid: reqobj.roomid, messages: JSON.stringify(newMessages) });
        // console.log("243", newMessages);
        res.send({ message: "success" });
    } catch (error) {
        console.log(error);
        res.status(401).send({ message: 'error' });
    }
};
//
export async function updateUser(id) {
    try {
        await new Promise((resolve, reject) => {
            conn.query(`UPDATE member SET isloggin = ? WHERE id= ?`, [0, id], (err, result) => {
                if (err) reject(err);
                // console.log(result);
                resolve(result);
            });
        });
        const userinfo = await new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM member WHERE id = ?`, [id], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        return userinfo;

    } catch (error) {
        console.log(error);
        // return false;
    }
}


export function deleteData(req, res) {
    let { id } = req.body;


    conn.query(`DELETE FROM ${tableName} WHERE id = ?`, [id], (err, result) => {
        if (err) throw err;

        res.send(result);

    });

};

export function selectAll(req, res) {



    conn.query(`SELECT * FROM ${tableName}`, (err, result) => {
        if (err) throw err;
        res.send(result);
        // console.log(result);
        //判斷id是否要重新排序
        if (result.length === 0) {
            conn.query(`ALTER TABLE ${tableName} AUTO_INCREMENT =1`, (err, result) => {
                if (err) throw err;
                console.log(`${tableName} id auto increment reset`);
            });

        }
    });
};

export async function selectAllUser(req, res) {
    const { name } = req.query;
    console.log(name);
    if (name && name.trim().length > 0) {
        try {
            await new Promise((resolve, reject) => {
                conn.query(`SELECT * FROM member WHERE name= ?`, [name], (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            })
                .then((result) => {
                    return res.send(result);
                });

        } catch (error) {
            console.log(error);
        }
    } else {
        try {
            await new Promise((resolve, reject) => {
                conn.query(`SELECT * FROM member`, (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            })
                .then((result) => {
                    return res.send(result);
                });
        } catch (error) {
            console.log(error);
        }
    }


};


