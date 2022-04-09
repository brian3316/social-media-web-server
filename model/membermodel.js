import { conn } from '../util/sqlconnection.js';


export async function MySqlPromise(sql) {
    return new Promise((resolve, reject) => {
        conn.query(sql, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}




export async function InsertInDb(query) {
    // console.log(query);

    try {

        const mypromise = await MySqlPromise(query);
        console.log(mypromise);

    } catch (error) {
        console.log("connected fail", error);
    }

};

