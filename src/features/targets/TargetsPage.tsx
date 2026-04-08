import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, MoreHorizontal, Loader2, Target, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { targetsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { useTargets, useKpiDefinitions } from '@/hooks/use-api';
import type { Target as TargetType } from '@/types';
import { TargetFormModal } from './TargetFormModal';

const SCENARIO_LABELS: Record<string, string> = {
  BUDGET: 'Budget',
  REVISED: 'Révisé',
  FORECAST: 'Forecast',
  STRETCH: 'Stretch',
};

const SCENARIO_COLORS: Record<string, string> = {
  BUDGET: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  REVISED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  FORECAST: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  STRETCH: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const PERIOD_TYPE_LABELS: Record<string, string> = {
  MENSUEL: 'Mensuel',
  BIMESTRE: 'Bimestre',
  TRIMESTRE: 'Trimestriel',
  SEMESTRE: 'Semestriel',
  ANNEE: 'Annuel',
};

const PERIOD_SHORT_LABELS: Record<string, string[]> = {
  MENSUEL: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  BIMESTRE: ['Bim. 1', 'Bim. 2', 'Bim. 3', 'Bim. 4', 'Bim. 5', 'Bim. 6'],
  TRIMESTRE: ['T1', 'T2', 'T3', 'T4'],
  SEMESTRE: ['S1', 'S2'],
  ANNEE: ['Année'],
};

const VALUE_TYPE_LABELS: Record<string, string> = {
  ABSOLUTE: 'Absolu',
  PERCENTAGE: '%',
  DELTA_PERCENT: 'Δ%',
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

export function TargetsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');

  const [filterYear, setFilterYear] = useState<number | undefined>(currentYear);
  const [filterScenario, setFilterScenario] = useState<string | undefined>(undefined);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TargetType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TargetType | null>(null);

  const { data: targets, isLoading } = useTargets({
    year: filterYear,
    scenario: filterScenario,
  });
  const { data: kpiDefinitions } = useKpiDefinitions();
  const kpiNameMap = Object.fromEntries((kpiDefinitions ?? []).map((k) => [k.key, k.name]));

  const filteredTargets = useMemo(() => {
    if (!globalSearch.trim()) return targets ?? [];
    const q = globalSearch.toLowerCase();
    return (targets ?? []).filter((t) => {
      const kpiName = (kpiNameMap[t.kpiKey] ?? '').toLowerCase();
      return (
        t.kpiKey.toLowerCase().includes(q) ||
        kpiName.includes(q) ||
        (t.label ?? '').toLowerCase().includes(q) ||
        (SCENARIO_LABELS[t.scenario] ?? t.scenario).toLowerCase().includes(q) ||
        (PERIOD_TYPE_LABELS[t.periodType] ?? t.periodType).toLowerCase().includes(q) ||
        String(t.year).includes(q)
      );
    });
  }, [targets, globalSearch, kpiNameMap]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => targetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      toast({ title: 'Succès', description: 'Objectif supprimé.' });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    },
  });

  const columns: ColumnDef<TargetType>[] = [
    {
      accessorKey: 'kpiKey',
      header: 'KPI',
      cell: ({ row }) => {
        const key = row.getValue('kpiKey') as string;
        const name = kpiNameMap[key];
        return (
          <div>
            <span className="font-medium text-sm">{name ?? key}</span>
            {name && <code className="block text-xs text-muted-foreground">{key}</code>}
          </div>
        );
      },
    },
    {
      accessorKey: 'value',
      header: 'Valeur cible',
      cell: ({ row }) => {
        const target = row.original;
        const suffix =
          target.valueType === 'PERCENTAGE' ? ' %'
          : target.valueType === 'DELTA_PERCENT' ? ' Δ%'
          : '';
        return (
          <span className="font-medium tabular-nums">
            {Number(row.getValue('value')).toLocaleString('fr-FR')}{suffix}
          </span>
        );
      },
    },
    {
      accessorKey: 'valueType',
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {VALUE_TYPE_LABELS[row.getValue('valueType') as string] ?? row.getValue('valueType')}
        </span>
      ),
    },
    {
      id: 'period',
      header: 'Période',
      cell: ({ row }) => {
        const target = row.original;
        const short = PERIOD_SHORT_LABELS[target.periodType]?.[target.periodIndex - 1] ?? `P${target.periodIndex}`;
        return (
          <span className="text-sm">
            {short} {target.year}
            <span className="ml-1 text-xs text-muted-foreground">
              ({PERIOD_TYPE_LABELS[target.periodType] ?? target.periodType})
            </span>
          </span>
        );
      },
    },
    {
      accessorKey: 'scenario',
      header: 'Scénario',
      cell: ({ row }) => {
        const scenario = row.getValue('scenario') as string;
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SCENARIO_COLORS[scenario] ?? ''}`}>
            {SCENARIO_LABELS[scenario] ?? scenario}
          </span>
        );
      },
    },
    {
      accessorKey: 'label',
      header: 'Libellé',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue('label') || '—'}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const target = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setEditTarget(target)}>
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteTarget(target)}
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="px-6 pt-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Objectifs & Cibles</h1>
        <p className="text-muted-foreground">
          Gérez vos objectifs budgétaires et prévisionnels par KPI, période et scénario.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objectifs définis
          </CardTitle>
          <CardDescription>
            {targets?.length ?? 0} objectif(s) — filtrez par année et scénario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters + Create button */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par KPI, scénario, libellé, année..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
            <Select
              value={filterYear ? String(filterYear) : 'all'}
              onValueChange={(v) => setFilterYear(v === 'all' ? undefined : parseInt(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterScenario ?? 'all'}
              onValueChange={(v) => setFilterScenario(v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Scénario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les scénarios</SelectItem>
                <SelectItem value="BUDGET">Budget</SelectItem>
                <SelectItem value="REVISED">Révisé</SelectItem>
                <SelectItem value="FORECAST">Forecast</SelectItem>
                <SelectItem value="STRETCH">Stretch</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto">
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel objectif
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable columns={columns} data={filteredTargets} onRowClick={(t) => navigate(`/targets/${t.id}`)} />
          )}
        </CardContent>
      </Card>

      {/* Create modal */}
      <TargetFormModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {/* Edit modal */}
      <TargetFormModal
        open={editTarget !== null}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        target={editTarget}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Supprimer l'objectif"
        description={`Confirmer la suppression de l'objectif "${deleteTarget?.label || deleteTarget?.kpiKey}" ? Cette action est irréversible.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isPending={deleteMutation.isPending}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />
    </div>
  );
}
