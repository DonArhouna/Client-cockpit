import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilters } from '@/context/FilterContext';

// Palette de couleurs pour les segments du graphique à secteurs
const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

interface PieVisualProps {
    kpiKey: string;
    isCompact?: boolean;
}

export function PieVisual({ kpiKey, isCompact }: PieVisualProps) {
    const { currency } = useFilters();
    const { data: kpiData, isLoading } = useKpiData(kpiKey);
    const currencySymbol = currency === 'XOF' ? 'F' : currency === 'EUR' ? '€' : '$';

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-40 w-40 rounded-full" />
            </div>
        );
    }

    const rawItems = kpiData?.details?.items || kpiData?.details || [];
    const pieData = Array.isArray(rawItems) && rawItems.length > 0
        ? rawItems.map((item: any, idx: number) => ({
            name: item.name || item.label || item.categorie || `Segment ${idx + 1}`,
            value: item.value || item.montant || item.total || 0,
        }))
        : [
            { name: 'Segment A', value: 0 },
            { name: 'Segment B', value: 0 },
            { name: 'Segment C', value: 0 },
        ];

    const total = pieData.reduce((acc, cur) => acc + cur.value, 0);

    if (isCompact) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value" stroke="none">
                            {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 flex flex-col md:flex-row items-center gap-4 min-h-[180px]">
                <div className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [`${value.toLocaleString()} ${currencySymbol}`, '']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full md:w-[160px] space-y-2">
                    {pieData.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-slate-600 truncate max-w-[80px]">{item.name}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-semibold text-slate-800">{item.value.toLocaleString()} {currencySymbol}</span>
                                <span className="text-[10px] text-slate-400">
                                    {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-3 border-t mt-3 text-xs text-slate-500 flex justify-between">
                <span>Total</span>
                <span className="font-semibold text-slate-800">{total.toLocaleString()} {currencySymbol}</span>
            </div>
        </div>
    );
}
