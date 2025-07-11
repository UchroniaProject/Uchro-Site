const express = require('express');
const router = express.Router();
const cellsController = require('../controllers/cells.js');

// Routes pour le frontend existant
router.get('api/cells/', cellsController.getAllCells);
router.get('api/cells/:id', cellsController.getCellInfo);
router.put('api/cells/:id', cellsController.updateCell);

module.exports = router;
