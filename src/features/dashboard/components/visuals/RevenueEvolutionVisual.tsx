import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, TooltipProps
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RevenueEvolutionVisualProps {
    isCompact?: boolean;
    kpiKey?: string;
}

// ── Custom Tooltip ────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, currencySymbol }: TooltipProps<number, string> & { currencySymbol: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-border/60 p-3 text-[12px] min-w-[140px]">
            <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
            {payload.map((entry) => {
                const isPositive = (entry.value ?? 0) >= 0;
                return (
                    <div key={entry.name} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                            {entry.name}
                        </span>
                        <span className={cn(
                            'font-bold tabular-nums',
                            entry.name === 'Variation' && (isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')
                        )}>
                            {typeof entry.value === 'number'
                                ? `${entry.value >= 0 ? '' : ''}${(entry.value / 1000).toFixed(0)}k ${currencySymbol}`
                                : '--'}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export function RevenueEvolutionVisual({ isCompact, kpiKey = 'f01_ca_ht' }: RevenueEvolutionVisualProps) {
    const { currency } = useFilters();
    const { data: kpiData, isLoading } = useKpiData(kpiKey);
    const currencySymbol = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';
    const [hideSeries, setHideSeries] = useState<Record<string, boolean>>({});

    // ── Build chart data ──────────────────────────────────────────
    const rawItems = kpiData?.details?.items ?? kpiData?.details ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [];

    const chartData = items.map((item: any) => ({
        month: item.month ?? item.Month ?? item.periode ?? item.label ?? '?',
        revenus: item.revenue ?? item.CA ?? item.amount ?? item.value ?? 0,
        sorties: item.charges ?? item.expenses ?? item.costs ?? 0,
        variation: (item.revenue ?? item.CA ?? item.amount ?? item.value ?? 0)
            - (item.charges ?? item.expenses ?? item.costs ?? 0),
    }));

    const displayData = chartData.length > 0 ? chartData : [
        { month: 'Jan', revenus: 0, sorties: 0, variation: 0 },
        { month: 'Fév', revenus: 0, sorties: 0, variation: 0 },
        { month: 'Mar', revenus: 0, sorties: 0, variation: 0 },
        { month: 'Avr', revenus: 0, sorties: 0, variation: 0 },
        { month: 'Mai', revenus: 0, sorties: 0, variation: 0 },
        { month: 'Juin', revenus: 0, sorties: 0, variation: 0 },
    ];

    // ── Summary stats ─────────────────────────────────────────────
    const trend = kpiData?.trend ?? 0;
    const isPositive = trend >= 0;
    const totalRevenue = displayData.reduce((s, d) => s + d.revenus, 0);
    const formatShort = (v: number) =>
        v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}k`;

    // ── Loading ───────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col h-full w-full gap-3 justify-center">
                <Skeleton className="h-[70%] w-full rounded-xl" />
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-1/3 rounded-md" />
                    <Skeleton className="h-4 w-1/4 rounded-md" />
                </div>
            </div>
        );
    }

    // ── COMPACT ───────────────────────────────────────────────────
    if (isCompact) {
        return (
            <div className="flex flex-col h-full w-full">
                <div className="flex-1 w-full min-h-[60px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={displayData} margin={{ top: 4, right: 4, left: -44, bottom: 0 }}>
                            <defs>
                                <linearGradient id="compactRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="revenus" stroke="#3b82f6" strokeWidth={2} fill="url(#compactRev)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    // ── FULL ──────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full w-full gap-3">

            {/* ── Summary row ── */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Total période</p>
                        <p className="text-[18px] font-black text-slate-900 dark:text-slate-100 tabular-nums leading-tight">
                            {formatShort(totalRevenue)} {currencySymbol}
                        </p>
                    </div>
                    <div className={cn(
                        'flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-lg',
                        isPositive ? 'trend-up' : 'trend-down'
                    )}>
                        {isPositive
                            ? <TrendingUp style={{ width: 12, height: 12 }} />
                            : <TrendingDown style={{ width: 12, height: 12 }} />}
                        {isPositive ? '+' : ''}{trend.toFixed(1)}%
                    </div>
                </div>

                {/* Toggle série */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5 text-[12px]">
                    {['revenus', 'sorties'].map((serie) => (
                        <button
                            key={serie}
                            onClick={() => setHideSeries(prev => ({ ...prev, [serie]: !prev[serie] }))}
                            className={cn(
                                'px-3 py-1 rounded-md font-semibold capitalize transition-all',
                                !hideSeries[serie]
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100'
                                    : 'text-muted-foreground'
                            )}
                        >
                            {serie === 'revenus' ? 'Entrées' : 'Sorties'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Chart ── */}
            <div className="flex-1 w-full min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradSorties" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)" />
                        <XAxis
                            dataKey="month"
                            axisLine={false} tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            dy={8}
                        />
                        <YAxis
                            axisLine={false} tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                            width={48}
                        />
                        <Tooltip
                            content={<CustomTooltip currencySymbol={currencySymbol} />}
                            cursor={{ stroke: 'rgba(148,163,184,0.3)', strokeWidth: 1 }}
                        />

                        {!hideSeries['revenus'] && (
                            <Area
                                type="monotone" dataKey="revenus" name="Entrées"
                                stroke="#3b82f6" strokeWidth={2.5}
                                fill="url(#gradRev)"
                                dot={false}
                                activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                            />
                        )}
                        {!hideSeries['sorties'] && (
                            <Area
                                type="monotone" dataKey="sorties" name="Sorties"
                                stroke="#f43f5e" strokeWidth={2}
                                strokeDasharray="5 3"
                                fill="url(#gradSorties)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* ── Legend ── */}
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground px-1">
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded-full bg-blue-500 inline-block" />
                    Entrées
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-[2px] w-4 border-t-2 border-dashed border-rose-500 inline-block" />
                    Sorties
                </span>
            </div>
        </div>
    );
}
