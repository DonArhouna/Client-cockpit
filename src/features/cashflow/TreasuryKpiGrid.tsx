import { useKpiDefinitions } from '@/hooks/use-api';
import { Widget } from '@/types';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { Skeleton } from '@/components/ui/skeleton';

const TREASURY_CATEGORIES = ['tresorerie', 'finance'];

export function TreasuryKpiGrid() {
    const { data: kpiDefinitions, isLoading } = useKpiDefinitions();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-[180px] rounded-xl" />
                ))}
            </div>
        );
    }

    const mainKpis = (kpiDefinitions ?? [])
        .filter(kpi => kpi.isActive && TREASURY_CATEGORIES.includes(kpi.category) && kpi.defaultVizType === 'card')
        .slice(0, 4);

    // Construire les objets Widget (même pattern que DashboardKpis)
    const widgets: Widget[] = mainKpis.map((kpi, index) => ({
        id: `treasury-kpi-${kpi.id}`,
        name: kpi.name,
        type: 'kpi',
        kpiKey: kpi.key,
        vizType: kpi.defaultVizType,
        config: { unit: kpi.unit, description: kpi.description },
        exposure: kpi.key,
        position: { x: index * 3, y: 0, w: 3, h: 2 },
        isActive: true,
        dashboardId: 'treasury',
        userId: '',
        organizationId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    if (widgets.length === 0) {
        return (
            <div className="px-6">
                <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
                    Aucun indicateur de trésorerie disponible. Vérifiez les KPIs configurés dans le store.
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets.map((widget) => (
                <WidgetCard
                    key={widget.id}
                    pageId="treasury"
                    widget={widget}
                    isEditing={false}
                    onRemove={() => { }}
                    w={4}
                    h={3}
                />
            ))}
        </div>
    );
}
