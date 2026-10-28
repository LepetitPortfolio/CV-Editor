"use strict";

// ============================================================
// cv-analyse.js — NOUVEAU FICHIER
// Analyse d'offre : pondération des mots-clés, scoring des
// entrées, calibrage / annulation (snapshot mémoire de session).
// Chargé APRÈS cv-keywords.js (utilise STOPWORDS) et AVANT
// cv-panel.js / cv-events.js (exposent calibrageRapport etc.).
// Expose : pondererMotsCles, scoreTexte, TEXTE_ENTREE,
//          calibrerCv, annulerCalibrage, calibrageRapport
// ============================================================

// ------------------------------------------------------------
// Mots vides additionnels (jargon RH FR/EN) — s'ajoutent aux
// STOPWORDS de cv-keywords.js pour l'analyse de l'offre.
// ------------------------------------------------------------
const EXTRA_STOPWORDS = new Set(("salaire poste profil candidat candidate candidature mission missions expérience expériences professionnel professionnelles années an ans jour jours mois temps plein complet contrat cdi cdd stage stagiaire job role work team teams company join looking seeking must should would could may more most new able within across about into salaire").split(" "));
const STOPWORDS_ANALYSE = new Set([...STOPWORDS, ...EXTRA_STOPWORDS]);

// ------------------------------------------------------------
// Tokenisation (cohérente avec cv-keywords.js, stopwords enrichis)
// ------------------------------------------------------------
function tokenizeAnalyse(text)
{
  return (String(text).toLowerCase().match(/[a-zàâçéèêëîïôûùüÿñæœ][a-zàâçéèêëîïôûùüÿñæœ+#.\-\/]*/g) || [])
    .map((w) => w.replace(/[.\-\/]+$/, ""))
    .filter((w) => w.length >= 3 && !STOPWORDS_ANALYSE.has(w));
}

// ------------------------------------------------------------
// Pondération d'une offre : Map mot → poids (1..3)
// 3+ occurrences → 3 ; 2 occurrences → 2 ; 1 occurrence → 1.
// Pas de limite de mots : les mots rares restent discriminants.
// ------------------------------------------------------------
function pondererMotsCles(offre)
{
  const counts = new Map();
  tokenizeAnalyse(offre).forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
  const poids = new Map();
  counts.forEach((count, word) =>
  {
    poids.set(word, count >= 3 ? 3 : count === 2 ? 2 : 1);
  });
  return poids;
}

// ------------------------------------------------------------
// Score d'un texte face à une pondération :
// { score: somme des poids des mots trouvés, mots: [mots] }
// ------------------------------------------------------------
function scoreTexte(texte, poids)
{
  let score = 0;
  const trouves = new Set();
  tokenizeAnalyse(texte).forEach((w) =>
  {
    const p = poids.get(w);
    if (p) { score += p; trouves.add(w); }
  });
  return { score, mots: [...trouves] };
}

// ------------------------------------------------------------
// Texte de référence d'une entrée, par collection (calibrage)
// ------------------------------------------------------------
const TEXTE_ENTREE = {
  experiences: (e) => [e.poste, e.entreprise, e.lieu, ...(e.missions || [])].filter(Boolean).join(" "),
  formations: (f) => [f.intitule, f.lieu, f.annee].filter(Boolean).join(" "),
  competences: (c) => [c.intitule, c.valeur].filter(Boolean).join(" "),
  softskill: (s) => [s.libelle, s.desc].filter(Boolean).join(" "),
  autresinformations: (a) => [a.libelle, ...(a.informations || [])].filter(Boolean).join(" ")
};

// ============================================================
// Calibrage du CV sur l'offre
// ============================================================

// Sections ciblées par le calibrage : masquage + réordonnancement.
// Les formations en sont exclues (une offre ne « match » pas des
// diplômes, et vider la section serait contre-productif).
const CIBLES_CALIBRAGE = [
  { key: "experiences",        libelle: (e) => e.poste ? e.poste + (e.entreprise ? " — " + e.entreprise : "") : "Sans intitulé" },
  { key: "competences",        libelle: (c) => c.intitule || "Sans intitulé" },
  { key: "softskill",          libelle: (s) => s.libelle || "Sans libellé" },
  { key: "autresinformations", libelle: (a) => a.libelle || "Sans libellé" }
];

// Snapshot mémoire de session (NON persisté) : le PLUS ANCIEN est
// conservé — des calibrages successifs ne l'écrasent pas, "Annuler"
// ramène donc toujours à l'état d'avant le premier calibrage.
let calibrageSnapshot = null;
let calibrageRapport = null;

// Applique le calibrage. Renvoie true si un rapport a été produit.
function calibrerCv()
{
  if (!jd.trim()) return false;
  const poids = pondererMotsCles(jd);
  if (poids.size === 0) return false;

  // 1. Snapshot (une seule fois, tant que l'annulation n'a pas eu lieu)
  if (!calibrageSnapshot)
  {
    calibrageSnapshot = { sections: {} };
    CIBLES_CALIBRAGE.forEach(({ key }) =>
    {
      calibrageSnapshot.sections[key] = {
        ordre: cv[key].map((it) => it),                      // copie de l'ordre
        affiches: cv[key].map((it) => it.affiche !== false)  // copie des drapeaux
      };
    });
  }

  // 2. Score + tri stable (score décroissant) + masquage ciblé
  calibrageRapport = {};
  CIBLES_CALIBRAGE.forEach(({ key, libelle }) =>
  {
    const arr = cv[key];
    if (!arr.length) return;
    const scores = arr.map((it) => scoreTexte(TEXTE_ENTREEkey, poids));
    const auMoinsUne = scores.some((s) => s.score > 0);

    // Masquage : uniquement si la section contient une entrée pertinente.
    // Score 0 → affiche: false ; score > 0 → drapeau utilisateur préservé.
    if (auMoinsUne)
    {
      arr.forEach((it, i) =>
      {
        if (scores[i].score === 0 && it.affiche !== false)
        {
          it.affiche = false;
        }
      });
    }

    // Réordonnancement : tri stable par score décroissant
    // (les ex æquo conservent l'ordre relatif choisi par l'utilisateur).
    const tri = arr.map((it, i) => ({ it, i })).sort((a, b) => scores[b.i].score - scores[a.i].score);
    if (tri.some((t, pos) => t.i !== pos))
    {
      arr.splice(0, arr.length, ...tri.map((t) => t.it));
    }

    const reordonne = tri.some((t, pos) => t.i !== pos);
    const masquees = arr.reduce((n, it) => n + (it.affiche === false ? 1 : 0), 0);
    calibrageRapport[key] = {
      conservees: arr.length - masquees,
      masquees,
      reordonne,
      entrees: arr.map((it, i) => ({
        libelle: libelle(it),
        score: scores[i].score,
        mots: scores[i].mots,
        masquee: it.affiche === false
      }))
    };
  });

  return true;
}

// Annule le calibrage : restaure l'ordre ET les drapeaux d'affichage
// d'avant le premier calibrage (mémoire de session uniquement).
function annulerCalibrage()
{
  if (!calibrageSnapshot) return false;
  CIBLES_CALIBRAGE.forEach(({ key }) =>
  {
    const s = calibrageSnapshot.sections[key];
    if (!s) return;
    cv[key].splice(0, cv[key].length, ...s.ordre);
    cv[key].forEach((it, i) =>
    {
      if (s.affiches[i]) delete it.affiche;
      else it.affiche = false;
    });
  });
  calibrageSnapshot = null;
  calibrageRapport = null;
  return true;
}