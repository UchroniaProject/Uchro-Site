const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/auth');

const checkAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Not authenticated');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Error:', error);
    res.status(401).send('Not authenticated');
  }
};

module.exports = {
  checkAuth
};
