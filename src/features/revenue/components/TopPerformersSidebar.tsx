import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';

export function TopPerformersSidebar() {
    const { data: rawClients, isLoading } = useKpiData('top10_clients_ca');

    // Transform raw data to performers format
    const performers = Array.isArray(rawClients) ? rawClients.map((item: any, idx: number) => ({
        id: idx + 1,
        name: item.Client_ID || `Client ${item.Client_ID}`,
        value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.CA_Client),
        share: `${((item.CA_Client / (rawClients.reduce((acc, curr) => acc + curr.CA_Client, 0))) * 100).toFixed(1)}% du total`,
        trend: '+0.0%', // Trend not available in this KPI
        positive: true
    })) : [];

    return (
        <Card className="border-slate-100 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg font-bold text-slate-900">Top Performers</CardTitle>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button className="px-3 py-1 text-[10px] font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all">Produits</button>
                        <button className="px-3 py-1 text-[10px] font-bold rounded-md bg-white shadow-sm text-blue-900 transition-all">Clients</button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-8 overflow-y-auto">
                {/* List of performers */}
                <div className="space-y-4">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-4 flex-1">
                                    <Skeleton className="h-4 w-4" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-2 w-1/3" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))
                    ) : (
                        performers.map((item) => (
                            <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-black text-slate-300 group-hover:text-blue-900 transition-colors w-4">{item.id}</span>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-slate-700 truncate w-32">{item.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{item.share}</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-xs font-black text-slate-900">{item.value}</p>
                                    <div className={cn(
                                        "flex items-center justify-end gap-1 text-[10px] font-bold",
                                        item.positive ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {item.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {item.trend}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Distribution chart segment */}
                {!isLoading && performers.length > 0 && (
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Distribution des Revenus - Clients</h4>
                        </div>

                        <div className="space-y-4">
                            {performers.slice(0, 4).map((item, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-600">
                                        <span className="truncate pr-2">{item.name}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-900 rounded-full transition-all duration-1000"
                                            style={{ width: item.share }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total clients: {performers.length}</span>
                    <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-blue-900 transition-colors uppercase tracking-wider">
                        <ExternalLink className="h-3 w-3" />
                        Voir tout
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
