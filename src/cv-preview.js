"use strict";

// ============================================================
// cv-preview.js — Rendu de l'aperçu du CV (template ATS)
// Expose : renderPreview
// Dépend de : cv ($, esc de cv-utils.js)
// ============================================================
function renderPreview() 
{
  const c = cv;

  // ===== Application de la customisation au rendu du CV =====
  const page = $("#cv-preview");
  page.style.setProperty("--cv-ink", c.customisation?.couleurprincipale || "#000000");
  page.style.setProperty("--cv-ink-strong", c.customisation?.couleursecondaire || "#000000");
  page.style.setProperty("--accent", c.customisation?.couleursecondaire || "#000000");
  page.style.setProperty("--cv-size", (parseFloat(c.customisation?.taille) || 12) + "px");
  page.style.setProperty("--cv-font", c.customisation?.police || "Arial, Helvetica, sans-serif");

  const contacts = `<div class="cv-contact"><strong>Tel : </strong>${esc(c.tel) || "06 ..."}</div>
                    <div class="cv-contact"><strong>Mail : </strong>${esc(c.email) || "mail@example.com"}</div>`
  
  const links = c.otherlinks.map((l) => `<div class="cv-Link-line"><strong>${esc(l.libelle)} : </strong><a href="${esc(l.url)}" target="_blank">${esc(l.url)}</a>`).join(" · ");
  
  const skills = c.competences.map((s) => `<div class="cv-skill-line"><strong>${esc(s.intitule)} : </strong>${esc(s.valeur)}</div>`).join("");

  const softsk = c.softskill.map((s) => `
    <div class="cv-job">
      <div class="cv-job-head">
        <div class="cv-SoftSkill-libelle"><strong>${esc(s.libelle) || "Libellé"} : </strong>${esc(s.desc)|| "Description"}</div>
      </div>
    </div>`).join("");

  const exps = c.experiences.map((e) => `
    <div class="cv-job">
      <div class="cv-job-head">
        <div class="cv-job-title">${esc(e.poste) || "Poste"} — <span class="company">${esc(e.entreprise)}</span></div>
        <div class="cv-job-dates">${esc(e.debut)}${e.fin ? " – " + esc(e.fin) : " – aujourd'hui"}${e.lieu ? " · " + esc(e.lieu) : ""}</div>
      </div>
      <ul>${e.missions.filter(Boolean).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
    </div>`).join("");

  const formations = c.formations.map((f) => `
    <div class="cv-edu">
      <div><strong>${esc(f.intitule)}</strong>${f.lieu ? " — " + esc(f.lieu) : ""}</div>
      <div>${esc(f.annee)}</div>
    </div>`).join("");

    const autreinfo = c.autresinformations.map((ai) => `
    <div class="cv-section-title">${esc(ai.libelle)}</div>
    <div class="cv-other-info">
      <div>${ai.informations.filter(Boolean).map((i) => `${esc(i)}`).join(" - ")}</div>
    </div>`).join("");

  $("#cv-preview").innerHTML = `
    <div class="cv-header">
      <h1>${esc(c.nom) || "Votre nom"}</h1>
      <div class="cv-title">${esc(c.titre) || "Votre titre"}</div>
      <div class="cv-contact">${contacts}</div>
      <div class="cv-contact">${links}</div>
    </div>
    ${c.accroche ? `<div class="cv-section-title">Profil</div><div class="cv-accroche">${esc(c.accroche)}</div>` : ""}
    ${skills ? `<div class="cv-section-title">Compétences</div>${skills}` : ""}
    ${softsk ? `<div class="cv-section-title">Compétences transversales</div>${softsk}` : ""}
    ${exps ? `<div class="cv-section-title">Expériences professionnelles</div>${exps}` : ""}
    ${formations ? `<div class="cv-section-title">Formation</div>${formations}` : ""}
    ${autreinfo ? `${autreinfo}` : ""}
  `;
}