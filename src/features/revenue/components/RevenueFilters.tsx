import { Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function RevenueFilters() {
    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-visible bg-white dark:bg-slate-900 transition-colors">
            <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold">
                            <Filter className="h-5 w-5" />
                            <span>Filtres Revenus</span>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FilterSelect label="Mode de comparaison" value="Année sur année (YoY)" />
                        <FilterSelect label="Segment client" value="Tous les segments" />
                        <FilterSelect label="Région" value="Toutes les régions" />
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
