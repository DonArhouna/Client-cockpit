import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { agentsApi, onboardingApi } from '@/api';
import { useOnboarding } from '../OnboardingContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Key, Copy, Check, Zap, Loader2, RefreshCw, Wifi, WifiOff, ChevronRight,
} from 'lucide-react';

// ─── Component ────────────────────────────────────────────────────────────────

interface AgentSetupPanelProps {
  onAgentLinked: () => void;
}

export function AgentSetupPanel({ onAgentLinked }: AgentSetupPanelProps) {
  const { agentStatus, setAgentStatus, generatedToken, setGeneratedToken } = useOnboarding();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [mode, setMode] = useState<'generate' | 'manual'>('generate');
  const [testResult, setTestResult] = useState<{ status: string; message: string } | null>(null);
  const [agentLinked, setAgentLinked] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop polling on unmount
  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  // ── Generate token ────────────────────────────────────────────────────────

  const generateMutation = useMutation({
    mutationFn: () => agentsApi.generateToken({ name: 'Agent Sage Principal', force: false }),
    onSuccess: (res) => {
      const token = res.data.token ?? res.data.agent?.token;
      if (token) {
        setGeneratedToken(token);
        setAgentStatus('pending');
        startPolling(token);
      }
    },
    onError: (err: any) => {
      toast({
        title: 'Erreur génération token',
        description: err.response?.data?.message ?? 'Une erreur est survenue.',
        variant: 'destructive',
      });
    },
  });

  // ── Poll agent status ─────────────────────────────────────────────────────

  const startPolling = useCallback((token: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await onboardingApi.testConnection(token);
        const data = res.data as any;
        if (data.agentOnline) {
          setAgentStatus('online');
          clearInterval(pollingRef.current!);
        } else {
          setAgentStatus('pending');
        }
      } catch {
        // keep polling
      }
    }, 5000);
  }, [setAgentStatus]);

  // ── Link agent ────────────────────────────────────────────────────────────

  const linkMutation = useMutation({
    mutationFn: (token: string) => onboardingApi.linkAgent(token),
    onSuccess: () => {
      setAgentLinked(true);
      onAgentLinked();
    },
    onError: (err: any) => {
      toast({
        title: 'Liaison impossible',
        description: err.response?.data?.message ?? 'Token invalide ou expiré.',
        variant: 'destructive',
      });
    },
  });

  // ── Test connection ───────────────────────────────────────────────────────

  const testMutation = useMutation({
    mutationFn: () => onboardingApi.testConnection(generatedToken ?? manualToken),
    onSuccess: (res) => {
      const data = res.data as any;
      setTestResult({ status: data.status, message: data.message });
      if (data.agentOnline) setAgentStatus('online');
    },
    onError: () => {
      setTestResult({ status: 'ERROR', message: 'Impossible de joindre l\'agent.' });
    },
  });

  // ── Copy token ────────────────────────────────────────────────────────────

  const handleCopy = () => {
    const token = generatedToken ?? manualToken;
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeToken = generatedToken ?? manualToken;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Liaison Agent On-Premise</h3>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setMode('generate')}
          className={cn(
            'flex-1 py-1.5 font-medium transition-colors',
            mode === 'generate' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground',
          )}
        >
          Générer un token
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={cn(
            'flex-1 py-1.5 font-medium transition-colors',
            mode === 'manual' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground',
          )}
        >
          J'ai déjà un token
        </button>
      </div>

      {/* Generate mode */}
      {mode === 'generate' && (
        <div className="space-y-3">
          {!generatedToken ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full"
            >
              {generateMutation.isPending ? (
                <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Génération…</>
              ) : (
                <><Key className="w-3.5 h-3.5 mr-2" />Générer le token agent</>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              {/* Token display */}
              <Label className="text-xs">Votre token agent</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-[11px] bg-background border border-border rounded-lg px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">
                  {generatedToken}
                </code>
                <Button type="button" variant="outline" size="icon" onClick={handleCopy} className="flex-shrink-0 w-8 h-8">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>

              {/* Instructions */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-2">
                <p className="text-[11px] font-semibold text-blue-800">Instructions d'installation</p>
                <ol className="text-[11px] text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Téléchargez l'agent Cockpit sur votre serveur Sage</li>
                  <li>Copiez le token ci-dessus dans le fichier <code className="bg-blue-100 px-1 rounded">.env</code> de l'agent</li>
                  <li>Démarrez l'agent — il se connecte automatiquement</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual mode */}
      {mode === 'manual' && (
        <div className="space-y-2">
          <Label htmlFor="manualToken" className="text-xs">Token agent (format: isag_…)</Label>
          <Input
            id="manualToken"
            placeholder="isag_a1b2c3d4…"
            value={manualToken}
            onChange={e => setManualToken(e.target.value)}
            className="font-mono text-xs"
          />
        </div>
      )}

      {/* Status indicator */}
      {activeToken && (
        <div className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border transition-all duration-500',
          agentStatus === 'online' && 'bg-emerald-50 border-emerald-200 text-emerald-700',
          agentStatus === 'pending' && 'bg-amber-50 border-amber-200 text-amber-700',
          agentStatus === 'error' || agentStatus === 'offline' ? 'bg-red-50 border-red-200 text-red-700' : '',
          agentStatus === 'idle' && 'bg-muted border-border text-muted-foreground',
        )}>
          {agentStatus === 'online' && <><Wifi className="w-3.5 h-3.5" /> Agent en ligne</>}
          {agentStatus === 'pending' && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> En attente de l'agent… (vérification toutes les 5s)</>}
          {(agentStatus === 'offline' || agentStatus === 'error') && <><WifiOff className="w-3.5 h-3.5" /> Agent non détecté</>}
          {agentStatus === 'idle' && <><RefreshCw className="w-3.5 h-3.5" /> En attente</>}
        </div>
      )}

      {/* Test result */}
      {testResult && (
        <div className={cn(
          'rounded-lg px-3 py-2 text-[11px] border',
          testResult.status === 'OK' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
          testResult.status === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-700' :
          'bg-red-50 border-red-200 text-red-700',
        )}>
          {testResult.message}
        </div>
      )}

      {/* Action buttons */}
      {activeToken && (
        <div className="flex gap-2">
          {agentStatus !== 'online' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
              className="flex-1 text-xs"
            >
              {testMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Tester la connexion'}
            </Button>
          )}
          {agentStatus === 'online' && !agentLinked && (
            <Button
              type="button"
              size="sm"
              onClick={() => linkMutation.mutate(activeToken)}
              disabled={linkMutation.isPending}
              className="flex-1 text-xs"
            >
              {linkMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <><Check className="w-3.5 h-3.5 mr-1.5" />Lier cet agent</>
              )}
            </Button>
          )}
          {agentLinked && (
            <div className="flex-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <Check className="w-3.5 h-3.5" />
              Agent lié avec succès
            </div>
          )}
        </div>
      )}

      {/* Skip link */}
      <button
        type="button"
        onClick={onAgentLinked}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center underline-offset-2 hover:underline"
      >
        Configurer l'agent plus tard <ChevronRight className="w-3 h-3 inline" />
      </button>
    </div>
  );
}
