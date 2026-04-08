# Analyse des Ventes

**Route :** `/sales` (alias : `/revenue-analysis` → redirige vers `/sales`)  
**Composant :** `src/features/revenue/RevenueAnalysisPage.tsx`

---

## Description

Le module **Ventes** analyse le chiffre d'affaires, la croissance et la performance commerciale de l'organisation.

---

## Insight IA

| KPI | Clé API | Description |
|-----|---------|-------------|
| Chiffre d'affaires | `ca` | CA du mois courant et tendance |

**Logique d'alerte :**

```
Croissance > 5%   → 🟢 Succès
Croissance ≥ 0%   → 🔵 Info
Croissance < 0%   → 🔴 Danger
```

---

## Composants internes

| Composant | Rôle |
|-----------|------|
| `RevenueHeader` | En-tête avec titre et actions |
| `RevenueFilters` | Filtres spécifiques aux ventes |
| `RevenueKpiGrid` | Grille de KPIs vente |

---

## Personnalisation

```tsx
// Clé de page : 'revenue'
const widgets = layouts['revenue'] || [];

<WidgetSidebar allowedDomains={['sales']} />
```
