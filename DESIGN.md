---
name: Le Cabinet des Fées - Brest
description: L'atelier de la fée marraine. Feutre de mousse, lin, papier de soie et un fil d'or qui relie chaque section à l'appel.
colors:
  moss-felt: "#4F5A34"
  moss-lining: "#262D16"
  lichen-linen: "#D9CFA5"
  tissue-cream: "#FCF5EC"
  ink-moss: "#2A3017"
  gold-thread: "#E7BD4F"
  gold-thread-deep: "#9B7620"
  gold-thread-text: "#F2D27A"
typography:
  display:
    fontFamily: "Gloock, Iowan Old Style, Georgia, serif"
    fontSize: "min(14.6vw, 26svh)"
    fontWeight: 400
    lineHeight: 0.93
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Gloock, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2.5rem, 1.1rem + 6.4vw, 7.6rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Gloock, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(1.8rem, 1.1rem + 1.6vw, 2.7rem)"
    fontWeight: 400
    lineHeight: 1.04
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.95rem + 0.22vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    letterSpacing: "0.07em"
  script:
    fontFamily: "Ballet, Snell Roundhand, cursive"
    fontSize: "1.42em"
    fontWeight: 400
rounded:
  patch: "6px"
  pill: "999px"
  leaf: "130px"
  arch: "170px"
spacing:
  gutter: "clamp(20px, 4.4vw, 76px)"
  section: "clamp(90px, 15vh, 190px)"
  nav: "76px"
components:
  button-gold:
    backgroundColor: "{colors.gold-thread}"
    textColor: "{colors.moss-lining}"
    rounded: "{rounded.pill}"
    padding: "0.82em 1.5em"
  button-gold-hover:
    backgroundColor: "{colors.tissue-cream}"
    textColor: "{colors.moss-lining}"
  button-moss:
    backgroundColor: "{colors.moss-felt}"
    textColor: "{colors.tissue-cream}"
    rounded: "{rounded.pill}"
    padding: "0.82em 1.5em"
  button-moss-hover:
    backgroundColor: "{colors.gold-thread}"
    textColor: "{colors.moss-lining}"
  chip:
    backgroundColor: "{colors.moss-lining}"
    textColor: "{colors.tissue-cream}"
    rounded: "{rounded.pill}"
    padding: "0.62em 1.15em"
  chip-selected:
    backgroundColor: "{colors.gold-thread}"
    textColor: "{colors.moss-lining}"
  patch-felt:
    backgroundColor: "{colors.moss-felt}"
    textColor: "{colors.tissue-cream}"
    rounded: "{rounded.patch}"
    padding: "clamp(14px, 2vw, 28px)"
  card-soin-moss:
    backgroundColor: "{colors.moss-felt}"
    textColor: "{colors.tissue-cream}"
    rounded: "{rounded.leaf}"
    padding: "clamp(30px, 2.6vw, 44px)"
  review-card:
    backgroundColor: "{colors.tissue-cream}"
    textColor: "{colors.ink-moss}"
    rounded: "{rounded.patch}"
    padding: "clamp(32px, 4vw, 62px)"
---

# Design System: Le Cabinet des Fées - Brest

## Overview

**Creative North Star: "L'atelier de la fée marraine"**

Le site est un atelier de couture où l'on taille le bien-être sur mesure. Les grands aplats sont du feutre de mousse, les rubans du lin, les pages de lecture du papier de soie ; un seul fil d'or court d'une section à l'autre, des premiers points du préchargeur jusqu'au bouton « Appeler ». Rien n'est lisse ni hygiénique : tout a été coupé aux ciseaux à cranter, cousu, bouclé, boutonné.

L'énergie est celle d'un conte : titres à l'échelle de l'écran, lucioles dorées, feuilles-ailes appliquées au point droit. Le ton reste doux : jamais d'urgence, jamais de promotion criarde. Le mouvement est spectaculaire mais lent, en exponentielle sortante.

**Key Characteristics:**
- Trois couleurs imposées (mousse, lin, crème) + une doublure sombre + un fil d'or comme unique accent.
- Un vocabulaire de couture : bords crantés, points de croix, appliqué cousu, boutons à quatre trous, courtepointe.
- Un fil rouge : le fil d'or, dessiné en SVG et révélé au défilement.
- Titres Gloock gigantesques, texte Hanken Grotesk, quelques mots d'or en Ballet.
- Photographies de faible définition traitées comme une toile tissée (trame de points de croix).

## Colors

Une palette de matières naturelles, tenue par un seul éclat doré.

### Primary
- **Feutre de mousse** (#4F5A34): le grand aplat de marque (hero, chiffres, pied de page, cartes « corps »). Le texte crème dessus atteint un contraste de 6,8:1.

### Secondary
- **Lin** (#D9CFA5): rubans, fonds des soins et des avis, patchs en toile. Texte d'encre dessus.
- **Doublure** (#262D16): la « nuit » : fin du rituel, appel à l'action, arches. Sert aussi de couleur de texte sur or.

### Tertiary
- **Fil d'or** (#E7BD4F): fil, lucioles, boutons d'action, étoiles. Sur fond clair il reste décoratif (jamais du texte).
- **Fil d'or lisible** (#F2D27A): texte doré sur mousse ou doublure (≥ 4,5:1), par exemple « Douceur » et « évader ».
- **Fil d'or sombre** (#9B7620): traits dorés sur crème ou lin (progression, étoile des avis).

### Neutral
- **Papier de soie** (#FCF5EC): fond de lecture et texte sur sombre.
- **Encre de mousse** (#2A3017): texte courant sur crème et lin.

### Named Rules
**The One Thread Rule.** L'or est le seul accent. Il désigne soit le fil, soit une action, soit de la lumière (lucioles, étoiles). Jamais deux dorés concurrents dans le même regard, jamais de dégradé.

**The Cream-On-Moss Rule.** Les textes sur mousse sont crème (#FCF5EC) ou or lisible (#F2D27A) ; l'or standard (#E7BD4F) ne porte du texte que s'il est grand ou posé sur la doublure.

## Typography

**Display Font:** Gloock (Iowan Old Style, Georgia en repli)
**Body Font:** Hanken Grotesk, variable 100-900 (system-ui en repli)
**Script Font:** Ballet, réservée à un mot par composition

**Character:** Gloock est un didone doux aux empattements chauds : il donne à la fois l'allure d'une étiquette de couture haute et la tendresse d'un livre de contes. Hanken Grotesk reste neutre et lisible pour tout ce qui se lit. Ballet n'est qu'un éclat de lumière sur un mot.

### Hierarchy
- **Display** (400, `min(14.6vw, 26svh)`, 0,93, -0,03em): le titre du hero, sur trois lignes décalées.
- **Headline** (400, `clamp(2.5rem, 1.1rem + 6.4vw, 7.6rem)`, 0,98, -0,02em): titres de section, équilibrés.
- **Title** (400, `clamp(1.8rem, 1.1rem + 1.6vw, 2.7rem)`, 1,04): cartes de soins, piliers, étapes du rituel.
- **Body** (400, `clamp(1rem, .95rem + .22vw, 1.1875rem)`, 1,65): paragraphes ; mesure 65 à 75 caractères.
- **Label** (600, 0,78rem, 0,07em, majuscules): légendes de photos et signatures seulement.
- **Script** (Ballet, 1,22 à 1,42em du titre): un mot d'or par section au plus (« Douceur », « évader », « Inspirez »).

### Named Rules
**The Readable Script Rule.** Ballet ne porte jamais seule une information : le mot existe aussi en texte lisible ailleurs, et jamais en dessous de 2,6rem.

**The No Eyebrow Rule.** Aucune surtitre ni numéro de section au-dessus d'un titre : le titre porte son propre poids.

## Layout

Une seule colonne de lecture généreuse, sans grille visible, bordée par une gouttière fluide (`clamp(20px, 4.4vw, 76px)`) et des sections de 90 à 190px de respiration verticale. Chaque section change de composition : hero typographique, rubans croisés, texte révélé mot à mot, scène épinglée en deux colonnes, rail horizontal, boutons en quinconce, courtepointe à 12 colonnes, pile d'avis, appel à l'action en deux masses, carte et horaires.

Sous 900px, les scènes épinglées sont remplacées par des empilements simples (étapes avec photo, soins en défilement horizontal tactile), les lucioles sont allégées et un bouton « Appeler » flottant apparaît. Sous 1100px la navigation passe en menu plein écran.

## Elevation & Depth

Le système est plat : la profondeur vient de la superposition tonale (mousse sur crème, patchs sur lin), d'un fin quadrillage de grain et de coutures pointillées à 8-11px du bord (1,5px, opacité 0,35 à 0,5). Les seules ombres sont deux ombres diffuses de désencombrement (`0 12px 28px -14px` sur le lien de la carte, `0 14px 30px -12px` sur le bouton flottant). Aucune ombre dure décalée, aucun verre dépoli.

### Named Rules
**The Stitched Edge Rule.** Un objet « cousu » se signale par un liseré pointillé intérieur, jamais par un biseau ni une ombre portée.

## Shapes

Le langage de forme est celui du patron de couture : bords crantés en dents de scie (28 x 14px) entre les sections et sur les rubans, coins de feuille (deux coins opposés très arrondis, 80 à 190px), arches pour les cartes sombres, boutons ronds à quatre trous. Les patchs de la courtepointe restent presque carrés (6px) et légèrement tournés (±0,8°). Les pastilles d'action sont des pilules (999px).

### Named Rules
**The Leaf-Wing Rule.** La feuille-aile (deux courbes d'une même longueur, appliquée avec un point droit pointillé) est le motif figuratif principal ; seuls de petits emblèmes au trait (vagues, feuille, miroir, aiguille) la complètent, aucune scène dessinée.

**The Four Holes Rule.** Un bouton a quatre trous aux coins d'un carré, jamais deux trous au-dessus d'un chiffre (cela se lit comme un visage).

## Components

### Buttons
- **Shape:** pilule (999px), 1,5px de bord, léger balancement magnétique sur pointeur fin.
- **Gold (primaire):** fond or (#E7BD4F), texte doublure, rempli en crème par une vague qui monte au survol (0,7s, expo).
- **Moss:** fond mousse, texte crème, rempli en or au survol.
- **Nav:** contour seul, rempli en or au survol.
- **Disque (chiffres, appel):** disque plein avec anneau intérieur à 30 % et quatre trous plats de la couleur du fond ; le fil d'or passe dans les deux trous du haut.

### Chips
- **Style:** pilule en pointillé lin (1,5px), texte crème sur doublure.
- **State:** sélectionnée = pleine or, bord plein, gras ; focus = anneau or décalé de 4px.

### Cards / Containers
- **Soins:** quatre silhouettes (feuille, feuille inversée, arche, feuille asymétrique) en mousse, crème, doublure, mousse et or ; pointillé intérieur ; inclinaison 3D et reflet qui suit le pointeur.
- **Patchs:** rectangles de 6px, ombre aucune, pointillé intérieur ; photo, feutre, lin à points de croix, doublure, bobine d'or.
- **Avis:** lettre crème (6px) posée sur une pile ; décalages ±26px et rotations ±3° pour les cartes derrière.

### Inputs / Fields
- Seul contrôle de saisie : le groupe de pastilles radio « Préparez votre appel », entièrement accessible au clavier.

### Navigation
- **Style:** barre transparente sur le hero, puis papier de soie à bord cranté ; marque (ailes + aiguille) et « Cabinet des Fées » en Gloock ; liens Hanken 500 avec soulignement qui se déroule.
- **Comportement:** se cache au défilement vers le bas, revient au défilement vers le haut ; menu mobile en rideau plein écran sur la doublure.

### Fil d'or (composant signature)
Un tracé SVG de 2,2px (or) doublé d'un pointillé crème à 50 %, calculé dans le JS à partir de la position réelle des éléments (titre, bouton, trous des boutons) et dessiné avec DrawSVG, soit en intro (hero), soit lié au défilement (rituel, chiffres, appel à l'action).

## Do's and Don'ts

### Do:
- **Do** garder l'or comme seul accent et le réserver au fil, aux actions et à la lumière.
- **Do** donner à chaque section une composition et un mouvement propres ; respecter `prefers-reduced-motion` par une version statique complète.
- **Do** poser les photos de faible définition à petite échelle avec la trame de points de croix (5px) et un liseré cousu.
- **Do** utiliser exponentielle sortante (`cubic-bezier(.16, 1, .3, 1)`) pour les entrées et animer en priorité `transform` et `opacity`.
- **Do** écrire les contenus en français, concrets, sans prix ni durée inventés.

### Don't:
- **Don't** mettre un surtitre ou un numéro au-dessus d'un titre.
- **Don't** utiliser de dégradé de texte, d'ombre dure décalée, de verre dépoli ou de biseau imitant la matière.
- **Don't** dessiner de scènes illustrées (champignons, fées, branches détaillées) : le feuillage reste géométrique.
- **Don't** faire pulser un point « en direct » ni empiler des cartes identiques icône-titre-texte : les formes, tailles et couleurs varient.
- **Don't** utiliser Ballet pour du texte courant ou sous 2,6rem.
