# Risques & Recouvrement

**Route :** `/risks`  
**Composant :** `src/features/risks/RisksPage.tsx`

---

## Description

Le module **Risques** analyse l'exposition aux impayés, classe les clients selon leur niveau de risque et facilite les actions de recouvrement.

---

## Insight IA

| KPI | Clé API | Description |
|-----|---------|-------------|
| Montant exposé | `montant_expose_risque` | Total exposé au risque de non-recouvrement |
| Clients risque élevé | `nb_clients_risque_eleve` | Nombre de clients en risque élevé |

**Logique d'alerte :**

```
Clients risque = 0   → 🟢 Succès
Clients risque ≤ 2   → 🟡 Warning  — Relance recommandée
Clients risque > 2   → 🔴 Danger   — Relance immédiate
```

---

## Widgets par défaut

La page s'auto-popule avec :

1. **KPI Cards** — KPIs clients actifs (catégorie `clients`, type `card`) — jusqu'à 4
2. **Évolution Balance Âgée** — Graphique en aires (`ageing_balance_evolution`)
3. **Top 10 Clients à Risque** — Tableau (`top10_clients_risques`)

---

## Composants internes

| Composant | Rôle |
|-----------|------|
| `RisksHeader` | En-tête avec mode édition |
| `RisksFilters` | Filtres de risques |

---

## Personnalisation

```tsx
// Clé de page : 'risks'
const PAGE_ID = 'risks';
const widgets = layouts[PAGE_ID] || [];

<WidgetSidebar allowedDomains={['risks']} />
```
