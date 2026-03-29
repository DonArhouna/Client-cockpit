import { useKpiData } from '@/hooks/use-kpi-data';
import { useKpiDefinitions } from '@/hooks/use-api';
import { TrendingDown, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Insight {
    id: string;
    type: 'success' | 'warning' | 'info' | 'danger';
    title: string;
    message: string;
    kpiName?: string;
}

// ── Hook pour générer des insights depuis les KPIs backend ────────
function useInsights(): Insight[] {
    const { data: kpiDefinitions } = useKpiDefinitions();

    // Prendre les 4 KPIs les plus importants disponibles
    const keyKpis = (kpiDefinitions ?? [])
        .filter((kpi: any) => kpi.isActive)
        .slice(0, 4)
        .map((kpi: any) => kpi.key);

    const kpi0 = useKpiData(keyKpis[0] ?? null);
    const kpi1 = useKpiData(keyKpis[1] ?? null);
    const kpi2 = useKpiData(keyKpis[2] ?? null);
    const kpi3 = useKpiData(keyKpis[3] ?? null);

    const kpiResults = [kpi0, kpi1, kpi2, kpi3];
    const kpiDefs = keyKpis.map((key: string) =>
        kpiDefinitions?.find((k: any) => k.key === key)
    );

    const insights: Insight[] = [];

    kpiResults.forEach((result, idx) => {
        const def = kpiDefs[idx];
        if (!def || !result.data || result.isLoading) return;

        const { current, trend, target } = result.data;
        const name = def.name as string;
        const key = (def.key as string).toLowerCase();

        // Objectif atteint
        if (target && current >= target) {
            insights.push({
                id: `target-${key}`,
                type: 'success',
                title: 'Objectif atteint !',
                message: `${name} dépasse l'objectif fixé. Excellent résultat.`,
                kpiName: name,
            });
            return;
        }

        // Forte hausse
        if (trend > 20 && !key.includes('dso') && !key.includes('dmp')) {
            insights.push({
                id: `up-${key}`,
                type: 'success',
                title: `${name} +${trend.toFixed(0)}%`,
                message: `Progression remarquable par rapport à la période précédente.`,
                kpiName: name,
            });
            return;
        }

        // Alerte : forte baisse (hors métriques de délai)
        if (trend < -15 && !key.includes('dso') && !key.includes('dmp') && !key.includes('dpo')) {
            insights.push({
                id: `down-${key}`,
                type: 'danger',
                title: `Baisse de ${name}`,
                message: `Recul de ${Math.abs(trend).toFixed(0)}% vs période précédente — une vérification s'impose.`,
                kpiName: name,
            });
            return;
        }

        // Délai de paiement qui s'allonge (mauvais)
        if ((key.includes('dso') || key.includes('dmp')) && trend > 10) {
            insights.push({
                id: `delay-${key}`,
                type: 'warning',
                title: `${name} en hausse`,
                message: `Le délai a augmenté de ${trend.toFixed(0)} jours vs mois précédent. Surveiller les encaissements.`,
                kpiName: name,
            });
            return;
        }

        // Légère tendance positive
        if (trend > 5 && insights.length < 2) {
            insights.push({
                id: `info-${key}`,
                type: 'info',
                title: name,
                message: `En légère hausse (+${trend.toFixed(0)}%) par rapport à la période précédente.`,
                kpiName: name,
            });
        }
    });

    return insights.slice(0, 3);
}

const iconMap = {
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: TrendingDown,
    info: Info,
};

const styleMap = {
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
    danger:  'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300',
    info:    'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
};

const iconStyleMap = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger:  'text-rose-500',
    info:    'text-blue-500',
};

export function InsightBanner() {
    const insights = useInsights();
    const [dismissed, setDismissed] = useState<string[]>([]);

    const visible = insights.filter(i => !dismissed.includes(i.id));
    if (visible.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 animate-fade-up">
            {visible.map((insight) => {
                const Icon = iconMap[insight.type];
                return (
                    <div
                        key={insight.id}
                        className={cn(
                            'flex items-start gap-3 px-4 py-2.5 rounded-xl border text-[13px] font-medium',
                            styleMap[insight.type]
                        )}
                    >
                        <Icon className={cn('h-4 w-4 shrink-0 mt-px', iconStyleMap[insight.type])} />
                        <div className="flex-1 min-w-0">
                            <span className="font-bold">{insight.title}</span>
                            <span className="opacity-80"> — {insight.message}</span>
                        </div>
                        <button
                            onClick={() => setDismissed(prev => [...prev, insight.id])}
                            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X style={{ width: 14, height: 14 }} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
