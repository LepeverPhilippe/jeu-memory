<?php

namespace Memory\Models;

use Memory\Config\Database;
use PDO;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of classement
 *
 * @author lepev
 */
class ScoreModel {

    // Connection à la base de données
    private $conn;
    // Nom de la table utilisé par cette classe
    private $table_name = "scores";
    // Propiétés de la table scores
    public $id;
    public $date;
    public $temps;
    public $score;

    // Db connection
    public function __construct($db) {
        $this->conn = $db;
        // Tester l'existance de la table dans la BDD
        if (! $this->isTableExists())
        // Création de la table si nécessaire
            $this->createTable();
    }
    /**
     * Fonction qui teste si la table exsite
     * 
     * @return bool
     */
    public function isTableExists(): bool {

        // Try a select statement against the table
        // Run it in try/catch in case PDO is in ERRMODE_EXCEPTION.
        try {
            $result = $this->conn->query("SELECT 1 FROM `" . $this->table_name . "` LIMIT 1");
        } catch (Exception $e) {
            // We got an exception == table not found
            return FALSE;
        }

        // Result is either boolean FALSE (no table found) or PDOStatement Object (table found)
        return $result !== FALSE;
    }
    /**
     * Fonction qui crée la table scores dans la bdd
     */
    private function createTable() {
        // Création de la requete sql
        $sqlQuery = "CREATE TABLE `scores` (
            `id` bigint(20) UNSIGNED NOT NULL,
            `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `temps` time DEFAULT NULL,
            `score` mediumint(8) UNSIGNED DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;";

        try {
            $this->conn->query($sqlQuery);
        } catch (Exception $e) {
            echo "Error create Table " . $this->table_name . " : " . $e->getMessage();
        }
    }

    /**
     * Fonction qui crée une ligne dans la table score
     * 
     * Si l'insert à la table n'a pas eu de bug,
     * la fonction retourne l'id créé
     * sinon retourne FALSE
     * 
     * @return boolean|int
     */
    public function createScore() {
        // Création de la requete sql
        $sqlQuery = "INSERT INTO
                        `" . $this->table_name . "`
                    SET 
                        temps = :temps, 
                        score = :score";
        $stmt = $this->conn->prepare($sqlQuery);

        // sanitize les paramètres
        $this->temps = htmlspecialchars(strip_tags($this->temps));
        $this->score = htmlspecialchars(strip_tags($this->score));

        // Injecter les paramètres dans la requete sql
        $stmt->bindParam(":temps", $this->temps);
        $stmt->bindParam(":score", $this->score, PDO::PARAM_INT);

        // Executer la requete
        if ($stmt->execute()) {
            // Fonctionnement correcte
            // Retourner l'id créé par le insert
            return $this->conn->lastInsertId();
        }
        // Fonctionnement incorrecte
        // Retourner FALSE
        return false;
    }

    public function getScore($id) {
        // Fonctionnalité non utile pour ce jeu
    }

    /**
     * Fonction qui retourne la position du classement par rapport au score
     * donné en paramètre ($this->score)
     * 
     * @return int $classement
     */
    public function getClassement(): int {
        // Création de la requete sql
        // Utilisation de la fonction COUNT dans la BDD puis ajoute 1
        $sqlQuery = "SELECT (COUNT(*) + 1) AS classement "
                . "FROM `" . $this->table_name . "` "
                . "WHERE `score` > :score ";
        $stmt = $this->conn->prepare($sqlQuery);

        // sanitize les paramètres
        $this->score = htmlspecialchars(strip_tags($this->score));

        // Injecter les paramètres dans la requete sql
        $stmt->bindParam(":score", $this->score, PDO::PARAM_INT);

        // Executer la requete
        if ($stmt->execute()) {
            // Le résultat de la requete est UNE LIGNE et UNE COLONNE
            // Retourner la colonne classement
            return $stmt->fetch()->classement;
        }

        // Fonctionnement incorrecte
        // Retourner FALSE
        return 0;
    }

    /**
     * Fonction qui retourne toutes les lignes de la table score
     * 
     * @return array
     */
    public function getScores() {
        // Création de la requete sql
        $sqlQuery = "SELECT * "
                . "FROM `" . $this->table_name . "`";
        $stmt = $this->conn->prepare($sqlQuery);
        // Executer la requete
        $stmt->execute();
        // Retourne tous les resultats sous forme de tableau
        // \PDO::FETCH_CLASS ou \PDO::FETCH_OBJ
        return $stmt->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_ASSOC);
    }

    /*
     * Fonction qui retourne les 10 meilleures résultats (score et temps)
     * 
     * return array
     */

    public function getBester() {
        // Création de la requete sql
        // Utilisation de la fonction DATE_FORMAT pour formater la date en version française
        // Trie de la table par score et temps descendant et par date ascendant
        // On limite le résultat aux 10 premières lignes
        $sqlQuery = "SELECT id, date, temps, score, "
                . "DATE_FORMAT(date,'%d/%m/%Y %T') AS dateFr "
                . "FROM `" . $this->table_name . "` "
                . "ORDER BY `score` DESC, `temps` DESC, `date` ASC "
                . "LIMIT 10";

        $stmt = $this->conn->prepare($sqlQuery);

        // Executer la requete
        $stmt->execute();

        // Retourne tous les resultats sous forme de tableau
        // \PDO::FETCH_CLASS ou \PDO::FETCH_OBJ
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($id) {
        // Fonctionnalité non utile pour ce jeu
    }

    public function delete($id) {
        // Fonctionnalité non utile pour ce jeu
    }

}
