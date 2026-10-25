"use strict";

// ============================================================
// cv-events.js — Câblage des événements de l'interface
// Expose : (aucun — attache les listeners)
// Dépend de : save, DEFAULT_CV ($ de cv-utils.js),
//             addCvItem, updateCvField, removeCvItem (cv-actions.js),
//             renderAll, switchTab (cv-panel.js)
// ============================================================
const onFieldChange = (e) =>
{
  if (!updateCvField(e.target)) return;
  save();
  renderPreview();
};

// "input" pour les champs texte/sliders, "change" pour les <select>
document.addEventListener("input", onFieldChange);
document.addEventListener("change", onFieldChange);

// Clics (tabs, swatches, ajouts, suppressions)
document.addEventListener("click", (e) => 
{
  const t = e.target;

  if (t.classList.contains("tab")) 
  {
    switchTab(t.dataset.tab);
    return;
  }
  if (t.classList.contains("swatch"))
  {
    accent = t.dataset.accent;
    document.documentElement.style.setProperty("--accent", accent);
    document.querySelectorAll(".swatch").forEach((s) => s.classList.toggle("active", s === t));
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
      cv = { ...structuredClone(DEFAULT_CV), ...JSON.parse(String(reader.result)) };
      save(); renderAll();
    } 
    catch { alert("Fichier JSON invalide"); }
  };
  reader.readAsText(file);
  e.target.value = "";
});