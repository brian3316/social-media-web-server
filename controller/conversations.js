import { conn, tableName } from "../util/sqlconnection.js";



let message = {
    members: [],
    _id: "",
    cureatedAt: "",
    updatedAt: "",
    __v: 0
};
const selectChat = async (id) => {

    return new Promise((resolve, reject) => {
        conn.query(`SELECT * FROM chatroom WHERE chatroomid = ?`, [JSON.stringify(id)], (err, result) => {
            if (err) reject(err);

            resolve(result);

        });
    });


};

export async function getChat(req, res) {
    let { _id } = req.body;
    console.log(_id);
    try {

        const result = await selectChat(_id);
        if (result.length > 0) {
            // console.log(b);
            res.send(...result);
        } else {
            const _nid = [_id[1], _id[0]];
            const nresult = await selectChat(_nid);
            res.send(...nresult);
        }

    } catch (error) {
        console.log(error);

    }
    // message = { ...message, members: [...message.members, ..._id] }
    // message={...message,_id,cureatedAt:new Date(),updatedAt:new Date()};
    // res.json(_id);
    // message.members.find({ _id: _id }, (err, result) => {
    //     if (err) throw err;
    //     res.json({ result, message });
    // });
}
