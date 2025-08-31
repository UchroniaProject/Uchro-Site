# game_modules/apps.py
from django.apps import AppConfig
from django.conf import settings
import importlib

class GameModulesConfig(AppConfig):
    name = "game_modules"
    label = "game_modules"
    verbose_name = "Core des Modules"

    def ready(self):
        # 1) Importer dynamiquement les models de chaque module pour que Django les voie (migrations)
        import game_modules.models  # déclenche l'import dynamique
        # 2) Construire le registre UI
        from .registry import discover_and_register
        discover_and_register()
