import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionsApi, billingApi } from '@/api';
import { useOnboarding } from '../OnboardingContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ChevronLeft, Check, Shield, Lock, Star, Sparkles, CalendarCheck, CreditCard,
} from 'lucide-react';
import type { SubscriptionPlan } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatXOF(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XOF';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step6Payment() {
  const { goToStep, selectedPlan } = useOnboarding();
  const { toast } = useToast();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [chosenPlanId, setChosenPlanId] = useState<string | null>(selectedPlan?.id ?? null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans-public'],
    queryFn: () => subscriptionsApi.getPlans().then(r => r.data),
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) =>
      billingApi.createCheckout({
        planId,
        successUrl: `${window.location.origin}/onboarding`,
        cancelUrl: `${window.location.origin}/onboarding`,
      }),
    onSuccess: (res) => {
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    },
    onError: (err: any) => {
      toast({
        title: 'Erreur de paiement',
        description: err.response?.data?.message ?? 'Impossible de créer la session de paiement.',
        variant: 'destructive',
      });
    },
  });

  const handlePay = () => {
    if (!chosenPlanId) return;
    checkoutMutation.mutate(chosenPlanId);
  };

  const activePlan = plans?.find(p => p.id === chosenPlanId);

  const getDisplayPrice = (plan: SubscriptionPlan): { monthly: string; annual: string; annualMonthly: string } => {
    if (!plan.priceMonthly) return { monthly: 'Sur devis', annual: 'Sur devis', annualMonthly: 'Sur devis' };
    const monthly = plan.priceMonthly;
    const annualMonthly = Math.round(monthly * 0.8);
    const annual = annualMonthly * 12;
    return {
      monthly: formatXOF(monthly),
      annual: formatXOF(annual),
      annualMonthly: formatXOF(annualMonthly),
    };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Étape 6 sur 6</p>
        <h1 className="text-2xl font-bold tracking-tight">Activez votre accès</h1>
        <p className="text-muted-foreground text-sm mt-1">
          14 jours d'essai gratuit · Aucun prélèvement avant la fin de la période d'essai
        </p>
      </div>

      {/* Trial badge */}
      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
        <CalendarCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Essai gratuit de 14 jours</p>
          <p className="text-xs text-emerald-700">Votre carte est enregistrée mais <strong>aucun débit</strong> n'est effectué aujourd'hui. Résiliez avant la fin de l'essai pour ne pas être facturé.</p>
        </div>
      </div>

      {/* Billing cycle toggle */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Cycle de facturation</p>
        <div className="flex rounded-xl border border-border p-1 gap-1 bg-muted/30">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200',
              billingCycle === 'monthly'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2',
              billingCycle === 'annual'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Annuel
            <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500 hover:bg-emerald-500">-20%</Badge>
          </button>
        </div>
      </div>

      {/* Plans */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(plans ?? []).filter(p => p.priceMonthly !== null && p.priceMonthly !== undefined).map(plan => {
            const isSelected = chosenPlanId === plan.id;
            const prices = getDisplayPrice(plan);
            const isRecommended = plan.name === 'pme';

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setChosenPlanId(plan.id)}
                className={cn(
                  'relative text-left rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/40',
                )}
              >
                {isRecommended && (
                  <Badge className="absolute -top-2.5 left-3 text-[10px] px-2 py-0.5 bg-primary">
                    <Star className="w-2.5 h-2.5 mr-1" />
                    Populaire
                  </Badge>
                )}

                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-sm">{plan.label}</p>
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors',
                    isSelected ? 'border-primary bg-primary' : 'border-border',
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                </div>

                <div>
                  {billingCycle === 'monthly' ? (
                    <p className="text-base font-bold">{prices.monthly}</p>
                  ) : (
                    <>
                      <p className="text-base font-bold">{prices.annualMonthly} <span className="text-xs font-normal text-muted-foreground">/ mois</span></p>
                      <p className="text-[11px] text-muted-foreground">soit {prices.annual} / an</p>
                    </>
                  )}
                </div>

                <ul className="mt-3 space-y-1">
                  <li className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Check className="w-3 h-3 text-primary" />
                    {plan.maxUsers ? `${plan.maxUsers} utilisateurs` : 'Utilisateurs illimités'}
                  </li>
                  <li className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Check className="w-3 h-3 text-primary" />
                    {plan.maxWidgets ? `${plan.maxWidgets} widgets` : 'Widgets illimités'}
                  </li>
                  {plan.hasNlq && (
                    <li className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                      <Sparkles className="w-3 h-3" />
                      Requêtes intelligentes
                    </li>
                  )}
                </ul>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected plan summary */}
      {activePlan && (
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border px-4 py-3 text-sm">
          <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span>
            Plan <strong>{activePlan.label}</strong> ·{' '}
            {billingCycle === 'monthly' ? getDisplayPrice(activePlan).monthly : (
              <>{getDisplayPrice(activePlan).annual} / an ({getDisplayPrice(activePlan).annualMonthly} / mois)</>
            )}
          </span>
        </div>
      )}

      {/* CTA */}
      <Button
        size="lg"
        onClick={handlePay}
        disabled={!chosenPlanId || checkoutMutation.isPending}
        className="w-full text-base font-semibold"
      >
        {checkoutMutation.isPending ? (
          'Redirection vers le paiement…'
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Démarrer mon essai gratuit
          </>
        )}
      </Button>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          Paiement sécurisé
        </span>
        <span>·</span>
        <span>Powered by Flutterwave</span>
        <span>·</span>
        <span>PCI DSS</span>
      </div>

      {/* Back */}
      <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(5)} className="text-muted-foreground">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Retour aux invitations
      </Button>
    </div>
  );
}
