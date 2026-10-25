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
  Adresse:
  {
    Ligne1: "",
    Ligne2: "",
    CodePostal: "",
    Ville: "",
    Pays: ""
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
  { label: "Classique sobre",     stack: 0 },
  { label: "Moderne",     stack: 1 },
  { label: "Timeline minimaliste",     stack: 2 },
  { label: "Élégant serif",     stack: 3 },
  { label: "Suisse grandes majuscules",     stack: 4 },
  { label: "Compétences en tête style épuré",     stack: 5 }
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