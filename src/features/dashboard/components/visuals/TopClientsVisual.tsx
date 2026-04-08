import { useFilters } from '@/context/FilterContext';
import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface TopClientsVisualProps {
    isCompact?: boolean;
    kpiKey?: string;
}

export function TopClientsVisual({ isCompact, kpiKey = 'c03_top10_clients_ca' }: TopClientsVisualProps) {
    const { currency } = useFilters();
    const { data: kpiData, isLoading } = useKpiData(kpiKey);
    const currencySymbol = currency === 'XOF' ? 'F' : currency === 'EUR' ? '€' : '$';

    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        );
    }

    const rawItems = kpiData?.details?.items || kpiData?.details || [];
    const items = Array.isArray(rawItems) ? rawItems : [];

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                Aucune donnée disponible
            </div>
        );
    }

    // ── INTELLIGENT MAPPING ───────────────────────────────────────
    // On analyse les clés du premier item pour deviner les colonnes
    const firstItem = items[0];
    const keys = Object.keys(firstItem);

    // 1. Détecter la clé du NOM (ex: client, nom, intitule, tiers, label)
    const nameKey = keys.find(k => {
        const l = k.toLowerCase();
        return l.includes('client') || l.includes('nom') || l.includes('intitule') || l.includes('tiers') || l.includes('label') || l.includes('raison');
    }) || keys.find(k => typeof firstItem[k] === 'string') || keys[0];

    // 2. Détecter la clé du MONTANT / CA (ex: ca, montant, total, amount, value, revenue, ht)
    const valueKey = keys.find(k => {
        const l = k.toLowerCase();
        return (l.includes('ca') || l.includes('montant') || l.includes('total') || l.includes('amount') || l.includes('value') || l.includes('revenue') || l.includes('ht') || l.includes('solde')) && k !== nameKey;
    }) || keys.find(k => typeof firstItem[k] === 'number') || keys[1];

    // 3. Détecter une clé secondaire (ex: encours, pending, risque, secteur)
    const secondaryKey = keys.find(k => {
        const l = k.toLowerCase();
        return (l.includes('encours') || l.includes('pending') || l.includes('risque') || l.includes('secteur') || l.includes('ville')) && k !== nameKey && k !== valueKey;
    });

    const formatValue = (v: any) => {
        if (typeof v === 'number') return v.toLocaleString();
        return v || '-';
    };

    const getRiskStyles = (risk: string) => {
        const r = risk?.toLowerCase() || '';
        if (r.includes('faible') || r.includes('bas') || r.includes('low') || r.includes('bon')) 
            return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400';
        if (r.includes('moyen') || r.includes('medium') || r.includes('modere')) 
            return 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400';
        if (r.includes('eleve') || r.includes('haut') || r.includes('high') || r.includes('critique') || r.includes('fort')) 
            return 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400';
        return 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    };

    if (isCompact) {
        return (
            <div className="flex flex-col h-full justify-center space-y-3">
                {items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-2 last:border-0 last:pb-0">
                        <div className="min-w-0">
                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                                {item[nameKey]}
                            </div>
                            {secondaryKey && (
                                <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate lowercase opacity-70">
                                    {item[secondaryKey]}
                                </div>
                            )}
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-[11px] font-black text-slate-900 dark:text-white">
                                {formatValue(item[valueKey])}{currencySymbol}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">

            <div className="flex-1 w-full overflow-auto scrollbar-thin">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b dark:border-slate-800/50">
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase">{nameKey.replace(/_/g, ' ')}</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase text-right">{valueKey.replace(/_/g, ' ')}</TableHead>
                            {secondaryKey && (
                                <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase text-center">{secondaryKey.replace(/_/g, ' ')}</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, idx) => (
                            <TableRow key={idx} className="group border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <TableCell className="py-2.5">
                                    <div className="font-bold text-slate-900 dark:text-slate-200 text-sm">{item[nameKey]}</div>
                                </TableCell>
                                <TableCell className="py-2.5 text-right font-black text-slate-900 dark:text-white text-sm">
                                    {formatValue(item[valueKey])}{currencySymbol}
                                </TableCell>
                                {secondaryKey && (
                                    <TableCell className="py-2.5 text-center">
                                        {secondaryKey.toLowerCase().includes('risque') ? (
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${getRiskStyles(item[secondaryKey])}`}>
                                                {item[secondaryKey]}
                                            </span>
                                        ) : (
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {formatValue(item[secondaryKey])}
                                            </span>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
