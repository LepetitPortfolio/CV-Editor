"use strict";

// ============================================================
// main.js — Initialisation globale (chargé en dernier)
// Dépend de : accent (cv-model.js)
// ============================================================
document.documentElement.style.setProperty("--accent", accent);
document.querySelector(".swatch")?.classList.add("active");