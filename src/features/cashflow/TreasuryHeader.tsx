import { DollarSign, Download, Settings2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { exportToCsv } from '@/lib/export';

interface TreasuryHeaderProps {
    isEditing?: boolean;
    onToggleEdit?: () => void;
}

export function TreasuryHeader({ isEditing, onToggleEdit }: TreasuryHeaderProps) {
    const handleExport = () => {
        const mockData = [
            { Indicateur: 'Position Cash', Valeur: 125000 },
            { Indicateur: 'Flux Projeté', Valeur: 45000 },
            { Indicateur: 'Besoin BFR', Valeur: -12000 },
        ];
        exportToCsv('export_tresorerie', mockData);
    };

    return (
        <div className="flex flex-col gap-6">
            <Breadcrumbs currentPage="Finance & Trésorerie" PageIcon={DollarSign} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Finance & Trésorerie
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Surveillance en temps réel des flux de trésorerie et de la santé financière
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
