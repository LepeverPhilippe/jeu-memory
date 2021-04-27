<?php
namespace Memory\Config;

use \PDO;

/**
 * Description of database
 * @author Philippe Lepever philippe@phimi.consulting
 * 
 * @since 1.0
 */

class Database{
    // specify your own database credentials   
    private $host = "host";
    private $db_name = "db_name";
    private $username = "username";
    private $password = "password";

    // get the database connection
    private $dbConnection = null;
    
    /**
     * Le constructeur qui se connecte à la BDD
     * @throws PDOException PDO a rencontré une erreur de connection à la BDD
     */
    public function __construct()
    {
        
        try {
            $this->dbConnection = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                    $this->username, $this->password, [
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ
                    ]);
            
        } catch(PDOException $exception){
            echo "Connection error: " . $exception->getMessage();
        }
    }
    /**
     * Fonction qui retourne la connection à la BDD pour manipulation
     * 
     * Instancé par la classe index
     * Utilisé seulement par les class Model
     * 
     * @return dbConnection
     */
    public function getConnection()
    {
        return $this->dbConnection;
    }
}
?>
