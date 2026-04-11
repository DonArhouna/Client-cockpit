import { useQuery, useMutation } from '@tanstack/react-query';
import { onboardingApi } from '@/api';
import { useOnboarding } from '../OnboardingContext';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { AgentSetupPanel } from './AgentSetupPanel';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChevronLeft, Download, Monitor, Terminal, Laptop, Loader2 } from 'lucide-react';

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  windows: Monitor,
  linux: Terminal,
  macos: Laptop,
};

const PLATFORM_COLORS: Record<string, string> = {
  windows: 'text-blue-500',
  linux: 'text-orange-500',
  macos: 'text-slate-500',
};

const PLATFORM_LABELS: Record<string, string> = {
  windows: 'Windows',
  linux: 'Linux',
  macos: 'macOS',
};

export function Step3SageConfig() {
  const { goToStep, setOnboardingStatus } = useOnboarding();
  const { refetchOnboarding } = useAuth();
  const { toast } = useToast();

  const { data: releasesData, isLoading: releasesLoading } = useQuery({
    queryKey: ['onboarding-agent-releases'],
    queryFn: () => onboardingApi.getAgentReleases().then(r => r.data),
    select: (data) => (Array.isArray(data) ? data : (data as any)?.releases ?? []),
  });

  const skipMutation = useMutation({
    mutationFn: () => onboardingApi.skipAgentConfig(),
    onSuccess: async (res) => {
      setOnboardingStatus((res.data as any).status);
      await refetchOnboarding();
      goToStep(4);
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

  const releases = releasesData ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Étape 3 sur 6</p>
        <h1 className="text-2xl font-bold tracking-tight">Installer l'agent</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Téléchargez et installez l'agent Cockpit sur votre serveur Sage. Il se connectera automatiquement.
        </p>
      </div>

      {/* Download section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Télécharger l'agent</p>
        </div>

        {releasesLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des releases…
          </div>
        ) : releases.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Aucune release disponible pour le moment. Contactez votre administrateur.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {releases.map((r) => (
              <a
                key={`${r.platform}-${r.arch}`}
                href={r.fileUrl}
                download={r.fileName}
                className={cn(
                  'flex items-center gap-3 rounded-xl border-2 border-border p-3',
                  'hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 group',
                )}
              >
                {(() => { const Icon = PLATFORM_ICONS[r.platform]; return Icon ? <Icon className={`w-5 h-5 flex-shrink-0 ${PLATFORM_COLORS[r.platform]}`} /> : <Download className="w-5 h-5 flex-shrink-0 text-muted-foreground" />; })()}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {PLATFORM_LABELS[r.platform] ?? r.platform}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">{r.arch}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">v{r.version} · {r.fileName}</p>
                </div>
                <Download className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Comment installer l'agent</p>
        </div>
        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>Téléchargez l'exécutable ci-dessus sur votre serveur Sage</li>
          <li>Lancez l'installeur et suivez les étapes (connexion SQL Server incluse)</li>
          <li>L'agent se connecte automatiquement — la configuration Sage est poussée vers Cockpit</li>
          <li>Revenez ici, générez un token et liez l'agent à votre compte</li>
        </ol>
      </div>

      {/* Agent setup panel */}
      <AgentSetupPanel onAgentLinked={handleAgentLinked} />

      {/* Skip */}
      <div className="flex flex-col items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => skipMutation.mutate()}
          disabled={skipMutation.isPending}
          className="text-muted-foreground text-xs"
        >
          {skipMutation.isPending ? (
            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />En cours…</>
          ) : (
            'Configurer l\'agent plus tard →'
          )}
        </Button>
      </div>

      {/* Back */}
      <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(2)} className="text-muted-foreground">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Retour à l'organisation
      </Button>
    </div>
  );
}
