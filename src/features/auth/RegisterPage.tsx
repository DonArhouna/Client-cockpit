import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  AlertCircle, Loader2, BarChart3, User, Mail, Lock, Eye, EyeOff,
  CheckCircle2, TrendingUp, Activity, DollarSign, Building2,
} from 'lucide-react';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(1, 'Requis').max(100),
  lastName: z.string().min(1, 'Requis').max(100),
  email: z.string().min(1, 'Requis').email('Email invalide'),
  organizationName: z.string().min(1, 'Requis').max(150),
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RegisterPage() {
  const navigate = useNavigate();
  const { loginWithTokens, isAuthenticated, isLoading: authLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const password = watch('password', '');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data: FormValues) => {
    setServerError('');
    try {
      const res = await authApi.signup({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationName: data.organizationName,
      });

      const { accessToken, refreshToken, user } = res.data;
      await loginWithTokens(accessToken, refreshToken, user);
      navigate('/onboarding', { replace: true });
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
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Nouveau compte</p>
              <h1 className="text-4xl font-extrabold text-white leading-tight">
                Pilotez votre<br />
                <span className="text-primary italic">donnée financière</span><br />
                en toute clarté.
              </h1>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-sm">
                Créez votre organisation et accédez à un tableau de bord CFO complet,
                connecté à votre Sage en temps réel.
              </p>
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

            {/* Steps preview */}
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Après inscription</p>
              <div className="flex items-center gap-2">
                {['Plan', 'Organisation', 'Sage', 'Profils', 'Équipe'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                        <span className="text-[9px] text-primary font-bold">{i + 1}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{s}</span>
                    </div>
                    {i < 4 && <div className="w-4 h-px bg-white/10" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Nafaka Tech · Cockpit</p>
        </div>
      </div>

      {/* ── Right: Form ──────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-6 py-8">

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Créer votre compte</h2>
            <p className="text-muted-foreground text-sm">Commencez gratuitement, sans carte bancaire.</p>
          </div>

          {serverError && (
            <div className="flex items-start gap-3 p-3.5 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/10">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Prénom / Nom */}
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

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email professionnel <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="jean@entreprise.com" className="pl-9" {...register('email')} />
              </div>
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>

            {/* Organisation */}
            <div className="space-y-1.5">
              <Label htmlFor="organizationName">Nom de l'organisation <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="organizationName" placeholder="Mon Entreprise SAS" className="pl-9" {...register('organizationName')} />
              </div>
              {errors.organizationName && <p className="text-destructive text-xs">{errors.organizationName.message}</p>}
            </div>

            {/* Mot de passe */}
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

            {/* Confirmer mot de passe */}
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

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full font-semibold">
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création du compte…</>
                : 'Créer mon compte →'
              }
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Se connecter</Link>
          </p>

          <p className="text-center text-[10px] text-muted-foreground/60 leading-relaxed">
            En créant un compte, vous acceptez nos{' '}
            <span className="underline cursor-pointer">Conditions d'utilisation</span> et notre{' '}
            <span className="underline cursor-pointer">Politique de confidentialité</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
