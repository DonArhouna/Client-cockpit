import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useFilters } from '@/context/FilterContext';
import { Widget } from '@/types';
import {
    exportDashboardToPptx,
    ExportOptions,
} from './pptxExportService';

export function usePptxExport() {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress]       = useState(0);
    const { toast }  = useToast();
    const { user }   = useAuth();
    const { period, currency } = useFilters();

    const exportToPptx = useCallback(async (
        widgets:  Widget[],
        pageId:   string,
        orgName?: string,
    ) => {
        if (isExporting) return;

        setIsExporting(true);
        setProgress(0);

        const toastResult = toast({
            title:       '📊 Export en cours…',
            description: 'Préparation de votre présentation PowerPoint.',
            duration:    60_000,
        });

        try {
            const options: ExportOptions = {
                pageId,
                orgName:  orgName ?? user?.organization?.name ?? 'Mon Organisation',
                period,
                currency,
                userName: user ? `${user.firstName} ${user.lastName}`.trim() : undefined,
            };

            await exportDashboardToPptx(widgets, options, (pct) => {
                setProgress(pct);
            });

            // Dismiss loading toast
            toastResult.dismiss();

            toast({
                title:       '✅ Export réussi !',
                description: 'Votre présentation PowerPoint a été téléchargée.',
                duration:    4000,
            });
        } catch (err) {
            toastResult.dismiss();
            toast({
                title:       '❌ Erreur d\'export',
                description: 'Impossible de générer la présentation. Veuillez réessayer.',
                variant:     'destructive',
                duration:    5000,
            });
            console.error('[usePptxExport]', err);
        } finally {
            setIsExporting(false);
            setProgress(0);
        }
    }, [isExporting, user, period, currency, toast]);

    return { isExporting, progress, exportToPptx };
}
