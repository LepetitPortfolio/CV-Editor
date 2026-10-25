"use strict";

// ============================================================
// cv-theme.js — Mode sombre (interface uniquement)
// Expose : applyTheme, DARK_KEY
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

// Attachement DIFFÉRÉ : le script étant chargé en <head> avec defer,
// on attend DOMContentLoaded pour manipuler le DOM en toute sécurité.
document.addEventListener("DOMContentLoaded", () =>
{
  applyTheme(darkPref);
  document.getElementById("btn-dark")?.addEventListener("click", () =>
  {
    applyTheme(!document.body.classList.contains("dark"));
  });
});