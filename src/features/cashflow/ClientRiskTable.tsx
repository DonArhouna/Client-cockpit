import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, FileText, Phone, Mail, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ClientRiskTable() {
    const clients = [
        {
            id: 'G',
            name: 'Groupe Industriel Marseille',
            email: 'tresorerie@gim-group.com',
            amount: 156000,
            creditLimit: 300000,
            riskScore: 85,
            riskLevel: 'Critique',
            paymentStatus: 'Échu',
            lastPayment: '15/12/2024'
        },
        {
            id: 'S',
            name: 'Services Consulting Lyon',
            email: 'admin@scl-consulting.com',
            amount: 234000,
            creditLimit: 400000,
            riskScore: 78,
            riskLevel: 'Élevé',
            paymentStatus: 'Échu',
            lastPayment: '20/12/2024'
        },
        {
            id: 'T',
            name: 'TechnoLogistics SARL',
            email: 'finance@technologistics.fr',
            amount: 89000,
            creditLimit: 150000,
            riskScore: 65,
            riskLevel: 'Élevé',
            paymentStatus: 'En retard',
            lastPayment: '28/12/2024'
        },
        {
            id: 'D',
            name: 'Distribution Nord-Est',
            email: 'paiements@dne-distribution.fr',
            amount: 67000,
            creditLimit: 100000,
            riskScore: 42,
            riskLevel: 'Modéré',
            paymentStatus: 'À temps',
            lastPayment: '08/01/2025'
        },
        {
            id: 'S',
            name: 'Société Générale Immobilier',
            email: 'comptabilite@sgi-france.com',
            amount: 125000,
            creditLimit: 200000,
            riskScore: 25,
            riskLevel: 'Faible',
            paymentStatus: 'À temps',
            lastPayment: '10/01/2025'
        },
        {
            id: 'E',
            name: 'Équipements Professionnels SA',
            email: 'facturation@ep-sa.fr',
            amount: 45000,
            creditLimit: 80000,
            riskScore: 18,
            riskLevel: 'Faible',
            paymentStatus: 'À temps',
            lastPayment: '11/01/2025'
        }
    ];

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Critique': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950';
            case 'Élevé': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950';
            case 'Modéré': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950';
            case 'Faible': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950';
            default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Échu': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950';
            case 'En retard': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950';
            case 'À temps': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950';
            default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Échu': return '⊗';
            case 'En retard': return '⏱';
            case 'À temps': return '✓';
            default: return '○';
        }
    };

    return (
        <Card className="bg-white dark:bg-slate-900 border-border shadow-sm h-full">
            <CardHeader className="border-b border-border pb-4">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <CardTitle className="text-lg font-black text-foreground dark:text-white">Évaluation des Risques Clients</CardTitle>
                        <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium mt-1">Analyse des profils de paiement et scores de risque</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="dark:border-slate-600 dark:hover:bg-slate-800">
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="dark:border-slate-600 dark:hover:bg-slate-800">
                            <FileText className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Rechercher un client..." 
                        className="pl-10 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-accent dark:bg-slate-800 border-b border-border">
                            <tr>
                                <th className="text-left p-3 font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Client</th>
                                <th className="text-right p-3 font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Montant Dû</th>
                                <th className="text-right p-3 font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Limite de Crédit</th>
                                <th className="text-center p-3 font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Score de Risque</th>
                                <th className="text-center p-3 font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Statut Paiement</th>
                                <th className="text-center p-3 font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Dernier Paiement</th>
                                <th className="text-center p-3 font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client, idx) => (
                                <tr key={idx} className="border-b border-border hover:bg-accent/50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-900 dark:text-blue-100 font-bold">
                                                {client.id}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground dark:text-white text-sm">{client.name}</p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">{client.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right font-bold text-foreground dark:text-white">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(client.amount)}
                                    </td>
                                    <td className="p-3 text-right text-muted-foreground dark:text-slate-400">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(client.creditLimit)}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={cn("font-bold text-sm", 
                                                client.riskScore >= 80 ? 'text-red-600 dark:text-red-400' :
                                                client.riskScore >= 60 ? 'text-rose-600 dark:text-rose-400' :
                                                client.riskScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                                            )}>
                                                {client.riskScore}
                                            </span>
                                            <Badge variant="outline" className={cn("text-xs font-bold", getRiskColor(client.riskLevel))}>
                                                {client.riskLevel}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className={cn("text-sm", getStatusColor(client.paymentStatus).split(' ')[0])}>
                                                {getStatusIcon(client.paymentStatus)}
                                            </span>
                                            <Badge variant="outline" className={cn("text-xs font-bold", getStatusColor(client.paymentStatus))}>
                                                {client.paymentStatus}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center text-muted-foreground dark:text-slate-400">
                                        {client.lastPayment}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                <Phone className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                <Mail className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                <CalendarIcon className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
