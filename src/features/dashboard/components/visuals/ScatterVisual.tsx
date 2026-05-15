import {
    ResponsiveContainer, ScatterChart, Scatter,
    XAxis, YAxis, ZAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useTheme } from '@/components/shared/ThemeProvider';
import { Skeleton } from '@/components/ui/skeleton';

interface ScatterVisualProps {
    kpiKey: string;
    isCompact?: boolean;
}

export function ScatterVisual({ kpiKey, isCompact }: ScatterVisualProps) {
    const { data: kpiData, isLoading } = useKpiData(kpiKey);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const rawItems = kpiData?.details?.items ?? kpiData?.details ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [];

    if (isLoading) return <Skeleton className="w-full h-full rounded-xl" />;

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 italic text-xs">
                Aucune donnée disponible
            </div>
        );
    }

    const firstItem = items[0] ?? {};
    const allKeys = Object.keys(firstItem);
    const isPureNumeric = (v: any) =>
        typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));
    const numericKeys = allKeys.filter(k => isPureNumeric(firstItem[k]));

    const xKey = numericKeys[0] ?? allKeys[0];
    const yKey = numericKeys[1] ?? numericKeys[0] ?? allKeys[0];

    const scatterData = items.map((item: any, i: number) => ({
        x: parseFloat(item[xKey]) || i,
        y: parseFloat(item[yKey]) || 0,
    }));

    const axisColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.15)';

    return (
        <div className="w-full h-full flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={isCompact
                    ? { top: 4, right: 4, left: -20, bottom: 0 }
                    : { top: 10, right: 16, left: -10, bottom: 0 }
                }>
                    {!isCompact && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                    <XAxis
                        dataKey="x"
                        type="number"
                        name={xKey.replace(/_/g, ' ')}
                        hide={isCompact}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: axisColor, fontSize: 10 }}
                    />
                    <YAxis
                        dataKey="y"
                        type="number"
                        name={yKey.replace(/_/g, ' ')}
                        hide={isCompact}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: axisColor, fontSize: 10 }}
                        width={48}
                    />
                    <ZAxis range={[30, 30]} />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{
                            backgroundColor: isDark ? '#0f172a' : '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 8px 16px -4px rgba(0,0,0,0.12)',
                        }}
                        formatter={(v: number, name: string) => [
                            v.toLocaleString('fr-FR'),
                            name === 'x' ? xKey.replace(/_/g, ' ') : yKey.replace(/_/g, ' '),
                        ]}
                    />
                    <Scatter data={scatterData} fill="#3b66ac" opacity={0.75} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
