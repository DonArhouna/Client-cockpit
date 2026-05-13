import { useState } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    CartesianGrid, Tooltip, Legend, ReferenceLine, Label,
} from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/components/shared/ThemeProvider';
import { cn } from '@/lib/utils';

const COLORS = [
    '#3b66ac', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1',
    '#14b8a6', '#a855f7',
];
const SECONDARY_COLOR = '#f59e0b';

interface ChartVisualProps {
    kpiKey: string;
    vizType?: 'bar' | 'area' | 'line' | 'pie' | 'donut';
    isCompact?: boolean;
    chartConfig?: { nameKey?: string; valueKey?: string };
}

// Unique SVG gradient ID per kpiKey — avoids defs collision when multiple area charts coexist
function gradId(key: string, suffix = '') {
    return `grad-${key.replace(/[^a-z0-9]/gi, '-')}${suffix}`;
}

// "2024-01" → "Jan 24"  |  "2024-01-15" → "15 Jan"  |  short/other → as-is or truncated
function formatXLabel(val: string): string {
    if (!val) return val;
    const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const ym = val.match(/^(\d{4})-(\d{2})$/);
    if (ym) return `${MONTHS[parseInt(ym[2], 10) - 1] ?? ym[2]} ${ym[1].slice(2)}`;
    const ymd = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) return `${ymd[3]} ${MONTHS[parseInt(ymd[2], 10) - 1] ?? ymd[2]}`;
    if (val.length <= 8) return val;
    return val.slice(0, 9) + '…';
}

type UnitType = 'currency' | 'percent' | 'days' | 'number';

function detectUnit(kpiKey: string): UnitType {
    const k = kpiKey.toLowerCase();
    if (k.includes('taux') || k.includes('margin') || k.includes('pct') || k.includes('rate')) return 'percent';
    if (k.includes('dso') || k.includes('dmp') || k.includes('dpo') || k.includes('delai')) return 'days';
    if (k.includes('nb_') || k.includes('count') || k.includes('nombre')) return 'number';
    return 'currency';
}

function fmtYTick(v: number, unit: UnitType): string {
    if (unit === 'percent') return `${v}%`;
    if (unit === 'days') return `${v}j`;
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
    return String(v);
}

function fmtValue(v: number, unit: UnitType, sym: string): string {
    if (unit === 'percent') return `${v.toFixed(1)}%`;
    if (unit === 'days') return `${Math.round(v)} j`;
    if (unit === 'number') return v.toLocaleString('fr-FR');
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M ${sym}`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k ${sym}`;
    return `${v.toLocaleString('fr-FR')} ${sym}`;
}

export function ChartVisual({ kpiKey, vizType = 'bar', isCompact, chartConfig }: ChartVisualProps) {
    const { currency } = useFilters();
    const { theme } = useTheme();
    const { data: kpiData, isLoading } = useKpiData(kpiKey);
    const sym = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';
    const isDark = theme === 'dark';
    const unit = detectUnit(kpiKey);

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const axisColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.15)';

    const rawItems = kpiData?.details?.items ?? kpiData?.details ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [];

    // ── Key detection ────────────────────────────────────────────
    const NAME_KEYS = ['month', 'Month', 'periode', 'label', 'categorie', 'name', 'libelle',
        'intitule', 'code_axe', 'classe', 'axe', 'section', 'departement', 'type', 'tiers', 'client'];
    const VALUE_KEYS = ['revenue', 'CA', 'ca_analytique', 'amount', 'value', 'total', 'montant',
        'valeur', 'solde', 'sum', 'ca', 'ht', 'ttc', 'credit', 'debit'];

    const firstItem = items[0] ?? {};
    const allKeys = Object.keys(firstItem);
    const isPureNumeric = (v: any) =>
        typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));

    const nameCandidates = [
        ...NAME_KEYS.filter(k => allKeys.includes(k) && firstItem[k] != null),
        ...allKeys.filter(k => k !== '' && !isPureNumeric(firstItem[k]) && !NAME_KEYS.includes(k)),
    ];
    const nameKey = nameCandidates.length > 0
        ? nameCandidates.reduce((best, k) => {
            const u = new Set(items.map((i: any) => i[k])).size;
            const bu = new Set(items.map((i: any) => i[best])).size;
            return u > bu ? k : best;
        })
        : undefined;

    const valueKey = VALUE_KEYS.find(k => allKeys.includes(k) && firstItem[k] != null)
        ?? allKeys.find(k => k !== nameKey && k !== '' && isPureNumeric(firstItem[k]))
        ?? allKeys.find(k => k !== '' && isPureNumeric(firstItem[k]));

    const isScalar = items.length === 1 && (nameKey === valueKey || nameCandidates.length === 0);
    const effectiveNameKey = (!isScalar && nameKey === valueKey) ? undefined : nameKey;

    const resolvedNameKey = chartConfig?.nameKey ?? effectiveNameKey;
    const resolvedValueKey = chartConfig?.valueKey ?? valueKey;

    // Second numeric series: first key that is not nameKey and not the primary valueKey
    const secondaryKey = allKeys.find(
        k => k !== resolvedNameKey && k !== resolvedValueKey && k !== '' && isPureNumeric(firstItem[k])
    ) ?? null;

    // ── Data transform ───────────────────────────────────────────
    const chartData = items.map((item: any, idx: number) => {
        const raw = resolvedNameKey && item[resolvedNameKey] != null
            ? String(item[resolvedNameKey])
            : `${idx + 1}`;
        const entry: Record<string, any> = {
            name: formatXLabel(raw),
            value: resolvedValueKey != null ? (parseFloat(item[resolvedValueKey]) || 0) : 0,
        };
        if (secondaryKey) entry.secondary = parseFloat(item[secondaryKey]) || 0;
        return entry;
    });

    const hasMultiSeries = !!secondaryKey && chartData.some(d => (d.secondary ?? 0) !== 0);

    // ── Loading / empty ──────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col h-full w-full gap-3 justify-center items-center p-4">
                <Skeleton className={cn('w-full rounded-xl', isCompact ? 'h-16' : 'h-40')} />
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

    // ── Scalar fallback ──────────────────────────────────────────
    if (isScalar) {
        const sv = chartData[0].value;
        const label = valueKey ? valueKey.replace(/_/g, ' ') : 'Valeur';
        return (
            <div className={cn('flex flex-col h-full items-center justify-center', isCompact ? 'gap-1' : 'gap-3')}>
                <span className={cn('font-black tabular-nums text-slate-900 dark:text-slate-100 tracking-tight', isCompact ? 'text-2xl' : 'text-4xl')}>
                    {fmtValue(sv, unit, sym)}
                </span>
                {!isCompact && (
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                )}
            </div>
        );
    }

    const total = chartData.reduce((acc, cur) => acc + cur.value, 0);
    const target = kpiData?.target ?? null;

    // ── Shared chart elements ────────────────────────────────────
    const tooltipFormatter = (v: number, name: string) => {
        const label = name === 'value'
            ? (resolvedValueKey ?? 'Valeur').replace(/_/g, ' ')
            : (secondaryKey ?? name).replace(/_/g, ' ');
        return [fmtValue(v, unit, sym), label];
    };

    const commonProps = {
        data: chartData,
        margin: isCompact
            ? { top: 4, right: 4, left: -44, bottom: 0 }
            : { top: 10, right: 16, left: -20, bottom: 0 },
    };

    const xAxisEl = (
        <XAxis
            dataKey="name"
            hide={isCompact}
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 10 }}
            dy={8}
        />
    );
    const yAxisEl = (
        <YAxis
            hide={isCompact}
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 10 }}
            tickFormatter={(v) => fmtYTick(v, unit)}
            width={48}
        />
    );
    const tooltipEl = (
        <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
                backgroundColor: isDark ? '#0f172a' : '#fff',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 8px 16px -4px rgba(0,0,0,0.12)',
            }}
            labelStyle={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: axisColor }}
        />
    );
    const refLineEl = target !== null ? (
        <ReferenceLine
            y={target}
            stroke={SECONDARY_COLOR}
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={!isCompact
                ? { value: 'Objectif', fill: SECONDARY_COLOR, fontSize: 9, fontWeight: 700, position: 'insideTopRight' }
                : undefined}
        />
    ) : null;
    const legendEl = hasMultiSeries && !isCompact ? (
        <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ paddingTop: 4 }}
            formatter={(v: string) => (
                <span style={{ fontSize: 10, color: axisColor, fontWeight: 600 }}>
                    {v === 'value'
                        ? (resolvedValueKey ?? 'Valeur').replace(/_/g, ' ')
                        : (secondaryKey ?? v).replace(/_/g, ' ')}
                </span>
            )}
        />
    ) : null;

    // ── PIE / DONUT ──────────────────────────────────────────────
    if (vizType === 'pie' || vizType === 'donut') {
        const isDonut = vizType === 'donut';
        const innerRadius = isCompact ? 28 : (isDonut ? 52 : 0);
        const outerRadius = isCompact ? 46 : 82;

        // % label rendered inside each slice (pie only, full mode, segment ≥ 5%)
        const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
            if (isDonut || isCompact || percent < 0.05) return null;
            const RADIAN = Math.PI / 180;
            const r = innerRadius + (outerRadius - innerRadius) * 0.55;
            const x = cx + r * Math.cos(-midAngle * RADIAN);
            const y = cy + r * Math.sin(-midAngle * RADIAN);
            return (
                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize: 11, fontWeight: 800, pointerEvents: 'none' }}>
                    {`${(percent * 100).toFixed(0)}%`}
                </text>
            );
        };

        // Center text for donut — shows hovered segment or total
        const renderCenterLabel = ({ viewBox }: any) => {
            const { cx, cy } = viewBox ?? {};
            if (!cx || !cy) return null;
            const val = activeIndex !== null ? chartData[activeIndex].value : total;
            const name = activeIndex !== null ? chartData[activeIndex].name : null;
            const pct = activeIndex !== null && total > 0
                ? `${Math.round((chartData[activeIndex].value / total) * 100)}%`
                : 'Total';
            const subLine = name
                ? `${name.length > 14 ? name.slice(0, 13) + '…' : name} · ${pct}`
                : pct;
            return (
                <g>
                    <text x={cx} y={cy - (isCompact ? 6 : 9)} textAnchor="middle"
                        style={{ fontSize: isCompact ? 13 : 19, fontWeight: 900, fill: isDark ? '#f1f5f9' : '#0f172a' }}>
                        {fmtYTick(val, unit)}
                    </text>
                    <text x={cx} y={cy + (isCompact ? 8 : 12)} textAnchor="middle"
                        style={{ fontSize: isCompact ? 8 : 10, fill: '#94a3b8', fontWeight: 600 }}>
                        {subLine}
                    </text>
                </g>
            );
        };

        return (
            <div className={cn('flex flex-col h-full w-full', isCompact ? 'justify-center' : 'gap-2')}>
                <div className={cn('w-full', isCompact ? 'flex-1 min-h-0' : 'flex-1 min-h-[160px]')}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx={isCompact ? '50%' : '40%'}
                                cy="50%"
                                innerRadius={innerRadius}
                                outerRadius={outerRadius}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                                labelLine={false}
                                label={renderSliceLabel}
                                onMouseEnter={(_, i) => setActiveIndex(i)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {chartData.map((_, i) => (
                                    <Cell
                                        key={`cell-${i}`}
                                        fill={COLORS[i % COLORS.length]}
                                        opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                                        style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                                    />
                                ))}
                                {isDonut && (
                                    <Label content={renderCenterLabel} position="center" />
                                )}
                            </Pie>
                            <Tooltip
                                formatter={(v: number) => [
                                    `${fmtValue(v, unit, sym)}  ·  ${total > 0 ? Math.round((v / total) * 100) : 0}%`,
                                    '',
                                ]}
                                contentStyle={{
                                    backgroundColor: isDark ? '#0f172a' : '#fff',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                }}
                            />
                            {!isCompact && (
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    formatter={(v: string) => {
                                        const item = chartData.find(d => d.name === v);
                                        const pct = item && total > 0
                                            ? Math.round((item.value / total) * 100)
                                            : 0;
                                        const label = v.length > 15 ? v.slice(0, 14) + '…' : v;
                                        return (
                                            <span style={{ fontSize: 11, color: axisColor, fontWeight: 500 }}>
                                                {label}
                                                <span style={{ color: '#94a3b8', marginLeft: 5, fontWeight: 700 }}>
                                                    {pct}%
                                                </span>
                                            </span>
                                        );
                                    }}
                                />
                            )}
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    // ── BAR ──────────────────────────────────────────────────────
    const renderChart = () => {
        if (vizType === 'bar') {
            return (
                <BarChart {...commonProps} barCategoryGap="25%">
                    {!isCompact && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />}
                    {xAxisEl}{yAxisEl}{tooltipEl}{refLineEl}{legendEl}
                    <Bar dataKey="value" fill="#3b66ac" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    {hasMultiSeries && (
                        <Bar dataKey="secondary" fill={SECONDARY_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    )}
                </BarChart>
            );
        }

        // ── LINE ─────────────────────────────────────────────────
        if (vizType === 'line') {
            return (
                <LineChart {...commonProps}>
                    {!isCompact && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />}
                    {xAxisEl}{yAxisEl}{tooltipEl}{refLineEl}{legendEl}
                    <Line
                        type="monotone" dataKey="value"
                        stroke="#3b66ac" strokeWidth={2.5}
                        dot={false} activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    {hasMultiSeries && (
                        <Line
                            type="monotone" dataKey="secondary"
                            stroke={SECONDARY_COLOR} strokeWidth={2} strokeDasharray="5 3"
                            dot={false} activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                    )}
                </LineChart>
            );
        }

        // ── AREA (default) ────────────────────────────────────────
        const gId = gradId(kpiKey);
        const gId2 = gradId(kpiKey, '-2');
        return (
            <AreaChart {...commonProps}>
                <defs>
                    <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b66ac" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b66ac" stopOpacity={0} />
                    </linearGradient>
                    {hasMultiSeries && (
                        <linearGradient id={gId2} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={SECONDARY_COLOR} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={SECONDARY_COLOR} stopOpacity={0} />
                        </linearGradient>
                    )}
                </defs>
                {!isCompact && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />}
                {xAxisEl}{yAxisEl}{tooltipEl}{refLineEl}{legendEl}
                <Area
                    type="monotone" dataKey="value"
                    stroke="#3b66ac" strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, strokeWidth: 0 }}
                    fillOpacity={1} fill={`url(#${gId})`}
                />
                {hasMultiSeries && (
                    <Area
                        type="monotone" dataKey="secondary"
                        stroke={SECONDARY_COLOR} strokeWidth={2} strokeDasharray="5 3"
                        dot={false} activeDot={{ r: 5, strokeWidth: 0 }}
                        fillOpacity={1} fill={`url(#${gId2})`}
                    />
                )}
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
            {/* Footer: total only for currency KPIs — sum of % or days is meaningless */}
            {!isCompact && unit === 'currency' && (
                <div className="pt-3 border-t dark:border-slate-800/50 mt-2 text-[10px] text-slate-500 flex justify-between uppercase tracking-wider font-bold">
                    <span>Total cumulé</span>
                    <span className="text-slate-900 dark:text-slate-100">{total.toLocaleString()} {sym}</span>
                </div>
            )}
        </div>
    );
}
