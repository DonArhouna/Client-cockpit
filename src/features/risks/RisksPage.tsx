import { useEffect, useMemo } from 'react';
import { DashboardGrid } from '../dashboard/components/DashboardGrid';
import { WidgetSidebar } from '../dashboard/components/WidgetSidebar';
import { RisksHeader, RisksFilters } from './components';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '../personalization/PersonalizationContext';
import { useKpiDefinitions } from '@/hooks/use-api';
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageInsight } from '@/components/shared/PageInsight';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useFilters } from '@/context/FilterContext';

const PAGE_ID = 'risks';

export default function RisksPage() {
    const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
    const { layouts, addWidgetToPage, setPageLayout, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { data: kpiDefinitions, isLoading } = useKpiDefinitions();

    const widgets = useMemo(() => layouts[PAGE_ID] || [], [layouts, PAGE_ID]);
    const { currency } = useFilters();

    const { data: riskExposureData } = useKpiData('montant_expose_risque');
    const { data: highRiskClientsData } = useKpiData('nb_clients_risque_eleve');

    const risksInsight = useMemo(() => {
        if (!riskExposureData) return null;
        const formatter = new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: currency, 
            maximumFractionDigits: 0 
        });
        const val = formatter.format(riskExposureData.current || 0);
        const count = highRiskClientsData?.current || 0;
        
        return {
            text: `${val} sont exposés à un risque de non-recouvrement. ${count} clients sont classés en risque élevé. Une relance immédiate est recommandée pour les dossiers les plus anciens.`,
            variant: (count === 0 ? 'success' : count <= 2 ? 'warning' : 'danger') as any
        };
    }, [riskExposureData, highRiskClientsData, currency]);

    // Auto-population automatique si la page est vide
    useEffect(() => {
        if (!isLoading && kpiDefinitions && widgets.length === 0) {
            const now = new Date().toISOString();

            const risksKpis = kpiDefinitions
                .filter(kpi => kpi.isActive && kpi.category === 'clients' && kpi.defaultVizType === 'card')
                .slice(0, 4);

            const defaultWidgets: any[] = risksKpis.map((kpi, index) => ({
                id: `risks-${Date.now()}-kpi-${index}`,
                dashboardId: 'local-personalization',
                name: kpi.name,
                type: 'kpi',
                kpiKey: kpi.key,
                vizType: kpi.defaultVizType,
                position: { x: index * 3, y: 0, w: 3, h: 3 },
                config: { unit: kpi.unit, description: kpi.description },
                isActive: true,
                userId: 'local-user',
                organizationId: 'local-org',
                createdAt: now,
                updatedAt: now,
            }));

            // Graphiques fixes (composants visuels dédiés)
            defaultWidgets.push(
                {
                    id: `risks-${Date.now()}-chart-1`,
                    dashboardId: 'local-personalization',
                    name: 'Évolution Balance Âgée',
                    type: 'graph',
                    kpiKey: 'ageing_balance_evolution',
                    vizType: 'area',
                    position: { x: 0, y: 3, w: 8, h: 4 },
                    config: {},
                    isActive: true,
                    userId: 'local-user',
                    organizationId: 'local-org',
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    id: `risks-${Date.now()}-chart-2`,
                    dashboardId: 'local-personalization',
                    name: 'Top 10 Clients à Risque',
                    type: 'table',
                    kpiKey: 'top10_clients_risques',
                    vizType: 'table',
                    position: { x: 8, y: 3, w: 4, h: 8 },
                    config: {},
                    isActive: true,
                    userId: 'local-user',
                    organizationId: 'local-org',
                    createdAt: now,
                    updatedAt: now,
                }
            );

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

    const handleToggleEdit = () => {
        setIsEditing(!isEditing);
        setIsSidebarOpen(!isEditing);
    };

    return (
        <div className="flex w-full overflow-x-hidden relative min-h-[calc(100vh-4rem)] bg-slate-50/20 dark:bg-slate-950">
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pr-80' : ''}`}>
                <div className="p-6 h-full overflow-y-auto space-y-6 flex-1 flex flex-col">
                    <RisksHeader isEditing={isEditing} onToggleEdit={handleToggleEdit} />

                    <div className="flex justify-center flex-shrink-0">
                        <KpiSearchBar placeholder="Posez votre question sur les risques et le recouvrement" />
                    </div>

                    <RisksFilters />

                    {risksInsight && (
                        <div className="mt-2 text-slate-900 dark:text-slate-100 italic">
                            <PageInsight
                                icon="ShieldAlert"
                                label="Alerte Risques"
                                text={risksInsight.text}
                                variant={risksInsight.variant}
                            />
                        </div>
                    )}

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
                    allowedDomains={['risks']}
                />
            </div>
        </div>
    );
}
