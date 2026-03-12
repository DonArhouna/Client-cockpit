import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { toast } from '@/hooks/use-toast';
import { Settings2, Eye, Plus, Trash2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { usePersonalization } from './PersonalizationContext';

const PERSONALIZABLE_PAGES = [
    { id: 'finance', labelKey: 'nav.cashFlowTracking' },
    { id: 'sales', labelKey: 'nav.salesAnalysis' },
    { id: 'purchases', labelKey: 'nav.purchasesAnalysis' },
    { id: 'stocks', labelKey: 'nav.stockTracking' },
    { id: 'accounting', labelKey: 'nav.accountingAnalytic' },
    { id: 'smart-queries', labelKey: 'nav.smartQueries' },
];

export function PersonalizationPage() {
    const { t } = useTranslation();
    const { isSidebarOpen, setIsSidebarOpen } = useDashboardEdit();
    const { layouts, addWidgetToPage, removeWidgetFromPage } = usePersonalization();
    const [selectedPage, setSelectedPage] = useState(PERSONALIZABLE_PAGES[0].id);

    const handleAddWidget = (widgetData: any) => {
        addWidgetToPage(selectedPage, widgetData);
        toast({
            title: "Indicateur ajouté",
            description: `${widgetData.name} a été ajouté à la page ${t(PERSONALIZABLE_PAGES.find(p => p.id === selectedPage)?.labelKey || '')}.`
        });
    };

    const currentPageLayout = layouts[selectedPage] || [];

    return (
        <div className="h-[calc(100vh-5rem)] flex overflow-hidden bg-slate-50/30">
            <div className="flex-1 flex flex-col min-w-0">
                {/* Section d'en-tête */}
                <div className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Personnalisation</h1>
                            <p className="text-xs text-slate-500 font-medium">Configurez vos indicateurs par domaine métier</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-2">
                            <Select value={selectedPage} onValueChange={setSelectedPage}>
                                <SelectTrigger className="w-[240px] border-none bg-transparent shadow-none focus:ring-0 font-semibold text-slate-700">
                                    <SelectValue placeholder="Choisir une page" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dashboard" className="font-medium">Tableau de Bord Principal</SelectItem>
                                    {PERSONALIZABLE_PAGES.map(page => (
                                        <SelectItem key={page.id} value={page.id} className="font-medium">
                                            {t(page.labelKey)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 font-bold shadow-sm border-slate-200"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Plus className="h-4 w-4" />
                            Bibliothéque de KPIs
                        </Button>

                        <NavLink to={selectedPage === 'dashboard' ? '/dashboard' : `/${selectedPage}`}>
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-2 font-bold shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700"
                            >
                                <Eye className="h-4 w-4" />
                                Enregistrer & Voir la page
                            </Button>
                        </NavLink>
                    </div>
                </div>

                {/* Zone d'aperçu */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Bannière d'état */}
                        <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Settings2 className="h-32 w-32 rotate-12" />
                            </div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-black uppercase tracking-wider">Aperçu : {t(PERSONALIZABLE_PAGES.find(p => p.id === selectedPage)?.labelKey || '')}</h2>
                                    <p className="text-blue-100 text-sm font-medium">Glissez-déposez ou supprimez vos indicateurs ci-dessous.</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/30">
                                    Mode Édition Actif
                                </div>
                            </div>
                        </div>

                        {/* Grille d'aperçu */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentPageLayout.map((widget) => (
                                <Card key={widget.id} className="group relative overflow-hidden border-2 border-slate-200 hover:border-primary/50 transition-all shadow-sm hover:shadow-md h-32 flex flex-col justify-center px-6">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-500 hover:bg-red-50"
                                            onClick={() => removeWidgetFromPage(selectedPage, widget.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{widget.name}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter mt-1">{widget.vizType}</p>
                                </Card>
                            ))}

                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 p-8 hover:bg-white hover:border-primary/30 transition-all group min-h-[128px]"
                            >
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Plus className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ajouter un KPI</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bibliothèque latérale */}
            {isSidebarOpen && (
                <WidgetSidebar
                    onClose={() => setIsSidebarOpen(false)}
                    onAddWidget={handleAddWidget}
                />
            )}
        </div>
    );
}
