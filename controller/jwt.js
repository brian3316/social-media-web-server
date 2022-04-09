import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors'
import express from 'express'
import { nanoid } from 'nanoid';
import { conn } from '../util/sqlconnection.js';
import { insertMember, selectFromToken, selectUser, updateToken, updateUser } from './sqlquery.js';




let userinfo = [];
let encryptedPassword;
let checkemail = []
export async function userRegister(req, res) {
    try {

        const { firstName, lastName, email, password } = req.body;
        // res.send(userinfo);
        //驗證資料
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).send({
                message: 'Please fill all the fields'
            });
        };
        //檢查email是否重複



        if (await oldUser(email)) {
            return res.status(409).send({
                message: 'Email already exists'
            });
        };


        //加密密碼
        encryptedPassword = await bcrypt.hash(password, 10);
        //1.)將資料存入userinfo
        //2.)寫入資料(與資料庫互動)
        // userinfo.push({
        //     firstName,
        //     lastName,
        //     email: email,
        //     password: encryptedPassword
        // });

        userinfo = [...userinfo, { id: nanoid(), firstName, lastName, email, password: encryptedPassword, friends: JSON.stringify([]) }]

        console.log(userinfo);

        await insertMember(userinfo);
        //查看資料庫最新email狀況
        await oldUser(email);

        //製作TOKEN
        // const token = jwt.sign({ },process.env.TOKEN_KEY, { expiresIn: '1h' });
        // const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
        res.status(201).send({
            message: 'User created',
            // token,
            // userinfo: userinfo.find(user => user.email === email),
            userinfo: userinfo[0],
            checkemail: checkemail

        });

        // console.log(token);


    } catch (error) {
        console.log(error);
    }
};

async function oldUser(email) {
    await new Promise((resolve, reject) => {
        conn.query(`SELECT email FROM member`, (err, result) => {
            if (err) reject(err);
            checkemail = result.map((alluser) => {
                // console.log("this is all email", alluser.email);
                return alluser.email;
            })
            resolve(result);
        });
    });
    // const userEmail = userinfo.some(user => user.email === email);
    const uemailhasExist = checkemail.some(uemail => uemail === email);


    return uemailhasExist;

}

export async function userLogin(req, res) {
    try {

        const { email, password } = req.body;

        // //驗證資料
        if (!email || !password) {
            return res.status(400).send({
                message: 'Please fill all the fields'
            });
        };
        //檢查email是否為資料庫中的email
        // if (!oldUser(email)) {
        //     return res.status(400).send({
        //         message: 'Email does not exist'
        //     });
        // };
        const userinfo = await selectUser(email);
        if (userinfo.length === 0) {
            return res.status(400).send({
                message: 'Account does not exist.'
            });
        }
        //檢查密碼
        // const { password: findPassword } = userinfo.find(user => user.email === email);


        const { password: findPassword } = userinfo[0];

        console.log(userinfo);
        console.log("findPassword", findPassword);
        const checkPassword = await bcrypt.compare(password, findPassword);
        if (!checkPassword) {
            return res.status(400).send({
                message: 'Password is incorrect'
            });
        }
        //製作TOKEN// //製作TOKEN
        // const token = jwt.sign({ },process.env.TOKEN_KEY, { expiresIn: '1h' });
        const accessToken = jwt.sign({ email, password: findPassword }, 'secret', { expiresIn: '6h' });
        const updtoken = await updateToken(email, accessToken);
        if (updtoken.affectedRows < 1) {
            return res.status(400).send({
                message: 'Token update failed'
            });
        }
        const newuserinfo = await selectUser(email)

        res.status(200).send({
            message: 'Login success',
            accessToken,
            userinfo: { ...newuserinfo.find(user => user.email === email), friends: JSON.parse(newuserinfo[0].friends) },
        });



    } catch (error) {
        console.log(error);
    }
};

export async function userLogout(req, res) {
    try {
        const { id } = req.body;
        console.log(id);
        // const userinfo = await updateUser(id);
        // console.log(userinfo);
        // res.send(userinfo)

    } catch (error) {
        console.log(error);
    }
}

// const Test1 = (useremail) => {
//     let testinfo = [];
//     testinfo = [...testinfo, { email: '123@gmail.com', password: '123456' }];
//     testinfo = [...testinfo, { email: "456@gmail.com", password: '2123456' }];
//     const checkUser = testinfo.find(user => user.email === useremail);
//     const { email } = checkUser;
//     console.log(email);
// };
// Test1("123@gmail.com");




export async function validateUser(req, res) {
    let token = req.headers['authorization'].split(' ')[1];
    // console.log("200", token);
    const userinfo = await selectFromToken(token);
    // console.log("userinfo", userinfo[0]);
    res.json({ message: "validate success", userinfo: userinfo[0] });
}