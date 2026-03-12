import { useKpiDefinitions } from '@/hooks/use-api';
import { Widget } from '@/types';
import { WidgetCard } from './WidgetCard';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardKpis() {
  const { data: kpiDefinitions, isLoading } = useKpiDefinitions();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[180px] rounded-lg" />
        ))}
      </div>
    );
  }

  const mainKpis = (kpiDefinitions ?? [])
    .filter(kpi => kpi.isActive && kpi.defaultVizType === 'card' && kpi.profiles?.some((p: string) => ['DAF', 'CFO', 'DG'].includes(p)))
    .slice(0, 4);

  const widgets: Widget[] = mainKpis.map((kpi, index) => ({
    id: `main-kpi-${kpi.id}`,
    name: kpi.name,
    type: 'kpi',
    kpiKey: kpi.key,
    vizType: kpi.defaultVizType,
    config: { unit: kpi.unit, description: kpi.description },
    exposure: kpi.key,
    position: { x: index * 3, y: 0, w: 3, h: 2 },
    isActive: true,
    dashboardId: 'main',
    userId: '',
    organizationId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((widget) => (
        <WidgetCard
          key={widget.id}
          widget={widget}
          isEditing={false}
          onRemove={() => {}}
          w={4}
          h={3}
        />
      ))}
    </div>
  );
}
