import { TrendingUp, TrendingDown, Target, Euro, Users, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';

export function RevenueKpiGrid() {
    const { data: caHt, isLoading: isLoadingCa } = useKpiData('f01_ca_ht');
    const { data: growth, isLoading: isLoadingGrowth } = useKpiData('f10_variation_ca');
    const { data: avgDeal, isLoading: isLoadingAvg } = useKpiData('c02_ca_moyen_par_client');
    const { data: activeClients, isLoading: isLoadingClients } = useKpiData('c01_nb_clients_actifs');

    const formatCurrency = (val: any) => {
        const num = Number(val?.value || val);
        if (isNaN(num)) return "0 €";
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
    };

    const formatPercent = (val: any) => {
        const num = Number(val?.value || val);
        if (isNaN(num)) return "0%";
        return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
    };

    const formatNumber = (val: any) => {
        const num = Number(val?.value || val);
        if (isNaN(num)) return "0";
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    return (
        <div className="space-y-6">
            {/* Primary KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Chiffre d'Affaires Total"
                    value={isLoadingCa ? "..." : formatCurrency(caHt)}
                    subtitle="vs période précédente"
                    trend={isLoadingCa ? "" : "+12.5%"} // Trend might need another KPI or calculation
                    trendIsPositive={true}
                    icon={Euro}
                    iconBg="bg-blue-900"
                    isLoading={isLoadingCa}
                />
                <KpiCard
                    title="Variation CA vs N-1"
                    value={isLoadingGrowth ? "..." : formatPercent(growth)}
                    subtitle="vs même période N-1"
                    trend={isLoadingGrowth ? "" : "+2.3%"}
                    trendIsPositive={true}
                    icon={TrendingUp}
                    iconBg="bg-emerald-500"
                    isLoading={isLoadingGrowth}
                />
                <KpiCard
                    title="CA Moyen par Client"
                    value={isLoadingAvg ? "..." : formatCurrency(avgDeal)}
                    subtitle="vs trimestre précédent"
                    trend={isLoadingAvg ? "" : "-3.2%"}
                    trendIsPositive={false}
                    icon={Target}
                    iconBg="bg-blue-600"
                    isLoading={isLoadingAvg}
                />
                <KpiCard
                    title="Clients Actifs"
                    value={isLoadingClients ? "..." : formatNumber(activeClients)}
                    subtitle="Base clients active"
                    trend={isLoadingClients ? "" : "+5.1%"}
                    trendIsPositive={true}
                    icon={Users}
                    iconBg="bg-amber-500"
                    isLoading={isLoadingClients}
                />
            </div>

            {/* Net Growth Summary (shown below Waterfall in design, but we'll include here for structure) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SecondaryKpiCard
                    title="Croissance Totale"
                    value="395 000 €"
                    details="Nouveaux clients + Expansion"
                    icon={TrendingUp}
                    color="text-emerald-500"
                />
                <SecondaryKpiCard
                    title="Pertes Totales"
                    value="145 000 €"
                    details="Churn + Contraction"
                    icon={TrendingDown}
                    color="text-rose-500"
                />
                <SecondaryKpiCard
                    title="Croissance Nette"
                    value="250 000 €"
                    details="Variation période"
                    icon={PlusCircle}
                    color="text-blue-900"
                />
            </div>
        </div>
    );
}

function KpiCard({ title, value, subtitle, trend, trendIsPositive, icon: Icon, iconBg, isLoading }: any) {
    return (
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2.5 rounded-xl text-white shadow-lg", iconBg)}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {!isLoading && trend && (
                        <div className={cn(
                            "flex items-center gap-1.5 text-sm font-bold",
                            trendIsPositive ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {trendIsPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {trend}
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                    {isLoading ? (
                        <Skeleton className="h-8 w-3/4" />
                    ) : (
                        <p className="text-2xl font-black text-slate-900">{value}</p>
                    )}
                    <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function SecondaryKpiCard({ title, value, details, icon: Icon, color }: any) {
    return (
        <Card className="border-slate-100 shadow-sm bg-white">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg bg-slate-50", color)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <p className={cn("text-sm font-bold", color)}>{title}</p>
                        <p className="text-2xl font-black text-slate-900">{value}</p>
                        <p className="text-xs text-slate-500 font-medium">{details}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
