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
  page.style.setProperty("--cv-principale", c.customisation?.couleurprincipale || "#000000");
  page.style.setProperty("--cv-secondaire", c.customisation?.couleursecondaire || "#000000");
  page.style.setProperty("--cv-tertiaire",  c.customisation?.couleurtertiaire  || "#000000");
  page.style.setProperty("--cv-ink", c.customisation?.couleurtertiaire || "#000000");
  page.style.setProperty("--cv-size", (parseFloat(c.customisation?.taille) || 12) + "px");
  page.style.setProperty("--cv-font", c.customisation?.police || "Arial, Helvetica, sans-serif");

  const template = parseInt(c.customisation?.Template) || 0;

  switch (template)
  {
    case 0:
      PreviewClassiqueCV(c);
      break;
    case 1:
      PreviewModerneCV(c);
      break;
    case 2:
      PreviewMinimalisteCV(c);
      break;

    default:
      // Templates 1 à 5 pas encore implémentés : on évite une page vide
      // ou cassée en revenant au template Classique (le select garde
      // le choix de l'utilisateur, la valeur est mémorisée dans le JSON).
      PreviewClassiqueCV(c);
      break;
  }
    // Ajouter d'autres cas pour les autres templates
}

function PreviewClassiqueCV(_CV)
{
  const page = $("#cv-preview");

  const contacts = `
                    <div class="cv-contact"><strong>Adresse : </strong><br>${esc(_CV.adresse.ligne1) || ""}${esc(_CV.adresse.ligne2) ? `<br>${esc(_CV.adresse.ligne2)}` : ""}</div>
                    <div class="cv-contact">${esc(_CV.adresse.codePostal)+" " || ""}${esc(_CV.adresse.ville)+" " || ""} ${esc(_CV.adresse.pays)+" " || ""}</div>
                    <div class="cv-contact"><strong>Tel : </strong>${esc(_CV.tel) || "06 ..."}</div>
                    <div class="cv-contact"><strong>Mail : </strong>${esc(_CV.email) || "mail@example.com"}</div>`

  // Liens : en <span> (inline) pour que les séparateurs "·" s'affichent
  // correctement ; les liens entièrement vides sont ignorés.
  const links = _CV.otherlinks
    .filter((l) => (l.libelle || "").trim() || (l.url || "").trim())
    .map((l) => `<span class="cv-Link-line"><strong>${esc(l.libelle)} : </strong><a href="${esc(l.url)}" target="_blank">${esc(l.url)}</a></span>`)
    .join(" · ");

  const skills = _CV.competences.map((s) => `<div class="cv-skill-line"><strong>${esc(s.intitule)} : </strong>${esc(s.valeur)}</div>`).join("");

  // Soft-skills : un élément vide ne s'affiche plus du tout ;
  // si un seul des deux champs est rempli, pas de " : " orphelin.
  const softsk = _CV.softskill
    .filter((s) => (s.libelle || "").trim() || (s.desc || "").trim())
    .map((s) => `
    <div class="cv-job">
      <div class="cv-job-head">
        <div class="cv-SoftSkill-libelle"><strong>${esc(s.libelle)}${s.libelle && s.desc ? " : " : ""}</strong>${esc(s.desc)}</div>
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
      ${links ? `<div class="cv-contact">${links}</div>` : ""}
    </div>
    ${_CV.accroche ? `<div class="cv-section-title">Profil</div><div class="cv-accroche">${esc(_CV.accroche)}</div>` : ""}
    ${skills ? `<div class="cv-section-title">Compétences</div>${skills}` : ""}
    ${softsk ? `<div class="cv-section-title">Compétences transversales</div>${softsk}` : ""}
    ${exps ? `<div class="cv-section-title">Expériences professionnelles</div>${exps}` : ""}
    ${formations ? `<div class="cv-section-title">Formation</div>${formations}` : ""}
    ${autreinfo ? `${autreinfo}` : ""}
  `;
}

// ------------------------------------------------------------
// TEMPLATE 1 — « Moderne » : bandeau coloré en tête, sections
// soulignées par une barre latérale, compétences à intitulé gras.
// ------------------------------------------------------------
function PreviewModerneCV(_CV)
{
  const page = $("#cv-preview");

  // Ligne d'adresse
  const adr = _CV.adresse;
  const adrLines = [adr.ligne1, adr.ligne2, [adr.codePostal, adr.ville, adr.pays].filter(Boolean).join(" ")]
    .map((s) => (s || "").trim()).filter(Boolean);

  // Liens (Portfolio, LinkedIn, GitHub...) — inline, séparés par « · »
  const links = _CV.otherlinks
    .filter((l) => (l.libelle || "").trim() || (l.url || "").trim())
    .map((l) => `<a href="${esc(l.url)}" target="_blank">${esc(l.libelle)} : ${esc(l.url)}</a>`)
    .join(" · ");

  const contactLines = [
    adrLines.join(" — "),
    [esc(_CV.tel), esc(_CV.email)].filter(Boolean).join(" — "),
    links
  ].filter(Boolean);

  const accroche = (acc) => acc && acc.trim()
    ? `<h2 class="tm-h2">Profil</h2><p class="tm-p">${esc(acc)}</p>` : "";

  // Expériences : « Poste — Entreprise » + dates · lieu
  const exps = _CV.experiences.map((e) => `
    <h3 class="tm-h3">${esc(e.poste) || "Poste"}${e.entreprise ? " — " + esc(e.entreprise) : ""}</h3>
    <p class="tm-job-meta">${esc(e.debut)}${e.fin ? " – " + esc(e.fin) : " – aujourd'hui"}${e.lieu ? " · " + esc(e.lieu) : ""}</p>
    ${e.missions.filter(Boolean).length ? `<ul class="tm-ul">${e.missions.filter(Boolean).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
  `).join("");

  // Compétences : intitulé en gras aligné, comme ta maquette
  const skills = _CV.competences
    .filter((s) => (s.intitule || "").trim() || (s.valeur || "").trim())
    .map((s) => `<p class="tm-skills"><b>${esc(s.intitule)} :</b> ${esc(s.valeur)}</p>`)
    .join("");

  // Soft-skills (affichés seulement si remplis)
  const softsk = _CV.softskill
    .filter((s) => (s.libelle || "").trim() || (s.desc || "").trim())
    .map((s) => `<p class="tm-skills"><b>${esc(s.libelle)} :</b> ${esc(s.desc)}</p>`)
    .join("");

  const formations = _CV.formations.map((f) => `
    <h3 class="tm-h3">${esc(f.intitule)}${f.lieu ? " — " + esc(f.lieu) : ""}</h3>
    <p class="tm-job-meta">${esc(f.annee)}</p>
  `).join("");

  // Sections libres (« Centres d'intérêt », etc.) : libellé + éléments séparés par « · »
  const autres = _CV.autresinformations.map((ai) => `
    ${ai.libelle ? `<h2 class="tm-h2">${esc(ai.libelle)}</h2>` : ""}
    ${ai.informations.filter(Boolean).length ? `<p class="tm-p">${ai.informations.filter(Boolean).map((i) => esc(i)).join(" · ")}</p>` : ""}
  `).join("");

  page.innerHTML = `
    <header class="tm-header">
      <h1 class="tm-h1">${esc(_CV.nom) || "Votre nom"}</h1>
      <p class="tm-role">${esc(_CV.titre) || "Votre titre"}</p>
      <p class="tm-contact">${contactLines.join("<br>")}</p>
    </header>
    <div class="tm-body">
      ${accroche(_CV.accroche)}
      ${exps ? `<h2 class="tm-h2">Expérience professionnelle</h2>${exps}` : ""}
      ${skills ? `<h2 class="tm-h2">Compétences</h2>${skills}` : ""}
      ${softsk ? `<h2 class="tm-h2">Compétences transversales</h2>${softsk}` : ""}
      ${formations ? `<h2 class="tm-h2">Formation</h2>${formations}` : ""}
      ${autres}
    </div>
  `;
}

// ------------------------------------------------------------
// TEMPLATE 2 — « Minimaliste » : CV épuré, titres soulignés d'un
// petit filet, puces colorées, filet pleine largeur en tête.
// Couleurs : h1/h3 = --cv-principale, accents = --cv-secondaire,
// texte = --cv-ink (convention commune à tous les templates).
// ------------------------------------------------------------
function PreviewMinimalisteCV(_CV)
{
  const page = $("#cv-preview");

  // Filet supérieur pleine largeur : posé sur la page elle-même pour
  // déborder du padding. renderPreview() le remet à zéro avant le
  // switch (voir point 2) — les autres templates n'en veulent pas.
  page.style.borderTop = "6px solid var(--cv-secondaire, #0f766e)";

  // Police par défaut propre à ce template (surchargeable via le select)
  page.style.setProperty("--cv-font", _CV.customisation?.police || '"Helvetica Neue", Arial, sans-serif');

  const adr = _CV.adresse;
  const adrLines = [adr.ligne1, adr.ligne2, [adr.codePostal, adr.ville, adr.pays].filter(Boolean).join(" ")]
    .map((s) => (s || "").trim()).filter(Boolean);

  // Liens (Portfolio, LinkedIn, GitHub...) — inline, séparés par « · »
  const links = _CV.otherlinks
    .filter((l) => (l.libelle || "").trim() || (l.url || "").trim())
    .map((l) => `<a href="${esc(l.url)}" target="_blank">${esc(l.libelle)} : ${esc(l.url)}</a>`)
    .join(" · ");

  const contactLines = [
    adrLines.join(" — "),
    [esc(_CV.tel), esc(_CV.email)].filter(Boolean).join(" — "),
    links
  ].filter(Boolean);

  // Expériences : « Poste — Entreprise » + dates · lieu
  const exps = _CV.experiences.map((e) => `
    <h3 class="mn-h3">${esc(e.poste) || "Poste"}${e.entreprise ? " — " + esc(e.entreprise) : ""}</h3>
    <p class="mn-job-meta">${esc(e.debut)}${e.fin ? " – " + esc(e.fin) : " – aujourd'hui"}${e.lieu ? " · " + esc(e.lieu) : ""}</p>
    ${e.missions.filter(Boolean).length ? `<ul class="mn-ul">${e.missions.filter(Boolean).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
  `).join("");

  // Compétences : intitulé en gras aligné (comme la maquette)
  const skills = _CV.competences
    .filter((s) => (s.intitule || "").trim() || (s.valeur || "").trim())
    .map((s) => `<p class="mn-skills"><b>${esc(s.intitule)} :</b> ${esc(s.valeur)}</p>`)
    .join("");

  // Soft-skills (affichés seulement si remplis)
  const softsk = _CV.softskill
    .filter((s) => (s.libelle || "").trim() || (s.desc || "").trim())
    .map((s) => `<p class="mn-skills"><b>${esc(s.libelle)} :</b> ${esc(s.desc)}</p>`)
    .join("");

  const formations = _CV.formations.map((f) => `
    <h3 class="mn-h3">${esc(f.intitule)}${f.lieu ? " — " + esc(f.lieu) : ""}</h3>
    <p class="mn-job-meta">${esc(f.annee)}</p>
  `).join("");

  // Sections libres (« Centres d'intérêt », etc.)
  const autres = _CV.autresinformations.map((ai) => `
    ${ai.libelle ? `<h2 class="mn-h2">${esc(ai.libelle)}</h2>` : ""}
    ${ai.informations.filter(Boolean).length ? `<p class="mn-p">${ai.informations.filter(Boolean).map((i) => esc(i)).join(" · ")}</p>` : ""}
  `).join("");

  page.innerHTML = `
    <h1 class="mn-h1">${esc(_CV.nom) || "Votre nom"}</h1>
    <p class="mn-role">${esc(_CV.titre) || "Votre titre"}</p>
    <p class="mn-contact">${contactLines.join("<br>")}</p>
    ${_CV.accroche?.trim() ? `<h2 class="mn-h2">Profil</h2><p class="mn-p">${esc(_CV.accroche)}</p>` : ""}
    ${exps ? `<h2 class="mn-h2">Expérience professionnelle</h2>${exps}` : ""}
    ${skills ? `<h2 class="mn-h2">Compétences</h2>${skills}` : ""}
    ${softsk ? `<h2 class="mn-h2">Compétences transversales</h2>${softsk}` : ""}
    ${formations ? `<h2 class="mn-h2">Formation</h2>${formations}` : ""}
    ${autres}
  `;
}