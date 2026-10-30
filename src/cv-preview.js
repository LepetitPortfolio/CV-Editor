"use strict";

// ============================================================
// cv-preview.js (v5) — Rendu de l'aperçu du CV (template ATS)
// Expose : renderPreview
// Dépend de : cv ($, esc de cv-utils.js)
// ============================================================
// Visibilité des rubriques : renvoie true si affichée. Convention :
// clé absente ou true = affichée (les anciens JSON restent valides).
function rubriqueVisible(key)
{
  return cv.customisation?.["affiche" + key] !== false;
}

// Renvoie la collection si sa rubrique est visible, [] sinon —
// ainsi les map()/filter()/join() produisent naturellement du vide.
// En bonus : les entrées masquées individuellement (item.affiche ===
// false, case « Afficher sur le CV » de chaque carte) sont aussi
// filtrées ICI — un seul point de contrôle pour les 6 templates.
function rubrique(key, arr)
{
  return rubriqueVisible(key)
    ? arr.filter((it) => it?.affiche !== false)
    : [];
}

// Phrase de synthèse des soft-skills (onglet Soft-Skill) : affichée
// en tête de section, SEULEMENT là où la section existe déjà — elle
// est insérée dans les "sections" de chaque template au même titre
// que ${softsk}, donc jamais seule (une section sans entrée ne
// s'affiche pas : un résumé sans liste n'aurait pas de sens).
// classe = classe de paragraphe du template (taille/couleur héritées).
function syntheseSoftskill(_CV, classe)
{
  const t = (_CV.softskillSynthese || "").trim();
  return t ? `<p class="${classe}"><em>${esc(t)}</em></p>` : "";
}

// Mention RQTH (case de l'onglet Profil) : affichée dans le bloc
// contact des 6 templates. Le sigle RQTH est le terme reconnu par
// les recruteurs et les ATS français (obligation d'emploi) ;
// « travailleur handicapé » l'explicite pour les humains.
function mentionRqth(_CV)
{
  return _CV.rqth === true ? "RQTH — travailleur handicapé" : "";
}

// Reconstruit une URL partielle en URL absolue : le champ « Adresse »
// de l'onglet Profil accepte "github.com/LepetitPortfolio" comme une
// URL complète. Sans schéma, on préfixe https:// (http://, https://,
// mailto: restent inchangés) — le lien du CV est toujours cliquable.
function normaliserUrl(u)
{
  const t = String(u || "").trim();
  if (!t || /^[a-z][a-z0-9+.-]*:/i.test(t)) return t;
  return "https://" + t;
}

// Un lien supplémentaire rendu sur le CV : href = URL RECONSTRUITE,
// texte affiché = URL sans son schéma (plus sobre, reste extractible
// par les ATS), libellé en gras, « : » seulement s'il existe.
// Tout le <a> est cliquable — même la zone du libellé.
function lienSupplementaire(l)
{
  const href = normaliserUrl(l.url);
  const affiche = String(l.url || "").trim().replace(/^https?:\/\//i, "");
  const libelle = (l.libelle || "").trim();
  return `<a href="${esc(href)}" target="_blank">${libelle ? `<b>${esc(libelle)} : </b>` : ""}${esc(affiche)}</a>`;
}

// Répartit les liens sur plusieurs lignes : N liens par ligne
// (0 = tous sur une seule ligne, séparés par « · »). "<br>" entre
// les groupes, « · » à l'intérieur — fonctionne dans le bloc
// contact des 6 templates. Utile pour les URLs longues.
function joindreLiens(items, parLigne)
{
  if (!parLigne || parLigne < 1 || items.length <= parLigne) return items.join(" · ");
  const groupes = [];
  for (let i = 0; i < items.length; i += parLigne) groupes.push(items.slice(i, i + parLigne).join(" · "));
  return groupes.join("<br>");
}

// Rend les sections dans l'ordre choisi (customisation.ordreSections,
// réglé dans l'onglet Personnalisation). Chaque template construit un
// map { clé: html } (clés de SECTION_KEYS) puis délègue ici : l'ordre
// n'est donc défini qu'à UN endroit. Clé absente ou vide → rien.
function sectionsOrdonnees(map)
{
  return ordreSectionsEffectif().map((k) => map[k] || "").join("");
}

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
  // Espacement inter-sections : 100 → 1 (référence des templates),
  // 50 → 0.5 (compact), 160 → 1.6 (aéré). Absent = 100 (anciens JSON).
  page.style.setProperty("--cv-gap", ((parseFloat(c.customisation?.espacement) || 100) / 100));
  page.style.setProperty("--cv-font", cvFontStack());

  page.classList.remove("tpl-minimaliste", "tpl-serif");
  // Personnalisation photo : on retire les classes du rendu précédent
  // puis on pose celles choisies (valeur > 0). 0 = "selon le template"
  // → aucune classe → les règles par template restent maîtresses.
  page.classList.remove("photo-a1", "photo-a2", "photo-a3", "photo-f1", "photo-f2", "photo-f3", "photo-c1", "photo-c2", "photo-c3", "photo-c4", "photo-t1");
  const photoAncre = parseInt(c.customisation?.photoAncre) || 0;
  const photoForme = parseInt(c.customisation?.photoForme) || 0;
  const photoCadre = parseInt(c.customisation?.photoCadre) || 0;
  if (photoAncre > 0) page.classList.add("photo-a" + photoAncre);
  if (photoForme > 0) page.classList.add("photo-f" + photoForme);
  if (photoCadre > 0) page.classList.add("photo-c" + photoCadre);
  // Taille photo (slider) : classe + variable CSS (section 15 ter).
  // 0 = "auto" : aucune classe, la taille du template fait foi.
  const photoTaille = parseInt(c.customisation?.photoTaille) || 0;
  if (photoTaille > 0)
  {
    page.classList.add("photo-t1");
    page.style.setProperty("--cv-photo-taille", photoTaille + "px");
  }
  else page.style.removeProperty("--cv-photo-taille");

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
    case 3:
      PreviewElegantSerifCV(c);
      break;
    case 4:
      PreviewSuisseCV(c);
      break;
    case 5:
      PreviewCompetencesCV(c);
      break;

    default:
      // Index de template inconnu (données corrompues ou import exotique) :
      // on retombe sur le Classique pour éviter une page vide.
      PreviewClassiqueCV(c);
      break;
  }
    // Ajouter d'autres cas pour les autres templates
}

function PreviewClassiqueCV(_CV)
{
  const page = $("#cv-preview");

  // Photo de profil (affichée seulement si renseignée)
  const photo = _CV.photo ? `<img class="cv-photo" src="${esc(_CV.photo)}"  alt="" />` : "";

  const contacts = `
                    <div class="cv-contact"><strong>Adresse : </strong><br>${esc(_CV.adresse.ligne1) || ""}${esc(_CV.adresse.ligne2) ? `<br>${esc(_CV.adresse.ligne2)}` : ""}</div>
                    <div class="cv-contact">${[esc(_CV.adresse.codePostal), esc(_CV.adresse.ville), esc(_CV.adresse.pays)].filter(Boolean).map((s) => s.trim()).filter(Boolean).join(" ")}</div>
                    <div class="cv-contact"><strong>Tel : </strong>${esc(_CV.tel) || "06 ..."}</div>
                    <div class="cv-contact"><strong>Mail : </strong>${esc(_CV.email) || "mail@example.com"}</div>
                    ${_CV.rqth ? `<div class="cv-contact"><strong>RQTH : </strong>travailleur handicapé</div>` : ""}`

  // Liens : en <span> (inline) pour que les séparateurs "·" s'affichent
  // correctement ; les liens entièrement vides sont ignorés. Le <a>
  // vient de lienSupplementaire() : URL reconstruite, libellé en gras.
  const links = joindreLiens(
    _CV.otherlinks
      .filter((l) => l.affiche !== false && ((l.libelle || "").trim() || (l.url || "").trim()))
      .map((l) => `<span class="cv-Link-line">${lienSupplementaire(l)}</span>`),
    parseInt(_CV.customisation?.liensParLigne) || 0
  );

  const skills = rubrique("Competences", _CV.competences).map((s) => `<div class="cv-skill-line"><strong>${esc(s.intitule)} : </strong>${esc(s.valeur)}</div>`).join("");

  // Soft-skills : un élément vide ne s'affiche plus du tout ;
  // si un seul des deux champs est rempli, pas de " : " orphelin.
  const softsk = rubrique("Softskill", _CV.softskill)
    .filter((s) => (s.libelle || "").trim() || (s.desc || "").trim())
    .map((s) => `
    <div class="cv-job">
      <div class="cv-job-head">
        <div class="cv-SoftSkill-libelle"><strong>${esc(s.libelle)}${s.libelle && s.desc ? " : " : ""}</strong>${esc(s.desc)}</div>
      </div>
    </div>`).join("");

  const exps = rubrique("Experiences", _CV.experiences).map((e) => `
    <div class="cv-job">
      <div class="cv-job-head">
        <div class="cv-job-title">${esc(e.poste) || "Poste"} — <span class="company">${esc(e.entreprise)}</span></div>
        <div class="cv-job-dates">${esc(e.debut)}${e.fin ? " - " + esc(e.fin) : " - aujourd'hui"}${e.lieu ? " · " + esc(e.lieu) : ""}</div>
      </div>
      <ul>${e.missions.filter(Boolean).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
    </div>`).join("");

  const formations = rubrique("Formations", _CV.formations).map((f) => `
    <div class="cv-edu">
      <div><strong>${esc(f.intitule)}</strong>${f.lieu ? " — " + esc(f.lieu) : ""}</div>
      <div>${esc(f.annee)}</div>
    </div>`).join("");

    const autreinfo = rubrique("Autres", _CV.autresinformations).map((ai) => `
    <div class="cv-section-title">${esc(ai.libelle)}</div>
    <div class="cv-other-info">
      <div>${ai.informations.filter(Boolean).map((i) => `${esc(i)}`).join(" - ")}</div>
    </div>`).join("");

  const sections =
  {
    Accroche: rubriqueVisible("Accroche") && _CV.accroche?.trim() ? `<div class="cv-section-title">Profil</div><div class="cv-accroche">${esc(_CV.accroche)}</div>` : "",
    Experiences: exps ? `<div class="cv-section-title">Expériences professionnelles</div>${exps}` : "",
    Competences: skills ? `<div class="cv-section-title">Compétences</div>${skills}` : "",
    Softskill: softsk ? `<div class="cv-section-title">Compétences transversales</div>${syntheseSoftskill(_CV, "cv-SoftSkill-libelle")}${softsk}` : "",
    Formations: formations ? `<div class="cv-section-title">Formation</div>${formations}` : "",
    Autres: autreinfo
  };

  $("#cv-preview").innerHTML = `
    <div class="cv-header">
      ${photo}
      <h1>${esc(_CV.nom) || "Votre nom"}</h1>
      <div class="cv-title">${esc(_CV.titre) || "Votre titre"}</div>
      <div class="cv-contact">${contacts}</div>
      ${links ? `<div class="cv-contact">${links}</div>` : ""}
    </div>
  ` + sectionsOrdonnees(sections);
}

// ------------------------------------------------------------
// TEMPLATE 1 — « Moderne » : bandeau coloré en tête, sections
// soulignées par une barre latérale, compétences à intitulé gras.
// ------------------------------------------------------------
function PreviewModerneCV(_CV)
{
  const page = $("#cv-preview");

  // Photo de profil (affichée seulement si renseignée)
  const photo = _CV.photo ? `<img class="cv-photo tm-photo" src="${esc(_CV.photo)}"  alt="" />` : "";

  // Ligne d'adresse
  const adr = _CV.adresse;
  const adrLines = [adr.ligne1, adr.ligne2, [adr.codePostal, adr.ville, adr.pays].filter(Boolean).join(" ")]
    .map((s) => (s || "").trim()).filter(Boolean);

  // Liens (Portfolio, LinkedIn, GitHub...) — inline, séparés par « · » ;
  // lienSupplementaire() reconstruit l'URL (https:// si schéma absent)
  // et affiche le libellé en gras, sans « : » orphelin si vide.
  const links = joindreLiens(
    _CV.otherlinks
      .filter((l) => l.affiche !== false && ((l.libelle || "").trim() || (l.url || "").trim()))
      .map(lienSupplementaire),
    parseInt(_CV.customisation?.liensParLigne) || 0
  );

  const contactLines = [
    mentionRqth(_CV),
    adrLines.join(" — "),
    [esc(_CV.tel), esc(_CV.email)].filter(Boolean).join(" — "),
    links
  ].filter(Boolean);

  const accroche = (acc) => acc && acc.trim()
    ? `<h2 class="tm-h2">Profil</h2><p class="tm-p">${esc(acc)}</p>` : "";

  // Expériences : « Poste — Entreprise » + dates · lieu
  const exps = rubrique("Experiences", _CV.experiences).map((e) => `
    <h3 class="tm-h3">${esc(e.poste) || "Poste"}${e.entreprise ? " — " + esc(e.entreprise) : ""}</h3>
    <p class="tm-job-meta">${esc(e.debut)}${e.fin ? " - " + esc(e.fin) : " - aujourd'hui"}${e.lieu ? " · " + esc(e.lieu) : ""}</p>
    ${e.missions.filter(Boolean).length ? `<ul class="tm-ul">${e.missions.filter(Boolean).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
  `).join("");

  // Compétences : intitulé en gras aligné, comme ta maquette
  const skills = rubrique("Competences", _CV.competences)
    .filter((s) => (s.intitule || "").trim() || (s.valeur || "").trim())
    .map((s) => `<p class="tm-skills"><b>${esc(s.intitule)} :</b> ${esc(s.valeur)}</p>`)
    .join("");

  // Soft-skills (affichés seulement si remplis)
  const softsk = rubrique("Softskill", _CV.softskill)
    .filter((s) => (s.libelle || "").trim() || (s.desc || "").trim())
    .map((s) => `<p class="tm-skills"><b>${esc(s.libelle)} :</b> ${esc(s.desc)}</p>`)
    .join("");

  const formations = rubrique("Formations", _CV.formations).map((f) => `
    <h3 class="tm-h3">${esc(f.intitule)}${f.lieu ? " — " + esc(f.lieu) : ""}</h3>
    <p class="tm-job-meta">${esc(f.annee)}</p>
  `).join("");

  // Sections libres (« Centres d'intérêt », etc.) : libellé + éléments séparés par « · »
  const autres = rubrique("Autres", _CV.autresinformations).map((ai) => `
    ${ai.libelle ? `<h2 class="tm-h2">${esc(ai.libelle)}</h2>` : ""}
    ${ai.informations.filter(Boolean).length ? `<p class="tm-p">${ai.informations.filter(Boolean).map((i) => esc(i)).join(" · ")}</p>` : ""}
  `).join("");

  const sections =
  {
    Accroche: rubriqueVisible("Accroche") ? accroche(_CV.accroche) : "",
    Experiences: exps ? `<h2 class="tm-h2">Expérience professionnelle</h2>${exps}` : "",
    Competences: skills ? `<h2 class="tm-h2">Compétences</h2>${skills}` : "",
    Softskill: softsk ? `<h2 class="tm-h2">Compétences transversales</h2>${syntheseSoftskill(_CV, "tm-p")}${softsk}` : "",
    Formations: formations ? `<h2 class="tm-h2">Formation</h2>${formations}` : "",
    Autres: autres
  };

  page.innerHTML = `
    <header class="tm-header">
      ${photo}
      <h1 class="tm-h1">${esc(_CV.nom) || "Votre nom"}</h1>
      <p class="tm-role">${esc(_CV.titre) || "Votre titre"}</p>
      <p class="tm-contact">${contactLines.join("<br>")}</p>
    </header>
    <div class="tm-body">
      ${sectionsOrdonnees(sections)}
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

  // Photo de profil (affichée seulement si renseignée)
  const photo = _CV.photo ? `<img class="cv-photo mn-photo" src="${esc(_CV.photo)}"  alt="" />` : "";

  // Filet supérieur pleine largeur : posé sur la page elle-même pour
  // déborder du padding. renderPreview() le remet à zéro avant le
  // switch (voir point 2) — les autres templates n'en veulent pas.
  page.classList.add("tpl-minimaliste");

  // Police par défaut propre à ce template (surchargeable via le select)
  //page.style.setProperty("--cv-font", _CV.customisation?.police || '"Helvetica Neue", Arial, sans-serif');

  const adr = _CV.adresse;
  const adrLines = [adr.ligne1, adr.ligne2, [adr.codePostal, adr.ville, adr.pays].filter(Boolean).join(" ")]
    .map((s) => (s || "").trim()).filter(Boolean);

  // Liens (Portfolio, LinkedIn, GitHub...) — inline, séparés par « · » ;
  // lienSupplementaire() reconstruit l'URL (https:// si schéma absent)
  // et affiche le libellé en gras, sans « : » orphelin si vide.
  const links = joindreLiens(
    _CV.otherlinks
      .filter((l) => l.affiche !== false && ((l.libelle || "").trim() || (l.url || "").trim()))
      .map(lienSupplementaire),
    parseInt(_CV.customisation?.liensParLigne) || 0
  );

  const contactLines = [
    mentionRqth(_CV),
    adrLines.join(" — "),
    [esc(_CV.tel), esc(_CV.email)].filter(Boolean).join(" — "),
    links
  ].filter(Boolean);

  // Expériences : « Poste — Entreprise » + dates · lieu
  const exps = rubrique("Experiences", _CV.experiences).map((e) => `
    <h3 class="mn-h3">${esc(e.poste) || "Poste"}${e.entreprise ? " — " + esc(e.entreprise) : ""}</h3>
    <p class="mn-job-meta">${esc(e.debut)}${e.fin ? " - " + esc(e.fin) : " - aujourd'hui"}${e.lieu ? " · " + esc(e.lieu) : ""}</p>
    ${e.missions.filter(Boolean).length ? `<ul class="mn-ul">${e.missions.filter(Boolean).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
  `).join("");

  // Compétences : intitulé en gras aligné (comme la maquette)
  const skills = rubrique("Competences", _CV.competences)
    .filter((s) => (s.intitule || "").trim() || (s.valeur || "").trim())
    .map((s) => `<p class="mn-skills"><b>${esc(s.intitule)} :</b> ${esc(s.valeur)}</p>`)
    .join("");

  // Soft-skills (affichés seulement si remplis)
  const softsk = rubrique("Softskill", _CV.softskill)
    .filter((s) => (s.libelle || "").trim() || (s.desc || "").trim())
    .map((s) => `<p class="mn-skills"><b>${esc(s.libelle)} :</b> ${esc(s.desc)}</p>`)
    .join("");

  const formations = rubrique("Formations", _CV.formations).map((f) => `
    <h3 class="mn-h3">${esc(f.intitule)}${f.lieu ? " — " + esc(f.lieu) : ""}</h3>
    <p class="mn-job-meta">${esc(f.annee)}</p>
  `).join("");

  // Sections libres (« Centres d'intérêt », etc.)
  const autres = rubrique("Autres", _CV.autresinformations).map((ai) => `
    ${ai.libelle ? `<h2 class="mn-h2">${esc(ai.libelle)}</h2>` : ""}
    ${ai.informations.filter(Boolean).length ? `<p class="mn-p">${ai.informations.filter(Boolean).map((i) => esc(i)).join(" · ")}</p>` : ""}
  `).join("");

  const sections =
  {
    Accroche: rubriqueVisible("Accroche") && _CV.accroche?.trim() ? `<h2 class="mn-h2">Profil</h2><p class="mn-p">${esc(_CV.accroche)}</p>` : "",
    Experiences: exps ? `<h2 class="mn-h2">Expérience professionnelle</h2>${exps}` : "",
    Competences: skills ? `<h2 class="mn-h2">Compétences</h2>${skills}` : "",
    Softskill: softsk ? `<h2 class="mn-h2">Compétences transversales</h2>${syntheseSoftskill(_CV, "mn-p")}${softsk}` : "",
    Formations: formations ? `<h2 class="mn-h2">Formation</h2>${formations}` : "",
    Autres: autres
  };

  page.innerHTML = `
    ${photo}
    <h1 class="mn-h1">${esc(_CV.nom) || "Votre nom"}</h1>
    <p class="mn-role">${esc(_CV.titre) || "Votre titre"}</p>
    <p class="mn-contact">${contactLines.join("<br>")}</p>
  ` + sectionsOrdonnees(sections);
}

// ------------------------------------------------------------
// TEMPLATE 3 — « Élégant serif » : sérif, titres de section
// centrés flanqués de tirets, contact encadré de filets, cadre
// beige autour de la page (classe tpl-serif).
// Couleurs : h1/h3 = --cv-principale, accents = --cv-secondaire,
// texte = --cv-ink (convention commune à tous les templates).
// ------------------------------------------------------------
function PreviewElegantSerifCV(_CV)
{
  const page = $("#cv-preview");

  // Photo de profil (affichée seulement si renseignée)
  const photo = _CV.photo ? `<img class="cv-photo es-photo" src="${esc(_CV.photo)}"  alt="" />` : "";

  // Habillage de page (classe, retirée par renderPreview() avant le switch)
  page.classList.add("tpl-serif");

  // Police par défaut propre à ce template (surchargeable via le select)
  //page.style.setProperty("--cv-font", _CV.customisation?.police || '"Palatino Linotype", Palatino, Georgia, serif');

  const adr = _CV.adresse;
  const adrLines = [adr.ligne1, adr.ligne2, [adr.codePostal, adr.ville, adr.pays].filter(Boolean).join(" ")]
    .map((s) => (s || "").trim()).filter(Boolean);

  // Liens (Portfolio, LinkedIn, GitHub...) — inline, séparés par « · » ;
  // lienSupplementaire() reconstruit l'URL (https:// si schéma absent)
  // et affiche le libellé en gras, sans « : » orphelin si vide.
  const links = joindreLiens(
    _CV.otherlinks
      .filter((l) => l.affiche !== false && ((l.libelle || "").trim() || (l.url || "").trim()))
      .map(lienSupplementaire),
    parseInt(_CV.customisation?.liensParLigne) || 0
  );

  const contactLines = [
    mentionRqth(_CV),
    adrLines.join(" — "),
    [esc(_CV.tel), esc(_CV.email)].filter(Boolean).join(" — "),
    links
  ].filter(Boolean);

  // Expériences : « Poste — Entreprise » + dates · lieu (en italique)
  const exps = rubrique("Experiences", _CV.experiences).map((e) => `
    <h3 class="es-h3">${esc(e.poste) || "Poste"}${e.entreprise ? " — " + esc(e.entreprise) : ""}</h3>
    <p class="es-job-meta">${esc(e.debut)}${e.fin ? " - " + esc(e.fin) : " - aujourd'hui"}${e.lieu ? " · " + esc(e.lieu) : ""}</p>
    ${e.missions.filter(Boolean).length ? `<ul class="es-ul">${e.missions.filter(Boolean).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
  `).join("");

  // Compétences : intitulé en gras aligné (comme la maquette)
  const skills = rubrique("Competences", _CV.competences)
    .filter((s) => (s.intitule || "").trim() || (s.valeur || "").trim())
    .map((s) => `<p class="es-skills"><b>${esc(s.intitule)} :</b> ${esc(s.valeur)}</p>`)
    .join("");

  // Soft-skills (affichés seulement si remplis)
  const softsk = rubrique("Softskill", _CV.softskill)
    .filter((s) => (s.libelle || "").trim() || (s.desc || "").trim())
    .map((s) => `<p class="es-skills"><b>${esc(s.libelle)} :</b> ${esc(s.desc)}</p>`)
    .join("");

  const formations = rubrique("Formations", _CV.formations).map((f) => `
    <h3 class="es-h3">${esc(f.intitule)}${f.lieu ? " — " + esc(f.lieu) : ""}</h3>
    <p class="es-job-meta">${esc(f.annee)}</p>
  `).join("");

  // Sections libres (« Centres d'intérêt », etc.)
  const autres = rubrique("Autres", _CV.autresinformations).map((ai) => `
    ${ai.libelle ? `<h2 class="es-h2">${esc(ai.libelle)}</h2>` : ""}
    ${ai.informations.filter(Boolean).length ? `<p class="es-p">${ai.informations.filter(Boolean).map((i) => esc(i)).join(" · ")}</p>` : ""}
  `).join("");

  const sections =
  {
    Accroche: rubriqueVisible("Accroche") && _CV.accroche?.trim() ? `<h2 class="es-h2">Profil</h2><p class="es-p">${esc(_CV.accroche)}</p>` : "",
    Experiences: exps ? `<h2 class="es-h2">Expérience professionnelle</h2>${exps}` : "",
    Competences: skills ? `<h2 class="es-h2">Compétences</h2>${skills}` : "",
    Softskill: softsk ? `<h2 class="es-h2">Compétences transversales</h2>${syntheseSoftskill(_CV, "es-p")}${softsk}` : "",
    Formations: formations ? `<h2 class="es-h2">Formation</h2>${formations}` : "",
    Autres: autres
  };

  page.innerHTML = `
    ${photo}
    <h1 class="es-h1">${esc(_CV.nom) || "Votre nom"}</h1>
    <p class="es-role">${esc(_CV.titre) || "Votre titre"}</p>
    <p class="es-contact">${contactLines.join("<br>")}</p>
  ` + sectionsOrdonnees(sections);
}

// ------------------------------------------------------------
// TEMPLATE 4 — « Suisse grandes majuscules » : typographie brute,
// h1 massif, badges de section pleins, dates roses en majuscules.
// Couleurs : h1/h3/badges = --cv-principale, accents (rôle, dates,
// puces) = --cv-secondaire, texte = --cv-ink.
// ------------------------------------------------------------
function PreviewSuisseCV(_CV)
{
  const page = $("#cv-preview");

  // Photo de profil (affichée seulement si renseignée)
  const photo = _CV.photo ? `<img class="cv-photo su-photo" src="${esc(_CV.photo)}"  alt="" />` : "";

  // Police par défaut propre à ce template (surchargeable via le select)
  //page.style.setProperty("--cv-font", _CV.customisation?.police || '"Helvetica Neue", Arial, sans-serif');

  const adr = _CV.adresse;
  const adrLines = [adr.ligne1, adr.ligne2, [adr.codePostal, adr.ville, adr.pays].filter(Boolean).join(" ")]
    .map((s) => (s || "").trim()).filter(Boolean);

  // Liens (Portfolio, LinkedIn, GitHub...) — inline, séparés par « · » ;
  // lienSupplementaire() reconstruit l'URL (https:// si schéma absent)
  // et affiche le libellé en gras, sans « : » orphelin si vide.
  const links = joindreLiens(
    _CV.otherlinks
      .filter((l) => l.affiche !== false && ((l.libelle || "").trim() || (l.url || "").trim()))
      .map(lienSupplementaire),
    parseInt(_CV.customisation?.liensParLigne) || 0
  );

  const contactLines = [
    mentionRqth(_CV),
    adrLines.join(" — "),
    [esc(_CV.tel), esc(_CV.email)].filter(Boolean).join(" — "),
    links
  ].filter(Boolean);

  // Expériences : « POSTE — ENTREPRISE » + dates · lieu (majuscules via CSS)
  const exps = rubrique("Experiences", _CV.experiences).map((e) => `
    <h3 class="su-h3">${esc(e.poste) || "Poste"}${e.entreprise ? " — " + esc(e.entreprise) : ""}</h3>
    <p class="su-job-meta">${esc(e.debut)}${e.fin ? " - " + esc(e.fin) : " - aujourd'hui"}${e.lieu ? " · " + esc(e.lieu) : ""}</p>
    ${e.missions.filter(Boolean).length ? `<ul class="su-ul">${e.missions.filter(Boolean).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
  `).join("");

  // Compétences : intitulé en petites majuscules, neutre (fidèle à la maquette)
  const skills = rubrique("Competences", _CV.competences)
    .filter((s) => (s.intitule || "").trim() || (s.valeur || "").trim())
    .map((s) => `<p class="su-skills"><b>${esc(s.intitule)} :</b> ${esc(s.valeur)}</p>`)
    .join("");

  // Soft-skills (affichés seulement si remplis)
  const softsk = rubrique("Softskill", _CV.softskill)
    .filter((s) => (s.libelle || "").trim() || (s.desc || "").trim())
    .map((s) => `<p class="su-skills"><b>${esc(s.libelle)} :</b> ${esc(s.desc)}</p>`)
    .join("");

  const formations = rubrique("Formations", _CV.formations).map((f) => `
    <h3 class="su-h3">${esc(f.intitule)}${f.lieu ? " — " + esc(f.lieu) : ""}</h3>
    <p class="su-job-meta">${esc(f.annee)}</p>
  `).join("");

  // Sections libres (« Centres d'intérêt », etc.)
  const autres = rubrique("Autres", _CV.autresinformations).map((ai) => `
    ${ai.libelle ? `<h2 class="su-h2">${esc(ai.libelle)}</h2>` : ""}
    ${ai.informations.filter(Boolean).length ? `<p class="su-p">${ai.informations.filter(Boolean).map((i) => esc(i)).join(" · ")}</p>` : ""}
  `).join("");

  const sections =
  {
    Accroche: rubriqueVisible("Accroche") && _CV.accroche?.trim() ? `<h2 class="su-h2">Profil</h2><p class="su-p">${esc(_CV.accroche)}</p>` : "",
    Experiences: exps ? `<h2 class="su-h2">Expérience professionnelle</h2>${exps}` : "",
    Competences: skills ? `<h2 class="su-h2">Compétences</h2>${skills}` : "",
    Softskill: softsk ? `<h2 class="su-h2">Compétences transversales</h2>${syntheseSoftskill(_CV, "su-p")}${softsk}` : "",
    Formations: formations ? `<h2 class="su-h2">Formation</h2>${formations}` : "",
    Autres: autres
  };

  page.innerHTML = `
    ${photo}
    <h1 class="su-h1">${esc(_CV.nom) || "Votre nom"}</h1>
    <p class="su-role">${esc(_CV.titre) || "Votre titre"}</p>
    <p class="su-contact">${contactLines.join("<br>")}</p>
  ` + sectionsOrdonnees(sections);
}

// ------------------------------------------------------------
// TEMPLATE 5 — « Compétences en tête » : chips de compétences
// clés générées depuis le champ Compétences, section Compétences
// placée avant le Profil.
// Couleurs : h1/h2/chips/intitulés = --cv-secondaire (h1 coloré,
// cas unique dans les templates), h3 = --cv-principale,
// texte = --cv-ink.
// ------------------------------------------------------------
function PreviewCompetencesCV(_CV)
{
  const page = $("#cv-preview");

  // Photo de profil (affichée seulement si renseignée)
  const photo = _CV.photo ? `<img class="cv-photo ch-photo" src="${esc(_CV.photo)}"  alt="" />` : "";

  // Police par défaut propre à ce template (surchargeable via le select)
  //page.style.setProperty("--cv-font", _CV.customisation?.police || '"Segoe UI", Calibri, sans-serif');

  const adr = _CV.adresse;
  const adrLines = [adr.ligne1, adr.ligne2, [adr.codePostal, adr.ville, adr.pays].filter(Boolean).join(" ")]
    .map((s) => (s || "").trim()).filter(Boolean);

  // Liens (Portfolio, LinkedIn, GitHub...) — inline, séparés par « · » ;
  // lienSupplementaire() reconstruit l'URL (https:// si schéma absent)
  // et affiche le libellé en gras, sans « : » orphelin si vide.
  const links = joindreLiens(
    _CV.otherlinks
      .filter((l) => l.affiche !== false && ((l.libelle || "").trim() || (l.url || "").trim()))
      .map(lienSupplementaire),
    parseInt(_CV.customisation?.liensParLigne) || 0
  );

  const contactLines = [
    mentionRqth(_CV),
    adrLines.join(" — "),
    [esc(_CV.tel), esc(_CV.email)].filter(Boolean).join(" — "),
    links
  ].filter(Boolean);

  // Chips de compétences clés, par ordre de priorité :
  // 1. liste DÉDIÉE cv.competencesCles (onglet Compétences, une par
  //    ligne) si elle contient au moins une entrée ;
  // 2. sinon découpe automatique sur les virgules des valeurs du
  //    champ Compétences (comportement historique).
  // Dédoublonnées, vides ignorées ; rubrique() exclut rubrique ET
  // entrées masquées des chips automatiques. La visibilité de la
  // section (rubriqueVisible + ordreSections) enveloppe déjà les
  // deux cas dans le map "sections" — rien à changer en dessous.
  const manuelles = Array.from(new Set(
    (Array.isArray(_CV.competencesCles) ? _CV.competencesCles : [])
      .map((c) => String(c || "").trim())
      .filter(Boolean)
  ));
  const chips = (manuelles.length ? manuelles : Array.from(new Set(
    rubrique("Competences", _CV.competences)
      .flatMap((s) => String(s.valeur || "").split(","))
      .map((c) => c.trim())
      .filter(Boolean)
  ))).map((c) => `<li>${esc(c)}</li>`).join("");

  // Compétences détaillées (intitulé : valeur)
  const skills = rubrique("Competences", _CV.competences)
    .filter((s) => (s.intitule || "").trim() || (s.valeur || "").trim())
    .map((s) => `<p class="ch-skills"><b>${esc(s.intitule)} :</b> ${esc(s.valeur)}</p>`)
    .join("");

  // Soft-skills (affichés seulement si remplis)
  const softsk = rubrique("Softskill", _CV.softskill)
    .filter((s) => (s.libelle || "").trim() || (s.desc || "").trim())
    .map((s) => `<p class="ch-skills"><b>${esc(s.libelle)} :</b> ${esc(s.desc)}</p>`)
    .join("");

  // Expériences : « Poste — Entreprise » + dates · lieu
  const exps = rubrique("Experiences", _CV.experiences).map((e) => `
    <h3 class="ch-h3">${esc(e.poste) || "Poste"}${e.entreprise ? " — " + esc(e.entreprise) : ""}</h3>
    <p class="ch-job-meta">${esc(e.debut)}${e.fin ? " - " + esc(e.fin) : " - aujourd'hui"}${e.lieu ? " · " + esc(e.lieu) : ""}</p>
    ${e.missions.filter(Boolean).length ? `<ul class="ch-ul">${e.missions.filter(Boolean).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
  `).join("");

  const formations = rubrique("Formations", _CV.formations).map((f) => `
    <h3 class="ch-h3">${esc(f.intitule)}${f.lieu ? " — " + esc(f.lieu) : ""}</h3>
    <p class="ch-job-meta">${esc(f.annee)}</p>
  `).join("");

  // Sections libres (« Centres d'intérêt », etc.)
  const autres = rubrique("Autres", _CV.autresinformations).map((ai) => `
    ${ai.libelle ? `<h2 class="ch-h2">${esc(ai.libelle)}</h2>` : ""}
    ${ai.informations.filter(Boolean).length ? `<p class="ch-p">${ai.informations.filter(Boolean).map((i) => esc(i)).join(" · ")}</p>` : ""}
  `).join("");

  // Compétences : les chips suivent la section (même clé) — l'ordre
  // choisi place donc le bloc « Compétences clés » avec les détails.
  const sections =
  {
    Accroche: rubriqueVisible("Accroche") && _CV.accroche?.trim() ? `<h2 class="ch-h2">Profil</h2><p class="ch-p">${esc(_CV.accroche)}</p>` : "",
    Experiences: exps ? `<h2 class="ch-h2">Expérience professionnelle</h2>${exps}` : "",
    Competences: (rubriqueVisible("Competences") && chips ? `<h2 class="ch-h2">Compétences clés</h2><ul class="ch-chips">${chips}</ul>` : "") + (skills ? `${skills}` : ""),
    Softskill: softsk ? `<h2 class="ch-h2">Compétences transversales</h2>${syntheseSoftskill(_CV, "ch-p")}${softsk}` : "",
    Formations: formations ? `<h2 class="ch-h2">Formation</h2>${formations}` : "",
    Autres: autres
  };

  page.innerHTML = `
    <div class="ch-head">
      ${photo}
      <h1 class="ch-h1">${esc(_CV.nom) || "Votre nom"}</h1>
      <p class="ch-role">${esc(_CV.titre) || "Votre titre"}</p>
      <p class="ch-contact">${contactLines.join("<br>")}</p>
    </div>
  ` + sectionsOrdonnees(sections);
}