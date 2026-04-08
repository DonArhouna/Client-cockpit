# Guide de développement

## Providers (src/main.tsx)

L'application utilise plusieurs providers imbriqués :

```tsx
<QueryClientProvider>      // Cache et fetching des données
  <BrowserRouter>          // Routing
    <ThemeProvider>        // Gestion du thème dark/light
      <AuthProvider>       // État d'authentification
        <App />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
</QueryClientProvider>
```

---

## Flux d'authentification

1. **Au chargement** : `AuthProvider` vérifie le token dans localStorage
2. **Si token présent** : Appel `GET /users/me` pour valider
3. **Si token invalide** : Tentative de refresh, sinon redirection login
4. **Routes protégées** : `ProtectedRoute` wrapper dans `App.tsx`

```tsx
const { user, isAuthenticated, login, logout } = useAuth();
```

---

## Client API (src/api/client.ts)

Configuration Axios avec :

- **Request interceptor** : Ajoute le Bearer token automatiquement
- **Response interceptor** : Gère le refresh token sur 401

```tsx
import { authApi } from '@/api';

// Login
const response = await authApi.login({ email, password });
```

---

## Gestion du thème

```tsx
import { useTheme } from '@/components/shared/ThemeProvider';

const { theme, toggleTheme, setTheme } = useTheme();

// theme: 'dark' | 'light'
// toggleTheme(): void — bascule entre dark/light
// setTheme(theme): void — définit explicitement
```

---

## Internationalisation

```tsx
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Utilisation
<h1>{t('dashboard.title')}</h1>

// Changer de langue
i18n.changeLanguage('en');
```

Structure des fichiers de traduction :

```
src/i18n/
├── index.ts   # Configuration i18next
├── fr.ts      # Traductions françaises
└── en.ts      # Traductions anglaises
```

---

## Composants UI

Les composants shadcn/ui sont dans `src/components/ui/`.

### Import des composants

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
```

---

## Variables CSS du thème

Définies dans `src/index.css` :

```css
/* Light mode */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
}

/* Dark mode */
.dark {
  --background: 224 71% 4%;
  --foreground: 213 31% 91%;
  --primary: 217.2 91.2% 59.8%;
}
```

Utilisation dans Tailwind :

```tsx
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">
```

---

## Pattern de chargement

```tsx
{isLoading ? (
  <div className="h-[300px] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
) : (
  <DashboardGrid widgets={widgets} ... />
)}
```

!!! warning "Important"
    `DataTable` n'accepte pas de prop `isLoading` — utiliser toujours le pattern conditionnel ci-dessus.
