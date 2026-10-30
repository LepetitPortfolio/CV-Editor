"use strict";

// ============================================================
// cv-model.js (v5) — Modèle de données & état global
// Expose : STORAGE_KEY, DEFAULT_CV, CV_FONTS, save(),
//          cv, jd, currentTab
// ============================================================
const STORAGE_KEY = "cv-editor-standalone-v1";

// ------------------------------------------------------------
// Ordre des rubriques du CV (réordonnancement drag & drop / ↑↓).
// Ordre par défaut = ordre historique des templates. La clé
// customisation.ordreSections stocke l'ordre choisi ; absente =
// ordre par défaut (compatibilité anciens JSON). Ces clés sont les
// mêmes que celles des toggles affiche* : cohérence garantie.
// ------------------------------------------------------------
const SECTION_KEYS =
[
  "Accroche",
  "Experiences",
  "Competences",
  "Softskill",
  "Formations",
  "Autres"
];

const SECTION_LABELS =
{
  Accroche: "Profil (accroche)",
  Experiences: "Expériences",
  Competences: "Compétences",
  Softskill: "Soft-skills",
  Formations: "Formations",
  Autres: "Autres informations"
};

const DEFAULT_CV = 
{
  nom: "Gérard Bouchard",
  photo : "",
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
  rqth: false,
  otherlinks : 
  [
    
  ],
  experiences: 
  [
    
  ],
    softskill:
  [
    
  ],
  softskillSynthese: "",
  formations: 
  [
    
  ],
  competences: 
  [
    
  ],
  // Chips « Compétences clés » du template « Compétences en tête » :
  // liste LIBRE (une chip par ligne dans l'onglet Compétences).
  // Tableau vide = découpe automatique historique (virgules des
  // valeurs ci-dessus) — compatibilité anciens JSON garantie.
  competencesCles:
  [
    
  ],
  autresinformations: 
  [
    
  ],
  customisation :
  {
    Template : 0,
    photoAncre : 0,
    photoForme : 0,
    photoCadre : 0,
    photoTaille : 0,
    // Visibilité des rubriques (cases "Afficher sur le CV" des onglets).
    // Convention : clé absente = affichée (compatibilité anciens JSON).
    afficheAccroche : true,
    afficheExperiences : true,
    afficheFormations : true,
    afficheCompetences : true,
    afficheSoftskill : true,
    afficheAutres : true,
    // Ordre choisi des rubriques (voir SECTION_KEYS). Absent = défaut.
    ordreSections :
    [
      "Accroche",
      "Experiences",
      "Competences",
      "Softskill",
      "Formations",
      "Autres"
    ],
    police : 0,
    taille : 12,
    espacement : 100,
    liensParLigne : 0,
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

// ============================================================
// VALIDATION D'IMPORT (légère) — validerCv()
// Nettoie un JSON importé AVANT fusion : types inattendus (null,
// tableau là où un objet est attendu, nombre dans un champ texte…)
// → la clé fautive est IGNORÉE (deepMerge la complètera par le
// défaut), jamais recopiée. Tolérant : nombres/booléens convertis
// en texte si c'est sensé (l'année 2020 en nombre reste lisible),
// clés inconnues et absentes laissées telles quelles — un export
// plus ancien s'importe toujours sans perte.
// Renvoie { cv: objet nettoyé, anomalies: [messages] }.
// ============================================================
const SCHEMA_CHAINES = ["photo", "nom", "titre", "accroche", "email", "tel", "softskillSynthese"];
const SCHEMA_BOOLEENS = ["rqth"];
const SCHEMA_OBJETS = ["adresse"];
const SCHEMA_LISTES =
{
  otherlinks:          { chaines: ["libelle", "url"],                                  listes: [] },
  experiences:         { chaines: ["poste", "entreprise", "lieu", "debut", "fin"],    listes: ["missions"] },
  formations:          { chaines: ["intitule", "lieu", "annee"],                      listes: [] },
  competences:         { chaines: ["intitule", "valeur"],                             listes: [] },
  softskill:           { chaines: ["libelle", "desc"],                                listes: [] },
  autresinformations:  { chaines: ["libelle"],                                         listes: ["informations"] }
};
const SCHEMA_CUSTO_NUM = ["Template", "police", "taille", "espacement", "liensParLigne", "photoAncre", "photoForme", "photoCadre", "photoTaille"];
const SCHEMA_CUSTO_COULEURS = ["couleurprincipale", "couleursecondaire", "couleurtertiaire"];

// Coerce en chaîne si le type est « presque bon » (nombre, booléen),
// sinon null (= champ à ignorer).
function commeChaine(v)
{
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

// Nettoie un JSON (import ou localStorage) avant fusion : chaque clé au
// type inattendu est ignorée (le défaut la remplacera), les types
// « presque bons » convertis. Renvoie { cv: nettoyé, anomalies: [...] }.
function validerCv(data)
{
  const anomalies = [];
  if (!data || typeof data !== "object" || Array.isArray(data))
    return { cv: {}, anomalies: ["Le fichier ne contient pas un objet CV."] };

  const net = { ...data };

  SCHEMA_CHAINES.forEach((k) =>
  {
    if (net[k] === undefined) return;
    const s = commeChaine(net[k]);
    if (s === null) { delete net[k]; anomalies.push(`« ${k} » ignoré (texte attendu)`); }
    else net[k] = s;
  });

  SCHEMA_BOOLEENS.forEach((k) =>
  {
    if (net[k] !== undefined && typeof net[k] !== "boolean")
    { delete net[k]; anomalies.push(`« ${k} » ignoré (booléen attendu)`); }
  });

  SCHEMA_OBJETS.forEach((k) =>
  {
    const o = net[k];
    if (o === undefined) return;
    if (!o || typeof o !== "object" || Array.isArray(o))
    { delete net[k]; anomalies.push(`« ${k} » ignoré (objet attendu)`); return; }
    for (const f in o) { const s = commeChaine(o[f]); if (s === null) delete o[f]; else o[f] = s; }
  });

  for (const k in SCHEMA_LISTES)
  {
    const spec = SCHEMA_LISTES[k];
    if (net[k] === undefined) continue;
    if (!Array.isArray(net[k]))
    { delete net[k]; anomalies.push(`« ${k} » ignoré (liste attendue)`); continue; }
    net[k] = net[k]
      .filter((item) =>
      {
        if (!item || typeof item !== "object" || Array.isArray(item))
        { anomalies.push(`une entrée de « ${k} » ignorée (objet attendu)`); return false; }
        return true;
      })
      .map((item) =>
      {
        const propre = { ...item };
        spec.chaines.forEach((f) =>
        {
          if (propre[f] === undefined) return;
          const s = commeChaine(propre[f]);
          if (s === null) delete propre[f]; else propre[f] = s;
        });
        spec.listes.forEach((f) =>
        {
          if (propre[f] === undefined) return;
          if (!Array.isArray(propre[f]))
          { delete propre[f]; anomalies.push(`« ${f} » ignoré dans une entrée de « ${k} » (liste attendue)`); return; }
          propre[f] = propre[f].map((l) => commeChaine(l)).filter((l) => l !== null);
        });
        if (propre.affiche !== undefined && typeof propre.affiche !== "boolean")
        { delete propre.affiche; anomalies.push(`« affiche » ignoré dans une entrée de « ${k} » (booléen attendu)`); }
        return propre;
      });
  }

  // Chips « une par ligne » : liste de CHAÎNES (pas d'objets comme
  // les autres collections) — garde-fou dédié, même logique : type
  // inattendu → clé ignorée (défaut = liste vide = chips auto).
  if (net.competencesCles !== undefined)
  {
    if (!Array.isArray(net.competencesCles))
    { delete net.competencesCles; anomalies.push("« competencesCles » ignoré (liste attendue)"); }
    else
      net.competencesCles = net.competencesCles
        .map((s) => commeChaine(s))
        .filter((s) => s !== null && s.trim());
  }

  // Dictionnaire de synonymes : liste de LISTES de chaînes (les
  // groupes), COMPLÉTÉE à l'import par les groupes par défaut du
  // fichier (GROUPES_SYNONYMES, cv-keywords.js) : un groupe importé
  // qui partage au moins un mot avec un groupe par défaut absorbe
  // ses autres mots ; un groupe par défaut non représenté est
  // ajouté à la fin. Puis dédoublonnage final : chaque mot ne vit
  // que dans son PREMIER groupe (anomalie comptée à l'import).
  if (net.synonymes !== undefined)
  {
    if (!Array.isArray(net.synonymes))
    { delete net.synonymes; anomalies.push("« synonymes » ignoré (liste attendue)"); }
    else
    {
      const groupes = net.synonymes
        .filter((g) => Array.isArray(g))
        .map((g) => g.map((s) => commeChaine(s))
                     .filter((s) => s !== null && s.trim() !== "")
                     .map((s) => s.trim().toLowerCase()))
        .map((g) => [...new Set(g)])
        .filter((g) => g.length > 0);

      // Fusion avec les défauts du fichier (toujours chargé à
      // l'import : tous les scripts defer sont prêts).
      const defauts = (typeof GROUPES_SYNONYMES !== "undefined" ? GROUPES_SYNONYMES : [])
        .map((g) => g.map((m) => String(m).trim().toLowerCase()));
      const fusionnes = groupes.map((g) => [...g]);
      for (const d of defauts)
      {
        const cible = fusionnes.find((g) => d.some((m) => g.includes(m)));
        if (cible) d.forEach((m) => { if (!cible.includes(m)) cible.push(m); });
        else fusionnes.push([...d]);
      }

      // Dédoublonnage inter-groupes : un mot déjà vu (groupe
      // importé OU défaut absorbé) est retiré des groupes suivants.
      const vus = new Set();
      let doublons = 0;
      const uniques = [];
      for (const g of fusionnes)
      {
        const filtre = g.filter((m) => !vus.has(m));
        doublons += g.length - filtre.length;
        filtre.forEach((m) => vus.add(m));
        if (filtre.length > 0) uniques.push(filtre);
      }
      if (doublons > 0) anomalies.push(`« synonymes » : ${doublons} doublon(s) retiré(s)`);
      if (uniques.length > 0) net.synonymes = uniques;
      else delete net.synonymes;
    }
  }

  // customisation : clés critiques vérifiées, clés inconnues laissées
  // (deepMerge les recopie sans danger — compatibilité future).
  const c = net.customisation;
  if (c === undefined) return { cv: net, anomalies };
  if (!c || typeof c !== "object" || Array.isArray(c))
  { delete net.customisation; anomalies.push("« customisation » ignoré (objet attendu)"); return { cv: net, anomalies }; }

  SCHEMA_CUSTO_NUM.forEach((f) =>
  {
    if (c[f] === undefined || typeof c[f] === "number") return;
    const n = parseFloat(c[f]);
    if (Number.isFinite(n)) c[f] = n;
    else { delete c[f]; anomalies.push(`« customisation.${f} » ignoré (nombre attendu)`); }
  });
  for (const f in c)
    if (f.startsWith("affiche") && c[f] !== undefined && typeof c[f] !== "boolean")
    { delete c[f]; anomalies.push(`« customisation.${f} » ignoré (booléen attendu)`); }
  if (c.ordreSections !== undefined)
  {
    if (!Array.isArray(c.ordreSections)) { delete c.ordreSections; anomalies.push("« customisation.ordreSections » ignoré (liste attendue)"); }
    else c.ordreSections = c.ordreSections.filter((s) => SECTION_KEYS.includes(s));
  }
  SCHEMA_CUSTO_COULEURS.forEach((f) =>
  {
    if (c[f] === undefined) return;
    const s = commeChaine(c[f]);
    if (s === null) { delete c[f]; anomalies.push(`« customisation.${f} » ignoré (texte attendu)`); }
    else c[f] = s;
  });

  return { cv: net, anomalies };
}

// Fusion récursive : les clés manquantes de incoming sont complétées
// par celles de base, à toutes les profondeurs (les tableaux restent
// ceux de incoming). Ne mute jamais base (structuredClone à chaque
// niveau) : DEFAULT_CV reste vierge entre deux chargements.
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
  // La validation nettoie aussi les données LOCALES : un JSON
  // corrompu (édition manuelle du localStorage, ancien bug) ne
  // casse plus le chargement — les clés fautives retombent sur
  // les défauts, silencieusement (pas d'alerte au démarrage).
  cv = raw ? deepMerge(DEFAULT_CV, validerCv(JSON.parse(raw)).cv) : structuredClone(DEFAULT_CV);
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

// Ordre des rubriques effectif : l'ordre choisi (s'il existe), nettoyé
// (clés inconnues ignorées), complété par les rubriques manquantes à
// leur position par défaut — puis re-sauvegardé tel quel dans
// customisation.ordreSections au premier déplacement.
function ordreSectionsEffectif()
{
  const choisi = Array.isArray(cv.customisation?.ordreSections) ? [...new Set(cv.customisation.ordreSections.filter((k) => SECTION_KEYS.includes(k)))] : [];
  
  return choisi.concat(SECTION_KEYS.filter((k) => !choisi.includes(k)));
}

normalizePolice(); // appelé à chaque chargement (localStorage ou défaut)