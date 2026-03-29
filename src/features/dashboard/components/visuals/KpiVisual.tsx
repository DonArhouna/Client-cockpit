import {
    TrendingUp, TrendingDown, DollarSign, Clock, PieChart,
    Activity, Loader2, Target
} from 'lucide-react';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useTargets } from '@/hooks/use-api';
import { useFilters } from '@/context/FilterContext';
import { cn } from '@/lib/utils';
import {
    ResponsiveContainer, AreaChart, Area,
} from 'recharts';

interface KpiVisualProps {
    widget: {
        id?: string;
        name: string;
        config?: Record<string, any>;
        kpiKey?: string | null;
    };
    isCompact?: boolean;
}

// ── Domain color mapping ─────────────────────────────────────────
function getDomainStyle(kpiKey?: string | null): {
    iconBg: string; iconColor: string; ringColor: string; badgeBg: string;
} {
    const k = kpiKey?.toLowerCase() ?? '';
    if (k.includes('ca') || k.includes('revenue') || k.includes('chiffre'))
        return { iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400', ringColor: 'ring-emerald-200 dark:ring-emerald-800', badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40' };
    if (k.includes('tresorerie') || k.includes('solde') || k.includes('cashflow'))
        return { iconBg: 'bg-blue-50 dark:bg-blue-950/40', iconColor: 'text-blue-600 dark:text-blue-400', ringColor: 'ring-blue-200 dark:ring-blue-800', badgeBg: 'bg-blue-50 dark:bg-blue-950/40' };
    if (k.includes('marge') || k.includes('margin'))
        return { iconBg: 'bg-violet-50 dark:bg-violet-950/40', iconColor: 'text-violet-600 dark:text-violet-400', ringColor: 'ring-violet-200 dark:ring-violet-800', badgeBg: 'bg-violet-50 dark:bg-violet-950/40' };
    if (k.includes('dso') || k.includes('dmp') || k.includes('dpo') || k.includes('delai'))
        return { iconBg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400', ringColor: 'ring-amber-200 dark:ring-amber-800', badgeBg: 'bg-amber-50 dark:bg-amber-950/40' };
    if (k.includes('stock') || k.includes('inventaire'))
        return { iconBg: 'bg-orange-50 dark:bg-orange-950/40', iconColor: 'text-orange-600 dark:text-orange-400', ringColor: 'ring-orange-200 dark:ring-orange-800', badgeBg: 'bg-orange-50 dark:bg-orange-950/40' };
    if (k.includes('bfr') || k.includes('fonds'))
        return { iconBg: 'bg-rose-50 dark:bg-rose-950/40', iconColor: 'text-rose-600 dark:text-rose-400', ringColor: 'ring-rose-200 dark:ring-rose-800', badgeBg: 'bg-rose-50 dark:bg-rose-950/40' };
    return { iconBg: 'bg-slate-50 dark:bg-slate-800/40', iconColor: 'text-slate-600 dark:text-slate-400', ringColor: 'ring-slate-200 dark:ring-slate-700', badgeBg: 'bg-slate-50 dark:bg-slate-800/40' };
}

// ── Contextual insight message ────────────────────────────────────
function getInsightText(kpiKey: string | null | undefined, trend: number, current: number, target: number | null): string | null {
    const k = kpiKey?.toLowerCase() ?? '';
    if (target && current > 0) {
        const pct = Math.round((current / target) * 100);
        if (pct >= 100) return `🎯 Objectif atteint (${pct}%)`;
        if (pct >= 80) return `Proche de l'objectif — ${pct}% atteint`;
    }
    if (trend > 15) return 'Excellente progression ce mois-ci';
    if (trend > 5) return 'En hausse par rapport à la période précédente';
    if (trend < -15) {
        if (k.includes('dso') || k.includes('dmp')) return 'Délai de paiement raccourci — bonne nouvelle';
        return '⚠️ Baisse significative — vérifier les transactions';
    }
    if (trend < -5) return 'Léger recul vs période précédente';
    if (Math.abs(trend) <= 1) return 'Stable sur la période';
    return null;
}

export function KpiVisual({ widget, isCompact }: KpiVisualProps) {
    const { currency } = useFilters();
    const { data: kpiData, isLoading } = useKpiData(widget.kpiKey || null);
    const { data: allTargets } = useTargets({ kpiKey: widget.kpiKey ?? undefined });

    const currencySymbol = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';
    const domain = getDomainStyle(widget.kpiKey);

    // ── Select icon ──────────────────────────────────────────────
    const k = widget.kpiKey?.toLowerCase() ?? '';
    let Icon = Activity;
    if (k.includes('ca') || k.includes('revenue')) Icon = TrendingUp;
    if (k.includes('tresorerie') || k.includes('solde') || k.includes('cashflow')) Icon = DollarSign;
    if (k.includes('marge') || k.includes('margin')) Icon = PieChart;
    if (k.includes('dso') || k.includes('dmp') || k.includes('dpo') || k.includes('delai')) Icon = Clock;
    if (k.includes('bfr') || k.includes('target')) Icon = Target;

    // ── Loading ──────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 text-primary animate-spin opacity-30" />
                <span className="text-[10px] text-muted-foreground">Chargement…</span>
            </div>
        );
    }

    // ── Data ─────────────────────────────────────────────────────
    const currentValue = kpiData?.current ?? 0;
    const previousValue = kpiData?.previous ?? 0;
    const trend = kpiData?.trend ?? 0;
    const backendTarget = kpiData?.target ?? null;
    const targetValue = backendTarget
        ?? allTargets?.find((t: any) => t.kpiKey === widget.kpiKey)?.value
        ?? null;
    const isPositiveTrend = trend >= 0;
    const isDelayMetric = k.includes('dso') || k.includes('dmp') || k.includes('dpo');

    // ── Format ────────────────────────────────────────────────────
    const formatValue = (val: number) => {
        if (isDelayMetric) return `${Math.round(val)} j`;
        if (k.includes('margin') || k.includes('rate') || k.includes('taux')) return `${val.toFixed(1)}%`;
        if (k.includes('nb_') || k.includes('count')) return val.toLocaleString('fr-FR');
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ${currencySymbol}`;
        if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k ${currencySymbol}`;
        return `${val.toLocaleString('fr-FR')} ${currencySymbol}`;
    };

    // ── Target progress (0-100) ───────────────────────────────────
    const targetProgress = targetValue && targetValue > 0
        ? Math.min(Math.round((currentValue / targetValue) * 100), 100)
        : null;

    // ── Sparkline data ────────────────────────────────────────────
    const rawItems = kpiData?.details?.items ?? kpiData?.details ?? [];
    const sparkItems = (Array.isArray(rawItems) ? rawItems.slice(-6) : []).map((it: any) => ({
        v: it.revenue ?? it.CA ?? it.amount ?? it.value ?? 0
    }));
    const hasSparkline = sparkItems.length >= 3 && !isCompact;

    // ── Contextual insight ────────────────────────────────────────
    const insight = getInsightText(widget.kpiKey, trend, currentValue, targetValue);

    // ========= COMPACT MODE ======================================
    if (isCompact) {
        return (
            <div className="flex flex-col h-full justify-between">
                <div className="flex items-center gap-1.5">
                    <div className={cn('h-6 w-6 rounded-md flex items-center justify-center shrink-0', domain.iconBg)}>
                        <Icon className={cn('h-3.5 w-3.5', domain.iconColor)} />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground truncate leading-tight">
                        {widget.name}
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatValue(currentValue)}
                    </span>
                    <span className={cn(
                        'text-[10px] font-bold px-1 py-0.5 rounded-md',
                        isPositiveTrend ? 'trend-up' : 'trend-down'
                    )}>
                        {isPositiveTrend ? '+' : ''}{trend.toFixed(0)}%
                    </span>
                </div>
            </div>
        );
    }

    // ========= FULL MODE =========================================
    return (
        <div className="flex flex-col h-full justify-between gap-3 animate-fade-up">

            {/* ── Row 1 : Icon + Name + Trend badge ── */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ring-1',
                        domain.iconBg, domain.ringColor
                    )}>
                        <Icon className={cn('h-4.5 w-4.5', domain.iconColor)} style={{ width: 18, height: 18 }} />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-400 leading-tight">
                        {widget.name}
                    </span>
                </div>

                {/* Trend badge */}
                <div className={cn(
                    'flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-lg shrink-0',
                    isPositiveTrend ? 'trend-up' : 'trend-down'
                )}>
                    {isPositiveTrend
                        ? <TrendingUp style={{ width: 12, height: 12 }} />
                        : <TrendingDown style={{ width: 12, height: 12 }} />
                    }
                    {isPositiveTrend ? '+' : ''}{trend.toFixed(1)}%
                </div>
            </div>

            {/* ── Row 2 : Main value + sparkline ── */}
            <div className="flex items-end justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums leading-none">
                        {formatValue(currentValue)}
                    </span>
                    {previousValue > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                            Préc. : {formatValue(previousValue)}
                        </span>
                    )}
                </div>

                {/* Mini sparkline */}
                {hasSparkline && (
                    <div className="w-20 h-10 shrink-0 opacity-70">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparkItems} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                                <defs>
                                    <linearGradient id={`spark-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositiveTrend ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isPositiveTrend ? '#10b981' : '#ef4444'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="v"
                                    stroke={isPositiveTrend ? '#10b981' : '#ef4444'}
                                    strokeWidth={1.5}
                                    fill={`url(#spark-${widget.id})`}
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* ── Row 3 : Progress bar (if target) ── */}
            {targetProgress !== null && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium">Objectif</span>
                        <span className={cn(
                            'font-bold',
                            targetProgress >= 100 ? 'text-emerald-600 dark:text-emerald-400' :
                            targetProgress >= 75  ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
                        )}>
                            {formatValue(targetValue!)}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-700',
                                targetProgress >= 100 ? 'bg-emerald-500' :
                                targetProgress >= 75  ? 'bg-blue-500' : 'bg-amber-500'
                            )}
                            style={{ width: `${targetProgress}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{targetProgress}% de l'objectif</span>
                </div>
            )}

            {/* ── Row 4 : Insight text ── */}
            {insight && (
                <p className="text-[11px] text-muted-foreground leading-snug border-t border-border/60 pt-2 mt-auto">
                    {insight}
                </p>
            )}
        </div>
    );
}
