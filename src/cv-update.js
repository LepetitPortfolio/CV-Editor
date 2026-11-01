"use strict";

// ============================================================
// cv-update.js — Détection de mise à jour disponible
// Compare APP_VERSION (code exécuté) à ./version.json (en ligne,
// servi sans cache). Différence → bannière « Actualiser ».
// Vérifie au chargement, puis toutes les 10 minutes (l'utilisateur
// qui laisse un onglet ouvert est prévenu sans recharger).
// ============================================================
(function verifMiseAJour()
{
  const INTERVAL = 10 * 60 * 1000;

  async function tester()
  {
    try
    {
      // cache: "no-store" = on force le réseau : PAS le cache HTTP,
      // sinon on compare la version en ligne à elle-même, vieux cache
      // inclus — et l'utilisateur garde ses vieux fichiers pour rien.
      const rep = await fetch("./version.json", { cache: "no-store" });
      if (!rep.ok) return;
      const enLigne = (await rep.json()).version;
      if (enLigne !== APP_VERSION) afficherBanniere(enLigne);
    }
    catch { /* hors-ligne : on réessaiera au prochain tic, pas grave */ }
  }

  function afficherBanniere(v)
  {
    if (document.getElementById("cv-update-banner")) return; // déjà affichée
    const b = document.createElement("div");
    b.id = "cv-update-banner";
    b.innerHTML =
      `🔄 Version ${v} disponible — ` +
      `<button id="cv-update-reload">Actualiser</button>` +
      ` <button id="cv-update-dismiss">✕</button>`;
    document.body.appendChild(b);
    document.getElementById("cv-update-reload").addEventListener("click", () => location.reload());
    document.getElementById("cv-update-dismiss").addEventListener("click", () => b.remove());
  }

  tester();
  setInterval(tester, INTERVAL);
})();