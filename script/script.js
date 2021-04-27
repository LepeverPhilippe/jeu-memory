// Constante pour définir le nombre de cartes à jouer (mettre un chiffre pair et < 28)
const NOMBRES_CARTS = 28;

// Constantes pour définir les couleurs de border des cartes
const COULEUR_CARTE_NON_JOUE = "#000000";
const COULEUR_CARTE_SELECT = "#00b4eb";
const COULEUR_CARTE_VISBLE = "#00b04c";
const COULEUR_CARTE_ERREUR = "#ea342d";

// Constantes pour gérer les animation en miliseconde
const TEMPS_AFFICHER_CARTES = 100; // 0.1 seconde
const TEMPS_MASQUER_CARTES = 1000; // 1 seconde
const TEMPS_JEU_MAX = 1000 * 60 * 4; // 4 minutes

// Tableau qui contient toutes les cartes
// Lien avec l'id des div.carte
var tabCartes = remplirTableau();

// Variables pour gerer le temps
// Enregister la date du début du jeu
var tempsJeuDebut = 0;
// Enregister la date du fin du jeu
var tempsJeuFin = 0;
// Id de la fonction pour afficher le chrono
// Utiliser pour arreter le chrono
var intervalChrono;

/**
 * Mélanger un tableau passé en paramètre
 * @param { Array } tableau
 */
function melangerTableau(tableau) {
    tableau.sort(() => Math.random() - 0.5);
}

/**
 * Créer un tableau avec les paires de cartes
 * @return { Array } tableau
 */
function remplirTableau() {
    var tableau = new Array();
    var nbPaire = NOMBRES_CARTS / 2;
    for (i = 0; i < NOMBRES_CARTS; i++) {
        tableau[i] = i % nbPaire;
    }
    return tableau;
}


/**
 * Mettre le chiffre sur 2 caractères :
 * de 0 à 9 : Mettre un '0' devant
 * 
 * @param {int} n
 * @returns {String} n
 */
function DeuxCaracteres(n) {
    return (n < 10 ? '0' : '') + n
}

$(document).ready(function () {
    /**
     * Fonction qui est appelé 1 SEUL fois au chargement de la page
     * 
     * @returns null
     */
    function DebutDuJeu() {
        // Afficher le nombre total des parties grace à un appel ajax
        AfficherTotalParties();
        // Afficher le classement grace à un appel ajax
        AfficherClassement();
        // Creation des cartes à jouer (fait par Jquery)
        CreerCartes();
    }
    // Appel de la fonction DebutDuJeu 1 SEUL fois au chargement du jeu
    DebutDuJeu();

    /**
     * Fonction qui fait un appel ajax pour récupérer le nombre total de parties stockées sur le serveur
     * Puis, mettre le nombre de parties dans le span#TotalParties
     * Si il y a une erreur dans l'appel ajax, mettre "toutes les" (par défaut) dans le span#TotalParties
     * 
     * @returns null
     */
    function AfficherTotalParties() {
        /**
         * Appel ajax pour récupérer le nombre total de parties stockées sur le serveur
         * return de l'appel ajax (int) totalGames
         * 
         * Mettre le nombre de parties dans le span#TotalParties
         * Si il y a une erreur dans l'appel ajax, mettre "toutes les" (par défaut) dans le span#TotalParties
         */
        $.ajax({
            //L'URL de la requête 
            url: "api-rest/score/:totalGames",
            //La méthode d'envoi (type de requête)
            method: "GET",
            //Le format de réponse attendu
            dataType: "json",
            //Les données envoyées
            data: {}

        })
                .done(function (totalGames) {
                    // Ce code sera exécuté en cas de succès - La réponse du serveur est passée à done()
                    // Mettre le nombre de parties dans le span#TotalParties
                    $("span#TotalParties").html(totalGames);
                })
                .fail(function (error) {
                    // Ce code sera exécuté en cas d'échec - L'erreur est passée à fail()
                    // Mettre "toutes les" (par défaut) dans le span#TotalParties
                    $("span#TotalParties").html("toutes les");
                });
    }

    /**
     * Fonction qui fait un appel ajax pour récupérer le classement du top 10
     * des parties stockées sur le serveur
     * 
     * puis, re-créer le classement dans le div resultat
     * Si il y a une erreur dans l'appel ajax, mettre un meesage d'erreur dans le resultat
     * 
     * @returns null
     */
    function AfficherClassement() {
        // Supprimer l'ancien classement
        $(".classement .row.partie").remove();

        /**
         * Appel ajax pour récupérer le classement du top 10
         * des parties stockées sur le serveur
         */
        $.ajax({
            //L'URL de la requête 
            url: "api-rest/score/:bester",
            //La méthode d'envoi (type de requête)
            method: "GET",
            //Le format de réponse attendu
            dataType: "json",
            //Les données envoyées
            data: {}

        })
                .done(function (bester) {
                    // Ce code sera exécuté en cas de succès - La réponse du serveur est passée à done()
                    var rows = "";
                    // Création des lignes du classement
                    $.each(bester, function (index, data) {
                        rows += "<div class='row partie' id='" + data.id + "'>";
                        rows += "    <div class='col'>" + (index + 1) + "</div>";
                        rows += "    <div class='col'>" + data.dateFr + "</div>";
                        rows += "    <div class='col'>" + data.temps + "</div>";
                        rows += "    <div class='col'>" + (data.score == 0 ? "PERDU" : data.score) + "</div>";
                        rows += "</div>";
                    });
                    // Ajouter le classement dans le div resultat après le div chargement
                    $(".chargement").after(rows);

                })
                .fail(function (error) {
                    // Ce code sera exécuté en cas d'échec - L'erreur est passée à fail()
                    // Mettre un message d'erreur au lieu du classement
                    var row = "<div class='row partie' id=''>";
                    row += "    <div class='col'>Erreur de chargement du classement</div>";
                    row += "</div>";
                    // Ajouter le message dans le div resultat après le div chargement
                    $(".chargement").after(row);
                })
                //Ce code sera exécuté que la requête soit un succès ou un échec
                .always(function () {
                    // Enlever le div du chargement
                    $(".classement .chargement").hide();
                });
    }

    /**
     * Fonction qui envoyer le score via un appel ajax au serveur
     * pour stocker ce résultat
     * 
     * puis, affiche le classement de cette partie dans le div bannier
     * et actualise le total des parties jouées et le classement
     * 
     * Si il y a une erreur dans l'appel ajax, mettre un message 
     * d'erreur dans le div bannier par rapport au classement
     * 
     * @returns null
     */
    function EnvoyerScore() {
        $.ajax({
            //L'URL de la requête 
            url: "api-rest/score/",
            //La méthode d'envoi (type de requête)
            method: "POST",
            //Le format de réponse attendu
            dataType: "json",
            //Les données envoyées
            data: {temps: $(".chrono").html(), score: CalculerScore()}

        })
                //Ce code sera exécuté en cas de succès - La réponse du serveur est passée à done()
                /*On peut par exemple convertir cette réponse en chaine JSON et insérer
                 * cette chaine dans un div id="res"*/
                .done(function (response) {
                    // Actualiser le nombre de parties jouées
                    AfficherTotalParties();
                    // Actualiser le classement
                    AfficherClassement();
                    if (EstFinJeuGagne())
                        // Si la partie est gagnée, afficher le classement de cette partie
                        $(".message").append("Classement : " + response.classement);

                })

                //Ce code sera exécuté en cas d'échec - L'erreur est passée à fail()
                //On peut afficher les informations relatives à la requête et à l'erreur
                .fail(function (error) {
                    // Mettre le message d'erreur dans la bannier
                    $(".message").append("Vote partie n'a pas pu être enregistré... Désolé !");

                })
                //Ce code sera exécuté que la requête soit un succès ou un échec
                .always(function () {
                    $(".classement .chargement").hide();
                });
    }

    /**
     * Calculer le score (soustraction entre le temps max et le temps réalisé)
     * @returns {int}
     */
    function CalculerScore() {
        var score = TEMPS_JEU_MAX - tempsJeuFin
        return (score < 0) ? 0 : score;
    }

    /**
     * CreerCartes crée les div qui représentent les cartes du jeu
     * Le nombre de carte est défini par la constante NOMBRES_CARTS
     * Ces div sont mis dans le div Plateau
     * @returns {undefined}
     */
    function CreerCartes() {
        for (i = 0; i < NOMBRES_CARTS; i++) {
            $(".plateau").append("<div class='carte' id='" + i + "'></div>");
        }
    }


    /**
     * Fonction qui est appelé chaque seconde pour rafraîchir le chrono en bas à gauche
     * 
     * @returns null
     */
    function AfficherChrono() {
        // Caluler la différence entre le début du jeu et maintenant
        var diffDates = Date.now() - tempsJeuDebut;

        // Calculer les minutes de la différence de temps
        var minutes = Math.floor(diffDates / (1000 * 60));

        // Calculer les secondes de la différence de temps
        var secondes = Math.floor((diffDates / 1000)) % 60;

        // Afficher le temps
        $(".chrono").html(DeuxCaracteres(minutes) + ":" + DeuxCaracteres(secondes));
    }

    /**
     * Fonction qui :
     * - Ré-initisaliser la barre de temps
     * - Animation de la barre de temps pour le début de partie
     * - Démarre le chronomètre
     * - Enregistre la date du début de partie
     * - Gestion de la fin de partie en mode PERDU...
     * @returns null
     */
    function InitierTemps() {
        //Stocker la date du début de partie
        tempsJeuDebut = Date.now();

        // Ré-initisaliser la barre de temps
        $("div.sablier").removeAttr('style')
                // Animation de la barre de temps
                .animate({width: 0, backgroundColor: COULEUR_CARTE_ERREUR}, TEMPS_JEU_MAX, function () {
                    // Si l'animation se termine... alors la partie est PERDU
                    FinirJeuPerdu();
                });

        // Lancer et Stockage de la fonction AfficherChrono pour l'arreter À la fin de la partie
        intervalChrono = setInterval(AfficherChrono, 1000);
    }
    /**
     * Calculer le temps de la partie
     * Stopper le chronomètre (stopper l'appel à la fonction)
     * 
     * @returns null
     */
    function ArreterTemps() {
        // Calculer le temps de la partie
        tempsJeuFin = Date.now() - tempsJeuDebut;
        // Stopper le chronomètre (stopper l'appel à la fonction)
        clearInterval(intervalChrono);
    }
    /**
     * Fonction qui retourne Si il reste des cartes à jouer (class play)
     * S'il n'a pas de cartes à jouer alors c'est la partie est gagnée
     * retourner false --> partie PAS encore gagnée
     * retourner true --> partie encore GAGNÉE
     * 
     * @returns {Boolean}
     */
    function EstFinJeuGagne() {
        return ($("div.carte.play").length === 0);
    }
    /**
     * Fonction de gestion de la fin de partie GAGNÉE
     * On arrete le temps pour le score et le chrono...
     * Gestion des class pour le score en mode WINNER
     * Affichage du temps réalisé et le score
     * 
     * Appel à la fonction FinirJeu pour continuer la gestion de fin de partie
     * 
     * @returns {undefined}
     */
    function FinirJeuGagne() {
        // Stopper le temps pour le score et le chrono...
        ArreterTemps();
        // Arreter l'animation du sablier
        $("div.sablier").stop();

        // Ajouter la class Gagnant au div score
        $(".message").addClass("gagnant")
                // Ajouter le texte, chrono et le calcule du score
                .html("GAGNÉ en " + $(".chrono").html() + "<br />" +
                        "Score : " + CalculerScore() + "<br />");
        FinirJeu();
    }
    /**
     * Fonction de gestion de la fin de partie PERDUE
     * On arrete le temps
     * Gestion des class pour le score en mode LOSER
     *
     * Appel à la fonction FinirJeu pour continuer la gestion de fin de partie
     * 
     * @returns {undefined}
     */
    function FinirJeuPerdu() {
        // Stopper le chronomètre (stopper l'appel à la fonction)
        ArreterTemps();
        // Ajouter la class Perdant au div score
        $(".message").addClass("perdant")
                // Ajouter le texte pour indiquer que la partie est perdu
                .html("PERDU...");
        FinirJeu();
    }
    /**
     * Fonction qui change de d'interface :
     * Passer de l'interface Jeu à l'interface Résultats
     * Entretemps, on affiche le div message qui informe sur le dénoument de la partie
     * 
     * @returns {undefined}
     */
    function FinirJeu() {

        EnvoyerScore();
        $(".resultats").show();
        $(".classement .chargement").show();
        $("div.bannier").show();
        $("div.jeu").hide();
    }

    /**
     * Afficher une carte du jeu :
     * Affiche l'icone de la carte et
     * Animation : changer le border pour informer la selection de cette carte au joueur
     * Ajout de class "visible" pour qui afficher la carte
     * Ajout de class "actived" pour indiquer au système quelle carte a été selectionné
     * 
     * @param { Object } carte
     */
    function VisibleCarte(carte) {
        // Calculer la position de l'image background
        var positionY = -tabCartes[carte.attr('id')] * 100;
        // Affecter cette position à la carte et afficher
        carte.css("background-position-y", positionY + "px").addClass("visible actived");
        // Animer le border pour informer la selection de cette carte
        carte.animate({
            borderColor: COULEUR_CARTE_SELECT
        }, TEMPS_AFFICHER_CARTES);
    }

    /**
     * Masquer les 2 cartes du jeu
     * Fonction appelée quand les 2 cartes ne sont pas identiques 
     * Animations : 
     * animation 1 : changer le border en Rouge pour informer cartes non identiques
     * animation 2 : changer le border en Noir pour retourner la carte pour pouvoir la rejouer
     * puis enlever les class css de la selection de cartes : actived visible
     * @returns null
     */
    function MasquerCartes(idCarte01, idCarte02) {
        $("div.carte#" + idCarte01 + ", div.carte#" + idCarte02)
                // Animation 1 : Border Rouge (ERREUR)
                .animate({borderColor: COULEUR_CARTE_ERREUR}, TEMPS_MASQUER_CARTES)
                // Animation 2 : Border Noir (NON joue)
                .animate({borderColor: COULEUR_CARTE_NON_JOUE}, TEMPS_MASQUER_CARTES, function () {
                    // enlever les class css de la selection de cartes
                    $("div.carte#" + idCarte01 + ", div.carte#" + idCarte02).removeClass("actived visible");
                });
    }

    /*
     * 2 Cartes qui sont retournés (visible et actived) sont identiques
     * Enlever les class Play et actived
     * Création de l'animation de validation des 2 cartes
     * @returns null
     */
    function ValiderPaire() {
        $("div.carte.actived").removeClass("actived play").animate({
            borderColor: COULEUR_CARTE_VISBLE
        }, TEMPS_MASQUER_CARTES);
    }

    /**
     * Gestion Complete de l'event click sur une carte
     * @param { Object } event
     */
    $("div.carte").click(function (event) {
        // Gestion dess cas particulités : 
        // Click une carte déjà visible
        // ou
        // Click sur une carte qui ne doit PLUS être jouée
        if ($(this).hasClass("visible") || !$(this).hasClass("play"))
            return;

        // Récupérer les cartes actives
        cartePlayed = $("div.carte.play.actived");

        // Gestion effet de bord : spammer le click sur les cartes...
        if (cartePlayed.length > 1)
            return;

        // Afficher la carte qui a été cliqué et la tager actived
        VisibleCarte($(this));

        if (cartePlayed.length == 1) {
            // Tester entre les 2 cartes si elles sont identiques
            if (tabCartes[ $(this).attr('id') ] === tabCartes[ cartePlayed.attr("id") ]) {
                // Ces 2 cartes sont identiques
                // Validation des 2 cartes
                ValiderPaire();
                // Tester la fin de partie
                if (EstFinJeuGagne())
                    FinirJeuGagne();
            } else {
                // Masquer les 2 cartes car elles ne sont pas identiques
                MasquerCartes($(this).attr('id'), cartePlayed.attr("id"));
            }
        }
    });

    /**
     * Gestion Complete de l'event click sur le bouton démarrer
     * @param { Object } event
     */
    $("button.demarrer").click(function (event) {
        // Melanger le tableau qui contient les paires de cartes
        melangerTableau(tabCartes);

        // Ré-inisaliser les div des cartes
        $("div.carte").removeClass("visible actived").addClass("play").css("borderColor", COULEUR_CARTE_NON_JOUE);

        // Mettre le chrono à 0
        $(".chrono").html("00:00");

        // Cacher les div de présentation (classement et resultat et bannier)
        $(".classement .chargement").hide();
        $("div.resultats").hide();
        $("div.bannier").hide();
        // Enlever les class de fin de partie du message
        $(".message").removeClass("win lose");

        // Afficher le plateau de jeu
        $("div.jeu").show();
        // Lancer le chrono
        InitierTemps();
    });

});