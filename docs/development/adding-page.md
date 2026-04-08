# Ajouter une nouvelle page

Ce tutoriel explique comment ajouter une nouvelle page analytique au projet, en suivant les conventions existantes.

---

## Exemple : Ajouter une page "RH / Ressources Humaines"

### Étape 1 — Créer le dossier et la page

```tsx
// src/features/hr/HrPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useKpiDefinitions } from '@/hooks/use-api';
import { PageInsight } from '@/components/shared/PageInsight';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const PAGE_ID = 'hr';

export function HrPage() {
  const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
  const { layouts, addWidgetToPage, setPageLayout, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
  const { data: kpiDefinitions, isLoading } = useKpiDefinitions();

  const widgets = useMemo(() => layouts[PAGE_ID] || [], [layouts]);

  // Auto-population par défaut
  useEffect(() => {
    if (!isLoading && kpiDefinitions && widgets.length === 0) {
      const hrKpis = kpiDefinitions
        .filter(kpi => kpi.isActive && kpi.category === 'hr')
        .slice(0, 4);

      const defaultWidgets = hrKpis.map((kpi, index) => ({
        id: `hr-${Date.now()}-${index}`,
        dashboardId: 'local-personalization',
        name: kpi.name,
        type: 'kpi',
        kpiKey: kpi.key,
        vizType: kpi.defaultVizType,
        position: { x: index * 3, y: 0, w: 3, h: 3 },
        config: { unit: kpi.unit },
        isActive: true,
        userId: 'local-user',
        organizationId: 'local-org',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setPageLayout(PAGE_ID, defaultWidgets as any);
    }
  }, [isLoading, kpiDefinitions, widgets.length, setPageLayout]);

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="flex w-full overflow-x-hidden relative min-h-[calc(100vh-4rem)]">
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pr-80' : ''}`}>
        <div className="p-6 space-y-6 flex-1 flex flex-col">
          <h1 className="text-2xl font-bold">Ressources Humaines</h1>

          <PageInsight
            icon="Users"
            label="Synthèse RH"
            text="Indicateur RH chargé depuis l'API."
            variant="info"
          />

          <div className="flex-1">
            <DashboardGrid
              widgets={widgets}
              isEditing={isEditing}
              onRemoveWidget={(id) => removeWidgetFromPage(PAGE_ID, id)}
              onLayoutChangeAction={(updates) => updateLayoutForPage(PAGE_ID, updates)}
            />
          </div>
        </div>
      </div>

      <div className={`absolute top-0 right-0 bottom-0 h-full z-20 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <WidgetSidebar
          onClose={() => setIsSidebarOpen(false)}
          onAddWidget={(data) => addWidgetToPage(PAGE_ID, data)}
          allowedDomains={['hr']}
        />
      </div>
    </div>
  );
}
```

---

### Étape 2 — Ajouter la route dans App.tsx

```tsx
// src/App.tsx
import { HrPage } from './features/hr/HrPage';

// Dans les routes protégées :
<Route path="/hr" element={<HrPage />} />
```

---

### Étape 3 — Ajouter dans la Sidebar

```tsx
// src/components/layout/Sidebar.tsx
import { Users } from 'lucide-react';

const navItems = [
  // ... autres items existants
  { path: '/hr', icon: Users, labelKey: 'nav.hr', label: 'Ressources Humaines' },
];
```

---

### Étape 4 — Ajouter les traductions

```tsx
// src/i18n/fr.ts
nav: {
  hr: 'Ressources Humaines',
}

// src/i18n/en.ts
nav: {
  hr: 'Human Resources',
}
```

---

### Étape 5 — Ajouter les widgets par défaut (optionnel)

```ts
// src/features/personalization/DefaultLayouts.ts
export const PAGE_DEFAULT_WIDGETS = {
  // ... pages existantes
  hr: (kpiDefinitions: KpiDefinition[]) => {
    return kpiDefinitions
      .filter(kpi => kpi.category === 'hr' && kpi.isActive)
      .slice(0, 4)
      .map((kpi, i) => ({ /* ... */ }));
  },
};
```

---

## Checklist

- [x] Composant page créé dans `src/features/<feature>/`
- [x] Route ajoutée dans `src/App.tsx`
- [x] Lien ajouté dans `src/components/layout/Sidebar.tsx`
- [x] Traductions ajoutées dans `fr.ts` et `en.ts`
- [ ] Tests ajoutés dans `src/test/`
- [ ] Documentation MkDocs mise à jour
