"use strict";

// ============================================================
// cv-utils.js — Petits utilitaires génériques
// Expose : $, esc, resizePhoto
// ============================================================
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

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