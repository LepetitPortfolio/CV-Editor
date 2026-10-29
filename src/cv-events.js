"use strict";

// ============================================================
// cv-events.js (v5) — Câblage des événements de l'interface
// Expose : (aucun — attache les listeners)
// Dépend de : save, DEFAULT_CV ($ de cv-utils.js),
//             addCvItem, updateCvField, removeCvItem (cv-actions.js),
//             moveCvItem, moveSection, ordreSectionsEffectif (cv-actions.js / cv-model.js),
//             renderAll, switchTab (cv-panel.js),
//             resizePhoto (cv-model.js)
// ============================================================
const onFieldChange = (e) =>
{
  const t = e.target;

  // Anti-double événement : les <select> émettent "input" PUIS "change"
  // pour une seule interaction ; les <input type="color"> émettent plein
  // d'"input" pendant le choix puis un "change" final redondant.
  if (e.type === "input" && t.tagName === "SELECT") return;
  if (e.type === "change" && t.type === "color") return;
  // Les checkboxes émettent "input" PUIS "change" pour un clic :
  // on ne traite que "change" (anti-double, comme les <select>).
  if (e.type === "input" && t.type === "checkbox") return;

  if (!updateCvField(t)) return;

  // Libellé « N px » du slider : mise à jour directe du DOM, SANS re-render
  // du panneau (renderPanel reconstruirait le <input type="range"> et
  // interromprait le glissement).
  if (t.dataset.bind === "customisation.taille")
  {
    const label = $("#taille-val");
    if (label) label.textContent = `${parseFloat(t.value) || 12} px`;
  }

  // Libellé « auto / N px » du slider photo (même logique, sans re-render)
  if (t.dataset.bind === "customisation.photoTaille")
  {
    const label = $("#photo-taille-val");
    const v = parseFloat(t.value) || 0;
    if (label) label.textContent = v > 0 ? `${v} px` : "auto";
  }

  save();
  renderPreview();
};

// "input" pour les champs texte/sliders, "change" pour les <select>
document.addEventListener("input", onFieldChange);
document.addEventListener("change", onFieldChange);

// Clics (tabs, ajouts, suppressions)
document.addEventListener("click", (e) => 
{
  const t = e.target;

  if (t.classList.contains("tab")) 
  {
    switchTab(t.dataset.tab);
    return;
  }

  // Ajout de données
  if (t.id && t.id.startsWith("btn-add-"))
  {
    if (addCvItem(t.id)) { save(); renderAll(); }
    return;
  }

  // Suppression de données
  if (t.id && t.id.startsWith("btn-remove-") && t.dataset.remove !== undefined)
  {
    if (removeCvItem(t.id, +t.dataset.remove)) { save(); renderAll(); }
    return;
  }

  // Réordonnancement : boutons ↑/↓ des entrées et des rubriques.
  // data-index absent (rubriques) → l'index courant se calcule via
  // ordreSectionsEffectif() ; moveSection() écrit l'ordre normalisé.
  if (t.classList.contains("move-btn"))
  {
    if (t.dataset.moveItem !== undefined)
    {
      const from = +t.dataset.index;
      if (moveCvItem(t.dataset.moveItem, from, from + (+t.dataset.dir))) { save(); renderAll(); }
    }
    else if (t.dataset.moveSection)
    {
      const key = t.dataset.moveSection;
      const to = ordreSectionsEffectif().indexOf(key) + (+t.dataset.dir);
      if (moveSection(key, to)) { save(); renderAll(); }
    }
    return;
  }

  // Photo de profil (les boutons sont recréés par renderPanel → délégation)
  if (t.id === "btn-photo-add") 
  { 
    $("#photo-input")?.click(); 
    return; 
  }
    if (t.id === "btn-photo-remove") 
    { cv.photo = ""; 
      save(); 
      renderAll(); 
      return; 
    }

  // Onglet Expériences : tri anti-chronologique (le calibrage
  // réordonne par pertinence ; ce bouton rétablit la convention
  // recruteur/ATS : plus récente en premier).
  if (t.id === "btn-trier-dates")
  {
    if (trierExperiencesChrono()) 
    { 
      save(); 
      renderAll(); 
    }
    return;
  }

  // Analyse d'offre : l'analyse se lance au clic (pas à la frappe).
  // "Analyser" lit le textarea et affiche les chips (updateJd dans
  // cv-actions.js : jd = valeur, renderJdResults, pas de save).
  if (t.id === "btn-analyser")
  {
    const ta = $("#jd-input");
    if (ta) updateJd(ta);
    return;
  }
  if (t.id === "btn-calibrer")
  {
    if (calibrerCv()) { save(); renderAll(); }
    return;
  }
  if (t.id === "btn-annuler-calibrer")
  {
    if (annulerCalibrage()) { save(); renderAll(); }
    return;
  }
    // Onglet Expériences : tri anti-chronologique (le calibrage
  // réordonne par pertinence ; ce bouton rétablit la convention
  // recruteur/ATS : plus récente en premier).
  if (t.id === "btn-trier-dates")
  {
    if (trierExperiencesChrono()) 
    { 
      save(); 
      renderAll(); 
    }
    return;
  }
});

// Export / Import / Print / Reset
$("#btn-reset").addEventListener("click", () => 
{
  if (confirm("Recommencer de zéro ?\n\nToutes les données de votre CV seront effacées (expériences, compétences, formations…).\nCette action est irréversible.")) 
  {
    cv = structuredClone(DEFAULT_CV);
    save();
    renderAll();
  }
});

// Export PDF : un titre de document propre AVANT window.print() —
// le PDF hérite du <title> comme métadonnées (certains ATS le lisent)
// et la boîte d'impression propose "CV - Nom - Titre.pdf" comme nom
// de fichier au lieu du titre de l'éditeur. Restauré après impression.
$("#btn-print").addEventListener("click", () =>
{
  const titreInitial = document.title;
  const nom = (cv.nom || "").trim();
  const role = (cv.titre || "").trim();
  document.title = ["CV", nom, role].filter(Boolean).join(" - ");
  window.print();
  window.addEventListener("afterprint", () => { document.title = titreInitial; }, { once: true });
});

$("#btn-export-json").addEventListener("click", () => 
{
  const blob = new Blob([JSON.stringify(cv, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mes-donnees-cv.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

$("#btn-import-json").addEventListener("click", () => $("#file-input").click());
$("#file-input").addEventListener("change", (e) => 
{
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => 
  {
    try 
    {
      cv = deepMerge(DEFAULT_CV, JSON.parse(String(reader.result)));
      normalizePolice();
      save(); 
      renderAll();
    } 
    catch { alert("Fichier JSON invalide"); }
  };
  reader.readAsText(file);
  e.target.value = "";
});

// Photo : l'input #photo-input est recréé par renderPanel → écoute
// déléguée sur document. Ce "change" remonte aussi à onFieldChange,
// mais updateCvField() l'ignore (pas de data-bind) → pas d'effet de bord.
document.addEventListener("change", (e) =>
{
  if (e.target.id !== "photo-input") return;
  const file = e.target.files?.[0];
  if (!file) return;
  resizePhoto(file, (dataUrl) =>
  {
    cv.photo = dataUrl;
    save();
    renderAll();
  });
  e.target.value = "";
});
// ============================================================
// DRAG & DROP — réordonnancement des entrées et des rubriques.
// Les poignées .reorder-handle sont les seules zones draggable
// (la carte ne l'est PAS : le drag d'un texte dans un <input> ou
// un <textarea> resterait utilisable). Le state est gardé en
// variable module car dataTransfer est illisible pendant dragover.
// ============================================================
let dragReorder = null; // { attr, section, from } ou null

document.addEventListener("dragstart", (e) =>
{
  const t = e.target;
  if (!t.classList?.contains("reorder-handle")) return;
  const host = t.closest("[data-index]");
  if (!host) return;
  dragReorder =
  {
    attr: host.dataset.card || null,              // carte d'entrée...
    section: host.dataset.section || null,       // ...ou ligne de rubrique
    from: +host.dataset.index
  };
  t.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  try { e.dataTransfer.setData("text/plain", String(dragReorder.from)); } catch {}
});

// Survol : n'autorise le drop que sur les hôtes du MÊME type
// (même collection d'entrées, ou liste des rubriques).
document.addEventListener("dragover", (e) =>
{
  if (!dragReorder) return;
  const host = e.target.closest?.("[data-index]");
  if (!host) return;
  const memeType = dragReorder.section ? host.dataset.section !== undefined : host.dataset.card === dragReorder.attr;
  if (!memeType || +host.dataset.index === dragReorder.from) return;
  e.preventDefault(); // indispensable pour autoriser le drop
  document.querySelectorAll(".drop-target").forEach((el) => el.classList.remove("drop-target"));
  host.classList.add("drop-target");
});

document.addEventListener("drop", (e) =>
{
  if (!dragReorder) return;
  const host = e.target.closest?.("[data-index]");
  const state = dragReorder;
  dragReorder = null;
  document.querySelectorAll(".drop-target").forEach((el) => el.classList.remove("drop-target"));
  if (!host) return;
  const memeType = state.section
    ? host.dataset.section !== undefined
    : host.dataset.card === state.attr;
  if (!memeType) return;
  e.preventDefault();
  const to = +host.dataset.index;
  if (state.section)
  {
    if (moveSection(state.section, to)) { save(); renderAll(); }
  }
  else if (moveCvItem(state.attr, state.from, to)) { save(); renderAll(); }
});

// Annulation (Échap, drop hors zone) : nettoyage
document.addEventListener("dragend", () =>
{
  dragReorder = null;
  document.querySelectorAll(".dragging").forEach((el) => el.classList.remove("dragging"));
  document.querySelectorAll(".drop-target").forEach((el) => el.classList.remove("drop-target"));
});