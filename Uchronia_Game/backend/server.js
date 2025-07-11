require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');
const cellsRouter = require('./routes/cells');
const sequelize = require('./config/db');
const realtimeService = require('./services/realtime');

const app = express();
const server = require('http').createServer(app);

// Middleware pour générer un nonce unique pour chaque requête
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Middleware pour configurer les en-têtes CSP
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'none'; script-src 'self' 'nonce-${res.locals.nonce}' 'sha256-oDmnVUP3DbNto23mI6lYub+LlgE0u43/X1XvesJv9p0=' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' http://localhost:5000 https://cdn.jsdelivr.net; img-src 'self' data:; font-src 'self' https://cdn.jsdelivr.net`
  );
  next();
});

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, process.env.FRONTEND_PATH)));

// Middleware pour configurer CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  methods: process.env.CORS_METHODS.split(','),
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS.split(','),
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));

// Routes API
app.use('/api/cells', cellsRouter);

// Initialisation de Socket.IO avec configuration CORS
const io = realtimeService.init(server, {
  cors: {
    origin: process.env.CORS_ORIGIN.split(','),
    methods: process.env.CORS_METHODS.split(',')
  }
});
app.set('io', io);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Initialisation de la base de données et démarrage du serveur
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
      console.log(`Frontend accessible à http://localhost:${PORT}`);
      console.log(`API disponible à http://localhost:${PORT}/api/cells`);
    });

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// Démarrage
initializeDatabase();

