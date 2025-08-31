# game_modules/models/__init__.py
import importlib
from django.conf import settings

# Important: on importe modules.<slug>.models tôt dans le cycle d'import,
# pour que makemigrations voie les modèles. Chaque modèle doit définir Meta.app_label="game_modules".
for slug in settings.GAME_MODULES_SETTINGS["SLUGS"]:
    try:
        importlib.import_module(f"modules.{slug}.models")
    except ModuleNotFoundError:
        # Un module sans models.py, OK
        continue
