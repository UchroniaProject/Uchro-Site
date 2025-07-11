function initMap() {
  // Création de la carte
  const map = new ol.Map({
    target: 'map',
    layers: [],
    view: new ol.View({
      projection: 'EPSG:4326', // Projection géographique non déformante
      center: ol.proj.fromLonLat([0, 0]),
      zoom: 3,
      extent: [-180, -90, 180, 90], // Limites du monde
      multiWorld: false,
      smoothExtentConstraint: false
    })
  });

  const biomeColors = {
      0: '#4682B4',  // Eau
      1: '#2E8B57',  // Forêt
      2: '#8B4513',  // Montagnes
      3: '#CD853F',  // Désert
      4: '#228B22',  // Prairie
      5: '#FFFFFF'   // Glace
  };

  let selectedFeature = null;
  let infoPopup = null;

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

  // Style avancé pour les rivières
  function getRiverStyle(feature) {
    const width = feature.get('width') || 1;
    const isMajor = feature.get('major') || false;

    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: isMajor ? '#1E90FF' : '#4682B4',
        width: isMajor ? width * 2.5 : width*1.5,
        lineCap: 'round',
        lineJoin: 'round'
      }),
      zIndex: isMajor ? 10 : 5
    });
  }

  // Fonction pour charger les couches
  function loadGeoJsonLayer(url, styleFunction) {
    return new ol.layer.Vector({
      source: new ol.source.Vector({
        url: url,
        format: new ol.format.GeoJSON()
      }),
      style: styleFunction
    });
  }

  // Fonction pour récupérer les infos d'une cellule dans le fichier cells_data.json
  async function fetchCellInfo(cellId) {
    try {
      const response = await fetch('cells_data.json');
      if (!response.ok) throw new Error('Erreur réseau');

      const data = await response.json();
      return data.cells[cellId];
    } catch (error) {
      console.error('Erreur:', error);
      return "Impossible de charger les informations";
    }
  }

  // Fonction pour créer le popup d'informations
  function createInfoPopup(content) {
    // Supprimer l'ancien popup s'il existe
    if (infoPopup) {
      document.body.removeChild(infoPopup);
    }

    // Créer le nouveau popup
    infoPopup = document.createElement('div');
    infoPopup.className = 'ol-popup';
    infoPopup.innerHTML = `
      <div class="ol-popup-content">
        ${content}
      </div>
    `;
    infoPopup.style.position = 'absolute';
    infoPopup.style.bottom = '10px';
    infoPopup.style.left = '10px';
    infoPopup.style.backgroundColor = 'white';
    infoPopup.style.padding = '10px';
    infoPopup.style.borderRadius = '5px';
    infoPopup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    infoPopup.style.zIndex = '1000';
    infoPopup.style.maxWidth = '300px';

    document.body.appendChild(infoPopup);
  }

  // Chargement des couches
  map.addLayer(loadGeoJsonLayer('geojson/Boulison_Cells.geojson', getBaseCellStyle));
  map.addLayer(loadGeoJsonLayer('geojson/Boulison_Rivers.geojson', getRiverStyle));

  // Interaction de sélection
  const selectInteraction = new ol.interaction.Select({
    condition: ol.events.condition.singleClick,
    style: function(feature) {
      // Si c'est la même feature, on la désélectionne
      if (selectedFeature === feature) {
        selectedFeature = null;
        if (infoPopup) document.body.removeChild(infoPopup);
        infoPopup = null;
        return getBaseCellStyle(feature);
      }

      // Sélection d'une nouvelle feature
      selectedFeature = feature;
      const cellId = feature.get('id');

      // Récupérer les informations depuis la base de données
      fetchCellInfo(cellId).then(info => {
        createInfoPopup(`
          <h3>Cellule ${cellId}</h3>
          <p>Altitude: ${info["height"]}</p>
          <p>Biome: ${info["biome"]}</p>
          <p>Type: ${info["type"]}</p>
          <p>Voisins: ${info["neighbors"]}</p>
          <p>Info: ${info["info"]}</p>
        `);
      });

      return getSelectedCellStyle(feature);
    },
    layers: [map.getLayers().item(0)]
  });

  map.addInteraction(selectInteraction);

}

document.addEventListener('DOMContentLoaded', initMap);