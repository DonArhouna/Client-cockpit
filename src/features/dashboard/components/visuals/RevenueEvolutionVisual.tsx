import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Filter, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueEvolutionVisualProps {
    isCompact?: boolean;
}

export function RevenueEvolutionVisual({ isCompact }: RevenueEvolutionVisualProps) {
    const { currency } = useFilters();
    const { data: rawData, isLoading } = useKpiData('revenue_monthly'); // Assumed monthly data KPI
    const currencySymbol = currency === 'XOF' ? 'F' : currency === 'EUR' ? '€' : '$';

    // Process data to match chart format
    const chartData = Array.isArray(rawData) ? rawData.map((item: any) => ({
        month: item.month || item.Month || item.periode || '?',
        revenue: item.revenue || item.CA || item.amount || 0
    })) : [];

    // Fallback if data is empty (only for visual stability during dev if backend KPI is missing)
    const displayData = chartData.length > 0 ? chartData : [
        { month: 'Jan', revenue: 0 },
        { month: 'Fév', revenue: 0 },
        { month: 'Mar', revenue: 0 },
        { month: 'Avr', revenue: 0 },
        { month: 'Mai', revenue: 0 },
        { month: 'Juin', revenue: 0 },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col h-full w-full justify-center items-center gap-4">
                <Skeleton className="h-[80%] w-full" />
                <Skeleton className="h-4 w-1/3" />
            </div>
        );
    }

    if (isCompact) {
        return (
            <div className="flex flex-col h-full w-full">
                <div className="flex-1 w-full min-h-[60px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={displayData} margin={{ top: 5, right: 5, left: -40, bottom: 0 }}>
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#1e40af"
                                strokeWidth={2}
                                fillOpacity={0.1}
                                fill="#1e40af"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-4">
                <div></div>
                <div className="flex items-center gap-4 text-sm z-10 relative">
                    <div className="flex items-center bg-slate-100 rounded-md p-0.5">
                        <button className="px-3 py-1 bg-white shadow-sm rounded-sm font-medium text-slate-700 font-bold">CA</button>
                        <button className="px-3 py-1 text-slate-500 hover:text-slate-700 font-medium">Charges</button>
                    </div>
                    <div className="flex items-center gap-1 border-l pl-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary bg-primary/10">
                            <TrendingUp className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} dy={10} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                            tickFormatter={(value) => `${value}K`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`${value}K ${currencySymbol}`, 'CA']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#1e3a8a"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRev)"
                            activeDot={{ r: 6, fill: '#1e40af', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
