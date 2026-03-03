import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminUser } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Shield, Building2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { format } from 'date-fns';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: user, isLoading, error } = useAdminUser(id!);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <p className="text-destructive font-medium">{t('common.error')}</p>
        <Button onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {user.firstName} {user.lastName}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t('users.profileTitle')}
            </CardTitle>
            <CardDescription>{t('users.profileSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{user.id}</code>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{user.email}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.fullName')}</p>
                <p className="font-medium mt-1">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('common.status')}</p>
                <div className="mt-1">
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? t('users.active') : t('users.inactive')}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.emailVerified')}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">{t('users.verified')}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">{t('users.notVerified')}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.memberSince')}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(new Date(user.createdAt), 'dd MMMM yyyy HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {t('users.organization')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.organization ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('common.name')}</p>
                  <p className="font-bold text-lg mt-1">{user.organization.name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/organizations/${user.organizationId}`)}
                >
                  {t('users.viewOrganization')}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground italic">{t('users.noOrganization')}</p>
            )}
          </CardContent>
        </Card>

        {/* Roles Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t('users.rolesAndPermissions')}
            </CardTitle>
            <CardDescription>{t('users.rolesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {user.userRoles && user.userRoles.length > 0 ? (
                user.userRoles.map((ur: any) => (
                  <div key={ur.id} className="p-3 border rounded-lg bg-muted/30">
                    <p className="font-bold text-primary capitalize">{ur.role.name}</p>
                    {ur.role.description && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{ur.role.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic">{t('users.noRolesAssigned')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
