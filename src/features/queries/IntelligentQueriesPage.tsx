import { useState, useEffect } from 'react';
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
    Check,
    Target,
    History,
    ChevronDown,
    Lightbulb,
    XCircle,
    Brain,
    Database,
    Cog,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { WidgetSidebar } from '@/features/dashboard/components/WidgetSidebar';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { useFilters } from '@/context/FilterContext';
import { useKpiDefinitions, useNLQQuery, useJobStatus } from '@/hooks/use-api';
import { nlqApi, jobsApi } from '@/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';
import { PageInsight } from '@/components/shared/PageInsight';
import { useToast } from '@/hooks/use-toast';
import { QueryResultsDisplay, type NlqResult, type NlqMeta, extractEntities, ENTITY_STYLES } from './components/QueryResultsDisplay';
import { QueryHistoryPanel, type NlqHistoryEntry } from './components/QueryHistoryPanel';

const PAGE_ID = 'smart-queries';

export function IntelligentQueriesPage() {
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStep, setProcessStep] = useState(0);
    const [jobId, setJobId] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [jobResult, setJobResult] = useState<NlqResult | null>(null);
    const [nlqMeta, setNlqMeta] = useState<NlqMeta | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyEntries, setHistoryEntries] = useState<NlqHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showDashForm, setShowDashForm] = useState(false);
    const [pendingDash, setPendingDash] = useState('');
    const [pendingViewMode, setPendingViewMode] = useState<'chart' | 'table' | 'cards'>('chart');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const { isEditing, setIsEditing } = useDashboardEdit();
    const { addWidgetToPage } = usePersonalization();
    const { currency } = useFilters();
    const { toast } = useToast();
    const sym = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';
    const { isLoading } = useKpiDefinitions();

    const nlqQuery = useNLQQuery();
    const { data: jobStatus } = useJobStatus(jobId, { enabled: !!jobId && isProcessing });

    const allSuggestions: Record<string, string[]> = {
        all: [
            "Quel est notre chiffre d'affaires ce mois-ci ?",
            "Montrez-moi les créances clients en retard",
            "Quels sont nos top 5 clients par CA ?",
            "Analysez la marge brute par produit",
            "Quel est le solde de trésorerie actuel ?",
            "Évolution du DSO sur 6 mois",
        ],
        trends: [
            "Évolution du CA sur les 12 derniers mois",
            "Tendance des achats par trimestre",
            "Progression du DSO sur 6 mois",
            "Croissance mensuelle de la marge brute",
        ],
        comparisons: [
            "Comparez les revenus T3 vs T2 2024",
            "CA ce mois vs mois précédent",
            "Marge brute par produit vs objectif",
            "Dépenses opérationnelles : cette année vs l'an passé",
        ],
        predictions: [
            "Prévision de trésorerie pour le prochain trimestre",
            "Projection du CA fin d'année",
            "Estimation des créances irrécouvrables",
            "Tendance DSO — risque de dépassement ?",
        ],
    };

    const suggestions = allSuggestions[activeTab] ?? allSuggestions.all;

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
        setJobResult(null);
        setNlqMeta(null);
        setErrorMsg(null);
        setProcessStep(1);
        setJobId(null);
        setShowDashForm(false);

        setTimeout(() => setProcessStep(2), 1500);

        setTimeout(async () => {
            setProcessStep(3);
            try {
                const result = await nlqQuery.mutateAsync(queryText);
                const res = result as Record<string, string>;

                if (res.status === 'NLQ_INTERACTIVE' || !res.jobId) {
                    setErrorMsg(res.message ?? 'Requête non reconnue. Reformulez votre question.');
                    setIsProcessing(false);
                    return;
                }

                setJobId(res.jobId);
                setNlqMeta({
                    intent: res.intent,
                    intentKey: res.intentKey,
                    vizType: res.vizType,
                    sessionId: res.sessionId,
                });
            } catch (e: unknown) {
                const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
                setErrorMsg(msg ?? 'Erreur lors de l\'analyse. Vérifiez que l\'agent est connecté.');
                setIsProcessing(false);
            }
        }, 3000);
    };

    const handleFollowUp = (text: string) => {
        setQuery(text);
        handleAnalyze(text);
    };

    useEffect(() => {
        if (!jobId) return;
        if (jobStatus?.status === 'COMPLETED' && isProcessing) {
            const res = jobStatus.result as Record<string, unknown>;
            const rows = (res?.data || res?.result) as Record<string, unknown>[] | undefined;
            setJobResult({
                value: (res?.current ?? res?.value ?? null) as number | null,
                rows: Array.isArray(rows) ? rows : undefined,
                intentLabel: nlqMeta?.intent,
                intentKey: nlqMeta?.intentKey,
                vizType: nlqMeta?.vizType,
                sessionId: nlqMeta?.sessionId,
            });
            setProcessStep(4);
            setTimeout(() => {
                setIsProcessing(false);
                setShowResult(true);
            }, 1000);
        } else if (jobStatus?.status === 'FAILED' && isProcessing) {
            setErrorMsg(jobStatus.errorMessage ?? 'L\'agent n\'a pas pu exécuter la requête.');
            setIsProcessing(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobStatus, jobId]);

    const openHistory = () => {
        setHistoryOpen(true);
        if (historyEntries.length > 0) return;
        setHistoryLoading(true);
        nlqApi.getHistory()
            .then(({ data }) => setHistoryEntries(data))
            .catch(() => {})
            .finally(() => setHistoryLoading(false));
    };

    const replayHistory = async (h: NlqHistoryEntry) => {
        setHistoryOpen(false);
        setQuery(h.queryText);
        setIsProcessing(true);
        setShowResult(false);
        setJobResult(null);
        setShowDashForm(false);
        setNlqMeta({ intent: h.intentLabel, intentKey: h.intentKey, vizType: h.vizType, sessionId: '' });
        setProcessStep(4);

        try {
            const { data: job } = await jobsApi.getById(h.jobId);
            if (job.status === 'COMPLETED') {
                const res = job.result as Record<string, unknown>;
                const rows = (res?.data || res?.result) as Record<string, unknown>[] | undefined;
                setJobResult({
                    value: (res?.current ?? res?.value ?? null) as number | null,
                    rows: Array.isArray(rows) ? rows : undefined,
                    intentLabel: h.intentLabel,
                    intentKey: h.intentKey,
                    vizType: h.vizType,
                });
                setIsProcessing(false);
                setShowResult(true);
            } else {
                setIsProcessing(false);
            }
        } catch {
            setIsProcessing(false);
        }
    };

    const confirmAddToDashboard = () => {
        if (!nlqMeta) return;
        const name = pendingDash.trim() || nlqMeta.intent || 'KPI';
        const vizType = pendingViewMode === 'table' ? 'table'
            : pendingViewMode === 'cards' ? 'card'
            : nlqMeta.vizType || 'bar';
        addWidgetToPage('dashboard', {
            name,
            type: pendingViewMode === 'table' ? 'table' : pendingViewMode === 'cards' ? 'kpi' : 'chart',
            vizType,
            kpiKey: nlqMeta.intentKey,
            config: { isNlq: true, queryText: query },
        });
        setShowDashForm(false);
        setPendingDash('');
        toast({
            title: 'Widget ajouté au dashboard',
            description: `"${name}" est maintenant disponible sur votre tableau de bord.`,
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const processingSteps = [
        { id: 1, label: "Analyse du langage naturel", description: "Extraction des entités et intentions", Icon: Brain },
        { id: 2, label: "Validation des données", description: "Vérification de la disponibilité des données", Icon: CheckCircle2 },
        { id: 3, label: "Exécution de la requête", description: "Interrogation de la base de données Sage", Icon: Database },
        { id: 4, label: "Génération de la visualisation", description: "Création du graphique optimal", Icon: BarChart3 },
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={openHistory}
                                    className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 font-bold"
                                >
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
                                        disabled={isProcessing}
                                    >
                                        Analyser
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Error State */}
                        {!isProcessing && !showResult && errorMsg && (
                            <div className="max-w-lg mx-auto py-10 animate-in fade-in zoom-in duration-300">
                                <Card className="border border-red-200 dark:border-red-900/50 shadow-sm">
                                    <CardContent className="p-8 flex flex-col items-center text-center gap-5">
                                        <div className="h-14 w-14 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                            <XCircle className="h-7 w-7 text-red-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <h3 className="text-base font-bold text-foreground">Analyse échouée</h3>
                                            <p className="text-sm text-muted-foreground max-w-sm">{errorMsg}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                className="h-9 px-5 rounded-lg font-semibold bg-[#3b66ac] hover:bg-[#2d5089] text-white text-sm"
                                                onClick={() => handleAnalyze()}
                                            >
                                                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                                Réessayer
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 text-sm"
                                                onClick={() => { setErrorMsg(null); setQuery(''); }}
                                            >
                                                Nouvelle question
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Initial State */}
                        {!isProcessing && !showResult && !errorMsg && (
                            <div className="space-y-8 pb-10">
                                <div className="max-w-3xl mx-auto space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-foreground">Suggestions de requêtes</h3>
                                    </div>

                                    {/* Filter Tabs */}
                                    <div className="flex items-center gap-2 flex-wrap">
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setQuery(s)}
                                                className="flex items-center gap-3 p-3 text-left rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-accent/50 transition-all group"
                                            >
                                                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                                                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                                                    {s}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="max-w-3xl mx-auto px-1">
                                    <PageInsight
                                        icon="Zap"
                                        label="Recommandation IA"
                                        text="Posez une question en langage naturel pour analyser vos données instantanément. Suggestion du jour : 'Quel est l'impact des impayés sur la trésorerie du trimestre ?'"
                                        variant="info"
                                    />
                                </div>

                                {/* Live interpretation — appears as user types */}
                                {query.trim() ? (
                                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <Card className="border shadow-sm">
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="h-[18px] w-[18px] text-primary" />
                                                    <h3 className="text-sm font-medium text-foreground">Interprétation de la requête</h3>
                                                    <div className="ml-auto flex items-center gap-1">
                                                        <Target className="h-3.5 w-3.5 text-emerald-500" />
                                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">92% de confiance</span>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-muted rounded-lg">
                                                    <p className="text-sm text-foreground italic">"{query}"</p>
                                                </div>
                                                {(() => {
                                                    const entities = extractEntities(query);
                                                    return entities.length > 0 ? (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-2">Entités détectées :</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {entities.map((e, i) => (
                                                                    <span key={i} className={cn(
                                                                        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
                                                                        ENTITY_STYLES[e.type]
                                                                    )}>
                                                                        {e.label}
                                                                        <span className="ml-1 opacity-70">({e.confidence}%)</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
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
                                )}
                            </div>
                        )}

                        {/* Processing Steps */}
                        {isProcessing && (
                            <div className="max-w-2xl mx-auto py-10 animate-in fade-in zoom-in duration-500">
                                <Card className="border shadow-sm">
                                    <CardContent className="p-6 space-y-6">
                                        {/* Interpretation section — visible immediately */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <MessageSquare className="h-[18px] w-[18px] text-primary" />
                                                <h3 className="text-sm font-medium text-foreground">Interprétation de la requête</h3>
                                                <div className="ml-auto flex items-center gap-1">
                                                    <Target className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">92% de confiance</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-muted rounded-lg">
                                                <p className="text-sm text-foreground italic">"{query}"</p>
                                            </div>
                                            {(() => {
                                                const entities = extractEntities(query);
                                                return entities.length > 0 ? (
                                                    <div className="mt-3">
                                                        <p className="text-xs text-muted-foreground mb-2">Entités détectées :</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {entities.map((e, i) => (
                                                                <span key={i} className={cn(
                                                                    'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
                                                                    ENTITY_STYLES[e.type]
                                                                )}>
                                                                    {e.label}
                                                                    <span className="ml-1 opacity-70">({e.confidence}%)</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-border" />

                                        {/* Section header */}
                                        <div className="flex items-center gap-2">
                                            <Cog className="h-[18px] w-[18px] text-primary animate-spin" />
                                            <h3 className="text-sm font-medium text-foreground">Traitement en cours</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {processingSteps.map((step) => {
                                                const isCompleted = processStep > step.id;
                                                const isActive = processStep === step.id;
                                                return (
                                                    <div key={step.id} className="flex items-center gap-3">
                                                        {/* Status circle */}
                                                        <div className={cn(
                                                            "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500",
                                                            isCompleted
                                                                ? "bg-emerald-500 text-white"
                                                                : isActive
                                                                    ? "bg-primary text-white"
                                                                    : "bg-muted text-muted-foreground"
                                                        )}>
                                                            {isCompleted
                                                                ? <Check className="h-4 w-4" />
                                                                : <step.Icon className={cn("h-4 w-4", isActive && "animate-pulse")} />
                                                            }
                                                        </div>

                                                        {/* Label + description */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className={cn(
                                                                    "text-sm font-medium",
                                                                    isCompleted ? "text-emerald-500" : isActive ? "text-primary" : "text-muted-foreground"
                                                                )}>
                                                                    {step.label}
                                                                </p>
                                                                {isActive && (
                                                                    <div className="flex gap-1">
                                                                        <div className="h-1 w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                                        <div className="h-1 w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                                                                        <div className="h-1 w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{step.description}</p>
                                                        </div>

                                                        {isActive && (
                                                            <span className="text-xs text-primary font-medium shrink-0">En cours...</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Temps estimé : 3-5 secondes</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Result Section */}
                        {showResult && jobResult && nlqMeta && (
                            <div className="max-w-5xl mx-auto w-full">
                                <QueryResultsDisplay
                                    result={jobResult}
                                    nlqMeta={nlqMeta}
                                    queryText={query}
                                    sym={sym}
                                    showDashForm={showDashForm}
                                    pendingDash={pendingDash}
                                    onPendingDashChange={setPendingDash}
                                    onAddToDashboardClick={(vm) => { setShowDashForm(true); setPendingDash(nlqMeta.intent ?? ''); setPendingViewMode(vm); }}
                                    onAddToDashboardConfirm={confirmAddToDashboard}
                                    onAddToDashboardCancel={() => setShowDashForm(false)}
                                    onNewQuery={() => { setShowResult(false); setQuery(''); setJobResult(null); }}
                                    onFollowUp={handleFollowUp}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* History Panel */}
            {historyOpen && (
                <QueryHistoryPanel
                    entries={historyEntries}
                    loading={historyLoading}
                    onReplay={replayHistory}
                    onClose={() => setHistoryOpen(false)}
                />
            )}

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
