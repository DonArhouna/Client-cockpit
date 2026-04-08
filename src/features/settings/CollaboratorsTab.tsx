import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    UserPlus, 
    MoreHorizontal, 
    Mail, 
    Trash2, 
    UserCog,
    Users as UsersIcon,
    ShieldCheck,
    Clock
} from 'lucide-react';
import { useAdminUsers, useRoles } from '@/hooks/use-api';
import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { InviteUserModal } from '../users/InviteUserModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { usersApi } from '@/api';
import { cn } from '@/lib/utils';

export function CollaboratorsTab() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    const { data: users, isLoading } = useAdminUsers();
    const { data: roles } = useRoles();

    const filteredUsers = (users || []).filter(u => u.userRoles?.[0]?.role?.name !== 'superadmin');
    const activeUsers = filteredUsers.filter(u => u.isActive).length;
    const totalUsers = filteredUsers.length;

    const deleteMutation = useMutation({
        mutationFn: (userId: string) => usersApi.delete(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({
                title: t('common.success'),
                description: 'Le collaborateur a été retiré avec succès.',
            });
            setDeleteUser(null);
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) => 
            usersApi.update(userId, { role: roleName } as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({
                title: t('common.success'),
                description: 'Le rôle a été mis à jour.',
            });
        },
    });

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'firstName',
            header: 'Collaborateur',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{row.original.firstName} {row.original.lastName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> {row.original.email}
                    </span>
                </div>
            ),
        },
        {
            id: 'roles',
            header: 'Accès / Rôle',
            cell: ({ row }) => {
                const currentRole = row.original.userRoles?.[0]?.role?.name || 'Aucun';
                return (
                    <Select 
                        defaultValue={currentRole} 
                        onValueChange={(value) => updateRoleMutation.mutate({ userId: row.original.id, roleName: value })}
                    >
                        <SelectTrigger className="w-[180px] h-9 text-xs capitalize border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                            <SelectItem value="DAF">DAF</SelectItem>
                            <SelectItem value="Contrôleur">Contrôleur</SelectItem>
                            <SelectItem value="Comptable">Comptable</SelectItem>
                            <SelectItem value="Analyste">Analyste</SelectItem>
                            <DropdownMenuSeparator />
                            {roles?.filter(r => r.name !== 'superadmin').map(r => (
                                <SelectItem key={r.id} value={r.name} className="capitalize">{r.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            accessorKey: 'isActive',
            header: 'Statut',
            cell: ({ row }) => (
                <Badge 
                    variant={row.original.isActive ? 'default' : 'secondary'} 
                    className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold",
                        row.original.isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" : ""
                    )}
                >
                    {row.original.isActive ? 'Actif' : 'Inactif'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl p-1.5">
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-2 py-1.5">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg px-2 py-2 text-sm">
                                <UserCog className="h-4 w-4 text-slate-500" /> Gérer les accès
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1.5" />
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive focus:bg-destructive/5 gap-2.5 cursor-pointer rounded-lg px-2 py-2 text-sm"
                                onClick={() => setDeleteUser(row.original)}
                            >
                                <Trash2 className="h-4 w-4" /> Retirer l'accès
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* ── Top row : Stats ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total collaborateurs</p>
                                <p className="text-2xl font-bold">{totalUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Comptes actifs</p>
                                <p className="text-2xl font-bold">{activeUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* ── Main table ──────────────────────────────────────────────── */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold">Liste des accès</CardTitle>
                            <CardDescription>Gérez les permissions et les statuts de vos collaborateurs.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm mr-2">
                                <Clock className="h-3.5 w-3.5" />
                                Dernière activité : Aujourd'hui
                            </div>
                            <Button 
                                onClick={() => setInviteOpen(true)}
                                className="bg-[#3b66ac] hover:bg-[#2d5089] text-white rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95 h-10 px-4 gap-2 text-xs font-semibold"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span className="hidden md:inline">Inviter un collaborateur</span>
                                <span className="md:hidden">Inviter</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DataTable
                        columns={columns}
                        data={filteredUsers}
                        isLoading={isLoading}
                        searchKey="email"
                        searchPlaceholder="Rechercher par email..."
                    />
                </CardContent>
            </Card>

            <InviteUserModal 
                open={inviteOpen} 
                onOpenChange={setInviteOpen}
            />

            <ConfirmDialog
                open={deleteUser !== null}
                onOpenChange={(open) => !open && setDeleteUser(null)}
                title="Retirer l'accès ?"
                description={`Êtes-vous sûr de vouloir retirer les accès de ${deleteUser?.firstName} ${deleteUser?.lastName} ? Cette action est irréversible.`}
                onConfirm={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
                isPending={deleteMutation.isPending}
                confirmLabel="Retirer l'accès"
                cancelLabel="Annuler"
            />
        </div>
    );
}

