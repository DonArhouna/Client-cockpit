# Routage & Guards

## Configuration des routes

Le routage est géré par **React Router v7** dans `src/App.tsx`.

### Routes publiques

```tsx
<Routes>
  {/* Accessible sans authentification */}
  <Route path="/login"              element={<LoginPage />} />
  <Route path="/forgot-password"   element={<ForgotPasswordPage />} />
  <Route path="/reset-password"    element={<ResetPasswordPage />} />
  <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
  <Route path="/register"          element={<RegisterPage />} />
  ...
</Routes>
```

### Route Onboarding

```tsx
{/* Authentifiée mais hors layout principal */}
<Route
  path="/onboarding"
  element={
    <ProtectedRoute>
      <OnboardingPage />
    </ProtectedRoute>
  }
/>
```

### Routes protégées principales

```tsx
<Route path="/*" element={
  <ProtectedRoute>
    <OnboardingGuard>
      <DashboardEditProvider>
        <PersonalizationProvider>
          <FilterProvider>
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/finance"   element={<TreasuryPage />} />
                {/* ... */}
              </Routes>
            </MainLayout>
          </FilterProvider>
        </PersonalizationProvider>
      </DashboardEditProvider>
    </OnboardingGuard>
  </ProtectedRoute>
} />
```

---

## Guards (Gardiens de routes)

### ProtectedRoute

Vérifie que l'utilisateur est authentifié. Sinon, redirige vers `/login`.

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
```

### OnboardingGuard

Vérifie que l'onboarding est complété avant d'accéder à l'application.

```tsx
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, onboardingStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Les superadmins bypasse l'onboarding
    const isSuperAdmin = user?.userRoles?.some(ur => ur.role.name === 'superadmin');
    if (isSuperAdmin) return;

    // Redirection si onboarding incomplet
    if (onboardingStatus && !onboardingStatus.isComplete) {
      navigate('/onboarding', { replace: true });
    }
  }, [onboardingStatus, user, navigate]);

  return <>{children}</>;
}
```

---

## Redirections

| De | Vers | Raison |
|----|------|--------|
| `/` | `/dashboard` | Page d'accueil par défaut |
| `/revenue-analysis` | `/sales` | Ancien chemin renommé |

---

## Table des routes

| Route | Composant | Protégée | Onboarding requis |
|-------|-----------|----------|------------------|
| `/login` | `LoginPage` | ❌ | ❌ |
| `/register` | `RegisterPage` | ❌ | ❌ |
| `/forgot-password` | `ForgotPasswordPage` | ❌ | ❌ |
| `/reset-password` | `ResetPasswordPage` | ❌ | ❌ |
| `/accept-invitation` | `AcceptInvitationPage` | ❌ | ❌ |
| `/onboarding` | `OnboardingPage` | ✅ | ❌ |
| `/dashboard` | `DashboardPage` | ✅ | ✅ |
| `/finance` | `TreasuryPage` | ✅ | ✅ |
| `/sales` | `RevenueAnalysisPage` | ✅ | ✅ |
| `/purchases` | `OperationalPerformancePage` | ✅ | ✅ |
| `/stocks` | `InventoryPage` | ✅ | ✅ |
| `/accounting` | `AccountingPage` | ✅ | ✅ |
| `/risks` | `RisksPage` | ✅ | ✅ |
| `/smart-queries` | `IntelligentQueriesPage` | ✅ | ✅ |
| `/settings` | `SettingsPage` | ✅ | ✅ |
| `/profile` | `ProfilePage` | ✅ | ✅ |
