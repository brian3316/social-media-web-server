import express from 'express';
import { deleteData, insertInto, insertMessages, searchUser, selectAll, selectAllUser, updateFriend, updateMessages } from './controller/sqlquery.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { userLogin, userLogout, userRegister, validateUser } from './controller/jwt.js';
import { getChat } from './controller/conversations.js';
import { Server } from 'socket.io';
import { socketconnect } from './socket/socket.js';
import { authenticaTion } from './middleware/tokenvalidate.js';

dotenv.config();



const app = express();
const port = 3300;
const server = app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

export const io = new Server(server, {
    cors: {
        origin: '*',
    }
})


app.use(bodyParser.json());
app.use(express.json());
app.use(cors());


app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to my api'
    })
});





app.get('/test1', selectAll);



app.post('/api/test1/register', userRegister);

app.post('/api/test1/login', userLogin);

app.post('/api/test1/logout', userLogout);

app.post('/api/test1/addfriend', updateFriend);

app.post('/api/test1insert', authenticaTion, insertInto);

app.delete('/api/test1delete', deleteData);

app.get('/api/test2', authenticaTion, selectAll);

app.get('/api/test1/validate', authenticaTion, validateUser);


app.post('/api/test2/getchat', getChat);


app.get('/api/test1/alluser', selectAllUser);


app.post('/api/test2/insertmessages', insertMessages);

app.post('/api/test2/updatemessages', updateMessages);

app.get('/api/test2/usersearch', searchUser);





io.on('connection', socketconnect);


