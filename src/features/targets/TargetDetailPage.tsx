import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTarget, useKpiDefinitions } from '@/hooks/use-api';
import { targetsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Trash2, CalendarDays, TrendingUp, Target, Tag, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TargetFormModal } from './TargetFormModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SCENARIO_LABELS: Record<string, string> = {
  BUDGET: 'Budget',
  REVISED: 'Révisé',
  FORECAST: 'Forecast',
  STRETCH: 'Stretch',
};

const SCENARIO_COLORS: Record<string, string> = {
  BUDGET: 'text-blue-800 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  REVISED: 'text-orange-800 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
  FORECAST: 'text-purple-800 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  STRETCH: 'text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
};

const PERIOD_TYPE_LABELS: Record<string, string> = {
  MENSUEL: 'Mensuel',
  BIMESTRE: 'Bimestre',
  TRIMESTRE: 'Trimestriel',
  SEMESTRE: 'Semestriel',
  ANNEE: 'Annuel',
};

const PERIOD_SHORT_LABELS: Record<string, string[]> = {
  MENSUEL: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  BIMESTRE: ['Bimestre 1', 'Bimestre 2', 'Bimestre 3', 'Bimestre 4', 'Bimestre 5', 'Bimestre 6'],
  TRIMESTRE: ['T1', 'T2', 'T3', 'T4'],
  SEMESTRE: ['Semestre 1', 'Semestre 2'],
  ANNEE: ['Année entière'],
};

const VALUE_TYPE_LABELS: Record<string, string> = {
  ABSOLUTE: 'Valeur absolue',
  PERCENTAGE: 'Pourcentage (%)',
  DELTA_PERCENT: 'Variation (%)',
};

const DELTA_REF_LABELS: Record<string, string> = {
  PREVIOUS_PERIOD: 'Période précédente (N-1)',
  SAME_PERIOD_LAST_YEAR: 'Même période, année précédente (YoY)',
};

export function TargetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: target, isLoading, error } = useTarget(id!);
  const { data: kpiDefinitions } = useKpiDefinitions();
  const kpiDef = kpiDefinitions?.find((k) => k.key === target?.kpiKey);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => targetsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      toast({ title: 'Succès', description: 'Objectif supprimé.' });
      navigate('/targets');
    },
    onError: (err: any) => {
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (error || !target) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <p className="text-destructive font-medium">Objectif introuvable.</p>
        <Button onClick={() => navigate('/targets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const periodLabel = PERIOD_SHORT_LABELS[target.periodType]?.[target.periodIndex - 1] ?? `Période ${target.periodIndex}`;
  const valueSuffix =
    target.valueType === 'PERCENTAGE' ? ' %'
    : target.valueType === 'DELTA_PERCENT' ? ' Δ%'
    : '';

  return (
    <div className="space-y-6 px-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/targets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {kpiDef?.name ?? target.kpiKey}
          </h1>
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', SCENARIO_COLORS[target.scenario])}>
            {SCENARIO_LABELS[target.scenario] ?? target.scenario}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Main details — 2/3 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Définition de l'objectif
            </CardTitle>
            <CardDescription>Paramètres de la cible budgétaire ou prévisionnelle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">KPI</p>
                <p className="font-bold mt-1">{kpiDef?.name ?? target.kpiKey}</p>
                <code className="text-xs text-muted-foreground">{target.kpiKey}</code>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Période</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">{periodLabel} {target.year}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{PERIOD_TYPE_LABELS[target.periodType] ?? target.periodType}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Scénario</p>
                <div className="mt-1">
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', SCENARIO_COLORS[target.scenario])}>
                    {SCENARIO_LABELS[target.scenario] ?? target.scenario}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Type de valeur</p>
                <p className="font-bold mt-1">{VALUE_TYPE_LABELS[target.valueType] ?? target.valueType}</p>
              </div>

              {target.deltaReference && (
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Référence de comparaison</p>
                  <p className="font-medium mt-1">{DELTA_REF_LABELS[target.deltaReference] ?? target.deltaReference}</p>
                </div>
              )}

              {target.label && (
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Libellé</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{target.label}</p>
                  </div>
                </div>
              )}

              <div className="sm:col-span-2 pt-4 border-t flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Créé le {format(new Date(target.createdAt), 'dd MMMM yyyy', { locale: fr })}
                {target.updatedAt !== target.createdAt && (
                  <> · Modifié le {format(new Date(target.updatedAt), 'dd MMMM yyyy', { locale: fr })}</>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Value card — 1/3 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Valeur cible
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Cible définie</p>
              <p className="text-3xl font-black text-primary tabular-nums">
                {Number(target.value).toLocaleString('fr-FR')}{valueSuffix}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-bold">{VALUE_TYPE_LABELS[target.valueType] ?? target.valueType}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Périodicité</span>
                <span className="font-bold">{PERIOD_TYPE_LABELS[target.periodType] ?? target.periodType}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Année</span>
                <span className="font-bold">{target.year}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Période</span>
                <span className="font-bold">{periodLabel}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Edit modal */}
      <TargetFormModal open={editOpen} onOpenChange={setEditOpen} target={target} />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer l'objectif"
        description={`Confirmer la suppression de l'objectif "${target.label || target.kpiKey}" ? Cette action est irréversible.`}
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />
    </div>
  );
}
