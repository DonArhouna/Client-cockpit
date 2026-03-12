import { Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFilters } from '@/context/FilterContext';
import { useState } from 'react';
import { exportToCsv } from '@/lib/export';

export function TreasuryFilters() {
    const { period, setPeriod } = useFilters();

    const periodLabels: Record<string, string> = {
        current_month: 'Vue Quotidienne',
        current_quarter: 'Vue Hebdomadaire',
        current_year: 'Vue Mensuelle'
    };

    const accountOptions = ['Tous les comptes', 'Compte Principal', 'Compte Secondaire'];
    const [selectedAccount, setSelectedAccount] = useState('Tous les comptes');

    const handleExport = () => {
        const mockData = [
            { Banque: 'BNP Paribas', Solde: 45000, Devise: 'EUR' },
            { Banque: 'Société Générale', Solde: 12000, Devise: 'EUR' },
            { Banque: 'Caisse Epargne', Solde: 8000, Devise: 'EUR' },
        ];
        exportToCsv('export_tresorerie', mockData);
    };

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-border gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground dark:text-slate-400">Filtres:</span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center justify-between gap-2 px-3 py-1.5 border rounded-md text-sm font-medium bg-white dark:bg-slate-800 hover:bg-accent dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm min-w-[160px]">
                            <div className="flex items-center gap-2 text-foreground dark:text-white">
                                <Calendar className="h-4 w-4 text-primary/70" />
                                <span className="dark:text-white">{periodLabels[period] || 'Vue Quotidienne'}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[180px]">
                        <DropdownMenuItem onClick={() => setPeriod('current_month')}>Vue Quotidienne</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPeriod('current_quarter')}>Vue Hebdomadaire</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPeriod('current_year')}>Vue Mensuelle</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center justify-between gap-2 px-3 py-1.5 border rounded-md text-sm font-medium bg-white dark:bg-slate-800 hover:bg-accent dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm min-w-[160px]">
                            <span className="text-foreground dark:text-white">{selectedAccount}</span>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[180px]">
                        {accountOptions.map(opt => (
                            <DropdownMenuItem key={opt} onClick={() => setSelectedAccount(opt)}>{opt}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="default" className="gap-2 font-bold bg-[#3b66ac] hover:bg-[#2d5089] text-white shadow-sm">
                    <RefreshCw className="h-4 w-4" />
                    Actualiser
                </Button>

                <span className="text-xs text-muted-foreground dark:text-slate-400">Mis à jour: 14:00:45</span>

                <Button
                    variant="outline"
                    className="gap-2 font-bold dark:border-slate-600 dark:hover:bg-slate-800"
                    onClick={handleExport}
                >
                    Exporter
                </Button>
            </div>
        </div>
    );
}
