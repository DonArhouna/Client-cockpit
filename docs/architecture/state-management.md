# Gestion d'état

## Vue d'ensemble

L'état global est géré par plusieurs couches complémentaires :

| Couche | Outil | Usage |
|--------|-------|-------|
| **Données serveur** | TanStack Query | Cache, synchronisation API |
| **Authentification** | `AuthContext` | User, tokens JWT |
| **Thème** | `ThemeProvider` | Dark / Light |
| **Filtres globaux** | `FilterContext` | Période, devise |
| **Dashboard** | `PersonalizationContext` | Layouts et widgets |
| **Mode édition** | `DashboardEditContext` | Édition drag & drop |

---

## TanStack Query (données serveur)

Toutes les données API sont gérées par **TanStack Query** (`@tanstack/react-query`).

```tsx
// Exemple d'utilisation dans un composant
import { useKpiDefinitions } from '@/hooks/use-api';

const { data: kpiDefinitions, isLoading, error } = useKpiDefinitions();
```

### Hooks disponibles

| Hook | Description |
|------|-------------|
| `useKpiDefinitions()` | Liste des KPI disponibles |
| `useKpiData(key)` | Données d'un KPI spécifique |
| `useMyDashboard()` | Dashboard de l'utilisateur |
| `useNLQQuery()` | Mutation pour les requêtes NLP |
| `useJobStatus(jobId)` | Statut d'un job asynchrone |
| `useUpdateWidget()` | Mutation pour modifier un widget |

---

## AuthContext

Gère l'état d'authentification de l'utilisateur.

```tsx
import { useAuth } from '@/features/auth/AuthContext';

const {
  user,              // Objet utilisateur courant
  isAuthenticated,   // Boolean
  isLoading,         // Chargement initial
  onboardingStatus,  // Statut de l'onboarding
  login,             // (email, password) => Promise
  logout,            // () => void
} = useAuth();
```

---

## FilterContext

Filtres globaux partagés entre toutes les pages analytiques.

```tsx
import { useFilters } from '@/context/FilterContext';

const {
  period,      // 'current_month' | 'current_quarter' | 'current_year'
  setPeriod,
  currency,    // 'XOF' | 'EUR' | 'USD'
  setCurrency,
} = useFilters();
```

Ces filtres sont utilisés par toutes les pages analytiques (Dashboard, Finance, Ventes, etc.) pour synchroniser la période et la devise affichées.

---

## PersonalizationContext

Gère les layouts personnalisés de chaque page (grilles de widgets).

```tsx
import { usePersonalization } from '@/features/personalization/PersonalizationContext';

const {
  layouts,                  // Record<pageId, Widget[]>
  addWidgetToPage,          // (pageId, widgetData) => void
  removeWidgetFromPage,     // (pageId, widgetId) => void
  updateLayoutForPage,      // (pageId, layoutUpdates) => void
  setPageLayout,            // (pageId, widgets) => void
} = usePersonalization();
```

### Pages supportées

| Page ID | Route |
|---------|-------|
| `dashboard` | `/dashboard` |
| `finance` | `/finance` |
| `revenue` | `/sales` |
| `operational` | `/purchases` |
| `inventory` | `/stocks` |
| `accounting` | `/accounting` |
| `risks` | `/risks` |
| `smart-queries` | `/smart-queries` |

---

## DashboardEditContext

Gère le mode édition (drag & drop) des grilles de widgets.

```tsx
import { useDashboardEdit } from '@/context/DashboardEditContext';

const {
  isEditing,        // Boolean — mode édition actif
  setIsEditing,
  isSidebarOpen,    // Boolean — panneau latéral ouvert
  setIsSidebarOpen,
} = useDashboardEdit();
```

---

## Cache des données

Le système de cache (`src/lib/cache.ts`) optimise les requêtes API :

```tsx
import { getLastUpdate, forceRefresh } from '@/lib/cache';

// Obtenir l'heure de la dernière mise à jour
const lastUpdate = getLastUpdate();

// Forcer le rechargement de toutes les données
forceRefresh();
```
