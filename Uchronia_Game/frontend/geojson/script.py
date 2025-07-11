import json
from pathlib import Path

def convert_geojson_to_cells(input_file, output_file):
    """
    Convertit un fichier GeoJSON en un fichier JSON structuré avec des cellules.

    Args:
        input_file (str): Chemin vers le fichier GeoJSON d'entrée
        output_file (str): Chemin vers le fichier JSON de sortie
    """
    try:
        # Charger le fichier GeoJSON
        with open(input_file, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)

        # Créer la structure de sortie
        cells = {}

        # Parcourir chaque feature du GeoJSON
        for feature in geojson_data.get('features', []):
            properties = feature.get('properties', {})
            cell_id = str(properties.get('id', ''))

            # Créer l'entrée pour cette cellule
            cells[cell_id] = {
                "height": properties.get("height"),
                "biome": properties.get("biome"),
                "type": properties.get("type"),
                "neighbors": properties.get("neighbors", []),
                "info": ""  # Champ vide pour les informations supplémentaires
            }

        # Créer le dictionnaire final
        output_data = {"cells": cells}

        # Écrire le fichier de sortie
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        print(f"Conversion terminée. Fichier créé : {output_file}")

    except FileNotFoundError:
        print(f"Erreur : Le fichier {input_file} n'existe pas.")
    except json.JSONDecodeError:
        print(f"Erreur : Le fichier {input_file} n'est pas un JSON valide.")
    except Exception as e:
        print(f"Une erreur est survenue : {str(e)}")

if __name__ == "__main__":
    # Chemins des fichiers (à adapter selon votre structure)
    input_geojson = "Boulison_Cells.geojson"  # Remplacez par votre fichier GeoJSON
    output_json = "cells_data.json"      # Nom du fichier de sortie

    # Exécuter la conversion
    convert_geojson_to_cells(input_geojson, output_json)
