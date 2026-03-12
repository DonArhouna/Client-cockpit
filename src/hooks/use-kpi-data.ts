import { useState, useEffect, useCallback } from 'react';
import { nlqApi, jobsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { useFilters } from '@/context/FilterContext';

export interface KpiDataOptions {
    refreshInterval?: number;
    enabled?: boolean;
}

interface KpiDataResult {
    current: number;
    previous: number;
    target: number | null;
    trend: number;
    period: string;
    details?: Record<string, any>;
}

// Fallback data function - Modified to return empty/loading state instead of hardcoded values
const getFallbackData = (kpiKey: string | null, period: string): KpiDataResult => {
    return {
        current: 0,
        previous: 0,
        target: null,
        trend: 0,
        period,
        details: undefined
    };
};

export function useKpiData(kpiKey: string | null, options: KpiDataOptions = {}) {
    const { refreshInterval = 0, enabled = true } = options;
    const [data, setData] = useState<KpiDataResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { period, currency } = useFilters();

    const fetchData = useCallback(async () => {
        if (!kpiKey || !enabled) return;

        setIsLoading(true);
        setError(null);

        try {
            // Construire la requête avec le contexte de période et devise
            const query = `${kpiKey} pour ${period} en ${currency}`;

            // 1. Soumettre la requête NLQ
            const queryResp = await nlqApi.query(query);
            const { jobId, status } = queryResp.data;

            if (!jobId || status === 'no_intent') {
                // If NLQ isn't returning a job, provide rich fallback data
                setData(getFallbackData(kpiKey, period));
                setIsLoading(false);
                return;
            }

            // 2. Poller pour le résultat du job
            let jobCompleted = false;
            let attempts = 0;
            const maxAttempts = 15; // 15 * 2s = 30s timeout

            while (!jobCompleted && attempts < maxAttempts) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 2000));

                const jobResp = await jobsApi.getById(jobId);
                const job = jobResp.data;

                if (job.status === 'COMPLETED') {
                    // Normaliser les données reçues en préservant target et details
                    const result = job.result;

                    const normalized: KpiDataResult = {
                        current: result?.current || result?.value || 0,
                        previous: result?.previous || 0,
                        target: result?.target || null,
                        trend: result?.trend || 0,
                        period: period,
                        details: result?.details || undefined
                    };

                    // Calculer le trend si non fourni
                    if (normalized.trend === 0 && normalized.previous > 0) {
                        normalized.trend = ((normalized.current - normalized.previous) / normalized.previous) * 100;
                    }

                    setData(normalized);
                    jobCompleted = true;
                } else if (job.status === 'FAILED') {
                    console.warn("Job failed, using fallback data");
                    setData(getFallbackData(kpiKey, period));
                    jobCompleted = true; // Stop polling
                }
            }

            if (!jobCompleted) {
                console.warn("Job timeout, using fallback data");
                setData(getFallbackData(kpiKey, period));
            }
        } catch (err: any) {
            console.warn(`Error fetching KPI ${kpiKey}, using fallback data:`, err.message);
            setData(getFallbackData(kpiKey, period));
        } finally {
            setIsLoading(false);
        }
    }, [kpiKey, enabled, period, currency, toast]);

    useEffect(() => {
        fetchData();

        if (refreshInterval > 0 && enabled) {
            const interval = setInterval(fetchData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, refreshInterval, enabled]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchData
    };
}
