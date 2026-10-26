"use strict";

// ============================================================
// cv-model.js — Modèle de données & état global
// Expose : STORAGE_KEY, DEFAULT_CV, CV_FONTS, save(),
//          cv, jd, currentTab
// ============================================================
const STORAGE_KEY = "cv-editor-standalone-v1";

const DEFAULT_CV = 
{
  nom: "Gérard Bouchard",
  photo : "",
  photodetails : 
  {
    photoAncre : 0,
    photoForme : 0,
    photoCadre : 0,
  },
  titre: "",
  accroche: "",
  adresse:
  {
    ligne1: "",
    ligne2: "",
    codePostal: "",
    ville: "",
    pays: ""
  },
  email: "",
  tel: "",
  otherlinks : 
  [
    
  ],
  experiences: 
  [
    
  ],
  softskill:
  [
    
  ],
  formations: 
  [
    
  ],
  competences: 
  [
    
  ],
  autresinformations: 
  [
    
  ],
  customisation :
  {
    Template : 0,
    police : 0,
    taille : 12,
    couleurprincipale : "#000000",
    couleursecondaire : "#000000",
    couleurtertiaire : "#000000"
  }
  
};

const CV_FONTS =
[
  { label: "Arial",          stack: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica",     stack: "Helvetica, Arial, sans-serif" },
  { label: "Calibri",       stack: "Calibri, Arial, sans-serif" },
  { label: "Verdana",       stack: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma",        stack: "Tahoma, Verdana, sans-serif" },
  { label: "Georgia",       stack: "Georgia, serif" },
  { label: "Times New Roman", stack: "\"Times New Roman\", Times, serif" }
];

const CV_TEMPLATES =
[
  { label: "Classique sobre",                 index: 0 },
  { label: "Moderne",                         index: 1 },
  { label: "Timeline minimaliste",            index: 2 },
  { label: "Élégant serif",                   index: 3 },
  { label: "Suisse grandes majuscules",       index: 4 },
  { label: "Compétences en tête style épuré", index: 5 }
];

// Options de personnalisation de la photo (index 0 = "selon le template")
const CV_PHOTO_ANCRES =
[
  { value: 0, label: "Selon le template" },
  { value: 1, label: "À droite" },
  { value: 2, label: "À gauche" },
  { value: 3, label: "Centrée au-dessus du nom" }
];

const CV_PHOTO_FORMES =
[
  { value: 0, label: "Selon le template" },
  { value: 1, label: "Rectangle" },
  { value: 2, label: "Arrondie" },
  { value: 3, label: "Ovale" }
];

const CV_PHOTO_CADRES =
[
  { value: 0, label: "Selon le template" },
  { value: 1, label: "Aucun liseré" },
  { value: 2, label: "Filet discret" },
  { value: 3, label: "Couleur principale" },
  { value: 4, label: "Blanc (bandeau Moderne)" }
];

// Fusion profonde : complète un objet (partiel) avec les valeurs par défaut,
// clé par clé, à toutes les profondeurs. Les tableaux ne fusionnent PAS :
// on prend ceux de l'objet entrant tels quels (ce sont des données utilisateur).
function deepMerge(base, incoming)
{
  const out = structuredClone(base);
  for (const key in incoming)
  {
    const b = out[key];
    const i = incoming[key];
    const bothPlain = b && i
      && typeof b === "object" && typeof i === "object"
      && !Array.isArray(b) && !Array.isArray(i);
    out[key] = bothPlain ? deepMerge(b, i) : i;
  }
  return out;
}

// Chargement (localStorage) ou défaut
let cv;
try 
{
  const raw = localStorage.getItem(STORAGE_KEY);
  cv = raw ? deepMerge(DEFAULT_CV, JSON.parse(raw)) : structuredClone(DEFAULT_CV);
} 
catch { cv = structuredClone(DEFAULT_CV); }

let jd = "";            // job description collée
let currentTab = "profil";

// Persistance de l'état courant
// try/catch : avec une photo, le quota localStorage (~5 Mo) peut être
// dépassé — sans lui, l'exception casserait chaque handler d'input.
function save()
{
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cv)); }
  catch (e) { alert("Sauvegarde impossible : stockage local plein ?\nEnvisagez d'exporter votre CV en JSON."); }
}

// Normalise customisation.police vers un index valide de CV_FONTS.
// Migration : les anciennes données stockaient le stack CSS complet
// (ex. "Arial, Helvetica, sans-serif") ou "12pt" par accident.
function normalizePolice()
{
  const p = cv.customisation?.police;
  const i = parseInt(p, 10);
  if (String(p) === String(i) && i >= 0 && i < CV_FONTS.length)
  {
    cv.customisation.police = i;
    return;
  }
  // Ancien format : on retrouve l'index par le stack
  const idx = CV_FONTS.findIndex((f) => f.stack === p || f.label === p);
  cv.customisation.police = idx >= 0 ? idx : 0;
}

// Renvoie le stack CSS correspondant à l'index police du CV.
function cvFontStack()
{
  const i = cv.customisation?.police;
  return CV_FONTS[i]?.stack || CV_FONTS[0].stack;
}

normalizePolice(); // appelé à chaque chargement (localStorage ou défaut)