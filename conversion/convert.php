<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$upload_dir = "uploads/";
$converted_dir = "converted/";
$filename = $_GET['filename'];
$upload_file = $upload_dir . $filename;
$converted_file = $converted_dir . 'modified_' . $filename;

if (file_exists($upload_file)) {
    $geojson = json_decode(file_get_contents($upload_file), true);

    // Effectuer les modifications nécessaires sur le GeoJSON
    foreach ($geojson['features'] as &$feature) {
        if (isset($feature['properties'])) {
            $feature['properties']['modified'] = true;
            $feature['properties']['modified_by'] = 'PHP Script';
            $feature['properties']['info'] = 'Informations de la cellule ' . $feature['properties']['id'];
        }
    }

    // Sauvegarder le fichier modifié
    file_put_contents($converted_file, json_encode($geojson));

    // Proposer le téléchargement du fichier modifié
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($converted_file) . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($converted_file));
    readfile($converted_file);

    // Supprimer les fichiers après téléchargement
    unlink($upload_file);
    unlink($converted_file);
} else {
    echo "Désolé, le fichier n'existe pas.";
}
?>
