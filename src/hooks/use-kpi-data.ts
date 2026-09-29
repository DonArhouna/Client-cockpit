import { useState, useEffect, useCallback, useRef } from 'react';
import { nlqApi, jobsApi } from '@/api';
import { getCache, setCache } from '@/lib/cache';
import { useFilters } from '@/context/FilterContext';
import { useAuth } from '@/features/auth/AuthContext';
import { useKpiDefinitions } from './use-api';
import { useMetricData } from './use-metric-data';
import { presentMetric } from './metric-result-adapter';

export interface KpiDataOptions {
    refreshInterval?: number;
    enabled?: boolean;
}

export interface KpiDataResult {
    current: number;
    previous: number;
    target: number | null;
    trend: number | null;
    period: string;
    details?: Record<string, any>;
}

export type KpiState = 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'unavailable' | 'disabled';

export function normalizeResult(result: any, period: string): KpiDataResult | null {
    const rows = result?.data ?? result?.result ?? result?.raw;
    if (Array.isArray(rows) && rows.length === 0) return null;
    const row = Array.isArray(rows) ? rows[0] : null;
    const numeric = row && Object.values(row).find(v => v !== null && v !== '' && Number.isFinite(Number(v)));
    const current = result?.current ?? row?.current ?? result?.value ?? numeric;
    if (current === undefined || current === null || current === '' || !Number.isFinite(Number(current))) return null;
    const previous = Number(result?.previous ?? row?.previous ?? 0);
    const trend = Number(result?.trend ?? row?.trend ?? 0);
    const data: KpiDataResult = {
        current: Number(current),
        previous,
        target: result?.target ?? row?.target ?? null,
        trend,
        period,
        details: result?.details ?? rows ?? row ?? undefined,
    };
    if (data.trend === 0 && previous > 0) data.trend = ((data.current - previous) / previous) * 100;
    return data;
}

export function useKpiData(kpiKey: string | null, options: KpiDataOptions = {}) {
    const { refreshInterval = 0, enabled = true } = options;
    const { user } = useAuth();
    const { period, customFrom, customTo, currency } = useFilters();
    const { data: definitions, isLoading: catalogLoading, error: catalogError } = useKpiDefinitions();
    const definition = definitions?.find(item => item.key === kpiKey);
    const binding = definition?.dataBinding;
    const isV2 = binding?.kind === 'data_engine_v2';
    const invalidBinding = binding?.kind === 'unavailable';
    const inactiveDefinition = definition?.isActive === false;
    const metric = useMetricData(isV2 && enabled && !inactiveDefinition ? binding.metric : null, period, currency,
        isV2 ? binding.defaults?.comparison : undefined,
        period === 'custom' ? { from: customFrom, to: customTo } : undefined);
    const identity = user?.organizationId && user?.id ? `${user.organizationId}:${user.id}` : null;
    const generation = useRef(0);
    const [data, setData] = useState<KpiDataResult | null>(null);
    const [state, setState] = useState<KpiState>('idle');
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (force = false) => {
        const request = ++generation.current;
        const active = () => request === generation.current;
        if (!enabled || !kpiKey || isV2 || invalidBinding || inactiveDefinition || catalogLoading || catalogError) {
            setData(null); setState('idle'); setError(null);
            return;
        }
        if (!identity) {
            setData(null); setState('unavailable'); setError('Organisation ou utilisateur indisponible');
            return;
        }
        const cacheKey = `${identity}:kpi_${kpiKey}_${period}_${currency}`;
        if (!force) {
            const cached = getCache<KpiDataResult>(cacheKey);
            if (cached) {
                setData(cached); setState('success'); setError(null);
                return;
            }
        }
        setData(null); setState('loading'); setError(null);
        try {
            const response = await nlqApi.query(`${kpiKey} pour ${period} en ${currency}`);
            if (!active()) return;
            const { jobId, status } = response.data;
            if (status === 'TEMPLATE_DISABLED') {
                setState('disabled'); return;
            }
            if (!jobId || status === 'no_intent') {
                setState('unavailable'); setError('Indicateur indisponible');
                return;
            }
            for (let attempt = 0; attempt < 15; attempt++) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                if (!active()) return;
                const job = (await jobsApi.getById(jobId)).data;
                if (!active()) return;
                if (job.status === 'COMPLETED') {
                    const normalized = normalizeResult(job.result, period);
                    if (!normalized) { setState('empty'); return; }
                    setData(normalized);
                    setCache(cacheKey, normalized);
                    setState('success');
                    return;
                }
                if (job.status === 'FAILED') {
                    setState('error'); setError(job.errorMessage || 'Exécution de l’indicateur échouée');
                    return;
                }
            }
            if (active()) { setState('unavailable'); setError('Délai d’attente dépassé'); }
        } catch (err: any) {
            if (active()) { setState('error'); setError(err?.message || 'Erreur de chargement'); }
        }
    }, [kpiKey, enabled, identity, period, currency, isV2, invalidBinding, inactiveDefinition, catalogLoading, catalogError]);

    useEffect(() => {
        fetchData();
        const interval = refreshInterval > 0 && enabled && !isV2 ? setInterval(() => fetchData(), refreshInterval) : null;
        return () => {
            generation.current++;
            if (interval) clearInterval(interval);
        };
    }, [fetchData, refreshInterval, enabled, isV2]);

    if (invalidBinding) return { data: null, state: 'unavailable' as KpiState,
        isLoading: false, isDisabled: false, error: 'Binding V2 invalide', refetch: fetchData };
    if (inactiveDefinition) return { data: null, state: 'disabled' as KpiState,
        isLoading: false, isDisabled: true, error: null, refetch: fetchData };
    if (catalogLoading) return { data: null, state: 'loading' as KpiState,
        isLoading: true, isDisabled: false, error: null, refetch: fetchData };
    if (catalogError) return { data: null, state: 'error' as KpiState,
        isLoading: false, isDisabled: false, error: 'Catalogue indisponible', refetch: fetchData };
    if (isV2) {
        if (period === 'custom' && (!customFrom || !customTo))
            return { data: null, state: 'unavailable' as KpiState, isLoading: false,
                isDisabled: false, error: 'Selectionnez les deux dates', refetch: metric.refetch };
        let presented = null;
        try { if (metric.data) presented = presentMetric(metric.data, period, currency); }
        catch { return { data: null, state: 'error' as KpiState, isLoading: false,
            isDisabled: false, error: 'Resultat V2 invalide', refetch: metric.refetch }; }
        const metricState: KpiState = metric.isError ? 'error' : metric.isPending ? 'loading' :
            presented ? 'success' : 'empty';
        return { data: presented, state: metricState, isLoading: metricState === 'loading',
            isDisabled: false, error: metric.error instanceof Error ? metric.error.message : null,
            refetch: metric.refetch };
    }

    return {
        data,
        state,
        isLoading: state === 'loading',
        isDisabled: state === 'disabled',
        error,
        refetch: fetchData,
    };
}
