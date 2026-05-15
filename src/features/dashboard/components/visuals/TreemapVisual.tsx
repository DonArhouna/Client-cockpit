import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useTheme } from '@/components/shared/ThemeProvider';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = [
    '#3b66ac', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1',
];

interface TreemapVisualProps {
    kpiKey: string;
    isCompact?: boolean;
}

function TreemapCell({ x, y, width, height, name, index }: any) {
    if (!width || !height || width < 10 || height < 10) return null;
    const color = COLORS[index % COLORS.length];
    const fontSize = Math.min(12, Math.max(8, width / 8));
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={color} opacity={0.85} rx={3} />
            {width > 35 && height > 20 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize, fontWeight: 700, fill: 'white', pointerEvents: 'none' }}
                >
                    {(name?.length ?? 0) > 12 ? `${name.slice(0, 11)}…` : name}
                </text>
            )}
        </g>
    );
}

export function TreemapVisual({ kpiKey }: TreemapVisualProps) {
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

    const nameKey = allKeys.find(k => !isPureNumeric(firstItem[k])) ?? allKeys[0];
    const valueKey = allKeys.find(k => k !== nameKey && isPureNumeric(firstItem[k])) ?? allKeys[1];

    const treemapData = items
        .map((item: any) => ({
            name: String(item[nameKey] ?? ''),
            size: Math.abs(parseFloat(item[valueKey]) || 0),
        }))
        .filter(d => d.size > 0)
        .sort((a, b) => b.size - a.size);

    if (treemapData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 italic text-xs">
                Aucune donnée disponible
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
                <Treemap
                    data={treemapData}
                    dataKey="size"
                    nameKey="name"
                    content={<TreemapCell />}
                >
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#0f172a' : '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 8px 16px -4px rgba(0,0,0,0.12)',
                        }}
                        formatter={(v: number) => [v.toLocaleString('fr-FR'), 'Valeur']}
                    />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
}
