import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';

export function EvolutionRevenueChart() {
    const { data: rawData, isLoading } = useKpiData('k03_ca_par_axe_analytique');

    const chartData = Array.isArray(rawData) ? rawData.map((item: any) => ({
        name: item.Axe_Analytique || item.Section_Analytique || "Inconnu",
        revenue: item.CA || 0,
        // Since we don't have growth per axis, we'll omit or use a placeholder
        growth: 0
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 8) : [];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Répartition par Axe Analytique</CardTitle>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button className="px-3 py-1 text-[10px] font-bold uppercase rounded-md bg-white shadow-sm text-blue-900 transition-all">Axe</button>
                    <button className="px-3 py-1 text-[10px] font-bold uppercase rounded-md text-slate-500 hover:text-slate-700 transition-all">Section</button>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="h-[320px] w-full">
                    {isLoading ? (
                        <div className="h-full w-full flex flex-col justify-end gap-2 p-4">
                            <div className="flex items-end gap-4 h-full">
                                <Skeleton className="h-[40%] w-12" />
                                <Skeleton className="h-[70%] w-12" />
                                <Skeleton className="h-[90%] w-12" />
                                <Skeleton className="h-[60%] w-12" />
                                <Skeleton className="h-[80%] w-12" />
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={chartData}
                                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
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
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [formatCurrency(value), 'Chiffre d\'Affaires']}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#1e3a8a"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="mt-4 flex justify-center">
                    <p className="text-[10px] text-slate-400 font-medium italic">Données analytiques récupérées en temps réel</p>
                </div>
            </CardContent>
        </Card>
    );
}
