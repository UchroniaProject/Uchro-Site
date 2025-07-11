const { Sequelize } = require('sequelize');
const sequelize = require('../config/db.js');
const Cell = require('../models/Cell')(sequelize, Sequelize.DataTypes);
const { getIO } = require('../services/realtime');

module.exports = {
  getAllCells: async (req, res) => {
    try {
      const cells = await Cell.findAll({
        attributes: ['id', 'coordinates', 'biome', 'height', 'type', 'neighbors', 'info']
      });
      res.json(cells);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  getCellInfo: async (req, res) => {
    try {
      const cell = await Cell.findByPk(req.params.id, {
        attributes: ['id', 'coordinates', 'biome', 'height', 'type', 'neighbors', 'info']
      });

      if (!cell) {
        return res.status(404).json({ error: 'Cellule non trouvée' });
      }

      res.json({
        ...cell.toJSON()
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  updateCell: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const cell = await Cell.findByPk(id);
      if (!cell) {
        return res.status(404).json({ error: 'Cellule non trouvée' });
      }

      await cell.update(updates);

      // Notifier les clients via WebSocket
      const io = getIO();
      io.emit('cellUpdated', {
        id: cell.id,
        ...updates
      });

      res.json(cell);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};
