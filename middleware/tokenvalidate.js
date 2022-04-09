import jwt from 'jsonwebtoken';




export async function authenticaTion(req, res, next) {
    let token;
    try {
        // token=req.headers.authorization.split(' ')[1];
        token = req.headers['authorization'].split(' ')[1];
        jwt.verify(token, 'secret', (err, decoded) => {
            if (err) {
                return res.status(403).send({
                    message: '403 Token is not valid'
                });
            }
            // req.user = decoded;
            console.log("JWT 198", decoded);
            next();
        });


    } catch (error) {
        return res.status(401).send({
            message: '401 Your are not anthenticated'
        });
    }



};