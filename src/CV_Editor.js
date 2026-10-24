"use strict";

// ============================================================
// 1. MODÈLE DE DONNÉES
// ============================================================
const STORAGE_KEY = "cv-editor-standalone-v1";

const DEFAULT_CV = 
{
  nom: "Gérard Bouchard",
  titre: "",
  accroche: "",
  Adresse:
  {
    Ligne1: "",
    Ligne2: "",
    CodePostal: "",
    Ville: "",
    Pays: ""
  },
  email: "",
  tel: "",
  otherlinks : 
  [
    
  ],
  experiences: 
  [
    
  ],
  softskill:
  [
    
  ],
  formations: 
  [
    
  ],
  competences: 
  [
    
  ],
  autresinformations: 
  [
    
  ],
  customisation :
  {
    Template : 0,
    police : "Arial, sans-serif",
    taille : "12pt",
    couleurprincipale : "#000000",
    couleursecondaire : "#000000",
    couleurtertiaire : "#000000"
  }
  
};

const CV_FONTS =
[
  { label: "Arial",          stack: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica",     stack: "Helvetica, Arial, sans-serif" },
  { label: "Calibri",       stack: "Calibri, Arial, sans-serif" },
  { label: "Verdana",       stack: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma",        stack: "Tahoma, Verdana, sans-serif" },
  { label: "Georgia",       stack: "Georgia, serif" },
  { label: "Times New Roman", stack: "\"Times New Roman\", Times, serif" }
];

const CV_TEMPLATES =
[
  { label: 0,     stack: "Classique sobre" },
  { label: 1,     stack: "Moderne" },
  { label: 2,     stack: "Timeline minimaliste" },
  { label: 3,     stack: "Élégant serif" },
  { label: 4,     stack: "Suisse grandes majuscules" },
  { label: 5,     stack: "Compétences en tête style épuré" }
];

// Chargement (localStorage) ou défaut
let cv;
try 
{
  const raw = localStorage.getItem(STORAGE_KEY);
  cv = raw ? { ...structuredClone(DEFAULT_CV), ...JSON.parse(raw) } : structuredClone(DEFAULT_CV);
} 
catch { cv = structuredClone(DEFAULT_CV); }

let jd = "";            // job description collée
let currentTab = "profil";
let accent = cv.customisation.accent || "#000000";

// ============================================================
// 2. OUTILS
// ============================================================
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cv)); }

// ============================================================
// 3. MOTEUR DE MOTS-CLÉS (JD matching)
// ============================================================
const STOPWORDS = new Set(("le la les un une des de du au aux et ou en dans sur pour avec sans par qui que quoi dont où est sont être avoir fait faire plus moins très ce cette ces son sa ses leur nos vos je tu il elle nous vous ils elles se ne pas aussi ainsi comme mais donc or ni car si tout tous toute toutes autre autres même entre chez vers afin selon lors alors the and for with you your our their will that this from have has are was were not can all").split(" "));

function extractKeywords(text) 
{
  const counts = new Map();
  (text.toLowerCase().match(/[a-zàâçéèêëîïôûùüÿñæœ][a-zàâçéèêëîïôûùüÿñæœ+#.\-\/]*/g) || []).forEach((w) => 
  {
    const clean = w.replace(/[.\-\/]+$/, "");
    if (clean.length < 3 || STOPWORDS.has(clean)) return;
    counts.set(clean, (counts.get(clean) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

// ============================================================
// 4. RENDU DE L'APERÇU CV
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

// ============================================================
// 5. RENDU DU FORMULAIRE (par onglet)
// ============================================================
function field(label, path, value, opts = {}) 
{
  const id = "f-" + path;
  const tag = opts.textarea ? "textarea" : "input";
  return `<div class="field">
    <label for="${id}">${label}</label>
    <${tag} id="${id}" data-path="${path}" ${opts.textarea ? `rows="${opts.rows || 3}"` : ""}>${opts.textarea ? esc(value) : ""}</${tag}">
  </div>`.replace(`<${tag} id`, opts.textarea ? `<${tag} id` : `<${tag} id`) ;
}

// ============================================================
// 5a. RENDU DU FORMULAIRE — une sous-fonction par onglet
// ============================================================
function renderProfilTab()
{
  const c = cv;
  return `
      <div class="grid">
        <div class="field"><label>Nom</label><input data-bind="nom" value="${esc(c.nom)}"></div>
        <div class="field"><label>Titre</label><input data-bind="titre" value="${esc(c.titre)}"></div>
      </div>
      <div class="field" style="margin-top:.7rem"><label>Accroche</label><textarea data-bind="accroche" rows="4">${esc(c.accroche)}</textarea></div>
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
  return `
      <div class="field">
        <label>Police</label>
        <select data-bind="customisation.police">
        ${CV_FONTS.map((f) => `<option value="${esc(f.stack)}" ${c.customisation.police === f.stack ? "selected" : ""}>${esc(f.label)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Taille <span class="range-val" id="taille-val">12 px</span></label>
        <input type="range" min="2" max="50" step="1" data-bind="customisation.taille" value="12">
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

// ============================================================
// 5b. CHANGEMENT D'ONGLET
// ============================================================
function switchTab(tabName)
{
  currentTab = tabName;
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tabName));
  renderPanel();
}

// ============================================================
// 5c. RENDU DU PANNEAU (délègue à la sous-fonction de l'onglet actif)
// ============================================================
function renderPanel()
{
  const box = $("#panel-container");
  const render = TAB_RENDERERS[currentTab];
  box.innerHTML = render ? render() : "";
  if (currentTab === "poste") { renderJdResults(); }

  renderPreview();
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

// ============================================================
// 6. RENDU GLOBAL + ÉVÉNEMENTS
// ============================================================
function renderAll() 
{ 
  renderPanel(); 
  renderPreview(); 
}

// ============================================================
// 6a. AJOUT — crée un nouvel élément dans le JSON du CV
// ============================================================
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

// ============================================================
// 6b. MODIFICATION — écrit la valeur d'un champ dans le JSON du CV
// ============================================================
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

// ============================================================
// 6c. SUPPRESSION — retire un élément du JSON du CV par son index
// ============================================================
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

// ============================================================
// 6d. CÂBLAGE DES ÉVÉNEMENTS (les 3 fonctions ci-dessus)
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
      save(); 
      renderAll();
    } 
    catch { alert("Fichier JSON invalide"); }
  };
  reader.readAsText(file);
  e.target.value = "";
});

// ============================================================
// 7. MODE SOMBRE
// ============================================================
const DARK_KEY = "cv-editor-dark";

function applyTheme(dark)
{
  document.body?.classList.toggle("dark", dark);
  const btn = document.getElementById("btn-dark");
  if (btn) btn.textContent = dark ? "☀️" : "🌙";
  try { localStorage.setItem(DARK_KEY, dark ? "1" : "0"); } catch {}
}

// Init thème : préférence sauvegardée, sinon préférence système
let darkPref = false;
try
{
  const saved = localStorage.getItem(DARK_KEY);
  darkPref = saved !== null ? saved === "1" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}
catch {}

// Attachement DIFFÉRÉ : le script étant chargé dans le <head>,
// le DOM n'existe pas encore à l'exécution → on attend DOMContentLoaded.
document.addEventListener("DOMContentLoaded", () =>
{
  applyTheme(darkPref);
  document.getElementById("btn-dark")?.addEventListener("click", () =>
  {
    applyTheme(!document.body.classList.contains("dark"));
  });
});

// Init
document.documentElement.style.setProperty("--accent", accent);
document.querySelector(".swatch")?.classList.add("active");