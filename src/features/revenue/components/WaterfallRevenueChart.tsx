import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';

export function WaterfallRevenueChart() {
    const { data: rawData, isLoading } = useKpiData('balance_agee_clients');

    // Ensure tranches are in correct order
    const order = ['0-30j', '30-60j', '60-90j', '>90j'];
    const chartData = order.map(tranche => {
        const item = Array.isArray(rawData) ? rawData.find((d: any) => d.Tranche === tranche) : null;
        return {
            name: tranche,
            value: item ? Number(item.Montant) : 0
        };
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
                    <p className="text-xs font-bold text-slate-500 mb-1">Tranche: {data.name}</p>
                    <p className="text-sm font-black text-slate-900">
                        {formatCurrency(data.value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <BarChart3 className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Balance Âgée Clients</CardTitle>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                        <span className="text-slate-500">Recouvrement sain</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="h-[320px] w-full">
                    {isLoading ? (
                        <div className="h-full w-full flex items-end gap-6 p-6">
                            <Skeleton className="h-[20%] w-full" />
                            <Skeleton className="h-[40%] w-full" />
                            <Skeleton className="h-[30%] w-full" />
                            <Skeleton className="h-[10%] w-full" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                    tickFormatter={(val) => Math.abs(val) > 999 ? `${val / 1000}k` : val}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                                    {chartData.map((_, index) => {
                                        // Color logic: more red as it gets older
                                        const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
                                        return <Cell key={`cell-${index}`} fill={colors[index]} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="mt-4 flex justify-center">
                    <p className="text-[10px] text-slate-400 font-medium italic">Répartition des créances par ancienneté (données réelles)</p>
                </div>
            </CardContent>
        </Card>
    );
}
