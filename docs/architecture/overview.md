# Vue d'ensemble de l'Architecture

## Schéma global

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Cockpit                          │
│                (React 18 + Vite + TypeScript)               │
├─────────────┬───────────────────┬───────────────────────────┤
│  Pages Auth │  Pages Analytique │   Admin & Paramètres      │
│  /login     │  /dashboard       │   /settings               │
│  /register  │  /finance         │   /organizations          │
│  /onboarding│  /sales, /risks…  │   /users, /roles…         │
└──────┬──────┴────────┬──────────┴──────────┬────────────────┘
       │               │                     │
       └───────────────┼─────────────────────┘
                       │
              ┌────────▼────────┐
              │   AuthContext   │
              │   (JWT Auth)    │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │   API Client    │
              │   (Axios)       │
              └────────┬────────┘
                       │  HTTP/HTTPS
                       ▼
              ┌─────────────────┐
              │  Backend NestJS │
              │  Port 3000/api  │
              └─────────────────┘
```

---

## Providers Stack

L'application utilise une pile de providers imbriqués :

```tsx
// src/main.tsx
<QueryClientProvider client={queryClient}>       // Cache TanStack Query
  <BrowserRouter>                                // Routing React Router
    <ThemeProvider>                              // Thème dark/light
      <AuthProvider>                             // État d'authentification
        <App />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
</QueryClientProvider>
```

```tsx
// src/App.tsx — Providers supplémentaires dans le layout principal
<DashboardEditProvider>                          // Mode édition dashboard
  <PersonalizationProvider>                      // Layouts et widgets
    <FilterProvider>                             // Filtres globaux (période, devise)
      <MainLayout>
        {/* Routes protégées */}
      </MainLayout>
    </FilterProvider>
  </PersonalizationProvider>
</DashboardEditProvider>
```

---

## Flux d'authentification

```
Utilisateur → LoginPage → AuthContext → POST /api/auth/login
                                      ←  { accessToken, refreshToken, user }
                         AuthContext → Stockage localStorage
                                     → Redirection /dashboard
```

### Gestion des tokens

```
Requête API →  Request Interceptor  → Ajout Bearer token
             ← Response Interceptor  → Si 401 : refresh automatique
                                        Si refresh KO : redirection login
```

---

## Structure des composants

```
App.tsx
├── Pages publiques (Login, Register, ForgotPassword…)
├── /onboarding (OnboardingPage — hors layout)
└── ProtectedRoute + OnboardingGuard
    └── MainLayout
        ├── Sidebar (navigation latérale)
        ├── Header (thème, langue, profil)
        └── <Routes> (pages principales)
            ├── DashboardPage
            ├── TreasuryPage (/finance)
            ├── RevenueAnalysisPage (/sales)
            ├── OperationalPerformancePage (/purchases)
            ├── InventoryPage (/stocks)
            ├── AccountingPage (/accounting)
            ├── RisksPage (/risks)
            ├── IntelligentQueriesPage (/smart-queries)
            ├── SettingsPage (/settings)
            └── Pages Admin (organizations, users, roles…)
```

---

## Communication avec le Backend

### Endpoints principaux

| Module | Endpoint | Méthode | Description |
|--------|----------|---------|-------------|
| Auth | `/api/auth/login` | POST | Connexion |
| Auth | `/api/auth/refresh` | POST | Refresh token |
| Auth | `/api/auth/logout` | POST | Déconnexion |
| Users | `/api/users/me` | GET | Profil courant |
| KPI | `/api/kpi-definitions` | GET | Définitions des KPIs |
| KPI | `/api/kpi-data/:key` | GET | Données d'un KPI |
| NLQ | `/api/nlq/query` | POST | Requête en langage naturel |
| Dashboard | `/api/dashboards/my` | GET | Dashboard de l'utilisateur |
| Onboarding | `/api/onboarding/status` | GET | Statut de l'onboarding |

### Format des réponses

```typescript
// Succès
{
  data: T,
  meta?: {
    total: number,
    limit: number,
    offset: number,
    hasMore: boolean
  }
}

// Erreur
{
  statusCode: number,
  message: string,
  error?: string
}
```
