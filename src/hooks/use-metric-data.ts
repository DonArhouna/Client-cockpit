import { useQuery } from '@tanstack/react-query';
import { dataEngineApi } from '@/api';
import { useAuth } from '@/features/auth/AuthContext';
import type { MetricQueryRequest, MetricQueryResult } from '@/types/data-engine';

const PERIODS = new Set([
  'today', 'current_week', 'current_month', 'current_quarter', 'current_year',
  'previous_month', 'previous_quarter', 'previous_year',
]);
const TERMINAL = new Set(['COMPLETED', 'FAILED', 'TIMED_OUT', 'CANCELLED']);

export function assertMetricPeriod(period: string): string {
  if (!PERIODS.has(period)) throw new Error('Periode non prise en charge par Data Engine V2');
  return period;
}

export interface CustomDateRange { from: string; to: string }

export function resolveMetricPeriod(period: string, range?: CustomDateRange): MetricQueryRequest['period'] {
  if (period !== 'custom') return { type: 'relative', value: assertMetricPeriod(period) };
  const parseDay = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Plage personnalisee invalide');
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
      throw new Error('Plage personnalisee invalide');
    return date;
  };
  const from = parseDay(range?.from ?? '');
  const lastDay = parseDay(range?.to ?? '');
  if (from > lastDay) throw new Error('La date de fin precede la date de debut');
  // The date input's end day is inclusive; the API's upper bound is exclusive.
  const to = new Date(lastDay.getTime() + 86_400_000);
  return { type: 'absolute', from: from.toISOString(), to: to.toISOString() };
}

export async function runMetricQuery(metric: string, period: string, currency: string,
  comparison: 'previous_period' | 'previous_year' | undefined, signal?: AbortSignal,
  range?: CustomDateRange, dimensions?: string[]): Promise<MetricQueryResult> {
  const response = await dataEngineApi.query({ version: '2', metric,
    period: resolveMetricPeriod(period, range), currency,
    ...(dimensions?.length ? { dimensions } : {}),
    ...(comparison ? { comparison: { type: comparison } } : {}),
    context: { source: 'dashboard' },
  }, signal);
  if (response.data.status === 'completed') return response.data.result;
  const jobId = response.data.jobId;
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, 1000);
      const abort = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); };
      if (signal?.aborted) abort(); else signal?.addEventListener('abort', abort, { once: true });
    });
    const job = (await dataEngineApi.getJob(jobId, signal)).data;
    if (job.state === 'COMPLETED') {
      if (!job.result) throw new Error('Resultat V2 indisponible');
      return job.result;
    }
    if (TERMINAL.has(job.state)) throw new Error(job.error?.code ?? job.state);
  }
  throw new Error('QUERY_TIMEOUT');
}

export function useMetricData(metric: string | null, period: string, currency: string,
  comparison?: 'previous_period' | 'previous_year', range?: CustomDateRange, dimensions?: string[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['data-engine-v2', user?.organizationId, user?.id, metric, period, range?.from, range?.to, currency, comparison, dimensions],
    queryFn: ({ signal }) => runMetricQuery(metric!, period, currency, comparison, signal, range, dimensions),
    enabled: !!metric && !!user?.organizationId && !!user?.id &&
      (period !== 'custom' || !!(range?.from && range?.to)),
    staleTime: 60_000,
    retry: false,
  });
}
