const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de multer pour le téléchargement de fichiers
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite à 10MB
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() === '.map') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers .map sont autorisés!'));
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes API
app.get('/api/games', (req, res) => {
    const activeSavesPath = path.join(__dirname, '../saves', 'active_saves');

    fs.readdir(activeSavesPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error('Erreur lors de la lecture du dossier:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des parties' });
        }

        const games = [];

        entries.forEach(entry => {
            if (entry.isDirectory()) {
                try {
                    const propertiesPath = path.join(activeSavesPath, entry.name, 'save_properties.json');
                    const properties = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));

                    games.push({
                        game_id: properties.game_id,
                        game_name: properties.game_name,
                        creation_date: properties.creation_date
                    });
                } catch (error) {
                    console.error(`Erreur lors de la lecture des propriétés pour ${entry.name}:`, error);
                }
            }
        });

        res.json(games);
    });
});

app.post('/api/games', upload.single('mapFile'), async (req, res) => {
    const { gameId, gameName } = req.body;
    const mapFile = req.file;

    if (!gameId || !gameName || !mapFile) {
        return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }

    try {
        const sourceDir = path.join(__dirname, '../saves', 'save_model');
        const destDir = path.join(__dirname, '../saves', 'active_saves', gameId);

        // 1. Créer le nouveau dossier
        await fs.promises.mkdir(destDir, { recursive: true });

        // 2. Copier le contenu du modèle
        await copyDirectory(sourceDir, destDir);

        // 3. Mettre à jour save_properties.json
        const propertiesPath = path.join(destDir, 'save_properties.json');
        const properties = JSON.parse(await fs.promises.readFile(propertiesPath, 'utf8'));

        properties.game_id = gameId;
        properties.game_name = gameName;
        properties.creation_date = new Date().toISOString();

        await fs.promises.writeFile(propertiesPath, JSON.stringify(properties, null, 2));

        // 4. Déplacer le fichier .map
        const mapFileName = `map.${path.extname(mapFile.originalname).substring(1)}`;
        await fs.promises.rename(
            mapFile.path,
            path.join(destDir, mapFileName)
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la création de la partie:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Fonction utilitaire pour copier un dossier
async function copyDirectory(src, dest) {
    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    await Promise.all(entries.map(async entry => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await fs.promises.mkdir(destPath, { recursive: true });
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.promises.copyFile(srcPath, destPath);
        }
    }));
}

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
