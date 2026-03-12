import { Filter, RotateCcw, ChevronDown, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFilters } from '@/context/FilterContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const periodLabels: Record<string, string> = {
    current_month: 'Ce mois',
    current_quarter: 'Ce trimestre',
    current_year: 'Cette année'
};

export function RisksFilters() {
    const { period, setPeriod } = useFilters();

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-visible bg-white dark:bg-slate-900 transition-colors">
            <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold">
                            <Filter className="h-5 w-5" />
                            <span>Filtres Risques</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold transition-colors">
                                <RotateCcw className="h-3.5 w-3.5" />
                                Réinitialiser
                            </button>
                            <button className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold transition-colors group">
                                <ChevronDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
                                Étendre
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left block">Période d'analyse</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center justify-between w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm group">
                                        <div className="flex items-center gap-2 truncate">
                                            <Calendar className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors" />
                                            <span className="truncate">{periodLabels[period] || period}</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 ml-2 flex-shrink-0" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[200px]">
                                    <DropdownMenuItem onClick={() => setPeriod('current_month')}>Ce mois</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setPeriod('current_quarter')}>Ce trimestre</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setPeriod('current_year')}>Cette année</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <FilterSelect label="Criticité" value="Toutes les criticités" />
                        <FilterSelect label="Statut" value="En cours / Retard" />
                        <FilterSelect label="Responsable" value="Tous les responsables" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function FilterSelect({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{label}</label>
            <button className="flex items-center justify-between w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm">
                <span className="truncate">{value}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 ml-2 flex-shrink-0" />
            </button>
        </div>
    );
}
