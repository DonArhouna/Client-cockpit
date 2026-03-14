import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
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

    // Extraction des données du format KPI
    const rawItems = kpiData?.details?.items || kpiData?.details || [];
    const items = Array.isArray(rawItems) ? rawItems : [];

    const clients = items.map((item: any) => ({
        id: item.id || item.Client_ID || Math.random(),
        name: item.Nom_Client || item.client || item.Client || item.name || item.label || 'Inconnu',
        sector: item.Secteur || item.sector || '-',
        ca: item.CA || item.amount || item.value || 0,
        pending: item.Encours || item.pending || 0,
        growth: item.Croissance || item.growth || '0%',
        margin: item.Marge || item.margin || '-',
        dso: item.DSO || item.dso || '-',
        risk: item.Risque || item.risk || 'Faible'
    }));

    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        );
    }

    const displayClients = clients.length > 0 ? clients : [];

    if (displayClients.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                Aucune donnée disponible
            </div>
        );
    }

    if (isCompact) {
        return (
            <div className="flex flex-col h-full justify-center space-y-3">
                {displayClients.slice(0, 3).map((client) => (
                    <div key={client.id} className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                        <div className="min-w-0">
                            <div className="text-[11px] font-bold text-slate-800 truncate">{client.name}</div>
                            <div className="text-[9px] text-slate-400 truncate">{client.sector}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-[11px] font-black text-slate-900">{client.ca.toLocaleString()}{currencySymbol}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-4">
                <div></div>
                <div className="flex items-center gap-2 text-sm z-10 relative">
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-slate-500 hover:text-slate-800 font-bold">
                        <Filter className="h-4 w-4" />
                        Filtrer
                    </Button>
                </div>
            </div>

            <div className="flex-1 w-full overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-slate-700 text-xs uppercase">Client</TableHead>
                            <TableHead className="font-bold text-slate-700 text-xs uppercase">CA</TableHead>
                            <TableHead className="font-bold text-slate-700 text-xs uppercase text-right">Encours</TableHead>
                            <TableHead className="font-bold text-slate-700 text-xs uppercase text-center">Risque</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayClients.map((client) => (
                            <TableRow key={client.id} className="group border-b border-slate-50 hover:bg-slate-50/50">
                                <TableCell className="py-2">
                                    <div className="font-bold text-slate-900 text-sm">{client.name}</div>
                                    <div className="text-[10px] text-slate-400">{client.sector}</div>
                                </TableCell>
                                <TableCell className="py-2 font-black text-slate-900 text-sm">
                                    {client.ca.toLocaleString()}{currencySymbol}
                                </TableCell>
                                <TableCell className="py-2 text-right font-medium text-slate-600 text-sm">
                                    {client.pending.toLocaleString()}{currencySymbol}
                                </TableCell>
                                <TableCell className="py-2 text-center">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${client.risk === 'Faible' ? 'bg-emerald-50 text-emerald-600' :
                                        client.risk === 'Moyen' ? 'bg-orange-50 text-orange-600' :
                                            'bg-red-50 text-red-600'
                                        }`}>
                                        {client.risk}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
