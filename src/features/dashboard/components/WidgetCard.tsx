import { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, GripHorizontal, Sparkles, Filter } from 'lucide-react';
import { Widget } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { KpiVisual } from './visuals/KpiVisual';
import { RevenueEvolutionVisual } from './visuals/RevenueEvolutionVisual';
import { ReceivablesVisual } from './visuals/ReceivablesVisual';
import { TopClientsVisual } from './visuals/TopClientsVisual';
import { VarianceVisual } from './visuals/VarianceVisual';
import { TableVisual } from './visuals/TableVisual';
import { PieVisual } from './visuals/PieVisual';

interface WidgetCardProps {
    pageId: string;
    widget: Widget;
    isEditing: boolean;
    onRemove: (id: string) => void;
    w?: number;
    h?: number;
    className?: string;
    style?: CSSProperties;
}

export function WidgetCard({ pageId, widget, isEditing, onRemove, h, className, style }: WidgetCardProps) {
    const { t } = useTranslation();

    const isMainKpi = widget.id?.startsWith('main-kpi-');
    const isKpi = widget.type === 'kpi';
    const isCompact = isMainKpi ? false : !!(h && h <= 2);

    // ── Visual renderer ──────────────────────────────────────────
    const renderContent = () => {
        if (widget.type === 'kpi' && widget.vizType === 'card') {
            return <KpiVisual widget={widget} isCompact={isCompact} />;
        }
        if (widget.kpiKey === 'ecart_budget_realise' || widget.kpiKey?.includes('budget')) {
            return <VarianceVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }
        if (widget.type === 'graph' || widget.vizType === 'area' || widget.vizType === 'line'
            || widget.kpiKey?.includes('evolution') || widget.kpiKey?.includes('prevision')) {
            return <RevenueEvolutionVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }
        if (widget.kpiKey === 'balance_agee_clients' || widget.kpiKey === 'accounts_receivable_age'
            || (widget.vizType === 'bar' && widget.name.includes('Créances'))) {
            return <ReceivablesVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }
        if (widget.type === 'table' || widget.vizType === 'table') {
            if (widget.kpiKey?.includes('top_clients') || widget.kpiKey?.includes('top10_clients')) {
                return <TopClientsVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
            }
            return <TableVisual 
                pageId={pageId}
                widget={widget} 
                isCompact={isCompact} 
            />;
        }
        if (widget.vizType === 'pie' || widget.vizType === 'donut') {
            return <PieVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }
        if (widget.vizType === 'bar') {
            return <RevenueEvolutionVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground bg-slate-50 dark:bg-slate-800/30 border border-dashed rounded-md m-2 text-[10px] p-2 text-center">
                {widget.vizType || widget.type} : {widget.name}
            </div>
        );
    };

    return (
        <div
            className={cn(
                'card-premium flex flex-col h-full relative group overflow-hidden',
                'bg-white dark:bg-slate-900 rounded-2xl',
                className
            )}
            style={style}
        >
            {/* ── Drag handle (edit mode) ── */}
            {isEditing && (
                <div className="absolute top-0 left-0 right-0 h-6 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-sm cursor-grab active:cursor-grabbing flex items-center justify-center drag-handle z-10 border-b border-border/50 rounded-t-2xl">
                    <GripHorizontal className="h-3.5 w-3.5 text-slate-400" />
                </div>
            )}

            {/* ── Delete button (edit mode) ── */}
            {isEditing ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive z-30 absolute top-1.5 right-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border rounded-full opacity-100 transition-all"
                    onClick={(e) => { e.stopPropagation(); onRemove(widget.id); }}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            ) : (
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 text-right justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-border/70">
                            <DropdownMenuItem className="text-[13px]">
                                {t('dashboard.export', 'Exporter les données')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[13px]">
                                {t('dashboard.analyze', 'Analyse détaillée')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* ── Chart / graph header (Widgets showing title) ── */}
            {widget.vizType !== 'card' && (
                <div className={cn(
                    'flex items-center justify-between px-5 pt-4 pb-2 flex-none',
                    isEditing && 'pt-8'
                )}>
                    {/* Left side: Title */}
                    <div className="flex items-center gap-2 overflow-hidden">
                        {/* Colored accent bar */}
                        <div className="w-1 h-5 rounded-full bg-primary/70 shrink-0" />
                        <h3 className="text-[14px] font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                            {widget.name}
                        </h3>
                    </div>

                    {/* Right side: Quick Action (Filter) */}
                    <div className="flex items-center gap-2 mr-6">
                        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-[11px] font-bold">
                            <span className="opacity-50"><Filter className="h-3.5 w-3.5" /></span>
                            Filtrer
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Content ── */}
            <div className={cn(
                'flex-1 overflow-hidden',
                isKpi ? (isEditing ? 'p-5 pt-8' : (isCompact ? 'p-4 pb-2' : 'p-5')) : 'px-5 pb-5 pt-1'
            )}>
                {renderContent()}
            </div>

            {/* ── Bottom: Zuri button for KPI cards only ──────── */}
            {isKpi && (
                <div className={cn("px-5 pb-4 flex justify-end", isCompact && "px-4 pb-3")}>
                    <button className={cn(
                        'flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all',
                        'bg-[#3b66ac]/10 hover:bg-[#3b66ac]/20 text-[#3b66ac] dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400'
                    )}>
                        <Sparkles style={{ width: 12, height: 12 }} />
                        Demander à Zuri
                    </button>
                </div>
            )}
        </div>
    );
}
