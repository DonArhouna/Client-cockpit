# Dashboard Exécutif

**Route :** `/dashboard`  
**Composant :** `src/features/dashboard/DashboardPage.tsx`

---

## Description

Le Dashboard Exécutif est la **page d'accueil principale** de l'application. Il offre une vue consolidée des KPIs clés de l'organisation sous forme de grille de widgets entièrement personnalisable.

---

## Fonctionnalités

### Bannière d'accueil
Affiche un message de bienvenue personnalisé selon l'heure :
- ☀️ **Bonjour** (matin)
- 🌤️ **Bon après-midi** (après-midi)
- 🌙 **Bonsoir** (soir)

### Filtres

| Filtre | Options |
|--------|---------|
| **Période** | Ce mois / Ce trimestre / Cette année |
| **Devise** | XOF / EUR / USD |

### Insight IA

Génère automatiquement un résumé du chiffre d'affaires :
- Valeur actuelle du CA
- Variation vs mois précédent
- Taux d'atteinte de l'objectif mensuel

### Bandeau d'alertes (InsightBanner)

Affiche les alertes prioritaires générées par le moteur IA.

### Grille de widgets

Widgets disponibles par défaut :
- KPI Cards (CA, Marge, Trésorerie…)
- Graphiques d'évolution (ligne, barres)
- Tableaux de données
- Camemberts

---

## Personnalisation

```tsx
// PersonalizationContext — clé de page : 'dashboard'
const widgets = layouts['dashboard'] || [];

// Ajouter un widget
addWidgetToPage('dashboard', widgetData);

// Supprimer un widget
removeWidgetFromPage('dashboard', widgetId);
```

---

## Hooks utilisés

```tsx
const { data: dashboard }     = useMyDashboard();       // Dashboard API
const { data: kpiDefinitions } = useKpiDefinitions();   // KPIs disponibles
const { data: caData }         = useKpiData('ca');       // CA pour l'insight
const { period, currency }     = useFilters();           // Filtres globaux
```
