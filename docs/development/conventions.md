# Conventions de code

## Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Composants React | PascalCase | `MyComponent.tsx` |
| Hooks | camelCase + préfixe `use` | `useMyHook.ts` |
| Types / Interfaces | PascalCase | `MyInterface` |
| Constantes | SCREAMING_SNAKE_CASE | `PAGE_DEFAULT_WIDGETS` |
| Variables | camelCase | `myVariable` |
| Fichiers CSS | kebab-case | `my-component.css` |

---

## Structure d'un composant

```tsx
// src/features/myfeature/MyPage.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useMyData } from '@/hooks/use-api';

interface MyPageProps {
  title: string;
}

export function MyPage({ title }: MyPageProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useMyData();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6" data-testid="my-page">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {/* Contenu */}
    </div>
  );
}
```

---

## Classes Tailwind fréquentes

```tsx
// Espacement des pages
<div className="space-y-6">

// En-tête de page
<h1 className="text-2xl font-bold tracking-tight">
<p className="text-muted-foreground">

// Grilles responsives
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

// Flexbox avec actions
<div className="flex items-center justify-between gap-4">

// Cards
<div className="rounded-lg border bg-card p-6 shadow-sm">
```

---

## Test IDs

Chaque élément interactif doit avoir un `data-testid` descriptif :

```tsx
<Button data-testid="create-user-btn">Créer</Button>
<div data-testid="users-table">...</div>
<input data-testid="search-input" />
```

---

## Alias d'import

Utiliser toujours l'alias `@/` pour les imports internes :

```tsx
// ✅ Correct
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';

// ❌ Éviter
import { Button } from '../../components/ui/button';
```

---

## Gestion des erreurs API

```tsx
const { data, isLoading, error } = useMyData();

if (error) {
  return (
    <div className="text-destructive">
      Erreur lors du chargement des données.
    </div>
  );
}
```

---

## Traductions

Toujours utiliser `t()` pour les textes affichés à l'utilisateur :

```tsx
const { t } = useTranslation();

// ✅ Correct
<h1>{t('risks.title')}</h1>

// ❌ Éviter les strings hardcodées
<h1>Risques & Recouvrement</h1>
```
