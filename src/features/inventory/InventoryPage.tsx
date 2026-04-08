import { useEffect, useMemo } from 'react';
import { InventoryHeader, InventoryFilters } from './components';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useKpiDefinitions } from '@/hooks/use-api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PAGE_DEFAULT_WIDGETS } from '@/features/personalization/DefaultLayouts';
import { PageInsight } from '@/components/shared/PageInsight';
import { useKpiData } from '@/hooks/use-kpi-data';

const PAGE_ID = 'inventory';

export default function InventoryPage() {
    const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
    const { layouts, addWidgetToPage, setPageLayout, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { data: kpiDefinitions, isLoading } = useKpiDefinitions();

    const widgets = useMemo(() => layouts[PAGE_ID] || [], [layouts, PAGE_ID]);

    const { data: stockData } = useKpiData('nb_articles_rupture');

    const inventoryInsight = useMemo(() => {
        const ruptures = stockData?.current || 0;
        return {
            text: `${ruptures} articles sont en rupture de stock critique. La gestion des approvisionnements est en cours d'optimisation pour réduire ces écarts.`,
            variant: (ruptures === 0 ? 'success' : ruptures <= 5 ? 'warning' : 'danger') as any
        };
    }, [stockData]);

    // Auto-population automatique si la page est vide
    useEffect(() => {
        if (!isLoading && kpiDefinitions && widgets.length === 0) {
            const now = new Date().toISOString();

            const defaultWidgets = PAGE_DEFAULT_WIDGETS['inventory'](kpiDefinitions);
            const initialWidgets = defaultWidgets.map((w, index) => ({
                ...w,
                id: `inventory-${Date.now()}-${index}`,
                dashboardId: 'local-personalization',
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: now,
                updatedAt: now,
            }));

            setPageLayout(PAGE_ID, initialWidgets as any);
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
                    <InventoryHeader isEditing={isEditing} onToggleEdit={() => {
                        setIsEditing(!isEditing);
                        setIsSidebarOpen(!isEditing);
                    }} />

                    <InventoryFilters />

                    {inventoryInsight && (
                        <div className="mt-2 text-slate-900 dark:text-slate-100 italic">
                            <PageInsight
                                icon="Package"
                                label="État des stocks"
                                text={inventoryInsight.text}
                                variant={inventoryInsight.variant}
                            />
                        </div>
                    )}

                    <div className="flex-1">
                        <DashboardGrid
                            pageId={PAGE_ID}
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
                    allowedDomains={['inventory']}
                />
            </div>
        </div>
    );
}
