import { describe, expect, it } from 'vitest';
import { presentMetric } from '../metric-result-adapter';
import type { MetricQueryResult } from '@/types/data-engine';

const result = (status: 'success' | 'empty', value?: string, previous?: string): MetricQueryResult => ({
  queryId: 'q1', status, rows: status === 'empty' ? [] : [{ value, previous_value: previous }],
  schema: [], meta: { cache: 'backend', rowCount: status === 'empty' ? 0 : 1, generatedAt: '2026-09-29' },
});

describe('V2 presentation', () => {
  it('distinguishes empty from a real zero and displays XOF as FCFA', () => {
    expect(presentMetric(result('empty'), 'current_month', 'XOF')).toBeNull();
    expect(presentMetric(result('success', '0.00', '10.00'), 'current_month', 'XOF'))
      .toMatchObject({ current: 0, previous: 10, trend: -100, unit: 'FCFA', target: null });
  });
  it('does not invent a trend when the previous value is zero', () => {
    expect(presentMetric(result('success', '15.00', '0.00'), 'current_month', 'XOF')?.trend).toBeNull();
  });
  it('interprets a time series from schema roles and declared shape', () => {
    const series: MetricQueryResult = { queryId: 'q2', status: 'success',
      rows: [{ period_key: '2022-01', amount: '4.00', prior: '2.00' },
        { period_key: '2022-02', amount: '0.00', prior: '1.00' }],
      schema: [{ key: 'period_key', type: 'string', role: 'dimension', nullable: false },
        { key: 'amount', type: 'currency', role: 'metric', nullable: false, unit: 'XOF' },
        { key: 'prior', type: 'currency', role: 'comparison', nullable: true }],
      meta: { cache: 'none', rowCount: 2, generatedAt: '2026-09-29' } };
    expect(presentMetric(series, 'custom', 'XOF', 'time_series')).toMatchObject({
      current: 4, previous: 3, unit: 'FCFA',
      details: { items: [{ period_key: '2022-01', value: 4, previous_value: 2 },
        { period_key: '2022-02', value: 0, previous_value: 1 }] },
    });
  });
});
