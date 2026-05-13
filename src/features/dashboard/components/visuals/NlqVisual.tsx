import { useState } from 'react';
import { Sparkles, MessageSquare, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NlqConversationModal } from './NlqConversationModal';

interface NlqVisualProps {
    isCompact?: boolean;
    dashboardId?: string;
    pageId?: string;
    widgetId?: string;
}

export function NlqVisual({ isCompact, dashboardId, pageId, widgetId }: NlqVisualProps) {
    const [open, setOpen] = useState(false);

    // ── Compact: single clickable bar ────────────────────────────
    if (isCompact) {
        return (
            <>
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 h-full w-full px-1 rounded-lg hover:bg-primary/5 transition-colors group"
                >
                    <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex-1 text-left group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        Interroger Zuri…
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                </button>
                <NlqConversationModal open={open} onClose={() => setOpen(false)} dashboardId={dashboardId} pageId={pageId} nlqWidgetId={widgetId} />
            </>
        );
    }

    // ── Full: invitation card ────────────────────────────────────
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className={cn(
                    'flex flex-col items-center justify-center h-full w-full gap-4',
                    'rounded-xl transition-colors group',
                    'hover:bg-primary/5 dark:hover:bg-primary/10',
                )}
            >
                {/* Icon */}
                <div className="h-14 w-14 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary" />
                </div>

                {/* Copy */}
                <div className="flex flex-col items-center gap-1 text-center px-4">
                    <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                        Interroger Zuri
                    </span>
                    <span className="text-[11px] text-slate-400 leading-relaxed">
                        Posez une question en langage naturel sur vos données Sage
                    </span>
                </div>

                {/* CTA pill */}
                <div className={cn(
                    'flex items-center gap-1.5 text-[11px] font-bold text-primary',
                    'bg-primary/10 group-hover:bg-primary/20 px-4 py-1.5 rounded-full transition-colors',
                )}>
                    <MessageSquare className="h-3.5 w-3.5" />
                    Ouvrir la conversation
                </div>
            </button>

            <NlqConversationModal open={open} onClose={() => setOpen(false)} dashboardId={dashboardId} pageId={pageId} nlqWidgetId={widgetId} />
        </>
    );
}
