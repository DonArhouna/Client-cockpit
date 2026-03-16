import { useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Country list (ISO) ───────────────────────────────────────────────────────

const COUNTRIES = [
  'Bénin', 'Burkina Faso', "Côte d'Ivoire", 'Cameroun', 'Congo', 'Gabon',
  'Ghana', 'Guinée', 'Mali', 'Maroc', 'Mauritanie', 'Niger', 'Nigeria',
  'RDC', 'Sénégal', 'Togo', 'Tunisie', 'Algérie', 'France', 'Belgique',
  'Suisse', 'Canada', 'Autre',
];

const SECTORS = [
  'Industrie manufacturière', 'Commerce & Distribution', 'BTP & Immobilier',
  'Services financiers & Assurances', 'Technologies & Numérique',
  'Santé & Pharmaceutique', 'Agriculture & Agroalimentaire',
  'Énergie & Mines', 'Transport & Logistique', 'Hôtellerie & Restauration',
  'Éducation & Formation', 'Services aux entreprises', 'Autre',
];

const SIZES = [
  { value: 'startup', label: 'Startup (1–10 employés)' },
  { value: 'pme', label: 'PME (11–250 employés)' },
  { value: 'business', label: 'Grande entreprise (251–1000)' },
  { value: 'enterprise', label: 'Groupe (1000+)' },
];

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(255),
  sector: z.string().min(1, 'Sélectionnez un secteur'),
  size: z.string().min(1, 'Sélectionnez une taille'),
  country: z.string().min(1, 'Sélectionnez un pays'),
});

type FormValues = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

export function Step2OrgProfile() {
  const { goToStep, organization, setLiveOrgName, setLiveCountry, setOrganization, setOnboardingStatus } = useOnboarding();
  const { refetchOnboarding } = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: organization?.name ?? '',
      sector: organization?.sector ?? '',
      size: organization?.size ?? '',
      country: organization?.country ?? '',
    },
  });

  // Live updates to BiPreviewPanel
  const watchedName = watch('name');
  const watchedCountry = watch('country');

  useEffect(() => { setLiveOrgName(watchedName); }, [watchedName, setLiveOrgName]);
  useEffect(() => { setLiveCountry(watchedCountry); }, [watchedCountry, setLiveCountry]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => onboardingApi.step2(data),
    onSuccess: async (res) => {
      setOrganization(res.data.organization);
      setOnboardingStatus(res.data.status);
      await refetchOnboarding();
      goToStep(3);
    },
    onError: (err: any) => {
      toast({
        title: 'Erreur',
        description: err.response?.data?.message ?? 'Une erreur est survenue.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormValues) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Étape 2 sur 6</p>
        <h1 className="text-2xl font-bold tracking-tight">Votre organisation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ces informations personnalisent votre tableau de bord.
        </p>
      </div>

      {/* Organization name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom de l'organisation <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="name"
            placeholder="ACME Corp"
            className="pl-9"
            {...register('name')}
          />
        </div>
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      {/* Sector */}
      <div className="space-y-1.5">
        <Label>Secteur d'activité <span className="text-destructive">*</span></Label>
        <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
          {SECTORS.map(sector => {
            const isSelected = watch('sector') === sector;
            return (
              <button
                key={sector}
                type="button"
                onClick={() => setValue('sector', sector, { shouldValidate: true })}
                className={cn(
                  'text-left text-xs rounded-lg border px-3 py-2 transition-all duration-150',
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground',
                )}
              >
                {sector}
              </button>
            );
          })}
        </div>
        {errors.sector && <p className="text-destructive text-xs">{errors.sector.message}</p>}
      </div>

      {/* Size & Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Size */}
        <div className="space-y-1.5">
          <Label>Taille <span className="text-destructive">*</span></Label>
          <div className="flex flex-col gap-1.5">
            {SIZES.map(s => {
              const isSelected = watch('size') === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setValue('size', s.value, { shouldValidate: true })}
                  className={cn(
                    'text-left text-xs rounded-lg border px-3 py-2 transition-all duration-150',
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/40 text-muted-foreground',
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          {errors.size && <p className="text-destructive text-xs">{errors.size.message}</p>}
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <Label>Pays <span className="text-destructive">*</span></Label>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {COUNTRIES.map(country => {
              const isSelected = watch('country') === country;
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => setValue('country', country, { shouldValidate: true })}
                  className={cn(
                    'text-left text-xs rounded-lg border px-3 py-2 transition-all duration-150',
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/40 text-muted-foreground',
                  )}
                >
                  {country}
                </button>
              );
            })}
          </div>
          {errors.country && <p className="text-destructive text-xs">{errors.country.message}</p>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => goToStep(1)} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>
        <Button type="submit" disabled={mutation.isPending} className="flex-1">
          {mutation.isPending ? 'Enregistrement…' : (
            <>Continuer <ChevronRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
    </form>
  );
}
