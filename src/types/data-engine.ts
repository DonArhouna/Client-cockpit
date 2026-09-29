export interface MetricQueryRequest {
  version: '2';
  metric: string;
  period: { type: 'relative'; value: string };
  comparison?: { type: 'previous_period' | 'previous_year' };
  currency: string;
  context?: { source: 'dashboard'; widgetId?: string; dashboardId?: string };
}

export interface MetricQueryResult {
  queryId: string;
  status: 'success' | 'empty';
  rows: Record<string, unknown>[];
  schema: { key: string; type: string; role: string; nullable: boolean }[];
  meta: { cache: 'none' | 'backend' | 'browser'; rowCount: number; generatedAt: string };
}

export type MetricQueryResponse =
  | { status: 'completed'; result: MetricQueryResult }
  | { status: 'pending'; jobId: string; queryId: string };

export interface MetricJobResponse {
  jobId: string;
  queryId: string;
  state: 'PENDING' | 'DISPATCHED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'TIMED_OUT' | 'CANCELLED';
  result?: MetricQueryResult;
  error?: { code: string };
}
