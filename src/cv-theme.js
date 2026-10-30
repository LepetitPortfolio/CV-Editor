"use strict";

// ============================================================
// cv-theme.js — Mode sombre & couleur d'accent de l'interface
// Expose : applyTheme, applyEditorAccent, DARK_KEY, ACCENT_KEY
// ============================================================
const DARK_KEY = "cv-editor-dark";
const ACCENT_KEY = "cv-editor-accent";
const EDITOR_ACCENT_DEFAULT = "#ea580c";

// Bascule le mode sombre de l'INTERFACE (classe body.dark + icône du
// bouton 🌙/☀️) et persiste la préférence. Le CV reste sur fond blanc.
function applyTheme(dark)
{
  document.body?.classList.toggle("dark", dark);
  const btn = document.getElementById("btn-dark");
  if (btn) btn.textContent = dark ? "☀️" : "🌙";
  try { localStorage.setItem(DARK_KEY, dark ? "1" : "0"); } catch {}
}

// Applique la couleur d'accent de l'interface (préférence locale,
// volontairement HORS du CV et du JSON exporté).
function applyEditorAccent(color)
{
  const root = document.documentElement;
  if (!color)
  {
    root.style.removeProperty("--editor-accent");
    root.style.removeProperty("--editor-accent-soft");
    root.style.removeProperty("--editor-accent-texte");
    return;
  }
  root.style.setProperty("--editor-accent", color);
  root.style.setProperty("--editor-accent-soft", `color-mix(in srgb, ${color} 14%, #fff)`);
  // Texte posé sur les fonds accentués (boutons, logo, badges) :
  // noir si l'accent est clair (règle des 75 %, cf. texteSur dans
  // cv-utils.js) — sinon l'accent pâle rend le blanc illisible.
  root.style.setProperty("--editor-accent-texte", texteSur(color));
}

// Init thème : préférence sauvegardée, sinon préférence système
let darkPref = false;
let accentPref = "";
try
{
  const saved = localStorage.getItem(DARK_KEY);
  darkPref = saved !== null ? saved === "1" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}
catch {}
try { accentPref = localStorage.getItem(ACCENT_KEY) || ""; } catch {}

// Attachement DIFFÉRÉ : le script étant chargé en <head> avec defer,
// on attend DOMContentLoaded pour manipuler le DOM en toute sécurité.
document.addEventListener("DOMContentLoaded", () =>
{
  applyTheme(darkPref);
  document.getElementById("btn-dark")?.addEventListener("click", () =>
  {
    applyTheme(!document.body.classList.contains("dark"));
  });

  // Couleur de l'éditeur : picker dans la barre d'actions.
  // Double-clic sur le picker = retour à l'orange par défaut.
  const accentInput = document.getElementById("editor-accent-input");
  if (accentInput)
  {
    applyEditorAccent(accentPref);
    accentInput.value = accentPref || EDITOR_ACCENT_DEFAULT;
    accentInput.addEventListener("input", () =>
    {
      try { localStorage.setItem(ACCENT_KEY, accentInput.value); } catch {}
      applyEditorAccent(accentInput.value);
    });
    accentInput.addEventListener("dblclick", () =>
    {
      try { localStorage.removeItem(ACCENT_KEY); } catch {}
      accentInput.value = EDITOR_ACCENT_DEFAULT;
      applyEditorAccent("");
    });
  }
});