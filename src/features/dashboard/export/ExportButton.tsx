import { Presentation, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Widget } from '@/types';
import { usePptxExport } from './usePptxExport';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
    widgets:   Widget[];
    pageId:    string;
    /** Optionally pass the org name; falls back to user's org */
    orgName?:  string;
    /** Compact mode: icon-only */
    compact?:  boolean;
    className?: string;
}

export function ExportButton({
    widgets,
    pageId,
    orgName,
    compact = false,
    className,
}: ExportButtonProps) {
    const { isExporting, progress, exportToPptx } = usePptxExport();
    const { user } = useAuth();

    const resolvedOrgName = orgName ?? user?.organization?.name ?? undefined;

    const handleExport = () => {
        exportToPptx(widgets, pageId, resolvedOrgName);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            title="Exporter en PowerPoint (.pptx)"
            className={cn(
                'gap-2 h-9 border-slate-200 dark:border-slate-700',
                'hover:bg-[#1e3a6e]/5 hover:border-[#3b66ac]/50 hover:text-[#3b66ac]',
                'dark:hover:bg-[#3b66ac]/10 dark:hover:text-[#5a85cb]',
                'transition-all duration-200 font-semibold text-[12px]',
                'relative overflow-hidden',
                className,
            )}
        >
            {/* Progress bar underlay */}
            {isExporting && (
                <span
                    className="absolute inset-0 bg-[#3b66ac]/10 origin-left transition-transform duration-300"
                    style={{ transform: `scaleX(${progress / 100})` }}
                />
            )}

            {isExporting ? (
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    {!compact && (
                        <span className="relative z-10">
                            {progress < 100 ? `${progress}%` : 'Finalisation…'}
                        </span>
                    )}
                </>
            ) : (
                <>
                    <Presentation className="h-3.5 w-3.5 shrink-0" />
                    {!compact && <span className="relative z-10">Exporter PPTX</span>}
                    {compact && <Download className="h-3 w-3 opacity-60 shrink-0" />}
                </>
            )}
        </Button>
    );
}
