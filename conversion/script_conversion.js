document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById('result').innerHTML = 'Veuillez sélectionner un fichier.';
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const contents = e.target.result;
        try {
            const geojson = JSON.parse(contents);

            // Collecter les attributs uniques de "properties" autres que "id", "neighbors" et "geometry"
            const propertyAttributes = new Set();
            geojson.features.forEach(feature => {
                if (feature.properties) {
                    Object.keys(feature.properties).forEach(key => {
                        if (key !== 'id' && key !== 'neighbors' && key !== 'geometry') {
                            propertyAttributes.add(key);
                        }
                    });
                }
            });

            // Afficher les cases à cocher pour les attributs
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<h2>Sélectionnez les attributs à conserver :</h2>';

            const form = document.createElement('form');
            form.id = 'attributesForm';

            Array.from(propertyAttributes).forEach(attribute => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = attribute;
                checkbox.value = attribute;
                checkbox.checked = true; // Par défaut, toutes les cases sont cochées
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(attribute));
                form.appendChild(label);
                form.appendChild(document.createElement('br'));
            });

            const submitButton = document.createElement('button');
            submitButton.type = 'button';
            submitButton.textContent = 'Valider';
            submitButton.addEventListener('click', function() {
                processGeoJSON(geojson);
            });

            form.appendChild(submitButton);
            resultDiv.appendChild(form);

        } catch (error) {
            document.getElementById('result').innerHTML = 'Erreur lors de la lecture du fichier : ' + error.message;
        }
    };

    reader.readAsText(file);
});

function processGeoJSON(geojson) {
    // Récupérer les attributs sélectionnés
    const selectedAttributes = Array.from(document.querySelectorAll('#attributesForm input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

    // Filtrer les propriétés en fonction des attributs sélectionnés
    geojson.features.forEach(feature => {
        if (feature.properties) {
            const filteredProperties = { id: feature.properties.id, neighbors: feature.properties.neighbors };
            selectedAttributes.forEach(attribute => {
                if (feature.properties.hasOwnProperty(attribute)) {
                    filteredProperties[attribute] = feature.properties[attribute];
                }
            });
            feature.properties = filteredProperties;
        }
    });

    // Ajouter une paire clé-valeur à chaque feature
    geojson.features.forEach(feature => {
        feature.properties.info = `Informations de la cellule ${feature.properties.id}`;
    });

    // Valider le GeoJSON et ignorer les avertissements de la règle de la main droite
    const hints = geojsonhint.hint(geojson).filter(hint => {
        return hint.message !== "Polygons and MultiPolygons should follow the right-hand rule";
    });

    if (hints.length > 0) {
        document.getElementById('result').innerHTML = 'Erreurs de validation GeoJSON : ' + JSON.stringify(hints);
        return;
    }

    // Convertir le GeoJSON en chaîne de caractères avec le même formatage que le fichier d'entrée
    const convertedGeojson = formatGeoJSON(geojson);

    // Proposer un téléchargement
    const blob = new Blob([convertedGeojson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_' + file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatGeoJSON(geojson) {
    // Convertir chaque feature en chaîne de caractères avec le même formatage que le fichier d'entrée
    let featuresString = '';
    geojson.features.forEach((feature, index) => {
        // L'usage du .stringify n'est pas parfait, les espaces entre clé et valeur disparaissent, mais c'est mieux que rien.
        const featureString = JSON.stringify(feature, null);
        featuresString += featureString;
        if (index < geojson.features.length - 1) {
            featuresString += ',\n';
        }
    });

    // Construire la chaîne de caractères finale
    const header = `{
  "type": "FeatureCollection",
  "name": "${geojson.name}",
  "features": [
`;
    const footer = `
  ]
}
`;
    return header + featuresString + footer;
}
