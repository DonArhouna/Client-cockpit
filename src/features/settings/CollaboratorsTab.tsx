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
    UserCog
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

export function CollaboratorsTab() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    const { data: users, isLoading } = useAdminUsers();
    const { data: roles } = useRoles();

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
            usersApi.update(userId, { role: roleName } as any), // Mocking role update via generic update
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
                    <span className="font-medium">{row.original.firstName} {row.original.lastName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {row.original.email}
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
                        <SelectTrigger className="w-[180px] h-8 text-xs capitalize border-slate-200 bg-slate-50/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAF">DAF</SelectItem>
                            <SelectItem value="Contrôleur">Contrôleur</SelectItem>
                            <SelectItem value="Comptable">Comptable</SelectItem>
                            <SelectItem value="Analyste">Analyste</SelectItem>
                            <DropdownMenuSeparator />
                            {roles?.map(r => (
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
                <Badge variant={row.original.isActive ? 'default' : 'secondary'} className="rounded-full px-2 text-[10px] uppercase tracking-wider">
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
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full">
                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200">
                            <DropdownMenuLabel className="text-xs text-slate-500 font-normal">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                <UserCog className="h-4 w-4" /> Gérer les accès
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive gap-2 cursor-pointer"
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
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-xl font-bold">Collaborateurs</CardTitle>
                    <CardDescription>
                        Invitez les membres de votre équipe et définissez leurs niveaux d'accès.
                    </CardDescription>
                </div>
                <Button 
                    onClick={() => setInviteOpen(true)}
                    className="bg-[#3b66ac] hover:bg-[#2d5089] text-white rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Inviter un collaborateur
                </Button>
            </CardHeader>
            <CardContent className="px-0 pt-6">
                <DataTable
                    columns={columns}
                    data={users || []}
                    isLoading={isLoading}
                    searchKey="email"
                    searchPlaceholder="Rechercher par email..."
                />
            </CardContent>

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
        </Card>
    );
}
