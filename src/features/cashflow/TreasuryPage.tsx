import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useFilters } from '@/context/FilterContext';
import { useKpiDefinitions } from '@/hooks/use-api';
import { TreasuryHeader, TreasuryFilters } from './';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';
import { PAGE_DEFAULT_WIDGETS } from '@/features/personalization/DefaultLayouts';
import { PageInsight } from '@/components/shared/PageInsight';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useMemo } from 'react';


export function TreasuryPage() {
    const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
    const { layouts, addWidgetToPage, setPageLayout, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { currency } = useFilters();
    const { data: kpiDefinitions, isLoading: isKpisLoading } = useKpiDefinitions();

    // Suivi de l'initialisation pour éviter des boucles d'ajouts
    const [isInitialized, setIsInitialized] = useState(false);

    // Les widgets actuels de la page finance
    const widgets = layouts['finance'] || [];
    // Peupler la page par défaut s'il n'y a aucun widget
    useEffect(() => {
        if (!isKpisLoading && kpiDefinitions && widgets.length === 0 && !isInitialized) {
            setIsInitialized(true);

            const defaultWidgets = PAGE_DEFAULT_WIDGETS['finance'](kpiDefinitions);
            const initialWidgets = defaultWidgets.map((w, index) => ({
                ...w,
                id: `finance-${Date.now()}-${index}`,
                dashboardId: 'local-personalization',
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }));

            setPageLayout('finance', initialWidgets as any);
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

    const { data: treasuryData } = useKpiData('solde_tresorerie');
    const { data: coverageData } = useKpiData('taux_couverture_flux');

    const treasuryInsight = useMemo(() => {
        if (!treasuryData) return null;
        const formatter = new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: currency, 
            maximumFractionDigits: 0 
        });
        const val = formatter.format(treasuryData.current || 0);
        const coverage = coverageData?.current || 0;
        const msgLiquidite = coverage >= 100 
            ? "Aucune tension de liquidité détectée sur les 30 prochains jours." 
            : "Une attention particulière sur la liquidité est recommandée.";
        
        return {
            text: `La trésorerie disponible s'élève à ${val}. Les flux entrants couvrent les flux sortants à ${coverage.toFixed(0)}% ce mois. ${msgLiquidite}`,
            variant: (coverage >= 100 ? 'success' : coverage >= 80 ? 'warning' : 'danger') as any
        };
    }, [treasuryData, coverageData, currency]);

    return (
        <div className="flex w-full overflow-x-hidden relative bg-slate-50/20 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pr-80' : ''}`}>

                {/* Header standardisé */}
                <div className="px-6 pt-6">
                    <TreasuryHeader isEditing={isEditing} onToggleEdit={handleToggleEdit} />
                </div>

                {/* Barre d'outils */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 px-6 flex-shrink-0">
                    <div className="flex-1 flex justify-center">
                        <KpiSearchBar placeholder="Posez votre question sur la trésorerie" />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Mis à jour: 10:45
                        </span>
                    </div>
                </div>

                {/* Contenu principal (entièrement géré par DashboardGrid) */}
                <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-6 mt-4">
                    <TreasuryFilters />

                    {/* Page Insight (placé juste sous les filtres) */}
                    {treasuryInsight && (
                        <div className="mt-2">
                            <PageInsight
                                icon="DollarSign"
                                label="Indicateur clé"
                                text={treasuryInsight.text}
                                variant={treasuryInsight.variant}
                            />
                        </div>
                    )}

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
