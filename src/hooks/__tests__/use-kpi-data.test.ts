import { describe, it, expect, vi } from 'vitest';
vi.mock('@/api', () => ({ nlqApi: {}, jobsApi: {} }));
vi.mock('@/context/FilterContext', () => ({ useFilters: () => ({ period: 'current_month', currency: 'XOF' }) }));
vi.mock('@/features/auth/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
import { normalizeResult } from '../use-kpi-data';

describe('normalisation KPI V1', () => {
  it('préserve zéro sans le confondre avec vide', () => {
    expect(normalizeResult({ value: 0, raw: [{ value: 0 }] }, 'month')?.current).toBe(0);
    expect(normalizeResult({ data: [], count: 0 }, 'month')).toBeNull();
    expect(normalizeResult(null, 'month')).toBeNull();
  });
});
