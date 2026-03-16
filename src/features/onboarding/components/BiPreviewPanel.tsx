import { useOnboarding } from '../OnboardingContext';
import { cn } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, BarChart3, DollarSign,
  ShoppingCart, Activity, Users, Layers, Zap, Shield,
  BarChart2, LineChart, PieChart,
} from 'lucide-react';

// ─── Fake KPI data ────────────────────────────────────────────────────────────

const KPI_CARDS = [
  { label: "Chiffre d'affaires", value: '2 847 430', unit: 'XOF', trend: '+12.4%', up: true, icon: DollarSign, color: 'text-blue-400' },
  { label: 'Trésorerie nette', value: '643 200', unit: 'XOF', trend: '+8.1%', up: true, icon: Activity, color: 'text-emerald-400' },
  { label: 'DSO', value: '47', unit: 'jours', trend: '-3 j', up: true, icon: TrendingDown, color: 'text-violet-400' },
  { label: 'Marge brute', value: '38.2', unit: '%', trend: '+2.1 pts', up: true, icon: TrendingUp, color: 'text-amber-400' },
  { label: 'Charges opex', value: '521 800', unit: 'XOF', trend: '-4.7%', up: false, icon: BarChart3, color: 'text-rose-400' },
  { label: 'Rotation stocks', value: '6.3', unit: 'x', trend: '+0.4', up: true, icon: ShoppingCart, color: 'text-cyan-400' },
];

const PROFILE_ICONS: Record<string, React.ElementType> = {
  daf: Shield,
  dg: Zap,
  controller: BarChart2,
  manager: Users,
  analyst: LineChart,
};

const PROFILE_COLORS: Record<string, string> = {
  daf: 'border-blue-500/60 bg-blue-500/10',
  dg: 'border-violet-500/60 bg-violet-500/10',
  controller: 'border-amber-500/60 bg-amber-500/10',
  manager: 'border-emerald-500/60 bg-emerald-500/10',
  analyst: 'border-cyan-500/60 bg-cyan-500/10',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SparklineSvg({ up }: { up: boolean }) {
  const points = up
    ? '0,30 10,25 20,20 30,22 40,15 50,10 60,8'
    : '0,8 10,14 20,18 30,15 40,22 50,25 60,30';
  return (
    <svg width="60" height="32" className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={up ? '#34d399' : '#f87171'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCard({ label, value, unit, trend, up, icon: Icon, color, blurred }: typeof KPI_CARDS[0] & { blurred: boolean }) {
  return (
    <div className={cn(
      'rounded-xl border border-white/8 bg-white/5 p-3 flex flex-col gap-2 transition-all duration-500',
      blurred ? 'opacity-40 blur-[2px]' : 'opacity-100',
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium leading-tight">{label}</span>
        <Icon className={cn('w-3.5 h-3.5', color)} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <span className="text-lg font-bold text-white tabular-nums">{value}</span>
          <span className="text-[10px] text-slate-500 ml-1">{unit}</span>
        </div>
        <SparklineSvg up={up} />
      </div>
      <div className={cn(
        'text-[10px] font-semibold flex items-center gap-0.5',
        up ? 'text-emerald-400' : 'text-rose-400',
      )}>
        {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {trend}
      </div>
    </div>
  );
}

// ─── Architecture Diagram (Step 3) ────────────────────────────────────────────

function ArchitectureDiagram({ agentOnline }: { agentOnline: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full py-4">
      <p className="text-xs text-slate-400 text-center">Architecture Zero-Copy</p>

      <div className="flex items-center justify-center gap-4 w-full">
        {/* ERP Sage */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
            <Layers className="w-7 h-7 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-400 text-center">ERP Sage</span>
        </div>

        {/* Arrow with animated data dots */}
        <div className="flex-1 relative flex items-center">
          <div className="w-full h-[2px] bg-slate-700 relative overflow-hidden rounded-full">
            <div className="absolute inset-0 flex items-center">
              <div className="h-[2px] w-3 bg-amber-400 rounded-full animate-[slide-right_1.5s_linear_infinite]" />
            </div>
          </div>
        </div>

        {/* Agent */}
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            'w-16 h-16 rounded-xl border flex items-center justify-center transition-all duration-700',
            agentOnline
              ? 'border-emerald-500/60 bg-emerald-500/15 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
              : 'border-slate-600/40 bg-slate-700/30',
          )}>
            <Zap className={cn('w-7 h-7 transition-colors duration-700', agentOnline ? 'text-emerald-400' : 'text-slate-500')} />
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full transition-colors duration-700',
              agentOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600',
            )} />
            <span className="text-[10px] text-slate-400">Agent</span>
          </div>
        </div>

        {/* WebSocket arrow */}
        <div className="flex-1 relative flex items-center">
          <div className="w-full h-[2px] bg-slate-700 relative overflow-hidden rounded-full">
            {agentOnline && (
              <div className="absolute inset-0 flex items-center">
                <div className="h-[2px] w-3 bg-blue-400 rounded-full animate-[slide-right_1s_linear_infinite]" />
              </div>
            )}
          </div>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-slate-500 whitespace-nowrap">WebSocket</span>
        </div>

        {/* Cockpit Cloud */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-xl border border-blue-500/40 bg-blue-500/10 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-blue-400" />
          </div>
          <span className="text-[10px] text-slate-400 text-center">Cockpit</span>
        </div>
      </div>

      <div className={cn(
        'text-[11px] px-3 py-1.5 rounded-full border transition-all duration-700',
        agentOnline
          ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
          : 'text-slate-500 border-slate-600/40 bg-slate-700/20',
      )}>
        {agentOnline ? '✓ Tunnel temps réel actif' : 'En attente de connexion agent…'}
      </div>

      {/* Guarantee */}
      <div className="text-center">
        <p className="text-[10px] text-slate-500">Vos données ERP ne transitent jamais par le cloud.</p>
        <p className="text-[10px] text-slate-500">Architecture Zero-Copy certifiée.</p>
      </div>
    </div>
  );
}

// ─── Profile Mini-Dashboard (Step 4) ─────────────────────────────────────────

function ProfileCard({ name, label, active }: { name: string; label: string; active: boolean }) {
  const Icon = PROFILE_ICONS[name] ?? BarChart3;
  return (
    <div className={cn(
      'rounded-lg border p-3 flex items-center gap-2.5 transition-all duration-300',
      active
        ? cn('opacity-100', PROFILE_COLORS[name] ?? 'border-blue-500/60 bg-blue-500/10')
        : 'border-slate-700/40 bg-slate-800/30 opacity-40',
    )}>
      <Icon className="w-4 h-4 text-slate-300 flex-shrink-0" />
      <span className="text-xs text-slate-300 font-medium">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
    </div>
  );
}

// ─── Team Avatar (Step 5) ─────────────────────────────────────────────────────

function TeamAvatar({ email, role }: { email: string; role: string }) {
  const initials = email.slice(0, 2).toUpperCase();
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
  const color = colors[email.charCodeAt(0) % colors.length];
  return (
    <div className="flex items-center gap-2.5 py-1 animate-in fade-in slide-in-from-left-2 duration-300">
      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white', color)}>
        {initials}
      </div>
      <div>
        <p className="text-[11px] text-slate-300 font-medium truncate max-w-[140px]">{email}</p>
        <p className="text-[9px] text-slate-500 capitalize">{role}</p>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function BiPreviewPanel() {
  const { currentStep, selectedPlan, liveOrgName, liveCountry, selectedProfiles, invitations, agentStatus } = useOnboarding();

  const agentOnline = agentStatus === 'online';

  // How many cards to "unlock" based on completed steps
  const unlockedCards = currentStep >= 6 ? 6 : Math.min(currentStep, 4);

  const allProfilesData = [
    { name: 'daf', label: 'DAF / CFO' },
    { name: 'dg', label: 'Directeur Général' },
    { name: 'controller', label: 'Contrôleur de gestion' },
    { name: 'manager', label: 'Manager' },
    { name: 'analyst', label: 'Analyste' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {liveOrgName || 'Votre organisation'}
            </h2>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <span>Dashboard DAF</span>
              {liveCountry && <span>· {liveCountry}</span>}
              {selectedPlan && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-semibold uppercase tracking-wide">
                  {selectedPlan.label}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Step 3 — Architecture */}
      {currentStep === 3 && (
        <div className="flex-1 flex items-center justify-center animate-in fade-in duration-500">
          <ArchitectureDiagram agentOnline={agentOnline} />
        </div>
      )}

      {/* Step 4 — Profiles */}
      {currentStep === 4 && (
        <div className="flex-1 flex flex-col gap-3 animate-in fade-in duration-500">
          <p className="text-[11px] text-slate-400 mb-1">Profils activés pour votre organisation</p>
          <div className="flex flex-col gap-2">
            {allProfilesData.map(p => (
              <ProfileCard
                key={p.name}
                name={p.name}
                label={p.label}
                active={selectedProfiles.includes(p.name)}
              />
            ))}
          </div>
          {selectedProfiles.length > 0 && (
            <p className="text-[10px] text-emerald-400 mt-1">
              ✓ {selectedProfiles.length} profil{selectedProfiles.length > 1 ? 's' : ''} sélectionné{selectedProfiles.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Step 5 — Team */}
      {currentStep === 5 && (
        <div className="flex-1 flex flex-col gap-3 animate-in fade-in duration-500">
          <p className="text-[11px] text-slate-400 mb-1">Votre équipe Cockpit</p>
          <div className="flex flex-col gap-1 divide-y divide-slate-700/30">
            {invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <Users className="w-8 h-8 text-slate-600" />
                <p className="text-[11px] text-slate-500 text-center">
                  Ajoutez des membres pour les voir apparaître ici
                </p>
              </div>
            ) : (
              invitations.map((inv, i) => (
                <TeamAvatar key={i} email={inv.email} role={inv.role} />
              ))
            )}
          </div>
          {invitations.length > 0 && (
            <p className="text-[10px] text-emerald-400 mt-1">
              ✓ {invitations.length} invitation{invitations.length > 1 ? 's' : ''} prête{invitations.length > 1 ? 's' : ''} à envoyer
            </p>
          )}
        </div>
      )}

      {/* Steps 1, 2, 6 — KPI grid */}
      {(currentStep === 1 || currentStep === 2 || currentStep === 6) && (
        <div className="flex-1 flex flex-col gap-3 animate-in fade-in duration-500">
          {currentStep === 1 && !selectedPlan && (
            <p className="text-[11px] text-slate-400 mb-1">
              Ces indicateurs vous attendent — choisissez votre plan pour commencer
            </p>
          )}
          {currentStep === 6 && (
            <p className="text-[11px] text-slate-400 mb-1">
              Un paiement suffit pour débloquer votre tableau de bord complet
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {KPI_CARDS.map((card, i) => (
              <KpiCard key={card.label} {...card} blurred={i >= unlockedCards} />
            ))}
          </div>

          {/* Mini bar chart decoration */}
          <div className="mt-2 rounded-xl border border-white/8 bg-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400">Évolution mensuelle</span>
              <PieChart className="w-3 h-3 text-slate-500" />
            </div>
            <div className="flex items-end gap-1 h-12">
              {[40, 65, 50, 80, 70, 90, 75, 95, 85, 100, 88, 92].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/40 transition-all duration-700"
                  style={{ height: `${h * (unlockedCards / 6)}%`, opacity: unlockedCards > 0 ? 1 : 0.2 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 7 — Success: dashboard complet débloqué */}
      {currentStep === 7 && (
        <div className="flex-1 flex flex-col gap-3 animate-in fade-in duration-700">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[11px] text-emerald-400 font-semibold">
              Tableau de bord complet débloqué
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {KPI_CARDS.map((card) => (
              <KpiCard key={card.label} {...card} blurred={false} />
            ))}
          </div>
          <div className="mt-2 rounded-xl border border-white/8 bg-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400">Évolution mensuelle</span>
              <PieChart className="w-3 h-3 text-slate-500" />
            </div>
            <div className="flex items-end gap-1 h-12">
              {[40, 65, 50, 80, 70, 90, 75, 95, 85, 100, 88, 92].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/40 transition-all duration-700"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dot grid background decoration */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}
