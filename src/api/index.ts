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
  }) => api.post('/admin/clients', data),
};

// Admin - General
export const adminApi = {
  getStats: () =>
    api.get('/admin/dashboard-stats'),
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
};

// Subscription Plans
export const subscriptionPlansApi = {
  // Admin endpoint (requires auth + superadmin permissions)
  getAll: () =>
    api.get<SubscriptionPlan[]>('/admin/subscription-plans'),

  // Public endpoint (no auth required)
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
