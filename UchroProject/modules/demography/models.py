# modules/demography/models.py
from django.db import models

class PopulationSnapshot(models.Model):
    city = models.CharField(max_length=128)
    year = models.PositiveIntegerField()
    inhabitants = models.PositiveIntegerField()

    class Meta:
        app_label = "game_modules"                 # clé: tous les models vivent dans l’app cœur
        db_table = "mod_demography_population"     # nommage explicite pour éviter collisions
        unique_together = [("city", "year")]
