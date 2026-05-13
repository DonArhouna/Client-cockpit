import { useKpiData } from '@/hooks/use-kpi-data';
import { useTargets } from '@/hooks/use-api';
import { useFilters } from '@/context/FilterContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

interface GaugeVisualProps {
    kpiKey: string;
    isCompact?: boolean;
}

const LOWER_IS_BETTER_PATTERNS = [
    'dso', 'dmp', 'dpo', 'taux_impayes', 'delai_paiement',
    'balance_agee', 'bfr', 'score_risque', 'score_churn',
    'factures_echues', 'stocks_dormants', 'taux_rupture',
];

function isLowerBetter(key: string): boolean {
    return LOWER_IS_BETTER_PATTERNS.some(p => key.includes(p));
}

function gaugeColor(pct: number, lowerBetter: boolean): string {
    const effective = lowerBetter ? 1 - pct : pct;
    if (effective >= 0.8) return '#10b981';
    if (effective >= 0.5) return '#f59e0b';
    return '#ef4444';
}

// SVG semi-circle arc path (clockwise, top half)
// cx,cy = center  r = radius  pct in [0,1]
function arcPath(cx: number, cy: number, r: number, pct: number): string {
    if (pct <= 0) return '';
    const angle = Math.PI * (1 - Math.min(pct, 1));
    const ex = cx + r * Math.cos(angle);
    const ey = cy - r * Math.sin(angle);
    // large-arc-flag is always 0 because we never exceed 180° in foreground
    return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ex} ${ey}`;
}

export function GaugeVisual({ kpiKey, isCompact }: GaugeVisualProps) {
    const { currency } = useFilters();
    const { data: kpiData, isLoading } = useKpiData(kpiKey);
    const { data: allTargets } = useTargets({ kpiKey });

    const currencySymbol = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';
    const k = kpiKey.toLowerCase();
    const isDelayMetric = k.includes('dso') || k.includes('dmp') || k.includes('dpo');
    const isPercent = k.includes('taux') || k.includes('margin') || k.includes('pct') || k.includes('rate');
    const lowerBetter = isLowerBetter(k);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Skeleton className={cn('rounded-full', isCompact ? 'w-28 h-14' : 'w-44 h-22')} />
            </div>
        );
    }

    const current = kpiData?.current ?? 0;
    const backendTarget = kpiData?.target ?? null;
    const targetValue: number | null =
        backendTarget ??
        (allTargets?.find((t: any) => t.kpiKey === kpiKey)?.value ?? null) ??
        (isPercent ? 100 : null);

    const trend = kpiData?.trend ?? 0;

    // Gauge needs a meaningful max to be useful.
    // Without a target or % unit, the arc conveys no information → show fallback.
    const hasContext = targetValue !== null || isPercent;

    const pct = targetValue && targetValue > 0
        ? Math.min(current / targetValue, 1)
        : isPercent ? Math.min(current / 100, 1) : 1;

    const color = gaugeColor(pct, lowerBetter);
    const isPositiveTrend = lowerBetter ? trend <= 0 : trend >= 0;

    const formatValue = (val: number): string => {
        if (isDelayMetric) return `${Math.round(val)} j`;
        if (isPercent) return `${val.toFixed(1)}%`;
        if (k.includes('nb_') || k.includes('count')) return val.toLocaleString('fr-FR');
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
        return val.toLocaleString('fr-FR');
    };

    // No target and not a % KPI → gauge arc is meaningless, render value + warning instead
    if (!hasContext) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-4 text-center">
                {!isCompact && (
                    <div className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 w-full">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Aucun objectif défini — jauge sans référentiel</span>
                    </div>
                )}
                <span className={cn(
                    'font-black tabular-nums text-slate-900 dark:text-slate-100 tracking-tight',
                    isCompact ? 'text-2xl' : 'text-4xl'
                )}>
                    {formatValue(current)}
                </span>
                {!isCompact && (
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                        {currencySymbol}
                    </span>
                )}
            </div>
        );
    }

    // SVG geometry — fixed center so both compact/full share the same coordinate space
    const cx = 110, cy = 110;
    const r = isCompact ? 68 : 88;
    const sw = isCompact ? 12 : 18;

    const bgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
    const fgPath = arcPath(cx, cy, r, pct);

    // viewBox crops to the semicircle + stroke + a bit of bottom for labels
    const vbX = cx - r - sw - 2;
    const vbY = cy - r - sw - 2;
    const vbW = (r + sw + 2) * 2;
    const vbH = r + sw * 2 + (isCompact ? 14 : 30);

    const pctLabel = Math.round(pct * 100);

    return (
        <div className="flex flex-col items-center justify-center h-full gap-1 select-none">
            <div className="relative w-full flex justify-center">
                <svg
                    viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                    className={cn('w-full', isCompact ? 'max-h-[88px]' : 'max-h-[140px]')}
                    aria-label={`Gauge ${kpiKey}: ${formatValue(current)}`}
                >
                    {/* Background arc */}
                    <path
                        d={bgPath}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={sw}
                        strokeLinecap="round"
                        className="text-slate-100 dark:text-slate-800"
                    />

                    {/* Foreground arc */}
                    {fgPath && (
                        <path
                            d={fgPath}
                            fill="none"
                            stroke={color}
                            strokeWidth={sw}
                            strokeLinecap="round"
                        />
                    )}

                    {/* Center: main value */}
                    <text
                        x={cx}
                        y={cy - (isCompact ? 10 : 6)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="currentColor"
                        className="fill-slate-900 dark:fill-slate-100 tabular-nums"
                        style={{ fontSize: isCompact ? 15 : 22, fontWeight: 900, letterSpacing: '-0.02em' }}
                    >
                        {formatValue(current)}
                    </text>

                    {/* % of target — only in full mode when target exists */}
                    {!isCompact && targetValue !== null && (
                        <text
                            x={cx}
                            y={cy + 14}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontSize: 10, fill: color, fontWeight: 700 }}
                        >
                            {pctLabel}% objectif
                        </text>
                    )}

                    {/* Arc endpoint labels */}
                    {!isCompact && (
                        <>
                            <text
                                x={cx - r}
                                y={cy + sw + 4}
                                textAnchor="middle"
                                style={{ fontSize: 9, fill: '#94a3b8' }}
                            >
                                0
                            </text>
                            <text
                                x={cx + r}
                                y={cy + sw + 4}
                                textAnchor="middle"
                                style={{ fontSize: 9, fill: '#94a3b8' }}
                            >
                                {targetValue !== null
                                    ? formatValue(targetValue)
                                    : isPercent ? '100%' : ''}
                            </text>
                        </>
                    )}
                </svg>
            </div>

            {/* Trend badge — full mode only */}
            {!isCompact && trend !== 0 && (
                <span className={cn(
                    'flex items-center gap-0.5 text-[11px] font-black px-2 py-0.5 rounded-full',
                    isPositiveTrend
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-500 dark:text-rose-400'
                )}>
                    {isPositiveTrend
                        ? <ArrowUpRight className="h-3 w-3" strokeWidth={3} />
                        : <ArrowDownRight className="h-3 w-3" strokeWidth={3} />}
                    {Math.abs(trend).toFixed(1)}% vs N-1
                </span>
            )}

            {/* Currency hint when no target and not a % KPI */}
            {!isCompact && targetValue === null && !isPercent && (
                <span className="text-[10px] text-slate-400 font-semibold -mt-0.5">{currencySymbol}</span>
            )}
        </div>
    );
}
