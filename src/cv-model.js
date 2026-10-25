"use strict";

// ============================================================
// cv-model.js — Modèle de données & état global
// Expose : STORAGE_KEY, DEFAULT_CV, CV_FONTS, save(),
//          cv, jd, currentTab, accent
// ============================================================
const STORAGE_KEY = "cv-editor-standalone-v1";

const DEFAULT_CV = 
{
  nom: "Gérard Bouchard",
  titre: "",
  accroche: "",
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
    police : "Arial, sans-serif",
    taille : "12pt",
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
  { label: 0,     stack: "Classique sobre" },
  { label: 1,     stack: "Moderne" },
  { label: 2,     stack: "Timeline minimaliste" },
  { label: 3,     stack: "Élégant serif" },
  { label: 4,     stack: "Suisse grandes majuscules" },
  { label: 5,     stack: "Compétences en tête style épuré" }
];

// Chargement (localStorage) ou défaut
let cv;
try 
{
  const raw = localStorage.getItem(STORAGE_KEY);
  cv = raw ? { ...structuredClone(DEFAULT_CV), ...JSON.parse(raw) } : structuredClone(DEFAULT_CV);
} 
catch { cv = structuredClone(DEFAULT_CV); }

let jd = "";            // job description collée
let currentTab = "profil";
let accent = cv.customisation.accent || "#000000";

// Persistance de l'état courant
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cv)); }