import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionsApi, onboardingApi } from '@/api';
import { useOnboarding } from '../OnboardingContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Check, ChevronRight, Zap, Users, BarChart3, Shield, HelpCircle, Sparkles,
} from 'lucide-react';
import type { SubscriptionPlan } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number | null | undefined): string {
  if (!price) return 'Sur devis';
  return new Intl.NumberFormat('fr-FR').format(price) + ' XOF / mois';
}

function PlanFeature({ text, available = true }: { text: string; available?: boolean }) {
  return (
    <li className={cn('flex items-start gap-2 text-sm', available ? 'text-foreground' : 'text-muted-foreground')}>
      {available
        ? <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        : <HelpCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 opacity-40" />
      }
      {text}
    </li>
  );
}

function planFeatures(plan: SubscriptionPlan): { text: string; available: boolean }[] {
  return [
    { text: plan.maxUsers ? `${plan.maxUsers} utilisateurs` : 'Utilisateurs illimités', available: true },
    { text: plan.maxWidgets ? `${plan.maxWidgets} widgets` : 'Widgets illimités', available: true },
    { text: plan.maxKpis ? `${plan.maxKpis} KPIs` : 'KPIs illimités', available: true },
    { text: 'Agent on-premise Sage', available: true },
    { text: 'Dashboards interactifs', available: true },
    { text: 'Requêtes intelligentes (NLQ)', available: !!plan.hasNlq },
    { text: 'Rapports avancés', available: !!plan.hasAdvancedReports },
  ];
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  startup: Zap,
  pme: BarChart3,
  business: Shield,
  enterprise: Sparkles,
};

const PLAN_COLORS: Record<string, string> = {
  startup: 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40',
  pme: 'border-primary/60 bg-primary/5',
  business: 'border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30',
  enterprise: 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30',
};

const PLAN_RECOMMENDED = 'pme';

// ─── Component ────────────────────────────────────────────────────────────────

export function Step1Plan() {
  const { selectedPlan, setSelectedPlan, goToStep, setOnboardingStatus } = useOnboarding();
  const { refetchOnboarding } = useAuth();
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans-public'],
    queryFn: () => subscriptionsApi.getPlans().then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (plan: string) => onboardingApi.step1({ plan }),
    onSuccess: async (res) => {
      setOnboardingStatus(res.data.status);
      await refetchOnboarding();
      goToStep(2);
    },
    onError: (err: any) => {
      toast({
        title: 'Erreur',
        description: err.response?.data?.message ?? 'Une erreur est survenue.',
        variant: 'destructive',
      });
    },
  });

  const handleSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (!selectedPlan) return;
    mutation.mutate(selectedPlan.name);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Étape 1 sur 6</p>
        <h1 className="text-2xl font-bold tracking-tight">Choisissez votre plan</h1>
        <p className="text-muted-foreground text-sm mt-1">
          14 jours d'essai gratuit · Résiliable à tout moment · Aucun engagement
        </p>
      </div>

      {/* Plans grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(plans ?? []).map(plan => {
            const Icon = PLAN_ICONS[plan.name] ?? BarChart3;
            const isSelected = selectedPlan?.id === plan.id;
            const isRecommended = plan.name === PLAN_RECOMMENDED;

            return (
              <button
                key={plan.id}
                onClick={() => handleSelect(plan)}
                className={cn(
                  'relative text-left rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md group',
                  isSelected
                    ? 'border-primary shadow-md ring-2 ring-primary/20'
                    : cn('border-border hover:border-primary/40', PLAN_COLORS[plan.name]),
                )}
              >
                {isRecommended && (
                  <Badge className="absolute -top-2.5 left-3 text-[10px] px-2 py-0.5 bg-primary">
                    Recommandé
                  </Badge>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{plan.label}</p>
                      {plan.description && (
                        <p className="text-[10px] text-muted-foreground">{plan.description}</p>
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors',
                    isSelected ? 'border-primary bg-primary' : 'border-border',
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                </div>

                <p className="text-base font-bold mb-3">
                  {formatPrice(plan.priceMonthly)}
                </p>

                <ul className="space-y-1.5">
                  {planFeatures(plan).slice(0, 4).map((f, i) => (
                    <PlanFeature key={i} text={f.text} available={f.available} />
                  ))}
                </ul>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <ul className="space-y-1.5">
                      {planFeatures(plan).slice(4).map((f, i) => (
                        <PlanFeature key={i} text={f.text} available={f.available} />
                      ))}
                    </ul>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Users count context */}
      {selectedPlan && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Users className="w-3.5 h-3.5" />
          <span>
            Plan <strong>{selectedPlan.label}</strong> — jusqu'à{' '}
            {selectedPlan.maxUsers ? `${selectedPlan.maxUsers} utilisateurs` : 'utilisateurs illimités'}
          </span>
        </div>
      )}

      {/* CTA */}
      <Button
        size="lg"
        onClick={handleContinue}
        disabled={!selectedPlan || mutation.isPending}
        className="w-full"
      >
        {mutation.isPending ? (
          'Enregistrement…'
        ) : (
          <>
            Continuer
            <ChevronRight className="w-4 h-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
}
