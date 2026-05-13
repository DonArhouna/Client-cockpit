import { useKpiData } from '@/hooks/use-kpi-data';
import { useFilters } from '@/context/FilterContext';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapVisualProps {
    kpiKey: string;
    isCompact?: boolean;
}

const RANK_COLORS = ['#3b66ac', '#4f7ec4', '#6596dc', '#7aacec', '#94bcf4'];

function formatVal(val: number): string {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return val.toLocaleString('fr-FR');
}

export function MapVisual({ kpiKey, isCompact }: MapVisualProps) {
    const { currency } = useFilters();
    const currencySymbol = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';
    const { data: kpiData, isLoading } = useKpiData(kpiKey);

    if (isLoading) {
        return (
            <div className="flex flex-col h-full w-full gap-3 justify-center items-center p-4">
                <Skeleton className={cn('w-full rounded-xl', isCompact ? 'h-16' : 'h-40')} />
            </div>
        );
    }

    const raw = kpiData?.details?.items ?? kpiData?.details;
    const items: any[] = Array.isArray(raw) ? raw : [];

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 italic text-xs py-8">
                Aucune donnée disponible
            </div>
        );
    }

    const firstItem = items[0];
    const allKeys = Object.keys(firstItem).filter(k => k !== '');
    const stringKeys = allKeys.filter(k => typeof firstItem[k] === 'string' && isNaN(Number(firstItem[k])));
    const numericKeys = allKeys.filter(k => !isNaN(parseFloat(firstItem[k])));
    const hasRegions = items.length > 1 && stringKeys.length > 0;

    // No geographic breakdown — show aggregate + warning
    if (!hasRegions) {
        const valueKey = numericKeys[0] ?? allKeys[0];
        const total = valueKey ? parseFloat(firstItem[valueKey]) || 0 : 0;
        const formatted = formatVal(total);

        return (
            <div className="flex flex-col h-full items-center justify-center gap-3 p-4">
                {!isCompact && (
                    <div className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 w-full">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Données sans découpage géographique — carte indisponible</span>
                    </div>
                )}
                <span className={cn('font-black tabular-nums text-slate-900 dark:text-slate-100 tracking-tight', isCompact ? 'text-2xl' : 'text-4xl')}>
                    {formatted} <span className="text-primary text-[0.5em]">{currencySymbol}</span>
                </span>
                {!isCompact && (
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> {valueKey?.replace(/_/g, ' ') ?? 'Total'}
                    </span>
                )}
            </div>
        );
    }

    // Ranked bar list by region
    const nameKey = stringKeys[0];
    const valueKey = numericKeys[0];
    const sorted = [...items].sort((a, b) => (parseFloat(b[valueKey]) || 0) - (parseFloat(a[valueKey]) || 0));
    const maxVal = parseFloat(sorted[0]?.[valueKey]) || 1;
    const total = sorted.reduce((acc, i) => acc + (parseFloat(i[valueKey]) || 0), 0);

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="flex-1 overflow-auto flex flex-col gap-1.5 pr-1">
                {sorted.map((item, idx) => {
                    const val = parseFloat(item[valueKey]) || 0;
                    const pct = (val / maxVal) * 100;
                    const color = RANK_COLORS[Math.min(idx, RANK_COLORS.length - 1)];
                    return (
                        <div key={idx} className="flex items-center gap-2 text-[11px] group">
                            <span className="w-4 shrink-0 text-center text-[9px] font-bold text-slate-400 tabular-nums">{idx + 1}</span>
                            <span className="w-[80px] shrink-0 truncate text-slate-700 dark:text-slate-300 font-semibold" title={item[nameKey]}>
                                {item[nameKey]}
                            </span>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${pct}%`, backgroundColor: color }}
                                />
                            </div>
                            <span className="w-[60px] shrink-0 text-right text-slate-600 dark:text-slate-400 tabular-nums font-medium">
                                {formatVal(val)}
                            </span>
                        </div>
                    );
                })}
            </div>
            {!isCompact && (
                <div className="pt-2 mt-2 border-t dark:border-slate-800/50 flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400 shrink-0">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {sorted.length} régions</span>
                    <span className="text-slate-700 dark:text-slate-200">{formatVal(total)} {currencySymbol}</span>
                </div>
            )}
        </div>
    );
}
