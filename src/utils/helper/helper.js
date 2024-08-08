const jwt = require('jsonwebtoken');

 const generateAccessToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, { expiresIn: '1y' });
        return token;
    } catch (e) {
        console.log(e);
    }
}

module.exports = { generateAccessToken };