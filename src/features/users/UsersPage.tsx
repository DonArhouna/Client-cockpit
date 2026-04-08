import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { usersApi } from '@/api';
import { useAdminUsers, useOrganizations, useRoles } from '@/hooks/use-api';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { InviteUserModal } from './InviteUserModal';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export function UsersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data: users, isLoading, error } = useAdminUsers();
  const { data: organizations } = useOrganizations();
  const { data: roles } = useRoles();

  const filteredUsers = (users || []).filter((user) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? user.isActive : !user.isActive);
    const matchesOrg = orgFilter === 'all' || user.organizationId === orgFilter;
    const matchesRole =
      roleFilter === 'all' ||
      user.userRoles?.some((ur) => ur.role?.name === roleFilter);

    return matchesStatus && matchesOrg && matchesRole;
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => usersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: t('common.success'),
        description: t('users.deleteSuccess'),
      });
      setDeleteUser(null);
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('users.deleteError'),
        variant: 'destructive',
      });
    },
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'firstName',
      header: t('users.columnUser'),
      cell: ({ row }) => (
        <div className="font-medium">
          <Link
            to={`/users/${row.original.id}`}
            className="text-primary hover:underline"
          >
            {row.original.firstName} {row.original.lastName}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: t('common.email'),
    },
    {
      accessorKey: 'organization',
      header: t('users.organization'),
      cell: ({ row }) => row.original.organization?.name || 'N/A',
    },
    {
      id: 'roles',
      header: t('users.role'),
      cell: ({ row }) => {
        const roles = row.original.userRoles?.map(ur => ur.role?.name).filter(Boolean) || [];
        return (
          <div className="flex flex-wrap gap-1">
            {roles.length > 0 ? (
              roles.map(role => (
                <Badge key={role} variant="outline" className="capitalize">
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-xs italic">{t('users.noRole')}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: t('common.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? t('users.active') : t('users.inactive')}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: t('common.date'),
      cell: ({ row }) =>
        format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t('common.actions')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setEditUser(user)}>
                  {t('common.edit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteUser(user)}
                >
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6" data-testid="users-page">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('users.title')}</h1>
          <p className="text-muted-foreground">{t('users.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setInviteOpen(true)} data-testid="invite-user-btn">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('users.invite')}
          </Button>
          <Button onClick={() => setCreateOpen(true)} data-testid="create-user-btn">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('users.create')}
          </Button>
        </div>
      </div>

      {/* Users list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('users.listTitle')}
          </CardTitle>
          <CardDescription>{t('users.listSubtitle')}</CardDescription>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="w-[180px]">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="text-left">
                  <SelectValue placeholder={t('common.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('users.filterStatus')}</SelectItem>
                  <SelectItem value="active">{t('users.filterActive')}</SelectItem>
                  <SelectItem value="inactive">{t('users.filterInactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[220px]">
              <Select value={orgFilter} onValueChange={setOrgFilter}>
                <SelectTrigger className="text-left">
                  <SelectValue placeholder={t('users.organization')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('users.filterOrg')}</SelectItem>
                  {organizations?.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[180px]">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="text-left">
                  <SelectValue placeholder={t('users.role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('users.filterRole')}</SelectItem>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      <span className="capitalize">{role.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(statusFilter !== 'all' || orgFilter !== 'all' || roleFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setOrgFilter('all');
                  setRoleFilter('all');
                }}
              >
                {t('users.resetFilters')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            tableId="admin-users"
            columns={columns}
            data={filteredUsers}
            searchKey="firstName"
            searchPlaceholder={t('users.searchPlaceholder')}
            isLoading={isLoading}
          />
          {error && (
            <div className="mt-4 p-4 text-center text-destructive bg-destructive/10 rounded-md">
              {t('common.error')}
            </div>
          )}
        </CardContent>
      </Card >

      <InviteUserModal open={inviteOpen} onOpenChange={setInviteOpen} />
      <CreateUserModal open={createOpen} onOpenChange={setCreateOpen} />

      <EditUserModal
        open={editUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
        user={editUser}
      />

      <ConfirmDialog
        open={deleteUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null);
        }}
        title={t('users.confirmDeleteTitle')}
        description={`${t('users.confirmDelete')} "${deleteUser?.firstName} ${deleteUser?.lastName}" ?`}
        onConfirm={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
        isPending={deleteMutation.isPending}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
      />
    </div >
  );
}
