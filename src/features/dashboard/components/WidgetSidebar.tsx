import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { X as XIcon, Plus as PlusIcon, Search as SearchIcon, Brain, ArrowLeft, ChevronRight } from 'lucide-react';
import { useKpiDefinitions, useWidgetTemplates, useKpiPacks } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import type { WidgetTemplate } from '@/types';

interface WidgetSidebarProps {
    onClose: () => void;
    onAddWidget: (widgetData: { name: string, type: string, vizType?: string, kpiKey?: string, config?: any }) => void;
    allowedDomains?: string[];
}

const DOMAIN_MAPPING: Record<string, string> = {
    // 1. FINANCE & TRÉSORERIE
    'finance': 'Finance & Trésorerie',
    'rentabilite': 'Finance & Trésorerie',
    'tresorerie': 'Finance & Trésorerie',
    'finance_performance': 'Finance & Trésorerie',
    'controle_gestion': 'Finance & Trésorerie',

    // 2. VENTES (Client)
    'client': 'Ventes',
    'client_risque': 'Ventes',
    'risque': 'Ventes',
    'recouvrement': 'Ventes',
    'tresorerie_risque': 'Ventes',
    'ml_risque_client': 'Ventes',

    // 3. ACHATS (Fournisseur)
    'achats': 'Achats',
    'tresorerie_achats': 'Achats',
    'achats_risque': 'Achats',

    // 4. STOCKS & ARTICLES
    'stock': 'Stocks',
    'stock_performance': 'Stocks',
    'stock_risque': 'Stocks',

    // 5. COMPTABILITÉ & ANALYTIQUE
    'comptabilite': 'Comptabilité',
    'analytique': 'Comptabilité',

    // 6. IA & PRÉDICTIONS
    'ml_prevision': 'Requêtes Intelligentes',
    'ml_stock': 'Requêtes Intelligentes',
    'ml_audit': 'Requêtes Intelligentes',
    'ml_tresorerie': 'Requêtes Intelligentes',
    'risque_ml': 'Requêtes Intelligentes'
};

const DOMAIN_ORDER = [
    'Finance & Trésorerie',
    'Ventes',
    'Achats',
    'Stocks',
    'Comptabilité',
    'Requêtes Intelligentes'
];

export function WidgetSidebar({ onClose, onAddWidget, allowedDomains }: WidgetSidebarProps) {
    const { data: kpis, isLoading } = useKpiDefinitions();
    const { data: widgetTemplates, isLoading: isLoadingTemplates } = useWidgetTemplates();
    const { data: kpiPacks, isLoading: isLoadingPacks } = useKpiPacks();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('widgets');
    // Étape 2 : sélection KPI pour un template
    const [pendingTemplate, setPendingTemplate] = useState<WidgetTemplate | null>(null);
    const [kpiSearchQuery, setKpiSearchQuery] = useState('');

    const categories = useMemo(() => {
        if (!kpis) return [];

        const groups: Record<string, any[]> = {};

        kpis.forEach(kpi => {
            const domain = DOMAIN_MAPPING[kpi.category] || 'Autres Indicateurs';
            if (!groups[domain]) groups[domain] = [];
            groups[domain].push(kpi);
        });

        return DOMAIN_ORDER
            .filter(domain => groups[domain])
            .filter(domain => !allowedDomains || allowedDomains.includes(domain))
            .map(domain => ({
                name: domain,
                items: groups[domain]
            }));
    }, [kpis, allowedDomains]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;

        return categories.map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(cat => cat.items.length > 0);
    }, [categories, searchQuery]);

    // Panneau de sélection de KPI pour un template
    if (pendingTemplate) {
        // Groupes de vizTypes compatibles entre eux
        const VIZ_COMPAT: Record<string, string[]> = {
            card: ['card'],
            pie: ['pie', 'donut'],
            donut: ['pie', 'donut'],
            area: ['area', 'line', 'bar'],
            line: ['area', 'line', 'bar'],
            bar: ['area', 'line', 'bar'],
            table: ['table'],
        };
        const compatibleVizTypes = VIZ_COMPAT[pendingTemplate.vizType] ?? [pendingTemplate.vizType];

        const compatibleKpis = (kpis ?? []).filter(kpi =>
            kpi.isActive && compatibleVizTypes.includes(kpi.defaultVizType)
        );
        // Fallback : si aucun KPI compatible, on affiche tous les KPI actifs
        const baseKpis = compatibleKpis.length > 0 ? compatibleKpis : (kpis ?? []).filter(k => k.isActive);

        const filteredKpis = baseKpis.filter(kpi =>
            kpiSearchQuery === '' ||
            kpi.name.toLowerCase().includes(kpiSearchQuery.toLowerCase()) ||
            kpi.key.toLowerCase().includes(kpiSearchQuery.toLowerCase())
        );

        return (
            <div className="w-80 border-l bg-background h-full flex flex-col shadow-sm">
                <div className="flex items-center gap-2 p-4 border-b">
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => { setPendingTemplate(null); setKpiSearchQuery(''); }}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Template sélectionné</p>
                        <p className="font-semibold text-sm truncate">{pendingTemplate.name}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClose}>
                        <XIcon className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 border-b">
                    <p className="text-sm text-muted-foreground mb-3">
                        Quel KPI voulez-vous afficher dans ce <span className="font-medium text-slate-700">{pendingTemplate.vizType}</span> ?
                        {compatibleKpis.length > 0 && (
                            <span className="ml-1 text-xs text-primary font-medium">({compatibleKpis.length} compatibles)</span>
                        )}
                    </p>
                    <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher un KPI..."
                            className="pl-8 bg-muted/50"
                            value={kpiSearchQuery}
                            onChange={(e) => setKpiSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredKpis.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Aucun KPI trouvé</p>
                    ) : (
                        filteredKpis.map((kpi) => (
                            <div
                                key={kpi.id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                                onClick={() => {
                                    onAddWidget({
                                        name: kpi.name,
                                        type: 'kpi',
                                        vizType: pendingTemplate.vizType,
                                        kpiKey: kpi.key,
                                        config: { description: kpi.description, unit: kpi.unit },
                                    });
                                    setPendingTemplate(null);
                                    setKpiSearchQuery('');
                                }}
                            >
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="font-medium text-sm truncate">{kpi.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{kpi.key}</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 border-l bg-background h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex-1">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="widgets">Widgets</TabsTrigger>
                            <TabsTrigger value="recent">Requêtes récentes</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0" onClick={onClose}>
                    <XIcon className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-4 border-b">
                <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher un indicateur..."
                        className="pl-8 bg-muted/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsContent value="widgets" className="flex-1 overflow-y-auto m-0">
                    <div className="p-4 space-y-6">
                        <div className="space-y-3">
                            <h3 className="font-medium text-sm text-slate-900 flex items-center gap-2">
                                <PlusIcon className="h-4 w-4 text-primary" />
                                Modèles de Widgets
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {isLoadingTemplates ? (
                                    <Skeleton className="h-16 w-full" />
                                ) : (
                                    widgetTemplates?.filter(tpl => tpl.isActive).map((tpl) => (
                                        <div
                                            key={tpl.id}
                                            className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/30 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                                            onClick={() => setPendingTemplate(tpl)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-white rounded-md shadow-sm border border-blue-100 group-hover:border-blue-200 transition-colors">
                                                    <PlusIcon className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{tpl.name}</span>
                                            </div>
                                            <PlusIcon className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <h3 className="font-medium">Packs de KPIs Groupés</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {isLoadingPacks ? (
                                <Skeleton className="h-16 w-full" />
                            ) : kpiPacks?.filter(pack => pack.isActive).length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground">Aucun pack disponible</p>
                                </div>
                            ) : (
                                kpiPacks?.filter(pack => pack.isActive).map((pack) => (
                                    <div
                                        key={pack.id}
                                        className="flex flex-col p-3 border rounded-lg bg-emerald-50/30 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer group"
                                        onClick={() => {
                                            if (!kpis) return;
                                            pack.kpiKeys.forEach((key) => {
                                                const kpiDef = kpis.find(k => k.key === key);
                                                if (kpiDef) {
                                                    onAddWidget({
                                                        name: kpiDef.name,
                                                        type: 'kpi',
                                                        vizType: kpiDef.defaultVizType || 'card',
                                                        kpiKey: kpiDef.key,
                                                        config: { description: kpiDef.description, unit: kpiDef.unit }
                                                    });
                                                }
                                            });
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-white rounded-md shadow-sm border border-emerald-100 group-hover:border-emerald-200 transition-colors">
                                                    <Brain className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{pack.label || pack.name}</span>
                                            </div>
                                            <PlusIcon className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        {pack.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">{pack.description}</p>
                                        )}
                                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                {pack.kpiKeys.length} Indicateurs
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm mt-6">
                            <h3 className="font-medium">Indicateurs Sage 100</h3>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-20 w-full rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">Aucun indicateur trouvé</p>
                            </div>
                        ) : (
                            filteredCategories.map((category) => (
                                <div key={category.name} className="space-y-3">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {category.name}
                                    </h4>
                                    <div className="space-y-2">
                                        {category.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-start justify-between p-3 border rounded-lg bg-card hover:border-primary/50 hover:bg-muted/30 transition-colors group cursor-pointer"
                                                onClick={() => {
                                                    onAddWidget({
                                                        name: item.name,
                                                        type: 'kpi',
                                                        vizType: item.defaultVizType || 'card',
                                                        kpiKey: item.key,
                                                        config: { description: item.description, unit: item.unit }
                                                    });
                                                }}
                                            >
                                                <div className="pr-4 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium text-sm">{item.name}</div>
                                                        {(item.category?.includes('ml') || item.category?.includes('prevision')) && (
                                                            <div className="flex items-center gap-1 bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border border-purple-100 italic">
                                                                <Brain className="h-2.5 w-2.5" />
                                                                AI Ready
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                        {item.description}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                >
                                                    <PlusIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 border-t bg-slate-50/50">
                        <p className="text-[10px] text-slate-400 font-medium text-center uppercase tracking-tighter">
                            {kpis?.length || 0} Indicateurs + {widgetTemplates?.length || 0} Templates + {kpiPacks?.length || 0} Packs
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="recent" className="flex-1 overflow-y-auto m-0">
                    <div className="p-4">
                        <div className="text-center py-12 text-sm text-muted-foreground">
                            <p>Aucune requête récente</p>
                            <p className="text-xs mt-2">Vos dernières requêtes NLQ apparaîtront ici</p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
