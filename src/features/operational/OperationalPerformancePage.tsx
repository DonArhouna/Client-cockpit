import { useEffect, useState } from 'react';
import { OperationalHeader, OperationalFilters } from './components';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useKpiDefinitions } from '@/hooks/use-api';
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';

const OPERATIONAL_KPI_KEYS = ['total_achats_ht', 'dpo', 'dettes_fournisseurs_echues', 'nb_fournisseurs_actifs'];

export function OperationalPerformancePage() {
    const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
    const { layouts, addWidgetToPage, setPageLayout, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { data: kpiDefinitions, isLoading: isKpisLoading } = useKpiDefinitions();

    const [isInitialized, setIsInitialized] = useState(false);
    const widgets = layouts['operational'] || [];

    useEffect(() => {
        if (!isKpisLoading && kpiDefinitions && widgets.length === 0 && !isInitialized) {
            setIsInitialized(true);

            const operationalKpis = kpiDefinitions.filter(kpi => kpi.isActive && OPERATIONAL_KPI_KEYS.includes(kpi.key));
            const initialWidgets: any[] = [];
            const addedKeys = new Set();

            // 1. Add KPIs
            operationalKpis.forEach((kpi, index) => {
                if (index < 4) {
                    addedKeys.add(kpi.key);
                    initialWidgets.push({
                        id: `operational-${Date.now()}-kpi-${index}`,
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
                }
            });

            // Fallback mock KPIs if backend doesn't have them all
            if (addedKeys.size < 4) {
                OPERATIONAL_KPI_KEYS.filter(key => !addedKeys.has(key)).forEach((key, index) => {
                    const offset = addedKeys.size + index;
                    if (offset < 4) {
                        initialWidgets.push({
                            id: `operational-${Date.now()}-kpi-mock-${index}`,
                            dashboardId: 'local-personalization',
                            name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            type: 'kpi',
                            vizType: 'card',
                            kpiKey: key,
                            config: {},
                            position: { x: offset * 3, y: 0, w: 3, h: 3 },
                            isActive: true,
                            userId: 'local-user',
                            organizationId: 'local-org',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        });
                    }
                });
            }

            // 2. Add Charts / Tables
            initialWidgets.push({
                id: `operational-${Date.now()}-chart-1`,
                dashboardId: 'local-personalization',
                name: "Évolution des Achats",
                type: 'graph',
                kpiKey: 'purchases_evolution',
                vizType: 'area',
                config: {},
                position: { x: 0, y: 3, w: 9, h: 4 },
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            initialWidgets.push({
                id: `operational-${Date.now()}-chart-2`,
                dashboardId: 'local-personalization',
                name: "Top 10 Fournisseurs",
                type: 'table',
                kpiKey: 'top10_fournisseurs_achats',
                config: {},
                position: { x: 9, y: 3, w: 3, h: 8 },
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            initialWidgets.push({
                id: `operational-${Date.now()}-chart-3`,
                dashboardId: 'local-personalization',
                name: "Dettes Fournisseurs par Échéance",
                type: 'list',
                kpiKey: 'dettes_fournisseurs_echeance',
                config: {},
                position: { x: 0, y: 7, w: 9, h: 4 },
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            setPageLayout('operational', initialWidgets);
        }
    }, [isKpisLoading, kpiDefinitions, widgets.length, isInitialized, setPageLayout]);

    const handleAddWidget = (widgetData: any) => {
        addWidgetToPage('operational', widgetData);
    };

    const handleRemoveWidget = (widgetId: string) => {
        removeWidgetFromPage('operational', widgetId);
    };

    const handleLayoutChange = (layoutUpdates: Record<string, { x: number, y: number, w: number, h: number }>) => {
        updateLayoutForPage('operational', layoutUpdates);
    };

    const handleToggleEdit = () => {
        setIsEditing(!isEditing);
        setIsSidebarOpen(!isEditing);
    };

    return (
        <div className="flex w-full overflow-x-hidden relative min-h-[calc(100vh-4rem)] bg-slate-50/20 dark:bg-slate-950">
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pr-80' : ''}`}>
                <div className="p-6 h-full overflow-y-auto space-y-6 flex-1 flex flex-col">
                    <OperationalHeader isEditing={isEditing} onToggleEdit={handleToggleEdit} />

                    <div className="flex justify-center flex-shrink-0">
                        <KpiSearchBar placeholder="Posez votre question sur la performance opérationnelle" />
                    </div>

                    <OperationalFilters />

                    <div className="flex-1">
                        <DashboardGrid
                            widgets={widgets}
                            isEditing={isEditing}
                            onLayoutChangeAction={handleLayoutChange}
                            onRemoveWidget={handleRemoveWidget}
                        />
                    </div>
                </div>
            </div>

            {/* Barre latérale d'ajout de widgets */}
            <div
                className={`absolute top-0 right-0 bottom-0 h-full z-20 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <WidgetSidebar
                    onClose={() => setIsSidebarOpen(false)}
                    onAddWidget={handleAddWidget}
                    allowedDomains={['purchases']}
                />
            </div>
        </div>
    );
}
