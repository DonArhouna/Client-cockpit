import { useState, useEffect, useCallback } from 'react';
import { nlqApi, jobsApi } from '@/api';
import { getCache, setCache } from '@/lib/cache';
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

// Fonction de données de secours - Modifiée pour retourner un état vide/chargement au lieu de valeurs hardcodées
const getFallbackData = (_kpiKey: string | null, period: string): KpiDataResult => {
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

    const fetchData = useCallback(async (force: boolean = false) => {
        if (!kpiKey || !enabled) return;

        // 0. Vérifier le cache
        const cacheKey = `kpi_${kpiKey}_${period}_${currency}`;
        if (!force) {
            const cached = getCache<KpiDataResult>(cacheKey);
            if (cached) {
                setData(cached);
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            // Construire la requête avec le contexte de période et devise
            const query = `${kpiKey} pour ${period} en ${currency}`;

            // 1. Soumettre la requête NLQ
            const queryResp = await nlqApi.query(query);
            const { jobId, status } = queryResp.data;

            if (!jobId || status === 'no_intent') {
                // Si le NLQ ne renvoie pas de job, fournir des données de secours riches
                const fallback = getFallbackData(kpiKey, period);
                setData(fallback);
                // Ne pas mettre en cache les secours vides s'il s'agit d'une erreur/absence d'intention
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
                    const result = job.result;

                    // Backend transformResult() stores multi-row as { data: [...], count: N }
                    // and scalar as { value: N, raw: [...] } — read 'data', not 'result'
                    const agentRows = result?.data || result?.result;
                    const agentRow = Array.isArray(agentRows)
                        ? agentRows[0]
                        : (result?.raw?.[0] ?? null);
                    const agentScalar = agentRow
                        ? parseFloat(Object.values(agentRow).find((v) => v !== null && !isNaN(parseFloat(v as string))) as string)
                        : NaN;

                    const normalized: KpiDataResult = {
                        current: result?.current || result?.value || (!isNaN(agentScalar) ? agentScalar : 0),
                        previous: result?.previous || 0,
                        target: result?.target || null,
                        trend: result?.trend || 0,
                        period: period,
                        details: result?.details || agentRows || agentRow || undefined
                    };

                    // Calculer le trend si non fourni
                    if (normalized.trend === 0 && normalized.previous > 0) {
                        normalized.trend = ((normalized.current - normalized.previous) / normalized.previous) * 100;
                    }

                    setData(normalized);
                    // 3. Stocker dans le cache
                    setCache(cacheKey, normalized);
                    jobCompleted = true;
                } else if (job.status === 'FAILED') {
                    console.warn("Le job a échoué, utilisation des données de secours");
                    setData(getFallbackData(kpiKey, period));
                    jobCompleted = true; // Arrêter le polling
                }
            }

            if (!jobCompleted) {
                console.warn("Délai d'attente du job dépassé, utilisation des données de secours");
                setData(getFallbackData(kpiKey, period));
            }
        } catch (err: any) {
            console.warn(`Erreur lors de la récupération du KPI ${kpiKey}, utilisation des données de secours :`, err.message);
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
