import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, PieChart, Pie, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';

interface ReceivablesVisualProps {
    isCompact?: boolean;
    kpiKey?: string;
}

export function ReceivablesVisual({ isCompact, kpiKey = 'balance_agee_clients' }: ReceivablesVisualProps) {
    const { currency } = useFilters();
    const { data: kpiData, isLoading } = useKpiData(kpiKey);
    const currencySymbol = currency === 'XOF' ? 'F' : currency === 'EUR' ? '€' : '$';

    // Mappage des données dynamiques
    const rawItems = kpiData?.details?.items || kpiData?.details || [];
    const barData = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems.map((item, idx) => ({
        name: item.name || item.Tranche || item.label || `T${idx+1}`,
        value: item.value || item.Montant || 0,
        color: ['#22c55e', '#f59e0b', '#f97316', '#ef4444'][idx % 4]
    })) : [
        { name: '0-30 jours', value: 0, color: '#22c55e' },
        { name: '31-60 jours', value: 0, color: '#f59e0b' },
        { name: '61-90 jours', value: 0, color: '#f97316' },
        { name: '90+ jours', value: 0, color: '#ef4444' },
    ];

    if (isLoading) {
        return (
            <div className="h-full w-full p-4 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    if (isCompact) {
        const maxValue = Math.max(...barData.map(d => d.value), 1);
        return (
            <div className="flex flex-col h-full justify-center space-y-2">
                {barData.slice(0, 3).map((item) => (
                    <div key={item.name} className="flex flex-col">
                        <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-slate-500 font-medium truncate">{item.name}</span>
                            <span className="font-bold text-slate-700">{item.value.toLocaleString()} {currencySymbol}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                            <div
                                className="h-full"
                                style={{
                                    width: `${(item.value / maxValue) * 100}%`,
                                    backgroundColor: item.color
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const totalValue = barData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-end mb-4 z-10 relative">
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center bg-slate-100 rounded-md p-0.5">
                        <button className="px-3 py-1 bg-white shadow-sm rounded-sm font-medium text-slate-700">Âge des créances</button>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2">
                        <Download className="h-4 w-4" />
                        Exporter
                    </Button>
                </div>
            </div>

            <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
                <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}K` : value.toString()}
                            />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-[200px] flex flex-col items-center justify-center">
                    <div className="h-[140px] w-[140px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={barData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={65}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="w-full mt-4 space-y-2">
                        {barData.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-slate-600 truncate max-w-[80px]">{item.name}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-semibold text-slate-800">{item.value.toLocaleString()} {currencySymbol}</span>
                                    <span className="text-[10px] text-slate-400">
                                        {totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 mt-6 pt-4 border-t text-sm">
                <div>
                    <div className="text-slate-500 text-xs mb-1">Moyenne</div>
                    <div className="font-semibold text-slate-800">
                        {totalValue > 0 ? (totalValue / barData.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0} {currencySymbol}
                    </div>
                </div>
                <div>
                    <div className="text-slate-500 text-xs mb-1">Total créances</div>
                    <div className="font-semibold text-slate-800">{totalValue.toLocaleString()} {currencySymbol}</div>
                </div>
                <div className="flex items-center justify-end">
                    <button className="text-primary font-medium hover:underline flex items-center">
                        <span className="mr-1">↗</span> Détails
                    </button>
                </div>
            </div>
        </div>
    );
}
