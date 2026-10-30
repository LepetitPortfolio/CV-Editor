"use strict";

// ============================================================
// cv-keywords.js — Moteur de mots-clés (JD matching)
// Expose : STOPWORDS, extractKeywords,
//          groupesSynonymesEffectifs, ajouterGroupeSynonymes,
//          retirerGroupeSynonymes, ajouterMotSynonyme,
//          retirerMotSynonyme, reinitialiserSynonymes
// ============================================================
const STOPWORDS = new Set(("le la les un une des de du au aux et ou en dans sur pour avec sans par qui que quoi dont où est sont être avoir fait faire plus moins très ce cette ces son sa ses leur nos vos je tu il elle nous vous ils elles se ne pas aussi ainsi comme mais donc or ni car si tout tous toute toutes autre autres même entre chez vers afin selon lors alors the and for with you your our their will that this from have has are was were not can all").split(" "));

// ============================================================
// CORRESPONDANCE APPROCHÉE — canoniserMot()
// Synonymes (dictionnaire, domaines jeu vidéo / dev / recrutement
// FR & EN) + racinisation légère (pluriels et suffixes courants).
// L'offre ET le CV passent par canoniserMot() : la comparaison se
// fait dans le même espace des deux côtés. Mots simples uniquement
// (les mots composés sont coupés par la tokenisation) ; accents des
// deux orthographes (avec/sans) inclus.
// ============================================================
const GROUPES_SYNONYMES =
[
  // Vocabulaire TRANSVERSAL des offres d'emploi (FR/EN), aucun
  // métier privilégié : télétravail, langues, soft-skills, mode
  // d'organisation. Les groupes spécialisés (technos, outils,
  // jargon de secteur) n'ont pas leur place ici — ils se créent
  // depuis l'onglet Analyse d'offre et voyagent dans le JSON
  // exporté (cv.synonymes).
  ["teletravail", "télétravail", "remote", "distanciel"],
  ["anglais", "english"],
  ["developpement", "développement", "development"],
  ["gestion", "management", "pilotage"],
  ["equipe", "équipe", "teamwork", "collaboration", "collaboratif", "collaborative", "cooperation", "coopération"],
  ["communication", "communicant", "communicante", "relationnel"],
  ["autonomie", "autonome", "independant", "indépendant"],
  ["curiosite", "curiosité", "curiosity", "curieux"],
  ["creativite", "créativite", "créativité", "creativity", "creatif", "créatif", "creative"],
  ["rigueur", "rigoureux", "organise", "organisé"],
  ["reactivite", "réactivité", "proactif", "proactive"],
  ["formation", "training"],
  ["experience", "expérience"],
  ["projet", "project", "projets"]
];

// Racinisation légère : pluriel d'abord, puis le premier suffixe
// (liste triée du plus long au plus court) qui laisse un radical
// d'au moins 4 caractères. "optimisation"/"optimisations" →
// "optimis" ; "prototypes"/"prototype" → "prototype".
const SUFFIXES =
[
  "issements", "issement", "ations", "ation", "ements", "ement",
  "ateurs", "ateur", "ances", "ance", "ences", "ence",
  "ités", "ité", "ions", "ion", "ings", "ing",
  "ées", "és", "ée", "er", "ed", "es"
];

// Extrait les mots-clés d'une offre : tokenize (FR/EN + c#/c++),
// ignore les mots vides et les trop courts, compte les occurrences
// et renvoie les 12 plus fréquents : [{ word, count }, …].
function extractKeywords(text) 
{
  const counts = new Map();
  (text.toLowerCase().match(/[a-zàâçéèêëîïôûùüÿñæœ][a-zàâçéèêëîïôûùüÿñæœ+#.\-\/]*/g) || []).forEach((w) => 
  {
    const clean = w.replace(/[.\-\/]+$/, "");
    if (clean.length < 3 || STOPWORDS.has(clean)) return;
    counts.set(clean, (counts.get(clean) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

// ============================================================
// Dictionnaire de synonymes ÉDITABLE (onglet Analyse d'offre).
// Stockage : cv.synonymes, clé RACINE du CV — les groupes perso
// font partie du document : exportés dans le JSON, réimportés
// sur une autre machine. Absente ou vide = les défauts du
// fichier ci-dessus (convention des clés optionnelles : rqth,
// ordreSections…). À la première modification, les défauts sont
// COPIÉS dans cv.synonymes : on édite ensuite sa copie.
// ============================================================

// Groupes effectifs : la liste personnalisée si elle existe et
// est valide, sinon les défauts du fichier. Toujours [ [mots…], … ].
function groupesSynonymesEffectifs()
{
  const persos = cv?.synonymes;
  if (Array.isArray(persos) && persos.length > 0)
  {
    const propres = persos
      .filter((g) => Array.isArray(g))
      .map((g) => g.map(String).map((m) => m.trim().toLowerCase()).filter(Boolean))
      .filter((g) => g.length > 0);
    if (propres.length > 0) return propres;
  }
  return GROUPES_SYNONYMES;
}

// Liste MODIFIABLE : au premier appel éditorial, copie les défauts
// dans cv.synonymes (première modif = bascule vers la copie perso).
function listesSynonymesModifiables()
{
  if (!Array.isArray(cv.synonymes) || cv.synonymes.length === 0)
    cv.synonymes = GROUPES_SYNONYMES.map((g) => [...g]);
  return cv.synonymes;
}

// Crée un groupe depuis une saisie « mots séparés par des virgules »
// (au moins 2 mots, doublons retirés, groupe déjà existant ignoré).
function ajouterGroupeSynonymes(saisie)
{
  const mots = [...new Set(String(saisie).split(",").map((m) => m.trim().toLowerCase()).filter(Boolean))];
  if (mots.length < 2) return false;
  const listes = listesSynonymesModifiables();
  if (listes.some((g) => mots.every((m) => g.includes(m)))) return false;
  listes.push(mots);
  return true;
}

// Retire le groupe n° i (0 = premier de la liste affichée).
function retirerGroupeSynonymes(i)
{
  const listes = cv.synonymes;
  if (!Array.isArray(listes) || i < 0 || i >= listes.length) return false;
  listes.splice(i, 1);
  return true;
}

// Ajoute un mot au groupe n° i (minuscule, aucun doublon).
function ajouterMotSynonyme(i, mot)
{
  const propre = String(mot).trim().toLowerCase();
  if (!propre) return false;
  const listes = listesSynonymesModifiables();
  if (i < 0 || i >= listes.length || listes[i].includes(propre)) return false;
  listes[i].push(propre);
  return true;
}

// Retire un mot du groupe n° i. Un groupe réduit à 1 mot reste tel
// quel : il ne matche plus rien d'autre, et c'est visible dans l'UI.
function retirerMotSynonyme(i, mot)
{
  const listes = cv.synonymes;
  if (!Array.isArray(listes) || i < 0 || i >= listes.length) return false;
  listes[i] = listes[i].filter((m) => m !== mot);
  return true;
}

// « ↺ Défauts » : supprime la clé — les groupes du fichier
// reprennent la main (y compris ceux ajoutés au fichier depuis).
function reinitialiserSynonymes()
{
  delete cv.synonymes;
}