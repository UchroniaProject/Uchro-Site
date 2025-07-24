const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const { PORT, HOST } = process.env;

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Middleware pour parser les cookies
app.use(cookieParser());

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', authRoutes);

// Route protégée
app.get('/protected', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'protected-page.html'));
});

// Servir le fichier HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = PORT || 3000;
app.listen(port, HOST, () => {
  console.log(`Server is running on http://${HOST}:${port}`);
});
