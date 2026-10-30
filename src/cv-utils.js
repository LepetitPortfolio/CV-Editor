"use strict";

// ============================================================
// cv-utils.js — Petits utilitaires génériques
// Expose : $, esc, resizePhoto
// ============================================================
const $ = (sel) => document.querySelector(sel);

// Échappe les caractères HTML d'une valeur saisie : TOUT texte injecté
// dans un template string passe par esc() — jamais d'injection possible.
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Couleur de TEXTE lisible posée sur un fond donné : noir si le fond
// est clair — moyenne des composantes RGB >= 75 % de 255, règle
// choisie pour les bandeaux/badges du CV —, blanc sinon. Accepte
// #rgb et #rrggbb (les sélecteurs <input type="color"> produisent
// toujours #rrggbb) ; toute valeur exotique retombe sur blanc, le
// comportement historique. Exemples : #000000 → blanc, #c0c0c0
// (moyenne 192) → noir, #bebebe (moyenne 190) → blanc.
function texteSur(couleur)
{
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(couleur || "").trim());
  if (!m) return "#ffffff";
  let h = m[1];
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r + g + b) / 3 >= 0.75 * 255 ? "#000000" : "#ffffff";
}

// Réduit une image à MAX px de large et renvoie un dataURL JPEG.
// Le localStorage (~5 Mo) ne pourrait pas accueillir des photos brutes.
function resizePhoto(file, cb)
{
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () =>
  {
    const MAX = 300; // largeur max — largement suffisant pour un visage CV
    const scale = Math.min(1, MAX / img.width);
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    cb(c.toDataURL("image/jpeg", 0.85));
  };
  img.onerror = () => { URL.revokeObjectURL(url); alert("Image illisible"); };
  img.src = url;
}