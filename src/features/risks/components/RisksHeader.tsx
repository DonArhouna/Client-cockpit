import { ShieldAlert, Download, Share2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { exportToCsv } from '@/lib/export';
import { useDashboardEdit } from '@/context/DashboardEditContext';

interface RisksHeaderProps {
    isEditing?: boolean;
    onToggleEdit?: () => void;
}

export function RisksHeader({ isEditing, onToggleEdit }: RisksHeaderProps) {
    const { toggleEditMode } = useDashboardEdit();
    const handleToggle = onToggleEdit || toggleEditMode;

    const handleExport = () => {
        const mockData = [
            { Client: 'Client X', Encours: 15000, Retard: '45j' },
            { Client: 'Client Y', Encours: 8000, Retard: '12j' },
            { Client: 'Client Z', Encours: 25000, Retard: '60j' },
        ];
        exportToCsv('export_risques', mockData);
    };

    return (
        <div className="flex flex-col gap-6 mb-6">
            <Breadcrumbs currentPage="Risques & Recouvrement" PageIcon={ShieldAlert} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Risques & Recouvrement
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Analyse de vos encours, retards de paiement et gestion du recouvrement
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

                    <Button variant="outline" size="sm" className="hidden sm:flex gap-2 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm font-bold h-9">
                        <Share2 className="h-4 w-4" />
                        Partager
                    </Button>

                    <Button
                        variant={isEditing ? "default" : "outline"}
                        size="sm"
                        className={cn(
                            "hidden sm:flex gap-2 shadow-sm font-bold h-9",
                            !isEditing && "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                        onClick={handleToggle}
                    >
                        {isEditing ? 'Terminer' : 'Personnaliser'}
                    </Button>

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
