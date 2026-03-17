import { useEffect, useState } from 'react';
import { OperationalHeader, OperationalFilters } from './components';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useKpiDefinitions } from '@/hooks/use-api';
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';
import { PAGE_DEFAULT_WIDGETS } from '@/features/personalization/DefaultLayouts';

export function OperationalPerformancePage() {
    const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
    const { layouts, addWidgetToPage, setPageLayout, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { data: kpiDefinitions, isLoading: isKpisLoading } = useKpiDefinitions();

    const [isInitialized, setIsInitialized] = useState(false);
    const widgets = layouts['operational'] || [];

    useEffect(() => {
        if (!isKpisLoading && kpiDefinitions && widgets.length === 0 && !isInitialized) {
            setIsInitialized(true);

            const defaultWidgets = PAGE_DEFAULT_WIDGETS['operational'](kpiDefinitions);
            const initialWidgets = defaultWidgets.map((w, index) => ({
                ...w,
                id: `operational-${Date.now()}-${index}`,
                dashboardId: 'local-personalization',
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }));

            setPageLayout('operational', initialWidgets as any);
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
