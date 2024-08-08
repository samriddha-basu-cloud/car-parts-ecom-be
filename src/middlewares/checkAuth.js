
const jwt = require('jsonwebtoken');


const checkAuth = (req, res, next) => {

    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
}

module.exports = checkAuth;