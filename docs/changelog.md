# Changelog Frontend — Cockpit Client

> Historique des sessions de développement, débogage et refactoring.

---

## Session de débogage et refactoring — 12 mars 2026

### Contexte
Lors des tests de bout en bout du flux NLQ (frontend → backend → agent SQL → Sage 100), plusieurs problèmes ont été identifiés et corrigés. Ce document liste tous les changements effectués sur le frontend (`Client-cockpit`) et les composants adjacents.

---

### 1. Corrections de `kpiKey` hardcodés
Le backend utilise des clés KPI préfixées (ex : `f01_ca_ht`) mais le frontend utilisait d'anciennes clés courtes sans préfixe (ex : `ca_ht`).

**Fichiers corrigés :**
- `RevenueEvolutionVisual.tsx`
- `RevenueChart.tsx`
- `EvolutionRevenueChart.tsx`
- `RevenueKpiGrid.tsx`
- `TopPerformersSidebar.tsx`
- `TopClientsVisual.tsx`
- `WaterfallRevenueChart.tsx`

---

### 2. Refactoring des pages — KPIs dynamiques
Les pages analytiques auto-populaient leurs widgets avec des listes hardcodées. Désormais, chaque page filtre `useKpiDefinitions()` par **catégorie** pour obtenir les KPIs en temps réel.

**Modules mis à jour :**
- Comptabilité (`AccountingPage`)
- Stocks (`InventoryPage`)
- Risques (`RisksPage`)
- Ventes (`RevenueAnalysisPage`)
- Achats (`OperationalPerformancePage`)
- Trésorerie (`TreasuryPage`)

---

### 3. Normalisation du résultat agent
Mise à jour du hook `useKpiData.ts` pour extraire correctement les valeurs scalaires renvoyées par l'agent Python.

---

### 4. Persistance serveur des layouts
Migration du stockage des layouts du `localStorage` vers l'API backend (`GET /dashboards`).
- **Sync asynchrone** : Les modifications locales sont synchronisées en arrière-plan.
- **Isolation** : Les layouts sont désormais liés à l'ID utilisateur et à l'organisation.

---

### 5. Support vizType `pie`
Ajout du composant `PieVisual.tsx` pour gérer les graphiques en camembert/donut générés par l'IA.

---

### 6. Flux en 2 étapes pour les templates
Le `WidgetSidebar` propose désormais un flux intelligent :
1. Sélection du template (ex: Graphique aire)
2. Sélection d'un KPI compatible (ex: Chiffre d'affaires)

---

### 7. Stratégie de Cache Local
Intégration d'un cache local avec TTL (60 min) dans `src/lib/cache.ts` pour limiter les appels API et contourner le rate-limiting du backend.

---

### 8. Internationalisation & Nettoyage
- Traduction de tous les commentaires techniques en français.
- Suppression des composants obsolètes et fichiers inutilisés.
