<?php
require ".." . DIRECTORY_SEPARATOR . "vendor" . DIRECTORY_SEPARATOR . "autoload.php";

use Memory\Controllers\MainController;

// Création des en-tetes http pour l'API REST
header("Access-Control-Allow-Origin: " . $_SERVER['REQUEST_SCHEME'] . "://". $_SERVER['SERVER_NAME']);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");




// Execute mainController
(new mainController())->execute();
exit();