import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  AlertCircle, Loader2, BarChart3, User, Mail, Lock, Eye, EyeOff,
  CheckCircle2, TrendingUp, Activity, DollarSign, Building2,
} from 'lucide-react';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(1, 'Requis').max(100),
  lastName: z.string().min(1, 'Requis').max(100),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

// ─── Password strength ────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8 caractères min.', ok: password.length >= 8 },
    { label: 'Une majuscule', ok: /[A-Z]/.test(password) },
    { label: 'Un chiffre', ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const barColor = ['bg-destructive', 'bg-amber-400', 'bg-amber-400', 'bg-emerald-500'][score];
  const label = ['', 'Faible', 'Moyen', 'Fort'][score];

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-300', i < score ? barColor : 'bg-border')} />
        ))}
        <span className={cn('text-[10px] font-medium ml-1 w-10', score === 3 ? 'text-emerald-600' : 'text-muted-foreground')}>
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3">
        {checks.map(c => (
          <span key={c.label} className={cn('text-[10px] flex items-center gap-1', c.ok ? 'text-emerald-600' : 'text-muted-foreground')}>
            <CheckCircle2 className={cn('w-3 h-3', c.ok ? 'text-emerald-500' : 'text-border')} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Invalid token screen ─────────────────────────────────────────────────────

function InvalidToken({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Invitation invalide</h1>
        <p className="text-muted-foreground text-sm">{message}</p>
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">Retour à la connexion</Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();

  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');

  // Fetch invitation info → email + org name + role
  const { data: inviteInfo, isLoading: inviteLoading, error: inviteError } = useQuery({
    queryKey: ['invitation-info', token],
    queryFn: () => authApi.getInvitationInfo(token!).then(r => r.data),
    enabled: !!token,
    retry: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const password = watch('password', '');

  useEffect(() => {
    if ((inviteInfo as any)?.firstName) setValue('firstName', (inviteInfo as any).firstName);
    if ((inviteInfo as any)?.lastName) setValue('lastName', (inviteInfo as any).lastName);
  }, [inviteInfo, setValue]);

  if (!token) {
    return <InvalidToken message="Le lien d'invitation est incomplet. Vérifiez l'email reçu ou contactez votre administrateur." />;
  }

  if (!inviteLoading && inviteError) {
    const msg = (inviteError as any)?.response?.data?.message ?? "Ce lien d'invitation est invalide ou a expiré.";
    return <InvalidToken message={msg} />;
  }

  const onSubmit = async (data: FormValues) => {
    setServerError('');
    try {
      const res = await authApi.register({
        email: inviteInfo!.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        invitationToken: token,
      });

      const { accessToken, refreshToken, user } = res.data;
      await loginWithTokens(accessToken, refreshToken, user);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">

      {/* ── Left: BI atmosphere ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-950 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent z-10" />

        <div className="relative z-20 flex flex-col h-full p-12 justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Cockpit</span>
          </div>

          {/* Hero */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Invitation reçue</p>
              <h1 className="text-4xl font-extrabold text-white leading-tight">
                Bienvenue dans<br />
                votre <span className="text-primary italic">cockpit</span><br />
                financier.
              </h1>

              {/* Invitation context */}
              {inviteInfo && (
                <div className="mt-5 space-y-2 p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span><span className="text-slate-500">Organisation :</span> <strong>{inviteInfo.organizationName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                    <span><span className="text-slate-500">Email :</span> <strong>{inviteInfo.email}</strong></span>
                  </div>
                  {inviteInfo.role && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <User className="w-4 h-4 text-primary flex-shrink-0" />
                      <span><span className="text-slate-500">Rôle :</span> <strong className="capitalize">{inviteInfo.role}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mini KPI preview */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Chiffre d'affaires", value: '2 847 K XOF', icon: DollarSign, color: 'text-blue-400' },
                { label: 'Trésorerie', value: '643 K XOF', icon: Activity, color: 'text-emerald-400' },
                { label: 'Marge brute', value: '38.2%', icon: TrendingUp, color: 'text-violet-400' },
                { label: 'DSO', value: '47 jours', icon: BarChart3, color: 'text-amber-400' },
              ].map(kpi => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="rounded-xl border border-white/8 bg-white/5 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-400">{kpi.label}</span>
                      <Icon className={cn('w-3.5 h-3.5', kpi.color)} />
                    </div>
                    <p className="text-sm font-bold text-white">{kpi.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Nafaka Tech · Cockpit</p>
        </div>
      </div>

      {/* ── Right: Form ──────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[420px] space-y-6">

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Créer votre compte</h2>
            <p className="text-muted-foreground text-sm">Dernière étape avant d'accéder à votre tableau de bord.</p>
          </div>

          {/* Email pré-rempli en lecture seule */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            {inviteLoading ? (
              <Skeleton className="h-5 w-48" />
            ) : (
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Adresse email de l'invitation</p>
                  <p className="text-sm font-semibold">{inviteInfo?.email}</p>
                </div>
              </div>
            )}
          </div>

          {serverError && (
            <div className="flex items-start gap-3 p-3.5 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/10">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Prénom <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="firstName" placeholder="Jean" className="pl-9" {...register('firstName')} />
                </div>
                {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Nom <span className="text-destructive">*</span></Label>
                <Input id="lastName" placeholder="Dupont" {...register('lastName')} />
                {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-9 pr-9" {...register('password')} />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
              <PasswordStrength password={password} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" className="pl-9 pr-9" {...register('confirmPassword')} />
                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting || inviteLoading || !inviteInfo} className="w-full font-semibold">
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création du compte…</>
                : 'Créer mon compte et continuer →'
              }
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
