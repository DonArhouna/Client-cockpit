import { Download, Settings2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { exportToCsv } from '@/lib/export';

interface InventoryHeaderProps {
    isEditing?: boolean;
    onToggleEdit?: () => void;
}

export function InventoryHeader({ isEditing, onToggleEdit }: InventoryHeaderProps) {
    const handleExport = () => {
        const mockData = [
            { Article: 'Article A', Stock: 150, Valeur: 15000 },
            { Article: 'Article B', Stock: 45, Valeur: 4500 },
            { Article: 'Article C', Stock: 10, Valeur: 1000 },
        ];
        exportToCsv('export_stocks', mockData);
    };

    return (
        <div className="flex flex-col gap-0">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Stocks & Articles
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Gestion de vos inventaires et analyse des rotations de stocks
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
