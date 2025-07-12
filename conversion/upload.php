<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["file"]["name"]);
$uploadOk = 1;
$fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

// Vérifier si le fichier est un fichier GeoJSON
if ($fileType != "geojson") {
    echo "Désolé, seul les fichiers GeoJSON sont autorisés.";
    $uploadOk = 0;
}

// Vérifier si le dossier de destination existe
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0755, true);
    echo "Le dossier de destination a été créé : " . $target_dir;
}

// Vérifier si $uploadOk est mis à 0 par une erreur
if ($uploadOk == 0) {
    echo "Désolé, votre fichier n'a pas été téléchargé.";
// si tout est ok, essayer de télécharger le fichier
} else {
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        echo "Le fichier " . basename($_FILES["file"]["name"]) . " a été téléchargé.";
        header("Location: convert.php?filename=" . basename($_FILES["file"]["name"]));
    } else {
        echo "Désolé, une erreur s'est produite lors du téléchargement de votre fichier. Erreur : " . $_FILES["file"]["error"];
        echo "Chemin du fichier cible : " . $target_file;
        echo "Chemin temporaire du fichier : " . $_FILES["file"]["tmp_name"];
    }
}
?>
