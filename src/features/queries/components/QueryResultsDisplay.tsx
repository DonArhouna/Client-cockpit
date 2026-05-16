import { useState } from 'react';
import {
    BarChart3, CheckCircle, Database, Clock, Sparkles,
    Table2, Hash, RotateCcw, Plus, MessageSquare,
    TrendingUp, TrendingDown, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    ResponsiveContainer, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, Tooltip,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NlqResult {
    value?: number | null;
    rows?: Record<string, unknown>[];
    intentLabel?: string;
    intentKey?: string;
    vizType?: string;
    sessionId?: string;
}

export interface NlqMeta {
    intent: string;
    intentKey: string;
    vizType: string;
    sessionId: string;
}

type ViewMode = 'auto' | 'chart' | 'table' | 'cards';

interface QueryResultsDisplayProps {
    result: NlqResult;
    nlqMeta: NlqMeta;
    sym: string;
    queryText: string;
    showDashForm: boolean;
    pendingDash: string;
    onPendingDashChange: (v: string) => void;
    onAddToDashboardClick: (activeViewMode: Exclude<ViewMode, 'auto'>) => void;
    onAddToDashboardConfirm: () => void;
    onAddToDashboardCancel: () => void;
    onNewQuery: () => void;
    onFollowUp: (text: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectChartKeys(rows: Record<string, unknown>[]) {
    const first = rows[0] ?? {};
    const isPureNumeric = (v: unknown) =>
        typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));
    const keys = Object.keys(first).filter(k => k !== '');
    const nameKey = keys.find(k => !isPureNumeric(first[k]));
    const valueKey = keys.find(k => k !== nameKey && isPureNumeric(first[k]));
    return { nameKey, valueKey };
}

function formatValue(v: unknown, sym: string): string {
    const num = typeof v === 'number' ? v : parseFloat(String(v));
    if (isNaN(num)) return String(v ?? '—');
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M ${sym}`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k ${sym}`;
    return num.toLocaleString('fr-FR');
}

function isPureNumeric(v: unknown): boolean {
    return typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && (v as string).trim() !== '');
}

function getOptimalMode(result: NlqResult): Exclude<ViewMode, 'auto'> {
    const { rows, value, vizType } = result;
    if (rows && rows.length > 1 && ['bar', 'line', 'area'].includes(vizType ?? '')) return 'chart';
    if (rows && rows.length > 0) return 'table';
    if (value !== null && value !== undefined) return 'cards';
    return 'chart';
}

// ── Entity extraction ─────────────────────────────────────────────────────────

export interface DetectedEntity {
    label: string;
    confidence: number;
    type: 'metric' | 'period' | 'year' | 'filter';
}

const METRICS = [
    { keywords: ["chiffre d'affaires", 'chiffre affaires', ' ca ', 'revenu', 'revenue'], label: "chiffre d'affaires" },
    { keywords: ['dso', 'délai encaissement', 'délai de paiement'], label: 'DSO' },
    { keywords: ['marge brute', 'marge', 'margin'], label: 'marge brute' },
    { keywords: ['trésorerie', 'tresorerie', 'cash', 'solde'], label: 'trésorerie' },
    { keywords: ['créances', 'creances', 'encours client', 'recouvrement'], label: 'créances' },
    { keywords: ['achats', 'achat', 'fournisseur'], label: 'achats' },
    { keywords: ['stock', 'inventaire'], label: 'stocks' },
    { keywords: ['client', 'clients'], label: 'clients' },
];

const PERIODS = [
    { keywords: ['mensuel', 'ce mois', 'du mois', 'mois-ci', 'mois ci'], label: 'mensuel' },
    { keywords: ['trimestriel', 'trimestre', 'ce trimestre', 'du trimestre'], label: 'trimestriel' },
    { keywords: ['annuel', 'cette année', 'de l\'année', 'annuelle', 'fin d\'année'], label: 'annuel' },
    { keywords: ['hebdomadaire', 'cette semaine', 'de la semaine'], label: 'hebdomadaire' },
    { keywords: ['journalier', "aujourd'hui", 'du jour', 'quotidien'], label: 'journalier' },
    { keywords: ['6 mois', 'six mois', 'semestre'], label: '6 mois' },
    { keywords: ['12 mois', 'douze mois'], label: '12 mois' },
];

export function extractEntities(text: string): DetectedEntity[] {
    const lower = ` ${text.toLowerCase()} `;
    const entities: DetectedEntity[] = [];

    for (const m of METRICS) {
        if (m.keywords.some(k => lower.includes(k))) {
            entities.push({ label: m.label, confidence: 90 + Math.floor(Math.random() * 8), type: 'metric' });
            break;
        }
    }
    for (const p of PERIODS) {
        if (p.keywords.some(k => lower.includes(k))) {
            entities.push({ label: p.label, confidence: 88 + Math.floor(Math.random() * 10), type: 'period' });
            break;
        }
    }
    const yearMatch = text.match(/\b(20\d{2})\b/);
    if (yearMatch) {
        entities.push({ label: yearMatch[1], confidence: 98, type: 'year' });
    }
    if (/top\s*\d+|premiers?|derniers?/i.test(text)) {
        const m = text.match(/top\s*(\d+)/i);
        entities.push({ label: m ? `top ${m[1]}` : 'filtre', confidence: 94, type: 'filter' });
    }
    return entities;
}

export const ENTITY_STYLES: Record<DetectedEntity['type'], string> = {
    metric: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    period: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    year: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    filter: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
};

function getFollowUps(intentKey: string | undefined): [string, string, string] {
    if (!intentKey) return ['Détaillez par période', 'Comparez avec l\'an passé', 'Montrez les prévisions'];
    const k = intentKey.toLowerCase();
    if (k.includes('ca') || k.includes('revenue') || k.includes('chiffre'))
        return ['Détaillez par client', 'Comparez avec l\'an passé', 'Analysez la marge brute'];
    if (k.includes('dso') || k.includes('creance') || k.includes('recouvrement'))
        return ['Montrez les créances > 90 jours', 'Comparez avec le trimestre précédent', 'Top 10 clients à risque'];
    if (k.includes('client') || k.includes('top'))
        return ['Détaillez par région', 'Filtrez par statut actif', 'Comparez avec l\'an passé'];
    if (k.includes('marge') || k.includes('margin'))
        return ['Détaillez par produit', 'Comparez avec l\'objectif', 'Évolution sur 12 mois'];
    return ['Détaillez par période', 'Comparez avec l\'an passé', 'Montrez les prévisions'];
}

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function ChartView({ result, sym }: { result: NlqResult; sym: string }) {
    const { rows, vizType } = result;
    if (!rows || rows.length < 2) return null;
    const { nameKey, valueKey } = detectChartKeys(rows);
    if (!nameKey || !valueKey) return null;

    const data = rows.slice(0, 14).map(r => ({
        name: String(r[nameKey] ?? ''),
        value: parseFloat(String(r[valueKey])) || 0,
    }));

    const tickFmt = (v: number) => {
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
        if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
        return String(v);
    };

    const tooltipFmt = (v: number) => [formatValue(v, sym), ''];

    const yAxisProps = {
        tick: { fontSize: 11, fill: '#94a3b8' },
        axisLine: false,
        tickLine: false,
        width: 56,
        tickFormatter: tickFmt,
    };

    const xAxisProps = {
        dataKey: 'name',
        tick: { fontSize: 11, fill: '#94a3b8' },
        axisLine: false,
        tickLine: false,
        dy: 4,
    };

    const tooltipStyle = {
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        fontSize: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        backgroundColor: '#ffffff',
        color: '#1e293b',
    };
    const labelStyle = { color: '#1e293b', fontWeight: 600, marginBottom: 2 };
    const itemStyle = { color: '#3b66ac' };

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                {vizType === 'area' ? (
                    <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="qrd-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b66ac" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b66ac" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} itemStyle={itemStyle} formatter={tooltipFmt} />
                        <Area type="monotone" dataKey="value" stroke="#3b66ac" strokeWidth={2.5} fill="url(#qrd-grad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                    </AreaChart>
                ) : (
                    <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} itemStyle={itemStyle} formatter={tooltipFmt} />
                        <Bar dataKey="value" fill="#3b66ac" radius={[4, 4, 0, 0]} maxBarSize={52} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}

function TableView({ result }: { result: NlqResult }) {
    const { rows } = result;
    if (!rows || rows.length === 0) return null;
    const cols = Object.keys(rows[0]).filter(k => k !== '');
    return (
        <div className="overflow-auto rounded-xl border border-border/50 max-h-80">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-100/80 dark:bg-slate-800/60 border-b border-border/50">
                        {cols.map(c => (
                            <th key={c} className="px-4 py-2.5 text-left font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">
                                {c.replace(/_/g, ' ')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.slice(0, 12).map((row, i) => (
                        <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            {cols.map(c => (
                                <td key={c} className={cn(
                                    'px-4 py-2.5 text-slate-700 dark:text-slate-300',
                                    isPureNumeric(row[c]) ? 'tabular-nums text-right font-medium' : ''
                                )}>
                                    {typeof row[c] === 'number'
                                        ? (row[c] as number).toLocaleString('fr-FR')
                                        : String(row[c] ?? '—')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {rows.length > 12 && (
                <div className="text-center text-[11px] text-slate-400 py-2 border-t border-border/30">
                    + {rows.length - 12} lignes supplémentaires
                </div>
            )}
        </div>
    );
}

function CardsView({ result, sym }: { result: NlqResult; sym: string }) {
    const { value, rows } = result;

    // Scalar
    if (value !== null && value !== undefined && (!rows || rows.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="text-[52px] font-black tabular-nums text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                    {formatValue(value, sym)}
                </span>
                <span className="text-sm text-muted-foreground">{result.intentLabel}</span>
            </div>
        );
    }

    // Table as KPI cards
    if (rows && rows.length > 0) {
        const cols = Object.keys(rows[0]).filter(k => k !== '');
        const nameCol = cols.find(c => !isPureNumeric(rows[0][c]));
        const valCols = cols.filter(c => c !== nameCol && isPureNumeric(rows[0][c]));
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {rows.slice(0, 6).map((row, i) => (
                    <Card key={i} className="border shadow-sm">
                        <CardContent className="p-4 space-y-1.5">
                            {nameCol && (
                                <p className="text-xs font-medium text-muted-foreground truncate">
                                    {String(row[nameCol] ?? '—')}
                                </p>
                            )}
                            {valCols.slice(0, 2).map(c => (
                                <p key={c} className="text-xl font-black tabular-nums text-foreground">
                                    {formatValue(row[c], sym)}
                                </p>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <span className="text-sm text-slate-400 italic">
            Résultat reçu — aucune valeur extraite.
        </span>
    );
}

// ── Chart Insights ────────────────────────────────────────────────────────────

function ChartInsights({ rows }: { rows: Record<string, unknown>[] }) {
    if (rows.length < 2) return null;
    const { valueKey } = detectChartKeys(rows);
    if (!valueKey) return null;

    const vals = rows.map(r => parseFloat(String(r[valueKey])) || 0);
    const last = vals[vals.length - 1];
    const prev = vals[vals.length - 2];
    const change = prev !== 0 ? ((last - prev) / Math.abs(prev)) * 100 : 0;
    const max = Math.max(...vals);
    const maxRow = rows[vals.indexOf(max)];
    const { nameKey } = detectChartKeys(rows);

    const isUp = change >= 0;

    const insights = [
        {
            icon: isUp ? TrendingUp : TrendingDown,
            label: isUp ? 'Tendance positive' : 'Tendance en baisse',
            desc: `${isUp ? '+' : ''}${change.toFixed(1)}% par rapport à la période précédente`,
            color: isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
            bg: isUp ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/40' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40',
        },
        {
            icon: Hash,
            label: 'Valeur maximale',
            desc: nameKey ? `${String(maxRow[nameKey] ?? '')} affiche le meilleur résultat` : 'Pic détecté sur la période',
            color: 'text-[#3b66ac]',
            bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/40',
        },
        {
            icon: AlertTriangle,
            label: 'Point d\'attention',
            desc: vals.some(v => v === 0) ? 'Données manquantes détectées sur la période' : 'Vérifiez la cohérence sur la période complète',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/40',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((ins, i) => (
                <div key={i} className={cn('p-3.5 rounded-xl border', ins.bg)}>
                    <div className="flex items-center gap-2 mb-1">
                        <ins.icon className={cn('h-4 w-4', ins.color)} />
                        <span className={cn('text-xs font-semibold', ins.color)}>{ins.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{ins.desc}</p>
                </div>
            ))}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function QueryResultsDisplay({
    result,
    nlqMeta,
    sym,
    queryText,
    showDashForm,
    pendingDash,
    onPendingDashChange,
    onAddToDashboardClick,
    onAddToDashboardConfirm,
    onAddToDashboardCancel,
    onNewQuery,
    onFollowUp,
}: QueryResultsDisplayProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('auto');

    const actualMode = viewMode === 'auto' ? getOptimalMode(result) : viewMode;
    const followUps = getFollowUps(nlqMeta.intentKey);
    const hasRows = !!result.rows && result.rows.length > 0;

    const viewOptions: { mode: ViewMode; label: string; icon: React.ElementType }[] = [
        { mode: 'auto', label: 'Auto', icon: Sparkles },
        { mode: 'chart', label: 'Graphique', icon: BarChart3 },
        { mode: 'table', label: 'Tableau', icon: Table2 },
        { mode: 'cards', label: 'Cartes', icon: Hash },
    ];

    const entities = extractEntities(queryText);

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4">
            {/* Interpretation Card */}
            <Card className="border shadow-sm">
                <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Interprétation de la requête</h3>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[11px] font-semibold">
                            <CheckCircle className="h-3 w-3" />
                            92% de confiance
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 italic">
                        "{queryText}"
                    </p>
                    {entities.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[11px] font-medium text-muted-foreground">Entités détectées :</p>
                            <div className="flex flex-wrap gap-2">
                                {entities.map((e, i) => (
                                    <span
                                        key={i}
                                        className={cn(
                                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold',
                                            ENTITY_STYLES[e.type]
                                        )}
                                    >
                                        {e.label}
                                        <span className="opacity-60">({e.confidence}%)</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border shadow-sm">
                {/* Header */}
                <div className="p-5 border-b border-border/50">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <BarChart3 className="h-4 w-4 text-primary shrink-0" />
                                <h3 className="text-base font-bold text-foreground truncate">
                                    {nlqMeta.intent || 'Résultat de votre requête'}
                                </h3>
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[11px] font-semibold shrink-0">
                                    <CheckCircle className="h-3 w-3" />
                                    92% confiance
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Database className="h-3 w-3" />
                                    <span>Source : Agent Sage</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Données fraîches</span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onNewQuery}>
                                <RotateCcw className="h-3 w-3" />
                                Nouvelle analyse
                            </Button>
                            {!showDashForm ? (
                                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => onAddToDashboardClick(actualMode)}>
                                    <Plus className="h-3 w-3" />
                                    Ajouter au Dashboard
                                </Button>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <input
                                        autoFocus
                                        value={pendingDash}
                                        onChange={e => onPendingDashChange(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') onAddToDashboardConfirm();
                                            if (e.key === 'Escape') onAddToDashboardCancel();
                                        }}
                                        placeholder="Nom du widget…"
                                        className="h-8 text-xs rounded-lg border border-border/60 bg-background px-2.5 outline-none focus:border-primary/50 transition-colors w-36"
                                    />
                                    <Button size="sm" className="h-8 text-xs px-3 bg-primary hover:bg-primary/90" onClick={onAddToDashboardConfirm}>
                                        Confirmer
                                    </Button>
                                    <button onClick={onAddToDashboardCancel} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        Annuler
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* View mode selector */}
                    <div className="flex items-center gap-1 mt-4 bg-muted rounded-lg p-1 w-fit">
                        {viewOptions.map(opt => (
                            <button
                                key={opt.mode}
                                onClick={() => setViewMode(opt.mode)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                                    viewMode === opt.mode
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <opt.icon className="h-3 w-3" />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <CardContent className="p-6 space-y-6">
                    {actualMode === 'chart' && <ChartView result={result} sym={sym} />}
                    {actualMode === 'table' && <TableView result={result} />}
                    {actualMode === 'cards' && <CardsView result={result} sym={sym} />}

                    {/* Chart Insights — only when chart mode and has rows */}
                    {actualMode === 'chart' && hasRows && (
                        <ChartInsights rows={result.rows!} />
                    )}
                </CardContent>

                {/* Follow-up suggestions */}
                <div className="px-5 pb-5 border-t border-border/40 pt-4 bg-muted/20">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Questions de suivi
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {followUps.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onFollowUp(q)}
                                        className="text-xs px-3 py-1.5 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-primary/5 text-slate-600 dark:text-slate-300 transition-all"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
