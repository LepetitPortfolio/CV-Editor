"use strict";

// ============================================================
// cv-panel.js — Rendu du formulaire d'édition (par onglet)
// Expose : renderXTab(), TAB_RENDERERS, switchTab, renderPanel,
//          renderJdResults, renderAll
// Dépend de : cv, jd, currentTab, CV_FONTS ($, esc, extractKeywords)
// ============================================================


// ------------------------------------------------------------
// Une sous-fonction par onglet (retourne le HTML du panneau)
// ------------------------------------------------------------
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
        ${c.photo ? `<img class="photo-thumb" src="${c.photo}" alt="Photo de profil" />` : ""}
        <div>
          <button class="btn" id="btn-photo-add">${c.photo ? "Changer la photo" : "+ Ajouter une photo"}</button>
          ${c.photo ? `<button class="btn reset" id="btn-photo-remove">Retirer</button>` : ""}
        </div>
      </div>
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
      <div class="exp-card" style="margin-top:.7rem">
        ${c.otherlinks.map((otherlinks, i) => `
        ${c.otherlinks.length > 0 ? `<button class="remove" id="btn-remove-link" data-remove="${i}" title="Supprimer">✕</button>` : ""}
        <div class="grid">
          <div class="field"><label>Libelle</label><input data-otherlinks="${i}" data-key="libelle" value="${esc(otherlinks.libelle)}"></div>
          <div class="field"><label>Adresse</label><input data-otherlinks="${i}" data-key="url" value="${esc(otherlinks.url)}"></div>
        </div>`).join("")}
        <button class="add-btn" id="btn-add-link">+ Ajouter un lien</button>
      </div>`;
}

function renderExperiencesTab()
{
  const c = cv;
  return c.experiences.map((e, i) => `
      <div class="exp-card">
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
      + `<button class="add-btn" id="btn-add-exp">+ Ajouter une expérience</button><br><br>

      ${c.formations.map((f, i) => `
      <div class="exp-card">
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
  return c.competences.map((comp, i) => `
      <div class="exp-card">
        ${c.competences.length > 0 ? `<button class="remove" id="btn-remove-comp" data-remove="${i}" title="Supprimer">✕</button>` : ""}
          <div class="field"><label>Intitulé</label><input data-comp="${i}" data-key="intitule" value="${esc(comp.intitule)}"></div>
          <div class="field"><label>Compétences (séparés par des virgules)</label><textarea data-comp="${i}" data-key="valeur" rows="2">${esc(comp.valeur)}</textarea></div>
      </div>`).join("")
      + `<button class="add-btn" id="btn-add-comp">+ Ajouter une compétence</button>`;
}

function renderSoftSkillTab()
{
  const c = cv;
  return c.softskill.map((s, i) => `
      <div class="exp-card">
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
  return c.autresinformations.map((ai, i) => `
      <div class="exp-card">
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
        <label>Couleur Principale</label>
        <input type="color" data-bind="customisation.couleurprincipale" value="${esc(c.customisation.couleurprincipale)}">
      </div>
      <div class="field">
        <label>Couleur Secondaire</label>
        <input type="color" data-bind="customisation.couleursecondaire" value="${esc(c.customisation.couleursecondaire)}">
      </div><div class="field">
        <label>Couleur Tertiaire</label>
        <input type="color" data-bind="customisation.couleurtertiaire" value="${esc(c.customisation.couleurtertiaire)}">
      </div>`;

}

function renderPosteTab()
{
  return `
      <div class="field">
        <label>Collez l'offre d'emploi (Job Description)</label>
        <textarea id="jd-input" rows="7" placeholder="Ex. Nous cherchons un Gameplay Programmer confirmé, maîtrisant C++, Unreal Engine, les 3C, l'IA (Behavior Trees), le réseau...">${esc(jd)}</textarea>
      </div>
      <div id="jd-results"></div>`;
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
  "poste":         renderPosteTab
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
  if (currentTab === "poste") 
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
  const cvText = JSON.stringify(cv).toLowerCase();
  const missing = keywords.filter((k) => !cvText.includes(k.word));

  const chips = keywords.map((k) =>
  {
    const ok = cvText.includes(k.word);
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