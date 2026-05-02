import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgents, useAgentLogs } from '@/hooks/use-api';
import { useSocket } from '@/hooks/use-socket';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RegenerateTokenModal } from '../agents/RegenerateTokenModal';
import { format } from 'date-fns';
import {
  Server,
  Clock,
  AlertCircle,
  CheckCircle2,
  Key,
  Zap,
  Loader2,
  FileText,
  Activity,
  WifiOff,
  Settings2,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    online: { label: 'En ligne', className: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
    offline: { label: 'Hors ligne', className: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400' },
    error: { label: 'Erreur', className: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
  };
  const cfg = map[status] ?? { label: 'Inconnu', className: 'text-yellow-600 bg-yellow-100' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function TokenBadge({ isRevoked }: { isRevoked: boolean }) {
  if (isRevoked) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive text-destructive-foreground">
        Révoqué
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      Valide
    </span>
  );
}

export function AgentTab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);

  const { data: agents, isLoading: isAgentsLoading } = useAgents();
  const agent = agents?.[0] ?? null;

  const { data: logData, isLoading: isLogsLoading } = useAgentLogs(agent?.id ?? '', 1, 50);

  const { socket } = useSocket('cockpit');

  useEffect(() => {
    if (!socket || !agent?.id) return;

    const handleNewLog = (newLog: any) => {
      if (newLog.agentId !== agent.id) return;
      queryClient.setQueryData(['agent-logs', agent.id, 1, 50], (old: any) => {
        if (!old) return { logs: [newLog], pagination: { total: 1, pages: 1, page: 1, limit: 50 } };
        return {
          ...old,
          logs: [newLog, ...old.logs].slice(0, 50),
          pagination: { ...old.pagination, total: old.pagination.total + 1 },
        };
      });
    };

    socket.on('agent_log_received', handleNewLog);
    return () => { socket.off('agent_log_received', handleNewLog); };
  }, [socket, agent?.id, queryClient]);

  const testMutation = useMutation({
    mutationFn: () => agentsApi.testConnection(agent!.id),
    onSuccess: () => {
      toast({ title: 'Test réussi', description: "L'agent a répondu en temps réel." });
    },
    onError: (err: any) => {
      toast({
        title: 'Test échoué',
        description: err.response?.data?.message ?? "L'agent n'a pas répondu.",
        variant: 'destructive',
      });
    },
  });

  if (isAgentsLoading) return <LoadingSpinner />;

  if (!agent) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <Server className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-lg">Aucun agent configuré</p>
            <p className="text-sm text-muted-foreground">
              Votre agent Sage n'a pas encore été lié. Configurez-le depuis l'assistant de démarrage.
            </p>
          </div>
          <Button onClick={() => navigate('/onboarding')}>
            <Settings2 className="h-4 w-4 mr-2" />
            Configurer l'agent
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{agent.name}</h2>
          </div>
          <StatusBadge status={agent.status} />
          {agent.isSocketConnected && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-primary bg-primary/10 border border-primary/20 animate-pulse">
              <Zap className="h-3 w-3 fill-current" />
              Temps réel actif
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending || !agent.isSocketConnected}
          >
            {testMutation.isPending
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <Zap className="h-4 w-4 mr-2" />}
            Tester la connexion
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsRegenerateOpen(true)}>
            <Key className="h-4 w-4 mr-2" />
            Renouveler le token
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Connexion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-primary" />
              État de connexion
            </CardTitle>
            <CardDescription>Connectivité et informations système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Version</p>
                <p className="font-medium mt-1">{agent.version ?? 'Non disponible'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dernière activité</p>
                <div className="flex items-center gap-1.5 mt-1 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {agent.lastSeen ? format(new Date(agent.lastSeen), 'dd/MM/yyyy HH:mm:ss') : 'Jamais'}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Erreurs détectées</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {(agent.errorCount ?? 0) > 0
                    ? <AlertCircle className="h-4 w-4 text-destructive" />
                    : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  <span className={`font-semibold ${(agent.errorCount ?? 0) > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                    {(agent.errorCount ?? 0) > 0 ? `${agent.errorCount} erreur(s)` : 'Aucune erreur'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${agent.isSocketConnected ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                  {agent.isSocketConnected
                    ? <Zap className="h-4 w-4 fill-current" />
                    : <WifiOff className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">Tunnel temps réel</p>
                  <p className="text-xs text-muted-foreground">
                    {agent.isSocketConnected
                      ? 'Canal WebSocket actif — requêtes traitées instantanément.'
                      : 'Mode polling 30s — le temps réel est indisponible.'}
                  </p>
                </div>
              </div>
              {agent.isSocketConnected && (
                <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase shrink-0">
                  Optimisé
                </span>
              )}
            </div>

            {agent.status === 'error' && agent.lastError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-destructive">Dernière erreur</p>
                  <p className="text-xs text-destructive/80 mt-0.5">{agent.lastError}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-4 w-4 text-primary" />
              Sécurité du token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expiration</p>
                <p className="font-medium mt-1">
                  {agent.tokenExpiresAt ? format(new Date(agent.tokenExpiresAt), 'dd MMMM yyyy') : 'Permanent'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</p>
                <div className="mt-1">
                  <TokenBadge isRevoked={agent.isRevoked ?? false} />
                </div>
              </div>
              <div className="flex items-center">
                {agent.isExpiringSoon && !agent.isRevoked && (
                  <div className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1.5 rounded-full font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Expire dans {agent.daysUntilExpiry} jour{(agent.daysUntilExpiry ?? 0) > 1 ? 's' : ''} — renouvelez dès que possible
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Journal d'activité
              </CardTitle>
              <CardDescription>Les 50 derniers événements remontés par votre agent</CardDescription>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              <Activity className="h-3 w-3" />
              Temps réel
            </span>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-muted bg-black/5 dark:bg-white/5 overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto font-mono text-xs">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-muted z-10">
                    <tr className="text-left text-muted-foreground border-b border-muted">
                      <th className="p-2 font-bold w-40">Horodatage</th>
                      <th className="p-2 font-bold w-20">Niveau</th>
                      <th className="p-2 font-bold">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLogsLoading ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-muted-foreground italic">
                          Chargement des logs...
                        </td>
                      </tr>
                    ) : !logData?.logs?.length ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-muted-foreground italic">
                          Aucun log disponible pour le moment.
                        </td>
                      </tr>
                    ) : (
                      logData.logs.map((log) => (
                        <tr key={log.id} className="border-b border-muted/50 hover:bg-muted/30 transition-colors">
                          <td className="p-2 text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.timestamp), 'dd/MM HH:mm:ss')}
                          </td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.level === 'error'
                                ? 'bg-red-500/20 text-red-500'
                                : log.level === 'warning'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-green-500/20 text-green-500'
                            }`}>
                              {log.level}
                            </span>
                          </td>
                          <td className="p-2 break-all text-foreground/90 leading-relaxed font-sans">
                            {log.message}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RegenerateTokenModal
        open={isRegenerateOpen}
        onOpenChange={setIsRegenerateOpen}
        agent={agent}
      />
    </div>
  );
}
