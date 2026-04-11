import { useKpiData } from '@/hooks/use-kpi-data';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/shared/DataTable';
import { Widget } from '@/types';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface TableVisualProps {
    pageId: string;
    widget: Widget;
    isCompact?: boolean;
}

/**
 * Visualisation Tabulaire Avancée
 * Utilise DataTable pour supporter le DND, le renommage et la visibilité.
 * Sauvegarde les réglages dans widget.config.tableSettings.
 */
export function TableVisual({ pageId, widget, isCompact }: TableVisualProps) {
    const { updateWidgetConfig } = usePersonalization();
    const { data: kpiData, isLoading } = useKpiData(widget.kpiKey || '');

    // Extraction des données du format KPI
    const items = useMemo(() => {
        const rawItems = kpiData?.details?.items || kpiData?.details || [];
        return Array.isArray(rawItems) ? rawItems : [];
    }, [kpiData]);

    const formatValue = (value: any) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'number' || (!isNaN(Number(value)) && typeof value === 'string' && value.includes('.'))) {
            const num = Number(value);
            return num.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
        }
        return String(value);
    };

    const isNumeric = (key: string, value: any) => {
        const k = key.toLowerCase();
        return typeof value === 'number' || 
               ['montant', 'total', 'solde', 'debit', 'credit', 'ca', 'valeur'].some(term => k.includes(term));
    };

    // Génération dynamique des colonnes DataTable
    const columns: ColumnDef<any, any>[] = useMemo(() => {
        if (items.length === 0) return [];

        return Object.keys(items[0])
            .filter(key => !['id', 'key', '_id'].includes(key.toLowerCase()))
            .map(key => ({
                id: key,
                accessorKey: key,
                header: key.replace(/_/g, ' '),
                cell: ({ getValue }) => {
                    const val = getValue();
                    const numeric = isNumeric(key, val);
                    return (
                        <div className={numeric ? "text-right font-mono" : "text-left"}>
                            {formatValue(val)}
                        </div>
                    );
                }
            }));
    }, [items]);

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

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 italic text-sm py-8">
                Aucune donnée dynamique disponible
            </div>
        );
    }

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

    // Récupération de la configuration persistée dans le widget
    const tableConfig = widget.config?.tableSettings as any || {};

    return (
        <div className="w-full h-full flex flex-col pt-2">
            <DataTable 
                tableId={widget.id}
                columns={columns}
                data={items}
                className="border-none mx-0"
                externalConfig={{
                    columnOrder: tableConfig.columnOrder,
                    columnVisibility: tableConfig.columnVisibility,
                    columnAliases: tableConfig.columnAliases,
                }}
                onConfigChangeAction={(newConfig) => {
                    // Eviter les mises à jour inutiles si rien n'a changé
                    if (JSON.stringify(newConfig) !== JSON.stringify(tableConfig)) {
                        updateWidgetConfig(pageId, widget.id, {
                            tableSettings: newConfig
                        });
                    }
                }}
            />
        </div>
    );
}
