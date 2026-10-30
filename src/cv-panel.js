"use strict";

// ============================================================
// cv-panel.js (v5) — Rendu du formulaire d'édition (par onglet)
// Expose : renderXTab(), TAB_RENDERERS, switchTab, renderPanel,
//          renderJdResults, renderAll
// Dépend de : cv, jd, currentTab, CV_FONTS ($, esc, extractKeywords)
// ============================================================


// ------------------------------------------------------------
// Une sous-fonction par onglet (retourne le HTML du panneau)
// ------------------------------------------------------------

// Case « Afficher sur le CV » : réutilisable en tête de chaque onglet.
// Convention : clé absente ou true = affichée (compatibilité anciens JSON).
// « vide » = true → la case n'est PAS rendue : inutile de proposer de
// masquer une rubrique qui n'a aucune donnée.
function rubriqueToggle(key, label, vide)
{
  if (vide) return "";
  const on = cv.customisation?.["affiche" + key] !== false;
  return `<label class="rubrique-toggle"><input type="checkbox" data-bind="customisation.affiche${key}" ${on ? "checked" : ""}> ${label} — afficher sur le CV</label>`;
}

// Case « Afficher sur le CV » d'UNE entrée (une expérience, une
// formation, une compétence...). Écrit item.affiche via le même
// mécanisme que les autres champs (data-<collection> + data-key).
// Convention : affiche === false = masquée, absente = affichée.
// En tête de carte : poignée de glissement (drag & drop) + boutons
// ↑/↓ pour réordonner les entrées.
function itemTools(attr, i, item, total)
{
  const on = item?.affiche !== false;
  return `<div class="item-toggle-row">
    <span class="reorder-handle" draggable="true" title="Glisser pour réordonner">⠿</span>
    <label class="item-toggle" title="Afficher / cacher cette entrée sur le CV"><input type="checkbox" data-${attr}="${i}" data-key="affiche" ${on ? "checked" : ""}> Afficher sur le CV</label>
    <span class="item-move">
      <button class="move-btn" data-move-item="${attr}" data-index="${i}" data-dir="-1" ${i === 0 ? "disabled" : ""} title="Monter">↑</button>
      <button class="move-btn" data-move-item="${attr}" data-index="${i}" data-dir="1" ${i === total - 1 ? "disabled" : ""} title="Descendre">↓</button>
    </span>
  </div>`;
}

function renderProfilTab()
{
  const c = cv;
  return `
      <div class="grid">
        <div class="field"><label>Nom</label><input data-bind="nom" value="${esc(c.nom)}"></div>
        <div class="field"><label>Titre</label><input data-bind="titre" value="${esc(c.titre)}"></div>
      </div>
      <div class="field" style="margin-top:.7rem">
        <label>Photo de profil (facultatif)</label>
        <input type="file" id="photo-input" accept="image/*" hidden />
        ${c.photo ? `<div class="grid"> 
        <img class="photo-thumb-editor" src="${c.photo}" alt="Photo de profil" />
        <div style="margin-top:.7rem">
          <div class="field">
            <label>Photo — position (ancre)</label>
            <select data-bind="customisation.photoAncre">
            ${CV_PHOTO_ANCRES.map((a) => `<option value="${a.value}" ${(parseInt(c.customisation.photoAncre) || 0) === a.value ? "selected" : ""}>${esc(a.label)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Photo — forme</label>
            <select data-bind="customisation.photoForme">
            ${CV_PHOTO_FORMES.map((f) => `<option value="${f.value}" ${(parseInt(c.customisation.photoForme) || 0) === f.value ? "selected" : ""}>${esc(f.label)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Photo — encadrement</label>
            <select data-bind="customisation.photoCadre">
            ${CV_PHOTO_CADRES.map((d) => `<option value="${d.value}" ${(parseInt(c.customisation.photoCadre) || 0) === d.value ? "selected" : ""}>${esc(d.label)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Photo — taille <span class="range-val" id="photo-taille-val">${(parseInt(c.customisation.photoTaille) || 0) > 0 ? (parseInt(c.customisation.photoTaille) + " px") : "auto"}</span></label>
            <input type="range" min="0" max="160" step="2" data-bind="customisation.photoTaille" value="${parseInt(c.customisation.photoTaille) || 0}">
            <div class="hint">0 = taille selon le template</div>
          </div>
        </div>
        </div>` : ""}
        <div>
          <button class="btn primary" id="btn-photo-add">${c.photo ? "Changer la photo" : "+ Ajouter une photo"}</button>
          ${c.photo ? `<button class="btn reset" id="btn-photo-remove">Retirer</button>` : ""}
        </div>
      </div>
      ${rubriqueToggle("Accroche", "Accroche", !String(c.accroche || "").trim())}
      <div class="field" style="margin-top:.7rem"><label>Accroche</label><textarea data-bind="accroche" rows="4">${esc(c.accroche)}</textarea></div>
      <div class="field" style="margin-top:.7rem">
        <div class="grid" style="margin-top:.7rem">
          <div class="field"><label>Adresse Ligne 1 </label><input data-bind="adresse.ligne1" value="${esc(c.adresse.ligne1)}"></div>
        </div>
        <div class="grid" style="margin-top:.7rem">
          <div class="field"><label>Adresse Ligne 2 (Facultatif) </label><input data-bind="adresse.ligne2" value="${esc(c.adresse.ligne2)}"></div>
        </div>
        <div class="grid" style="margin-top:.7rem">
          <div class="field"><label>Code Postal </label><input data-bind="adresse.codePostal" value="${esc(c.adresse.codePostal)}"></div>
          <div class="field"><label>Ville </label><input data-bind="adresse.ville" value="${esc(c.adresse.ville)}"></div>
          <div class="field"><label>Pays (Facultatif) </label><input data-bind="adresse.pays" value="${esc(c.adresse.pays)}"></div>
        </div>
      </div>
      <div class="grid" style="margin-top:.7rem">
        <div class="field"><label>Email</label><input data-bind="email" value="${esc(c.email)}"></div>
        <div class="field"><label>Téléphone</label><input data-bind="tel" value="${esc(c.tel)}"></div>
      </div>
      <label class="rubrique-toggle" style="margin-top:.7rem" title="Ajoute la mention « RQTH — travailleur handicapé » dans le bloc contact du CV, sur les 6 templates. Décochée, la mention n'apparaît nulle part.">
        <input type="checkbox" data-bind="rqth" ${c.rqth ? "checked" : ""}> RQTH — travailleur handicapé : afficher la mention sur le CV
      </label>
      ${c.otherlinks.map((l, i) => `
      <div class="exp-card" data-card="otherlinks" data-index="${i}">
        ${itemTools("otherlinks", i, l, c.otherlinks.length)}
        <button class="remove" id="btn-remove-link" data-remove="${i}" title="Supprimer">✕</button>
        <div class="grid">
          <div class="field"><label>Libelle</label><input data-otherlinks="${i}" data-key="libelle" value="${esc(l.libelle)}"></div>
          <div class="field"><label>Adresse</label><input data-otherlinks="${i}" data-key="url" value="${esc(l.url)}"></div>
        </div>
      </div>`).join("")}
      <button class="add-btn" id="btn-add-link">+ Ajouter un lien</button>`;
}

function renderExperiencesTab()
{
  const c = cv;
  return rubriqueToggle("Experiences", "Expériences", c.experiences.length === 0) + c.experiences.map((e, i) => `
      <div class="exp-card" data-card="exp" data-index="${i}">
        ${itemTools("exp", i, e, c.experiences.length)}
        ${c.experiences.length > 0 ? `<button class="remove"  id="btn-remove-exp" data-remove="${i}" title="Supprimer">✕</button>` : ""}
        <div class="grid">
          <div class="field"><label>Poste</label><input data-exp="${i}" data-key="poste" value="${esc(e.poste)}"></div>
          <div class="field"><label>Entreprise</label><input data-exp="${i}" data-key="entreprise" value="${esc(e.entreprise)}"></div>
          <div class="field"><label>Lieu</label><input data-exp="${i}" data-key="lieu" value="${esc(e.lieu)}"></div>
        </div>
        <div class="grid">
          <div class="field"><label>Début (MM/AAAA)</label><input data-exp="${i}" data-key="debut" value="${esc(e.debut)}"></div>
          <div class="field"><label>Fin (MM/AAAA)</label><input data-exp="${i}" data-key="fin" value="${esc(e.fin)}"></div>
        </div>
        <div class="field" style="margin-top:.7rem"><label>Missions (une par ligne)</label>
          <textarea data-exp="${i}" data-key="missions" rows="4">${esc(e.missions.join("\n"))}</textarea>
        </div>
      </div>`).join("")
            + `<button class="add-btn" id="btn-add-exp">+ Ajouter une expérience</button>
        <button class="add-btn" id="btn-trier-dates" title="De la plus récente à la plus ancienne (convention recruteur/ATS) — pratique après un calibrage, qui trie par pertinence">📅 Trier par dates</button><br><br>

      ${rubriqueToggle("Formations", "Formations", c.formations.length === 0)}
      ${c.formations.map((f, i) => `
      <div class="exp-card" data-card="edu" data-index="${i}">
        ${itemTools("edu", i, f, c.formations.length)}
        ${c.formations.length > 0 ? `<button class="remove" id="btn-remove-edu" data-remove="${i}" title="Supprimer">✕</button>` : ""}
        <div class="grid" style="margin-bottom:.5rem">
          <div class="field"><label>Formation</label><input data-edu="${i}" data-key="intitule" value="${esc(f.intitule)}"></div>
          <div class="field"><label>Établissement</label><input data-edu="${i}" data-key="lieu" value="${esc(f.lieu)}"></div>
          <div class="field"><label>Années</label><input data-edu="${i}" data-key="annee" value="${esc(f.annee)}"></div>
        </div>
      </div>`).join("")}
      <button class="add-btn" id="btn-add-edu">+ Ajouter une formation</button>`;
}

function renderCompetencesTab()
{
  const c = cv;
  return rubriqueToggle("Competences", "Compétences", c.competences.length === 0)
    // Chips « Compétences clés » (template « Compétences en tête ») :
    // une par ligne. VIDE = chips automatiques (découpe des valeurs
    // par virgules) — le hint le dit, pas de surprise.
    + `<div class="field" style="margin-top:.8rem">
        <label>Compétences clés (chips) — template « Compétences en tête »</label>
        <textarea data-bind="competencesCles" rows="2" placeholder="Unity3D&#10;C++&#10;Optimisation&#10;(vide = automatique, depuis les valeurs ci-dessous)">${esc((c.competencesCles || []).join("\n"))}</textarea>
        <div class="hint">Une chip par ligne. Vide = chips automatiques découpées sur les virgules des compétences ci-dessous (comportement historique).</div>
      </div>`
    + c.competences.map((comp, i) => `
      <div class="exp-card" data-card="comp" data-index="${i}">
        ${itemTools("comp", i, comp, c.competences.length)}
        ${c.competences.length > 0 ? `<button class="remove" id="btn-remove-comp" data-remove="${i}" title="Supprimer">✕</button>` : ""}
          <div class="field"><label>Intitulé</label><input data-comp="${i}" data-key="intitule" value="${esc(comp.intitule)}"></div>
          <div class="field"><label>Compétences (séparés par des virgules)</label><textarea data-comp="${i}" data-key="valeur" rows="2">${esc(comp.valeur)}</textarea></div>
      </div>`).join("")
      + `<button class="add-btn" id="btn-add-comp">+ Ajouter une compétence</button>`;
}

function renderSoftSkillTab()
{
    const c = cv;
  return rubriqueToggle("Softskill", "Soft-skills", c.softskill.length === 0)
    + `<div class="field" style="margin-top:.7rem"><label>Synthèse des soft-skills (optionnel)</label>
      <textarea data-bind="softskillSynthese" rows="2" placeholder="Ex. Curiosité, rigueur et écoute : je traduis les besoins des équipes en solutions concrètes.">${esc(c.softskillSynthese)}</textarea>
      <div class="hint">Affichée en tête de la section « Compétences transversales », au-dessus de la liste.</div></div>`
    + c.softskill.map((s, i) => `
      <div class="exp-card" data-card="softskill" data-index="${i}">
        ${itemTools("softskill", i, s, c.softskill.length)}
        ${c.softskill.length > 0 ? `<button class="remove" id="btn-remove-softskill" data-remove="${i}" title="Supprimer">✕</button>` : ""}
        <div class="grid">
          <div class="field"><label>Libelle</label><input data-softskill="${i}" data-key="libelle" value="${esc(s.libelle)}"></div>
          <div class="field"><label>Description</label><input data-softskill="${i}" data-key="desc" value="${esc(s.desc)}"></div>
        </div>
      </div>`).join("")
      + `<button class="add-btn" id="btn-add-softskill">+ Ajouter un Soft skill</button>`;
}

function renderAutresInformationsTab()
{
  const c = cv;
  return rubriqueToggle("Autres", "Autres informations", c.autresinformations.length === 0) + c.autresinformations.map((ai, i) => `
      <div class="exp-card" data-card="autresinformations" data-index="${i}">
        ${itemTools("autresinformations", i, ai, c.autresinformations.length)}
        ${c.autresinformations.length > 0 ? `<button class="remove" id="btn-remove-autresinformations" data-remove="${i}" title="Supprimer">✕</button>` : ""}
        <div>
          <div class="field"><label>Libelle</label><input data-autresinformations="${i}" data-key="libelle" value="${esc(ai.libelle)}"></div>
          <div class="field" style="margin-top:.7rem"><label>Informations (une par ligne)</label>
            <textarea data-autresinformations="${i}" data-key="informations" rows="4">${esc(ai.informations.join("\n"))}</textarea>
          </div>
        </div>
      </div>`).join("")
      + `<button class="add-btn" id="btn-add-autresinformations">+ Ajouter une Autres Informations</button>`;
}

function renderCustomisationTab()
{
  const c = cv;
  // FIX : la valeur du slider était codée en dur (12) et revenait à 12
  // après rechargement même si une autre taille était sauvegardée.
  const taille = parseFloat(c.customisation.taille) || 12;
  const espacement = parseFloat(c.customisation.espacement) || 100;
  const liensParLigne = parseInt(c.customisation.liensParLigne) || 0;

  // Ordre des rubriques : liste réordonnable (poignée ⠿ + boutons ↑/↓).
  // L'ordre est commun à tous les templates et persisté dans
  // customisation.ordreSections.
  // SEULES les rubriques « en place » sont listées : visibles ET non
  // vides — exactement celles que l'aperçu rend. Une rubrique masquée
  // ou vide n'occupe aucune place dans le CV → aucun sens à l'ordonner.
  // Elles gardent leur position en mémoire et réapparaissent dans la
  // liste dès qu'elles ont du contenu ou sont réaffichées.
  const rubriqueEnPlace = (k) =>
  {
    if (cv.customisation?.["affiche" + k] === false) return false;
        // Les entrées masquées (affiche === false) ne comptent pas : une
    // section entièrement décochée n'occupe aucune place dans le CV,
    // donc aucun sens à l'ordonner — cohérent avec l'aperçu.
    const visibles = (arr) => arr.filter((it) => it?.affiche !== false).length;
    const data =
      k === "Accroche"        ? String(cv.accroche || "").trim() :
      k === "Experiences"     ? visibles(cv.experiences) :
      k === "Formations"      ? visibles(cv.formations) :
      k === "Competences"     ? visibles(cv.competences) :
      k === "Softskill"       ? visibles(cv.softskill) :
                                visibles(cv.autresinformations);
    return Boolean(data);
  };
  const ordre = ordreSectionsEffectif();
  // data-index = position dans l'ordre COMPLET (mêmes index que
  // moveSection / le drop), même si on n'affiche qu'un sous-ensemble.
  const lignes = ordre.map((k, i) => ({ k, i })).filter((r) => rubriqueEnPlace(r.k));
  const ordreHtml = lignes.length === 0
    ? `<div class="hint">Aucune rubrique visible avec du contenu pour l'instant — ajoutez des données ou réaffichez une rubrique.</div>`
    : lignes.map(({ k, i }, j) => `
      <div class="section-order-row" data-section="${k}" data-index="${i}">
        <span class="reorder-handle" draggable="true" title="Glisser pour réordonner">⠿</span>
        <span class="section-order-label">${esc(SECTION_LABELS[k] || k)}</span>
        <span class="section-order-tools">
          <button class="move-btn" data-move-section="${k}" data-dir="-1" ${j === 0 ? "disabled" : ""} title="Monter">↑</button>
          <button class="move-btn" data-move-section="${k}" data-dir="1" ${j === lignes.length - 1 ? "disabled" : ""} title="Descendre">↓</button>
        </span>
      </div>`).join("");

  return `
      <div class="field">
        <label>Template :</label>
        <select data-bind="customisation.Template">
        ${CV_TEMPLATES.map((t) => `<option value="${t.index}" ${parseInt(c.customisation.Template) === t.index ? "selected" : ""}>${esc(t.label)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Police</label>
        <select data-bind="customisation.police">
        ${CV_FONTS.map((f, idx) => `<option value="${idx}" ${parseInt(c.customisation.police) === idx ? "selected" : ""}>${esc(f.label)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Taille <span class="range-val" id="taille-val">${c.customisation.taille} px</span></label>
        <input type="range" min="2" max="50" step="1" data-bind="customisation.taille" value="${taille}">
      </div>
      <div class="field">
        <label>Espacement du CV <span class="range-val" id="espacement-val">${espacement} %</span></label>
        <input type="range" min="0" max="200" step="5" data-bind="customisation.espacement" value="${espacement}" title="100 % = rendu d'origine des templates ; en dessous = plus compact, au-dessus = plus aéré">
        <div class="hint">Compacité verticale du CV : entre les sections ET à l'intérieur (titres, listes, compétences).</div>
      </div>
      <div class="field">
        <label>Liens par ligne <span class="range-val" id="liens-val">${liensParLigne === 0 ? "une seule ligne" : liensParLigne}</span></label>
        <select data-bind="customisation.liensParLigne">
          <option value="0" ${liensParLigne === 0 ? "selected" : ""}>Tout sur une ligne</option>
          <option value="1" ${liensParLigne === 1 ? "selected" : ""}>1 lien par ligne</option>
          <option value="2" ${liensParLigne === 2 ? "selected" : ""}>2 liens par ligne</option>
          <option value="3" ${liensParLigne === 3 ? "selected" : ""}>3 liens par ligne</option>
        </select>
        <div class="hint">Répartition des liens (Portfolio, GitHub...) dans le bloc contact du CV.</div>
      </div>
      <div class="field">
        <label>Couleur Principale</label>
        <input type="color" data-bind="customisation.couleurprincipale" value="${esc(c.customisation.couleurprincipale)}">
      </div>
      <div class="field">
        <label>Couleur Secondaire</label>
        <input type="color" data-bind="customisation.couleursecondaire" value="${esc(c.customisation.couleursecondaire)}">
      </div><div class="field">
        <label>Couleur Tertiaire</label>
        <input type="color" data-bind="customisation.couleurtertiaire" value="${esc(c.customisation.couleurtertiaire)}">
      </div>
      <div class="field">
        <label>Ordre des rubriques du CV</label>
        <div class="section-order-list" id="section-order">${ordreHtml}</div>
        <div class="hint">Glissez la poignée ⠿ ou utilisez ↑/↓. L'ordre s'applique à tous les templates. Les rubriques vides ou masquées n'apparaissent pas ici (et n'occupent aucune place dans le CV).</div>
      </div>`;

}

function renderAnalyseTab()
{
  return `
      <div class="field">
        <label>Collez l'offre d'emploi (Job Description)</label>
        <textarea id="jd-input" rows="7" placeholder="Ex. Nous cherchons un Gameplay Programmer confirmé, maîtrisant C++, Unreal Engine, les 3C, l'IA (Behavior Trees), le réseau...">${esc(jd)}</textarea>
      </div>
      <div id="jd-results"></div>
      <div class="calibre-actions">
        <button id="btn-analyser" class="btn primary">🔍 Analyser l'offre</button>
        <button id="btn-calibrer" class="btn primary">⚖ Calibrer le CV</button>
        ${calibrageRapport ? '<button id="btn-annuler-calibrer" class="btn">↩ Annuler le calibrage</button>' : ""}
      </div>
      <div id="calibre-report">${renderCalibrageRapport()}</div>`;
}

// Rapport du dernier calibrage (transparence : quoi a changé, pourquoi)
function renderCalibrageRapport()
{
  if (!calibrageRapport) return "";
  const labels = { experiences: "Expériences", competences: "Compétences", softskill: "Soft-skills", autresinformations: "Autres informations" };
  return `
      <div class="alert info">
        <strong>CV calibré sur l'offre.</strong>
        Les entrées les plus pertinentes ont été remontées ; celles sans rapport avec l'offre
        (score 0) ont été masquées quand leur section contenait au moins une entrée pertinente.
        Si plus de 3 expériences correspondaient à l'offre, seules les 3 mieux notées
        (les plus récentes en cas d'égalité) ont été conservées — badge « hors top 3 ».
        Les formations ne sont jamais masquées. Vous pouvez réafficher une entrée manuellement
        via sa case « afficher ».
      </div>
      ${Object.entries(calibrageRapport).map(([section, r]) => `
      <div class="calibre-section">
        <h4>${labels[section] || section}</h4>
        <div class="calibre-meta">${r.conservees} conservée(s) · ${r.masquees} masquée(s)${r.reordonne ? " · réordonnées" : ""}${r.ecartees ? ` · ${r.ecartees} écartée(s) par la règle des 3 max` : ""}</div>
        ${r.entrees.map((en) => `
        <div class="calibre-entree ${en.masquee ? "calibre-off" : ""}">
          <span class="calibre-score">${en.score}</span>
          <span class="calibre-libelle">${esc(en.libelle)}</span>
          ${en.mots.length ? `<span class="calibre-mots">${en.mots.map(esc).join(", ")}</span>` : ""}
          ${en.ecartee ? '<span class="calibre-badge">hors top 3</span>' : (en.masquee ? '<span class="calibre-badge">masquée</span>' : "")}
        </div>`).join("")}
      </div>`).join("")}`;
}

// Association onglet → sous-fonction de rendu
const TAB_RENDERERS =
{
  "profil":        renderProfilTab,
  "experiences":   renderExperiencesTab,
  "competences":   renderCompetencesTab,
  "SoftSkill":     renderSoftSkillTab,
  "autresinformations": renderAutresInformationsTab,
  "Customisation": renderCustomisationTab,
  "analyse":       renderAnalyseTab
};

// ------------------------------------------------------------
// Changement d'onglet
// ------------------------------------------------------------
function switchTab(tabName)
{
  currentTab = tabName;
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tabName));
  renderPanel();
}

// ------------------------------------------------------------
// Rendu du panneau (délègue à la sous-fonction de l'onglet actif)
// ------------------------------------------------------------
function renderPanel()
{
  const box = $("#panel-container");
  const render = TAB_RENDERERS[currentTab];
  box.innerHTML = render ? render() : "";
  // L'analyse ne se lance qu'au clic sur #btn-analyser : ici on ne
  // fait que RESSORTIR les résultats d'une analyse déjà faite
  // (après un renderAll, ex. calibrage) — jd vide = rien à afficher.
  if (currentTab === "analyse" && jd.trim()) 
  { 
    renderJdResults(); 
  }

}

function renderJdResults()
{
  const box = $("#jd-results");
  if (!box) return;
  if (!jd.trim()) { box.innerHTML = ""; return; }

  const keywords = extractKeywords(jd);
  // ✓/✗ par correspondance canonique (synonymes + racines, cf.
  // cv-analyse.js) : "unity3d" dans le CV valide "unity" dans
  // l'offre — et l'inverse. Même espace de comparaison que le
  // calibrage (pondererMotsCles/scoreTexte), plus de sous-chaînes.
  const matches = new Set(scoreTexte(JSON.stringify(cv), pondererMotsCles(jd)).mots);
  const missing = keywords.filter((k) => !matches.has(canoniserMot(k.word)));

  const chips = keywords.map((k) =>
  {
    const ok = matches.has(canoniserMot(k.word));
    return `<span class="kw ${ok ? "ok" : "miss"}">${esc(k.word)} ${ok ? "✓" : "✗"} (${k.count})</span>`;
  }).join("");

  let alertHtml = "";
  if (missing.length > 0)
  {
    alertHtml = `<div class="alert warn"><strong>⚠ ${missing.length} mot(s)-clé absent(s) de votre CV :</strong> ${missing.map((k) => esc(k.word)).join(", ")}.<br>Vérifiez s'ils méritent d'être ajoutés à vos compétences ou missions.</div>`;
  }
  else if (keywords.length > 0)
  {
    alertHtml = `<div class="alert good">✅ Tous les mots-clés principaux de l'offre figurent dans votre CV.</div>`;
  }

  box.innerHTML = `
    <div style="margin-top:.9rem">
      <div class="hint" style="font-weight:600;color:#64748b;margin-bottom:4px">Mots-clés détectés dans l'offre :</div>
      <div class="kw-list">${chips}</div>
      ${alertHtml}
    </div>`;
}

// Rendu global (panneau + aperçu)
function renderAll()
{
  renderPanel();
  renderPreview();
}