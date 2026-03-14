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

    if (isCompact) {
        return (
            <div className="flex flex-col h-full justify-center space-y-2">
                {items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex flex-col border-b border-slate-50 pb-1 last:border-0">
                        <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-slate-800 truncate">
                                {Object.values(item)[0] as string}
                            </span>
                            <span className="text-slate-500 font-black">
                                {typeof Object.values(item)[1] === 'number' 
                                    ? (Object.values(item)[1] as number).toLocaleString() 
                                    : Object.values(item)[1] as string}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex-1 w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        {columns.map(col => (
                            <TableHead key={col} className="font-bold text-slate-700 text-xs uppercase px-2 py-3">
                                {col.replace(/_/g, ' ')}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item, idx) => (
                        <TableRow key={idx} className="group border-b border-slate-50 hover:bg-slate-50/50">
                            {columns.map(col => (
                                <TableCell key={`${idx}-${col}`} className="py-2.5 px-2 text-sm text-slate-600">
                                    {typeof item[col] === 'number' 
                                        ? item[col].toLocaleString() 
                                        : (item[col] || '-')}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
