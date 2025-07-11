// db.js
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/map.db'), // Chemin absolu
  logging: false // Désactive les logs SQL (optionnel)
});

module.exports = sequelize; // Export de l'instance Sequelize
