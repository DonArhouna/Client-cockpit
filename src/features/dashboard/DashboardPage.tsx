import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useMyDashboard, useUpdateWidget } from '@/hooks/use-dashboards';
import { DashboardGrid } from './components/DashboardGrid';
import { WidgetSidebar } from './components/WidgetSidebar';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { useKpiDefinitions } from '@/hooks/use-api';
import { PAGE_DEFAULT_WIDGETS } from '@/features/personalization/DefaultLayouts';
import { cn } from '@/lib/utils';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { getLastUpdate, forceRefresh } from '@/lib/cache';
import { useFilters } from '@/context/FilterContext';
import { useAuth } from '@/features/auth/AuthContext';
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';
import { InsightBanner } from '@/components/shared/InsightBanner';
import { PageInsight } from '@/components/shared/PageInsight';
import { useKpiData } from '@/hooks/use-kpi-data';

// ── Welcome Banner ───────────────────────────────────────────────
function DashboardHeader() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const firstName = user?.firstName ?? '';
  
  const today = new Intl.DateTimeFormat('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <div className="px-6 pt-4 pb-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Tableau de Bord Exécutif
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-all">
            {greeting}{firstName ? `, ${firstName}` : ''}. Voici le point sur votre activité ce <span className="text-primary font-bold">{today}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: dashboard, isLoading: isBackendLoading } = useMyDashboard();
  const { layouts, addWidgetToPage, removeWidgetFromPage, updateLayoutForPage, setPageLayout } = usePersonalization();

  const updateWidget = useUpdateWidget();

  const { isEditing, setIsEditing, isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();

  const { data: kpiDefinitions, isLoading: isKpisLoading } = useKpiDefinitions();
  const [isInitialized, setIsInitialized] = useState(false);

  // Widgets unifiés
  const personalizedWidgets = layouts['dashboard'] || [];
  
  // Gestion de la touche Echap pour quitter le mode édition
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditing) {
        setIsEditing(false);
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isEditing, setIsEditing, setIsSidebarOpen]);

  // Peupler par défaut s'il n'y a rien
  useEffect(() => {
    if (!isKpisLoading && kpiDefinitions && personalizedWidgets.length === 0 && !isInitialized) {
      setIsInitialized(true);
      const defaultWidgets = PAGE_DEFAULT_WIDGETS['dashboard'](kpiDefinitions);
      const initialWidgets = defaultWidgets.map((w, index) => ({
        ...w,
        id: `dashboard-${Date.now()}-${index}`,
        dashboardId: 'local-personalization',
        isActive: true,
        userId: 'local-user',
        organizationId: 'local-org',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setPageLayout('dashboard', initialWidgets as any);
    }
  }, [isKpisLoading, kpiDefinitions, personalizedWidgets.length, isInitialized, setPageLayout]);

  const widgets = personalizedWidgets.length > 0 ? personalizedWidgets : (dashboard?.widgets || []);

  const { currency } = useFilters();
  const { data: caData } = useKpiData('ca');

  const dashboardInsight = useMemo(() => {
    if (!caData) return null;
    const formatter = new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: currency, 
      maximumFractionDigits: 0 
    });
    const val = formatter.format(caData.current);
    const trendVal = caData.trend || 0;
    const trendStr = trendVal > 0 ? `+${trendVal.toFixed(1)}%` : `${trendVal.toFixed(1)}%`;
    const targetPct = caData.target ? ((caData.current / caData.target) * 100).toFixed(0) : '0';
    
    return {
      text: `Le chiffre d'affaires du mois atteint ${val}, en ${trendVal >= 0 ? 'hausse' : 'baisse'} de ${trendStr} vs le mois précédent. L'objectif mensuel est atteint à ${targetPct}%. La dynamique globale est ${trendVal >= 0 ? 'positive' : 'incertaine'}.`,
      variant: (trendVal > 0 ? 'success' : trendVal < 0 ? 'danger' : 'info') as any
    };
  }, [caData, currency]);

  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdate(getLastUpdate());
  }, []);

  const handleRefresh = () => {
    forceRefresh();
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
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex w-full overflow-x-hidden relative bg-slate-50/20 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pr-[332px]' : ''}`}>

        {/* ── Dashboard Header ────────────────────────────────── */}
        <DashboardHeader />

        {/* Barre d'outils */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 px-6 flex-shrink-0">
          <div className="flex-1 flex justify-center">
            <KpiSearchBar placeholder="Posez votre question sur le tableau de bord Exécutif" />
          </div>

          <div className="flex items-center gap-3">
            {isEditing && (
              <Button
                variant="default"
                size="sm"
                className="gap-2 bg-[#3b66ac] hover:bg-[#2d5089] text-white font-bold h-9 shadow-md"
                onClick={() => { setIsEditing(false); setIsSidebarOpen(false); }}
              >
                Terminer
              </Button>
            )}

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
               <button 
                onClick={handleRefresh}
                className="hover:rotate-180 transition-transform duration-500 p-1"
               >
                 <RefreshCw className={cn("h-3.5 w-3.5 text-slate-500", isBackendLoading && "animate-spin")} />
               </button>
               <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 border-l pl-2 border-slate-200 dark:border-slate-800">
                Maj: {lastUpdate || '--:--'}
              </span>
            </div>

          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-6">
          {/* Page Insight (placé juste sous les filtres) */}
          {dashboardInsight && (
            <div className="mt-2 text-slate-900 dark:text-slate-100">
              <PageInsight
                icon="TrendingUp"
                label="Indicateur clé"
                text={dashboardInsight.text}
                variant={dashboardInsight.variant}
              />
            </div>
          )}

          {/* Insight alerts */}
          <InsightBanner />
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
        className={`fixed right-4 top-6 bottom-6 z-50 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+1.5rem)] opacity-0 pointer-events-none'}`}
      >
        <WidgetSidebar
            onClose={() => setIsSidebarOpen(false)}
            onAddWidget={handleAddWidget}
        />
      </div>
    </div>
  );
}
