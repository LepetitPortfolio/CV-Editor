# 📝 CV-Editor

**Éditeur de CV local, autonome et compatible ATS.** Ouvrez `index.html` dans un navigateur, éditez votre CV avec aperçu en temps réel, et exportez un PDF A4 au texte sélectionnable — le format que les logiciels de tri de candidatures (ATS) lisent le mieux.

> 🎯 **100 % local & privé** : aucune donnée ne quitte votre machine. Pas de backend, pas de compte, pas de tracking. Fonctionne par simple double-clic (`file://`).

> 🌐 **Version en ligne** : [simon.lepetit.free.fr/CV_Editor](http://simon.lepetit.free.fr/CV_Editor/) — même code, hébergé chez Free. Le dépôt GitHub reste la version de référence.

---

## ✨ Fonctionnalités

### Édition & aperçu
- **Aperçu live** — le CV se met à jour à chaque frappe
- **7 onglets d'édition** : Profil (avec adresse postale structurée), Expériences, Compétences, Soft-Skills, Autres Informations, Personnalisation, Poste ciblé
- **Persistance automatique** — sauvegarde dans le `localStorage` à chaque modification
- **Ajout/suppression dynamiques** d'expériences, formations, compétences, liens, soft-skills et sections libres (« Autres Informations » : libellé + liste d'infos)
- **🗑 Recommencer de zéro** — bouton de remise à plat des données locales, avec confirmation (action irréversible)

### Templates & personnalisation
- **Système de templates** — liste déroulante de **6 modèles, tous implémentés** : « Classique sobre » (mono-colonne ATS), « Moderne » (bandeau coloré, sections à barre latérale), « Timeline minimaliste » (épuré, titres soulignés, filet pleine largeur), « Élégant serif » (accents dorés, titres centrés, contact encadré), « Suisse grandes majuscules » (typographie brute, badges de section pleins) et « Compétences en tête » (chips de compétences clés générées automatiquement). Une valeur inconnue retombe défensivement sur le Classique.
- **Convention de couleurs** — 3 couleurs de customisation au rôle identique dans tous les templates :
  | Couleur | Rôle |
  |---|---|
  | `couleurprincipale` | Textes forts (h1, intitulés, bandeau / titres de section du Moderne) |
  | `couleursecondaire` | Accents (titre du CV, filet d'en-tête, titres de section, dates) |
  | `couleurtertiaire` | Texte commun du CV (rarement changée) |
- **Police** : liste déroulante de 7 polices sûres pour les ATS (Arial, Helvetica, Calibri, Verdana, Tahoma, Georgia, Times New Roman), avec pile CSS et fallback. Stockée en **index numérique** (0–6) dans le JSON, avec **migration automatique** des anciennes données au chargement
- **Taille** : slider (2–50 px), initialisé sur la valeur sauvegardée, **libellé « N px » rafraîchi en direct** pendant le glissement
- **Mode sombre 🌙** : bascule d'un clic, préférence sauvegardée, détection de la préférence système (`prefers-color-scheme`). Le CV reste sur fond blanc — le mode sombre ne concerne que l'interface d'édition

### Export
- **🖨 Exporter PDF (ATS)** — seul le CV est imprimé, en A4, texte sélectionnable, sans en-têtes/pieds de page du navigateur, fond blanc garanti quel que soit le thème actif
- **⬇ Export / ⬆ Import JSON** — sauvegardez et réimportez vos données de CV. L'import (comme le chargement initial) utilise une **fusion profonde** (`deepMerge`) : un JSON partiel complète les valeurs par défaut au lieu d'écraser des sections entières

### Analyse de mots-clés (onglet « Poste ciblé »)
- Collez une offre d'emploi : l'outil extrait ses mots-clés principaux (stopwords FR/EN filtrés, top 12 par fréquence)
- Chaque mot-clé est comparé au contenu de votre CV (✓ présent / ✗ absent), avec alerte récapitulative des manquants

## 🚀 Utilisation

Aucune installation nécessaire :

- **En ligne** : ouvrez directement [la version hébergée](http://simon.lepetit.free.fr/CV_Editor/).
- **En local** :
  1. Cloner le dépôt (ou télécharger les fichiers) :
     ```bash
     git clone https://github.com/LepetitPortfolio/CV-Editor.git
     ```
  2. Ouvrir `src/index.html` dans un navigateur (double-clic suffit).
  3. Éditer votre CV — tout est sauvegardé automatiquement.
  4. Exporter :
     - **🖨 Exporter PDF (ATS)** → dans la boîte de dialogue, choisir **« Enregistrer au format PDF »** ;
     - **⬇ Export JSON** → télécharge `mes-donnees-cv.json` ;
     - **⬆ Import JSON** → restaure un CV précédemment exporté.

## 🗂 Structure du projet

Le JavaScript est découpé en modules chargés via des `<script defer>` **dans l'ordre des dépendances** (de la fondation de données vers le câblage des événements). Fonctionne en `file://` sans serveur local — contrairement aux modules ES.

```
CV-Editor/
├── src/
│   ├── index.html       # Structure : topbar, onglets, aperçu + les 9 balises <script defer>
│   ├── cv-editor.css    # UI (--editor-*), styles du CV (--cv-*), mode sombre, @media print
│   ├── cv-model.js      # Données : DEFAULT_CV, CV_FONTS, CV_TEMPLATES, deepMerge(), état global, save()
│   ├── cv-utils.js      # Utilitaires : $, esc (échappement HTML anti-XSS)
│   ├── cv-keywords.js   # Moteur de mots-clés : STOPWORDS, extractKeywords()
│   ├── cv-preview.js    # Rendu du CV : renderPreview() (convention couleurs) + 1 fonction par template
│   ├── cv-panel.js      # Formulaires : un renderXTab() par onglet, TAB_RENDERERS, switchTab(), renderPanel(), renderJdResults(), renderAll()
│   ├── cv-actions.js    # Actions JSON : updateCvField() répartiteur + sous-fonctions write* (), addCvItem(), removeCvItem()
│   ├── cv-events.js     # Câblage : listeners input/change/click, export/import/print/reset
│   ├── cv-theme.js      # Mode sombre : applyTheme(), persistance, préférence système
│   └── main.js          # Init (chargé en dernier)
├── analyse-technique-éditeur-de-cv-avec-export-pdf-compatible-ats.pdf
└── .gitattributes
```

## 🧠 Architecture

Modèle **state-first** : un objet `cv` (JSON) est l'unique source de vérité. Chaque interaction modifie cet objet, le persiste (`save()` → `localStorage`), puis relance le rendu.

```mermaid
flowchart LR
    M[cv-model.js<br/>données + état] --> A[cv-actions.js<br/>add / update / remove]
    U[cv-utils.js] --> P[cv-panel.js<br/>onglets + formulaires]
    U --> V[cv-preview.js<br/>convention couleurs<br/>+ 1 fonction par template]
    K[cv-keywords.js] --> P
    A --> E[cv-events.js<br/>câblage]
    P --> E
    V --> E
    E --> I[main.js<br/>init]
    G[cv-theme.js] -->|body.dark| H[Interface<br/>le CV reste clair]
```

### Patrons de conception utilisés

- **Table d'association (plugin pattern)** : `TAB_RENDERERS` (onglet → sous-fonction de rendu), `ADD_ACTIONS` / `REMOVE_ACTIONS` (bouton → action sur le JSON), `CV_TEMPLATES` / `CV_FONTS` (listes de configuration). Ajouter un type d'élément, un onglet ou un template = quelques lignes, sans toucher aux cascades.
- **Séparation des responsabilités** : `cv-actions.js` manipule le JSON sans connaître le DOM — `updateCvField()` n'est qu'un **répartiteur** qui délègue à une sous-fonction par partie du modèle (`writeCustomisation`, `writeAdresse`, `writeCvRoot`, `writeListItem` via la table `LIST_TARGETS`) ; `cv-events.js` attache les listeners et orchestre `save()` + rendus ; les modules de rendu produisent du HTML pur. Chaque fonction de rendu fait une seule chose : `renderPanel()` (panneau), `renderPreview()` (aperçu), `renderAll()` (orchestrateur).
- **Système de templates** : `renderPreview()` pose d'abord la **convention de couleurs commune** (variables CSS sur `#cv-preview`), retire les habillages de page des autres templates (classes `tpl-minimaliste`, `tpl-serif`), puis route via un `switch` vers une sous-fonction par template (`PreviewClassiqueCV` n°0, `PreviewModerneCV` n°1, `PreviewMinimalisteCV` n°2, `PreviewElegantSerifCV` n°3, `PreviewSuisseCV` n°4, `PreviewCompetencesCV` n°5), avec repli défensif sur le Classique.
- **Deux systèmes de couleurs étanches** : l'interface utilise `--editor-accent` (et déclinaisons), le CV utilise exclusivement `--cv-principale` / `--cv-secondaire` / `--cv-tertiaire` / `--cv-ink` — changer les couleurs du CV n'affecte jamais l'éditeur, et réciproquement.

### Points techniques notables

- **`defer` ordonné** : les scripts s'exécutent séquentiellement après le parsing, garantissant la disponibilité des définitions ; l'ordre des balises dans `index.html` documente l'architecture.
- **Délégation d'événements anti-double** : un handler `onFieldChange` sur `document` pour `input` **et** `change`, routé via les attributs `data-bind`, `data-exp`, `data-edu`, `data-comp`, `data-softskill`, `data-autresinformations`, `data-otherlinks`, `data-remove`. Filtrage par type d'élément : les `<select>` ne traitent que `change` (leur `input` dupliqué est ignoré), les `<input type="color">` ne traitent que leurs `input` live (le `change` final redondant est ignoré).
- **Routage des `data-bind` à points** : `customisation.*` et `adresse.*` sont écrits dans leurs sous-objets respectifs via le répartiteur `updateCvField()` — un `data-bind` n'écrit jamais que dans une seule cible (retours explicites, pas de retombée). Les clés `Template` et `police` sont stockées en nombre.
- **Fusion profonde à l'import et au chargement** : `deepMerge(DEFAULT_CV, incoming)` complète les valeurs manquantes à toutes les profondeurs (les tableaux restent ceux de l'entrant), sans jamais muter `DEFAULT_CV` (`structuredClone` à chaque niveau) ; `normalizePolice()` migre les anciens formats de police vers l'index valide.
- **Champs multi-lignes** : les `missions` et `informations` sont stockées en tableaux (`split("\n")`) et restituées ligne par ligne ; les entrées vides sont filtrées au rendu (soft-skills, liens, sections libres).
- **Export PDF propre** : `@media print` masque l'interface mais **déshabille** `.preview-frame` au lieu de le cacher (cacher le parent du CV produirait une page blanche) ; `@page { margin: 0 }` supprime les en-têtes/pieds de page du navigateur (« 1 sur 1 », date, URL), les marges visibles étant recréées par le `padding: 12mm` du CV ; `html, body { background: #fff !important; }` garantit un fond blanc même en mode sombre ; `break-inside: avoid` empêche les coupures au milieu d'un bloc.
- **Échappement systématique (`esc`)** : toutes les valeurs saisies sont échappées avant injection.

## 📄 Modèle de données (JSON)

```json
{
  "nom": "", "titre": "", "accroche": "", "email": "", "tel": "",
  "adresse": { "ligne1": "", "ligne2": "", "codePostal": "", "ville": "", "pays": "" },
  "otherlinks": [{ "libelle": "GitHub", "url": "..." }],
  "experiences": [{
    "poste": "", "entreprise": "", "lieu": "",
    "debut": "MM/AAAA", "fin": "MM/AAAA",
    "missions": ["une mission par ligne"]
  }],
  "formations": [{ "intitule": "", "lieu": "", "annee": "" }],
  "competences": [{ "intitule": "", "valeur": "Unity, Unreal..." }],
  "softskill": [{ "libelle": "", "desc": "" }],
  "autresinformations": [{ "libelle": "Langues", "informations": ["une info par ligne"] }],
  "customisation": {
    "Template": 0,
    "police": 0,
    "taille": 12,
    "couleurprincipale": "#000000",
    "couleursecondaire": "#000000",
    "couleurtertiaire": "#000000"
  }
}
```

## 🛠 Technologies

- **HTML5 / CSS3** : variables CSS (convention `--editor-*` / `--cv-*`), flexbox, `@media print`, `@page`, `calc()`, `accent-color`
- **JavaScript vanilla** (ES2020+ : `structuredClone`, optional chaining `?.`, délégation d'événements)
- **APIs navigateur** : `localStorage`, `FileReader`, `Blob`/`URL.createObjectURL`, `window.print()`, `matchMedia`, `dataset`

Aucune dépendance externe, aucun outil de build.

## ⚠️ Limitations & choix assumés

- **Bandeau du Moderne dans les marges** : le bandeau coloré s'arrête aux limites de `.cv-page` (padding blanc autour) — choix volontaire pour rester propre à l'impression, mais un bandeau pleine largeur demanderait des marges négatives.
- **Chips du template « Compétences en tête »** : générées par découpe des valeurs du champ Compétences sur les virgules — pas de liste de chips indépendante.
- **Validation d'import légère** : la fusion profonde complète les clés manquantes, mais un JSON au types inattendus (tableau là où un objet est attendu, valeurs `null`) n'est pas rejeté.
- **CV multi-pages** : le `padding` du CV ne se répète pas aux sauts de page (contenu proche du bord en page 2+).
- **Analyse de mots-clés basique** (fréquence) : pas de synonymes ni de racinisation (stemming).
- **Données liées au navigateur** (localStorage) : pensez à l'export JSON pour sauvegarder.

## 🗺 Améliorations possibles

- Validation de la forme à l'import (rejeter types inattendus / `null`)
- Liste de chips indépendante pour le template « Compétences en tête » (champ dédié dans le modèle)
- Choix de l'ordre des sections et masquage de sections optionnelles
- Migration progressive vers les modules ES si un jour un serveur local ne fait pas peur (le découpage actuel est déjà « module-ready »)

## 🔗 Liens

- 🌐 **Version en ligne** : [simon.lepetit.free.fr/CV_Editor](http://simon.lepetit.free.fr/CV_Editor/) — même code, hébergé chez Free

*(Le code source, c'est la page même où vous lisez ce README — et mon profil GitHub est accessible dans le header du site.)*

---

*Made with vanilla HTML/CSS/JS — no framework was harmed in the making of this tool.*