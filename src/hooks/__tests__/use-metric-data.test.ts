import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dataEngineApi } from '@/api';
import { assertMetricPeriod, runMetricQuery } from '../use-metric-data';

vi.mock('@/api', () => ({ dataEngineApi: { query: vi.fn(), getJob: vi.fn() } }));
vi.mock('@/features/auth/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

const completed = { queryId: 'q1', status: 'success', rows: [{ value: '0.00' }], schema: [],
  meta: { cache: 'backend', rowCount: 1, generatedAt: '2026-09-29' } };

beforeEach(() => vi.clearAllMocks());

describe('Data Engine V2 client', () => {
  it('maps supported UI periods and rejects custom without a silent conversion', () => {
    for (const period of ['today', 'current_week', 'current_month', 'current_quarter',
      'current_year', 'previous_month', 'previous_quarter', 'previous_year'])
      expect(assertMetricPeriod(period)).toBe(period);
    expect(() => assertMetricPeriod('custom')).toThrow();
  });
  it('uses an immediate completed result without polling', async () => {
    vi.mocked(dataEngineApi.query).mockResolvedValueOnce({ data: { status: 'completed', result: completed } } as any);
    expect(await runMetricQuery('revenue_ht', 'current_month', 'XOF', 'previous_period')).toEqual(completed);
    expect(dataEngineApi.getJob).not.toHaveBeenCalled();
    expect(dataEngineApi.query).toHaveBeenCalledWith(expect.objectContaining({
      period: { type: 'relative', value: 'current_month' }, comparison: { type: 'previous_period' },
    }), undefined);
  });
  it('stops on Agent offline without invoking a V1 client', async () => {
    vi.mocked(dataEngineApi.query).mockRejectedValueOnce(new Error('AGENT_OFFLINE'));
    await expect(runMetricQuery('revenue_ht', 'current_month', 'XOF', undefined)).rejects.toThrow('AGENT_OFFLINE');
  });
  it('polls a pending job until completion', async () => {
    vi.mocked(dataEngineApi.query).mockResolvedValueOnce({ data: { status: 'pending', jobId: 'j1', queryId: 'q1' } } as any);
    vi.mocked(dataEngineApi.getJob).mockResolvedValueOnce({ data: {
      jobId: 'j1', queryId: 'q1', state: 'COMPLETED', result: completed,
    } } as any);
    expect(await runMetricQuery('revenue_ht', 'current_month', 'XOF', undefined)).toEqual(completed);
    expect(dataEngineApi.getJob).toHaveBeenCalledTimes(1);
  });
  it('stops polling after a terminal timeout', async () => {
    vi.mocked(dataEngineApi.query).mockResolvedValueOnce({ data: { status: 'pending', jobId: 'j1', queryId: 'q1' } } as any);
    vi.mocked(dataEngineApi.getJob).mockResolvedValueOnce({ data: {
      jobId: 'j1', queryId: 'q1', state: 'TIMED_OUT', error: { code: 'QUERY_TIMEOUT' },
    } } as any);
    await expect(runMetricQuery('revenue_ht', 'current_month', 'XOF', undefined)).rejects.toThrow('QUERY_TIMEOUT');
    expect(dataEngineApi.getJob).toHaveBeenCalledTimes(1);
  });
  it('aborts pending polling on unmount/cancellation', async () => {
    const controller = new AbortController();
    vi.mocked(dataEngineApi.query).mockResolvedValueOnce({ data: { status: 'pending', jobId: 'j1', queryId: 'q1' } } as any);
    const pending = runMetricQuery('revenue_ht', 'current_month', 'XOF', undefined, controller.signal);
    await Promise.resolve();
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(dataEngineApi.getJob).not.toHaveBeenCalled();
  });
  it('rejects an unsupported period before any request', async () => {
    await expect(runMetricQuery('revenue_ht', 'custom', 'XOF', undefined)).rejects.toThrow();
    expect(dataEngineApi.query).not.toHaveBeenCalled();
  });
});
