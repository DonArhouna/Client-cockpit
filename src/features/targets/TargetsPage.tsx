import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Loader2, Target, Search, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const [expandedKpis, setExpandedKpis] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(true);

  const { data: targets, isLoading } = useTargets({ year: filterYear, scenario: filterScenario });
  const { data: kpiDefinitions } = useKpiDefinitions();
  const kpiNameMap = useMemo(
    () => Object.fromEntries((kpiDefinitions ?? []).map((k) => [k.key, k.name])),
    [kpiDefinitions],
  );

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

  // Group by kpiKey, ordered by first appearance
  const groupedTargets = useMemo(() => {
    const groups = new Map<string, TargetType[]>();
    for (const t of filteredTargets) {
      if (!groups.has(t.kpiKey)) groups.set(t.kpiKey, []);
      groups.get(t.kpiKey)!.push(t);
    }
    return groups;
  }, [filteredTargets]);

  const kpiKeys = useMemo(() => [...groupedTargets.keys()], [groupedTargets]);

  // Sync expandedKpis when groups change (auto-expand new keys)
  const isExpanded = (key: string) => allExpanded ? !expandedKpis.has(key) : expandedKpis.has(key);

  const toggleKpi = (key: string) => {
    setExpandedKpis((prev) => {
      const next = new Set(prev);
      if (isExpanded(key)) next.add(key); // mark as "override collapsed"
      else next.delete(key);              // remove override
      return next;
    });
  };

  const toggleAll = () => {
    setAllExpanded((prev) => !prev);
    setExpandedKpis(new Set()); // reset overrides
  };

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
            {filteredTargets.length} objectif(s) — {kpiKeys.length} KPI(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
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

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="h-8 px-2 text-muted-foreground hidden sm:flex items-center gap-1"
              title={allExpanded ? 'Tout replier' : 'Tout déplier'}
            >
              {allExpanded
                ? <><ChevronsDownUp className="h-4 w-4" /> Replier</>
                : <><ChevronsUpDown className="h-4 w-4" /> Déplier</>}
            </Button>

            <div className="ml-auto">
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel objectif
              </Button>
            </div>
          </div>

          {/* Grouped table */}
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : kpiKeys.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
              Aucun objectif trouvé.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2 text-[11px] font-bold uppercase text-muted-foreground w-8" />
                    <th className="text-left px-4 py-2 text-[11px] font-bold uppercase text-muted-foreground">Valeur cible</th>
                    <th className="text-left px-4 py-2 text-[11px] font-bold uppercase text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-2 text-[11px] font-bold uppercase text-muted-foreground">Période</th>
                    <th className="text-left px-4 py-2 text-[11px] font-bold uppercase text-muted-foreground">Scénario</th>
                    <th className="text-left px-4 py-2 text-[11px] font-bold uppercase text-muted-foreground">Libellé</th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {kpiKeys.map((kpiKey) => {
                    const rows = groupedTargets.get(kpiKey)!;
                    const kpiName = kpiNameMap[kpiKey];
                    const expanded = isExpanded(kpiKey);

                    return (
                      <>
                        {/* KPI group header */}
                        <tr
                          key={`group-${kpiKey}`}
                          className="bg-slate-50 dark:bg-slate-900/60 border-b cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                          onClick={() => toggleKpi(kpiKey)}
                        >
                          <td className="px-4 py-2.5">
                            {expanded
                              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          </td>
                          <td colSpan={5} className="px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm">{kpiName ?? kpiKey}</span>
                                {kpiName && (
                                  <code className="text-xs text-muted-foreground">{kpiKey}</code>
                                )}
                              </div>
                              <span className="inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium h-5 min-w-5 px-1.5">
                                {rows.length}
                              </span>
                            </div>
                          </td>
                          <td />
                        </tr>

                        {/* Target rows */}
                        {expanded && rows.map((target) => {
                          const short = PERIOD_SHORT_LABELS[target.periodType]?.[target.periodIndex - 1] ?? `P${target.periodIndex}`;
                          const suffix = target.valueType === 'PERCENTAGE' ? ' %'
                            : target.valueType === 'DELTA_PERCENT' ? ' Δ%' : '';

                          return (
                            <tr
                              key={target.id}
                              className="border-b last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 cursor-pointer transition-colors group"
                              onClick={() => navigate(`/targets/${target.id}`)}
                            >
                              <td className="px-4 py-2.5 w-8" />
                              <td className="px-4 py-2.5 font-medium tabular-nums">
                                {Number(target.value).toLocaleString('fr-FR')}{suffix}
                              </td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                {VALUE_TYPE_LABELS[target.valueType] ?? target.valueType}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="text-sm">{short} {target.year}</span>
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({PERIOD_TYPE_LABELS[target.periodType] ?? target.periodType})
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SCENARIO_COLORS[target.scenario] ?? ''}`}>
                                  {SCENARIO_LABELS[target.scenario] ?? target.scenario}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-muted-foreground">
                                {target.label || '—'}
                              </td>
                              <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create modal */}
      <TargetFormModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />

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