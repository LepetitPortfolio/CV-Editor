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

  const template = c.customisation?.Template || 0;

  switch (parseInt(template)) 
  {
    case 0:
      PreviewClassiqueCV(c);
      break;

    default:
      $("#cv-preview").innerHTML = `
        <div class="cv-header"> 
          <h1>"Template non implémenté ou inconnu"</h1>
        </div>
      `;
      break;
  }
    // Ajouter d'autres cas pour les autres templates
}

function PreviewClassiqueCV(_CV)
{
  const page = $("#cv-preview");
  page.style.setProperty("--cv-ink", _CV.customisation?.couleurprincipale || "#000000");
  page.style.setProperty("--cv-ink-strong", _CV.customisation?.couleursecondaire || "#000000");
  page.style.setProperty("--accent", _CV.customisation?.couleursecondaire || "#000000");
  page.style.setProperty("--cv-size", (parseFloat(_CV.customisation?.taille) || 12) + "px");
  page.style.setProperty("--cv-font", _CV.customisation?.police || "Arial, Helvetica, sans-serif");

  const contacts = `
                    <div class="cv-contact"><strong>Adresse : </strong><br>${esc(_CV.adresse.ligne1) || ""}${esc(_CV.adresse.ligne2) ? `<br>${esc(_CV.adresse.ligne2)}` : ""}</div>
                    <div class="cv-contact">${esc(_CV.adresse.codePostal)+" " || ""}${esc(_CV.adresse.ville)+" " || ""} ${esc(_CV.adresse.pays)+" " || ""}</div>
                    <div class="cv-contact"><strong>Tel : </strong>${esc(_CV.tel) || "06 ..."}</div>
                    <div class="cv-contact"><strong>Mail : </strong>${esc(_CV.email) || "mail@example.com"}</div>`
  
  const links = _CV.otherlinks.map((l) => `<div class="cv-Link-line"><strong>${esc(l.libelle)} : </strong><a href="${esc(l.url)}" target="_blank">${esc(l.url)}</a>`).join(" · ");
  
  const skills = _CV.competences.map((s) => `<div class="cv-skill-line"><strong>${esc(s.intitule)} : </strong>${esc(s.valeur)}</div>`).join("");

  const softsk = _CV.softskill.map((s) => `
    <div class="cv-job">
      <div class="cv-job-head">
        <div class="cv-SoftSkill-libelle"><strong>${esc(s.libelle) || "Libellé"} : </strong>${esc(s.desc)|| "Description"}</div>
      </div>
    </div>`).join("");

  const exps = _CV.experiences.map((e) => `
    <div class="cv-job">
      <div class="cv-job-head">
        <div class="cv-job-title">${esc(e.poste) || "Poste"} — <span class="company">${esc(e.entreprise)}</span></div>
        <div class="cv-job-dates">${esc(e.debut)}${e.fin ? " – " + esc(e.fin) : " – aujourd'hui"}${e.lieu ? " · " + esc(e.lieu) : ""}</div>
      </div>
      <ul>${e.missions.filter(Boolean).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
    </div>`).join("");

  const formations = _CV.formations.map((f) => `
    <div class="cv-edu">
      <div><strong>${esc(f.intitule)}</strong>${f.lieu ? " — " + esc(f.lieu) : ""}</div>
      <div>${esc(f.annee)}</div>
    </div>`).join("");

    const autreinfo = _CV.autresinformations.map((ai) => `
    <div class="cv-section-title">${esc(ai.libelle)}</div>
    <div class="cv-other-info">
      <div>${ai.informations.filter(Boolean).map((i) => `${esc(i)}`).join(" - ")}</div>
    </div>`).join("");

  $("#cv-preview").innerHTML = `
    <div class="cv-header">
      <h1>${esc(_CV.nom) || "Votre nom"}</h1>
      <div class="cv-title">${esc(_CV.titre) || "Votre titre"}</div>
      <div class="cv-contact">${contacts}</div>
      <div class="cv-contact">${links}</div>
    </div>
    ${_CV.accroche ? `<div class="cv-section-title">Profil</div><div class="cv-accroche">${esc(_CV.accroche)}</div>` : ""}
    ${skills ? `<div class="cv-section-title">Compétences</div>${skills}` : ""}
    ${softsk ? `<div class="cv-section-title">Compétences transversales</div>${softsk}` : ""}
    ${exps ? `<div class="cv-section-title">Expériences professionnelles</div>${exps}` : ""}
    ${formations ? `<div class="cv-section-title">Formation</div>${formations}` : ""}
    ${autreinfo ? `${autreinfo}` : ""}
  `;
}