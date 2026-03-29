import {
    TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
    Info, ShieldAlert, Package, BookOpen, Zap,
    DollarSign, BarChart3, Activity, LucideIcon
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────
export type PageInsightVariant = 'info' | 'success' | 'warning' | 'danger';

interface PageInsightProps {
    icon?: string;
    label: string;
    text: string;
    variant: PageInsightVariant;
    position?: 'top' | 'bottom';
}

// ── Icon resolver ─────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
    TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
    Info, ShieldAlert, Package, BookOpen, Zap,
    DollarSign, BarChart3, Activity,
};

// ── Style maps (inline colors to perfectly match spec) ────────────
const VARIANT_STYLES: Record<PageInsightVariant, {
    bg: string;
    border: string;
    iconColor: string;
    labelColor: string;
    darkBg: string;
    darkBorder: string;
    darkIcon: string;
}> = {
    info: {
        bg: '#EEF4FF',
        border: '#1E4D9B',
        iconColor: '#1E4D9B',
        labelColor: '#1E4D9B',
        darkBg: 'rgba(30,77,155,0.12)',
        darkBorder: '#3b82f6',
        darkIcon: '#60a5fa',
    },
    success: {
        bg: '#F0FDF4',
        border: '#10B981',
        iconColor: '#10B981',
        labelColor: '#10B981',
        darkBg: 'rgba(16,185,129,0.10)',
        darkBorder: '#10B981',
        darkIcon: '#34d399',
    },
    warning: {
        bg: '#FFF7ED',
        border: '#E8721C',
        iconColor: '#E8721C',
        labelColor: '#E8721C',
        darkBg: 'rgba(232,114,28,0.10)',
        darkBorder: '#f97316',
        darkIcon: '#fb923c',
    },
    danger: {
        bg: '#FEF2F2',
        border: '#EF4444',
        iconColor: '#EF4444',
        labelColor: '#EF4444',
        darkBg: 'rgba(239,68,68,0.10)',
        darkBorder: '#ef4444',
        darkIcon: '#f87171',
    },
};

export function PageInsight({
    icon = 'Info',
    label,
    text,
    variant,
    position = 'top',
}: PageInsightProps) {
    const styles = VARIANT_STYLES[variant];
    const IconComponent = ICON_MAP[icon] ?? Info;

    return (
        <div
            className="page-insight"
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '16px 20px',
                borderRadius: '12px',
                borderLeft: `4px solid ${styles.border}`,
                marginBottom: position === 'top' ? '0px' : '0px',
                marginTop: position === 'bottom' ? '0px' : '0px',
            }}
        >
            {/* Light mode background via className for dark mode support */}
            <style>{`
                .page-insight {
                    background: ${styles.bg};
                }
                .dark .page-insight {
                    background: ${styles.darkBg};
                    border-left-color: ${styles.darkBorder} !important;
                }
                .dark .page-insight .pi-icon {
                    color: ${styles.darkIcon} !important;
                }
                .dark .page-insight .pi-label {
                    color: ${styles.darkIcon} !important;
                }
            `}</style>

            {/* Icon */}
            <IconComponent
                className="pi-icon shrink-0 mt-0.5"
                style={{ width: 20, height: 20, color: styles.iconColor }}
            />

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span
                    className="pi-label"
                    style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.8px',
                        color: styles.labelColor,
                    }}
                >
                    {label}
                </span>
                <p
                    style={{
                        fontSize: '14px',
                        color: '#1A2B4A',
                        lineHeight: 1.6,
                        fontWeight: 400,
                        margin: 0,
                    }}
                    className="dark:!text-slate-200"
                >
                    {text}
                </p>
            </div>
        </div>
    );
}

// ── Utility: determine variant from a numeric trend/ratio ─────────
export function variantFromTrend(trend: number): PageInsightVariant {
    if (trend > 0) return 'success';
    if (trend < 0) return 'danger';
    return 'info';
}
