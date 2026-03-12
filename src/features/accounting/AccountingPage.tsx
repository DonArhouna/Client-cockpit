import { useEffect, useMemo } from 'react';
import { AccountingHeader, AccountingFilters } from './components';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useKpiDefinitions } from '@/hooks/use-api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';

const PAGE_ID = 'accounting';

export default function AccountingPage() {
    const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
    const { layouts, addWidgetToPage, setPageLayout, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { data: kpiDefinitions, isLoading } = useKpiDefinitions();

    const widgets = useMemo(() => layouts[PAGE_ID] || [], [layouts, PAGE_ID]);

    // Auto-population automatique si la page est vide
    useEffect(() => {
        if (!isLoading && kpiDefinitions && widgets.length === 0) {
            const now = new Date().toISOString();

            const defaultWidgets = [
                // KPIs de comptabilité
                {
                    id: `accounting-${Date.now()}-kpi-1`,
                    dashboardId: 'local-personalization',
                    name: 'Résultat Net',
                    type: 'kpi',
                    kpiKey: 'resultat_net',
                    vizType: 'card',
                    position: { x: 0, y: 0, w: 3, h: 3 },
                    config: { color: 'blue' },
                    isActive: true,
                    userId: 'local-user',
                    organizationId: 'local-org',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    id: `accounting-${Date.now()}-kpi-2`,
                    dashboardId: 'local-personalization',
                    name: 'EBITDA',
                    type: 'kpi',
                    kpiKey: 'ebitda',
                    vizType: 'card',
                    position: { x: 3, y: 0, w: 3, h: 3 },
                    config: { color: 'green' },
                    isActive: true,
                    userId: 'local-user',
                    organizationId: 'local-org',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    id: `accounting-${Date.now()}-kpi-3`,
                    dashboardId: 'local-personalization',
                    name: 'Charges Exploitation',
                    type: 'kpi',
                    kpiKey: 'charges_exploitation',
                    vizType: 'card',
                    position: { x: 6, y: 0, w: 3, h: 3 },
                    config: { color: 'red' },
                    isActive: true,
                    userId: 'local-user',
                    organizationId: 'local-org',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    id: `accounting-${Date.now()}-kpi-4`,
                    dashboardId: 'local-personalization',
                    name: 'Produits Exploitation',
                    type: 'kpi',
                    kpiKey: 'produits_exploitation',
                    vizType: 'card',
                    position: { x: 9, y: 0, w: 3, h: 3 },
                    config: { color: 'purple' },
                    isActive: true,
                    userId: 'local-user',
                    organizationId: 'local-org',
                    createdAt: now,
                    updatedAt: now
                },
                // Graphiques
                {
                    id: `accounting-${Date.now()}-chart-1`,
                    dashboardId: 'local-personalization',
                    name: 'Évolution du P&L',
                    type: 'graph',
                    kpiKey: 'pnl_evolution',
                    vizType: 'line',
                    position: { x: 0, y: 3, w: 8, h: 4 },
                    config: {},
                    isActive: true,
                    userId: 'local-user',
                    organizationId: 'local-org',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    id: `accounting-${Date.now()}-chart-2`,
                    dashboardId: 'local-personalization',
                    name: 'Répartition des Charges',
                    type: 'chart',
                    kpiKey: 'repartition_charges',
                    vizType: 'pie',
                    position: { x: 8, y: 3, w: 4, h: 4 },
                    config: {},
                    isActive: true,
                    userId: 'local-user',
                    organizationId: 'local-org',
                    createdAt: now,
                    updatedAt: now
                }
            ];

            // On peuple la page
            // @ts-ignore
            setPageLayout(PAGE_ID, defaultWidgets);
        }
    }, [isLoading, kpiDefinitions, widgets.length, setPageLayout]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex w-full overflow-x-hidden relative min-h-[calc(100vh-4rem)] bg-slate-50/20 dark:bg-slate-950">
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pr-80' : ''}`}>
                <div className="p-6 h-full overflow-y-auto space-y-6 flex-1 flex flex-col">
                    <AccountingHeader isEditing={isEditing} onToggleEdit={() => {
                        setIsEditing(!isEditing);
                        setIsSidebarOpen(!isEditing);
                    }} />

                    <div className="flex justify-center flex-shrink-0">
                        <KpiSearchBar placeholder="Posez votre question sur la comptabilité" />
                    </div>

                    <AccountingFilters />

                    <div className="flex-1">
                        <DashboardGrid
                            widgets={widgets}
                            isEditing={isEditing}
                            onRemoveWidget={(id) => removeWidgetFromPage(PAGE_ID, id)}
                            onLayoutChangeAction={(layoutUpdates) => updateLayoutForPage(PAGE_ID, layoutUpdates)}
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
                    onAddWidget={(widgetData) => {
                        const now = new Date().toISOString();
                        addWidgetToPage(PAGE_ID, {
                            ...widgetData,
                            config: widgetData.config || {},
                            isActive: true,
                            userId: 'local-user',
                            organizationId: 'local-org',
                            createdAt: now,
                            updatedAt: now,
                            position: { x: 0, y: 100, w: 4, h: 3 }
                        });
                    }}
                    allowedDomains={['accounting']}
                />
            </div>
        </div>
    );
}
