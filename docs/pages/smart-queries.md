# Requêtes Intelligentes (NLP)

**Route :** `/smart-queries`  
**Composant :** `src/features/queries/IntelligentQueriesPage.tsx`

---

## Description

L'interface de **Requêtes Intelligentes** permet aux utilisateurs de poser des questions en **langage naturel** et d'obtenir des visualisations financières générées automatiquement par l'IA.

---

## États de la page

La page gère trois états distincts :

### 1. État Initial

Affiché au premier chargement, sans requête en cours :

- **Suggestions de requêtes** : 6 exemples cliquables
- **Filtres de type** :
    - 📊 Vue d'ensemble
    - 📈 Tendances
    - ⚖️ Comparaisons
    - ✨ Prévisions
- **Insight IA** : Recommandation du jour
- **Cartes résumé** : CA, DSO, Créances

### 2. État Traitement

Affiche la progression en 4 étapes animées :

```
⏳ Étape 1 — Analyse de la requête
⏳ Étape 2 — Validation des données
⏳ Étape 3 — Exécution de la requête
⏳ Étape 4 — Génération du visuel
```

### 3. État Résultat

Affiche après traitement :

- **Carte d'interprétation** : Résumé de ce qu'a compris l'IA (score de confiance 98%)
- **Visualisation générée** : Widget(s) dans une `DashboardGrid`
- **Actions** : Nouvelle analyse / Ajouter au Dashboard

---

## Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Saisie texte** | Zone de saisie en langage naturel |
| **Saisie vocale** | Bouton micro (prévu) |
| **Sélecteur de langue** | Français / English |
| **Historique** | Accès aux requêtes précédentes |
| **Export dashboard** | Ajouter le résultat au Dashboard principal |

---

## Architecture technique

```tsx
// Flux d'une requête NLP
const nlqQuery = useNLQQuery();

// 1. Envoi de la requête
const result = await nlqQuery.mutateAsync(queryText);
// → result.jobId (traitement asynchrone)

// 2. Polling du statut
const { data: jobStatus } = useJobStatus(jobId, { enabled: !!jobId });

// 3. Affichage quand COMPLETED
if (jobStatus?.status === 'COMPLETED') {
  setShowResult(true);
}
```

---

## Suggestions par défaut

```tsx
const suggestions = [
  "Quel est notre chiffre d'affaires ce mois-ci ?",
  "Montrez-moi les créances clients en retard",
  "Comparez les revenus T3 vs T2 2024",
  "Quels sont nos top 5 clients par CA ?",
  "Analysez la marge brute par produit",
  "Évolution du DSO sur 6 mois",
];
```
