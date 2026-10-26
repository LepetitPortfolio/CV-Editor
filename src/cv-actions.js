"use strict";

// ============================================================
// cv-actions.js — Actions sur les données du CV (JSON)
// Expose : addCvItem, updateCvField, removeCvItem
// Dépend de : cv, jd (renderJdResults de cv-panel.js)
// ============================================================

// AJOUT — crée un nouvel élément dans le JSON du CV
const ADD_ACTIONS =
{
  "btn-add-exp":       () => cv.experiences.push({ poste: "", entreprise: "", lieu: "", debut: "", fin: "", missions: [""] }),
  "btn-add-link":      () => cv.otherlinks.push({ libelle: "", url: "" }),
  "btn-add-edu":       () => cv.formations.push({ intitule: "", lieu: "", annee: "" }),
  "btn-add-comp":      () => cv.competences.push({ intitule: "", valeur: "" }),
  "btn-add-softskill": () => cv.softskill.push({ libelle: "", desc: "" }),
  "btn-add-autresinformations": () => cv.autresinformations.push({ libelle: "", informations: [""] })
};

function addCvItem(btnId)
{
  const action = ADD_ACTIONS[btnId];
  if (!action) return false;
  action();
  return true;
}

// ============================================================
// MODIFICATION
// updateCvField est un simple répartiteur : il identifie la cible
// (JD, data-bind, item de liste) puis délègue à une sous-fonction
// qui ne connaît qu'UNE seule partie du modèle.
// ============================================================

// Cibles « items de liste » : attribut data-* -> collection du CV
// + clés multi-lignes (valeur splittée sur les retours à la ligne).
const LIST_TARGETS =
{
  otherlinks:         { get: () => cv.otherlinks },
  exp:                { get: () => cv.experiences,       multiline: ["missions"] },
  edu:                { get: () => cv.formations },
  comp:               { get: () => cv.competences },
  softskill:          { get: () => cv.softskill },
  autresinformations: { get: () => cv.autresinformations, multiline: ["informations"] }
};

// Champs de customisation stockés en nombre (et non en string).
const CUSTOMISATION_NUMERIC = ["Template", "police", "photoAncre", "photoForme", "photoCadre"];

// --- JD (offre collée) : ne modifie pas le CV, pas de save nécessaire ---
function updateJd(t)
{
  jd = t.value;
  renderJdResults();
}

// --- Champs simples à la racine du CV (nom, titre, accroche, email, tel) ---
function writeCvRoot(bind, value)
{
  cv[bind] = value;
}

// --- Onglet Personnalisation : data-bind="customisation.<clé>" ---
function writeCustomisation(bind, value)
{
  const key = bind.split(".")[1];
  cv.customisation[key] = CUSTOMISATION_NUMERIC.includes(key)
    ? parseInt(value, 10)
    : value;
}

// --- Onglet Profil : data-bind="adresse.<clé>" ---
function writeAdresse(bind, value)
{
  const key = bind.split(".")[1];
  cv.adresse[key] = value;
}

// --- Items de listes : data-<collection>="<index>" data-key="<clé>" ---
// Renvoie false si aucun attribut connu n'est présent (champ non reconnu).
function writeListItem(t, value)
{
  for (const attr in LIST_TARGETS)
  {
    const index = t.dataset[attr];
    if (index === undefined || !t.dataset.key) continue;

    const target = LIST_TARGETS[attr];
    const item = target.get()[+index];
    const key = t.dataset.key;
    item[key] = target.multiline && target.multiline.includes(key) ? value.split("\n") : value;
    return true;
  }
  return false;
}

// --- Répartiteur : renvoie true si le CV a changé (save nécessaire) ---
function updateCvField(t)
{
  // Cas particulier : la JD ne modifie pas le CV
  if (t.id === "jd-input")
  {
    updateJd(t);
    return false;
  }

  if (t.dataset.bind)
  {
    const bind = t.dataset.bind;

    // IMPORTANT : un data-bind écrit dans UNE seule cible (chaînage
    // if/return, pas de retombée) — évite la clé parasite historique
    // "customisation.police" écrite à la racine du JSON.
    if (bind.startsWith("customisation."))
    {
      writeCustomisation(bind, t.value);
      return true;
    }
    if (bind.startsWith("adresse."))
    {
      writeAdresse(bind, t.value);
      return true;
    }

    writeCvRoot(bind, t.value);
    return true;
  }

  return writeListItem(t, t.value);
}

// SUPPRESSION — retire un élément du JSON du CV par son index
const REMOVE_ACTIONS =
{
  "btn-remove-link":      () => cv.otherlinks,
  "btn-remove-exp":       () => cv.experiences,
  "btn-remove-edu":       () => cv.formations,
  "btn-remove-comp":      () => cv.competences,
  "btn-remove-softskill": () => cv.softskill,
  "btn-remove-autresinformations": () => cv.autresinformations
};

function removeCvItem(btnId, index)
{
  const getCollection = REMOVE_ACTIONS[btnId];
  if (!getCollection) return false;
  getCollection().splice(index, 1);
  return true;
}