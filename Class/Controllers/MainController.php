<?php

namespace Memory\Controllers;

use Memory\Config\Database;
use Memory\Controllers\ScoreController;

/**
 * Class qui gère l'API Rest du jeu memory
 * 
 * @author Philippe Lepever philippe@phimi.consulting
 * 
 * @since 1.0
 */

class MainController {

    public static function execute() {
        // instantiate database
        $database = new Database();
        $db = $database->getConnection();
        $response = null;
        
        switch ($_GET['resource']) {
            case 'score':
                $response = (new ScoreController($db))->execute();
                break;
            default:
                // Error resource not found
                http_response_code(405);
                return;
        }

        // Sent response
        echo json_encode($response);
    }
}