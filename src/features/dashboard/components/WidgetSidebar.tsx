import { Input } from '@/components/ui/input';
import { X as XIcon, Plus as PlusIcon, Search as SearchIcon, Brain, ArrowLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { useKpiDefinitions, useWidgetTemplates, useKpiPacks } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { WidgetTemplate } from '@/types';

interface WidgetSidebarProps {
    onClose: () => void;
    onAddWidget: (widgetData: { name: string, type: string, vizType?: string, kpiKey?: string, config?: any }) => void;
    allowedDomains?: string[];
}

const DOMAIN_MAPPING: Record<string, string> = {
    'finance': 'Finance & Trésorerie',
    'rentabilite': 'Finance & Trésorerie',
    'tresorerie': 'Finance & Trésorerie',
    'finance_performance': 'Finance & Trésorerie',
    'controle_gestion': 'Finance & Trésorerie',
    'client': 'Ventes',
    'client_risque': 'Ventes',
    'risque': 'Ventes',
    'recouvrement': 'Ventes',
    'tresorerie_risque': 'Ventes',
    'ml_risque_client': 'Ventes',
    'achats': 'Achats',
    'tresorerie_achats': 'Achats',
    'achats_risque': 'Achats',
    'stock': 'Stocks',
    'stock_performance': 'Stocks',
    'stock_risque': 'Stocks',
    'comptabilite': 'Comptabilité',
    'analytique': 'Comptabilité',
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
            .map(domain => ({ name: domain, items: groups[domain] }));
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

    const filteredTemplates = useMemo(() => {
        const base = (widgetTemplates || []).filter(tpl => tpl.isActive);
        if (!searchQuery) return base;
        return base.filter(tpl => 
            tpl.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [widgetTemplates, searchQuery]);

    const filteredPacks = useMemo(() => {
        const base = (kpiPacks || []).filter(pack => pack.isActive);
        if (!searchQuery) return base;
        return base.filter(pack => 
            pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pack.label?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [kpiPacks, searchQuery]);

    // ── Étape 2 : sélection KPI pour un template ──────────────────
    if (pendingTemplate) {
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
        const compatibleKpis = (kpis ?? []).filter(kpi => kpi.isActive && compatibleVizTypes.includes(kpi.defaultVizType));
        const baseKpis = compatibleKpis.length > 0 ? compatibleKpis : (kpis ?? []).filter(k => k.isActive);
        const filteredKpis = baseKpis.filter(kpi =>
            kpiSearchQuery === '' ||
            kpi.name.toLowerCase().includes(kpiSearchQuery.toLowerCase()) ||
            kpi.key.toLowerCase().includes(kpiSearchQuery.toLowerCase())
        );

        return (
            <div className="w-[300px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 pt-6 pb-4 flex-shrink-0">
                    <button
                        onClick={() => { setPendingTemplate(null); setKpiSearchQuery(''); }}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em] opacity-80">Modèle</p>
                        <p className="font-black text-sm text-slate-900 dark:text-white truncate">{pendingTemplate.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <XIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Search KPI */}
                <div className="px-4 pb-4 flex-shrink-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 px-1">
                        Choisissez un indicateur à afficher
                        {compatibleKpis.length > 0 && (
                            <span className="ml-1 text-primary font-semibold">({compatibleKpis.length} compatibles)</span>
                        )}
                    </p>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Rechercher un KPI..."
                            className="pl-9 bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-sm"
                            value={kpiSearchQuery}
                            onChange={(e) => setKpiSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* KPI List */}
                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 no-scrollbar">
                    {filteredKpis.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-10">Aucun KPI trouvé</p>
                    ) : (
                        filteredKpis.map((kpi) => (
                            <div
                                key={kpi.id}
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer group"
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
                                    <div className="font-medium text-sm text-slate-700 dark:text-slate-200 group-hover:text-primary truncate">{kpi.name}</div>
                                    <div className="text-xs text-slate-400 truncate">{kpi.key}</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // ── Vue principale ─────────────────────────────────────────────
    return (
        <div className="w-[300px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-6 pb-2 flex-shrink-0">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em] opacity-80">Dashboard</p>
                    <p className="font-black text-sm text-slate-900 dark:text-white">Ajouter un widget</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <XIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Search */}
            <div className="px-4 pt-3 pb-2 flex-shrink-0">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Rechercher un indicateur..."
                        className="pl-9 bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6 space-y-6 no-scrollbar">

                {/* Modèles de widgets */}
                {filteredTemplates.length > 0 && (
                <div className="space-y-2">
                    {!searchQuery && <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Modèles</p>}
                    {isLoadingTemplates ? (
                        <Skeleton className="h-10 w-full rounded-xl" />
                    ) : (
                        filteredTemplates.map((tpl) => (
                            <div
                                key={tpl.id}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group',
                                    'hover:bg-primary/5 hover:text-primary'
                                )}
                                onClick={() => setPendingTemplate(tpl)}
                            >
                                <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/15 transition-colors flex-shrink-0">
                                    <PlusIcon className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary truncate flex-1">{tpl.name}</span>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                            </div>
                        ))
                    )}
                </div>
                )}

                {/* Packs KPI */}
                {filteredPacks.length > 0 && (
                <div className="space-y-2">
                    {!searchQuery && <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Packs KPI</p>}
                    {isLoadingPacks ? (
                        <Skeleton className="h-10 w-full rounded-xl" />
                    ) : (
                        filteredPacks.map((pack) => (
                            <div
                                key={pack.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-all cursor-pointer group"
                                onClick={() => {
                                    if (!kpis) return;
                                    pack.kpiKeys.forEach((key: string) => {
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
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                                    <Brain className="h-3.5 w-3.5 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary truncate block">{pack.label || pack.name}</span>
                                    <span className="text-[10px] font-medium text-emerald-600">{pack.kpiKeys.length} indicateurs</span>
                                </div>
                                <PlusIcon className="h-4 w-4 text-slate-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                            </div>
                        ))
                    )}
                </div>
                )}

                {/* Indicateurs par catégorie */}
                <div className="space-y-4">
                    {!searchQuery && <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Indicateurs Sage 100</p>}

                    {isLoading ? (
                        <div className="space-y-3">
                            {Array(4).fill(0).map((_, i) => (
                                <div key={i} className="space-y-1">
                                    <Skeleton className="h-3 w-24 rounded" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6">Aucun indicateur trouvé</p>
                    ) : (
                        filteredCategories.map((category) => (
                            <div key={category.name} className="space-y-1">
                                {!searchQuery && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">{category.name}</p>}
                                {category.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-colors group cursor-pointer"
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
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary truncate">{item.name}</span>
                                                {(item.category?.includes('ml') || item.category?.includes('prevision')) && (
                                                    <span className="flex items-center gap-0.5 bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border border-purple-100 italic flex-shrink-0">
                                                        <Brain className="h-2.5 w-2.5" />
                                                        AI
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                                        </div>
                                        <PlusIcon className="h-4 w-4 text-slate-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-200/50 dark:border-slate-800/50 flex-shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center">
                    {kpis?.length || 0} indicateurs · {widgetTemplates?.length || 0} modèles · {kpiPacks?.length || 0} packs
                </p>
            </div>
        </div>
    );
}
