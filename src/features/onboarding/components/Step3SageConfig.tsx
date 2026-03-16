import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { onboardingApi } from '@/api';
import { useOnboarding } from '../OnboardingContext';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AgentSetupPanel } from './AgentSetupPanel';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Server, Cloud } from 'lucide-react';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  sageType: z.enum(['X3', '100'], { required_error: 'Sélectionnez un type Sage' }),
  sageMode: z.enum(['local', 'cloud'], { required_error: 'Sélectionnez un mode' }),
  sageHost: z.string().optional(),
  sagePort: z.coerce.number().min(1).max(65535).optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

export function Step3SageConfig() {
  const { goToStep, organization, setOnboardingStatus } = useOnboarding();
  const { refetchOnboarding } = useAuth();
  const { toast } = useToast();

  const [step3Saved, setStep3Saved] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sageType: (organization?.sageType as 'X3' | '100') ?? undefined,
      sageMode: (organization?.sageMode as 'local' | 'cloud') ?? undefined,
      sageHost: organization?.sageHost ?? '',
      sagePort: organization?.sagePort ?? undefined,
    },
  });

  const sageMode = watch('sageMode');
  const sageType = watch('sageType');

  const saveMutation = useMutation({
    mutationFn: (data: FormValues) => onboardingApi.step3(data),
    onSuccess: async (res) => {
      setOnboardingStatus(res.data.status);
      setStep3Saved(true);
    },
    onError: (err: any) => {
      toast({
        title: 'Erreur',
        description: err.response?.data?.message ?? 'Une erreur est survenue.',
        variant: 'destructive',
      });
    },
  });

  const handleAgentLinked = async () => {
    await refetchOnboarding();
    goToStep(4);
  };

  const onSubmit = (data: FormValues) => {
    if (step3Saved) { goToStep(4); return; }
    saveMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Étape 3 sur 6</p>
        <h1 className="text-2xl font-bold tracking-tight">Connexion Sage</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configurez votre ERP Sage et liez votre agent on-premise.
        </p>
      </div>

      {/* Sage Type */}
      <div className="space-y-2">
        <Label>Version Sage <span className="text-destructive">*</span></Label>
        <div className="grid grid-cols-2 gap-3">
          {(['X3', '100'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('sageType', type, { shouldValidate: true })}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all duration-200',
                sageType === type
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40',
              )}
            >
              <p className="font-semibold text-sm">Sage {type}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {type === 'X3' ? 'ERP complet grandes entreprises' : 'Gestion PME'}
              </p>
            </button>
          ))}
        </div>
        {errors.sageType && <p className="text-destructive text-xs">{errors.sageType.message}</p>}
      </div>

      {/* Sage Mode */}
      <div className="space-y-2">
        <Label>Mode d'hébergement <span className="text-destructive">*</span></Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('sageMode', 'local', { shouldValidate: true })}
            className={cn(
              'rounded-xl border-2 p-4 text-left transition-all duration-200 flex items-start gap-3',
              sageMode === 'local'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/40',
            )}
          >
            <Server className={cn('w-5 h-5 mt-0.5 flex-shrink-0', sageMode === 'local' ? 'text-primary' : 'text-muted-foreground')} />
            <div>
              <p className="font-semibold text-sm">Sur site</p>
              <p className="text-[11px] text-muted-foreground">Serveur local / réseau interne</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setValue('sageMode', 'cloud', { shouldValidate: true })}
            className={cn(
              'rounded-xl border-2 p-4 text-left transition-all duration-200 flex items-start gap-3',
              sageMode === 'cloud'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/40',
            )}
          >
            <Cloud className={cn('w-5 h-5 mt-0.5 flex-shrink-0', sageMode === 'cloud' ? 'text-primary' : 'text-muted-foreground')} />
            <div>
              <p className="font-semibold text-sm">Cloud</p>
              <p className="text-[11px] text-muted-foreground">Hébergement SaaS / VPS</p>
            </div>
          </button>
        </div>
        {errors.sageMode && <p className="text-destructive text-xs">{errors.sageMode.message}</p>}
      </div>

      {/* Host & Port (only if local) */}
      {sageMode === 'local' && (
        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <Label htmlFor="sageHost">Adresse IP / Hostname</Label>
            <Input
              id="sageHost"
              placeholder="192.168.1.100"
              className="font-mono text-sm"
              {...register('sageHost')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sagePort">Port</Label>
            <Input
              id="sagePort"
              type="number"
              placeholder="1433"
              className="font-mono text-sm"
              {...register('sagePort')}
            />
            {errors.sagePort && <p className="text-destructive text-xs">{errors.sagePort.message}</p>}
          </div>
        </div>
      )}

      {/* Save step 3 first, then show agent panel */}
      {!step3Saved ? (
        <Button type="submit" disabled={saveMutation.isPending || !sageType || !sageMode} className="w-full">
          {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer et configurer l\'agent →'}
        </Button>
      ) : (
        <AgentSetupPanel onAgentLinked={handleAgentLinked} />
      )}

      {/* Back navigation */}
      <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(2)} className="text-muted-foreground">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Retour à l'organisation
      </Button>
    </form>
  );
}
