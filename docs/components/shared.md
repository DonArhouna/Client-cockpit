# Composants Partagés

Les composants partagés sont dans `src/components/shared/` et `src/components/layout/`.

---

## Layout

### MainLayout

`src/components/layout/MainLayout.tsx`

Conteneur principal de l'application protégée. Comprend :
- Sidebar de navigation
- Header
- Zone de contenu principale

### Sidebar

`src/components/layout/Sidebar.tsx`

Navigation latérale avec liens vers toutes les pages. Supporte :
- Mode réduit (icônes uniquement)
- Liens actifs mis en évidence
- Icônes Lucide React

### Header

`src/components/layout/Header.tsx`

En-tête global contenant :
- Toggle thème dark/light
- Sélecteur de langue (FR/EN)
- Menu profil utilisateur

---

## Composants partagés

### LoadingSpinner

```tsx
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Taille normale
<LoadingSpinner />

// Grande taille
<LoadingSpinner size="lg" />

// Plein écran (pendant le chargement initial)
<LoadingSpinner fullScreen />
```

### PageInsight

Bandeau d'insight IA affiché sur chaque page analytique.

```tsx
import { PageInsight } from '@/components/shared/PageInsight';

<PageInsight
  icon="TrendingUp"        // Icône Lucide
  label="Indicateur clé"  // Label du badge
  text="Le CA progresse de +5.2% ce trimestre..."
  variant="success"        // 'success' | 'warning' | 'danger' | 'info'
/>
```

### KpiSearchBar

Barre de recherche en langage naturel disponible sur chaque page.

```tsx
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';

<KpiSearchBar placeholder="Posez votre question sur les données..." />
```

### InsightBanner

Bandeau d'alertes prioritaires sur le Dashboard.

```tsx
import { InsightBanner } from '@/components/shared/InsightBanner';

<InsightBanner />
```

### Breadcrumbs

Fil d'Ariane pour la navigation.

```tsx
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { MessageSquare } from 'lucide-react';

<Breadcrumbs currentPage="Requêtes Intelligentes" PageIcon={MessageSquare} />
```

### QuickActions

Actions rapides contextuelles.

```tsx
import { QuickActions } from '@/components/shared/QuickActions';

<QuickActions />
```

---

## Composants UI (shadcn/ui)

Disponibles dans `src/components/ui/` :

| Composant | Usage |
|-----------|-------|
| `Button` | Boutons avec variantes (default, outline, ghost…) |
| `Card` | Carte avec CardHeader, CardContent, CardTitle |
| `Input` | Champ de saisie |
| `Label` | Label de formulaire |
| `Badge` | Badge de statut |
| `Dialog` | Modale |
| `DropdownMenu` | Menu déroulant |
| `Tabs` | Onglets (TabsList, TabsTrigger, TabsContent) |
| `Avatar` | Avatar utilisateur |
| `Skeleton` | Placeholder de chargement |
| `Table` | Tableau de données |

### Exemple d'utilisation

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

<Card>
  <CardHeader>
    <CardTitle>Mon titre</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default">Action</Button>
    <Badge variant="outline">Statut</Badge>
  </CardContent>
</Card>
```

---

## Chatbot Assistant

`src/components/chatbot/`

| Composant | Rôle |
|-----------|------|
| `ChatbotAssistant` | Conteneur principal du chatbot |
| `ChatWindow` | Fenêtre de conversation |
| `ChatMessage` | Bulle de message |
| `ChatHistory` | Historique des conversations |
