import { differenceInDays } from 'date-fns';
import type { BillingStatusType } from '@/types';

const STATUS_MAP: Record<BillingStatusType, { label: string; cls: string }> = {
  ACTIVE:    { label: 'Actif',      cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  TRIALING:  { label: 'Essai',      cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  PAST_DUE:  { label: 'Impayé',     cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  CANCELLED: { label: 'Annulé',     cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  UNPAID:    { label: 'Non payé',   cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  PAUSED:    { label: 'Suspendu',   cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
};

interface Props {
  status: BillingStatusType | null;
  trialEndsAt: string | null;
  /** Si true, affiche aussi la date de fin d'essai sous le badge */
  showDate?: boolean;
}

export function SubscriptionBadge({ status, trialEndsAt, showDate = false }: Props) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  if (status === 'TRIALING' && trialEndsAt) {
    const days = differenceInDays(new Date(trialEndsAt), new Date());
    const expired = days < 0;
    const cls = expired
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    const label = expired
      ? 'Essai expiré'
      : days === 0
        ? 'Essai · dernier jour'
        : `Essai · J-${days}`;

    return (
      <div className="flex flex-col gap-0.5">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {label}
        </span>
        {showDate && !expired && (
          <span className="text-[10px] text-muted-foreground pl-0.5">
            Fin le {new Date(trialEndsAt).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
    );
  }

  const cfg = STATUS_MAP[status] ?? STATUS_MAP.ACTIVE;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}
