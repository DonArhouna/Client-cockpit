import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { MainLayout } from './MainLayout';
import { DashboardEditProvider } from '@/context/DashboardEditContext';
import { PersonalizationProvider } from '@/features/personalization/PersonalizationContext';
import { FilterProvider } from '@/context/FilterContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

/**
 * ProtectedRoute - Vérifie l'authentification
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

/**
 * OnboardingGuard - Bloque l'accès tant que l'onboarding n'est pas terminé
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, onboardingStatus, onboardingLoading, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || onboardingLoading) return;

    // Les superadmins bypassent l'onboarding
    const isSuperAdmin = user?.userRoles?.some(ur => ur.role.name === 'superadmin');
    if (isSuperAdmin) return;

    // Pas d'organisation = bypass (ne devrait pas arriver)
    if (!user?.organizationId) return;

    if (onboardingStatus && !onboardingStatus.isComplete) {
      navigate('/onboarding', { replace: true });
    }
  }, [onboardingStatus, onboardingLoading, isLoading, user, navigate]);

  if (isLoading || onboardingLoading) return <LoadingSpinner fullScreen />;

  return <>{children}</>;
}

/**
 * AppLayout - Le layout principal regroupant tous les providers et gardes
 */
export function AppLayout() {
  return (
    <ProtectedRoute>
      <OnboardingGuard>
        <DashboardEditProvider>
          <PersonalizationProvider>
            <FilterProvider>
              <MainLayout />
            </FilterProvider>
          </PersonalizationProvider>
        </DashboardEditProvider>
      </OnboardingGuard>
    </ProtectedRoute>
  );
}
