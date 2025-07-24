const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { SECRET_KEY } = require('../config/auth');

const signup = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) {
        return res.status(400).send('Username already exists');
      }

      const token = jwt.sign({ userId: this.lastID, username: username }, SECRET_KEY, { expiresIn: '1h' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 3600000 // 1 heure
      });

      res.send('Signup successful');
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err || !user) {
        return res.status(401).send('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).send('Invalid credentials');
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 3600000 // 1 heure
      });

      res.send('Login successful');
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/index.html');
};

const getUserInfo = (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, SECRET_KEY);
  res.json({ username: decoded.username });
};

module.exports = {
  signup,
  login,
  logout,
  getUserInfo
};
