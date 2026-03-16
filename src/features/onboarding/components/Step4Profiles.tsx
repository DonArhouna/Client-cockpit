import { useQuery, useMutation } from '@tanstack/react-query';
import { onboardingApi } from '@/api';
import { useOnboarding } from '../OnboardingContext';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Check, Shield, Zap, BarChart2, Users, LineChart } from 'lucide-react';
import type { OnboardingProfile } from '@/types';

// ─── Profile visual config ────────────────────────────────────────────────────

const PROFILE_VISUAL: Record<string, {
  icon: React.ElementType;
  color: string;
  borderActive: string;
  bgActive: string;
  description2: string;
}> = {
  daf: {
    icon: Shield,
    color: 'text-blue-600',
    borderActive: 'border-blue-500',
    bgActive: 'bg-blue-50',
    description2: 'Vue 360° · Trésorerie · Marges · Risques',
  },
  dg: {
    icon: Zap,
    color: 'text-violet-600',
    borderActive: 'border-violet-500',
    bgActive: 'bg-violet-50',
    description2: 'Performance globale · KPIs stratégiques',
  },
  controller: {
    icon: BarChart2,
    color: 'text-amber-600',
    borderActive: 'border-amber-500',
    bgActive: 'bg-amber-50',
    description2: 'Budgets · Écarts · Reporting analytique',
  },
  manager: {
    icon: Users,
    color: 'text-emerald-600',
    borderActive: 'border-emerald-500',
    bgActive: 'bg-emerald-50',
    description2: 'Suivi opérationnel · Objectifs équipe',
  },
  analyst: {
    icon: LineChart,
    color: 'text-cyan-600',
    borderActive: 'border-cyan-500',
    bgActive: 'bg-cyan-50',
    description2: 'Exploration données · Requêtes intelligentes',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Step4Profiles() {
  const { goToStep, selectedProfiles, setSelectedProfiles, setOnboardingStatus } = useOnboarding();
  const { refetchOnboarding } = useAuth();
  const { toast } = useToast();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['onboarding-profiles'],
    queryFn: () => onboardingApi.getProfiles().then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data: { profiles: string[] }) => onboardingApi.step4(data),
    onSuccess: async (res) => {
      setOnboardingStatus(res.data.status);
      await refetchOnboarding();
      goToStep(5);
    },
    onError: (err: any) => {
      toast({
        title: 'Erreur',
        description: err.response?.data?.message ?? 'Une erreur est survenue.',
        variant: 'destructive',
      });
    },
  });

  const toggleProfile = (name: string) => {
    setSelectedProfiles(
      selectedProfiles.includes(name)
        ? selectedProfiles.filter(p => p !== name)
        : [...selectedProfiles, name],
    );
  };

  const handleContinue = () => {
    if (selectedProfiles.length === 0) {
      toast({ title: 'Sélectionnez au moins un profil', variant: 'destructive' });
      return;
    }
    mutation.mutate({ profiles: selectedProfiles });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Étape 4 sur 6</p>
        <h1 className="text-2xl font-bold tracking-tight">Profils métiers</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sélectionnez les rôles présents dans votre organisation. Chaque profil débloque des dashboards adaptés.
        </p>
      </div>

      {/* Profiles grid */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(profiles ?? []).map((profile: OnboardingProfile) => {
            const visual = PROFILE_VISUAL[profile.name] ?? {
              icon: BarChart2,
              color: 'text-slate-600',
              borderActive: 'border-slate-500',
              bgActive: 'bg-slate-50',
              description2: '',
            };
            const Icon = visual.icon;
            const isSelected = selectedProfiles.includes(profile.name);

            return (
              <button
                key={profile.name}
                type="button"
                onClick={() => toggleProfile(profile.name)}
                className={cn(
                  'flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 w-full',
                  isSelected
                    ? cn('shadow-sm', visual.borderActive, visual.bgActive)
                    : 'border-border hover:border-primary/30 bg-background',
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected ? cn(visual.bgActive, 'border border-current/20') : 'bg-muted',
                )}>
                  <Icon className={cn('w-5 h-5', isSelected ? visual.color : 'text-muted-foreground')} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={cn('font-semibold text-sm', isSelected && visual.color)}>
                    {profile.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{profile.description}</p>
                  {isSelected && visual.description2 && (
                    <p className={cn('text-[11px] mt-1 font-medium', visual.color)}>
                      → {visual.description2}
                    </p>
                  )}
                </div>

                {/* Checkbox */}
                <div className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isSelected ? cn(visual.borderActive, visual.bgActive) : 'border-border',
                )}>
                  {isSelected && <Check className={cn('w-3 h-3', visual.color)} />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selection summary */}
      {selectedProfiles.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Check className="w-3.5 h-3.5 text-primary" />
          <span>
            <strong>{selectedProfiles.length}</strong> profil{selectedProfiles.length > 1 ? 's' : ''} sélectionné{selectedProfiles.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => goToStep(3)} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={selectedProfiles.length === 0 || mutation.isPending}
          className="flex-1"
        >
          {mutation.isPending ? 'Enregistrement…' : (
            <>Continuer <ChevronRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
