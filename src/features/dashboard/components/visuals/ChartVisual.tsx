import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    CartesianGrid, Tooltip, Legend, TooltipProps
} from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/components/shared/ThemeProvider';
import { cn } from '@/lib/utils';

// Brand color palette
const COLORS = ['#3b66ac', '#5a85cb', '#7aa4ea', '#94a3b8', '#cbd5e1', '#1e3a6e', '#2d4f8a', '#4970b0'];

interface ChartVisualProps {
    kpiKey: string;
    vizType?: 'bar' | 'area' | 'line' | 'pie' | 'donut';
    isCompact?: boolean;
}

/**
 * Generic Chart Visualization Component
 * Consolidates Bar, Line, Area, and Pie charts.
 */
export function ChartVisual({ kpiKey, vizType = 'bar', isCompact }: ChartVisualProps) {
    const { currency } = useFilters();
    const { theme } = useTheme();
    const { data: kpiData, isLoading } = useKpiData(kpiKey);
    const currencySymbol = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';
    const isDark = theme === 'dark';

    const axisColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.15)';

    const rawItems = kpiData?.details?.items ?? kpiData?.details ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [];

    const chartData = items.map((item: any, idx: number) => ({
        name: item.month ?? item.Month ?? item.periode ?? item.label ?? item.categorie ?? item.name ?? `? ${idx + 1}`,
        value: item.revenue ?? item.CA ?? item.amount ?? item.value ?? item.total ?? 0,
        sorties: item.charges ?? item.expenses ?? item.costs ?? 0,
    }));

    if (isLoading) {
        return (
            <div className="flex flex-col h-full w-full gap-3 justify-center items-center p-4">
                <Skeleton className={cn("w-full rounded-xl", isCompact ? "h-16" : "h-40")} />
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 italic text-xs py-8">
                Aucune donnée disponible
            </div>
        );
    }

    const total = chartData.reduce((acc, cur) => acc + cur.value, 0);

    // ── PIE / DONUT ──────────────────────────────────────────────
    if (vizType === 'pie' || vizType === 'donut') {
        const innerRadius = isCompact ? 25 : (vizType === 'donut' ? 50 : 0);
        const outerRadius = isCompact ? 45 : 80;

        return (
            <div className={cn("flex flex-col h-full w-full", isCompact ? "justify-center" : "gap-4")}>
                <div className="flex-1 min-h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%" cy="50%"
                                innerRadius={innerRadius}
                                outerRadius={outerRadius}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [`${value.toLocaleString()} ${currencySymbol}`, '']}
                                contentStyle={{ 
                                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                    borderRadius: '12px', 
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            {!isCompact && (
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    formatter={(value) => <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{value}</span>}
                                />
                            )}
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    // ── BAR / LINE / AREA ─────────────────────────────────────────
    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: isCompact ? { top: 4, right: 4, left: -44, bottom: 0 } : { top: 10, right: 10, left: -20, bottom: 0 }
        };

        if (vizType === 'bar') {
            return (
                <BarChart {...commonProps}>
                    {!isCompact && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />}
                    <XAxis dataKey="name" hide={isCompact} axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} dy={8} />
                    <YAxis hide={isCompact} axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={48} />
                    <Tooltip cursor={{ fill: 'rgba(148,163,184,0.1)' }} contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="value" fill="#3b66ac" radius={[4, 4, 0, 0]} />
                </BarChart>
            );
        }

        if (vizType === 'line') {
            return (
                <LineChart {...commonProps}>
                    {!isCompact && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />}
                    <XAxis dataKey="name" hide={isCompact} axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} dy={8} />
                    <YAxis hide={isCompact} axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} width={48} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none' }} />
                    <Line type="monotone" dataKey="value" stroke="#3b66ac" strokeWidth={3} dot={!isCompact} activeDot={{ r: 6 }} />
                </LineChart>
            );
        }

        // Default: Area
        return (
            <AreaChart {...commonProps}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b66ac" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b66ac" stopOpacity={0} />
                    </linearGradient>
                </defs>
                {!isCompact && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />}
                <XAxis dataKey="name" hide={isCompact} axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} dy={8} />
                <YAxis hide={isCompact} axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} width={48} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none' }} />
                <Area type="monotone" dataKey="value" stroke="#3b66ac" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
        );
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 w-full min-h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
            {!isCompact && (
                 <div className="pt-3 border-t dark:border-slate-800/50 mt-2 text-[10px] text-slate-500 flex justify-between uppercase tracking-wider font-bold">
                    <span>Total cumulé</span>
                    <span className="text-slate-900 dark:text-slate-100">{total.toLocaleString()} {currencySymbol}</span>
                </div>
            )}
        </div>
    );
}
