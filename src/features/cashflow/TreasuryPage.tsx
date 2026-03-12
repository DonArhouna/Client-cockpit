import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw, ChevronDown } from 'lucide-react';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useFilters } from '@/context/FilterContext';
import { useKpiDefinitions } from '@/hooks/use-api';
import { TreasuryHeader, TreasuryFilters } from './';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { KpiSearchBar } from '@/components/shared/KpiSearchBar';

const TREASURY_CATEGORIES = [
    'tresorerie',
    'finance',
    'finance_performance',
    'rentabilite',
    'controle_gestion',
];

const TREASURY_KPI_KEYS = [
    'position_tresorerie',
    'flux_tresorerie_projete',
    'dso',
    'creances_retard',
    'cash_flow',
    'revenue_mom',
    'accounts_receivable',
    'accounts_payable',
];

export function TreasuryPage() {
    const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
    const { layouts, addWidgetToPage, setPageLayout, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { period, setPeriod, currency, setCurrency } = useFilters();
    const { data: kpiDefinitions, isLoading: isKpisLoading } = useKpiDefinitions();

    // Suivi de l'initialisation pour éviter des boucles d'ajouts
    const [isInitialized, setIsInitialized] = useState(false);

    // Les widgets actuels de la page finance
    const widgets = layouts['finance'] || [];
    // Peupler la page par défaut s'il n'y a aucun widget
    useEffect(() => {
        if (!isKpisLoading && kpiDefinitions && widgets.length === 0 && !isInitialized) {
            setIsInitialized(true);

            // 1. Trouver les KPIs de trésorerie
            let treasuryKpis = kpiDefinitions.filter(
                (kpi) => kpi.isActive && TREASURY_CATEGORIES.includes(kpi.category)
            );

            if (treasuryKpis.length === 0) {
                treasuryKpis = kpiDefinitions.filter(
                    (kpi) => kpi.isActive && TREASURY_KPI_KEYS.includes(kpi.key)
                );
            }

            const mainKpis = treasuryKpis.slice(0, 4);
            const initialWidgets: any[] = [];

            // 2. Ajouter automatiquement les 4 KPIs en tant que widgets draggables
            mainKpis.forEach((kpi, index) => {
                initialWidgets.push({
                    id: `finance-${Date.now()}-kpi-${index}`,
                    dashboardId: 'local-personalization',
                    name: kpi.name,
                    type: 'kpi',
                    vizType: kpi.defaultVizType || 'card',
                    kpiKey: kpi.key,
                    config: { unit: kpi.unit, description: kpi.description },
                    position: { x: index * 3, y: 0, w: 3, h: 3 },
                    exposure: kpi.key,
                    isActive: true,
                    userId: 'local-user',
                    organizationId: 'local-org',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            });

            // 3. Ajouter les graphiques de base de trésorerie
            initialWidgets.push({
                id: `finance-${Date.now()}-chart-1`,
                dashboardId: 'local-personalization',
                name: "Flux de Trésorerie Projets",
                type: 'widget',
                vizType: 'flux_tresorerie_chart',
                config: {},
                position: { x: 0, y: 3, w: 8, h: 4 },
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            initialWidgets.push({
                id: `finance-${Date.now()}-chart-2`,
                dashboardId: 'local-personalization',
                name: "Répartition des Encaissements",
                type: 'widget',
                vizType: 'encaissements_pie',
                config: {},
                position: { x: 8, y: 3, w: 4, h: 4 },
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            initialWidgets.push({
                id: `finance-${Date.now()}-chart-3`,
                dashboardId: 'local-personalization',
                name: "Analyse des Créances",
                type: 'widget',
                vizType: 'creances_analysis',
                config: {},
                position: { x: 0, y: 7, w: 8, h: 4 },
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            initialWidgets.push({
                id: `finance-${Date.now()}-chart-4`,
                dashboardId: 'local-personalization',
                name: "Risques Clients",
                type: 'widget',
                vizType: 'client_risk_table',
                config: {},
                position: { x: 8, y: 7, w: 4, h: 8 },
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            setPageLayout('finance', initialWidgets);
        }
    }, [isKpisLoading, kpiDefinitions, widgets.length, isInitialized, setPageLayout]);

    const handleAddWidget = (widgetData: any) => {
        addWidgetToPage('finance', widgetData);
    };

    const handleRemoveWidget = (widgetId: string) => {
        removeWidgetFromPage('finance', widgetId);
    };

    const handleLayoutChange = (layoutUpdates: Record<string, { x: number, y: number, w: number, h: number }>) => {
        updateLayoutForPage('finance', layoutUpdates);
    };

    const handleToggleEdit = () => {
        setIsEditing(!isEditing);
        setIsSidebarOpen(!isEditing);
    };

    return (
        <div className="flex w-full overflow-x-hidden relative bg-slate-50/20 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pr-80' : ''}`}>

                {/* Header standardisé */}
                <div className="px-6 pt-6">
                    <TreasuryHeader isEditing={isEditing} onToggleEdit={handleToggleEdit} />
                </div>

                {/* Barre d'outils unifiée */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 px-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-between gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm min-w-[160px]">
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span>
                                            {period === 'current_quarter'
                                                ? 'Ce trimestre'
                                                : period === 'current_month'
                                                    ? 'Ce mois'
                                                    : 'Cette année'}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[160px]">
                                <DropdownMenuItem onClick={() => setPeriod('current_month')}>Ce mois</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPeriod('current_quarter')}>Ce trimestre</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPeriod('current_year')}>Cette année</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-between gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm w-[110px]">
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                        <span className="text-primary text-xs font-bold">
                                            {currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'FCFA'}
                                        </span>
                                        <span className="text-xs">{currency}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[110px]">
                                <DropdownMenuItem onClick={() => setCurrency('XOF')}>XOF</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCurrency('EUR')}>EUR</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCurrency('USD')}>USD</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex-1 flex justify-center">
                        <KpiSearchBar placeholder="Posez votre question sur la trésorerie" />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Le bouton "Terminer" est maintenant géré par le Header */}

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Mis à jour: 10:45
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contenu principal (entièrement géré par DashboardGrid) */}
                <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-6">
                    <TreasuryFilters />

                    <DashboardGrid
                        widgets={widgets}
                        isEditing={isEditing}
                        onLayoutChangeAction={handleLayoutChange}
                        onRemoveWidget={handleRemoveWidget}
                    />
                </div>
            </div>

            {/* Barre latérale d'ajout de widgets (Visible uniquement en édition) */}
            <div
                className={`absolute top-0 right-0 bottom-0 h-full z-20 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <WidgetSidebar
                    onClose={() => setIsSidebarOpen(false)}
                    onAddWidget={handleAddWidget}
                    allowedDomains={['finance']}
                />
            </div>
        </div>
    );
}
