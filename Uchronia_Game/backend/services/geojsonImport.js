const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db.js');
const Cell = require('../models/Cell')(sequelize, Sequelize.DataTypes);

const importGeoJSON = async (filePath) => {
  try {
    // Lire le fichier GeoJSON
    const geoData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Vérifier et importer les features
    if (geoData.type === 'FeatureCollection') {
      const cells = geoData.features.map(feature => {
        // Extraire les coordonnées du centroid
        const centroid = calculateCentroid(feature.geometry);
        const [x, y] = centroid.coordinates;

        return {
          coordinates: `${x},${y}`,
          biome: feature.properties.biome || 0,
          type: feature.properties.type || 'island',
          height: feature.properties.height || 0,
          neighbors: feature.properties.neighbors || []
        };
      });

      // Importer en base de données
      await Cell.bulkCreate(cells);
      console.log(`Importé ${cells.length} cellules depuis le GeoJSON`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'import GeoJSON:', error);
    throw error;
  }
};

// Fonction utilitaire pour calculer le centroid
const calculateCentroid = (geometry) => {
  if (geometry.type === 'Polygon') {
    // Calcul simplifié du centroid
    const coords = geometry.coordinates[0];
    const x = coords.reduce((sum, [x]) => sum + x, 0) / coords.length;
    const y = coords.reduce((sum, [_, y]) => sum + y, 0) / coords.length;
    return { coordinates: [x, y] };
  }
  return { coordinates: [0, 0] };
};

module.exports = { importGeoJSON };
