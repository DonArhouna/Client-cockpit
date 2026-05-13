import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Loader2, AlertTriangle, LayoutDashboard, SquarePen } from 'lucide-react';
import { nlqApi, jobsApi } from '@/api';
import { useFilters } from '@/context/FilterContext';
import { usePersonalization } from '@/features/personalization/PersonalizationContext';
import { cn } from '@/lib/utils';
import {
    ResponsiveContainer, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, Tooltip,
} from 'recharts';

// ── Types ────────────────────────────────────────────────────────────────────
type MsgStatus = 'loading' | 'done' | 'error';

interface NlqResult {
    value?: number | null;
    rows?: Record<string, any>[];
    intentLabel?: string;
    intentKey?: string;
    vizType?: string;
    sessionId?: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'zuri';
    text: string;
    status: MsgStatus;
    result?: NlqResult;
    error?: string;
}

// ── Result block ─────────────────────────────────────────────────────────────
function detectChartKeys(rows: Record<string, any>[]) {
    const first = rows[0] ?? {};
    const isPureNumeric = (v: any) =>
        typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));
    const keys = Object.keys(first).filter(k => k !== '');
    const nameKey = keys.find(k => !isPureNumeric(first[k]));
    const valueKey = keys.find(k => k !== nameKey && isPureNumeric(first[k]));
    return { nameKey, valueKey };
}

function ResultBlock({ result, sym }: { result: NlqResult; sym: string }) {
    const { value, rows, intentLabel, vizType } = result;

    const intentBadge = intentLabel ? (
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
            {intentLabel}
        </span>
    ) : null;

    // ── Chart (bar / line / area) ─────────────────────────────────────────
    if (rows && rows.length > 1 && ['bar', 'line', 'area'].includes(vizType ?? '')) {
        const { nameKey, valueKey } = detectChartKeys(rows);
        if (nameKey && valueKey) {
            const data = rows.slice(0, 14).map(r => ({
                name: String(r[nameKey] ?? ''),
                value: parseFloat(r[valueKey]) || 0,
            }));
            return (
                <div className="flex flex-col gap-2 w-full">
                    {intentBadge}
                    <div className="h-[150px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {vizType === 'bar' ? (
                                <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={4} />
                                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#3b66ac" radius={[3, 3, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            ) : (
                                <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="nlq-chat-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b66ac" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b66ac" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={4} />
                                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 11 }} />
                                    <Area type="monotone" dataKey="value" stroke="#3b66ac" strokeWidth={2.5} fill="url(#nlq-chat-grad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        }
    }

    // ── Table (multi-row) ─────────────────────────────────────────────────
    if (rows && rows.length > 0) {
        const cols = Object.keys(rows[0]).filter(k => k !== '');
        const isPureNumeric = (v: any) => typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '');
        return (
            <div className="flex flex-col gap-2 w-full">
                {intentBadge}
                <div className="overflow-auto rounded-xl border border-border/50 max-h-[220px]">
                    <table className="w-full text-[11px]">
                        <thead>
                            <tr className="bg-slate-100/80 dark:bg-slate-800/60 border-b border-border/50">
                                {cols.map(c => (
                                    <th key={c} className="px-3 py-1.5 text-left font-bold text-slate-400 uppercase tracking-wider text-[9px] whitespace-nowrap">
                                        {c.replace(/_/g, ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.slice(0, 8).map((row, i) => (
                                <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    {cols.map(c => (
                                        <td key={c} className={cn(
                                            'px-3 py-1.5 text-slate-700 dark:text-slate-300',
                                            isPureNumeric(row[c]) ? 'tabular-nums text-right font-medium' : ''
                                        )}>
                                            {typeof row[c] === 'number'
                                                ? row[c].toLocaleString('fr-FR')
                                                : String(row[c] ?? '—')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length > 8 && (
                        <div className="text-center text-[10px] text-slate-400 py-1.5 border-t border-border/30">
                            + {rows.length - 8} lignes supplémentaires
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Scalar ────────────────────────────────────────────────────────────
    if (value !== null && value !== undefined) {
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        const formatted = isNaN(num) ? String(value) :
            num >= 1_000_000 ? `${(num / 1_000_000).toFixed(2)}M ${sym}` :
            num >= 1_000 ? `${(num / 1_000).toFixed(1)}k ${sym}` :
            `${num.toLocaleString('fr-FR')} ${sym}`;
        return (
            <div className="flex flex-col gap-0.5">
                {intentBadge}
                <span className="text-[28px] font-black tabular-nums text-slate-900 dark:text-slate-100 tracking-tight leading-none mt-1">
                    {formatted}
                </span>
            </div>
        );
    }

    return (
        <span className="text-[12px] text-slate-400 italic">
            Résultat reçu — aucune valeur extraite.
        </span>
    );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface NlqConversationModalProps {
    open: boolean;
    onClose: () => void;
    dashboardId?: string;
    pageId?: string;
    nlqWidgetId?: string;
}

const SUGGESTIONS = [
    'Quel est mon CA ce trimestre ?',
    'Montre-moi le DSO actuel',
    'Top 5 clients par chiffre d\'affaires',
    'Taux de marge brute ce mois-ci ?',
];

export function NlqConversationModal({ open, onClose, dashboardId, pageId, nlqWidgetId }: NlqConversationModalProps) {
    const { currency } = useFilters();
    const sym = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';
    const { addWidgetToPage, removeWidgetFromPage } = usePersonalization();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // "Add to dashboard" inline form state
    const [pendingDash, setPendingDash] = useState<{ msgId: string; name: string } | null>(null);

    const confirmAddToDash = () => {
        if (!pendingDash || !pageId) return;
        const msg = messages.find(m => m.id === pendingDash.msgId);
        if (!msg?.result) return;

        const { intentLabel, intentKey, vizType } = msg.result;
        const widgetName = pendingDash.name.trim() || intentLabel || 'KPI Zuri';

        addWidgetToPage(pageId, {
            name: widgetName,
            type: vizType === 'table' ? 'table' : 'chart',
            vizType: vizType || 'bar',
            kpiKey: intentKey,
            config: { isNlq: true },
        });

        if (nlqWidgetId) removeWidgetFromPage(pageId, nlqWidgetId);
        onClose();
    };

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 120);
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const patchMsg = (id: string, patch: Partial<ChatMessage>) =>
        setMessages(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));

    const submit = async () => {
        const q = query.trim();
        if (!q || loading) return;
        setQuery('');
        setLoading(true);

        const ts = Date.now().toString();
        setMessages(prev => [
            ...prev,
            { id: `u-${ts}`, role: 'user', text: q, status: 'done' },
            { id: `z-${ts}`, role: 'zuri', text: '', status: 'loading' },
        ]);

        const zuriId = `z-${ts}`;

        try {
            const resp = await nlqApi.query(q);
            const { status, jobId, intent, intentKey, vizType, message, sessionId } = resp.data as any;

            if (!jobId || status === 'NLQ_INTERACTIVE' || status === 'NO_INTENT') {
                patchMsg(zuriId, { status: 'error', error: message ?? 'Je n\'ai pas compris. Essayez de reformuler.' });
                return;
            }
            if (status === 'TEMPLATE_DISABLED') {
                patchMsg(zuriId, { status: 'error', error: 'Ce KPI est temporairement désactivé.' });
                return;
            }

            // Poll job (max 30s)
            for (let i = 0; i < 15; i++) {
                await new Promise(r => setTimeout(r, 2000));
                const { data: job } = await jobsApi.getById(jobId);

                if (job.status === 'COMPLETED') {
                    const res = job.result;
                    const rows = res?.data || res?.result;
                    patchMsg(zuriId, {
                        status: 'done',
                        result: {
                            value: res?.current ?? res?.value ?? null,
                            rows: Array.isArray(rows) ? rows : undefined,
                            intentLabel: intent,
                            intentKey,
                            vizType,
                            sessionId: sessionId ?? resp.data.sessionId,
                        },
                    });
                    return;
                }
                if (job.status === 'FAILED') {
                    patchMsg(zuriId, { status: 'error', error: 'L\'agent n\'a pas pu exécuter la requête.' });
                    return;
                }
            }
            patchMsg(zuriId, { status: 'error', error: 'Délai dépassé. Vérifiez que l\'agent est connecté.' });
        } catch (e: any) {
            patchMsg(zuriId, { status: 'error', error: e?.response?.data?.message ?? 'Erreur inattendue.' });
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-[660px] h-[82vh] max-h-[720px] p-0 flex flex-col rounded-2xl overflow-hidden gap-0">

                {/* ── Header ── */}
                <DialogHeader className="px-5 py-4 border-b border-border/50 flex-none">
                    {/* pr-10 leaves room for shadcn's absolute X close button */}
                    <DialogTitle className="flex items-center gap-3 text-[15px] pr-10">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold leading-none">Zuri</div>
                            <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                                Assistant BI — Langage naturel
                            </div>
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={() => { setMessages([]); setQuery(''); setPendingDash(null); setTimeout(() => inputRef.current?.focus(), 50); }}
                                title="Nouvelle conversation"
                                className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                            >
                                <SquarePen className="h-4 w-4" />
                            </button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {/* ── Messages ── */}
                <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 min-h-0">

                    {/* Empty state */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full gap-5 text-center select-none">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Sparkles className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                                    Bonjour, je suis Zuri
                                </p>
                                <p className="text-[12px] text-slate-400 mt-1">
                                    Posez-moi n'importe quelle question sur vos données Sage
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full max-w-[420px]">
                                {SUGGESTIONS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => { setQuery(s); inputRef.current?.focus(); }}
                                        className="text-[11px] text-left px-3 py-2.5 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 text-slate-600 dark:text-slate-300 transition-all leading-snug"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Conversation thread */}
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={cn(
                                'flex gap-2.5 items-start',
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {/* Zuri avatar */}
                            {msg.role === 'zuri' && (
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                </div>
                            )}

                            {/* Bubble */}
                            <div className={cn(
                                'max-w-[88%] rounded-2xl px-4 py-3',
                                msg.role === 'user'
                                    ? 'bg-primary text-white text-[13px] rounded-tr-sm'
                                    : 'bg-white dark:bg-slate-800/80 border border-border/50 rounded-tl-sm shadow-sm'
                            )}>
                                {/* User text */}
                                {msg.role === 'user' && <span>{msg.text}</span>}

                                {/* Zuri loading */}
                                {msg.role === 'zuri' && msg.status === 'loading' && (
                                    <div className="flex items-center gap-2 text-[12px] text-slate-400 py-0.5">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                                        Analyse en cours…
                                    </div>
                                )}

                                {/* Zuri error */}
                                {msg.role === 'zuri' && msg.status === 'error' && (
                                    <div className="flex items-start gap-2 text-[12px] text-amber-600 dark:text-amber-400">
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                        <span>{msg.error}</span>
                                    </div>
                                )}

                                {/* Zuri result */}
                                {msg.role === 'zuri' && msg.status === 'done' && msg.result && (
                                    <div className="flex flex-col gap-3">
                                        <ResultBlock result={msg.result} sym={sym} />

                                        {/* Add to dashboard */}
                                        {pageId && msg.result.intentKey && (
                                            pendingDash?.msgId === msg.id ? (
                                                <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-slate-50 dark:bg-slate-800/50 p-3">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        Nom du widget
                                                    </label>
                                                    <input
                                                        autoFocus
                                                        value={pendingDash.name}
                                                        onChange={e => setPendingDash({ ...pendingDash, name: e.target.value })}
                                                        onKeyDown={e => { if (e.key === 'Enter') confirmAddToDash(); if (e.key === 'Escape') setPendingDash(null); }}
                                                        placeholder="Ex: Top clients CA…"
                                                        className="text-[12px] bg-white dark:bg-slate-800 border border-border/50 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary/50 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-colors"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={confirmAddToDash}
                                                            className="h-6 text-[11px] px-3 bg-primary hover:bg-primary/90"
                                                        >
                                                            Confirmer
                                                        </Button>
                                                        <button
                                                            onClick={() => setPendingDash(null)}
                                                            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            Annuler
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setPendingDash({ msgId: msg.id, name: msg.result!.intentLabel ?? '' })}
                                                    className="self-start flex items-center gap-1.5 text-[10px] font-bold text-primary/60 hover:text-primary transition-colors"
                                                >
                                                    <LayoutDashboard className="h-3 w-3" />
                                                    Ajouter au dashboard
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div ref={bottomRef} />
                </div>

                {/* ── Input ── */}
                <div className="flex-none border-t border-border/50 px-4 py-3 flex items-end gap-2.5 bg-white dark:bg-slate-900">
                    <textarea
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                        placeholder="Posez une question… (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
                        disabled={loading}
                        rows={1}
                        className="flex-1 resize-none bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5 text-[12px] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none border border-border/50 focus:border-primary/50 transition-colors leading-relaxed"
                        style={{ maxHeight: 80, overflowY: 'auto' }}
                    />
                    <Button
                        size="icon"
                        onClick={submit}
                        disabled={!query.trim() || loading}
                        className="h-9 w-9 shrink-0 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-30 transition-opacity"
                    >
                        {loading
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Send className="h-4 w-4" />}
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
