"use strict";

// ============================================================
// cv-keywords.js — Moteur de mots-clés (JD matching)
// Expose : STOPWORDS, extractKeywords
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