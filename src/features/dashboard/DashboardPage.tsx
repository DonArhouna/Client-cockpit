import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Calendar, ChevronDown } from 'lucide-react';
import { useMyDashboard, useUpdateWidget } from '@/hooks/use-dashboards';
import { DashboardGrid } from './components/DashboardGrid';
import { WidgetSidebar } from './components/WidgetSidebar';
import { useKpiDefinitions } from '@/hooks/use-api';
import { PAGE_DEFAULT_WIDGETS } from '@/features/personalization/DefaultLayouts';
import { cn } from '@/lib/utils';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { getLastUpdate, forceRefresh } from '@/lib/cache';
import { useFilters } from '@/context/FilterContext';
import { useAuth } from '@/features/auth/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KpiSearchBar } from '@/components/shared/KpiSearchBar';
import { InsightBanner } from '@/components/shared/InsightBanner';
import { PageInsight } from '@/components/shared/PageInsight';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useMemo } from 'react';

// ── Welcome Banner ───────────────────────────────────────────────
function WelcomeBanner({ lastUpdate, onRefresh, isLoading }: {
  lastUpdate: string | null;
  onRefresh: () => void;
  isLoading: boolean;
}) {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const firstName = user?.firstName ?? '';

  return (
    <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-4 flex-shrink-0 animate-fade-up">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {greeting}{firstName ? `, ${firstName}` : ''} 👋
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Voici une synthèse de votre tableau de bord exécutif.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 pt-1">
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          <span>Mis à jour : {lastUpdate ?? '--:--'}</span>
        </button>
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

  const { period, setPeriod, currency, setCurrency } = useFilters();
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
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex w-full overflow-x-hidden relative bg-slate-50/20 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pr-80' : ''}`}>

        {/* ── Welcome banner ────────────────────────────────── */}
        <WelcomeBanner lastUpdate={lastUpdate} onRefresh={handleRefresh} isLoading={isBackendLoading} />

        {/* Barre d'outils unifiée (Filtres) */}
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
                Mis à jour: {lastUpdate || '--:--'}
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
