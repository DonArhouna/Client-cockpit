import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2, Users, LayoutDashboard, Globe, Database, Calendar, CreditCard, UserPlus } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { format } from 'date-fns';
import { InviteUserModal } from '../users/InviteUserModal';
import { useState } from 'react';

export function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: org, isLoading, error } = useOrganization(id!);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !org) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <p className="text-destructive font-medium">{t('common.error')}</p>
        <Button onClick={() => navigate('/organizations')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/organizations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
        </div>
        <Button onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Inviter un utilisateur
        </Button>
      </div>

      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        defaultOrganizationId={org.id}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* General Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Détails de l'Organisation
            </CardTitle>
            <CardDescription>Informations administratives et configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{org.id}</code>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Secteur</p>
                <p className="font-medium capitalize">{org.sector || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taille</p>
                <p className="font-medium uppercase">{org.size || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pays</p>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{org.country || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Propriétaire (Owner)</p>
                {org.owner ? (
                  <p className="font-medium">
                    {org.owner.firstName} {org.owner.lastName}
                    <span className="block text-xs text-muted-foreground font-normal">{org.owner.email}</span>
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">Aucun propriétaire</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{format(new Date(org.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats / Counts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Utilisateurs Actifs</span>
              </div>
              <span className="font-bold text-lg">{org._count?.users ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-amber-200/50 bg-amber-50/30">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-600" />
                <span className="text-sm">Invitations en attente</span>
              </div>
              <span className="font-bold text-lg text-amber-700">{org._count?.invitations ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Total Sièges Occupés</span>
              </div>
              <span className="font-bold text-xl text-primary">
                {(org._count?.users ?? 0) + (org._count?.invitations ?? 0)}
                {org.subscriptionPlan?.maxUsers && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / {org.subscriptionPlan.maxUsers}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tableaux de bord</span>
              </div>
              <span className="font-bold text-lg">{org._count?.dashboards ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plan Info */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Plan d'abonnement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org.subscriptionPlan ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-primary">{org.subscriptionPlan.label}</p>
                  <p className="text-sm text-muted-foreground font-mono">{org.subscriptionPlan.name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/subscription-plans/${org.subscriptionPlan?.id}`)}
                >
                  Voir les détails du plan
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Aucun plan d'abonnement assigné</p>
            )}
          </CardContent>
        </Card>

        {/* Sage Config */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Configuration Sage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mode</p>
                <p className="font-medium uppercase">{org.sageMode || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="font-medium uppercase">{org.sageType || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hôte</p>
                <p className="font-medium">{org.sageHost || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Port</p>
                <p className="font-medium">{org.sagePort || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invitations History */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Historique des Invitations
            </CardTitle>
            <CardDescription>Liste des utilisateurs invités à rejoindre cette organisation</CardDescription>
          </CardHeader>
          <CardContent>
            {!org.invitations || org.invitations.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-4">Aucune invitation envoyée</p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Invité</th>
                      <th className="px-4 py-3 text-left font-medium">Rôle</th>
                      <th className="px-4 py-3 text-left font-medium">Par (Inviteur)</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {org.invitations.map((inv) => (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {inv.firstName || inv.lastName ? (
                            <>
                              {inv.firstName} {inv.lastName}
                              <span className="block text-xs text-muted-foreground font-normal">{inv.email}</span>
                            </>
                          ) : (
                            inv.email
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                            {inv.role.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {inv.invitedBy ? (
                            <span>{inv.invitedBy.firstName} {inv.invitedBy.lastName}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(inv.createdAt), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-4 py-3">
                          {inv.isAccepted ? (
                            <span className="text-green-600 font-medium">Acceptée</span>
                          ) : new Date(inv.expiresAt) < new Date() ? (
                            <span className="text-destructive font-medium">Expirée</span>
                          ) : (
                            <span className="text-amber-600 font-medium">En attente</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
