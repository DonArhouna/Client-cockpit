import { useQuery } from '@tanstack/react-query';
import { dataEngineApi } from '@/api';
import { useAuth } from '@/features/auth/AuthContext';
import type { MetricQueryResult } from '@/types/data-engine';

const PERIODS = new Set([
  'today', 'current_week', 'current_month', 'current_quarter', 'current_year',
  'previous_month', 'previous_quarter', 'previous_year',
]);
const TERMINAL = new Set(['COMPLETED', 'FAILED', 'TIMED_OUT', 'CANCELLED']);

export function assertMetricPeriod(period: string): string {
  if (!PERIODS.has(period)) throw new Error('Periode non prise en charge par Data Engine V2');
  return period;
}

export async function runMetricQuery(metric: string, period: string, currency: string,
  comparison: 'previous_period' | 'previous_year' | undefined, signal?: AbortSignal): Promise<MetricQueryResult> {
  const response = await dataEngineApi.query({ version: '2', metric,
    period: { type: 'relative', value: assertMetricPeriod(period) }, currency,
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
  comparison?: 'previous_period' | 'previous_year') {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['data-engine-v2', user?.organizationId, user?.id, metric, period, currency, comparison],
    queryFn: ({ signal }) => runMetricQuery(metric!, period, currency, comparison, signal),
    enabled: !!metric && !!user?.organizationId && !!user?.id,
    staleTime: 60_000,
    retry: false,
  });
}
