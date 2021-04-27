<?php

namespace Memory\Controllers;

use Memory\Models\ScoreModel;

/*
 * Class de gestion de la ressource score
 * Il y a les fonctions qui sont appelées dans l'api Rest
 * Cette classe gère le model score
 * 
 * @author Philippe Lepever philippe@phimi.consulting
 * 
 * @since 1.0
 * 
 */

class ScoreController {

    // Stocke la méthode d'appel vers le controller score
    private $_request_methode;
    // Stocke l'appel à une fonction personnalisée de l'API REST
    private $_option;
    // Instence de la table score de la BDD
    private $model;
    // Stocke l'id du score passé en paramètre    
    private $scoreId;

    /**
     * Le constructeur de la classe récupère les paramètres de la requete
     * puis il instantie le model score
     * 
     * @param type $db 
     * 
     */
    public function __construct($db) {
        $this->_request_methode = $_SERVER['REQUEST_METHOD'];
        $this->_option = $_GET['option'];
        $this->scoreId = $_GET['id'];

        $this->model = new ScoreModel($db);
    }


    /**
     * Fonction qui crée un nouveau score de la partie
     * il retourne un tableau avec 2 entrées :
     * - l'id de l'enregistrement
     * - le classement par rapport au score
     * 
     * @return ['id' => int, 'classement' => int]
     */
    private function createScore(): array {
        $this->model->temps = $_POST['temps'];
        $this->model->score = $_POST['score'];

        return [
            'id' => $this->model->createScore(),
            'classement' => $this->model->getClassement()
        ];
    }

    /**
     * Fonction qui retourne le nombre total de parties stockées dans la BDD
     * 
     * @return int
     */
    private function getTotalGames(): int {
        // USE IN THIS GAME
        return count($this->model->getScores());
    }

    /**
     * Fonction non implémenté et non utilisé par le jeu
     * Mais fonction de base dans l'api REST
     * 
     * Fonction qui retourne une ligne de la table score de la Bdd
     * par rapport à $this->scoreId
     * 
     * @return array score
     */
    private function getScore(): array {
        // DON'T USE IN THIS GAME
        return [];
    }

    /**
     * Fonction qui retourne toutes les lignes de la tables score
     * 
     * @return array score
     */
    private function getAllScores(): array {
        return $this->model->getScores();
    }

    /**
     * Fonction qui retourne les 10 meilleurs scores de la table score
     * @return array
     */
    private function getBester(): array {
        return $this->model->getBester();
    }

    /**
     * fonction qui gère les différentes méthodes d'appel (GET, POST, PUT, DELETE)
     * et gère aussi le passage de paramètre
     * @return $response
     */
    public function execute() {
        $response = [];
        switch ($this->_request_methode) {
            case 'PUT':
                // HTTP PUT method will be used the update the data for the requested score id
                // DON'T USE IN THIS GAME
                break;
            case 'POST':
                // HTTP POST method request will be used to create a new score
                $response = $this->createScore();
                break;
            case 'DELETE':
                // HTTP DELETE method will delete the score
                // DON'T USE IN THIS GAME
                break;
            case 'GET':
                // HTTP GET method will fetch :
                // the score details (DON'T USE IN THIS GAME)
                // OR all score (DON'T USE IN THIS GAME)
                // OR bester scores
                // OR Number of total games
                if ($this->scoreId) {
                    $response = $this->getScore($this->scoreId);
                } else {
                    switch ($this->_option) {
                        case 'bester':
                            $response = $this->getBester();
                            break;
                        case 'totalGames':
                            $response = $this->getTotalGames();
                            break;
                        default:
                            $response = $this->getAllScores();
                            break;
                    }
                };

                break;
            default:
                // Throw 'method not available' response for methods Other than PUT, POST, DELETE, GET
                http_response_code(405);
                return;
        }
        return $response;
    }

}
