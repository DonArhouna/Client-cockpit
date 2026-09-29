import type { MetricQueryResult } from '@/types/data-engine';

export interface PresentedMetric {
  current: number;
  previous: number;
  target: null;
  trend: number | null;
  period: string;
  unit: string;
  details?: { items: Record<string, unknown>[] };
}

export function presentMetric(result: MetricQueryResult, period: string, unit: string,
  shape: 'scalar' | 'time_series' = 'scalar'): PresentedMetric | null {
  if (result.status === 'empty' || result.rows.length === 0) return null;
  const valueKey = result.schema.find(field => field.role === 'metric')?.key ?? 'value';
  const previousKey = result.schema.find(field => field.role === 'comparison')?.key ?? 'previous_value';
  const dimension = result.schema.find(field => field.role === 'dimension')?.key;
  const readNumber = (value: unknown): number => {
    if (typeof value !== 'string' && typeof value !== 'number' || value === '')
      throw new Error('Valeur metrique invalide');
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) throw new Error('Valeur metrique invalide');
    return parsed;
  };
  const row = result.rows[0];
  const current = shape === 'time_series'
    ? result.rows.reduce((total, item) => total + readNumber(item[valueKey]), 0)
    : readNumber(row[valueKey]);
  const hasPrevious = result.rows.some(item => item[previousKey] != null);
  const previous = shape === 'time_series'
    ? result.rows.reduce((total, item) => total + (item[previousKey] == null ? 0 : readNumber(item[previousKey])), 0)
    : row[previousKey] == null ? 0 : readNumber(row[previousKey]);
  if (!Number.isFinite(previous)) throw new Error('Comparaison metrique invalide');
  // A percentage change from a zero or absent base is undefined, never 0% or infinity.
  const trend = !hasPrevious || previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100;
  if (shape === 'time_series' && (!dimension || result.rows.some(item => typeof item[dimension] !== 'string')))
    throw new Error('Dimension temporelle invalide');
  const details = shape === 'time_series' ? { items: result.rows.map(item => ({
    [dimension!]: item[dimension!], value: readNumber(item[valueKey]),
    ...(item[previousKey] == null ? {} : { previous_value: readNumber(item[previousKey]) }),
  })) } : undefined;
  const resolvedUnit = result.schema.find(field => field.role === 'metric')?.unit ?? unit;
  return { current, previous, target: null, trend, period,
    unit: resolvedUnit === 'XOF' ? 'FCFA' : resolvedUnit,
    ...(details ? { details } : {}) };
}
