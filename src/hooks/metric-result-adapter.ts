import type { MetricQueryResult } from '@/types/data-engine';

export interface PresentedMetric {
  current: number;
  previous: number;
  target: null;
  trend: number | null;
  period: string;
  unit: string;
  details?: undefined;
}

export function presentMetric(result: MetricQueryResult, period: string, unit: string): PresentedMetric | null {
  if (result.status === 'empty' || result.rows.length === 0) return null;
  const row = result.rows[0];
  const value = row.value;
  if (typeof value !== 'string' && typeof value !== 'number') throw new Error('Valeur metrique invalide');
  const current = Number(value);
  if (!Number.isFinite(current)) throw new Error('Valeur metrique invalide');
  const rawPrevious = row.previous_value;
  const previous = rawPrevious == null ? 0 : Number(rawPrevious);
  if (!Number.isFinite(previous)) throw new Error('Comparaison metrique invalide');
  // A percentage change from a zero or absent base is undefined, never 0% or infinity.
  const trend = rawPrevious == null || previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100;
  return { current, previous, target: null, trend, period, unit: unit === 'XOF' ? 'FCFA' : unit };
}
