import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useKpiData } from '../use-kpi-data';
import { nlqApi } from '@/api';
import { useKpiDefinitions } from '../use-api';
import { useMetricData } from '../use-metric-data';
import { getCache } from '@/lib/cache';

vi.mock('@/api', () => ({ nlqApi: { query: vi.fn() }, jobsApi: { getById: vi.fn() } }));
vi.mock('../use-api', () => ({ useKpiDefinitions: vi.fn() }));
vi.mock('../use-metric-data', () => ({ useMetricData: vi.fn() }));
vi.mock('@/lib/cache', () => ({ getCache: vi.fn().mockReturnValue(null), setCache: vi.fn() }));
vi.mock('@/context/FilterContext', () => ({ useFilters: () => ({ period: 'current_month', currency: 'XOF' }) }));
vi.mock('@/features/auth/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1', organizationId: 'o1' } }) }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useMetricData).mockReturnValue({ data: undefined, isError: false, isPending: true,
    error: null, refetch: vi.fn() } as any);
});

describe('historical widget key resolution', () => {
  it('routes a catalog V2 binding through the semantic metric without V1', () => {
    vi.mocked(useKpiDefinitions).mockReturnValue({ data: [{ key: 'historical-key',
      dataBinding: { kind: 'data_engine_v2', metric: 'revenue_ht' } }], isLoading: false, error: null } as any);
    const { result } = renderHook(() => useKpiData('historical-key'));
    expect(result.current.state).toBe('loading');
    expect(useMetricData).toHaveBeenCalledWith('revenue_ht', 'current_month', 'XOF', undefined);
    expect(nlqApi.query).not.toHaveBeenCalled();
    expect(getCache).not.toHaveBeenCalled();
  });
  it('preserves the V1 path for an unbound definition', async () => {
    vi.mocked(useKpiDefinitions).mockReturnValue({ data: [{ key: 'legacy-key', dataBinding: null }],
      isLoading: false, error: null } as any);
    vi.mocked(nlqApi.query).mockResolvedValue({ data: { status: 'no_intent' } } as any);
    renderHook(() => useKpiData('legacy-key'));
    await waitFor(() => expect(nlqApi.query).toHaveBeenCalledTimes(1));
  });
  it('never falls back to V1 for a stored invalid binding or V2 execution error', () => {
    vi.mocked(useKpiDefinitions).mockReturnValue({ data: [{ key: 'invalid',
      dataBinding: { kind: 'unavailable' } }], isLoading: false, error: null } as any);
    const invalid = renderHook(() => useKpiData('invalid'));
    expect(invalid.result.current.state).toBe('unavailable');
    invalid.unmount();
    vi.mocked(useKpiDefinitions).mockReturnValue({ data: [{ key: 'v2',
      dataBinding: { kind: 'data_engine_v2', metric: 'revenue_ht' } }], isLoading: false, error: null } as any);
    vi.mocked(useMetricData).mockReturnValue({ data: undefined, isError: true, isPending: false,
      error: new Error('AGENT_OFFLINE'), refetch: vi.fn() } as any);
    const failed = renderHook(() => useKpiData('v2'));
    expect(failed.result.current.state).toBe('error');
    expect(nlqApi.query).not.toHaveBeenCalled();
  });
  it('keeps a disabled saved definition disabled without querying either engine', () => {
    vi.mocked(useKpiDefinitions).mockReturnValue({ data: [{ key: 'old-widget', isActive: false,
      dataBinding: { kind: 'data_engine_v2', metric: 'revenue_ht' } }],
      isLoading: false, error: null } as any);
    const { result } = renderHook(() => useKpiData('old-widget'));
    expect(result.current.state).toBe('disabled');
    expect(useMetricData).toHaveBeenCalledWith(null, 'current_month', 'XOF', undefined);
    expect(nlqApi.query).not.toHaveBeenCalled();
  });
});
