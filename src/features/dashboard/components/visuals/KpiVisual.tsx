import { TrendingUp, TrendingDown, DollarSign, Clock, PieChart, Activity, Loader2, Sparkles } from 'lucide-react';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useFilters } from '@/context/FilterContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KpiVisualProps {
    widget: {
        id?: string;
        name: string;
        config?: Record<string, any>;
        kpiKey?: string | null;
    };
    isCompact?: boolean;
}

export function KpiVisual({ widget, isCompact }: KpiVisualProps) {
    const { currency } = useFilters();
    const { data: kpiData, isLoading } = useKpiData(widget.kpiKey || null);

    const currencySymbol = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';

    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin opacity-20" />
            </div>
        );
    }

    // Extraire les données normalisées
    const currentValue = kpiData?.current || 0;
    const previousValue = kpiData?.previous || 0;
    const target = kpiData?.target || null;
    const trend = kpiData?.trend || 0;
    const isPositive = trend >= 0;

    // Formater les valeurs selon le type de KPI
    const formatValue = (val: number) => {
        if (widget.kpiKey?.includes('dso') || widget.kpiKey?.includes('dmp') || widget.kpiKey?.includes('dpo')) {
            return `${val.toFixed(0)} j`;
        }
        if (widget.kpiKey?.includes('margin') || widget.kpiKey?.includes('rate')) {
            return `${val.toFixed(1)}%`;
        }
        // Valeurs de comptage (pas de devise)
        if (widget.kpiKey?.toLowerCase().includes('nb_') || widget.kpiKey?.toLowerCase().includes('count')) {
            return val.toLocaleString();
        }
        // Valeurs monétaires
        if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)}M ${currencySymbol}`;
        }
        return `${val.toLocaleString()} ${currencySymbol}`;
    };

    // Icône selon le type de KPI
    let Icon = Activity;
    if (widget.kpiKey?.includes('revenue') || widget.kpiKey?.includes('ca')) Icon = TrendingUp;
    if (widget.kpiKey?.includes('cashflow') || widget.kpiKey?.includes('tresorerie')) Icon = DollarSign;
    if (widget.kpiKey?.includes('margin') || widget.kpiKey?.includes('marge')) Icon = PieChart;
    if (widget.kpiKey?.includes('dso') || widget.kpiKey?.includes('dmp') || widget.kpiKey?.includes('dpo') || widget.kpiKey?.includes('delay') || widget.kpiKey?.includes('rotating')) Icon = Clock;

    const isDebt = widget.kpiKey?.includes('dettes') || widget.kpiKey?.includes('payable');
    const isCredit = widget.kpiKey?.includes('creances') || widget.kpiKey?.includes('receivable');

    return (
        <div className="flex flex-col h-full justify-between pb-1 pt-0 overflow-hidden relative">
            {/* Labels flottants comme DMP */}
            {!isCompact && widget.kpiKey?.includes('dmp') && (
                <div className="absolute top-0 right-0 text-[10px] font-bold text-slate-900 dark:text-white z-10">
                    DMP moyen: 42 jours
                </div>
            )}
            <div className={cn("flex flex-col", isCompact ? "gap-1" : "gap-4")}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className={cn("text-blue-600 dark:text-blue-400", isCompact ? "h-4 w-4" : "h-5 w-5")} />
                        <span className={cn("font-semibold text-slate-500 dark:text-slate-400 leading-tight", isCompact ? "text-[11px]" : "text-sm")}>
                            {widget.name}
                        </span>
                    </div>
                    {!isCompact && (
                        <div className={cn(
                            "flex items-center gap-1 font-bold text-sm",
                            isPositive ? 'text-green-500' : 'text-red-500'
                        )}>
                            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            <span>{isPositive ? '+' : ''}{trend.toFixed(1)}%</span>
                        </div>
                    )}
                </div>

                <div className={cn("flex flex-col", isCompact ? "gap-1" : "gap-3")}>
                    <div className="flex items-baseline gap-2">
                        <span className={cn("font-bold text-slate-900 dark:text-slate-100 italic", isCompact ? "text-xl" : "text-3xl")}>
                            {formatValue(currentValue)}
                        </span>
                        {isCompact && (
                            <div className={cn(
                                "flex items-center gap-0.5 font-bold text-[10px]",
                                isPositive ? 'text-green-500' : 'text-red-500'
                            )}>
                                {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                                <span>{trend.toFixed(0)}%</span>
                            </div>
                        )}
                    </div>

                    {!isCompact && (
                        <div className="space-y-1">
                            {isDebt && kpiData?.details?.dettes_fournisseurs !== undefined && (
                                <div className="text-[13px] font-medium transition-colors">
                                    <span className="text-slate-900 dark:text-slate-100 font-semibold">Dettes fournisseurs:</span>{' '}
                                    <span className="text-orange-500">{formatValue(kpiData.details.dettes_fournisseurs)}</span>
                                </div>
                            )}
                            {isCredit && kpiData?.details?.creances_fournisseurs !== undefined && (
                                <div className="text-[13px] font-medium">
                                    <span className="text-slate-900 dark:text-slate-100 font-semibold">Créances fournisseurs:</span>{' '}
                                    <span className="text-orange-500">{formatValue(kpiData.details.creances_fournisseurs)}</span>
                                </div>
                            )}

                            {target && (
                                <div className="text-[13px] font-medium">
                                    <span className="text-slate-900 dark:text-slate-100 font-semibold">{isCredit ? 'Objectif balance :' : 'Objectif:'}</span>{' '}
                                    <span className="text-green-600 dark:text-green-500">{formatValue(target)}</span>
                                </div>
                            )}

                            {previousValue > 0 && (
                                <div className="text-[13px] font-medium">
                                    <span className="text-slate-900 dark:text-slate-100 font-semibold">Mois Préc. :</span>{' '}
                                    <span className="text-red-500">{formatValue(previousValue)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end mt-auto pt-1">
                {isCompact ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-full"
                    >
                        <Sparkles className="h-3 w-3" />
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        size="sm"
                        className="h-7 text-[11px] font-bold bg-[#3b66ac] hover:bg-[#2d5089] text-white px-4 rounded-md shadow-sm transition-all border-none"
                    >
                        AI - Une question ?
                    </Button>
                )}
            </div>
        </div>
    );
}

