import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useMyDashboard, useUpdateWidget, useRemoveWidget, useCreateDashboard } from '@/hooks/use-dashboards';
import { DashboardGrid } from './components/DashboardGrid';
import { WidgetSidebar } from './components/WidgetSidebar';
import { DashboardKpis } from './components/DashboardKpis';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useFilters } from '@/context/FilterContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';
import { Calendar, ChevronDown } from 'lucide-react';

export function DashboardPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: dashboard, isLoading: isBackendLoading, error, refetch } = useMyDashboard();
  const { layouts, addWidgetToPage, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();

  const updateWidget = useUpdateWidget();
  const removeWidget = useRemoveWidget();
  const createDashboard = useCreateDashboard();

  const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();

  // Widgets unifiés
  const personalizedWidgets = layouts['dashboard'] || [];
  const widgets = personalizedWidgets.length > 0 ? personalizedWidgets : (dashboard?.widgets || []);

  const handleCreateDashboard = () => {
    createDashboard.mutate({
      name: 'Mon Cockpit',
      isDefault: true
    }, {
      onError: (err: any) => {
        toast({
          title: "Erreur",
          description: err?.response?.data?.message || "Impossible de créer le cockpit",
          variant: "destructive"
        });
      }
    });
  };

  const { period, setPeriod, currency, setCurrency } = useFilters();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Actualisation",
      description: "Les données de votre cockpit ont été mises à jour.",
    });
  };

  const handleLayoutChange = (layoutUpdates: Record<string, { x: number, y: number, w: number, h: number }>) => {
    updateLayoutForPage('dashboard', layoutUpdates);
    if (dashboard) {
      Object.entries(layoutUpdates).forEach(([widgetId, position]) => {
        if (!widgetId.startsWith('local-')) {
          updateWidget.mutate({
            dashboardId: dashboard.id,
            widgetId,
            data: { position }
          });
        }
      });
    }
  };

  const handleAddWidget = (widgetData: any) => {
    addWidgetToPage('dashboard', widgetData);
  };

  const handleRemoveWidget = (widgetId: string) => {
    removeWidgetFromPage('dashboard', widgetId);
  };

  if (isBackendLoading && widgets.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex w-full overflow-x-hidden relative bg-slate-50/20 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pr-80' : ''}`}>

        {/* Breadcrumbs & Title */}
        <div className="px-6 pt-6 flex flex-col gap-6 flex-shrink-0">
          <Breadcrumbs currentPage="Tableau de bord" PageIcon={LayoutDashboard} />
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Tableau de bord Exécutif</h1>
        </div>

        {/* Barre d'outils unifiée */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm min-w-[160px]">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{period === 'current_quarter' ? 'Ce trimestre' : period === 'current_month' ? 'Ce mois' : 'Cette année'}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[160px]">
                <DropdownMenuItem onClick={() => setPeriod('current_month')}>Ce mois</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod('current_quarter')}>Ce trimestre</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod('current_year')}>Cette année</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm w-[110px]">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <span className="text-primary text-xs font-bold">
                      {currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'FCFA'}
                    </span>
                    <span className="text-xs">{currency}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[110px]">
                <DropdownMenuItem onClick={() => setCurrency('XOF')}>XOF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency('EUR')}>EUR</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency('USD')}>USD</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex-1 flex justify-center">
            <KpiSearchBar placeholder="Posez votre question sur le tableau de bord Exécutif" />
          </div>

          <div className="flex items-center gap-3">
            {isEditing && (
              <Button
                variant="default"
                size="sm"
                className="gap-2 bg-[#3b66ac] hover:bg-[#2d5089] text-white"
                onClick={() => setIsEditing(false)}
              >
                Terminer
              </Button>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleRefresh}
              >
                <RefreshCw className={cn("h-4 w-4", isBackendLoading && "animate-spin")} />
              </Button>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Mis à jour: 09:36
              </span>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-6">
          <DashboardKpis />
          <DashboardGrid
            widgets={widgets}
            isEditing={isEditing}
            onLayoutChangeAction={handleLayoutChange}
            onRemoveWidget={handleRemoveWidget}
          />
        </div>
      </div>

      {/* Sidebar de widgets */}
      <div
        className={`absolute top-0 right-0 bottom-0 h-full z-20 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <WidgetSidebar
          onClose={() => setIsSidebarOpen(false)}
          onAddWidget={handleAddWidget}
        />
      </div>
    </div>
  );
}
