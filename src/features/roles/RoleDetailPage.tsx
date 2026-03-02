import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRole } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Info, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';

export function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: role, isLoading, error } = useRole(id!);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !role) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <p className="text-destructive font-medium">{t('common.error')}</p>
        <Button onClick={() => navigate('/roles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>
    );
  }

  // Group permissions by resource
  const groupedPermissions = role.permissions?.reduce((acc: any, curr: any) => {
    const resource = curr.permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(curr.permission.action);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/roles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold tracking-tight uppercase">
          {role.name}
        </h1>
        {role.isSystem && (
           <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
             Système
           </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="mt-1 text-sm">{role.description || t('roles.noDescription')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type de rôle</p>
              <div className="mt-1 flex items-center gap-2">
                {role.isSystem ? (
                  <>
                    <Lock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Rôle système protégé</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Rôle personnalisé</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Permissions assignées
            </CardTitle>
            <CardDescription>Actions autorisées par ressource</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {groupedPermissions && Object.keys(groupedPermissions).length > 0 ? (
                Object.entries(groupedPermissions).map(([resource, actions]: [string, any]) => (
                  <div key={resource} className="border rounded-lg p-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {resource}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {actions.map((action: string) => (
                        <div key={action} className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-md text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span className="capitalize">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center py-8">Aucune permission assignée</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
