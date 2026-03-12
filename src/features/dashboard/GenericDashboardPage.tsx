import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Plus, Layout, Calendar, ChevronDown, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { DashboardGrid } from './components/DashboardGrid';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { cn } from '@/lib/utils';
import { useFilters } from '@/context/FilterContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GenericDashboardPageProps {
    pageId: string;
    titleKey: string;
    subtitle?: string;
}

/**
 * Page de tableau de bord générique pour les différents domaines métiers (Ventes, Achats, etc.).
 * Utilise la grille dynamic `DashboardGrid` pour afficher les KPIs personnalisés.
 */
export function GenericDashboardPage({ pageId, titleKey, subtitle }: GenericDashboardPageProps) {
    const { t } = useTranslation();
    const { layouts, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { period, setPeriod, currency, setCurrency } = useFilters();
    const { isEditing, setIsEditing, isSidebarOpen } = useDashboardEdit();

    const widgets = layouts[pageId] || [];

    const handleLayoutChange = (layoutUpdates: Record<string, { x: number, y: number, w: number, h: number }>) => {
        updateLayoutForPage(pageId, layoutUpdates);
    };

    const handleRemoveWidget = (widgetId: string) => {
        removeWidgetFromPage(pageId, widgetId);
    };

    return (
        <div className="space-y-6 min-h-screen bg-slate-50/20 w-full">
            {/* En-tête Unifié */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">{t(titleKey)}</h1>
                    <p className="text-slate-500 text-sm font-medium">{subtitle || "Tableau de bord personnalisé pour votre activité."}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Filtres Globaux */}
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-between gap-2 px-3 py-1.5 border rounded-md text-sm font-medium bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-sm min-w-[160px]">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Calendar className="h-4 w-4 text-primary/70" />
                                        <span>{period === 'current_quarter' ? 'Trimestre actuel' : period === 'current_month' ? 'Mois actuel' : 'Année en cours'}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[180px]">
                                <DropdownMenuItem onClick={() => setPeriod('current_month')}>Mois actuel</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPeriod('current_quarter')}>Trimestre actuel</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPeriod('current_year')}>Année en cours</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-between gap-2 px-3 py-1.5 border rounded-md text-sm font-medium bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-sm w-[90px]">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <span className="text-primary/70 text-[10px] font-black uppercase tracking-tighter">
                                            {currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'F'}
                                        </span>
                                        <span>{currency}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[100px]">
                                <DropdownMenuItem onClick={() => setCurrency('XOF')}>XOF (F CFA)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCurrency('EUR')}>EUR (€)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCurrency('USD')}>USD ($)</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {isEditing && (
                        <>
                            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

                            {/* Actions de Personnalisation */}
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => setIsEditing(false)}
                                    variant="default"
                                    className="gap-2 font-bold shadow-sm transition-all bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <X className="h-4 w-4" />
                                    Quitter l'agencement
                                </Button>

                                <NavLink to="/personalization">
                                    <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/50 text-primary font-bold transition-all shadow-sm">
                                        <Plus className="h-4 w-4" />
                                        <span className="hidden sm:inline">KPI Library</span>
                                    </Button>
                                </NavLink>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className={cn(
                "relative transition-all duration-300 pb-20",
                isSidebarOpen ? "pr-80" : ""
            )}>
                <DashboardGrid
                    widgets={widgets}
                    isEditing={isEditing}
                    onLayoutChangeAction={handleLayoutChange}
                    onRemoveWidget={handleRemoveWidget}
                />

                {isEditing && widgets.length > 0 && (
                    <div className="mt-12 flex justify-center">
                        <NavLink to="/personalization">
                            <Button variant="outline" className="gap-4 border-2 border-dashed px-10 py-8 h-auto hover:bg-white hover:border-primary/50 transition-all rounded-2xl group border-slate-200 bg-slate-50/30">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                    <Plus className="h-6 w-6 text-slate-400 group-hover:text-primary" />
                                </div>
                                <div className="text-left">
                                    <p className="text-base font-black text-slate-700">Encore des indicateurs ?</p>
                                    <p className="text-xs text-slate-400 font-medium">Ouvrir la bibliothèque de KPIs pour {t(titleKey).toLowerCase()}</p>
                                </div>
                            </Button>
                        </NavLink>
                    </div>
                )}

                {widgets.length === 0 && !isEditing && (
                    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl text-center bg-white/50 border-slate-200">
                        <div className="p-6 bg-slate-100 rounded-full mb-6">
                            <Layout className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun indicateur configuré</h3>
                        <p className="text-slate-500 max-w-sm mb-8 font-medium">
                            Personnalisez cette page en ajoutant vos indicateurs clés de performance ({t(titleKey).toLowerCase()}).
                        </p>
                        <NavLink to="/personalization">
                            <Button className="gap-2 px-8 py-6 h-auto text-lg font-black shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                                Ajouter mes premiers KPIs
                            </Button>
                        </NavLink>
                    </div>
                )}
            </div>
        </div>
    );
}
