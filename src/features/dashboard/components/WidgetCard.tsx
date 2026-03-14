import { CSSProperties } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, GripHorizontal } from 'lucide-react';
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
    widget: Widget;
    isEditing: boolean;
    onRemove: (id: string) => void;
    w?: number;
    h?: number;
    className?: string;
    style?: CSSProperties;
}

export function WidgetCard({ widget, isEditing, onRemove, h, className, style }: WidgetCardProps) {
    const { t } = useTranslation();

    // Pour les KPIs principaux du dashboard, ne jamais utiliser le mode compact
    const isMainKpi = widget.id?.startsWith('main-kpi-');
    const isKpi = widget.type === 'kpi';
    // Pour les KPIs, on est compact seulement si h <= 2. 
    // Sur les pages Analyse/Performance, h=3 doit être standard.
    const isCompact = isMainKpi ? false : !!(h && h <= 2);

    // Rendu dynamique du contenu selon le type de widget ou la clé KPI
    const renderContent = () => {
        // 1. KPIs simples (Valeurs uniques)
        if (widget.type === 'kpi' && widget.vizType === 'card') {
            return <KpiVisual widget={widget} isCompact={isCompact} />;
        }

        // 2. Budget vs Réalisé (Variance)
        if (widget.kpiKey === 'ecart_budget_realise' || widget.kpiKey?.includes('budget')) {
            return <VarianceVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }

        // 3. Évolutions temporelles (Graphiques aire/ligne)
        if (widget.type === 'graph' || widget.vizType === 'area' || widget.vizType === 'line' || widget.kpiKey?.includes('evolution') || widget.kpiKey?.includes('prevision')) {
            return <RevenueEvolutionVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }

        // 4. Listes spécialisées (Balance Âgée)
        if (widget.kpiKey === 'balance_agee_clients' || widget.kpiKey === 'accounts_receivable_age' || (widget.vizType === 'bar' && widget.name.includes('Créances'))) {
            return <ReceivablesVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }

        // 5. Tableaux de données (Anomalies, etc.)
        if (widget.type === 'table' || widget.vizType === 'table') {
            // Cas particulier pour Top Clients qui est une table très spécifique
            if (widget.kpiKey?.includes('top_clients') || widget.kpiKey?.includes('top10_clients')) {
                return <TopClientsVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
            }
            return <TableVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }

        // 6. Camembert
        if (widget.vizType === 'pie' || widget.vizType === 'donut') {
            return <PieVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }

        // 7. Autres graphiques (Barres, etc.)
        if (widget.vizType === 'bar') {
            return <RevenueEvolutionVisual kpiKey={widget.kpiKey || ''} isCompact={isCompact} />;
        }

        // Rendu par défaut si le type n'est pas géré spécifiquement
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground bg-slate-50 border border-dashed rounded-md m-2 text-[10px] p-2 text-center">
                Visualisation {widget.vizType || widget.type} : {widget.name}
            </div>
        );
    };

    return (
        <Card className={cn("flex flex-col h-full relative group overflow-hidden bg-white dark:bg-slate-900", className)} style={style}>
            {isEditing && (
                <div className="absolute top-0 left-0 right-0 h-6 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm cursor-grab active:cursor-grabbing flex items-center justify-center drag-handle z-10 border-b">
                    <GripHorizontal className="h-4 w-4 text-slate-400" />
                </div>
            )}

            {isEditing ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive z-30 absolute top-1 right-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border rounded-full opacity-100 transition-all"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(widget.id);
                    }}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            ) : (
                !isKpi && (
                    <div className="absolute top-2 right-2 z-20">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                    // Implémenter la logique d'export plus tard
                                }}>
                                    {t('dashboard.export', 'Exporter les données')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    // Implémenter la logique d'analyse plus tard
                                }}>
                                    {t('dashboard.analyze', 'Analyse détaillée')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            )}

            <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-0 flex-none", isEditing ? "pt-8" : "pt-4", isKpi ? "hidden" : "pb-2")}>
                {!isKpi && (
                    <div className="pr-8">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                            {widget.name}
                        </CardTitle>
                    </div>
                )}
            </CardHeader>

            <CardContent className={cn("flex-1 overflow-hidden", isKpi ? "p-6" : "p-4 pt-0")}>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
