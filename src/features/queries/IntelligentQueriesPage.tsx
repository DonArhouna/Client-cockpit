import { useState, useEffect, useMemo } from 'react';
import {
    Mic,
    MessageSquare,
    TrendingUp,
    AlertTriangle,
    RotateCcw,
    LayoutDashboard,
    BarChart3,
    Sparkles,
    CheckCircle2,
    Loader2,
    Target,
    History,
    RefreshCw,
    ChevronDown,
    Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useKpiDefinitions, useNLQQuery, useJobStatus } from '@/hooks/use-api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';
import { PageInsight } from '@/components/shared/PageInsight';

const PAGE_ID = 'smart-queries';

export function IntelligentQueriesPage() {
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStep, setProcessStep] = useState(0);
    const [jobId, setJobId] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const { isEditing, setIsEditing } = useDashboardEdit();
    const { layouts, addWidgetToPage, removeWidgetFromPage, updateLayoutForPage } = usePersonalization();
    const { isLoading } = useKpiDefinitions();

    const nlqQuery = useNLQQuery();
    const { data: jobStatus } = useJobStatus(jobId, { enabled: !!jobId && processStep >= 3 });

    const widgets = useMemo(() => layouts[PAGE_ID] || [], [layouts]);

    const suggestions = [
        "Quel est notre chiffre d'affaires ce mois-ci ?",
        "Montrez-moi les créances clients en retard",
        "Comparez les revenus T3 vs T2 2024",
        "Quels sont nos top 5 clients par CA ?",
        "Analysez la marge brute par produit",
        "Évolution du DSO sur 6 mois",
    ];

    const filterTabs = [
        { id: 'all', label: "Vue d'ensemble", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
        { id: 'trends', label: "Tendances", icon: <TrendingUp className="h-3.5 w-3.5" /> },
        { id: 'comparisons', label: "Comparaisons", icon: <BarChart3 className="h-3.5 w-3.5" /> },
        { id: 'predictions', label: "Prévisions", icon: <Sparkles className="h-3.5 w-3.5" /> },
    ];

    const handleAnalyze = async (text?: string) => {
        const queryText = text || query;
        if (!queryText.trim()) return;

        setQuery(queryText);
        setIsProcessing(true);
        setShowResult(false);
        setProcessStep(1);
        setJobId(null);

        setTimeout(() => setProcessStep(2), 1500);

        setTimeout(async () => {
            setProcessStep(3);
            try {
                const result = await nlqQuery.mutateAsync(queryText);
                setJobId(result.jobId);
            } catch (error) {
                console.error("NLQ Query Error:", error);
                setIsProcessing(false);
            }
        }, 3000);
    };

    useEffect(() => {
        if (jobStatus?.status === 'COMPLETED' && processStep === 3) {
            setProcessStep(4);
            setTimeout(() => {
                setIsProcessing(false);
                setShowResult(true);
            }, 1500);
        } else if (jobStatus?.status === 'FAILED') {
            setIsProcessing(false);
        }
    }, [jobStatus, processStep]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const processingSteps = [
        { id: 1, label: "Analyse de la requête" },
        { id: 2, label: "Validation des données" },
        { id: 3, label: "Exécution de la requête" },
        { id: 4, label: "Génération du visuel" },
    ];

    return (
        <div className="flex h-full w-full overflow-hidden bg-background text-foreground transition-colors duration-300">
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isEditing ? 'mr-80' : ''}`}>
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Requêtes Intelligentes
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                    Posez vos questions en langage naturel et obtenez des visualisations instantanées
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 font-bold">
                                    <History className="h-4 w-4" />
                                    Historique
                                </Button>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                    Données synchronisées
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Main Content */}
                    <div className="flex-1 px-6 pb-6 space-y-6">
                        {/* Language Selector */}
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                                        <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded">FR</span>
                                        Français
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>🇫🇷 Français</DropdownMenuItem>
                                    <DropdownMenuItem>🇬🇧 English</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-3xl mx-auto">
                            <div className="flex items-center bg-background border border-border rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                                <div className="flex items-center justify-center h-12 w-12 text-muted-foreground">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    className="flex-1 h-12 bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium placeholder:text-muted-foreground px-2"
                                    placeholder="Posez votre question sur les données financières..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                />
                                <div className="flex items-center gap-1 pr-2">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg">
                                        <Mic className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        className="h-9 px-5 rounded-lg font-semibold bg-[#3b66ac] hover:bg-[#2d5089] text-white text-sm transition-colors"
                                        onClick={() => handleAnalyze()}
                                    >
                                        Analyser
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* State Initial: Suggestions, Insight et Empty State */}
                        {!isProcessing && !showResult && (
                            <div className="space-y-8 pb-10">
                                {/* Suggestions Section */}
                                <div className="max-w-3xl mx-auto space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-foreground">Suggestions de requêtes</h3>
                                        <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                                            <RefreshCw className="h-3 w-3" />
                                            Actualiser
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAnalyze(s)}
                                                className="flex items-center gap-3 p-3 text-left rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-accent/50 transition-all group"
                                            >
                                                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                                                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                                                    {s}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Filter Tabs */}
                                    <div className="flex items-center gap-3 pt-2">
                                        {filterTabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                                    activeTab === tab.id
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                                )}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Page Insight (placé sous les suggestions et onglets de filtrage) */}
                                <div className="max-w-3xl mx-auto px-1">
                                    <PageInsight
                                        icon="Zap"
                                        label="Recommandation IA"
                                        text="Posez une question en langage naturel pour analyser vos données instantanément. Suggestion du jour : 'Quel est l'impact des impayés sur la trésorerie du trimestre ?'"
                                        variant="info"
                                    />
                                </div>

                                {/* Empty State Section */}
                                <div className="py-6 space-y-10 max-w-3xl mx-auto">
                                    <div className="text-center space-y-3">
                                        <div className="h-14 w-14 flex items-center justify-center bg-accent rounded-2xl mx-auto">
                                            <MessageSquare className="h-7 w-7 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">
                                            Commencez par poser une question
                                        </h3>
                                        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                                            Utilisez le langage naturel pour explorer vos données financières. Notre IA comprend vos questions et génère automatiquement les visualisations appropriées.
                                        </p>
                                    </div>

                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            {
                                                title: "Chiffre d'affaires en hausse",
                                                desc: "Le CA de septembre affiche +12.3% vs août",
                                                color: "border-emerald-200 dark:border-emerald-900/50",
                                                icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
                                                iconBg: "bg-emerald-50 dark:bg-emerald-900/30"
                                            },
                                            {
                                                title: "DSO sous contrôle",
                                                desc: "34 jours en moyenne, -3 jours vs objectif",
                                                color: "border-blue-200 dark:border-blue-900/50",
                                                icon: <Target className="h-4 w-4 text-blue-500" />,
                                                iconBg: "bg-blue-50 dark:bg-blue-900/30"
                                            },
                                            {
                                                title: "Créances à surveiller",
                                                desc: "156k€ de créances > 90 jours (-8.5%)",
                                                color: "border-orange-200 dark:border-orange-900/50",
                                                icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
                                                iconBg: "bg-orange-50 dark:bg-orange-900/30"
                                            }
                                        ].map((card, i) => (
                                            <Card key={i} className={cn("border shadow-sm hover:shadow-md transition-all cursor-pointer group", card.color)}>
                                                <CardContent className="p-5 space-y-3">
                                                    <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", card.iconBg)}>
                                                        {card.icon}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-sm text-foreground">{card.title}</h4>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Processing Steps */}
                        {isProcessing && (
                            <div className="max-w-lg mx-auto py-10 animate-in fade-in zoom-in duration-500">
                                <Card className="border shadow-lg">
                                    <CardContent className="p-8 space-y-8">
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                                <div className="relative h-16 w-16 flex items-center justify-center bg-primary/10 rounded-full">
                                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-foreground">Traitement en cours</h3>
                                                <p className="text-sm text-muted-foreground">Veuillez patienter pendant que nous analysons vos données</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {processingSteps.map((step) => (
                                                <div key={step.id} className={cn(
                                                    "flex items-center gap-4 p-3 rounded-lg transition-all duration-500",
                                                    processStep >= step.id ? "bg-primary/5 opacity-100" : "opacity-40"
                                                )}>
                                                    <div className={cn(
                                                        "h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                                        processStep > step.id
                                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                                            : processStep === step.id
                                                                ? "bg-primary border-primary text-white"
                                                                : "border-border text-muted-foreground"
                                                    )}>
                                                        {processStep > step.id
                                                            ? <CheckCircle2 className="h-4 w-4" />
                                                            : <span className="text-xs font-bold">{step.id}</span>
                                                        }
                                                    </div>
                                                    <span className={cn(
                                                        "font-medium text-sm",
                                                        processStep >= step.id ? "text-foreground" : "text-muted-foreground"
                                                    )}>
                                                        {step.label}
                                                    </span>
                                                    {processStep === step.id && (
                                                        <div className="ml-auto flex space-x-1">
                                                            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Result Section */}
                        {showResult && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <Card className="border shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
                                    <CardContent className="p-6 space-y-3 relative">
                                        <div className="absolute top-4 right-4">
                                            <div className="flex flex-col items-center bg-background border p-2 px-3 rounded-xl shadow-sm">
                                                <span className="text-xl font-black text-emerald-500">98%</span>
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Confiance</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                                <Target className="h-4 w-4 text-primary" />
                                            </div>
                                            <h3 className="text-base font-bold text-foreground">Interprétation de la requête</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground max-w-xl">
                                            J'ai analysé l'évolution de votre <span className="text-primary font-semibold">chiffre d'affaires</span> comparativement aux périodes précédentes. Voici les indicateurs clés correspondants.
                                        </p>
                                    </CardContent>
                                </Card>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Visualisation Générée</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { setShowResult(false); setQuery(''); }}>
                                                <RotateCcw className="h-3 w-3" />
                                                Nouvelle analyse
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                                Ajouter au Dashboard
                                            </Button>
                                        </div>
                                    </div>
                                    <DashboardGrid
                                        pageId={PAGE_ID}
                                        widgets={widgets}
                                        isEditing={isEditing}
                                        onLayoutChangeAction={updateLayoutForPage.bind(null, PAGE_ID)}
                                        onRemoveWidget={removeWidgetFromPage.bind(null, PAGE_ID)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Editing Sidebar */}
            <div
                className={cn(
                    "fixed top-0 right-0 bottom-0 h-full z-50 transition-transform duration-300 ease-in-out",
                    isEditing ? "translate-x-0" : "translate-x-full"
                )}
            >
                <WidgetSidebar
                    onClose={() => setIsEditing(false)}
                    onAddWidget={(data) => addWidgetToPage(PAGE_ID, data)}
                />
            </div>
        </div>
    );
}
