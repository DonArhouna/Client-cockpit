import { useEffect, useState } from 'react';
import { RevenueHeader, RevenueFilters } from './components';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useKpiDefinitions } from '@/hooks/use-api';
import { PAGE_DEFAULT_WIDGETS } from '@/features/personalization/DefaultLayouts';
import { PageInsight } from '@/components/shared/PageInsight';
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useMemo } from 'react';


export function RevenueAnalysisPage() {
    const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
    const { layouts, addWidgetToPage, setPageLayout, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { data: kpiDefinitions, isLoading: isKpisLoading } = useKpiDefinitions();

    const { data: revData } = useKpiData('ca');

    const revenueInsight = useMemo(() => {
        if (!revData) return null;
        const growth = revData.trend || 0;
        const growthStr = growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
        
        return {
            text: `Les revenus progressent de ${growthStr} ce trimestre. La dynamique de croissance reste solide sur les segments clés.`,
            variant: (growth > 5 ? 'success' : growth >= 0 ? 'info' : 'danger') as any
        };
    }, [revData]);

    const [isInitialized, setIsInitialized] = useState(false);
    const widgets = layouts['revenue'] || [];

    useEffect(() => {
        if (!isKpisLoading && kpiDefinitions && widgets.length === 0 && !isInitialized) {
            setIsInitialized(true);

            const defaultWidgets = PAGE_DEFAULT_WIDGETS['revenue'](kpiDefinitions);
            const initialWidgets = defaultWidgets.map((w, index) => ({
                ...w,
                id: `revenue-${Date.now()}-${index}`,
                dashboardId: 'local-personalization',
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }));

            setPageLayout('revenue', initialWidgets as any);
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

                    {revenueInsight && (
                        <div className="mt-2">
                            <PageInsight
                                icon="TrendingUp"
                                label="Indicateur clé"
                                text={revenueInsight.text}
                                variant={revenueInsight.variant}
                            />
                        </div>
                    )}

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
