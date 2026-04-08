import { TrendingUp, TrendingDown, AlertTriangle, Info, LucideIcon } from 'lucide-react';

export type PageInsightVariant = 'info' | 'success' | 'warning' | 'danger';

interface PageInsightProps {
    icon?: string;
    label: string;
    text: string;
    variant: PageInsightVariant;
    position?: 'top' | 'bottom';
}

const ICON_MAP: Record<string, LucideIcon> = {
    TrendingUp, TrendingDown, AlertTriangle, Info,
};

// Bordure gauche uniquement — brand blue ou rouge selon criticité
const BORDER_COLOR: Record<PageInsightVariant, string> = {
    info:    '#3b66ac',
    success: '#3b66ac',
    warning: '#f59e0b',
    danger:  '#ef4444',
};

export function PageInsight({ icon = 'Info', label, text, variant }: PageInsightProps) {
    const IconComponent = ICON_MAP[icon] ?? Info;
    const borderColor = BORDER_COLOR[variant];

    return (
        <div
            className="flex items-start gap-3 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60"
            style={{ borderLeft: `3px solid ${borderColor}` }}
        >
            <IconComponent
                className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500"
                style={{ width: 14, height: 14 }}
            />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                    {label}
                </span>
                <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {text}
                </p>
            </div>
        </div>
    );
}

export function variantFromTrend(trend: number): PageInsightVariant {
    if (trend > 0) return 'success';
    if (trend < 0) return 'danger';
    return 'info';
}
