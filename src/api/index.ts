import api from './client';
import type {
  User,
  Organization,
  Role,
  Permission,
  Agent,
  AuditLog,
  LoginCredentials,
  AuthResponse,
  PaginatedResponse,
  SubscriptionPlan,
  KpiDefinition,
  WidgetTemplate,
  Invitation,
  KpiPack,
  AgentLogsResponse,
  Dashboard,
  Widget,
  WidgetPosition,
  Target,
  OnboardingStatus,
  BillingSubscription,
} from '@/types';

// Auth
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),

  logout: () =>
    api.post('/auth/logout'),

  refresh: () =>
    api.post('/auth/refresh'),

  me: () =>
    api.get<User>('/users/me'),

  updateMe: (data: { firstName?: string; lastName?: string }) =>
    api.patch<User>('/users/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: any) =>
    api.post('/auth/reset-password', data),

  getInvitationInfo: (token: string) =>
    api.get<{ email: string; organizationName: string; role: string }>(`/auth/invitation-info?token=${encodeURIComponent(token)}`),

  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    invitationToken: string;
  }) => api.post<AuthResponse>('/auth/register', data),

  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }) => api.post<AuthResponse>('/auth/signup', data),
};

// Admin - Organizations
export const organizationsApi = {
  getAll: () =>
    api.get<Organization[]>('/admin/organizations'),

  getById: (id: string) =>
    api.get<Organization>(`/admin/organizations/${id}`),

  update: (id: string, data: Partial<Organization>) =>
    api.patch<Organization>(`/admin/organizations/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/organizations/${id}`),

  createClient: (data: {
    organizationName: string;
    adminEmail: string;
    adminFirstName: string;
    adminLastName: string;
    planId?: string;
  }) => api.post('/admin/clients', data),
};

// Admin - Billing
export const adminBillingApi = {
  getSubscriptions: () =>
    api.get<{
      subscriptions: (BillingSubscription & {
        organization: { id: string; name: string; sector: string | null };
      })[];
      unsubscribed: { id: string; name: string }[];
      summary: { total: number; active: number; trialing: number; pastDue: number; cancelled: number; neverSubscribed: number };
    }>('/admin/billing/subscriptions'),
};

// Admin - General
export const adminApi = {
  getStats: () =>
    api.get('/admin/dashboard-stats'),
  getAllInvitations: () =>
    api.get<Invitation[]>('/admin/invitations'),
};

// Admin - Users
export const usersApi = {
  getAll: () =>
    api.get<User[]>('/admin/users'),

  create: (data: any) =>
    api.post<User>('/admin/users', data),

  getById: (id: string) =>
    api.get<User>(`/admin/users/${id}`),

  update: (id: string, data: Partial<User> & { isActive?: boolean }) =>
    api.patch<User>(`/admin/users/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/users/${id}`),

  invite: (data: { email: string; role: string; organizationId: string }) =>
    api.post('/auth/invite', data),
};

// Roles
export const rolesApi = {
  getAll: () =>
    api.get<Role[]>('/roles'),

  getById: (id: string) =>
    api.get<Role>(`/roles/${id}`),

  getPermissions: () =>
    api.get<Permission[]>('/roles/permissions'),

  create: (data: { name: string; description?: string; permissionIds: string[] }) =>
    api.post<Role>('/roles', data),

  update: (id: string, data: Partial<Role>) =>
    api.patch<Role>(`/roles/${id}`, data),

  delete: (id: string) =>
    api.delete(`/roles/${id}`),
};

// Agents
export const agentsApi = {
  getStatus: () =>
    api.get('/agents/status'),

  getById: (id: string) =>
    api.get<Agent>(`/agents/${id}`),

  generateToken: (data: { name?: string; force?: boolean }) =>
    api.post('/agents/generate-token', data),

  regenerateToken: (id: string) =>
    api.post(`/agents/${id}/regenerate-token`),

  revokeToken: (id: string) =>
    api.post(`/agents/${id}/revoke`),

  testConnection: (id: string) =>
    api.post(`/agents/${id}/test-connection`),

  getLogs: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<AgentLogsResponse>(`/agents/${id}/logs`, { params }),
};

// Subscription Plans
export const subscriptionPlansApi = {
  getAll: () =>
    api.get<SubscriptionPlan[]>('/admin/subscription-plans'),

  getActive: () =>
    api.get<SubscriptionPlan[]>('/subscriptions/plans'),

  create: (data: Partial<SubscriptionPlan>) =>
    api.post<SubscriptionPlan>('/admin/subscription-plans', data),

  update: (id: string, data: Partial<SubscriptionPlan>) =>
    api.patch<SubscriptionPlan>(`/admin/subscription-plans/${id}`, data),

  getById: (id: string) =>
    api.get<SubscriptionPlan>(`/admin/subscription-plans/${id}`),

  deactivate: (id: string) =>
    api.delete(`/admin/subscription-plans/${id}`),
};

// KPI Store - KPI Definitions
export const kpiDefinitionsApi = {
  getAll: () =>
    api.get<KpiDefinition[]>('/admin/kpi-definitions'),

  create: (data: Omit<KpiDefinition, 'id' | 'isActive' | 'createdAt'>) =>
    api.post<KpiDefinition>('/admin/kpi-definitions', data),

  update: (id: string, data: Partial<Omit<KpiDefinition, 'id' | 'createdAt'>>) =>
    api.patch<KpiDefinition>(`/admin/kpi-definitions/${id}`, data),

  toggle: (id: string) =>
    api.delete<KpiDefinition>(`/admin/kpi-definitions/${id}`),
};

// KPI Store - Widget Templates
export const widgetTemplatesApi = {
  getAll: () =>
    api.get<WidgetTemplate[]>('/admin/widget-templates'),

  getById: (id: string) =>
    api.get<WidgetTemplate>(`/admin/widget-templates/${id}`),

  create: (data: Omit<WidgetTemplate, 'id' | 'isActive' | 'createdAt'>) =>
    api.post<WidgetTemplate>('/admin/widget-templates', data),

  update: (id: string, data: Partial<Omit<WidgetTemplate, 'id' | 'createdAt'>>) =>
    api.patch<WidgetTemplate>(`/admin/widget-templates/${id}`, data),

  toggle: (id: string) =>
    api.delete<WidgetTemplate>(`/admin/widget-templates/${id}`),
};

// KPI Store - KPI Packs (admin)
export const kpiPacksApi = {
  getAll: () =>
    api.get<KpiPack[]>('/admin/kpi-packs'),

  create: (data: Omit<KpiPack, 'id' | 'isActive' | 'createdAt'>) =>
    api.post<KpiPack>('/admin/kpi-packs', data),

  update: (id: string, data: Partial<Omit<KpiPack, 'id' | 'createdAt'>>) =>
    api.patch<KpiPack>(`/admin/kpi-packs/${id}`, data),

  toggle: (id: string) =>
    api.delete<KpiPack>(`/admin/kpi-packs/${id}`),
};

// KPI Packs - Client-facing (authenticated, non-admin)
export const kpiPacksClientApi = {
  getAll: (profile?: string) =>
    api.get<(KpiPack & { kpiDefinitions?: KpiDefinition[] })[]>(
      '/dashboards/kpi-packs',
      { params: profile ? { profile } : undefined }
    ),
};

// Audit Logs
export const auditLogsApi = {
  getAll: (params?: {
    userId?: string;
    event?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => api.get<PaginatedResponse<AuditLog>>('/logs/audit', { params }),

  getEventTypes: () =>
    api.get<{ event: string; count: number }[]>('/logs/audit/events'),
};

// Health
export const healthApi = {
  check: () =>
    api.get('/health'),

  checkDb: () =>
    api.get('/health/db'),
};

// Dashboards
export const dashboardsApi = {
  getMine: () =>
    api.get<Dashboard>('/dashboards/me'),

  getAll: () =>
    api.get<Dashboard[]>('/dashboards'),

  getById: (id: string) =>
    api.get<Dashboard>(`/dashboards/${id}`),

  create: (data: { name: string; isDefault?: boolean }) =>
    api.post<Dashboard>('/dashboards', data),

  update: (id: string, data: { name?: string; isDefault?: boolean; layout?: unknown[] }) =>
    api.patch<Dashboard>(`/dashboards/${id}`, data),

  delete: (id: string) =>
    api.delete(`/dashboards/${id}`),

  addWidget: (dashboardId: string, data: {
    name: string;
    type: string;
    kpiKey?: string;
    vizType?: string;
    config?: Record<string, unknown>;
    exposure?: string;
    position: WidgetPosition;
  }) => api.post<Widget>(`/dashboards/${dashboardId}/widgets`, data),

  updateWidget: (dashboardId: string, widgetId: string, data: Partial<{
    name: string;
    config: Record<string, unknown>;
    vizType: string;
    position: WidgetPosition;
    isActive: boolean;
  }>) => api.patch<Widget>(`/dashboards/${dashboardId}/widgets/${widgetId}`, data),

  removeWidget: (dashboardId: string, widgetId: string) =>
    api.delete(`/dashboards/${dashboardId}/widgets/${widgetId}`),
};

// NLQ & Real-time Data
export const nlqApi = {
  query: (query: string) =>
    api.post<{
      sessionId: string;
      intent: string;
      vizType: string;
      jobId: string;
      status: string;
      message?: string;
    }>('/nlq/query', { query }),

  addToDashboard: (data: {
    sessionId: string;
    dashboardId: string;
    name?: string;
    position?: WidgetPosition;
  }) => api.post('/nlq/add-to-dashboard', data),
};

// Agents Jobs
export const jobsApi = {
  getById: (jobId: string) =>
    api.get<{
      id: string;
      status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
      result: any;
      errorMessage: string | null;
    }>(`/agents/jobs/${jobId}`),
};

// Targets (Objectifs)
export const targetsApi = {
  getAll: (params?: { kpiKey?: string; year?: number; scenario?: string }) =>
    api.get<Target[]>('/targets', { params }),

  getById: (id: string) =>
    api.get<Target>(`/targets/${id}`),

  create: (data: Omit<Target, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) =>
    api.post<Target>('/targets', data),

  update: (id: string, data: Partial<Omit<Target, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>>) =>
    api.patch<Target>(`/targets/${id}`, data),

  delete: (id: string) =>
    api.delete(`/targets/${id}`),
};

// Subscriptions (public — plans catalogue)
export const subscriptionsApi = {
  getPlans: () =>
    api.get<SubscriptionPlan[]>('/subscriptions/plans'),
};

// Onboarding Wizard
export const onboardingApi = {
  getStatus: () =>
    api.get<{ status: OnboardingStatus; organization: Organization | null }>('/onboarding/status'),

  step1: (data: { plan: string }) =>
    api.post('/onboarding/step1', data),

  step2: (data: { name?: string; sector?: string; size?: string; country?: string }) =>
    api.post('/onboarding/step2', data),

  step3: () =>
    api.post('/onboarding/step3'),

  getAgentReleases: () =>
    api.get<{ platform: string; arch: string; version: string; fileName: string; fileUrl: string; checksum: string | null }[]>('/onboarding/agent-releases'),

  linkAgent: (agentToken: string) =>
    api.post('/onboarding/agent-link', { agentToken }),

  skipAgentConfig: () =>
    api.post('/onboarding/agent-link', { skipLater: true }),

  getProfiles: () =>
    api.get<{ name: string; label: string; description: string }[]>('/onboarding/profiles'),

  step4: (data: { profiles: string[] }) =>
    api.post('/onboarding/step4', data),

  step5: (data: { invitations?: { email: string; role: string }[]; inviteLater?: boolean }) =>
    api.post('/onboarding/step5', data),

  testConnection: (agentToken?: string) =>
    api.post('/datasource/test-connection', agentToken ? { agentToken } : {}),
};

// Billing (Flutterwave)
export const billingApi = {
  getSubscription: () =>
    api.get<{ hasSubscription: boolean; subscription: BillingSubscription | null }>('/billing/subscription'),

  getInvoices: () =>
    api.get('/billing/invoices'),

  createCheckout: (data: { planId: string; successUrl?: string; cancelUrl?: string }) =>
    api.post<{ url: string }>('/billing/checkout', data),

  cancelSubscription: (data: { immediately?: boolean }) =>
    api.post('/billing/cancel', data),
};
