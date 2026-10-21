"use strict";

// ============================================================
// 1. MODÈLE DE DONNÉES
// ============================================================
const STORAGE_KEY = "cv-editor-standalone-v1";

const DEFAULT_CV = 
{
  nom: "Simon Lepetit",
  titre: "Programmeur Gameplay",
  accroche: "Développeur de jeux expérimenté, spécialisé en C++, C# ainsi que sur les moteurs Unreal Engine et Unity 3D. Passionné par les expériences immersives, je mets mes compétences techniques et créatives au service de la création de jeux innovants et captivants.",
  email: "Simon.Lepetit1@gmail.com",
  tel: "06 58 26 44 83",
  otherlinks : 
  [
    {
      libelle: "GitHub",
      url: "github.com/simonlepetit"
    }
  ],
  experiences: 
  [
    {
      poste: "Programmeur Gameplay", entreprise: "OSC Games", lieu: "Montpellier",
      debut: "01/2024", fin: "02/2025",
      missions: [
        "Développement d'un système de missions avec progression et récompenses.",
        "Gestion complète de l'apparition, de la disparition et du comportement des IA.",
        "Création de processus pour la sauvegarde et la gestion des données des joueurs."
      ]
    },
    {
      poste: "Programmeur Gameplay", entreprise: "NKX Studio", lieu: "Montpellier",
      debut: "01/2023", fin: "10/2023",
      missions: [
        "Développement des 3C en fonction du gameplay.",
        "Création et intégration d'une IA adaptée au game-design.",
        "Développement d'une composante multijoueur liée au gameplay."
      ]
    }
  ],
  softskill:
  [
    {
      libelle: "",
      desc : ""
    }
  ],
  formations: 
  [
    { intitule: "Formation Programmeur Gameplay", lieu: "Objectif 3D, Montpellier", annee: "2014 – 2016" },
    { intitule: "BTS SIO Option SLAM", lieu: "Lycée La Colinière, Nantes", annee: "2012 – 2014" }
  ],
  competences: 
  [
    {
      intitule : "Langages",
      valeur : "C++, C#, Java, JavaScript, Python"
    },
    {
      intitule : "Moteurs",
      valeur : "Unity 3D, Unreal Engine, UEFN"
    },
    {
      intitule : "Outils",
      valeur : "Git, Perforce, Visual Studio, JIRA"
    }
  ],
  customisation :
  {
    police : "Arial, sans-serif",
    taille : "12pt",
    couleur : "#000000",
    accent : "#000000"
  }
  
};

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
  const contacts = ["Tel : " + c.tel, "Mail : " + c.email].filter(Boolean).map(esc).join(" · ");
  const links = c.otherlinks.map((l) => `<div class="cv-skill-line"><strong>${esc(l.libelle)} : </strong><a href="${esc(l.url)}" target="_blank">${esc(l.url)}</a>`).join(" · ");
  
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

function renderPanel() 
{
  const c = cv;
  const box = $("#panel-container");
  let html = "";

  if (currentTab === "profil") 
  {
    html = `
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

  if (currentTab === "experiences") 
  {
    html = c.experiences.map((e, i) => `
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
      + `<button class="add-btn" id="btn-add-exp">+ Ajouter une expérience</button>

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

  if (currentTab === "competences") 
  {
    html =
      c.competences.map((comp, i) => `
      <div class="exp-card">
        ${c.competences.length > 0 ? `<button class="remove" id="btn-remove-comp" data-remove="${i}" title="Supprimer">✕</button>` : ""}
          <div class="field"><label>Intitulé</label><input data-comp="${i}" data-key="intitule" value="${esc(comp.intitule)}"></div>
          <div class="field"><label>Compétences (séparés par des virgules)</label><textarea data-comp="${i}" data-key="valeur" rows="2">${esc(comp.valeur)}</textarea></div>
      </div>`).join("")
      + `<button class="add-btn" id="btn-add-comp">+ Ajouter une compétence</button>`;
  }

  if(currentTab === "SoftSkill")
  {
    html = c.softskill.map((s, i) => `
      <div class="exp-card">
        ${c.softskill.length > 0 ? `<button class="remove" id="btn-remove-softskill" data-remove="${i}" title="Supprimer">✕</button>` : ""}
        <div class="grid">
          <div class="field"><label>Libelle</label><input data-softskill="${i}" data-key="libelle" value="${esc(s.libelle)}"></div>
          <div class="field"><label>Description</label><input data-softskill="${i}" data-key="desc" value="${esc(s.desc)}"></div>
        </div>
      </div>`).join("")
      + `<button class="add-btn" id="btn-add-softskill">+ Ajouter un Soft skill</button>`;
  }

  if(currentTab === "Customisation")
  {
    html = `
      <div class="field">
        <label>Police</label>
        <input data-bind="customisation.police" value="${esc(c.customisation.police)}">
      </div>
      <div class="field">
        <label>Taille</label>
        <input data-bind="customisation.taille" value="${esc(c.customisation.taille)}">
      </div>
      <div class="field">
        <label>Couleur</label>
        <input type="color" data-bind="customisation.couleur" value="${esc(c.customisation.couleur)}">
      </div>
      <div class="field">
        <label>Accent</label>
        <input type="color" data-bind="customisation.accent" value="${esc(c.customisation.accent)}">
      </div>`;
  }

  if (currentTab === "poste")
  {
    html = `
      <div class="field">
        <label>Collez l'offre d'emploi (Job Description)</label>
        <textarea id="jd-input" rows="7" placeholder="Ex. Nous cherchons un Gameplay Programmer confirmé, maîtrisant C++, Unreal Engine, les 3C, l'IA (Behavior Trees), le réseau...">${esc(jd)}</textarea>
      </div>
      <div id="jd-results"></div>`;
  }

  box.innerHTML = html;
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

document.addEventListener("input", (e) => {
  const t = e.target;
  
  console.log(t);

  if (t.dataset.bind) 
  {
    cv[t.dataset.bind] = t.value;
  }
  else if (t.dataset.otherlinks !== undefined) 
  {
    console.log(t.dataset);
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
  else if (t.dataset.bind && t.dataset.bind.startsWith("customisation."))
  {
    const key = t.dataset.bind.split(".")[1];
    cv.customisation[key] = t.value;
    if(key === "accent")
    {
      accent = t.value;
      document.documentElement.style.setProperty("--accent", accent);
      document.querySelectorAll(".swatch").forEach((s) => s.classList.toggle("active", s.dataset.accent === accent));
    }
  }
  else if (t.id === "jd-input") 
  {
    jd = t.value;
    renderJdResults();
    return; // pas besoin de rerendre le CV pour la JD
  } 
  else 
  {
    return;
  }

  save();
  renderPreview();
});

// Clics (tabs, boutons, suppressions)
document.addEventListener("click", (e) => 
{
  const t = e.target;

  console.log(t.id);

  if (t.classList.contains("tab")) 
  {
    currentTab = t.dataset.tab;
    document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b === t));
    renderPanel();
    return;
  }
  if (t.classList.contains("swatch"))
  {
    accent = t.dataset.accent;
    document.documentElement.style.setProperty("--accent", accent);
    document.querySelectorAll(".swatch").forEach((s) => s.classList.toggle("active", s === t));
    return;
  }
  if (t.id === "btn-add-exp") 
  {
    cv.experiences.push({ poste: "", entreprise: "", lieu: "", debut: "", fin: "", missions: [""] });
    save(); 
    renderAll(); 
    return;
  }

  if(t.id === "btn-add-link")
  {
    console.log("Adding link");
    cv.otherlinks.push({ libelle: "", url: "" });
    save(); 
    renderAll(); 
    return;
  }

  if (t.id === "btn-add-edu") 
  {
    cv.formations.push({ intitule: "", lieu: "", annee: "" });
    save(); 
    renderAll(); 
    return;
  }

  if(t.id === "btn-add-comp")
  {
    cv.competences.push({ intitule: "", valeur: "" });
    save(); 
    renderAll(); 
    return;
  }

  if(t.id === "btn-add-softskill")
  {
    cv.softskill.push({ libelle: "", desc: "" });
    save(); 
    renderAll(); 
    return;
  }

   if(t.id === "btn-remove-link")
  {
    if(t.dataset.remove !== undefined)
    {
      cv.otherlinks.splice(+t.dataset.remove, 1);
      save(); 
      renderAll();
    }
    return;
  }

  if(t.id === "btn-remove-exp")
  {
    if(t.dataset.remove !== undefined)
    {
      cv.experiences.splice(+t.dataset.remove, 1);
      save(); 
      renderAll();
    }
    return;
  }

  if(t.id === "btn-remove-edu")
  {
    if(t.dataset.remove !== undefined)
    {
      cv.formations.splice(+t.dataset.remove, 1);
      save(); 
      renderAll();
    }
    return;
  }

  if(t.id === "btn-remove-comp")
  {
    if(t.dataset.remove !== undefined)
    {
      cv.competences.splice(+t.dataset.remove, 1);
      save(); 
      renderAll();
    }
    return;
  }

  if(t.id === "btn-remove-softskill")
  {
    if(t.dataset.remove !== undefined)
    {
      cv.softskill.splice(+t.dataset.remove, 1);
      save(); 
      renderAll();
    }
    return;
  }

});

// Export / Import / Print
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

// Init
document.documentElement.style.setProperty("--accent", accent);
document.querySelector(".swatch").classList.add("active");
