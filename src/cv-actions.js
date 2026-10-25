"use strict";

// ============================================================
// cv-actions.js — Actions sur les données du CV (JSON)
// Expose : addCvItem, updateCvField, removeCvItem
// Dépend de : cv, jd, accent (renderJdResults de cv-panel.js)
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

// MODIFICATION — écrit la valeur d'un champ dans le JSON du CV
function updateCvField(t)
{
  // Cas particulier : la JD ne modifie pas le CV (pas de save nécessaire)
  if (t.id === "jd-input")
  {
    jd = t.value;
    renderJdResults();
    return false;
  }

  if (t.dataset.bind)
  {
    if (t.dataset.bind.startsWith("customisation."))
    {
      const key = t.dataset.bind.split(".")[1];
      cv.customisation[key] = t.value;

      // Application immédiate de l'accent sur toute l'interface
      if (key === "accent")
      {
        accent = t.value;
        document.querySelectorAll(".swatch").forEach((s) => s.classList.toggle("active", s.dataset.couleursecondaire === accent));
      }

      if (key === "taille")
      {
        const lbl = document.getElementById("taille-val");
        if (lbl) lbl.textContent = t.value + " px";
      }
    }
    else
    {
      cv[t.dataset.bind] = t.value;
    }
  }
  else if (t.dataset.otherlinks !== undefined) 
  {
    cv.otherlinks[+t.dataset.otherlinks][t.dataset.key] = t.value;
  }
  else if (t.dataset.bindComp) 
  {
    cv.competences[t.dataset.bindComp] = t.value;
  } 
  else if (t.dataset.exp !== undefined && t.dataset.key) 
  {
    const i = +t.dataset.exp;
    const key = t.dataset.key;
    cv.experiences[i][key] = key === "missions" ? t.value.split("\n") : t.value;
  } 
  else if (t.dataset.edu !== undefined && t.dataset.key) 
  {
    cv.formations[+t.dataset.edu][t.dataset.key] = t.value;
  }
  else if (t.dataset.comp !== undefined) 
  {
    cv.competences[+t.dataset.comp][t.dataset.key] = t.value;
  }
  else if (t.dataset.softskill !== undefined) 
  {
    cv.softskill[+t.dataset.softskill][t.dataset.key] = t.value;
  }
  else if (t.dataset.autresinformations !== undefined && t.dataset.key)
  {
    const i = +t.dataset.autresinformations;
    const key = t.dataset.key;
    cv.autresinformations[i][key] = key === "informations" ? t.value.split("\n") : t.value;
  }
  else
  {
    return false; // champ non reconnu
  }

  return true; // le CV a changé
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