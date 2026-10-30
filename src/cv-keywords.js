"use strict";

// ============================================================
// cv-keywords.js — Moteur de mots-clés (JD matching)
// Expose : STOPWORDS, extractKeywords
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
  // Moteurs & tech
  ["unity", "unity3d"],
  ["unreal", "unrealengine", "ufn"],
  ["godot", "godotengine"],
  ["blueprint", "blueprints", "visualscripting"],
  ["shader", "shaders", "shading"],
  ["cpp", "c++"],
  ["git", "github"],
  ["agile", "scrum", "kanban"],
  // Pratiques dev
  ["prototype", "prototypes", "prototypage", "prototyper", "prototyping", "maquette", "maquettes"],
  ["optimisation", "optimiser", "optimize", "optimization", "performance", "performances", "performant"],
  ["debug", "debugging", "debogage", "débogage", "bug", "bugs", "bugfix"],
  ["refactoring", "refactor", "refactorer", "refactorisation"],
  // Contexte travail
  ["teletravail", "télétravail", "remote"],
  ["anglais", "english"],
  // Soft-skills fréquents dans les offres
  ["creativite", "créativite", "créativité", "creativity", "creatif", "créatif", "creative"],
  ["equipe", "équipe", "equipes", "collaboration", "collaboratif", "collaborative", "cooperation", "coopération"],
  ["autonomie", "autonome", "independant", "indépendant"],
  ["curiosite", "curiosité", "curiosity", "curieux"],
  ["rigueur", "rigoureux"],
  ["mathematiques", "mathématiques", "maths", "math"]
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