import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../OnboardingContext';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Check, BarChart3, Users, Zap, Shield, CalendarCheck,
  ChevronRight, Sparkles,
} from 'lucide-react';

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="tabular-nums">
      {new Intl.NumberFormat('fr-FR').format(value)}{suffix}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StepSuccess() {
  const { selectedPlan, liveOrgName, selectedProfiles, invitations } = useOnboarding();
  const { refetchOnboarding } = useAuth();
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Short delay for dramatic effect
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleEnterApp = async () => {
    await refetchOnboarding();
    navigate('/dashboard', { replace: true });
  };

  const recapItems = [
    {
      icon: Shield,
      label: 'Plan activé',
      value: selectedPlan?.label ?? 'Plan sélectionné',
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      icon: BarChart3,
      label: 'Organisation configurée',
      value: liveOrgName || 'Votre organisation',
      color: 'text-violet-600',
      bg: 'bg-violet-50 border-violet-200',
    },
    {
      icon: Zap,
      label: 'Agent Sage',
      value: 'Connecté et opérationnel',
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      icon: Users,
      label: 'Profils métiers',
      value: selectedProfiles.length > 0
        ? `${selectedProfiles.length} profil${selectedProfiles.length > 1 ? 's' : ''} activé${selectedProfiles.length > 1 ? 's' : ''}`
        : 'Configurés',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      icon: CalendarCheck,
      label: "Période d'essai",
      value: "14 jours · Aucun débit aujourd'hui",
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-200',
    },
  ];

  if (invitations.length > 0) {
    recapItems.push({
      icon: Users,
      label: 'Invitations envoyées',
      value: `${invitations.length} membre${invitations.length > 1 ? 's' : ''} invité${invitations.length > 1 ? 's' : ''}`,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-200',
    });
  }

  return (
    <div className={cn(
      'flex flex-col gap-6 transition-all duration-700',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
    )}>
      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-4 py-4">
        {/* Animated check circle */}
        <div className="relative">
          <div className={cn(
            'w-20 h-20 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center transition-all duration-1000',
            visible ? 'scale-100' : 'scale-0',
          )}>
            <Check className="w-10 h-10 text-primary stroke-[2.5]" />
          </div>
          {/* Sparkle decorations */}
          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-pulse" />
          <Sparkles className="absolute -bottom-1 -left-2 w-4 h-4 text-primary/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {liveOrgName ? `${liveOrgName} est prêt !` : 'Votre Cockpit est prêt !'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configuration terminée · Période d'essai démarrée
          </p>
        </div>

        {/* KPI teaser counters */}
        <div className="grid grid-cols-3 gap-3 w-full mt-2">
          {[
            { label: 'KPIs disponibles', value: 24, suffix: '+' },
            { label: 'Dashboards', value: selectedProfiles.length || 3, suffix: '' },
            { label: "Jours d'essai", value: 14, suffix: '' },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <p className="text-xl font-bold text-primary">
                {visible && <AnimatedCounter target={item.value} suffix={item.suffix} />}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recap cards */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Récapitulatif</p>
        <div className="flex flex-col gap-2">
          {recapItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-300',
                  item.bg,
                  visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2',
                )}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', item.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
                <Check className={cn('w-4 h-4 flex-shrink-0', item.color)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        onClick={handleEnterApp}
        className="w-full text-base font-semibold"
      >
        Accéder à mon Cockpit
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Votre essai se termine dans <strong>14 jours</strong>.
        Aucun débit n'aura lieu avant cette date.
      </p>
    </div>
  );
}
