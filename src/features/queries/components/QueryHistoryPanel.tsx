import { useState } from 'react';
import {
    ArrowLeft, History, Loader2, ChevronRight,
    BarChart3, Table2, Hash, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FAVORITES_KEY = 'cockpit_nlq_favorites';

export interface NlqHistoryEntry {
    queryText: string;
    intentLabel: string;
    intentKey: string;
    vizType: string;
    jobId: string;
    ts: number;
}

interface QueryHistoryPanelProps {
    entries: NlqHistoryEntry[];
    loading: boolean;
    onReplay: (h: NlqHistoryEntry) => void;
    onClose: () => void;
}

function getVizIcon(vizType: string) {
    if (vizType === 'table') return Table2;
    if (vizType === 'scalar' || vizType === 'kpi') return Hash;
    return BarChart3;
}

function loadFavorites(): string[] {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]');
    } catch {
        return [];
    }
}

function saveFavorites(ids: string[]) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function QueryHistoryPanel({ entries, loading, onReplay, onClose }: QueryHistoryPanelProps) {
    const [favorites, setFavorites] = useState<string[]>(loadFavorites);

    const toggleFavorite = (jobId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = favorites.includes(jobId)
            ? favorites.filter(id => id !== jobId)
            : [...favorites, jobId];
        setFavorites(next);
        saveFavorites(next);
    };

    const favoriteEntries = entries.filter(h => favorites.includes(h.jobId));
    const recentEntries = entries.filter(h => !favorites.includes(h.jobId));

    return (
        <div className="fixed inset-0 z-40" onClick={onClose}>
            <div
                className="absolute top-0 right-0 bottom-0 w-80 bg-background border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border flex-none">
                    <button
                        onClick={onClose}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-bold text-foreground">Historique des requêtes</span>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
                    {loading && (
                        <div className="flex items-center justify-center h-full gap-2 text-slate-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Chargement…</span>
                        </div>
                    )}

                    {!loading && entries.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                            <History className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                            <span className="text-sm text-slate-400">Aucune requête récente</span>
                        </div>
                    )}

                    {/* Favorites */}
                    {!loading && favoriteEntries.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 px-1">
                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Favoris
                                </span>
                            </div>
                            {favoriteEntries.map(h => (
                                <HistoryEntry
                                    key={h.jobId}
                                    entry={h}
                                    isFavorite
                                    onReplay={onReplay}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    )}

                    {/* Recent */}
                    {!loading && recentEntries.length > 0 && (
                        <div className="space-y-1.5">
                            {favoriteEntries.length > 0 && (
                                <div className="flex items-center gap-1.5 px-1">
                                    <History className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Récentes
                                    </span>
                                </div>
                            )}
                            {recentEntries.map(h => (
                                <HistoryEntry
                                    key={h.jobId}
                                    entry={h}
                                    isFavorite={false}
                                    onReplay={onReplay}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Entry row ─────────────────────────────────────────────────────────────────

interface HistoryEntryProps {
    entry: NlqHistoryEntry;
    isFavorite: boolean;
    onReplay: (h: NlqHistoryEntry) => void;
    onToggleFavorite: (jobId: string, e: React.MouseEvent) => void;
}

function HistoryEntry({ entry: h, isFavorite, onReplay, onToggleFavorite }: HistoryEntryProps) {
    const VizIcon = getVizIcon(h.vizType);
    const date = new Date(h.ts);
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    return (
        <button
            onClick={() => onReplay(h)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors text-left group w-full border border-transparent hover:border-border/50"
        >
            {/* Viz type icon */}
            <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <VizIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{h.queryText}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 truncate max-w-[120px]">
                        {h.intentLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{dateStr}</span>
                </div>
            </div>

            {/* Favorite star */}
            <button
                onClick={e => onToggleFavorite(h.jobId, e)}
                className={cn(
                    'h-6 w-6 rounded-md flex items-center justify-center transition-colors shrink-0',
                    isFavorite
                        ? 'text-amber-400'
                        : 'text-slate-200 dark:text-slate-700 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                )}
            >
                <Star className={cn('h-3.5 w-3.5', isFavorite && 'fill-amber-400')} />
            </button>

            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </button>
    );
}
