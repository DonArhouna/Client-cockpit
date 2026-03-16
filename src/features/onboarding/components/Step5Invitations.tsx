import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { onboardingApi } from '@/api';
import { useOnboarding } from '../OnboardingContext';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ChevronRight, ChevronLeft, Plus, Trash2, Mail, Clock, Check,
} from 'lucide-react';
import type { InvitationEntry } from '../OnboardingContext';

// ─── Role options ─────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'daf', label: 'DAF / CFO' },
  { value: 'controller', label: 'Contrôleur' },
  { value: 'analyst', label: 'Analyste' },
  { value: 'manager', label: 'Manager' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Step5Invitations() {
  const { goToStep, invitations, setInvitations, setOnboardingStatus } = useOnboarding();
  const { refetchOnboarding } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('controller');
  const [emailError, setEmailError] = useState('');

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleAdd = () => {
    if (!email) return;
    if (!isValidEmail(email)) {
      setEmailError('Email invalide');
      return;
    }
    if (invitations.some(inv => inv.email === email)) {
      setEmailError('Email déjà ajouté');
      return;
    }
    setEmailError('');
    setInvitations([...invitations, { email, role }]);
    setEmail('');
  };

  const handleRemove = (idx: number) => {
    setInvitations(invitations.filter((_, i) => i !== idx));
  };

  const mutation = useMutation({
    mutationFn: (data: { invitations?: InvitationEntry[]; inviteLater?: boolean }) =>
      onboardingApi.step5(data),
    onSuccess: async (res) => {
      setOnboardingStatus(res.data.status);
      await refetchOnboarding();
      goToStep(6);
    },
    onError: (err: any) => {
      toast({
        title: 'Erreur',
        description: err.response?.data?.message ?? 'Une erreur est survenue.',
        variant: 'destructive',
      });
    },
  });

  const handleSendInvitations = () => {
    if (invitations.length === 0) return;
    mutation.mutate({ invitations });
  };

  const handleSkip = () => {
    mutation.mutate({ inviteLater: true });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Étape 5 sur 6</p>
        <h1 className="text-2xl font-bold tracking-tight">Invitez votre équipe</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ajoutez vos collaborateurs pour qu'ils accèdent à Cockpit dès le lancement.
        </p>
      </div>

      {/* Add invitation form */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <Label className="text-sm font-medium">Ajouter un membre</Label>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="email@entreprise.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                className="pl-9 text-sm"
              />
            </div>
            {emailError && <p className="text-destructive text-xs">{emailError}</p>}
          </div>

          {/* Role selector */}
          <div className="flex gap-1 flex-shrink-0">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={cn(
                  'text-[10px] px-2 py-1 rounded-md border font-medium transition-colors whitespace-nowrap',
                  role === r.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Button type="button" size="icon" onClick={handleAdd} disabled={!email} className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Invitation list */}
      {invitations.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {invitations.length} invitation{invitations.length > 1 ? 's' : ''} à envoyer
          </p>
          <div className="flex flex-col gap-2">
            {invitations.map((inv, i) => {
              const roleLabel = ROLES.find(r => r.value === inv.role)?.label ?? inv.role;
              const initials = inv.email.slice(0, 2).toUpperCase();
              const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
              const color = colors[inv.email.charCodeAt(0) % colors.length];

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 animate-in slide-in-from-left-2 duration-200"
                >
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0', color)}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{inv.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] flex-shrink-0">{roleLabel}</Badge>
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center border border-dashed border-border rounded-xl">
          <Mail className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucun membre ajouté pour l'instant</p>
          <p className="text-xs text-muted-foreground/70">Vous pourrez inviter votre équipe plus tard depuis les paramètres</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => goToStep(4)} className="flex-shrink-0">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>

        {invitations.length > 0 ? (
          <Button
            type="button"
            onClick={handleSendInvitations}
            disabled={mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? 'Envoi en cours…' : (
              <><Check className="w-4 h-4 mr-1.5" />Envoyer les invitations</>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={mutation.isPending}
            className="flex-1 text-muted-foreground"
          >
            {mutation.isPending ? 'En cours…' : (
              <><Clock className="w-4 h-4 mr-1.5" />Inviter plus tard <ChevronRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
