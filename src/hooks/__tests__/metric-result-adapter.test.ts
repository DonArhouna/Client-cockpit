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
});
