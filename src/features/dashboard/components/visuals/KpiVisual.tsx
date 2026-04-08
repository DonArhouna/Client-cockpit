import { 
    Loader2, 
    Wallet, 
    Users, 
    Truck, 
    Package, 
    FileText, 
    ShieldAlert, 
    BrainCircuit,
    ArrowUpRight,
    ArrowDownRight,
    Target as TargetIcon
} from 'lucide-react';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useTargets } from '@/hooks/use-api';
import { useFilters } from '@/context/FilterContext';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface KpiVisualProps {
    widget: {
        id?: string;
        name: string;
        config?: Record<string, any>;
        kpiKey?: string | null;
    };
    isCompact?: boolean;
}

const DANGER = '#ef4444';

const getDomainInfo = (kpiKey: string = '') => {
    const k = kpiKey.toLowerCase();
    if (k.includes('ca') || k.includes('revenue') || k.includes('vente') || k.includes('vendu')) {
        return { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/5' };
    }
    if (k.includes('client')) {
        return { icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/5' };
    }
    if (k.includes('tresorerie') || k.includes('cash') || k.includes('solde') || k.includes('finance') || k.includes('dso') || k.includes('dpo') || k.includes('banque')) {
        return { icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-blue-500/5' };
    }
    if (k.includes('achat') || k.includes('fournisseur') || k.includes('dmp') || k.includes('appro')) {
        return { icon: Truck, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20', glow: 'shadow-violet-500/5' };
    }
    if (k.includes('stock') || k.includes('article') || k.includes('inventaire') || k.includes('depot')) {
        return { icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/5' };
    }
    if (k.includes('risque') || k.includes('alerte') || k.includes('impaye') || k.includes('retard')) {
        return { icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/5' };
    }
    if (k.includes('prevision') || k.includes('ml') || k.includes('ia') || k.includes('prediction') || k.includes('intelligent')) {
        return { icon: BrainCircuit, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', glow: 'shadow-fuchsia-500/5' };
    }
    return { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', glow: 'shadow-slate-500/5' };
};

const TrendingUp = ({ className }: { className?: string }) => <ArrowUpRight className={className} />;

export function KpiVisual({ widget, isCompact }: KpiVisualProps) {
    const { currency } = useFilters();
    const { data: kpiData, isLoading } = useKpiData(widget.kpiKey || null);
    const { data: allTargets } = useTargets({ kpiKey: widget.kpiKey ?? undefined });

    const currencySymbol = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';
    const k = widget.kpiKey?.toLowerCase() ?? '';
    const isDelayMetric = k.includes('dso') || k.includes('dmp') || k.includes('dpo');

    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 text-primary animate-spin opacity-30" />
                <span className="text-[10px] text-muted-foreground">Analyse en cours…</span>
            </div>
        );
    }

    const domain = getDomainInfo(widget.kpiKey || '');
    const Icon = domain.icon;

    const currentValue = kpiData?.current ?? 0;
    const previousValue = kpiData?.previous ?? 0;
    const trend = kpiData?.trend ?? 0;
    const backendTarget = kpiData?.target ?? null;
    const targetValue = backendTarget
        ?? allTargets?.find((t: any) => t.kpiKey === widget.kpiKey)?.value
        ?? null;

    const isPositiveTrend = isDelayMetric ? trend <= 0 : trend >= 0;

    const formatValue = (val: number) => {
        if (isDelayMetric) return `${Math.round(val)} j`;
        if (k.includes('margin') || k.includes('rate') || k.includes('taux')) return `${val.toFixed(1)}%`;
        if (k.includes('nb_') || k.includes('count')) return val.toLocaleString('fr-FR');
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ${currencySymbol}`;
        if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k ${currencySymbol}`;
        return `${val.toLocaleString('fr-FR')} ${currencySymbol}`;
    };

    const targetProgress = targetValue && targetValue > 0
        ? Math.min(Math.round((currentValue / targetValue) * 100), 100)
        : null;

    const rawItems = kpiData?.details?.items ?? kpiData?.details ?? [];
    const sparkItems = (Array.isArray(rawItems) ? rawItems.slice(-8) : []).map((it: any) => ({
        v: it.revenue ?? it.CA ?? it.amount ?? it.value ?? 0
    }));
    const hasSparkline = sparkItems.length >= 3;

    // ── COMPACT ──────────────────────────────────────────────────
    if (isCompact) {
        return (
            <div className="flex flex-col h-full gap-2">
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <div className={`p-1 rounded-md ${domain.bg} ${domain.color} shrink-0`}>
                            <Icon size={12} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider">
                            {widget.name}
                        </span>
                    </div>
                    <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-black ${isPositiveTrend ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isPositiveTrend ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                        {Math.abs(trend).toFixed(0)}%
                    </div>
                </div>
                
                <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100 tabular-nums leading-tight tracking-tight">
                        {formatValue(currentValue)}
                    </span>
                    {previousValue > 0 && (
                        <span className="text-[9px] text-slate-400 font-medium truncate">vs {formatValue(previousValue)}</span>
                    )}
                </div>

                {targetProgress !== null && (
                    <div className="mt-1 space-y-1">
                         <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="text-slate-400 uppercase">Obj.</span>
                            <div className="flex gap-1.5">
                                <span className={targetProgress >= 100 ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'}>{targetProgress}%</span>
                                <span className="text-slate-400 font-medium">/ {formatValue(targetValue!)}</span>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${targetProgress}%` }} />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── FULL ─────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl ${domain.bg} ${domain.color} shadow-md transition-transform group-hover:scale-105 duration-300 shrink-0`}>
                        <Icon size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">
                            {widget.name}
                        </h4>
                        <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums leading-none tracking-tight">
                            {formatValue(currentValue)}
                        </span>
                        {previousValue > 0 && (
                            <span className="text-[10px] font-semibold text-slate-400 mt-1.5 flex items-center gap-1.5">
                                <span className={isPositiveTrend ? 'text-emerald-500' : 'text-rose-500'}>
                                    {isPositiveTrend ? '+' : '-'}{Math.abs(trend).toFixed(1)}%
                                </span>
                                vs N-1 ({formatValue(previousValue)})
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {hasSparkline && (
                <div className="w-full h-10 -mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkItems}>
                            <defs>
                                <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={isPositiveTrend ? '#10b981' : DANGER} stopOpacity={0.1}/>
                                    <stop offset="100%" stopColor={isPositiveTrend ? '#10b981' : DANGER} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="v" 
                                stroke={isPositiveTrend ? '#10b981' : DANGER} 
                                strokeWidth={2} 
                                fill={`url(#grad-${widget.id})`} 
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {targetProgress !== null && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider">
                            <TargetIcon size={12} className="text-slate-400" />
                            Progression Objectif
                        </div>
                        <div className="font-black tabular-nums flex gap-2">
                            <span className={targetProgress >= 100 ? 'text-emerald-500' : 'text-slate-900 dark:text-slate-100'}>
                                {targetProgress}%
                            </span>
                            <span className="text-slate-400">/ {formatValue(targetValue!)}</span>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${targetProgress >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                            style={{ width: `${targetProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
