import { Routes, Route, Navigate } from 'react-router-dom';
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
import { HealthPage } from './features/health/HealthPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { SubscriptionPlansPage } from './features/subscriptions/SubscriptionPlansPage';
import { SubscriptionPlanDetailPage } from './features/subscriptions/SubscriptionPlanDetailPage';
import { LoadingSpinner } from './components/shared/LoadingSpinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/organizations" element={<OrganizationsPage />} />
                <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:id" element={<UserDetailPage />} />
                <Route path="/roles" element={<RolesPage />} />
                <Route path="/roles/:id" element={<RoleDetailPage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/agents/:id" element={<AgentDetailPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
                <Route path="/health" element={<HealthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
                <Route path="/subscription-plans/:id" element={<SubscriptionPlanDetailPage />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
