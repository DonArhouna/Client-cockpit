import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2, Users, LayoutDashboard, Globe, Database, Calendar, CreditCard } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { format } from 'date-fns';

export function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: org, isLoading, error } = useOrganization(id!);

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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/organizations')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
      </div>

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
                <span className="text-sm">Utilisateurs</span>
              </div>
              <span className="font-bold text-lg">{org._count?.users ?? 0}</span>
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
      </div>
    </div>
  );
}
