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

interface TableVisualProps {
    kpiKey: string;
    isCompact?: boolean;
}

export function TableVisual({ kpiKey, isCompact }: TableVisualProps) {
    const { data: kpiData, isLoading } = useKpiData(kpiKey);

    if (isLoading) {
        return (
            <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    // Extraction des données du format KPI
    const rawItems = kpiData?.details?.items || kpiData?.details || [];
    const items = Array.isArray(rawItems) ? rawItems : [];

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 italic text-sm py-8">
                Aucune donnée dynamique disponible
            </div>
        );
    }

    // Déterminer les colonnes dynamiquement à partir du premier élément
    const columns = Object.keys(items[0]).filter(key => 
        !['id', 'key', '_id'].includes(key.toLowerCase())
    );

    const formatValue = (value: any) => {
        if (value === null || value === undefined) return '-';
        
        // Nettoyage des nombres (ex: 123.000000 -> 123)
        if (typeof value === 'number' || (!isNaN(Number(value)) && typeof value === 'string' && value.includes('.'))) {
            const num = Number(value);
            return num.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
        }
        
        return String(value);
    };

    const isNumericColumn = (key: string, value: any) => {
        const k = key.toLowerCase();
        return typeof value === 'number' || 
               k.includes('montant') || 
               k.includes('total') || 
               k.includes('solde') || 
               k.includes('debit') || 
               k.includes('credit') ||
               k.includes('ca');
    };

    if (isCompact) {
        return (
            <div className="flex flex-col h-full justify-center space-y-2">
                {items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex flex-col border-b border-slate-50 dark:border-slate-800/50 pb-1 last:border-0">
                        <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                {formatValue(Object.values(item)[0])}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 font-black">
                                {formatValue(Object.values(item)[1])}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto scrollbar-thin">
                <Table>
                    <TableHeader className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
                        <TableRow className="hover:bg-transparent border-b dark:border-slate-800/50">
                            {columns.map((column) => (
                                <TableHead 
                                    key={column} 
                                    className={`font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase whitespace-nowrap px-4 py-3 ${
                                        isNumericColumn(column, items[0][column]) ? 'text-right' : 'text-left'
                                    }`}
                                >
                                    {column.replace(/_/g, ' ')}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, rowIndex) => (
                            <TableRow 
                                key={rowIndex} 
                                className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                            >
                                {columns.map((column) => {
                                    const value = item[column];
                                    const numeric = isNumericColumn(column, value);
                                    return (
                                        <TableCell 
                                            key={column} 
                                            className={`py-3 px-4 text-sm font-medium ${
                                                numeric 
                                                    ? 'text-right font-mono text-slate-900 dark:text-slate-200' 
                                                    : 'text-left text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            {formatValue(value)}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
