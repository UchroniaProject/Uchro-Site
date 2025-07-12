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

            // Convertir le GeoJSON en chaîne de caractères
            const convertedGeojson = JSON.stringify(geojson, null);

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
        } catch (error) {
            document.getElementById('result').innerHTML = 'Erreur lors de la lecture du fichier : ' + error.message;
        }
    };

    reader.readAsText(file);
});
