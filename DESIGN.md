# System Design: DamShop World-Class E-Commerce

Inspiré des plus grandes boutiques en ligne mondiales (Apple Store, Farfetch, SSENSE, Zara, Bang & Olufsen). Le design privilégie la clarté absolue, la propreté visuelle, la mise en valeur maximale des photos produits et une ergonomie irréprochable.

---

## 1. Direction Artistique & Atmosphère
- **Style :** Épuré, Lumineux & Moderne (Pure Light Luxe).
- **Fond principal :** Blanc Pur (`#ffffff`) et Gris Coton (`#f9fafb`).
- **Contraste :** Typographie sombre ultra-lisible (`#0f172a`) sur fond clair avec bordures ultra-fines (`#e5e7eb`).
- **Objectif :** Mettre la photographie des produits au centre de l'expérience utilisateur, avec des animations légères et naturelles.

---

## 2. Palette de Couleurs Calibrée
- **Fond principal (Canvas) :** `#ffffff` (Blanc Pur épuré).
- **Surfaces de cartes :** `#ffffff` avec bordure 1px `#e5e7eb`.
- **Fond d'arrière-plan de section :** `#f8fafc` (Gris Slate très doux).
- **Texte principal :** `#0f172a` (Slate foncé, haute lisibilité).
- **Texte secondaire :** `#64748b` (Gris neutre pour descriptions et métadonnées).
- **Couleur d'Action Principale (CTA) :** `#0f172a` (Noir Slate sobre et luxueux) ou `#2563eb` (Bleu Royal moderne).
- **Badge & Promotion :** `#d97706` (Or ambré) & `#10b981` (Vert émeraude).

---

## 3. Typographie
- **Titres & En-tête :** `Plus Jakarta Sans` & `Outfit` (Moderne, géométrique et lisible).
- **Corps de texte :** `Hanken Grotesk` / `System UI` (Hauteur de ligne 1.6, aérée).
- **Prix & Chiffres :** `JetBrains Mono` (Police à largeur fixe pour les montants FCFA).

---

## 4. Composants & Ergonomie
- **Header :** Fixe en haut de page, blanc translucide avec flou léger (`backdrop-filter: blur(12px)`), logo épuré, barre de recherche centrale arrondie et accès rapide au Panier / Admin / Favoris.
- **Hero Banner :** Bannière éditoriale claire avec grand visuel, slogan fort, badges de réassurance (Livraison rapide, Paiement sécurisé).
- **Pills de Catégorie :** Boutons arrondis (`border-radius: 9999px`) sur fond clair, devenant sombres avec texte blanc lorsqu'ils sont actifs.
- **Cartes Produit :** Fond blanc, bordure fine `#e5e7eb`, survol avec zoom léger de l'image et apparition du bouton d'aperçu rapide.
