// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  emailVerified: boolean;
  organizationId: string | null;
  organization?: Organization;
  userRoles?: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
}

// Subscription Plan types
export interface SubscriptionPlan {
  id: string;
  name: string;                  // 'startup' | 'pme' | 'business' | 'enterprise'
  label: string;                 // 'Startup' | 'PME' | ...
  description?: string;
  priceMonthly?: number | null;  // null = sur devis
  maxUsers?: number | null;      // null = illimité
  maxKpis?: number | null;
  maxWidgets?: number | null;
  maxAgentSyncPerDay?: number | null;
  allowedKpiPacks?: string[];
  hasNlq?: boolean;
  hasAdvancedReports?: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  sortOrder?: number;
  isActive?: boolean;
  _count?: { organizations: number };
  createdAt?: string;
  updatedAt?: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  sector?: string;
  size: string;
  planId?: string;
  subscriptionPlan?: SubscriptionPlan;
  country?: string;
  sageMode?: string;
  sageType?: string;
  sageHost?: string;
  sagePort?: number;
  selectedProfiles?: string[];
  ownerId?: string;
  owner?: User;
  _count?: {
    users: number;
    dashboards: number;
    invitations: number;
  };
  invitations?: Invitation[];
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: string;
  role: { name: string };
  expiresAt: string;
  isAccepted: boolean;
  createdAt: string;
  organizationId: string;
  organization?: { id: string; name: string };
  invitedBy?: { id: string; email: string; firstName?: string; lastName?: string };
}

// Role & Permission types
export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  organizationId?: string;
  permissions?: RolePermission[];
  createdAt: string;
}

export interface Permission {
  id: string;
  action: string;
  resource: string;
  description?: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
}

// Agent types
export interface Agent {
  id: string;
  token: string;
  name: string;
  status: 'pending' | 'online' | 'offline' | 'error';
  version?: string;
  lastSeen?: string;
  lastSync?: string;
  rowsSynced: number;
  errorCount: number;
  lastError?: string;
  organizationId: string;
  organization?: Organization;
  tokenExpiresAt?: string | null;
  isRevoked?: boolean;
  daysUntilExpiry?: number | null;
  isExpiringSoon?: boolean;
  isSocketConnected?: boolean;
  createdAt: string;
}

export interface AgentLog {
  id: string;
  level: string; // 'info' | 'warning' | 'error' | 'debug'
  message: string;
  timestamp: string;
  organizationId: string;
  agentId: string;
}

export interface AgentLogsResponse {
  logs: AgentLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Audit Log types
export interface AuditLog {
  id: string;
  event: string;
  userId?: string;
  user?: User;
  organizationId: string;
  organization?: Organization;
  payload?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// KPI Store types
export interface KpiDefinition {
  id: string;
  key: string;
  code?: string;
  name: string;
  domain?: string;
  description?: string;
  category: string;
  subcategory?: string;
  usage?: string;
  unit?: string;
  frequency?: string;
  risk?: string;
  profiles?: string[];
  sectors?: string[];
  defaultVizType: string;
  direction?: string;
  sqlSage100View?: string;
  sqlSage100Tables?: string[];
  mlUsage?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  vizType: string;
  description?: string;
  defaultConfig: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

export interface KpiPack {
  id: string;
  name: string;
  label: string;
  profile: string;
  kpiKeys: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// Targets types
export interface Target {
  id: string;
  kpiKey: string;
  value: number;
  valueType: 'ABSOLUTE' | 'PERCENTAGE' | 'DELTA_PERCENT';
  deltaReference?: 'PREVIOUS_PERIOD' | 'SAME_PERIOD_LAST_YEAR';
  periodType: 'MENSUEL' | 'BIMESTRE' | 'TRIMESTRE' | 'SEMESTRE' | 'ANNEE';
  periodIndex: number;
  year: number;
  scenario: 'BUDGET' | 'REVISED' | 'FORECAST' | 'STRETCH';
  label?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Dashboards types
export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Widget {
  id: string;
  name: string;
  type: string;
  kpiKey?: string | null;
  vizType?: string | null;
  config: Record<string, unknown>;
  exposure?: string | null;
  position: WidgetPosition;
  isActive: boolean;
  dashboardId: string;
  userId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  isDefault: boolean;
  layout: unknown[];
  userId: string;
  organizationId: string;
  widgets?: Widget[];
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// Onboarding types
export interface OnboardingStatus {
  id: string;
  organizationId: string;
  currentStep: number;
  completedSteps: number[];
  isComplete: boolean;
  inviteLater: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingProfile {
  name: string;
  label: string;
  description: string;
}

// Billing types
export type BillingStatusType = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'UNPAID' | 'PAUSED';

export interface BillingSubscription {
  id: string;
  organizationId: string;
  fwSubscriptionId: string | null;
  planId: string;
  plan: Pick<SubscriptionPlan, 'id' | 'name' | 'label' | 'priceMonthly' | 'maxUsers' | 'maxKpis' | 'maxWidgets' | 'hasNlq' | 'hasAdvancedReports'>;
  status: BillingStatusType;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}
