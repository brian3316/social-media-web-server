
import { io } from "../mysqlapp.js";






let roomid = [];

function findRoom(id) {
    // const dbresult = await findDbRoom();
    // console.log("dbresult", typeof dbresult);
    return roomid.find(roomid => roomid === id);
};

export function socketconnect(socket) {
    let levaemsg = {};


    console.log('a user coneected');
    socket.on('user_connected', (data) => {
        console.log("23", data);

        if (!findRoom(data.roomid)) {

            roomid.push(data.roomid);
        };

        console.log("30", roomid);
        const curRoomid = findRoom(data.roomid);
        socket.join(curRoomid);
        console.log(curRoomid);

        io.to(curRoomid).emit('message', data);
    });

    socket.on('user_sendmessage', (data) => {
        console.log("41", data);
        if (!findRoom(data.roomid)) {

            roomid.push(data.roomid);
            socket.join(data.roomid);
        };
        const curRoomid = findRoom(data.roomid);
        console.log('user send message success...');
        io.to(curRoomid).emit('user_receivemessage', data);

    });

    // io.emit('message', { text: 'hello I m Socket.io' });
    socket.on('user_disconnect', (data) => {
        console.log("34", data);
        levaemsg = data;
        console.log('user disconnected');

    });

    socket.on('disconnect', (data) => {
        // console.log(data);
        console.log('user disconnected');

        io.to(levaemsg.roomid).emit('leave_message', { ...levaemsg, text: 'disconnected !!!' });
    });


}
