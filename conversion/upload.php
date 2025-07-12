<?php
$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["file"]["name"]);
$uploadOk = 1;
$fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

// Vérifier si le fichier est un fichier GeoJSON
if ($fileType != "geojson") {
    echo "Désolé, seul les fichiers GeoJSON sont autorisés.";
    $uploadOk = 0;
}

// Vérifier si $uploadOk est mis à 0 par une erreur
if ($uploadOk == 0) {
    echo "Désolé, votre fichier n'a pas été téléchargé.";
// si tout est ok, essayer de télécharger le fichier
} else {
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        header("Location: convert.php?filename=" . basename($_FILES["file"]["name"]));
    } else {
        echo "Désolé, une erreur s'est produite lors du téléchargement de votre fichier.";
    }
}
?>
