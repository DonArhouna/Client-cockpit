# Changelog Frontend — Cockpit Client
> Session de débogage et refactoring — 12 mars 2026
> Auteur : Abdoul (backend + debug), à valider par le responsable frontend

---

## Contexte

Lors des tests de bout en bout du flux NLQ (frontend → backend → agent SQL → Sage 100), plusieurs problèmes ont été identifiés et corrigés. Ce document liste **tous les changements effectués** sur le frontend (`Client-cockpit`) et les composants adjacents.

---

## 1. Corrections de `kpiKey` hardcodés (désalignement backend)

Le backend utilise des clés KPI préfixées (ex : `f01_ca_ht`) mais le frontend utilisait d'anciennes clés courtes sans préfixe (ex : `ca_ht`). Résultat : tous les widgets envoyaient des requêtes NLQ avec des clés inconnues → réponse `NO_INTENT`.

### Fichiers corrigés

| Fichier | Ancienne clé | Nouvelle clé |
|---------|-------------|--------------|
| `src/features/dashboard/components/visuals/RevenueEvolutionVisual.tsx` | `revenue_monthly` | `f01_ca_ht` |
| `src/features/dashboard/components/RevenueChart.tsx` | `revenue_evolution` | `f01_ca_ht` |
| `src/features/revenue/components/EvolutionRevenueChart.tsx` | `ca_par_axe_analytique` | `k03_ca_par_axe_analytique` |
| `src/features/revenue/components/RevenueKpiGrid.tsx` | `ca_ht` | `f01_ca_ht` |
| `src/features/revenue/components/RevenueKpiGrid.tsx` | `variation_ca_n_1` | `f10_variation_ca` |
| `src/features/revenue/components/RevenueKpiGrid.tsx` | `ca_moyen_client` | `c02_ca_moyen_par_client` |
| `src/features/revenue/components/RevenueKpiGrid.tsx` | `nb_clients_actifs` | `c01_nb_clients_actifs` |
| `src/features/revenue/components/TopPerformersSidebar.tsx` | `top10_clients_ca` | `c03_top10_clients_ca` |
| `src/features/dashboard/components/visuals/TopClientsVisual.tsx` | `top10_clients_ca` | `c03_top10_clients_ca` |
| `src/features/revenue/components/WaterfallRevenueChart.tsx` | `balance_agee_clients` | `c04_balance_agee_clients` |

> **Règle à suivre** : toutes les clés KPI correspondent aux champs `key` dans la table `KpiDefinition` en base. Utiliser l'endpoint `GET /kpi-definitions` pour obtenir la liste complète.

---

## 2. Refactoring des pages — KPIs dynamiques depuis l'API

### Problème

Les pages (`AccountingPage`, `InventoryPage`, `RisksPage`, etc.) auto-populaient leurs widgets par défaut avec des listes de `kpiKey` hardcodées dans le code. Si une clé n'existait pas en base → widget silencieusement vide.

### Solution

Chaque page filtre maintenant `useKpiDefinitions()` par **catégorie DB** pour obtenir les 4 premiers KPIs de type `card`. Plus aucune clé hardcodée pour les KPIs scalaires.

### Fichiers modifiés

#### `src/features/accounting/AccountingPage.tsx`
```diff
- kpiKey: 'resultat_net'   // hardcodé
- kpiKey: 'ebitda'         // hardcodé
- kpiKey: 'charges_exploitation'
- kpiKey: 'produits_exploitation'
+ const accountingKpis = kpiDefinitions
+   .filter(kpi => kpi.isActive && kpi.category === 'comptabilite' && kpi.defaultVizType === 'card')
+   .slice(0, 4);
+ // kpiKey = kpi.key  (depuis l'API)
```

#### `src/features/inventory/InventoryPage.tsx`
```diff
- kpiKey: 'valeur_stock_totale'
- kpiKey: 'rotation_stock'
- kpiKey: 'nb_articles_hors_stock'
- kpiKey: 'taux_disponibilite'
+ const stockKpis = kpiDefinitions
+   .filter(kpi => kpi.isActive && kpi.category === 'stocks' && kpi.defaultVizType === 'card')
+   .slice(0, 4);
```

#### `src/features/risks/RisksPage.tsx`
```diff
- kpiKey: 'encours_client_total'
- kpiKey: 'nb_factures_retard'
- kpiKey: 'dso'
- kpiKey: 'litiges_ouverts'
+ const risksKpis = kpiDefinitions
+   .filter(kpi => kpi.isActive && kpi.category === 'clients' && kpi.defaultVizType === 'card')
+   .slice(0, 4);
```

#### `src/features/revenue/RevenueAnalysisPage.tsx`
```diff
- const REVENUE_KPI_KEYS = ['ca_ht', 'variation_ca_n_1', 'ca_moyen_client', 'nb_clients_actifs'];
- kpiDefinitions.filter(kpi => REVENUE_KPI_KEYS.includes(kpi.key))
- // + fallback mock si clés manquantes
+ const REVENUE_CATEGORIES = ['finance', 'clients'];
+ kpiDefinitions.filter(kpi => kpi.isActive && REVENUE_CATEGORIES.includes(kpi.category) && kpi.defaultVizType === 'card')
```

#### `src/features/operational/OperationalPerformancePage.tsx`
```diff
- const OPERATIONAL_KPI_KEYS = ['total_achats_ht', 'dpo', 'dettes_fournisseurs_echues', 'nb_fournisseurs_actifs'];
- kpiDefinitions.filter(kpi => OPERATIONAL_KPI_KEYS.includes(kpi.key))
- // + fallback mock si clés manquantes
+ kpiDefinitions.filter(kpi => kpi.isActive && kpi.category === 'fournisseurs' && kpi.defaultVizType === 'card')
```

#### `src/features/cashflow/TreasuryPage.tsx`
```diff
- const TREASURY_CATEGORIES = ['tresorerie', 'finance', 'finance_performance', 'rentabilite', 'controle_gestion'];
- const TREASURY_KPI_KEYS = ['position_tresorerie', 'flux_tresorerie_projete', ...]; // fallback
+ const TREASURY_CATEGORIES = ['tresorerie', 'finance'];
+ // filtre supplémentaire : kpi.defaultVizType === 'card'
+ // suppression du fallback par keys
```

#### `src/features/cashflow/TreasuryKpiGrid.tsx`
```diff
- const TREASURY_CATEGORIES = ['tresorerie', 'finance', 'finance_performance', 'rentabilite', 'controle_gestion'];
- const TREASURY_KPI_KEYS = [...]; // fallback
+ const TREASURY_CATEGORIES = ['tresorerie', 'finance'];
+ // même logique simplifiée
```

#### `src/features/dashboard/components/DashboardKpis.tsx`
```diff
- const MAIN_KPI_KEYS = ['f01_ca_ht', 'c01_...', ...]; // liste statique
+ kpiDefinitions.filter(kpi =>
+   kpi.isActive &&
+   kpi.defaultVizType === 'card' &&
+   kpi.profiles?.some(p => ['DAF', 'CFO', 'DG'].includes(p))
+ ).slice(0, 4)
```

---

## 3. Mapping catégories DB → pages frontend

Les catégories sont définies dans `kpi-bis.json` et stockées dans `KpiDefinition.category` en base.

| Page frontend | Catégorie(s) DB |
|---------------|-----------------|
| AccountingPage | `comptabilite` |
| TreasuryPage / TreasuryKpiGrid | `tresorerie`, `finance` |
| InventoryPage | `stocks` |
| OperationalPerformancePage | `fournisseurs` |
| RisksPage | `clients` |
| RevenueAnalysisPage | `finance`, `clients` |
| DashboardKpis | tous (filtre par `profiles` + `defaultVizType`) |

Catégories existantes en base : `analytique`, `audit`, `clients`, `commandes`, `comptabilite`, `finance`, `fournisseurs`, `immobilisations`, `ml_ia`, `rh`, `stocks`, `tresorerie`

---

## 4. Normalisation du résultat agent dans `useKpiData`

**Fichier** : `src/hooks/use-kpi-data.ts`

**Problème** : Le hook attendait `result.current` ou `result.value`, mais l'agent Python renvoie :
```json
{ "result": [{ "ca_ht": "4196862.37" }], "metadata": { "rows": 1, ... } }
```

**Fix** : Extraction de la première valeur scalaire de `result.result[0]` :
```typescript
const agentRow = result?.result?.[0];
const agentScalar = agentRow
    ? parseFloat(Object.values(agentRow).find(v => v !== null && !isNaN(parseFloat(v as string))) as string)
    : NaN;
const normalized: KpiDataResult = {
    current: result?.current || result?.value || (!isNaN(agentScalar) ? agentScalar : 0),
    previous: result?.previous || 0,
    ...
};
```

---

## 5. Fix backend NLQ — `detectIntent`

**Fichier** : `insightsage_backend/src/nlq/nlq.service.ts`

**Problème** : Quand le frontend envoyait directement la clé technique (`f01_ca_ht`) comme texte de requête NLQ, `detectIntent` ne trouvait aucun intent car les keywords ne contenaient pas la clé.

**Fix** : Score prioritaire (+100) si le texte de la requête contient exactement la `key` de l'intent :
```typescript
const keyMatch = normalizedText.includes(intent.key.toLowerCase()) ? 100 : 0;
const matchCount = intent.keywords.filter(keyword =>
    normalizedText.includes(keyword.toLowerCase())
).length;
return { ...intent, score: keyMatch + matchCount };
```

---

## 6. Whitelist agent Python — vues SQL autorisées

**Fichier** : `admin-cockpit/agent-cockpit/config/config.yaml`

Ajout des 13 vues métier BIJOU dans `security.allowed_tables` :
```yaml
- "VW_ANALYTIQUE"
- "VW_CLIENTS"
- "VW_COMMANDES"
- "VW_FINANCE_GENERAL"
- "VW_FINANCES_CLIENTS_FLAT"
- "VW_FOURNISSEURS"
- "VW_GRAND_LIVRE_GENERAL"
- "VW_IMMOBILISATIONS"
- "VW_KPI_SYNTESE"
- "VW_METADATA_AGENT"
- "VW_PAIE"
- "VW_STOCKS"
- "VW_TRESORERIE"
```
Les tables brutes `F_*` ont été conservées (fallback Sage 100).

---

## 7. Correction `kpi-bis.json` — `defaultVizType`

**Fichier** : `insightsage_backend/prisma/kpi-bis.json`

94 KPIs sur 126 ont eu leur `defaultVizType` corrigé pour correspondre à leur nature réelle :

| Avant | Après | Nb |
|-------|-------|----|
| `gauge` | `card` | 43 |
| `bar` (scalaires) | `card` | 19 |
| `bar` (évolutions) | `line` | ~8 |
| divers | `table` (listes multi-col) | ~24 |

**Distribution finale** : `card` × 63 / `bar` × 25 / `table` × 24 / `line` × 11 / `pie` × 1 / `map` × 1 / `text` × 1

> **Action requise** : Re-seeder la base pour appliquer ces corrections :
> ```bash
> cd insightsage_backend
> npx ts-node prisma/seed.ts
> ```
> Le seed fait `deleteMany` sur `kpiDefinition`, `nlqIntent`, `nlqTemplate` avant de recréer — pas besoin de `--force-reset`.

---

## 8. À faire — widgets graphiques

Les widgets de type `graph`/`chart`/`table` (non-KPI) conservent encore des `kpiKey` fictifs (`pnl_evolution`, `inventory_evolution`…). Ces clés ne passent **pas** par `useKpiData` — elles servent d'identifiant pour router vers le bon composant visuel dans `WidgetCard`.

Ces composants visuels devront à terme être connectés à leurs vraies données via `useKpiData` avec les bonnes clés préfixées.

---

## 9. Persistance serveur des layouts — PersonalizationContext

### Problème

Les layouts de dashboard (widgets, positions) étaient uniquement stockés dans le `localStorage` du navigateur. Conséquences :
- Connexion depuis un autre appareil → dashboard vide
- Deux utilisateurs sur la même machine → ils voyaient le même layout (pas d'isolation)
- Vidage du cache → perte de toutes les personnalisations

### Solution

**Backend** — `insightsage_backend/src/dashboards/dashboards.service.ts`

La méthode `findAll` a été modifiée pour inclure les widgets dans la réponse (au lieu de juste `_count`) :
```diff
- include: {
-   _count: { select: { widgets: true } },
-   user: { select: { id: true, ... } },
- }
+ include: {
+   widgets: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
+   user: { select: { id: true, ... } },
+ }
```

**Frontend** — `src/features/personalization/PersonalizationContext.tsx` — **réécriture complète**

Nouveau comportement :
1. **Au montage** : `GET /dashboards` → charge tous les dashboards avec leurs widgets depuis la DB. L'API prend le dessus sur le localStorage pour les pages qui ont des données en base.
2. **Fallback** : si l'API est inaccessible (offline, non connecté), le localStorage est conservé en silence.
3. **Mutations optimistes** : toute modification (ajout, suppression, déplacement) est appliquée localement immédiatement, puis synchronisée avec l'API en arrière-plan.
4. **Un dashboard DB par page** : le `name` du dashboard = le `pageId` (ex: `"finance"`, `"accounting"`). Créé automatiquement au premier peuplement.
5. **Mapping `kpiKey` ↔ `exposure`** : le champ `kpiKey` du frontend correspond au champ `exposure` en base. À la lecture : `kpiKey = w.exposure`. À l'écriture : `exposure = w.kpiKey`.

### Architecture

```
Connexion utilisateur
    │
    ▼
GET /dashboards (inclut widgets)
    │
    ├── Dashboards trouvés → setLayouts() (API prime sur localStorage)
    └── Erreur / non connecté → garde localStorage tel quel

Modification widget (add/remove/move)
    │
    ├── setLayouts() immédiatement (UI réactive)
    └── API call en arrière-plan (fire-and-forget)
            │
            ├── Succès → remplace l'id local par l'id DB
            └── Échec → conserve l'id local (cache localStorage valide)
```

### Résultat

| Scénario | Avant | Après |
|----------|-------|-------|
| Déconnexion + reconnexion même navigateur | ✅ | ✅ |
| Connexion depuis autre appareil | ❌ Dashboard vide | ✅ Layout restauré |
| Vidage du cache | ❌ Dashboard vide | ✅ Layout restauré |
| Deux utilisateurs, même machine | ⚠️ Même layout | ✅ Isolé par userId |
| Offline / API indisponible | ✅ localStorage | ✅ localStorage (fallback) |

---

## 10. Support vizType `pie` — nouveau composant `PieVisual`

### Problème

Un widget ajouté avec `vizType: 'pie'` affichait simplement le texte `"Visualisation pie : Camembert"` car `WidgetCard` ne gérait pas ce type et tombait dans le fallback.

### Fichiers créés / modifiés

#### `src/features/dashboard/components/visuals/PieVisual.tsx` *(nouveau)*

Composant générique pour les camemberts (pie/donut). Il :
- Appelle `useKpiData(kpiKey)` pour récupérer les données de l'agent
- Lit `kpiData?.details?.items` (tableau de `{ name, value }`)
- Affiche un `PieChart` Recharts avec légende + tableau de pourcentages à droite
- Mode compact (h ≤ 2) : donut simplifié sans légende
- Fallback placeholder si aucune donnée

#### `src/features/dashboard/components/WidgetCard.tsx` *(modifié)*

Ajout du cas `pie`/`donut` dans `renderContent()` :
```typescript
// Camembert
if (widget.vizType === 'pie' || widget.vizType === 'donut') {
    return <PieVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
}
```

---

## 11. Flux en 2 étapes pour les templates de widgets

### Problème

Cliquer sur un **template** ("Camembert", "Graphique aire"…) dans le WidgetSidebar appelait `onAddWidget` sans `kpiKey`. Le widget ajouté était un conteneur vide — aucune donnée ne pouvait s'afficher.

### Solution

**Fichier** : `src/features/dashboard/components/WidgetSidebar.tsx`

Nouveau flux :

1. **Étape 1** — L'utilisateur clique sur un template → le sidebar bascule sur un écran de sélection KPI
2. **Étape 2** — Liste de KPIs **filtrés par compatibilité de vizType**, avec barre de recherche
3. L'utilisateur clique sur un KPI → `onAddWidget` est appelé avec `vizType` du template + `kpiKey` du KPI sélectionné
4. Bouton ← pour revenir à la liste des templates sans rien ajouter

### Logique de compatibilité vizType

```typescript
const VIZ_COMPAT: Record<string, string[]> = {
    card: ['card'],
    pie: ['pie', 'donut'],
    donut: ['pie', 'donut'],
    area: ['area', 'line', 'bar'],
    line: ['area', 'line', 'bar'],
    bar: ['area', 'line', 'bar'],
    table: ['table'],
};
```

Seuls les KPIs dont le `defaultVizType` est compatible avec le template sont affichés. Si aucun KPI compatible n'existe en base, tous les KPIs actifs sont affichés en fallback (avec un compteur `"N compatibles"` visible).

### Résultat

| Avant | Après |
|-------|-------|
| Clic template → widget vide | Clic template → sélecteur KPI → widget lié |
| Tous les KPIs proposés (confus) | KPIs filtrés par compatibilité vizType |
| Aucun feedback visuel | Compteur de KPIs compatibles affiché |

---

## 12. Stratégie de Cache Local (Mitigation Rate-Limiting)

### Problème
Le backend impose un rate-limiting. Chaque navigation déclenchait un appel API, épuisant rapidement les quotas et affichant des valeurs à 0.

### Solution
Mise en place d'un cache local persistant dans le navigateur.

**Fichier** : `src/lib/cache.ts` *(nouveau)*
- Utilitaire gérant le `localStorage` avec un TTL (Time To Live) par défaut de 60 minutes.
- Clés préfixées par `cockpit_cache_`.

**Fichiers modifiés** :
- `src/hooks/use-kpi-data.ts` : Vérifie le cache avant de lancer une requête NLQ. Stocke le résultat normalisé.
- `src/hooks/use-api.ts` : Intégration du cache dans les hooks React Query (`kpi-definitions`, `widget-templates`, `kpi-packs`).
- `src/features/dashboard/DashboardPage.tsx` & `src/features/revenue/components/RevenueHeader.tsx` : Mise à jour des boutons "Actualiser" pour vider le cache (`forceRefresh`) et forcer une mise à jour réelle.

---

## 13. Internationalisation des commentaires et Nettoyage

### Actions effectuées
1.  **Traduction des commentaires** : Tous les commentaires techniques dans le code source ont été traduits en français pour assurer la cohérence avec le reste de l'application.
2.  **Suppression des fichiers inutilisés** : Identification et suppression des composants obsolètes ou redondants pour alléger la base de code.

---

## À retenir pour le développement frontend

1. **Ne jamais hardcoder un `kpiKey`** — toujours utiliser `kpi.key` depuis `useKpiDefinitions()`
2. **Filtrer par `category`** pour le peuplement par défaut des pages
3. **Filtrer par `defaultVizType === 'card'`** pour les KPIs scalaires dans les grilles
4. **Le localStorage gère deux types de données** :
    - Les **layouts** (widgets, positions) via `PersonalizationContext`.
    - Le **cache de données** (valeurs API) via `src/lib/cache.ts`.
5. **Le bouton "Actualiser" est sacré** — c'est le seul moyen de contourner le cache local pour obtenir des données fraîches.
6. **Clé technique = l'intent NLQ** — le backend NLQ reconnait maintenant la clé directe (`f01_ca_ht`).
7. **`kpiKey` frontend = `exposure` en base**.
8. **Widget = conteneur visuel + lien KPI**.
9. **Templates ≠ KPIs**.
