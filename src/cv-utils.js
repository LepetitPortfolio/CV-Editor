"use strict";

// ============================================================
// cv-utils.js — Petits utilitaires génériques
// Expose : $, esc
// ============================================================
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));