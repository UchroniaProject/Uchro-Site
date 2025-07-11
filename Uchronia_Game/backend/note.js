// Route pour l'index
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Route spécifique pour les GeoJSON
app.get('/geojson/:file', (req, res) => {
  res.sendFile(path.join(frontendPath, 'geojson', req.params.file), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
});