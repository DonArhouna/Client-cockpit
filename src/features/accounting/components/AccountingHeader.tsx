import { Download, FileText, Settings2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { exportToCsv } from '@/lib/export';

interface AccountingHeaderProps {
    isEditing?: boolean;
    onToggleEdit?: () => void;
}

export function AccountingHeader({ isEditing, onToggleEdit }: AccountingHeaderProps) {
    const handleExport = (type: string) => {
        // Mock data for export
        const mockData = [
            { Date: '2024-03-01', Description: 'Vente Marchandises', Montant: 1500 },
            { Date: '2024-03-02', Description: 'Achat Fournitures', Montant: -500 },
            { Date: '2024-03-05', Description: 'Salaire Mars', Montant: -3000 },
        ];
        exportToCsv(`export_comptabilite_${type}`, mockData);
    };

    return (
        <div className="flex flex-col gap-0">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Comptabilité & Analyse
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Analyse de votre compte de résultat et indicateurs financiers
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:flex gap-2 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm font-semibold h-9"
                        onClick={() => handleExport('excel')}
                    >
                        <Download className="h-4 w-4" />
                        Exporter Excel
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:flex gap-2 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm font-semibold h-9"
                        onClick={() => handleExport('ppt')}
                    >
                        <FileText className="h-4 w-4" />
                        Export PPT
                    </Button>

                    {onToggleEdit && (
                        <Button
                            variant={isEditing ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "hidden sm:flex gap-2 shadow-sm font-semibold h-9",
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
                        className="gap-2 bg-[#3b66ac] hover:bg-[#2d5089] text-white shadow-sm font-bold px-4 h-9 transition-colors"
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
