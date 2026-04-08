# Dashboard Grid & Widget Sidebar

Les composants `DashboardGrid` et `WidgetSidebar` sont au cœur du système de personnalisation de Cockpit.

---

## DashboardGrid

`src/features/dashboard/components/DashboardGrid.tsx`

Grille de widgets basée sur **React Grid Layout**. Permet le drag & drop et le redimensionnement.

### Props

```tsx
interface DashboardGridProps {
  widgets: Widget[];                    // Liste des widgets à afficher
  isEditing: boolean;                   // Mode édition activé
  onLayoutChangeAction: (             
    updates: Record<string, Position>   // Nouvelles positions
  ) => void;
  onRemoveWidget: (widgetId: string) => void;
}
```

### Utilisation

```tsx
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';

<DashboardGrid
  widgets={widgets}
  isEditing={isEditing}
  onLayoutChangeAction={handleLayoutChange}
  onRemoveWidget={handleRemoveWidget}
/>
```

---

## WidgetSidebar

`src/features/dashboard/components/WidgetSidebar.tsx`

Panneau latéral de droite permettant d'ajouter de nouveaux widgets à la grille.

### Props

```tsx
interface WidgetSidebarProps {
  onClose: () => void;
  onAddWidget: (widgetData: Partial<Widget>) => void;
  allowedDomains?: string[];   // Filtrer les widgets par domaine
}
```

### Domaines disponibles

| Domaine | Page |
|---------|------|
| `dashboard` | `/dashboard` |
| `finance` | `/finance` |
| `sales` | `/sales` |
| `purchases` | `/purchases` |
| `inventory` | `/stocks` |
| `accounting` | `/accounting` |
| `risks` | `/risks` |

### Utilisation

```tsx
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';

<WidgetSidebar
  onClose={() => setIsSidebarOpen(false)}
  onAddWidget={handleAddWidget}
  allowedDomains={['finance']}  // Optionnel — filtre les widgets du domaine
/>
```

---

## Types de Widgets

| Type | Description | Visualisations |
|------|-------------|----------------|
| `kpi` | Carte KPI avec valeur et tendance | `card` |
| `graph` | Graphique de données | `line`, `bar`, `area`, `pie` |
| `table` | Tableau de données | `table` |

---

## Visuels disponibles

| Composant | Fichier | Type |
|-----------|---------|------|
| `KpiVisual` | `visuals/KpiVisual.tsx` | Carte KPI |
| `RevenueEvolutionVisual` | `visuals/RevenueEvolutionVisual.tsx` | Graphique ventes |
| `ReceivablesVisual` | `visuals/ReceivablesVisual.tsx` | Créances |
| `VarianceVisual` | `visuals/VarianceVisual.tsx` | Écarts budgétaires |
| `TopClientsVisual` | `visuals/TopClientsVisual.tsx` | Top clients |
| `PieVisual` | `visuals/PieVisual.tsx` | Camembert |
| `TableVisual` | `visuals/TableVisual.tsx` | Tableau de données |

---

## WidgetCard

`src/features/dashboard/components/WidgetCard.tsx`

Conteneur individuel d'un widget sur la grille. Gère :
- L'affichage du widget
- Le bouton de suppression (mode édition)
- Les animations d'entrée/sortie
