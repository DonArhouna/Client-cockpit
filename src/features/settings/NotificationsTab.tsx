import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, AlertTriangle, TrendingUp, Users, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationPreferences {
  email: {
    kpiAlerts: boolean;
    weeklyReport: boolean;
    newLogin: boolean;
    invitations: boolean;
  };
  push: {
    realtimeAlerts: boolean;
    criticalAlerts: boolean;
  };
}

const STORAGE_KEY = 'cockpit_notification_preferences';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email: { kpiAlerts: true, weeklyReport: true, newLogin: true, invitations: true },
  push: { realtimeAlerts: false, criticalAlerts: false },
};

// ─── NotificationRow ──────────────────────────────────────────────────────────

function NotificationRow({
  icon: Icon, title, description, checked, onCheckedChange, disabled = false,
}: {
  icon: React.ElementType; title: string; description: string;
  checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 py-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3 flex-1">
        <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium leading-none mb-1">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          {disabled && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Fonctionnalité à venir</p>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} className="shrink-0 mt-1" />
    </div>
  );
}

// ─── NotificationsTab ─────────────────────────────────────────────────────────

export function NotificationsTab() {
  const { toast } = useToast();

  const [prefs, setPrefs] = useState<NotificationPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const updateEmailPref = (key: keyof NotificationPreferences['email'], value: boolean) => {
    setPrefs((prev) => ({ ...prev, email: { ...prev.email, [key]: value } }));
    toast({ title: value ? 'Notification activée' : 'Notification désactivée', description: 'Votre préférence a été enregistrée.' });
  };

  const updatePushPref = (key: keyof NotificationPreferences['push'], value: boolean) => {
    setPrefs((prev) => ({ ...prev, push: { ...prev.push, [key]: value } }));
    toast({ title: value ? 'Notification activée' : 'Notification désactivée', description: 'Votre préférence a été enregistrée.' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Email notifications ── */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notifications par email
          </CardTitle>
          <CardDescription>
            Choisissez les emails que vous souhaitez recevoir.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 divide-y divide-border">
          <NotificationRow
            icon={AlertTriangle} title="Alertes KPI"
            description="Email quand un indicateur clé dépasse un seuil critique."
            checked={prefs.email.kpiAlerts} onCheckedChange={(v) => updateEmailPref('kpiAlerts', v)}
          />
          <NotificationRow
            icon={TrendingUp} title="Rapport hebdomadaire"
            description="Synthèse automatique chaque lundi matin."
            checked={prefs.email.weeklyReport} onCheckedChange={(v) => updateEmailPref('weeklyReport', v)}
          />
          <NotificationRow
            icon={Bell} title="Nouvelle connexion"
            description="Alerte lors d'une connexion depuis un nouvel appareil."
            checked={prefs.email.newLogin} onCheckedChange={(v) => updateEmailPref('newLogin', v)}
          />
          <NotificationRow
            icon={Users} title="Invitations & collaborateurs"
            description="Notifications lors d'ajout ou de retrait de membres."
            checked={prefs.email.invitations} onCheckedChange={(v) => updateEmailPref('invitations', v)}
          />
        </CardContent>
      </Card>

      {/* ── Push notifications + Info note ── */}
      <div className="space-y-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              À venir
            </span>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Notifications push
            </CardTitle>
            <CardDescription>Alertes en temps réel dans votre navigateur.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 divide-y divide-border">
            <NotificationRow
              icon={Bell} title="Alertes temps réel"
              description="Notifications instantanées pour les événements importants."
              checked={prefs.push.realtimeAlerts} onCheckedChange={(v) => updatePushPref('realtimeAlerts', v)} disabled
            />
            <NotificationRow
              icon={AlertTriangle} title="Alertes critiques"
              description="Priorité haute — ne manquez jamais une alerte critique."
              checked={prefs.push.criticalAlerts} onCheckedChange={(v) => updatePushPref('criticalAlerts', v)} disabled
            />
          </CardContent>
        </Card>

        {/* Info */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-4">
          <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            Ces préférences sont sauvegardées localement. La configuration centralisée sera disponible prochainement.
          </p>
        </div>
      </div>
    </div>
  );
}
