// Configuration des couleurs des biomes
const biomeColors = {
  0: '#4682B4',  // Eau
  1: '#2E8B57',  // Forêt
  2: '#8B4513',  // Montagnes
  3: '#CD853F',  // Désert
  4: '#228B22',  // Prairie
  5: '#FFFFFF'   // Glace
};

// Variables globales
let map;
let selectedFeature = null;
let infoPopup = null;
let vectorSource;
let cellLayer;
let socket;

// Initialisation de la carte
async function initMap() {
   try {
    // Création de la carte
    map = new ol.Map({
    target: 'map',
    layers: [],
    view: new ol.View({
      projection: 'EPSG:4326',
      center: ol.proj.fromLonLat([0, 0]),
      zoom: 3,
      extent: [-180, -90, 180, 90],
      multiWorld: false,
      smoothExtentConstraint: false
    })
    });

  // Initialisation des sources et couches
  vectorSource = new ol.source.Vector();
  cellLayer = new ol.layer.Vector({
    source: vectorSource,
    style: getBaseCellStyle
  });
  map.addLayer(cellLayer);

  // Connexion WebSocket avec reconnexion automatique
  connectWebSocket();

  // Configuration des interactions
  setupInteractions();

  // Chargement initial des données
  await loadInitialData();

} catch (error) {
    console.error("Erreur d'initialisation de la carte:", error);
    alert("Erreur lors du chargement de la carte. Voir la console pour plus de détails.");
  }
}

// Connexion WebSocket avec gestion des reconnexions
function connectWebSocket() {
  socket = io('http://localhost:5000', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('Connecté au serveur WebSocket');
    // Recharger les données après reconnexion
    loadInitialData();
  });

  socket.on('disconnect', () => {
    console.log('Déconnecté du serveur WebSocket');
  });

  socket.on('connect_error', (error) => {
    console.error('Erreur de connexion WebSocket:', error);
  });

  setupWebSocketListeners();
}

// Configuration des interactions de la carte
function setupInteractions() {
  const selectInteraction = new ol.interaction.Select({
    condition: ol.events.condition.singleClick,
    style: function(feature) {
      if (selectedFeature === feature) {
        selectedFeature = null;
        if (infoPopup) document.body.removeChild(infoPopup);
        infoPopup = null;
        return getBaseCellStyle(feature);
      }

      selectedFeature = feature;
      const cellId = feature.get('id');

      fetchCellInfo(cellId).then(info => {
        createInfoPopup(`
          <h3>Cellule ${cellId}</h3>
          <p><strong>Altitude:</strong> ${info.height || 'N/A'}</p>
          <p><strong>Biome:</strong> ${getBiomeName(info.biome)}</p>
          <p><strong>Type:</strong> ${info.type || 'N/A'}</p>
          <p><strong>Voisins:</strong> ${info.neighbors ? info.neighbors.length : '0'}</p>
          <p><strong>Info:</strong> ${info.info || 'Aucune information supplémentaire'}</p>
          <button id="changeBiomeBtn" class="btn">Changer de biome</button>
          <button id="buildStructureBtn" class="btn">Construire</button>
        `);

        // Ajout des événements pour les boutons
        document.getElementById('changeBiomeBtn').addEventListener('click', () => {
          changeBiome(cellId, feature);
        });

        document.getElementById('buildStructureBtn').addEventListener('click', () => {
          buildStructure(cellId, feature);
        });
      });

      return getSelectedCellStyle(feature);
    },
    layers: [cellLayer]
  });

  map.addInteraction(selectInteraction);
}

// Configuration des écouteurs WebSocket
function setupWebSocketListeners() {
  socket.on('connect', () => {
    console.log('Connecté au serveur WebSocket');
  });

  socket.on('cellUpdated', (updatedCell) => {
    const feature = vectorSource.getFeatureById(updatedCell.id);

    if (feature) {
      feature.setProperties({
        biome: updatedCell.biome,
        type: updatedCell.type,
        info: updatedCell.info
      });

      if (updatedCell.coordinates) {
        const [x, y] = updatedCell.coordinates.split(',').map(Number);
        feature.setGeometry(new ol.geom.Point([x, y]));
      }

      // Rafraîchir le style
      feature.setStyle(getBaseCellStyle(feature));

      // Si c'est la cellule sélectionnée, mettre à jour le popup
      if (selectedFeature && selectedFeature.get('id') === updatedCell.id) {
        fetchCellInfo(updatedCell.id).then(info => {
          updateInfoPopup(info);
        });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Déconnecté du serveur WebSocket');
  });
}

// Chargement initial des données
async function loadInitialData() {
  try {
    console.log('Chargement des données depuis le backend...');
    const response = await fetch('./api/cells');
    if (!response.ok) throw new Error('Erreur réseau');

    const cells = await response.json();
    console.log(`Données reçues: ${cells.length} cellules`);

    // Conversion en features OpenLayers
    const features = cells.map(cell => {
      const [x, y] = cell.coordinates.split(',').map(Number);
      const feature = new ol.Feature({
        geometry: new ol.geom.Point([x, y]),
        id: cell.id,
        biome: cell.biome,
        type: cell.type,
        info: cell.info
      });
      feature.setId(cell.id);
      return feature;
    });

    vectorSource.clear();
    vectorSource.addFeatures(features);

    // Chargement des couches supplémentaires
    loadAdditionalLayers();

  } catch (error) {
    console.error("Erreur de chargement des données:", error);
    // Chargement du fallback local
    loadLocalGeoJSON();
  }
}

// Chargement des couches supplémentaires
function loadAdditionalLayers() {
  // Chargement des rivières
  map.addLayer(loadGeoJsonLayer('geojson/Boulison_Rivers.geojson', getRiverStyle));
}

// Chargement du GeoJSON local en fallback
function loadLocalGeoJSON() {
  console.log('Chargement des données locales...');
  vectorSource.clear();
  map.addLayer(loadGeoJsonLayer('./geojson/Boulison_Cells.geojson', getBaseCellStyle));
  map.addLayer(loadGeoJsonLayer('./geojson/Boulison_Rivers.geojson', getRiverStyle));
}

// Récupération des informations d'une cellule
async function fetchCellInfo(cellId) {
  try {
    const response = await fetch(`http://localhost:5000/api/cells/${cellId}`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des infos:', error);
    return {
      id: cellId,
      height: "N/A",
      biome: "N/A",
      type: "N/A",
      neighbors: [],
      info: "Impossible de charger les informations"
    };
  }
}

// Mise à jour du popup d'informations
function updateInfoPopup(info) {
  if (!infoPopup) return;

  const cellId = info.id;
  infoPopup.innerHTML = `
    <h3>Cellule ${cellId}</h3>
    <p><strong>Altitude:</strong> ${info.height || 'N/A'}</p>
    <p><strong>Biome:</strong> ${getBiomeName(info.biome)}</p>
    <p><strong>Type:</strong> ${info.type || 'N/A'}</p>
    <p><strong>Voisins:</strong> ${info.neighbors ? info.neighbors.length : '0'}</p>
    <p><strong>Info:</strong> ${info.info || 'Aucune information supplémentaire'}</p>
    <button id="changeBiomeBtn" class="btn">Changer de biome</button>
    <button id="buildStructureBtn" class="btn">Construire</button>
  `;

  // Réattacher les événements
  document.getElementById('changeBiomeBtn').addEventListener('click', () => {
    changeBiome(cellId, selectedFeature);
  });
}

// Changement de biome
async function changeBiome(cellId, feature) {
  const currentBiome = feature.get('biome') || 0;
  const biomeKeys = Object.keys(biomeColors);
  const newBiome = (currentBiome + 1) % biomeKeys.length;

  try {
    const response = await fetch(`http://localhost:5000/api/cells/${cellId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ biome: newBiome })
    });

    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

    // La mise à jour sera gérée par le WebSocket
    console.log('Biome mis à jour avec succès');
  } catch (error) {
    console.error('Erreur:', error);
    alert("Erreur lors de la mise à jour du biome");
  }
}

// Création du popup d'informations
function createInfoPopup(content) {
  if (infoPopup) {
    document.body.removeChild(infoPopup);
  }

  infoPopup = document.createElement('div');
  infoPopup.className = 'ol-popup';
  infoPopup.innerHTML = content;
  infoPopup.style.position = 'absolute';
  infoPopup.style.bottom = '20px';
  infoPopup.style.right = '20px';
  infoPopup.style.backgroundColor = 'white';
  infoPopup.style.padding = '15px';
  infoPopup.style.borderRadius = '8px';
  infoPopup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  infoPopup.style.zIndex = '1000';
  infoPopup.style.maxWidth = '350px';
  infoPopup.style.border = '1px solid #ddd';

  document.body.appendChild(infoPopup);
}

// Fonction pour obtenir le style de base des cellules
function getBaseCellStyle(feature) {
  const biome = feature.get('biome') || 0;
  return new ol.style.Style({
    fill: new ol.style.Fill({
      color: biomeColors[biome] || '#696969'
    }),
    stroke: new ol.style.Stroke({
      color: '#000000',
      width: 0.45
    })
  });
}

// Style pour les cellules sélectionnées
function getSelectedCellStyle(feature) {
  const biome = feature.get('biome') || 0;
  return new ol.style.Style({
    fill: new ol.style.Fill({
      color: biomeColors[biome] || '#696969'
    }),
    stroke: new ol.style.Stroke({
      color: '#FFD700',
      width: 2,
      lineDash: [5, 5]
    }),
    image: new ol.style.Circle({
      radius: 8,
      fill: new ol.style.Fill({
        color: [255, 215, 0, 0.3]
      })
    })
  });
}

// Style pour les rivières
function getRiverStyle(feature) {
  const width = feature.get('width') || 1;
  const isMajor = feature.get('major') || false;

  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: isMajor ? '#1E90FF' : '#4682B4',
      width: isMajor ? width * 2.5 : width * 1.5,
      lineCap: 'round',
      lineJoin: 'round'
    }),
    zIndex: isMajor ? 10 : 5
  });
}

// Fonction pour charger les couches GeoJSON locales
function loadGeoJsonLayer(url, styleFunction) {
  return new ol.layer.Vector({
    source: new ol.source.Vector({
      url: url,
      format: new ol.format.GeoJSON()
    }),
    style: styleFunction
  });
}

// Fonction pour obtenir le nom d'un biome
function getBiomeName(biomeId) {
  const biomeNames = {
    0: 'Eau',
    1: 'Forêt',
    2: 'Montagnes',
    3: 'Désert',
    4: 'Prairie',
    5: 'Glace'
  };
  return biomeNames[biomeId] || 'Inconnu';
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initMap);
