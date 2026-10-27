"use strict";

// ============================================================
// cv-events.js — Câblage des événements de l'interface
// Expose : (aucun — attache les listeners)
// Dépend de : save, DEFAULT_CV ($ de cv-utils.js),
//             addCvItem, updateCvField, removeCvItem (cv-actions.js),
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

  // Photo de profil (les boutons sont recréés par renderPanel → délégation)
  if (t.id === "btn-photo-add") { $("#photo-input")?.click(); return; }
  if (t.id === "btn-photo-remove") { cv.photo = ""; save(); renderAll(); return; }
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

$("#btn-print").addEventListener("click", () => window.print());

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