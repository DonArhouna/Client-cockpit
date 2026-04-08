import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './features/auth/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './features/auth/LoginPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { OrganizationsPage } from './features/organizations/OrganizationsPage';
import { OrganizationDetailPage } from './features/organizations/OrganizationDetailPage';
import { UsersPage } from './features/users/UsersPage';
import { UserDetailPage } from './features/users/UserDetailPage';
import { RolesPage } from './features/roles/RolesPage';
import { RoleDetailPage } from './features/roles/RoleDetailPage';
import { AgentsPage } from './features/agents/AgentsPage';
import { AgentDetailPage } from './features/agents/AgentDetailPage';
import { AuditLogsPage } from './features/audit-logs/AuditLogsPage';
import { InvitationsPage } from './features/invitations/InvitationsPage';
import { HealthPage } from './features/health/HealthPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { SubscriptionPlansPage } from './features/subscriptions/SubscriptionPlansPage';
import { SubscriptionPlanDetailPage } from './features/subscriptions/SubscriptionPlanDetailPage';
import { ClientPlansPage } from '@/features/subscriptions/ClientPlansPage';
import { KpiStorePage } from './features/kpi-store/KpiStorePage';
import { WidgetTemplateDetailPage } from './features/kpi-store/WidgetTemplateDetailPage';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { DashboardEditProvider } from './context/DashboardEditContext';
import { PersonalizationPage } from './features/personalization/PersonalizationPage';
import { PersonalizationProvider } from './features/personalization/PersonalizationContext';
import { TableSettingsProvider } from './features/personalization/TableSettingsContext';
import { FilterProvider } from './context/FilterContext';
import { IntelligentQueriesPage } from './features/queries/IntelligentQueriesPage';
import { TreasuryPage } from './features/cashflow/TreasuryPage';
import { RevenueAnalysisPage } from './features/revenue/RevenueAnalysisPage';
import { OperationalPerformancePage } from './features/operational/OperationalPerformancePage';
import InventoryPage from './features/inventory/InventoryPage';
import AccountingPage from './features/accounting/AccountingPage';
import RisksPage from './features/risks/RisksPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { TargetsPage } from './features/targets/TargetsPage';
import { TargetDetailPage } from './features/targets/TargetDetailPage';
import { OnboardingPage } from './features/onboarding';
import { AcceptInvitationPage } from './features/auth/AcceptInvitationPage';
import { RegisterPage } from './features/auth/RegisterPage';

// ─── Guards ──────────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

/**
 * OnboardingGuard — blocks access to the main app until onboarding is complete.
 * Superadmins (no organizationId) bypass the guard.
 */
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, onboardingStatus, onboardingLoading, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || onboardingLoading) return;

    // Check if user is a SuperAdmin
    const isSuperAdmin = user?.userRoles?.some(ur => ur.role.name === 'superadmin');

    // Superadmins bypass onboarding guard
    if (isSuperAdmin) return;

    // Others with no org (shouldn't happen for regular users) also skip
    if (!user?.organizationId) return;

    if (onboardingStatus && !onboardingStatus.isComplete) {
      navigate('/onboarding', { replace: true });
    }
  }, [onboardingStatus, onboardingLoading, isLoading, user, navigate]);

  if (isLoading || onboardingLoading) return <LoadingSpinner fullScreen />;

  return <>{children}</>;
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Onboarding — authenticated but outside MainLayout */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Main app — requires auth + completed onboarding */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <DashboardEditProvider>
                <TableSettingsProvider>
                  <PersonalizationProvider>
                    <FilterProvider>
                    <MainLayout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/finance" element={<TreasuryPage />} />
                        <Route path="/revenue-analysis" element={<Navigate to="/sales" replace />} />
                        <Route path="/sales" element={<RevenueAnalysisPage />} />
                        <Route path="/purchases" element={<OperationalPerformancePage />} />
                        <Route path="/stocks" element={<InventoryPage />} />
                        <Route path="/accounting" element={<AccountingPage />} />
                        <Route path="/risks" element={<RisksPage />} />
                        <Route path="/smart-queries" element={<IntelligentQueriesPage />} />
                        <Route path="/personalization" element={<PersonalizationPage />} />
                        <Route path="/organizations" element={<OrganizationsPage />} />
                        <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/users/:id" element={<UserDetailPage />} />
                        <Route path="/invitations" element={<InvitationsPage />} />
                        <Route path="/roles" element={<RolesPage />} />
                        <Route path="/roles/:id" element={<RoleDetailPage />} />
                        <Route path="/agents" element={<AgentsPage />} />
                        <Route path="/agents/:id" element={<AgentDetailPage />} />
                        <Route path="/audit-logs" element={<AuditLogsPage />} />
                        <Route path="/health" element={<HealthPage />} />
                        <Route path="/profile" element={<div className="p-6"><ProfilePage /></div>} />
                        <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
                        <Route path="/subscription-plans/:id" element={<SubscriptionPlanDetailPage />} />
                        <Route path="/client-plans" element={<ClientPlansPage />} />
                        <Route path="/kpi-store" element={<KpiStorePage />} />
                        <Route path="/kpi-store/widget-templates/:id" element={<WidgetTemplateDetailPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/targets" element={<TargetsPage />} />
                        <Route path="/targets/:id" element={<TargetDetailPage />} />
                      </Routes>
                    </MainLayout>
                  </FilterProvider>
                </PersonalizationProvider>
              </TableSettingsProvider>
            </DashboardEditProvider>
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
