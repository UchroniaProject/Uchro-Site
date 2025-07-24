// Fonction pour charger la liste des parties en cours
async function loadActiveGames() {
    try {
        const response = await fetch('/api/games');
        if (!response.ok) {
            throw new Error('Impossible de charger la liste des parties');
        }

        const games = await response.json();
        const gameListElement = document.getElementById('gameList');

        if (games.length === 0) {
            gameListElement.innerHTML = '<p class="no-games">Aucune partie en cours trouvée.</p>';
            return;
        }

        // Afficher chaque partie
        games.forEach(game => {
            displayGameCard(game);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des parties:', error);
        document.getElementById('gameList').innerHTML =
            '<p class="error">Erreur lors du chargement des parties. Veuillez réessayer plus tard.</p>';
    }
}

// Fonction pour afficher une carte de partie
function displayGameCard(game) {
    const gameListElement = document.getElementById('gameList');
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    gameCard.innerHTML = `
        <h3>${escapeHtml(game.game_name)}</h3>
        <p><strong>ID:</strong> ${escapeHtml(game.game_id)}</p>
        <p><strong>Date de création:</strong> ${new Date(game.creation_date).toLocaleString()}</p>
        <button class="button primary join-button" data-game-id="${escapeHtml(game.game_id)}">Rejoindre</button>
    `;
    gameListElement.appendChild(gameCard);
}

// Fonction pour échapper le HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Fonction pour afficher le popup de nouvelle partie
function showNewGamePopup() {
    document.getElementById('newGamePopup').style.display = 'flex';
    document.getElementById('gameName').value = '';
    document.getElementById('mapFile').value = '';
}

// Fonction pour masquer le popup de nouvelle partie
function hideNewGamePopup() {
    document.getElementById('newGamePopup').style.display = 'none';
}

// Fonction pour générer un ID de partie unique
function generateGameId() {
    return 'game_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadActiveGames();

    // Gestionnaire d'événements pour le bouton de nouvelle partie
    const newGameButton = document.getElementById('newGameButton');
    if (newGameButton) {
        newGameButton.addEventListener('click', showNewGamePopup);
    }

    // Gestionnaire d'événements pour le formulaire de nouvelle partie
    const newGameForm = document.getElementById('newGameForm');
    if (newGameForm) {
        newGameForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const gameName = document.getElementById('gameName').value.trim();
            const mapFileInput = document.getElementById('mapFile');

            if (!gameName || !mapFileInput.files || mapFileInput.files.length === 0) {
                alert('Veuillez remplir tous les champs obligatoires');
                return;
            }

            const mapFile = mapFileInput.files[0];
            if (mapFile.name.split('.').pop().toLowerCase() !== 'map') {
                alert('Veuillez télécharger un fichier avec l\'extension .map');
                return;
            }

            const gameId = generateGameId();
            const formData = new FormData();
            formData.append('gameId', gameId);
            formData.append('gameName', gameName);
            formData.append('mapFile', mapFile);

            try {
                const response = await fetch('/api/games', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    hideNewGamePopup();
                    // Recharger la liste des parties pour afficher la nouvelle partie
                    document.getElementById('gameList').innerHTML = '';
                    loadActiveGames();
                } else {
                    alert('Erreur lors de la création de la partie: ' + (result.message || 'Erreur inconnue'));
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Une erreur est survenue lors de la création de la partie');
            }
        });
    }

    // Gestionnaire d'événements pour le bouton d'annulation
    const cancelButton = document.getElementById('cancelGameCreation');
    if (cancelButton) {
        cancelButton.addEventListener('click', hideNewGamePopup);
    }
});
