import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { targetsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { useKpiDefinitions } from '@/hooks/use-api';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Target } from '@/types';

const PERIOD_RANGES: Record<string, number> = {
  MENSUEL: 12,
  BIMESTRE: 6,
  TRIMESTRE: 4,
  SEMESTRE: 2,
  ANNEE: 1,
};

const PERIOD_LABELS: Record<string, string[]> = {
  MENSUEL: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  BIMESTRE: ['Bim. 1', 'Bim. 2', 'Bim. 3', 'Bim. 4', 'Bim. 5', 'Bim. 6'],
  TRIMESTRE: ['T1', 'T2', 'T3', 'T4'],
  SEMESTRE: ['S1', 'S2'],
  ANNEE: ['Année'],
};

const formSchema = z.object({
  kpiKey: z.string().min(1, 'KPI requis'),
  value: z.coerce.number({ required_error: 'Valeur requise' }),
  valueType: z.enum(['ABSOLUTE', 'PERCENTAGE', 'DELTA_PERCENT']),
  deltaReference: z.enum(['PREVIOUS_PERIOD', 'SAME_PERIOD_LAST_YEAR']).optional(),
  periodType: z.enum(['MENSUEL', 'BIMESTRE', 'TRIMESTRE', 'SEMESTRE', 'ANNEE']),
  periodIndex: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
  scenario: z.enum(['BUDGET', 'REVISED', 'FORECAST', 'STRETCH']),
  label: z.string().optional(),
}).refine(
  (data) => data.valueType !== 'DELTA_PERCENT' || !!data.deltaReference,
  { message: 'Référence delta requise pour ce type de valeur', path: ['deltaReference'] }
);

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target?: Target | null;
}

const MULTIPLIERS = [
  { label: 'Unité', value: 1 },
  { label: 'Milliers (K)', value: 1_000 },
  { label: 'Millions (M)', value: 1_000_000 },
  { label: 'Milliards (Mrd)', value: 1_000_000_000 },
];

function detectMultiplier(v: number): number {
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return 1_000_000_000;
  if (abs >= 1_000_000) return 1_000_000;
  if (abs >= 1_000) return 1_000;
  return 1;
}

export function TargetFormModal({ open, onOpenChange, target }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: kpiDefinitions } = useKpiDefinitions();
  const isEdit = !!target;
  const [kpiPopoverOpen, setKpiPopoverOpen] = useState(false);
  const [kpiSearch, setKpiSearch] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const [displayValue, setDisplayValue] = useState('0');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kpiKey: '',
      value: 0,
      valueType: 'ABSOLUTE',
      deltaReference: undefined,
      periodType: 'MENSUEL',
      periodIndex: 1,
      year: new Date().getFullYear(),
      scenario: 'BUDGET',
      label: '',
    },
  });

  const periodType = form.watch('periodType');
  const valueType = form.watch('valueType');

  useEffect(() => {
    if (target) {
      const m = target.valueType === 'ABSOLUTE' ? detectMultiplier(target.value) : 1;
      setMultiplier(m);
      setDisplayValue(String(target.value / m));
      form.reset({
        kpiKey: target.kpiKey,
        value: target.value,
        valueType: target.valueType,
        deltaReference: target.deltaReference,
        periodType: target.periodType,
        periodIndex: target.periodIndex,
        year: target.year,
        scenario: target.scenario,
        label: target.label ?? '',
      });
    } else {
      setMultiplier(1);
      setDisplayValue('0');
      form.reset({
        kpiKey: '',
        value: 0,
        valueType: 'ABSOLUTE',
        deltaReference: undefined,
        periodType: 'MENSUEL',
        periodIndex: 1,
        year: new Date().getFullYear(),
        scenario: 'BUDGET',
        label: '',
      });
    }
  }, [target, open]);

  // Reset periodIndex if out of range when periodType changes
  useEffect(() => {
    const max = PERIOD_RANGES[periodType] ?? 12;
    const current = form.getValues('periodIndex');
    if (current > max) form.setValue('periodIndex', 1);
  }, [periodType]);

  // Reset multiplier to 1 when switching away from ABSOLUTE
  useEffect(() => {
    if (valueType !== 'ABSOLUTE' && multiplier !== 1) {
      const parsed = parseFloat(displayValue || '0');
      setMultiplier(1);
      form.setValue('value', isNaN(parsed) ? 0 : parsed);
    }
  }, [valueType]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        ...values,
        deltaReference: values.valueType === 'DELTA_PERCENT' ? values.deltaReference : undefined,
      };
      if (isEdit && target) {
        return targetsApi.update(target.id, {
          value: payload.value,
          valueType: payload.valueType,
          deltaReference: payload.deltaReference,
          year: payload.year,
          label: payload.label,
        });
      }
      return targetsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      toast({
        title: 'Succès',
        description: isEdit ? 'Objectif mis à jour.' : 'Objectif créé.',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    },
  });

  const periodMax = PERIOD_RANGES[periodType] ?? 12;
  const periodLabels = PERIOD_LABELS[periodType] ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier l\'objectif' : 'Créer un objectif'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">

            {/* KPI Key — combobox avec recherche */}
            <FormField
              control={form.control}
              name="kpiKey"
              render={({ field }) => {
                const selectedKpi = kpiDefinitions?.find((k) => k.key === field.value);
                const filtered = kpiDefinitions?.filter((k) =>
                  k.name.toLowerCase().includes(kpiSearch.toLowerCase()) ||
                  k.key.toLowerCase().includes(kpiSearch.toLowerCase())
                ) ?? [];

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>KPI</FormLabel>
                    <Popover open={kpiPopoverOpen && !isEdit} onOpenChange={(o) => { if (!isEdit) setKpiPopoverOpen(o); }}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={isEdit}
                            className={cn(
                              'w-full justify-between font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {selectedKpi
                              ? <span>{selectedKpi.name} <code className="text-xs text-muted-foreground ml-1">({selectedKpi.key})</code></span>
                              : 'Sélectionner un KPI...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[480px] p-0" align="start">
                        <div className="p-2 border-b">
                          <Input
                            placeholder="Rechercher un KPI..."
                            value={kpiSearch}
                            onChange={(e) => setKpiSearch(e.target.value)}
                            className="h-8"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-[220px] overflow-y-auto">
                          {filtered.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Aucun KPI trouvé.</p>
                          ) : (
                            filtered.map((kpi) => (
                              <button
                                key={kpi.key}
                                type="button"
                                className={cn(
                                  'flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left',
                                  field.value === kpi.key && 'bg-accent'
                                )}
                                onClick={() => {
                                  field.onChange(kpi.key);
                                  setKpiSearch('');
                                  setKpiPopoverOpen(false);
                                }}
                              >
                                <Check className={cn('h-4 w-4 shrink-0', field.value === kpi.key ? 'opacity-100' : 'opacity-0')} />
                                <span className="font-medium">{kpi.name}</span>
                                <code className="text-xs text-muted-foreground ml-auto">{kpi.key}</code>
                              </button>
                            ))
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Value + ValueType */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => {
                  const isAbsolute = form.watch('valueType') === 'ABSOLUTE';
                  const actualValue = parseFloat(displayValue || '0') * (isAbsolute ? multiplier : 1);
                  const showPreview = isAbsolute && multiplier > 1 && !isNaN(actualValue);

                  return (
                    <FormItem>
                      <FormLabel>Valeur cible</FormLabel>
                      <div className="flex gap-1.5">
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            value={displayValue}
                            onChange={(e) => {
                              setDisplayValue(e.target.value);
                              const parsed = parseFloat(e.target.value);
                              field.onChange(isNaN(parsed) ? 0 : parsed * (isAbsolute ? multiplier : 1));
                            }}
                          />
                        </FormControl>
                        {isAbsolute && (
                          <Select
                            value={String(multiplier)}
                            onValueChange={(v) => {
                              const m = parseInt(v);
                              setMultiplier(m);
                              const parsed = parseFloat(displayValue || '0');
                              field.onChange(isNaN(parsed) ? 0 : parsed * m);
                            }}
                          >
                            <SelectTrigger className="w-[90px] shrink-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MULTIPLIERS.map((m) => (
                                <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      {showPreview && (
                        <p className="text-xs text-muted-foreground mt-1">
                          = {actualValue.toLocaleString('fr-FR')}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="valueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de valeur</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ABSOLUTE">Absolu</SelectItem>
                        <SelectItem value="PERCENTAGE">Pourcentage (%)</SelectItem>
                        <SelectItem value="DELTA_PERCENT">Variation (%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* DeltaReference — only if DELTA_PERCENT */}
            {valueType === 'DELTA_PERCENT' && (
              <FormField
                control={form.control}
                name="deltaReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence de comparaison</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une référence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PREVIOUS_PERIOD">Période précédente (N-1)</SelectItem>
                        <SelectItem value="SAME_PERIOD_LAST_YEAR">Même période, année précédente (N-1 YoY)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Period Type + Period Index + Year */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="periodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Périodicité</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MENSUEL">Mensuel</SelectItem>
                        <SelectItem value="BIMESTRE">Bimestre</SelectItem>
                        <SelectItem value="TRIMESTRE">Trimestriel</SelectItem>
                        <SelectItem value="SEMESTRE">Semestriel</SelectItem>
                        <SelectItem value="ANNEE">Annuel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="periodIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Période</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      value={String(field.value)}
                      disabled={isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: periodMax }, (_, i) => i + 1).map((idx) => (
                          <SelectItem key={idx} value={String(idx)}>
                            {periodLabels[idx - 1] ?? `P${idx}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année</FormLabel>
                    <FormControl>
                      <Input type="number" min={2000} max={2100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Scenario */}
            <FormField
              control={form.control}
              name="scenario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scénario</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BUDGET">Budget initial</SelectItem>
                      <SelectItem value="REVISED">Budget révisé</SelectItem>
                      <SelectItem value="FORECAST">Forecast (prévisionnel)</SelectItem>
                      <SelectItem value="STRETCH">Stretch (ambitieux)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Label (optional) */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Libellé <span className="text-muted-foreground text-xs">(optionnel)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Objectif CA T1 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
