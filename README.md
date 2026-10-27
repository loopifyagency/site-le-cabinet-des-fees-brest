# Le Cabinet des Fées · Brest

Site vitrine de l'institut de beauté **Le Cabinet des Fées – Brest** (15 Rue des 11 Martyrs, 29200 Brest).
Objectif unique : que la personne **appelle pour prendre rendez-vous** (02 98 46 83 06).

Site 100 % statique : HTML + CSS + JavaScript, aucune étape de build, aucune dépendance externe au chargement
(GSAP, ScrollTrigger, SplitText, DrawSVG, Lenis et les polices sont embarqués dans `assets/`).

## Lancer en local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Déployer

Le site est publié sur **GitHub Pages** par le workflow `.github/workflows/pages.yml` : à chaque push sur `main`,
il publie `index.html` et `assets/` (et rien d'autre). Adresse par défaut :
`https://loopifyagency.github.io/site-le-cabinet-des-fees-brest/`.

Réglage à faire une seule fois : *Settings → Pages → Build and deployment → Source : **GitHub Actions***.
Pour un nom de domaine personnalisé : *Settings → Pages → Custom domain*, puis ajouter dans `index.html` une balise
`<link rel="canonical">`, une image `og:image` (URL absolue) et un `sitemap.xml`.

N'importe quel autre hébergement statique convient aussi (Netlify, Vercel, OVH…) : publier `index.html` et `assets/`.

## Direction artistique

« L'atelier de la fée marraine » : le bien-être comme une chose cousue main.

- **Matières** : feutre de mousse `#4F5A34`, lin `#D9CFA5`, papier de soie `#FCF5EC`, doublure `#262D16`, fil d'or `#E7BD4F`.
- **Fil rouge** : *le fil d'or*. Il se dessine dans le préchargeur, se déroule dans le hero, devient la chronologie du
  rituel, le rail des soins, passe dans les trous des boutons des chiffres, et vient se nouer au bouton « Appeler ».
- **Détails de métier** : bords crantés (ciseaux à cranter) entre les sections, points de croix, patchs de
  courtepointe, boutons à quatre trous, feuilles-ailes cousues en appliqué.
- **Typographies** : Gloock (titres), Ballet (quelques mots d'or), Hanken Grotesk (texte).

## Où modifier le contenu

| Quoi | Où |
| --- | --- |
| Téléphone, adresse, horaires | `index.html` (rechercher `02 98 46 83 06`, `hours`, le bloc `application/ld+json`) et `SCHEDULE` dans `assets/js/main.js` (statut « ouvert / fermé ») |
| Soins | `index.html`, section `#soins` (une balise `<article class="soin …">` par soin) |
| Avis | `index.html`, section `#avis` (reproduits mot pour mot) |
| Chiffres | `index.html`, section `#chiffres` (attribut `data-count`) |
| Couleurs, espacements, typographies | variables `:root` en haut de `assets/css/styles.css` |
| Photos | `assets/img/facade.jpg` et `assets/img/interieur.jpg` (voir ci-dessous) |

## À valider / à fournir par le salon

Ces éléments n'étaient pas dans le brief, **rien n'a été inventé** : ils sont signalés pour que vous les complétiez.

1. **Carte des soins** : massages, soins du corps, soins du visage, mains et pieds, « moment sur mesure » ont été
   rédigés à partir du positionnement et des avis, **sans prix ni durée**. À confirmer ou corriger.
2. **Photos** : les deux photos fournies mesurent seulement 195 × 139 px. Elles sont présentées en petit, avec une
   trame « point de croix ». Dès que de meilleures photos existent (idéalement ≥ 1600 px de large, format JPG/WebP),
   remplacer les deux fichiers de `assets/img/` ; la galerie, le hero et le rituel s'adaptent.
3. **Dimanche** : seule l'ouverture exceptionnelle du dimanche de la Toussaint (9h00–19h30) est connue ; le reste du
   temps le site indique « nous consulter ». Mettre à jour dès que les horaires du dimanche sont fixés.
4. **Réseaux sociaux** et **e-mail** : aucun lien fourni, donc aucun lien affiché (pas de fausses icônes).
5. **Chiffres clés** : seuls des chiffres vérifiables sont affichés (66 h d'ouverture par semaine du lundi au samedi,
   2 personnes citées par les avis, 3 dimensions du bien-être, le numéro 15 de la rue). Ajouter par exemple les
   années d'expérience ou le nombre de clientes si vous souhaitez les afficher.
6. **Mentions légales** : à ajouter (raison sociale, SIRET, hébergeur), obligatoires pour un site professionnel en France.
7. **Réservation en ligne** : le brief ne contient pas de lien de prise de rendez-vous ; tous les boutons appellent
   `tel:+33298468306`. Si un outil de réservation est mis en place, remplacer les liens `tel:` des boutons principaux.

## Accessibilité et performance

- Contrastes AA, navigation clavier complète, lien d'évitement, textes alternatifs, carrousel d'avis avec pause.
- `prefers-reduced-motion` : plus de préchargeur, de défilement lissé, de sections épinglées ni de lucioles animées ;
  tout le contenu est affiché de façon statique.
- Mobile : sections épinglées remplacées par des empilements simples ; soins en défilement horizontal tactile ;
  bouton « Appeler » flottant.
- Aucune requête vers Google Fonts : les polices sont locales (conformité RGPD). Seule la carte Google Maps est
  chargée depuis l'extérieur (iframe en chargement différé).
- Données structurées `BeautySalon` (nom, adresse, téléphone, horaires) dans `index.html`.

## Crédits et licences

- [GSAP](https://gsap.com) 3.15 (ScrollTrigger, SplitText, DrawSVGPlugin) : licence GSAP « no charge ».
- [Lenis](https://lenis.darkroom.engineering) 1.3 : licence MIT.
- Polices Gloock, Ballet, Hanken Grotesk : SIL Open Font License 1.1 (via Fontsource).
- Icône téléphone : tracé [Feather Icons](https://feathericons.com), licence MIT.
