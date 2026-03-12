import { useEffect, useState } from 'react';
import { RevenueHeader, RevenueFilters } from './components';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useKpiDefinitions } from '@/hooks/use-api';
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';

const REVENUE_KPI_KEYS = ['ca_ht', 'variation_ca_n_1', 'ca_moyen_client', 'nb_clients_actifs'];

export function RevenueAnalysisPage() {
    const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
    const { layouts, addWidgetToPage, setPageLayout, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { data: kpiDefinitions, isLoading: isKpisLoading } = useKpiDefinitions();

    const [isInitialized, setIsInitialized] = useState(false);
    const widgets = layouts['revenue'] || [];

    useEffect(() => {
        if (!isKpisLoading && kpiDefinitions && widgets.length === 0 && !isInitialized) {
            setIsInitialized(true);

            const revenueKpis = kpiDefinitions.filter(kpi => kpi.isActive && REVENUE_KPI_KEYS.includes(kpi.key));
            const initialWidgets: any[] = [];
            const addedKeys = new Set();

            // 1. Add KPIs (maintaining standard 4 items row layout)
            revenueKpis.forEach((kpi, index) => {
                if (index < 4) {
                    addedKeys.add(kpi.key);
                    initialWidgets.push({
                        id: `revenue-${Date.now()}-kpi-${index}`,
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

            // If some KPIs were missing, add fallback mock KPIs for layout testing visually
            if (addedKeys.size < 4) {
                REVENUE_KPI_KEYS.filter(key => !addedKeys.has(key)).forEach((key, index) => {
                    const offset = addedKeys.size + index;
                    if (offset < 4) {
                        initialWidgets.push({
                            id: `revenue-${Date.now()}-kpi-mock-${index}`,
                            dashboardId: 'local-personalization',
                            name: key.replace(/_/g, ' '),
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

            // 2. Add Charts (matching previous static UI layout)
            initialWidgets.push({
                id: `revenue-${Date.now()}-chart-1`,
                dashboardId: 'local-personalization',
                name: "Évolution des Revenus",
                type: 'graph',
                kpiKey: 'revenue_evolution',
                vizType: 'area',
                config: {},
                position: { x: 0, y: 3, w: 9, h: 4 }, // Adjusted Y for Search bar space
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            initialWidgets.push({
                id: `revenue-${Date.now()}-chart-2`,
                dashboardId: 'local-personalization',
                name: "Balance Âgée Clients",
                type: 'list',
                kpiKey: 'accounts_receivable_age',
                config: {},
                position: { x: 0, y: 7, w: 9, h: 4 },
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            initialWidgets.push({
                id: `revenue-${Date.now()}-chart-3`,
                dashboardId: 'local-personalization',
                name: "Top Performers",
                type: 'table',
                kpiKey: 'top_clients',
                config: {},
                position: { x: 9, y: 3, w: 3, h: 8 },
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            setPageLayout('revenue', initialWidgets);
        }
    }, [isKpisLoading, kpiDefinitions, widgets.length, isInitialized, setPageLayout]);

    const handleAddWidget = (widgetData: any) => {
        addWidgetToPage('revenue', widgetData);
    };

    const handleRemoveWidget = (widgetId: string) => {
        removeWidgetFromPage('revenue', widgetId);
    };

    const handleLayoutChange = (layoutUpdates: Record<string, { x: number, y: number, w: number, h: number }>) => {
        updateLayoutForPage('revenue', layoutUpdates);
    };

    const handleToggleEdit = () => {
        setIsEditing(!isEditing);
        setIsSidebarOpen(!isEditing);
    };

    return (
        <div className="flex w-full overflow-x-hidden relative min-h-[calc(100vh-4rem)] bg-slate-50/20 dark:bg-slate-950">
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pr-80' : ''}`}>
                <div className="p-6 h-full overflow-y-auto space-y-6 flex-1 flex flex-col">
                    <RevenueHeader isEditing={isEditing} onToggleEdit={handleToggleEdit} />

                    <div className="flex justify-center flex-shrink-0">
                        <KpiSearchBar placeholder="Posez votre question sur vos revenus" />
                    </div>

                    <RevenueFilters />

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
                    allowedDomains={['sales']}
                />
            </div>
        </div>
    );
}
