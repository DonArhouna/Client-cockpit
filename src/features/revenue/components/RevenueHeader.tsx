import { TrendingUp, Download, Settings2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { exportToCsv } from '@/lib/export';

interface RevenueHeaderProps {
    isEditing?: boolean;
    onToggleEdit?: () => void;
}

export function RevenueHeader({ isEditing, onToggleEdit }: RevenueHeaderProps) {
    const handleExport = () => {
        const mockData = [
            { Client: 'Client A', CA: 50000, Marge: '15%' },
            { Client: 'Client B', CA: 30000, Marge: '12%' },
            { Client: 'Client C', CA: 20000, Marge: '18%' },
        ];
        exportToCsv('export_revenues', mockData);
    };

    return (
        <div className="flex flex-col gap-6">
            <Breadcrumbs currentPage="Analyse des Revenus" PageIcon={TrendingUp} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Analyse des Revenus
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Suivi détaillé de vos ventes et de votre performance commerciale
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:flex gap-2 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm font-bold h-9"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4" />
                        Exporter
                    </Button>

                    {onToggleEdit && (
                        <Button
                            variant={isEditing ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "hidden sm:flex gap-2 shadow-sm font-bold h-9",
                                !isEditing && "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                            onClick={onToggleEdit}
                        >
                            <Settings2 className={cn("h-4 w-4", isEditing && "rotate-45")} />
                            {isEditing ? 'Terminer' : 'Personnaliser'}
                        </Button>
                    )}

                    <Button
                        variant="default"
                        size="sm"
                        className="gap-2 bg-[#3b66ac] hover:bg-[#2d5089] text-white shadow-sm font-bold px-4 h-9"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Actualiser
                    </Button>
                </div>
            </div>
        </div>
    );
}
