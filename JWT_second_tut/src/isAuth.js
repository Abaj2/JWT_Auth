const { verify } = require('jsonwebtoken')

const isAuth = req => {
    const authorization = req.headers['authorizatio'];
    if (!authorization) throw new Error("You need to login");
    const token = authorization.split(' ')[1]
    const { userId } = verify(token, process.env.ACCESS_TOKEN_SECRET);
    return user_id;
}
module.exports = {
    isAuth,
}