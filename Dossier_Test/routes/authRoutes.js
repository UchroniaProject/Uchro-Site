const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/authMiddleware');
const { signup, login, logout, getUserInfo } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/user-info', checkAuth, getUserInfo);

module.exports = router;
