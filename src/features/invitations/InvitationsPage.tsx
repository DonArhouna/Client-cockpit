import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/DataTable';
import { useAllInvitations, useOrganizations } from '@/hooks/use-api';
import { ColumnDef } from '@tanstack/react-table';
import { Invitation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

export function InvitationsPage() {
    const { t } = useTranslation();
    const [orgFilter, setOrgFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: invitations, isLoading } = useAllInvitations();
    const { data: organizations } = useOrganizations();

    const filteredInvitations = (invitations || []).filter((inv) => {
        const matchesOrg = orgFilter === 'all' || inv.organizationId === orgFilter;

        const expired = isPast(new Date(inv.expiresAt)) && !inv.isAccepted;
        const status = inv.isAccepted ? 'accepted' : (expired ? 'expired' : 'pending');
        const matchesStatus = statusFilter === 'all' || status === statusFilter;

        return matchesOrg && matchesStatus;
    });

    const columns: ColumnDef<Invitation>[] = [
        {
            accessorKey: 'firstName',
            header: t('invitations.columnGuest'),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {row.original.firstName} {row.original.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">{row.original.email}</span>
                </div>
            ),
        },
        {
            accessorKey: 'organization.name',
            header: t('invitations.columnOrg'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.organization?.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'role.name',
            header: t('invitations.columnRole'),
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.role?.name}
                </Badge>
            ),
        },
        {
            accessorKey: 'invitedBy.email',
            header: t('invitations.columnSponsor'),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm">
                        {row.original.invitedBy?.firstName} {row.original.invitedBy?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">{row.original.invitedBy?.email}</span>
                </div>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: t('invitations.columnDate'),
            cell: ({ row }) => format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm'),
        },
        {
            accessorKey: 'status',
            header: t('invitations.columnStatus'),
            cell: ({ row }) => {
                const inv = row.original;
                const expired = isPast(new Date(inv.expiresAt)) && !inv.isAccepted;

                if (inv.isAccepted) {
                    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">{t('invitations.statusAccepted')}</Badge>;
                }
                if (expired) {
                    return <Badge variant="destructive">{t('invitations.statusExpired')}</Badge>;
                }
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">{t('invitations.statusPending')}</Badge>;
            },
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('invitations.title')}</h1>
                <p className="text-muted-foreground">
                    {t('invitations.subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>{t('invitations.listTitle')}</CardTitle>
                            <CardDescription>
                                {t('invitations.listSubtitle')}
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Select value={orgFilter} onValueChange={setOrgFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder={t('invitations.orgFilter')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('invitations.orgFilter')}</SelectItem>
                                    {organizations?.map((org) => (
                                        <SelectItem key={org.id} value={org.id}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('invitations.statusFilter')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('invitations.statusFilter')}</SelectItem>
                                    <SelectItem value="pending">{t('invitations.statusPending')}</SelectItem>
                                    <SelectItem value="accepted">{t('invitations.statusAccepted')}</SelectItem>
                                    <SelectItem value="expired">{t('invitations.statusExpired')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        tableId="admin-invitations"
                        columns={columns}
                        data={filteredInvitations}
                        isLoading={isLoading}
                        searchKey="email"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
