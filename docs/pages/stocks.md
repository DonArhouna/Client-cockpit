# Stocks & Inventaire

**Route :** `/stocks`  
**Composant :** `src/features/inventory/InventoryPage.tsx`

---

## Description

Le module **Stocks** permet de surveiller l'état de l'inventaire, les ruptures de stock critiques et d'optimiser la gestion des approvisionnements.

---

## Insight IA

| KPI | Clé API | Description |
|-----|---------|-------------|
| Articles en rupture | `nb_articles_rupture` | Nombre d'articles en rupture critique |

**Logique d'alerte :**

```
Ruptures = 0    → 🟢 Succès
Ruptures ≤ 5    → 🟡 Warning
Ruptures > 5    → 🔴 Danger
```

---

## Composants internes

| Composant | Rôle |
|-----------|------|
| `InventoryHeader` | En-tête avec actions |
| `InventoryFilters` | Filtres stocks |

---

## Personnalisation

```tsx
// Clé de page : 'inventory'
const widgets = layouts['inventory'] || [];

<WidgetSidebar allowedDomains={['inventory']} />
```
