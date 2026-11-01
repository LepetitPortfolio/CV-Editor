"use strict";

// ============================================================
// version.js — Numéro de version de l'application
// À incrémenter à CHAQUE push (semver simple : majeure.mineure.correctif).
// Doit rester en phase avec la racine ./version.json :
//   - APP_VERSION : ce que le navigateur EST EN TRAIN D'EXÉCUTER ;
//   - version.json : ce qui est DÉPLOYÉ en ligne.
// Si les deux diffèrent → bannière d'actualisation (cv-update.js).
// ============================================================
const APP_VERSION = "1.0.0";